<template>
  <div class="search-results">
    <!-- 디버깅 정보 (필요시 주석 해제) -->
    <!-- 
    <div style="background: #f5f5f5; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
      <p>로딩: {{ loading }}</p>
      <p>에러: {{ error ? '있음' : '없음' }}</p>
      <p>상품 수: {{ products ? products.length : 0 }}</p>
      <p>필터링된 상품 수: {{ filteredProducts.length }}</p>
      <p>예치금액: {{ depositAmount }}</p>
    </div>
    -->

    <!-- 로딩 및 에러 상태 -->
    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- 검색 결과 요약 정보 -->
    <div
      v-else-if="depositAmount && filteredProducts.length > 0"
      class="filter-summary"
    >
      <div class="filter-badge">
        <span class="filter-label">예치금액</span>
        <span class="filter-value">{{ formatNumber(depositAmount) }}원</span>
      </div>
      <div class="result-count">
        가입 가능한 상품 <strong>{{ totalCount }}</strong
        >개
      </div>
    </div>

    <!-- 검색 결과 없음 메시지 -->
    <div
      v-else-if="depositAmount && filteredProducts.length === 0"
      class="no-results"
    >
      <p>
        <strong>{{ formatNumber(depositAmount) }}원</strong>으로 가입 가능한
        상품이 없습니다.
      </p>
      <p class="suggestion">다른 금액으로 검색해보세요.</p>
    </div>

    <div v-else-if="!products || products.length === 0" class="no-results">
      검색 조건에 맞는 상품이 없습니다.
    </div>

    <!-- 상품 목록 (조건부 렌더링에서 분리) -->
    <div v-if="filteredProducts.length > 0" class="product-list-container">
      <!-- 상품 목록 헤더 -->
      <div class="results-header">
        <div class="total-count">
          <strong>{{ totalCount }}</strong
          >개
        </div>
        <div class="sort-dropdown">
          <select
            v-model="localSortBy"
            @change="onSortChange"
            class="sort-select"
          >
            <option value="intrRate">기본금리순</option>
            <option value="intrRate2">우대금리순</option>
          </select>
        </div>
      </div>

      <!-- 상품 목록 (인라인 스타일 추가) -->
      <div
        class="product-list"
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        "
      >
        <div
          v-for="(product, index) in filteredProducts"
          :key="`product-${getProductId(product) || index}`"
          class="product-card"
          style="
            background-color: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 16px;
          "
        >
          <div class="product-header" @click="onProductClick(product)">
            <div class="bank-name">
              {{ product.kor_co_nm || product.korCoNm }}
            </div>
            <div class="product-name">
              {{ product.product_name || product.finPrdtNm }}
            </div>
          </div>

          <div class="product-details" @click="onProductClick(product)">
            <div class="detail-row">
              <span class="detail-label">기본 금리</span>
              <span class="detail-value highlight">{{
                formatRate(product.intr_rate || product.intrRate)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">우대 금리</span>
              <span class="detail-value">{{
                formatRate(product.intr_rate2 || product.intrRate2)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">가입 기간</span>
              <span class="detail-value"
                >{{ product.save_trm || product.saveTrm }}개월</span
              >
            </div>
          </div>

          <!-- 액션 버튼 부분 -->
          <div class="action-section">
            <button
              v-if="isInCompareList(getProductId(product), getSaveTrm(product))"
              class="compare-btn in-list"
              @click.stop="handleRemoveFromCompare(product)"
            >
              비교함에서 제거
            </button>
            <button
              v-else
              class="compare-btn add-compare-btn"
              @click.stop="handleAddToCompare(product)"
            >
              비교함에 추가
            </button>
            <button class="join-btn" @click.stop="goToJoinPage(product)">
              가입하기
            </button>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <Pagination
        v-if="totalPages >= 1"
        :total-pages="totalPages"
        :current-page="currentPage"
        @page-change="onPageChange"
      />
    </div>

    <!-- 비교 플로팅 바 추가 -->
    <CompareFloatingBar
      v-if="compareList.length > 0"
      :compareList="compareList"
      @go-to-compare="goToCompare"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import Pagination from "../Pagination.vue";
import CompareFloatingBar from "@/components/products/compare/CompareFloatingBar.vue";
import ActionButtons from "@/components/products/ActionButtons.vue";
import useCompareList from "@/composables/useCompareList";

// 프롭스 정의
const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  depositAmount: {
    type: String,
    default: "100000",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  sortBy: {
    type: String,
    default: "intrRate",
  },
  productType: {
    type: String,
    default: "deposit", // 기본값은 예금 상품
  },
});

// 이벤트 정의
const emit = defineEmits(["product-click", "page-change", "sort-change"]);
const router = useRouter();

// 현재 정렬 기준 (로컬 상태)
const localSortBy = ref(props.sortBy);

// 비교함 관련 기능 가져오기 (컴포저블)
const {
  compareList,
  addToCompareList,
  removeFromCompareList,
  isInCompareList,
  clearCompareList,
} = useCompareList();

// 상품 ID 가져오기 (로컬 함수로 구현)
const getProductId = (product) => {
  if (!product) return null;

  // 가능한 ID 필드명 목록
  const possibleIdFields = ["product_id", "productId", "id", "finPrdtCd"];

  // 존재하는 필드 찾기
  for (const field of possibleIdFields) {
    if (product[field] !== undefined) {
      return product[field];
    }
  }

  // 없으면 null 반환
  return null;
};

// 기간 속성명 찾기 (로컬 함수로 구현)
const getSaveTrm = (product) => {
  if (!product) return null;

  // 가능한 기간 필드명 목록
  const possibleTrmFields = ["save_trm", "saveTrm", "term"];

  // 존재하는 필드 찾기
  for (const field of possibleTrmFields) {
    if (product[field] !== undefined) {
      return product[field];
    }
  }

  // 없으면 null 반환
  return null;
};

// 숫자 포맷팅 함수 (천 단위 콤마)
const formatNumber = (value) => {
  if (!value) return "0";
  // 콤마가 이미 있으면 그대로 반환
  if (typeof value === "string" && value.includes(",")) return value;
  // 콤마 없으면 포맷팅
  return new Intl.NumberFormat("ko-KR").format(
    typeof value === "string" ? value.replace(/[^\d]/g, "") : value
  );
};

// 필터링된 상품 리스트
// 필터링된 상품 리스트
const filteredProducts = computed(() => {
  console.log("filteredProducts 계산 시작");
  console.log("- 원본 상품 데이터 길이:", props.products?.length || 0);
  console.log("- depositAmount:", props.depositAmount);

  // 상품 데이터가 없으면 빈 배열 반환
  if (
    !props.products ||
    !Array.isArray(props.products) ||
    props.products.length === 0
  ) {
    console.log("상품 데이터가 없거나 배열이 아닙니다");
    return [];
  }

  // 예치금액 파싱
  const userAmount = props.depositAmount
    ? Number(String(props.depositAmount).replace(/[^\d]/g, ""))
    : 0;

  console.log("- 파싱된 예치금액:", userAmount);

  let filteredData = [...props.products];

  // 금액 필터링 (userAmount가 있는 경우에만)
  if (userAmount > 0) {
    filteredData = filteredData.filter((product) => {
      // 다양한 필드명 대응
      const minDeposit = Number(
        product.min_deposit ||
          product.minDeposit ||
          product.minDepositAmount ||
          0
      );

      // 최대 한도는 null/빈값일 경우 무제한으로 처리
      const maxLimit =
        Number(
          product.max_limit || product.maxLimit || product.maxDepositAmount
        ) || Number.MAX_SAFE_INTEGER;

      // 최소 예치금액과 최대 한도 로깅
      console.log(
        `상품 ${
          product.product_name ||
          product.productName ||
          product.finPrdtNm ||
          "이름 없음"
        }:` +
          ` 최소=${minDeposit}, 최대=${maxLimit}, 입력=${userAmount},` +
          ` 조건충족=${userAmount >= minDeposit && userAmount <= maxLimit}`
      );

      // 입력한 금액이 최소 예치금액 이상이고 최대 한도 이하인 상품만 필터링
      return userAmount >= minDeposit && userAmount <= maxLimit;
    });
  }

  console.log("- 필터링 후 상품 수:", filteredData.length);
  return filteredData;
});

// 비교함 추가/제거 토글 함수 (filteredProducts 외부로 이동)
const toggleCompare = (product) => {
  const productId = getProductId(product);
  const saveTrm = getSaveTrm(product);

  // 이미 비교함에 있는지 확인
  if (isInCompareList(productId, saveTrm)) {
    // 이미 있으면 제거
    const result = removeFromCompareList(productId, saveTrm);
    console.log("비교함에서 제거:", result);
  } else {
    // 없으면 추가
    // 비교함 최대 개수 확인 (기본값 4)
    if (compareList.value.length >= 4) {
      alert("최대 4개까지 비교할 수 있습니다.");
      return;
    }

    // 상품의 옵션 정보 (기간/금리 정보) 준비
    const option = {
      save_trm: product.save_trm || product.saveTrm,
      intr_rate: product.intr_rate || product.intrRate,
      intr_rate2: product.intr_rate2 || product.intrRate2,
      intr_rate_type: product.intr_rate_type || product.intrRateType || "S",
      option_id: product.option_id || product.optionId || null,
    };

    // 비교함에 추가
    const result = addToCompareList(product, option, props.productType);
    console.log("비교함에 추가:", result);
  }
};

// props 변경 시 로컬 상태 업데이트
watch(
  () => props.sortBy,
  (newValue) => {
    localSortBy.value = newValue;
  }
);

// 계산된 속성
const totalPages = computed(() => Math.ceil(props.totalCount / props.pageSize));

// 금리 포맷팅 함수
const formatRate = (rate) => {
  if (rate === null || rate === undefined) return "정보 없음";
  return parseFloat(rate).toFixed(2) + "%";
};

// 상품 클릭 이벤트 핸들러
const onProductClick = (product) => {
  emit("product-click", product);
};

// 페이지 변경 이벤트 핸들러
const onPageChange = (page) => {
  emit("page-change", page);
};

// 정렬 변경 이벤트 핸들러
const onSortChange = () => {
  emit("sort-change", { sortBy: localSortBy.value });
};

// 비교함에 추가 핸들러 (이 함수는 더 이상 필요하지 않으면 제거)
const handleAddToCompare = (product) => {
  // 비교함 최대 개수 확인
  if (compareList.value.length >= 4) {
    alert("최대 4개까지 비교할 수 있습니다.");
    return;
  }

  // 상품의 옵션 정보 (기간/금리 정보) 준비
  const option = {
    save_trm: product.save_trm || product.saveTrm,
    intr_rate: product.intr_rate || product.intrRate,
    intr_rate2: product.intr_rate2 || product.intrRate2,
    intr_rate_type: product.intr_rate_type || product.intrRateType || "S",
    option_id: product.option_id || product.optionId || null,
  };

  console.log("비교함 추가 전 상품/옵션 정보:", {
    product: product,
    option: option,
    productType: props.productType,
  });

  // useCompareList 컴포저블의 함수 사용
  const result = addToCompareList(product, option, props.productType);

  // 결과 표시 (선택적)
  if (!result.success) {
    alert(result.message);
  }
};

// 비교함에서 제거 핸들러 (새로 추가)
const handleRemoveFromCompare = (product) => {
  const productId = getProductId(product);
  const saveTrm = getSaveTrm(product);

  const result = removeFromCompareList(productId, saveTrm);
  console.log("비교함에서 제거:", result);
};

// 가입 페이지로 이동
const goToJoinPage = (product) => {
  const productId = getProductId(product);
  const saveTrm = getSaveTrm(product);

  router.push({
    name: "ProductDetail",
    params: {
      category: props.productType,
      id: productId,
    },
    query: {
      saveTrm: saveTrm,
    },
  });
};

// 비교 페이지로 이동
const goToCompare = () => {
  if (compareList.value.length < 2) {
    alert("최소 2개 이상의 상품을 선택해주세요.");
    return;
  }

  router.push({
    path: "/products/compare",
  });
};

// 컴포넌트 마운트 시 디버깅
onMounted(() => {
  console.log("컴포넌트 마운트됨");
  console.log("상품 데이터:", props.products);
  console.log("로딩 상태:", props.loading);
  console.log("에러 상태:", props.error);
});
</script>

<style scoped>
.search-results {
  margin-top: 20px;
  padding-bottom: 60px; /* 플로팅 바 높이만큼 여백 추가 */
}

.loading,
.error,
.no-results {
  padding: 20px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error {
  color: #e53935;
  background-color: #ffebee;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.total-count {
  font-size: 0.9rem;
  color: var(--color-sub);
}

.total-count strong {
  color: var(--color-main);
}

.sort-dropdown {
  position: relative;
}

.sort-select {
  padding: 0.3rem 1.5rem 0.3rem 0.5rem;
  border: 1px solid var(--color-light);
  border-radius: 4px;
  background-color: white;
  color: var(--color-main);
  font-size: 0.8rem;
  appearance: none;
  cursor: pointer;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-header {
  margin-bottom: 12px;
  cursor: pointer;
}

.bank-name {
  font-size: 13px;
  color: #666;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-top: 4px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
  cursor: pointer;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 13px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
}

.highlight {
  color: #e91e63;
}

/* 액션 버튼 스타일 수정 */
.compare-btn,
.join-btn {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  flex: 1;
}

.add-compare-btn {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  border: 1px solid var(--color-light);
  margin-right: 0.5rem;
}

.in-list {
  background-color: var(--color-main);
  color: white;
  opacity: 0.8;
  border: 1px solid var(--color-main);
  margin-right: 0.5rem;
}

.in-list:hover {
  opacity: 1;
}

.join-btn {
  background-color: var(--color-main);
  color: white;
}

/* 필터 요약 정보 스타일 */
.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-light);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  background-color: white;
  border-radius: 1.25rem;
  padding: 0.375rem 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-label {
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-right: 0.375rem;
}

.filter-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
}

.result-count {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.result-count strong {
  color: var(--color-main);
  font-weight: 600;
}

/* 검색 결과 없음 메시지 개선 */
.no-results {
  padding: 2rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.no-results p {
  margin: 0.5rem 0;
  color: var(--color-sub);
}

.no-results strong {
  color: var(--color-main);
}

.suggestion {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}
</style>
