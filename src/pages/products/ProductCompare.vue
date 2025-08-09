<template>
  <div class="compare-page">
    <!-- 헤더 -->
    <div class="page-header">
      <BackButton title="이전으로" />
    </div>

    <!-- 비교함이 비어있는 경우 -->
    <CompareEmptyState v-if="compareList.length === 0" @goToProducts="goToProductList" />

    <!-- 비교 콘텐츠 -->
    <div v-else class="compare-content">
      <!-- 비교함 관리 -->
      <div class="compare-actions">
        <div class="compare-count">{{ compareList.length }}/3 상품 비교 중</div>
        <button class="clear-btn" @click="handleClearCompare">비교함 비우기</button>
      </div>

      <!-- 비교 테이블 -->
      <CompareTable
        :items="compareList"
        :compare-data="compareData"
        :get-min-deposit-for-product="getMinDepositForProduct"
        :get-max-deposit-for-product="getMaxDepositForProduct"
        :get-interest-type-for-product="getInterestTypeForProduct"
        @remove="handleRemoveItem"
        @viewDetail="goToDetail"
        @joinProduct="handleJoinProduct"
      />

      <!-- API 비교 결과 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>상품 비교 정보를 불러오는 중입니다...</p>
      </div>

      <CompareErrorState
        v-else-if="error"
        :error="error"
        :summary="comparisonSummary"
        @retry="loadCompareData"
      />
    </div>

    <!-- GPT 비교 요약 버튼 (화면 하단 좌측 고정) -->
    <div v-if="compareList.length >= 2" class="gpt-summary-btn-container">
      <button class="gpt-summary-btn" @click="handleGptSummary" :disabled="gptLoading">
        <div v-if="gptLoading" class="btn-loading">
          <div class="mini-spinner"></div>
        </div>
        <span v-else class="gpt-icon">🤖</span>
        <span class="btn-text">
          {{ gptLoading ? '분석 중...' : 'MATE 비교요약' }}
        </span>
      </button>
    </div>

    <!-- GPT 비교 모달 -->
    <GptExampleModal
      :show="showGptModal"
      :compare-list="compareList"
      @close="showGptModal = false"
    />

    <!-- 성공 토스트 (간단한 알림) -->
    <div v-if="showSuccessToast" class="success-toast">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useModal } from '@/composables/useModal';
import axios from 'axios';
import useCompareList from '@/composables/useCompareList';
import BackButton from '@/components/common/BackButton.vue';
import CompareTable from '@/components/products/compare/CompareTable.vue';
import CompareEmptyState from '@/components/products/compare/CompareEmptyState.vue';
import CompareErrorState from '@/components/products/compare/CompareErrorState.vue';
import { compareProductsAPI } from '../../api/product';
import GptExampleModal from '@/components/products/compare/GptExampleModal.vue';

// 라우터 및 컴포저블 초기화
const router = useRouter();
const route = useRoute();
const { showModal } = useModal();
const { compareList, removeFromCompareList, clearCompareList } = useCompareList();

// 상태 관리
const isLoading = ref(false);
const compareData = ref(null);
const error = ref(null);
const showGptModal = ref(false);
const gptLoading = ref(false);
const showSuccessToast = ref(false);
const toastMessage = ref('');

// GPT 요약 처리 (개선된 버전)
const handleGptSummary = async () => {
  if (compareList.value.length < 2) {
    showToast('비교할 상품이 부족합니다. 최소 2개 이상의 상품을 선택해주세요.');
    return;
  }

  try {
    gptLoading.value = true;
    showGptModal.value = true;
  } catch (error) {
    console.error('GPT 모달 열기 실패:', error);
    showToast('요약 기능을 실행할 수 없습니다.');
  } finally {
    gptLoading.value = false;
  }
};

// 토스트 메시지 표시
const showToast = (message) => {
  toastMessage.value = message;
  showSuccessToast.value = true;
  setTimeout(() => {
    showSuccessToast.value = false;
  }, 3000);
};

// 플로팅 바에서 비교하기 버튼 클릭 시 처리
const handleGoToCompare = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

// 데이터 탐색 유틸리티 함수 (개선된 버전)
const getProductValue = (productId, fieldMapping, defaultValue = '정보 없음') => {
  // API 데이터에서 찾기
  if (compareData.value?.products) {
    const product = compareData.value.products.find(
      (p) => String(p.productId) === String(productId) || String(p.product_id) === String(productId)
    );

    if (product) {
      for (const field of fieldMapping) {
        const value = product[field];
        if (value !== undefined && value !== null) {
          return value;
        }
      }
    }
  }

  // 로컬 리스트에서 찾기
  const listProduct = compareList.value.find(
    (item) => String(item.productId) === String(productId)
  );

  if (listProduct) {
    for (const field of fieldMapping) {
      const value = listProduct[field];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  return defaultValue;
};

// 최소 가입금액 조회 (개선된 버전)
const getMinDepositForProduct = (productId) => {
  const amount = getProductValue(productId, ['minDepositAmount', 'min_deposit_amount'], 0);

  return amount ? formatCurrency(amount) : '정보 없음';
};

// 최대 가입금액 조회 (개선된 버전)
const getMaxDepositForProduct = (productId) => {
  const amount = getProductValue(
    productId,
    ['maxDepositAmount', 'max_deposit_amount', 'max_limit'],
    0
  );

  if (amount === 0) return '제한 없음';
  return amount ? formatCurrency(amount) : '정보 없음';
};

// 이자 유형 조회
const getInterestTypeForProduct = (productId, saveTrm, intrRateType) => {
  const interestTypes = {
    S: '단리',
    M: '복리',
  };

  let interestTypeName = interestTypes[intrRateType] || intrRateType;

  if (!compareData.value?.products) {
    const product = compareList.value.find(
      (item) =>
        String(item.productId) === String(productId) && String(item.saveTrm) === String(saveTrm)
    );

    if (product?.intrRateTypeNm) {
      return product.intrRateTypeNm;
    }
    return interestTypeName;
  }

  const product = compareData.value.products.find(
    (p) => String(p.productId) === String(productId) || String(p.finPrdtCd) === String(productId)
  );

  if (product?.options) {
    const option = product.options.find(
      (opt) =>
        String(opt.saveTrm) === String(saveTrm) && String(opt.intrRateType) === String(intrRateType)
    );

    if (option?.intrRateTypeNm) {
      return option.intrRateTypeNm;
    }
  }

  return interestTypeName;
};

// 비교 요약 계산
const comparisonSummary = computed(() => {
  if (compareList.value.length < 2) return null;

  const bestRateProduct = [...compareList.value].sort((a, b) => {
    const rateA = parseFloat(a.intrRate2 || a.intrRate || 0);
    const rateB = parseFloat(b.intrRate2 || b.intrRate || 0);
    return rateB - rateA;
  })[0];

  const shortestTermProduct = [...compareList.value].sort((a, b) => {
    const termA = parseInt(a.saveTrm || 12);
    const termB = parseInt(b.saveTrm || 12);
    return termA - termB;
  })[0];

  return {
    bestRate: {
      bankName: bestRateProduct.korCoNm,
      productName: bestRateProduct.productName,
      rate: bestRateProduct.intrRate2 || bestRateProduct.intrRate,
    },
    shortestTerm: {
      bankName: shortestTermProduct.korCoNm,
      productName: shortestTermProduct.productName,
      term: shortestTermProduct.saveTrm,
    },
  };
});

// API 호출 및 데이터 로드 (에러 핸들링 개선)
const loadCompareData = async () => {
  if (compareList.value.length < 2) return;

  try {
    isLoading.value = true;
    error.value = null;

    const productType = compareList.value[0].productType;
    const productIds = compareList.value.map((item) => item.productId);
    const saveTrm = compareList.value[0].saveTrm;
    const intrRateType = compareList.value[0].intrRateType;

    const response = await compareProductsAPI(productIds, productType, saveTrm, intrRateType);
    compareData.value = response;

    if (response?.products && Array.isArray(response.products)) {
      compareList.value = compareList.value.map((item) => {
        const apiProduct = response.products.find(
          (p) => String(p.product_id) === String(item.productId)
        );

        if (apiProduct) {
          return {
            ...item,
            preferential_tags: apiProduct.preferential_tags,
            join_member: apiProduct.join_member,
            preferentialTags: apiProduct.preferential_tags,
            joinMember: apiProduct.join_member,
            minDepositAmount: apiProduct.minDepositAmount,
            maxDepositAmount: apiProduct.maxDepositAmount,
            etc_note: apiProduct.etc_note,
            options: apiProduct.options || [],
          };
        }
        return item;
      });
    }
  } catch (err) {
    console.error('비교 데이터 로드 오류:', err);
    if (err.response?.status === 404) {
      error.value = '요청하신 상품을 찾을 수 없습니다.';
    } else if (err.response?.status >= 500) {
      error.value = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (!navigator.onLine) {
      error.value = '인터넷 연결을 확인해주세요.';
    } else {
      error.value = '비교 정보를 불러오는 중 오류가 발생했습니다.';
    }
  } finally {
    isLoading.value = false;
  }
};

// 비교함에서 상품 제거 (개선된 버전)
const handleRemoveItem = async (productId, saveTrm, intrRateType = 'S') => {
  const confirmed = await showModal('비교함에서 해당 상품을 제거하시겠습니까?');

  if (confirmed) {
    try {
      removeFromCompareList(productId, saveTrm, intrRateType);

      if (compareList.value.length < 2) {
        compareData.value = null;
        error.value = null;
      } else {
        await loadCompareData();
      }

      showToast('상품이 비교함에서 제거되었습니다.');
    } catch (error) {
      console.error('상품 제거 실패:', error);
      showToast('상품 제거에 실패했습니다.');
    }
  }
};

// 비교함 비우기 (개선된 버전)
const handleClearCompare = async () => {
  const confirmed = await showModal('비교함의 모든 상품을 제거하시겠습니까?');

  if (confirmed) {
    try {
      localStorage.removeItem('finmate_compare_list');
      clearCompareList();
      compareData.value = null;
      error.value = null;
      showToast('비교함이 비워졌습니다.');
    } catch (err) {
      console.error('비교함 비우기 실패:', err);
      showToast('비교함 비우기에 실패했습니다.');
    }
  }
};

// 상품 목록으로 이동
const goToProductList = () => {
  if (compareList.value.length > 0) {
    const defaultCategory = compareList.value[0].productType || 'deposit';
    router.push(`/products/${defaultCategory}`);
    return;
  }

  const queryProductIds = route.query.productIds;
  if (queryProductIds) {
    const productType = route.query.productType || 'deposit';
    router.push(`/products/${productType}`);
    return;
  }

  const lastCategory = localStorage.getItem('lastVisitedCategory') || 'deposit';
  router.push(`/products/${lastCategory}`);
};

// 상세 페이지로 이동
const goToDetail = (productId, productType = 'deposit', saveTrm = null) => {
  const query = saveTrm ? { saveTrm } : {};
  router.push({
    path: `/products/${productType}/${productId}`,
    query,
  });
};

// 가입하기
const handleJoinProduct = (item) => {
  const bankWebsites = {
    국민은행: 'https://www.kbstar.com',
    신한은행: 'https://www.shinhan.com',
    우리은행: 'https://www.wooribank.com',
    하나은행: 'https://www.kebhana.com',
    농협은행: 'https://banking.nonghyup.com',
    기업은행: 'https://www.ibk.co.kr',
  };

  const url =
    bankWebsites[item.korCoNm] ||
    `https://www.google.com/search?q=${encodeURIComponent(item.korCoNm + ' ' + item.productName)}`;

  window.open(url, '_blank');
};

// 금액 포맷팅
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '정보 없음';
  return new Intl.NumberFormat('ko-KR').format(value) + '원';
};

// 페이지 로드 시 데이터 로드
onMounted(() => {
  if (compareList.value.length >= 2) {
    loadCompareData();
  }
});
</script>

<style scoped>
/* 기존 스타일 유지 */
.compare-page {
  background-color: var(--color-bg-light);
  padding: 1rem 0;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.compare-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.03);
}

.compare-count {
  font-size: 0.9375rem;
  color: var(--color-sub);
  font-weight: 500;
}

.compare-count strong {
  color: var(--color-main);
  font-weight: 700;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-sub);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  padding: 0.25rem;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: var(--color-main);
  text-decoration: underline;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
  color: var(--color-sub);
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* GPT 버튼 스타일 (개선된 버전) */
.gpt-summary-btn-container {
  position: fixed;
  bottom: 2rem;
  left: 1rem;
  z-index: 100;
}

.gpt-summary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
  border: none;
  border-radius: 2rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 0.5rem 1.5rem rgba(45, 51, 107, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 10rem;
}

.gpt-summary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.gpt-summary-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 0.75rem 2rem rgba(45, 51, 107, 0.4);
}

.gpt-summary-btn:active {
  transform: translateY(0);
}

.gpt-icon {
  font-size: 1.125rem;
  animation: bounce 2s infinite;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-text {
  white-space: nowrap;
}

/* 토스트 알림 */
.success-toast {
  position: fixed;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(40, 167, 69, 0.95);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 1001;
  animation: toastSlideIn 0.3s ease-out;
  backdrop-filter: blur(10px);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .gpt-summary-btn-container {
    bottom: 1rem;
    left: 0.5rem;
  }

  .gpt-summary-btn {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
    min-width: 9rem;
  }

  .success-toast {
    bottom: 5rem;
    left: 1rem;
    right: 1rem;
    transform: none;
    text-align: center;
  }
}
</style>
