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

    <!-- 확인 모달 -->
    <ConfirmationModal
      :show="showModal"
      :title="modalData.title"
      :message="modalData.message"
      @confirm="handleModalConfirm"
      @cancel="showModal = false"
    />

    <!-- 비교 플로팅 바 -->
    <CompareFloatingBar
      :compare-list="compareList"
      :has-pagination="false"
      @go-to-compare="handleGoToCompare"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import useCompareList from '@/composables/useCompareList';
import BackButton from '@/components/common/BackButton.vue';
import CompareTable from '@/components/products/compare/CompareTable.vue';
import CompareEmptyState from '@/components/products/compare/CompareEmptyState.vue';
import CompareErrorState from '@/components/products/compare/CompareErrorState.vue';
import ConfirmationModal from '@/components/products/common/ConfirmationModal.vue';
import CompareFloatingBar from '@/components/products/compare/CompareFloatingBar.vue';
import { compareProductsAPI } from '../../api/product';

// 라우터 및 컴포저블 초기화
const router = useRouter();
const route = useRoute();
const { compareList, removeFromCompareList, clearCompareList } = useCompareList();

// 상태 관리
const isLoading = ref(false);
const compareData = ref(null);
const error = ref(null);

// 모달 상태
const showModal = ref(false);
const modalData = ref({
  title: '',
  message: '',
  action: null,
  payload: null,
});

// 플로팅 바에서 비교하기 버튼 클릭 시 처리
const handleGoToCompare = () => {
  // 현재 이미 비교 페이지에 있으므로 스크롤을 맨 위로 올림
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

// 데이터 탐색 유틸리티 함수
const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj) return defaultValue;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current[part] === undefined || current[part] === null) {
      return defaultValue;
    }
    current = current[part];
  }

  return current;
};

// 최소 가입금액 조회
const getMinDepositForProduct = (productId) => {
  // 최상위 products 배열 확인
  if (compareData.value && compareData.value.products) {
    const product = compareData.value.products.find(
      (p) => String(p.productId) === String(productId) || String(p.product_id) === String(productId)
    );

    if (product) {
      const amount = product.minDepositAmount || product.min_deposit_amount || 0;
      if (amount) {
        return formatCurrency(amount);
      }
    }
  }

  // 기존 로직 유지
  const listProduct = compareList.value.find(
    (item) => String(item.productId) === String(productId)
  );

  if (listProduct) {
    const amount = listProduct.minDepositAmount || listProduct.min_deposit_amount || 0;
    if (amount) {
      return formatCurrency(amount);
    }
  }

  return '정보 없음';
};

// 최대 가입금액 조회
const getMaxDepositForProduct = (productId) => {
  // 최상위 products 배열 확인
  if (compareData.value && compareData.value.products) {
    const product = compareData.value.products.find(
      (p) => String(p.productId) === String(productId) || String(p.product_id) === String(productId)
    );

    if (product) {
      const amount = product.maxDepositAmount || product.max_deposit_amount || product.max_limit;
      if (amount === 0) return '제한 없음';
      if (amount) return formatCurrency(amount);
    }
  }

  // 기존 로직 유지
  const listProduct = compareList.value.find(
    (item) => String(item.productId) === String(productId)
  );

  if (listProduct) {
    const amount = listProduct.maxDepositAmount || listProduct.max_limit || 0;
    if (amount === 0) return '제한 없음';
    if (amount) return formatCurrency(amount);
  }

  return '정보 없음';
};

// 이자 유형 조회
const getInterestTypeForProduct = (productId, saveTrm, intrRateType) => {
  // 금리 유형 매핑
  const interestTypes = {
    S: '단리',
    M: '복리',
  };

  // 기본적으로 코드 값으로 반환 (매핑된 값이 없으면)
  let interestTypeName = interestTypes[intrRateType] || intrRateType;

  if (!compareData.value || !compareData.value.products) {
    // compareList에서 해당 상품 찾기
    const product = compareList.value.find(
      (item) =>
        String(item.productId) === String(productId) && String(item.saveTrm) === String(saveTrm)
    );

    // 해당 상품에서 금리 유형명 추출
    if (product && product.intrRateTypeNm) {
      return product.intrRateTypeNm;
    }

    return interestTypeName;
  }

  // compareData에서 해당 상품 정보 찾기
  const product = compareData.value.products.find(
    (p) => String(p.productId) === String(productId) || String(p.finPrdtCd) === String(productId)
  );

  // 해당 상품의 특정 기간 옵션 찾기
  if (product && product.options) {
    const option = product.options.find(
      (opt) =>
        String(opt.saveTrm) === String(saveTrm) && String(opt.intrRateType) === String(intrRateType)
    );

    if (option && option.intrRateTypeNm) {
      return option.intrRateTypeNm;
    }
  }

  return interestTypeName;
};

// 비교 요약 계산
const comparisonSummary = computed(() => {
  if (compareList.value.length < 2) return null;

  // 최고 금리 상품 찾기
  const bestRateProduct = [...compareList.value].sort((a, b) => {
    const rateA = parseFloat(a.intrRate2 || a.intrRate || 0);
    const rateB = parseFloat(b.intrRate2 || b.intrRate || 0);
    return rateB - rateA;
  })[0];

  // 최단 기간 상품 찾기
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

// API 호출 및 데이터 로드
const loadCompareData = async () => {
  if (compareList.value.length < 2) return;

  try {
    isLoading.value = true;
    error.value = null;

    // 상품 타입 (모두 같은 타입이라고 가정)
    const productType = compareList.value[0].productType;

    // 상품 ID 배열 생성
    const productIds = compareList.value.map((item) => item.productId);

    // 필요한 경우 saveTrm과 intrRateType도 전달 (첫 번째 항목 기준)
    const saveTrm = compareList.value[0].saveTrm;
    const intrRateType = compareList.value[0].intrRateType;

    // API 호출 (필요한 모든 파라미터 전달)
    const response = await compareProductsAPI(productIds, productType, saveTrm, intrRateType);

    // API 응답 저장
    compareData.value = response;

    // response에 products 배열이 있는지 확인
    if (response && response.products && Array.isArray(response.products)) {
      // 기존 compareList 항목을 업데이트
      compareList.value = compareList.value.map((item) => {
        // API 응답에서 해당 상품 찾기
        const apiProduct = response.products.find(
          (p) => String(p.product_id) === String(item.productId)
        );

        if (apiProduct) {
          return {
            ...item,
            // API 응답의 필드명을 그대로 사용
            preferential_tags: apiProduct.preferential_tags,
            join_member: apiProduct.join_member,
            // 기존 필드명도 호환성을 위해 유지
            preferentialTags: apiProduct.preferential_tags,
            joinMember: apiProduct.join_member,
            // 기타 필드도 추가
            minDepositAmount: apiProduct.minDepositAmount,
            maxDepositAmount: apiProduct.maxDepositAmount,
            etc_note: apiProduct.etc_note,
            options: apiProduct.options || [],
          };
        }
        return item;
      });

      // console.log('업데이트된 비교 목록:', compareList.value);
    }
  } catch (err) {
    console.error('비교 데이터 로드 오류:', err);
    error.value = '비교 정보를 불러오는 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

// 모달 확인 처리
const handleModalConfirm = () => {
  if (modalData.value.action && modalData.value.payload) {
    modalData.value.action(modalData.value.payload);
  } else if (modalData.value.action) {
    modalData.value.action();
  }
  showModal.value = false;
};

// 비교함에서 상품 제거
const handleRemoveItem = (productId, saveTrm, intrRateType = 'S') => {
  modalData.value = {
    title: '상품 제거',
    message: '비교함에서 해당 상품을 제거하시겠습니까?',
    action: removeAndReload,
    payload: { productId, saveTrm, intrRateType },
  };
  showModal.value = true;
};

// 비교함 비우기
const handleClearCompare = () => {
  modalData.value = {
    title: '비교함 비우기',
    message: '비교함의 모든 상품을 제거하시겠습니까?',
    action: clearAndReload,
    payload: null,
  };
  showModal.value = true;
};

// 상품 제거 후 데이터 리로드
const removeAndReload = (payload) => {
  const { productId, saveTrm, intrRateType } = payload;
  removeFromCompareList(productId, saveTrm, intrRateType);

  // 비교함이 비었거나 1개만 남은 경우
  if (compareList.value.length < 2) {
    compareData.value = null;
  } else {
    loadCompareData();
  }

  // 페이지 새로고침으로 UI 상태 강제 업데이트
  window.location.reload();
};

// 비교함 비우기 후 처리
const clearAndReload = () => {
  // 로컬 스토리지 직접 비우기
  try {
    localStorage.removeItem('finmate_compare_list');
  } catch (err) {
    console.error('로컬 스토리지 제거 실패:', err);
  }

  // compareList 컴포저블 함수 호출
  clearCompareList();

  // 상태 업데이트
  compareData.value = null;

  // 페이지 새로고침
  window.location.reload();
};

// 상품 목록으로 이동
const goToProductList = () => {
  // 비교 중인 상품이 있으면 첫 번째 상품의 카테고리를 사용
  if (compareList.value.length > 0) {
    const defaultCategory = compareList.value[0].productType || 'deposit';
    router.push(`/products/${defaultCategory}`);
    return;
  }

  // URL에서 productIds 쿼리 파라미터로 카테고리 유추
  const queryProductIds = route.query.productIds;
  if (queryProductIds) {
    // productType 쿼리 파라미터가 있으면 사용
    const productType = route.query.productType || 'deposit';
    router.push(`/products/${productType}`);
    return;
  }

  // 로컬 스토리지에서 마지막으로 방문한 카테고리 확인
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
  // 여기서는 예시로 은행 웹사이트로 이동
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
/* ==========================================================================
   1. 페이지 기본 레이아웃
   - 다른 페이지들과 동일한 배경색과 여백을 적용하여 통일성 유지
   ========================================================================== */
.compare-page {
  background-color: var(--color-bg-light);
  padding: 1rem 0;
  min-height: 100vh;
}

/* ==========================================================================
   2. 페이지 헤더
   ========================================================================== */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

/* ==========================================================================
   3. 비교함 관리 섹션
   - 현재 비교 중인 상품 개수와 '비교함 비우기' 버튼을 포함하는 카드
   ========================================================================== */
.compare-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem; /* 8px */
  margin-bottom: 1.25rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.03);
}

.compare-count {
  font-size: 0.9375rem; /* 15px */
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
  font-size: 0.875rem; /* 14px */
  cursor: pointer;
  text-decoration: none;
  padding: 0.25rem;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: var(--color-main);
  text-decoration: underline;
}

/* ==========================================================================
   4. 로딩 상태
   ========================================================================== */
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
