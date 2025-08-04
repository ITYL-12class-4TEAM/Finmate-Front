<template>
  <div class="search-results">
    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="no-results">
      검색 조건에 맞는 상품이 없습니다.
    </div>
    <div v-else>
      <!-- 상품 목록 헤더 (상품 개수 + 정렬 옵션) -->
      <div class="results-header">
        <div class="total-count">
          <strong>{{ totalCount }}</strong
          >개
        </div>

        <!-- 간단한 정렬 드롭다운 추가 -->
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

      <!-- 상품 목록 -->
      <div class="product-list">
        <div
          v-for="product in filteredProducts"
          :key="product.product_id || product.finPrdtCd"
          class="product-card"
          @click="onProductClick(product)"
        >
          <div class="product-header">
            <div class="bank-name">
              {{ product.kor_co_nm || product.korCoNm }}
            </div>
            <div class="product-name">
              {{ product.product_name || product.finPrdtNm }}
            </div>
          </div>

          <div class="product-details">
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
        </div>
      </div>

      <!-- 페이지네이션 -->
      <Pagination
        v-if="totalPages > 1"
        :total-pages="totalPages"
        :current-page="currentPage"
        @page-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import Pagination from '../Pagination.vue';

// 프롭스 정의
const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  depositAmount: {
    type: String,
    default: '100000',
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
    default: 'intrRate'
  },
});

// 필터링된 상품 리스트
const filteredProducts = computed(() => {
  // 사용자가 입력한 금액 (콤마 제거 후 숫자로)
  const userAmount = Number(props.depositAmount.replace(/,/g, ''));
  console.log('depositAmount prop:', props.depositAmount);
  console.log('userAmount:', userAmount);

  // 금액 미입력 시 전체
  if (!userAmount) return props.products;

  return props.products.filter(product => {
    // API/DB에서 내려오는 필드명에 맞게 수정!
    // 예시: minDepositAmount, maxDepositAmount 또는 min_amount, max_amount 등
    const min = Number(product.minDepositAmount || product.min_amount || 0);
    // null/빈값 방지: max 없으면 무제한
    const max =
      Number(product.maxDepositAmount || product.max_amount) ||
      Number.MAX_SAFE_INTEGER;

      console.log(`user: ${userAmount}, min: ${min}, max: ${max}`);


    return userAmount >= min && userAmount <= max;
  });
});

// 이벤트 정의
const emit = defineEmits(['product-click', 'page-change', 'sort-change']);

// 현재 정렬 기준 (로컬 상태)
const localSortBy = ref(props.sortBy);

// props 변경 시 로컬 상태 업데이트
watch(() => props.sortBy, (newValue) => {
  localSortBy.value = newValue;
});

// 계산된 속성
const totalPages = computed(() => Math.ceil(props.totalCount / props.pageSize));

// 금리 포맷팅 함수
const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

// 상품 클릭 이벤트 핸들러
const onProductClick = (product) => {
  emit('product-click', product);
};

// 페이지 변경 이벤트 핸들러
const onPageChange = (page) => {
  emit('page-change', page);
};

// 정렬 변경 이벤트 핸들러
const onSortChange = () => {
  emit('sort-change', { sortBy: localSortBy.value });
};
</script>

<style scoped>
.search-results {
  margin-top: 20px;
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

.results-header{
    display: flex;

}

.sort-dropdown{
    margin-left: auto;
}

.results-count {
  font-size: 16px;
  margin-bottom: 16px;
  color: #666;
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
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-header {
  margin-bottom: 12px;
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
</style>
