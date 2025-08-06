<template>
  <div class="compare-page">
    <!-- 헤더 -->
    <div class="page-header">
      <BackButton title="상품 목록으로" />
      <h1 class="page-title">금융 상품 비교</h1>
    </div>

    <!-- 비교함이 비어있는 경우 -->
    <div v-if="compareList.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>비교함이 비어있습니다.</p>
      <p class="empty-subtitle">상품 목록에서 비교할 상품을 추가해 주세요.</p>
      <button class="primary-btn" @click="goToProductList">
        상품 목록으로 이동
      </button>
    </div>

    <!-- 비교 콘텐츠 -->
    <div v-else class="compare-content">
      <!-- 비교함 관리 -->
      <div class="compare-actions">
        <div class="compare-count">{{ compareList.length }}/4 상품 비교 중</div>
        <button class="clear-btn" @click="handleClearCompare">
          비교함 비우기
        </button>
      </div>

      <!-- 비교 테이블 -->
      <div class="compare-table-container">
        <table class="compare-table">
          <thead>
            <tr>
              <th class="feature-cell">구분</th>
              <th
                v-for="item in compareList"
                :key="item.productId + item.saveTrm"
                class="product-cell"
              >
                <div class="product-header">
                  <div class="bank-name">{{ item.korCoNm }}</div>
                  <div class="product-name">
                    {{ item.productName }}
                  </div>
                  <button
                    class="remove-btn"
                    @click="handleRemoveItem(item.productId, item.saveTrm, item.intrRateType || 'S')"
                  >
                    ×
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="feature-cell">기본 금리</td>
              <td
                v-for="item in compareList"
                :key="`rate-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                <div class="highlight">{{ formatRate(item.intrRate) }}</div>
              </td>
            </tr>
            <tr>
              <td class="feature-cell">우대 금리</td>
              <td
                v-for="item in compareList"
                :key="`rate2-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                <div class="highlight special">
                  {{ formatRate(item.intrRate2) }}
                </div>
              </td>
            </tr>
            <tr>
              <td class="feature-cell">가입 기간</td>
              <td
                v-for="item in compareList"
                :key="`term-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                {{ item.saveTrm }}개월
              </td>
            </tr>
            <tr v-if="compareData && compareData.products">
              <td class="feature-cell">최소 가입금액</td>
              <td
                v-for="item in compareList"
                :key="`min-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                {{ getMinDepositForProduct(item.productId) }}
              </td>
            </tr>
            <tr>
              <td class="feature-cell">금리 유형</td>
              <td
                v-for="item in compareList"
                :key="`int-type-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                {{
                  getInterestTypeForProduct(
                    item.productId,
                    item.saveTrm,
                    item.intrRateType || 'S'
                  )
                }}
              </td>
            </tr>
            <tr>
              <td class="feature-cell">상품 유형</td>
              <td
                v-for="item in compareList"
                :key="`type-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                {{ getProductTypeName(item.productType) }}
              </td>
            </tr>
            <tr>
              <td class="feature-cell">상세 보기</td>
              <td
                v-for="item in compareList"
                :key="`action-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                <div class="action-buttons">
                  <button
                    class="detail-btn"
                    @click="
                      goToDetail(item.productId, item.productType, item.saveTrm)
                    "
                  >
                    상세 보기
                  </button>
                  <button class="join-btn" @click="handleJoinProduct(item)">
                    가입하기
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- API 비교 결과 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>상품 비교 정보를 불러오는 중입니다...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">!</div>
        <p>{{ error }}</p>
        <p class="error-subtitle">
          API 연결에 실패했지만, 기본 비교 정보를 확인할 수 있습니다.
        </p>
        <div v-if="comparisonSummary" class="summary-cards">
          <div class="summary-card">
            <div class="summary-title">최고 금리 상품</div>
            <div class="summary-bank">
              {{ comparisonSummary.bestRate.bankName }}
            </div>
            <div class="summary-product">
              {{ comparisonSummary.bestRate.productName }}
            </div>
            <div class="summary-value">
              {{ formatRate(comparisonSummary.bestRate.rate) }}
            </div>
          </div>
          <div class="summary-card">
            <div class="summary-title">최단 가입 기간</div>
            <div class="summary-bank">
              {{ comparisonSummary.shortestTerm.bankName }}
            </div>
            <div class="summary-product">
              {{ comparisonSummary.shortestTerm.productName }}
            </div>
            <div class="summary-value">
              {{ comparisonSummary.shortestTerm.term }}개월
            </div>
          </div>
        </div>
        <button class="retry-btn" @click="loadCompareData">다시 시도</button>
      </div>

      <div v-else-if="compareData" class="compare-summary">
        <!-- 요약 정보 -->
        <div class="comparison-summary">
          <div class="summary-icon">💡</div>
          <p>금융 상품 비교 결과 요약</p>
        </div>

        <!-- 결과 카드 목록 (동적으로 생성) -->
        <div class="result-cards">
          <template v-for="type in cardTypes" :key="type">
            <ResultCard
              v-if="getProductData(type)"
              :title="getProductData(type).title || ''"
              :bankName="getProductData(type).bankName || ''"
              :productName="getProductData(type).productName || ''"
              :value="getProductData(type).value || ''"
              :highlight="getProductData(type).highlight || false"
            />
          </template>
        </div>
      </div>
    </div>

    <!-- 확인 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalData.title }}</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>{{ modalData.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showModal = false">취소</button>
          <button class="confirm-btn" @click="handleModalConfirm">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useCompareList from '@/composables/useCompareList';
import BackButton from '@/components/common/BackButton.vue';
import { compareProductsAPI } from '@/api/product';
import ResultCard from '../../components/products/compare/ResultCard.vue';

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

// 데이터 탐색 유틸리티 함수 (중첩된 객체에서 안전하게 값 가져오기)
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

// 비교 데이터에서 경로 탐색 (다양한 경로 시도)
const findInCompareData = (dataKey) => {
  if (!compareData.value) return null;

  // 가능한 경로들
  const possiblePaths = [
    dataKey,
    `summary.${dataKey}`,
    `comparisonData.${dataKey}`,
    `comparisonData.summary.${dataKey}`,
  ];

  // 첫 번째 유효한 경로 찾기
  for (const path of possiblePaths) {
    const value = getNestedValue(compareData.value, path);
    if (value !== null) return value;
  }

  return null;
};

// 컴페어 리스트에서 상품 찾기
const findProductInCompareList = (productId) => {
  return compareList.value.find(
    (item) =>
      String(item.productId) === String(productId) ||
      String(item.finPrdtCd) === String(productId) ||
      String(item.fin_prdt_cd) === String(productId)
  );
};

// 상품 카드 데이터 생성 함수
const getProductData = (type) => {
  // 카드 타입 설정
  const cardTypes = {
    highestRate: {
      key: 'highestRateProduct',
      title: '최고 금리',
      valueFormatter: (product) =>
        formatRate(product.value || product.intrRate2 || 0),
      valueSuffix: '',
      highlight: true,
    },
    mostJoinWays: {
      key: 'mostJoinWaysProduct',
      title: '다양한 가입 방법',
      valueFormatter: (product) => String(product.value || 3),
      valueSuffix: '가지 가입 방법',
    },
    widestTarget: {
      key: 'widestTargetProduct',
      title: '폭넓은 가입 대상',
      valueFormatter: (product) => product.value || '제한 없음',
      valueSuffix: '',
    },
    shortestTerm: {
      key: 'shortestTermProduct',
      title: '짧은 가입 기간',
      valueFormatter: (product) =>
        String(product.value || product.saveTrm || 6),
      valueSuffix: '개월',
    },
    lowestDeposit: {
      key: 'lowestDepositProduct',
      title: '낮은 가입금액',
      valueFormatter: (product) =>
        formatCurrency(product.value || product.minDeposit || 0),
      valueSuffix: '',
    },
  };

  // 설정에서 카드 타입 정보 가져오기
  const cardType = cardTypes[type];
  if (!cardType) return null;

  // 데이터에서 해당 상품 찾기
  const product = findInCompareData(cardType.key);
  if (!product) {
    // 비교함에서 대체 데이터 찾기
    if (type === 'shortestTerm' && compareList.value.length > 0) {
      // 가장 짧은 기간 상품 찾기
      const shortestProduct = [...compareList.value].sort((a, b) => {
        const termA = parseInt(a.saveTrm || 12);
        const termB = parseInt(b.saveTrm || 12);
        return termA - termB;
      })[0];

      return {
        title: cardType.title,
        bankName: shortestProduct.korCoNm || '',
        productName: shortestProduct.productName || '',
        value: `${shortestProduct.saveTrm || 6}${cardType.valueSuffix}`,
        highlight: cardType.highlight,
      };
    }

    if (type === 'lowestDeposit' && compareList.value.length > 0) {
      // 가장 낮은 가입금액 상품 찾기
      const lowestProduct = [...compareList.value].sort((a, b) => {
        const amountA = parseInt(a.minDeposit || 1000000);
        const amountB = parseInt(b.minDeposit || 1000000);
        return amountA - amountB;
      })[0];

      return {
        title: cardType.title,
        bankName: lowestProduct.korCoNm || '',
        productName: lowestProduct.productName || '',
        value: formatCurrency(lowestProduct.minDeposit || 0),
        highlight: cardType.highlight,
      };
    }

    // 다른 대체 로직이 없으면 null 반환
    return null;
  }

  // 상품 ID로 compareList에서 추가 정보 찾기
  const productId =
    product.finPrdtCd || product.fin_prdt_cd || product.productId;
  const compareItem = findProductInCompareList(productId);

  // 반환할 정보 구성
  return {
    title: cardType.title,
    bankName:
      product.korCoNm ||
      product.bankName ||
      (compareItem ? compareItem.korCoNm : ''),
    productName:
      product.productName ||
      product.finPrdtNm ||
      (compareItem ? compareItem.productName : ''),
    value: `${cardType.valueFormatter(product)}${cardType.valueSuffix}`,
    highlight: cardType.highlight,
  };
};

// 상품 ID로 최소 가입금액 조회
const getMinDepositForProduct = (productId) => {
  // compareData에서 상품 정보 찾기
  if (compareData.value && compareData.value.products) {
    const product = compareData.value.products.find(
      (p) => 
        String(p.productId) === String(productId) ||
        String(p.finPrdtCd) === String(productId) ||
        String(p.product_id) === String(productId)
    );
    
    // API 응답에서 minDepositAmount 필드 확인
    if (product && product.minDepositAmount) {
      return formatCurrency(product.minDepositAmount);
    }
    
    // 다른 가능한 필드명도 확인
    if (product) {
      const amount = product.minDepositAmount || product.minDeposit || product.min_deposit;
      if (amount) {
        return formatCurrency(amount);
      }
    }
  }
  
  // compareData에 없으면 compareList에서 찾기
  const listProduct = compareList.value.find(
    (item) => String(item.productId) === String(productId)
  );
  
  if (listProduct) {
    // 여러 가능한 필드명 확인
    const amount = listProduct.minDepositAmount || listProduct.minDeposit || listProduct.min_deposit;
    if (amount) {
      return formatCurrency(amount);
    }
    
    // productDetail 내부 확인
    if (listProduct.productDetail) {
      const detailAmount = 
        listProduct.productDetail.minDepositAmount || 
        listProduct.productDetail.minDeposit || 
        listProduct.productDetail.min_deposit;
      
      if (detailAmount) {
        return formatCurrency(detailAmount);
      }
    }
  }
  
  return '정보 없음';
};

// 상품 ID, 기간, 금리 유형으로 이자 유형 이름 조회
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
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm)
    );

    // 해당 상품에서 금리 유형명 추출
    if (product && product.intrRateTypeNm) {
      return product.intrRateTypeNm;
    }

    return interestTypeName;
  }

  // compareData에서 해당 상품 정보 찾기
  const product = compareData.value.products.find(
    (p) =>
      String(p.productId) === String(productId) ||
      String(p.finPrdtCd) === String(productId)
  );

  // 해당 상품의 특정 기간 옵션 찾기
  if (product && product.options) {
    const option = product.options.find(
      (opt) =>
        String(opt.saveTrm) === String(saveTrm) &&
        String(opt.intrRateType) === String(intrRateType)
    );

    if (option && option.intrRateTypeNm) {
      return option.intrRateTypeNm;
    }
  }

  return interestTypeName;
};

// comparisonSummary 계산 (API 응답 없을 때 대체 데이터)
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

// 카드 목록 생성 (동적)
const cardTypes = computed(() => {
  // 기본 카드 타입
  const types = ['highestRate', 'mostJoinWays', 'widestTarget'];

  // 기간 정보가 있으면 추가
  if (compareList.value.some((item) => item.saveTrm)) {
    types.push('shortestTerm');
  }

  // 가입금액 정보가 있으면 추가
  if (compareList.value.some((item) => item.minDeposit)) {
    types.push('lowestDeposit');
  }

  return types;
});

// 페이지 로드 시 API 호출
const loadCompareData = async () => {
  if (compareList.value.length < 2) return;

  try {
    isLoading.value = true;
    error.value = null;

    // 상품 ID 목록 추출
    const productIds = compareList.value.map((item) => item.productId);

    // 상품 타입 (모두 같은 타입이라고 가정)
    const productType = compareList.value[0].productType;

    console.log('비교 API 호출 정보:', {
      productIds,
      productType,
      compareListItems: compareList.value,
    });

    // API 호출 - productIds 배열을 그대로 전달
    const response = await compareProductsAPI(productIds, productType);
    compareData.value = response;

    console.log('비교 데이터 로드 완료:', compareData.value);
  } catch (err) {
    console.error('상품 비교 데이터 로드 오류:', err);
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
  console.log('clearAndReload 호출됨');

  // 1. 로컬 스토리지 직접 비우기 (벨트 앤 서스펜더 접근법)
  try {
    localStorage.removeItem('finmate_compare_list');
    console.log('로컬 스토리지에서 비교함 데이터 직접 제거됨');
  } catch (err) {
    console.error('로컬 스토리지 제거 실패:', err);
  }

  // 2. compareList 컴포저블 함수 호출
  const result = clearCompareList();
  console.log('clearCompareList 결과:', result);

  // 3. 상태 업데이트
  compareData.value = null;

  // 4. 페이지 새로고침 (가장 확실한 방법)
  console.log('페이지를 새로고침하여 UI 업데이트');
  window.location.reload();
};

// 상품 목록으로 이동
const goToProductList = () => {
  // 1. 비교 중인 상품이 있으면 첫 번째 상품의 카테고리를 사용
  if (compareList.value.length > 0) {
    const defaultCategory = compareList.value[0].productType || 'deposit';
    router.push(`/products/${defaultCategory}`);
    return;
  }

  // 2. URL에서 productIds 쿼리 파라미터로 카테고리 유추
  const queryProductIds = route.query.productIds;
  if (queryProductIds) {
    // productType 쿼리 파라미터가 있으면 사용
    const productType = route.query.productType || 'deposit';
    router.push(`/products/${productType}`);
    return;
  }

  // 3. 로컬 스토리지에서 마지막으로 방문한 카테고리 확인
  const lastCategory =
    localStorage.getItem('lastVisitedCategory') || 'deposit';
  router.push(`/products/${lastCategory}`);
};

// 현재 상품 유형 가져오기
const getProductType = () => {
  return compareList.value.length > 0
    ? compareList.value[0].productType
    : 'deposit';
};

// 상품 객체에서 상품 유형 추출
const getProductTypeFromProduct = (product) => {
  // 예금/적금 상품인지 확인
  if (product.intr_rate_type || product.intrRateType || product.baseRate) {
    return 'deposit';
  }

  // 연금 상품인지 확인
  if (product.pensionStartAge || product.pnsnStrtAge) {
    return 'pension';
  }

  // 기본값 반환
  return getProductType();
};

// 상품 유형 이름 변환
const getProductTypeName = (type) => {
  const typeNames = {
    deposit: '정기예금',
    pension: '연금저축',
    saving: '적금',
  };

  return typeNames[type] || '금융상품';
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
    `https://www.google.com/search?q=${encodeURIComponent(
      item.korCoNm + ' ' + item.productName
    )}`;

  window.open(url, '_blank');
};

// 금액 포맷팅
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '정보 없음';
  return new Intl.NumberFormat('ko-KR').format(value) + '원';
};

// 금리 포맷팅
const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

// 페이지 로드 시 데이터 로드
onMounted(() => {
  if (compareList.value.length >= 2) {
    loadCompareData();
  }
  
  // 디버깅을 위해 함수가 정의되었는지 확인
  console.log('함수 정의 확인:', {
    handleClearCompare: typeof handleClearCompare === 'function',
    removeAndReload: typeof removeAndReload === 'function',
    clearAndReload: typeof clearAndReload === 'function'
  });
});
</script>

<style scoped>
.compare-page {
  max-width: 375px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Noto Sans KR', sans-serif;
  color: var(--color-text);
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

/* 비어있는 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: var(--color-text);
}

.empty-subtitle {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.primary-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

/* 비교 콘텐츠 */
.compare-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.compare-count {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-sub);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
}

/* 비교 테이블 */
.compare-table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 100%;
}

.compare-table th,
.compare-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--color-bg-light);
}

.feature-cell {
  background-color: var(--color-bg-light);
  font-weight: 500;
  color: var(--color-main);
  text-align: left;
  min-width: 5rem;
  position: sticky;
  left: 0;
  z-index: 1;
}

.product-cell {
  min-width: 8rem;
}

.product-header {
  position: relative;
  padding-right: 1.5rem;
}

.bank-name {
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-bottom: 0.25rem;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-main);
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: var(--color-sub);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.highlight {
  font-weight: 500;
  font-size: 1rem;
  color: var(--color-main);
}

.highlight.special {
  color: #e91e63;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-btn,
.join-btn {
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}

.detail-btn {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  border: 1px solid var(--color-light);
}

.join-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
}

/* 비교 상세 정보 */
.compare-details {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  margin: 0 0 1rem 0;
  color: var(--color-main);
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
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

/* 오류 상태 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  text-align: center;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
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

.error-subtitle {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 20rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-bg-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--color-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-sub);
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem 1rem;
}

.modal-body p {
  margin: 0;
  color: var(--color-text);
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background-color: var(--color-bg-light);
  color: var(--color-text);
  border: none;
}

.confirm-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
}

/* 비교 테이블 (API 응답) */
.comparison-table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 100%;
}

.comparison-table th,
.comparison-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--color-bg-light);
}

.feature-name {
  background-color: var(--color-bg-light);
  font-weight: 500;
  color: var(--color-main);
  text-align: left;
  min-width: 5rem;
  position: sticky;
  left: 0;
  z-index: 1;
}

.product-column {
  min-width: 8rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.product-name-cell {
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-top: 0.25rem;
}

.highlight-cell {
  position: relative;
  font-weight: 600;
  color: var(--color-main);
}

.highlight-cell::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0.75rem 0.75rem 0;
  border-color: transparent var(--color-main) transparent transparent;
}

.detail-link {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
}

/* 비교 요약 */
.compare-summary {
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.comparison-summary {
  background-color: #e9f7ff;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.summary-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.comparison-summary p {
  margin: 0;
  color: var(--color-main);
  line-height: 1.5;
}

/* 요약 카드 스타일 */
.result-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 100%;
}

.result-card {
  background-color: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
  position: relative;
  border-left: 4px solid var(--color-main);
}

.highlight-card {
  border-left: 4px solid #e91e63;
}

.card-header {
  background-color: var(--color-bg-light);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.card-badge {
  background-color: var(--color-main);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.highlight-card .card-badge {
  background-color: #e91e63;
}

.card-bank {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.card-body {
  padding: 1rem;
}

.rate-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e91e63;
  margin-top: 0.5rem;
}

.value-info {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin-top: 0.5rem;
}

.summary-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
  width: 100%;
  max-width: 20rem;
}

.summary-card {
  background-color: var(--color-bg-light);
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid var(--color-main);
}

.summary-title {
  font-weight: 500;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.summary-bank {
  font-size: 0.75rem;
  color: var(--color-sub);
}

.summary-product {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
}

/* 모바일에서 가로 스크롤 용이하게 */
@media (max-width: 767px) {
  .compare-table-container {
    margin-left: -1rem;
    margin-right: -1rem;
    width: calc(100% + 2rem);
    border-radius: 0;
  }

  .compare-table {
    padding: 0 1rem;
  }
}

.no-products-message {
  padding: 1rem;
  color: var(--color-sub);
  text-align: center;
}

.no-products-message pre {
  text-align: left;
  overflow: auto;
  background-color: #f5f5f5;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-top: 1rem;
}
</style>
