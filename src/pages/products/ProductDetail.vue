<template>
  <div class="product-detail-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>상품 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <button class="back-btn" @click="goBack">목록으로 돌아가기</button>
    </div>

    <div v-else-if="product" class="product-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <BackButton title="목록으로" />
        <h1 class="page-title">{{ getCategoryName() }} 상세 정보</h1>
      </div>

      <!-- 상품 기본 정보 카드 -->
      <ProductInfoCard
        :product="product"
        :bankLogo="getBankLogo()"
        :bankInitial="getBankInitial()"
        :categoryName="getCategoryName()"
        :interestTypeName="getInterestTypeName()"
      />

      <!-- 금리 정보 섹션 -->
      <ProductRateInfo
        :selectedOption="selectedOption"
        :formatRate="formatRate"
      />

      <!-- 상품 주요 정보 -->
      <ProductFeatures
        :product="product"
        :selectedOption="selectedOption"
        :formatCurrency="formatCurrency"
        :formatDate="formatDate"
      />

      <!-- 우대 조건 섹션 -->
      <PreferentialConditions :conditions="parsedPreferentialConditions" />

      <!-- 액션 섹션 -->
      <ActionButtons
        :is-in-compare-list="
          isInCompareList(
            product.product_id,
            selectedOption?.save_trm || selectedOption?.saveTrm
          )
        "
        @add-to-compare="handleAddToCompare"
        @join-product="joinProduct"
      />

      <!-- 금융용어 섹션 -->
      <div class="financial-terms-section">
        <h3 class="section-title">금융용어 사전</h3>
        <div class="terms-list">
          <div
            v-for="term in financialTerms"
            :key="term.name"
            class="term-item"
            @click="showTermDetail(term.name)"
          >
            <div class="term-name">{{ term.name }}</div>
            <div class="term-preview">{{ term.preview }}</div>
          </div>
        </div>
      </div>

      <!-- 하단 여백 (CompareFloatingBar가 가리는 콘텐츠 방지) -->
      <div v-if="compareList.length > 0" style="height: 4rem"></div>
    </div>

    <!-- 금융용어 상세 모달 -->
    <FinancialTermModal
      v-if="showModal"
      :term="selectedTerm"
      @close="showModal = false"
    />

    <!-- 비교함 플로팅 바 -->
    <CompareFloatingBar
      :compare-list="compareList"
      @go-to-compare="goToCompare"
    />
  </div>
</template>
<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProductDetailAPI } from "@/api/product";
import BackButton from "@/components/common/BackButton.vue";
import ProductInfoCard from "@/components/products/ProductInfoCard.vue";
import ProductRateInfo from "@/components/products/ProductRateInfo.vue";
import ProductFeatures from "@/components/products/ProductFeatures.vue";
import PreferentialConditions from "@/components/products/PreferentialConditions.vue";
import FinancialTermModal from "@/components/products/FinancialTermModal.vue";
import ActionButtons from "@/components/products/ActionButtons.vue";
import CompareFloatingBar from "@/components/products/CompareFloatingBar.vue";
import useCompareList from "@/composables/useCompareList";

export default {
  name: "ProductDetailPage",
  components: {
    BackButton,
    ProductInfoCard,
    ProductRateInfo,
    ProductFeatures,
    PreferentialConditions,
    FinancialTermModal,
    ActionButtons,
    CompareFloatingBar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 상태 관리
    const product = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const showModal = ref(false);
    const selectedTerm = ref({ name: "", description: "" });

    // 비교함 기능 (컴포저블 사용)
    const { compareList, addToCompareList, isInCompareList } = useCompareList();

    // 금융 용어 데이터
    const financialTerms = [
      {
        name: "복리",
        preview: "원금뿐만 아니라 이자에도 이자가 붙는 계산법으로...",
      },
      {
        name: "단리",
        preview: "원금에 대해서만 이자가 발생하는 계산법으로...",
      },
      {
        name: "세금우대",
        preview: "일반과세보다 낮은 세율이 적용되는 금융상품...",
      },
    ];

    // 상품 정보 로드
    const loadProductDetail = async () => {
      try {
        loading.value = true;
        error.value = null;

        const category = route.params.category;
        const productId = route.params.id;
        const saveTrm = route.query.saveTrm;

        console.log(
          `상품 상세 정보 로드: 카테고리=${category}, ID=${productId}, saveTrm=${saveTrm}`
        );

        const response = await getProductDetailAPI(category, productId, {
          saveTrm,
        });

        if (response) {
          product.value = response;
          product.value.is_digital_only =
            product.value.join_way === "online" ||
            product.value.join_way === "인터넷";
        } else {
          error.value = "상품 정보를 찾을 수 없습니다.";
        }
      } catch (err) {
        console.error("상품 상세 정보 로드 오류:", err);
        error.value = "상품 정보를 불러오는 중 오류가 발생했습니다.";
      } finally {
        loading.value = false;
      }
    };

    // 우대 조건 파싱
    const parsedPreferentialConditions = computed(() => {
      if (!product.value || !product.value.preferential_conditions) {
        return [];
      }

      const conditions = product.value.preferential_conditions.split(/\n|\r\n/);
      const parsedConditions = [];

      for (const condition of conditions) {
        if (condition.trim() === "") continue;

        const cleanCondition = condition
          .replace(/^\d+[\.\)]\s*|\-\s*|\*\s*/, "")
          .trim();

        if (cleanCondition) {
          parsedConditions.push(cleanCondition);
        }
      }

      return parsedConditions;
    });

    // 비교함에 추가 핸들러
    const handleAddToCompare = () => {
      if (!product.value || !selectedOption.value) {
        alert("상품 정보가 없어 비교함에 추가할 수 없습니다.");
        return;
      }

      // 로컬 스토리지 디버깅 출력
      console.log(
        "현재 로컬 스토리지:",
        localStorage.getItem("finmate_compare_list")
      );

      console.log("비교함 추가 전 상품/옵션 정보:", {
        product: product.value,
        selectedOption: selectedOption.value,
        category: route.params.category,
      });

      const result = addToCompareList(
        product.value,
        selectedOption.value,
        route.params.category
      );

      alert(result.message);

      // 결과 확인을 위해 로컬 스토리지 다시 출력
      console.log(
        "추가 후 로컬 스토리지:",
        localStorage.getItem("finmate_compare_list")
      );
    };

    // 비교함으로 이동
    const goToCompare = () => {
      router.push("/products/compare");
    };

    // 상품 유형 체크 함수
    const isDepositProduct = () => {
      return route.params.category === "deposit";
    };

    const isPensionProduct = () => {
      return route.params.category === "pension";
    };

    // 카테고리 이름 가져오기
    const getCategoryName = () => {
      const category = route.params.category;

      switch (category) {
        case "deposit":
          return "정기예금";
        case "pension":
          return "연금저축";
        case "saving":
          return "적금";
        default:
          return "금융상품";
      }
    };

    // 금리 유형 이름 가져오기
    const getInterestTypeName = () => {
      if (!product.value) return "";

      const interestTypeCode = product.value.intr_rate_type;

      if (interestTypeCode === "S") {
        return "단리";
      } else if (interestTypeCode === "M") {
        return "복리";
      } else {
        return "기본금리";
      }
    };

    // 은행 로고 URL 가져오기
    const getBankLogo = () => {
      if (!product.value || !product.value.kor_co_nm) return null;

      const bankLogos = {
        국민은행: "/bank-logos/kb.png",
        신한은행: "/bank-logos/shinhan.png",
        우리은행: "/bank-logos/woori.png",
        하나은행: "/bank-logos/hana.png",
        농협은행: "/bank-logos/nh.png",
        기업은행: "/bank-logos/ibk.png",
      };

      return bankLogos[product.value.kor_co_nm] || null;
    };

    // 은행 이니셜 가져오기 (로고가 없을 경우)
    const getBankInitial = () => {
      if (!product.value || !product.value.kor_co_nm) return "";
      return product.value.kor_co_nm.charAt(0);
    };

    // 금융용어 상세 보기
    const showTermDetail = (termName) => {
      const termData = {
        복리: {
          name: "복리",
          description:
            '복리는 원금뿐만 아니라 이자에도 이자가 붙는 계산법입니다. 장기 투자 시 단리보다 더 많은 수익을 얻을 수 있습니다. 복리는 이자가 원금에 더해져 다음 기간에는 이 합계액에 대해 이자가 계산되는 방식으로, "이자의 이자"라고도 불립니다.',
        },
        단리: {
          name: "단리",
          description:
            "단리는 원금에 대해서만 이자가 발생하는 계산법입니다. 즉, 이자는 원금에만 적용되고 이전에 발생한 이자에는 적용되지 않습니다. 단리 계산은 복리 계산보다 단순하지만, 장기 투자 시 복리보다 수익이 적을 수 있습니다.",
        },
        세금우대: {
          name: "세금우대",
          description:
            "세금우대는 일반과세보다 낮은 세율이 적용되는 금융상품을 말합니다. 일반적으로 이자소득에 대해 15.4%(소득세 14%, 지방소득세 1.4%)의 세금이 부과되지만, 세금우대 상품은 이보다 낮은 9.5%(소득세 8.7%, 지방소득세 0.8%)의 세율이 적용됩니다. 주로 장기 저축을 장려하기 위한 정책으로 활용됩니다.",
        },
      };

      selectedTerm.value = termData[termName] || {
        name: termName,
        description: "해당 용어에 대한 설명이 준비되지 않았습니다.",
      };

      showModal.value = true;
    };

    // 상품 가입하기
    const joinProduct = () => {
      if (!product.value) return;
      const joinUrl = product.value.external_link || getBankWebsite();
      window.open(joinUrl, "_blank");
    };

    // 은행 웹사이트 URL 가져오기
    const getBankWebsite = () => {
      if (!product.value || !product.value.kor_co_nm) return "#";

      const bankWebsites = {
        국민은행: "https://www.kbstar.com",
        신한은행: "https://www.shinhan.com",
        우리은행: "https://www.wooribank.com",
        하나은행: "https://www.kebhana.com",
        농협은행: "https://banking.nonghyup.com",
        기업은행: "https://www.ibk.co.kr",
      };

      return (
        bankWebsites[product.value.kor_co_nm] ||
        `https://www.google.com/search?q=${encodeURIComponent(
          product.value.kor_co_nm
        )}`
      );
    };

    // 목록으로 돌아가기
    const goBack = () => {
      router.back();
    };

    // 날짜 포맷팅 (YYYYMMDD → YYYY.MM.DD)
    const formatDate = (dateStr) => {
      if (!dateStr) return "";

      if (typeof dateStr === "string") {
        if (/^\d{8}$/.test(dateStr)) {
          return `${dateStr.substring(0, 4)}.${dateStr.substring(
            4,
            6
          )}.${dateStr.substring(6, 8)}`;
        }

        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
          return dateStr.substring(0, 10).replace(/-/g, ".");
        }
      }

      if (dateStr instanceof Date) {
        const year = dateStr.getFullYear();
        const month = String(dateStr.getMonth() + 1).padStart(2, "0");
        const day = String(dateStr.getDate()).padStart(2, "0");
        return `${year}.${month}.${day}`;
      }

      return dateStr;
    };

    // 금액 포맷팅
    const formatCurrency = (value) => {
      if (value === null || value === undefined) return "회사가 정보 안 줌 ㅠ";
      return new Intl.NumberFormat("ko-KR").format(value) + "원";
    };

    // 금리 포맷팅
    const formatRate = (rate) => {
      if (rate === null || rate === undefined) return "정보 없음";
      return parseFloat(rate).toFixed(2) + "%";
    };

    // 선택된 옵션 계산
    const selectedOption = computed(() => {
      if (!product.value || !product.value.productDetail) {
        return null;
      }

      const options = product.value.productDetail.options;

      if (!options || !Array.isArray(options)) {
        return null;
      }

      const saveTrm = route.query.saveTrm;

      return (
        options.find(
          (opt) => String(opt.save_trm || opt.saveTrm) === String(saveTrm)
        ) || options[0]
      );
    });

    // 컴포넌트 마운트 시 데이터 로드
    onMounted(() => {
      loadProductDetail();
    });

    return {
      product,
      loading,
      error,
      showModal,
      selectedTerm,
      selectedOption,
      compareList,
      financialTerms,
      parsedPreferentialConditions,
      isDepositProduct,
      isPensionProduct,
      getCategoryName,
      getInterestTypeName,
      getBankLogo,
      getBankInitial,
      showTermDetail,
      handleAddToCompare,
      isInCompareList,
      goToCompare,
      joinProduct,
      goBack,
      formatDate,
      formatCurrency,
      formatRate,
    };
  },
};
</script>
<style scoped>
.product-detail-page {
  max-width: 375px;
  margin: 0 auto;
  padding: 1rem;
  font-family: "Noto Sans KR", sans-serif;
  color: var(--color-text);
  padding-bottom: 4rem; /* CompareFloatingBar 영역 확보 */
}

/* 로딩 & 에러 상태 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.75rem 0;
  text-align: center;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid var(--color-bg-light);
  border-top: 0.25rem solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  width: 3.125rem;
  height: 3.125rem;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.back-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--color-bg-light);
  border: none;
  border-radius: 0.25rem;
  color: var(--color-main);
  font-weight: 500;
  cursor: pointer;
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-main);
  flex: 1;
}

/* 금융용어 섹션 */
.financial-terms-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.125rem;
  margin: 0 0 1rem 0;
  color: var(--color-main);
}

.terms-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.term-item {
  background-color: var(--color-bg-light);
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.term-item:hover {
  background-color: #e9e9ef;
  transform: translateY(-0.125rem);
}

.term-name {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-main);
}

.term-preview {
  font-size: 0.8125rem;
  color: var(--color-sub);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
