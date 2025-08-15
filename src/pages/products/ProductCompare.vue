<template>
  <div class="compare-page">
    <div class="page-header">
      <div class="header-left">
        <BackButton />
      </div>
      <div class="header-center">
        <button class="list-btn" @click="goToProductList">
          {{ productTypeLabel }} 리스트 이동
        </button>
      </div>
      <div class="header-right">
        <button class="clear-btn" @click="handleClearCompare">비교함 비우기</button>
      </div>
    </div>

    <div class="product-type-tabs">
      <button
        class="tab-btn"
        :class="{ active: productType === 'deposit' }"
        @click="switchProductType('deposit')"
      >
        예금 상품
      </button>
      <button
        class="tab-btn"
        :class="{ active: productType === 'savings' }"
        @click="switchProductType('savings')"
      >
        적금 상품
      </button>
    </div>

    <div v-if="currentCompareList.length <= 1" class="not-enough-products">
      <div class="message-container">
        <div class="warning-icon">!</div>
        <h3>2개 이상의 상품을 선택해주세요.</h3>
        <p>상품 비교를 위해서는<br />최소 2개의 상품이 필요합니다.</p>
        <button class="go-to-list-btn" @click="goToProductList">
          {{ productTypeLabel }} 상품 목록으로
        </button>
      </div>
    </div>

    <CompareEmptyState
      v-else-if="currentCompareList.length === 0"
      @go-to-products="goToProductList"
    />

    <div v-else class="compare-content">
      <CompareTable
        :items="currentCompareList"
        :compare-data="compareData"
        :get-min-deposit-for-product="getMinDepositForProduct"
        :get-max-deposit-for-product="getMaxDepositForProduct"
        :get-interest-type-for-product="getInterestTypeForProduct"
        @remove="handleRemoveItem"
        @view-detail="goToDetail"
        @join-product="handleJoinProduct"
      />

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

    <div v-if="currentCompareList.length >= 2" class="gpt-summary-btn-container">
      <button class="gpt-summary-btn" :disabled="gptLoading" @click="handleGptSummary">
        <div v-if="gptLoading" class="btn-loading">
          <div class="mini-spinner"></div>
        </div>
        <span v-else class="gpt-icon">🤖</span>
        <span class="btn-text">
          {{ gptLoading ? '분석 중...' : 'MATE 비교요약' }}
        </span>
      </button>
    </div>

    <GptExampleModal
      :show="showGptModal"
      :compare-list="currentCompareList"
      @close="showGptModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useModal } from '@/composables/useModal';
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

// 상품 타입 및 비교함 사용
const productType = ref(route.query.type || 'deposit'); // URL 쿼리 파라미터에서 가져오기 (기본값: 'deposit')

const { depositCompareList, savingsCompareList, clearCompareList, removeFromCompareList } =
  useCompareList();

// 현재 선택된 상품 타입에 따른 비교함 리스트
const currentCompareList = computed(() => {
  return productType.value === 'deposit' ? depositCompareList.value : savingsCompareList.value;
});

// 상품 타입에 따른 라벨 표시
const productTypeLabel = computed(() => {
  return productType.value === 'deposit' ? '예금' : '적금';
});

// 상태 관리
const isLoading = ref(false);
const compareData = ref(null);
const error = ref(null);
const showGptModal = ref(false);
const gptLoading = ref(false);

// 상품 타입 전환
const switchProductType = (type) => {
  productType.value = type;

  // URL 쿼리 파라미터 업데이트
  router.replace({
    query: { ...route.query, type },
  });

  // 타입 변경 시 데이터 다시 로드
  if (currentCompareList.value.length >= 2) {
    loadCompareData();
  }
};

// 비교함 비우기
const handleClearCompare = async () => {
  const confirmed = await showModal(`모든 상품을 제거하시겠습니까?`);

  if (confirmed) {
    try {
      // 현재 타입에 맞는 비교함만 비우기
      clearCompareList(productType.value);
      compareData.value = null;
      error.value = null;
    } catch (err) {
      console.error('비교함 비우기 실패:', err);
    }
  }
};

// GPT 요약 처리
const handleGptSummary = async () => {
  if (currentCompareList.value.length < 2) {
    return;
  }

  try {
    gptLoading.value = true;
    showGptModal.value = true;
  } catch (error) {
    console.error('GPT 모달 열기 실패:', error);
  } finally {
    gptLoading.value = false;
  }
};

// 데이터 탐색 유틸리티 함수
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
  const listProduct = currentCompareList.value.find(
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

// 최소 가입금액 조회
const getMinDepositForProduct = (productId) => {
  const amount = getProductValue(productId, ['minDepositAmount', 'min_deposit_amount'], 0);
  return amount ? formatCurrency(amount) : '정보 없음';
};

// 최대 가입금액 조회
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
    const product = currentCompareList.value.find(
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
  if (currentCompareList.value.length < 2) return null;

  const bestRateProduct = [...currentCompareList.value].sort((a, b) => {
    const rateA = parseFloat(a.intrRate2 || a.intrRate || 0);
    const rateB = parseFloat(b.intrRate2 || b.intrRate || 0);
    return rateB - rateA;
  })[0];

  const shortestTermProduct = [...currentCompareList.value].sort((a, b) => {
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

// API 호출 및 데이터 로드
const loadCompareData = async () => {
  if (currentCompareList.value.length < 2) return;

  try {
    isLoading.value = true;
    error.value = null;

    const productIds = currentCompareList.value.map((item) => item.productId);
    const saveTrm = currentCompareList.value[0].saveTrm;
    const intrRateType = currentCompareList.value[0].intrRateType;

    // 현재 선택된 상품 타입을 API 호출에 포함
    const response = await compareProductsAPI(productIds, productType.value, saveTrm, intrRateType);
    compareData.value = response;

    if (response?.products && Array.isArray(response.products)) {
      // 반환된 데이터로 현재 비교함 정보 보강
      const updatedList = currentCompareList.value.map((item) => {
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

      // 상품 타입에 따라 적절한 비교함에 업데이트
      if (productType.value === 'deposit') {
        depositCompareList.value = updatedList;
      } else {
        savingsCompareList.value = updatedList;
      }
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

// 비교함에서 상품 제거
const handleRemoveItem = async (productId, saveTrm, intrRateType = 'S') => {
  const confirmed = await showModal('해당 상품을 제거하시겠습니까?');

  if (confirmed) {
    try {
      // 해당 상품 항목 찾기
      const product = currentCompareList.value.find(
        (item) => String(item.productId) === String(productId)
      );

      if (product) {
        // 현재 비교함에서 제거
        removeFromCompareList(
          productId,
          saveTrm,
          intrRateType,
          product.rsrvType,
          productType.value
        );

        // 삭제 후 남은 상품 수가 2개 이상이면 데이터 다시 로드
        if (currentCompareList.value.length >= 2) {
          await loadCompareData();
        } else {
          // 1개 이하면 비교 데이터 초기화
          compareData.value = null;
          error.value = null;
        }
      }
    } catch (error) {
      console.error('상품 제거 실패:', error);
    }
  }
};

// 상품 목록으로 이동
const goToProductList = () => {
  router.push(`/products/${productType.value}`);
};

// 상세 페이지로 이동
const goToDetail = (productId, productType, saveTrm = null) => {
  // 현재 선택된 상품 타입(전역 상태의 productType.value)을 기본값으로 사용
  // productType 파라미터가 없거나 undefined인 경우에만 전역 상태를 사용
  const actualProductType =
    productType && productType !== 'undefined' ? productType : productType.value; // 현재 탭에 표시된 상품 타입

  const query = saveTrm ? { saveTrm } : {};

  // currentCompareList에서 해당 상품 찾기
  const product = currentCompareList.value.find(
    (item) => String(item.productId) === String(productId)
  );

  if (product) {
    // 적금 상품인 경우 추가 파라미터 설정
    if (product.productType === 'savings' || actualProductType === 'savings') {
      query.rsrvType = product.rsrvType || 'F'; // 기본값 'F'

      // intrRateType도 추가
      if (product.intrRateType) {
        query.intrRateType = product.intrRateType;
      }
    }

    router.push({
      path: `/products/${actualProductType}/${productId}`,
      query,
    });
    window.scrollTo(0, 0);
  } else {
    // 상품을 찾지 못한 경우 기본 경로로 이동
    router.push({
      path: `/products/${actualProductType}/${productId}`,
      query,
    });
  }
};

// 가입하기
const handleJoinProduct = (item) => {
  // 저장된 company_url이 있으면 우선 사용
  if (item.companyUrl) {
    window.open(item.companyUrl, '_blank');
    return;
  }

  // 기존 fallback 로직 유지
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

// URL 쿼리 파라미터가 변경될 때 상품 타입 업데이트
watch(
  () => route.query.type,
  (newType) => {
    if (newType && ['deposit', 'savings'].includes(newType)) {
      productType.value = newType;
    }
  }
);

// 페이지 로드 시 데이터 로드
onMounted(() => {
  // URL 쿼리 파라미터에서 상품 타입 확인
  if (route.query.type && ['deposit', 'savings'].includes(route.query.type)) {
    productType.value = route.query.type;
  }

  // 2개 이상 상품이 있으면 비교 데이터 로드
  if (currentCompareList.value.length >= 2) {
    loadCompareData();
  }

  nextTick(() => {
    window.scrollTo(0, 0);
  });
});
</script>

<style scoped>
.compare-page {
  padding-bottom: 5rem;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  background-color: #ffffff;
  padding: 0 0rem;
  border-bottom: 1px solid #f0f0f0;
  box-sizing: border-box;
}

.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
  flex: 0 0 auto; /* 뒤로가기 버튼 크기만큼만 차지 */
}
.header-center {
  flex-grow: 1; /* 중앙 버튼이 남은 공간을 모두 차지하도록 설정 */
  justify-content: end;
  margin-right: 0.5rem;
}
.header-right {
  justify-content: flex-end;
  flex: 0 0 auto; /* 비우기 버튼 크기만큼만 차지 */
}

.product-type-tabs {
  display: flex;
  justify-content: center;
  margin: 0.5rem auto 0.5rem;
  background-color: var(--color-bg-light);
  border-radius: 2rem;
  padding: 0.25rem;
  width: 90%;
  max-width: 20rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background-color: #fff;
  color: var(--color-main);
  font-weight: 600;
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.1);
}

.not-enough-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.message-container {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 0.25rem 1.5rem rgba(45, 51, 107, 0.08);
  max-width: 28rem;
  width: 100%;
}

.warning-icon {
  width: 3.5rem;
  height: 3.5rem;
  background-color: var(--color-main);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1.5rem;
}

.not-enough-products h3 {
  font-size: 1.1rem;
  color: var(--color-main);
  margin-bottom: 0.75rem;
}

.not-enough-products p {
  color: var(--color-sub);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.go-to-list-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.go-to-list-btn:hover {
  background-color: #373d7c;
}

.compare-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 0.55rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.03);
}

.list-btn {
  background: #ffffff;
  border: 1px solid var(--color-sub);
  color: var(--color-main);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  padding: 0.4rem 0.9rem;
  border-radius: 2rem;
  transition: all 0.2s ease;
}

.clear-btn {
  background: #ebebeb;
  border: 1px solid var(--color-sub);
  color: var(--color-sub);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  padding: 0.4rem 0.9rem;
  border-radius: 2rem;
  transition: all 0.2s ease;
}

.list-btn:hover {
  background-color: var(--color-main);
  color: #ffffff;
}

.clear-btn:hover {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
  color: var(--color-main);
}
/* ----- 버튼 스타일 수정 끝 ----- */

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

.gpt-summary-btn-container {
  position: fixed;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
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
</style>
