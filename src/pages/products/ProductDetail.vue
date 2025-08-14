<template>
  <div class="product-detail-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>상품 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <BackButton />
    </div>

    <div v-else-if="product" class="product-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <BackButton />
        </div>
        <button class="favorite-btn" title="즐겨찾는 상품" @click="goToFavorites">
          <span class="favorite-icon">★</span>
          <span class="btn-text">즐겨찾기 이동</span>
        </button>
        <!-- GPT 상품 요약 버튼 (우측 상단) todo -->
        <!-- <button class="gpt-detail-btn" @click="handleGptDetail" title="GPT 상품 요약">
              <span class="gpt-icon">🤖</span>
              <span class="btn-text">AI 요약</span>
             </button> -->
      </div>

      <!-- 상품 기본 정보 카드 -->
      <ProductInfoCard
        :product="product"
        :bank-logo="getBankLogo()"
        :bank-initial="getBankInitial()"
        :category-name="getCategoryName()"
        :interest-type-name="getInterestTypeName()"
        :selected-option="selectedOption"
        :savings-type-code="route.query.rsrvType"
      />

      <!-- 금리 정보 섹션 -->
      <ProductRateInfo :selected-option="selectedOption" :format-rate="formatRate" />

      <!-- 상품 주요 정보 -->
      <ProductFeatures
        :product="product"
        :selected-option="selectedOption"
        :format-currency="formatCurrency"
        :format-date="formatDate"
      />

      <!-- 가입 대상 섹션 (추가) -->
      <div v-if="product.productDetail?.join_member" class="info-section">
        <h3 class="section-title">가입 대상</h3>
        <div class="info-content">
          {{ product.productDetail.join_member }}
        </div>
      </div>

      <!-- 우대 조건 섹션 (수정) -->
      <div
        v-if="product.productDetail?.spcl_cnd || parsedPreferentialConditions.length > 0"
        class="info-section"
      >
        <h3 class="section-title">우대 조건</h3>
        <div class="info-content">
          <!-- API에서 직접 제공하는 우대조건이 있으면 표시 -->
          <p v-if="product.productDetail?.spcl_cnd">
            {{ product.productDetail.spcl_cnd }}
          </p>
          <!-- 기존 파싱된 우대조건도 함께 표시 -->
          <ul v-if="parsedPreferentialConditions.length > 0" class="conditions-list">
            <li v-for="(condition, idx) in parsedPreferentialConditions" :key="idx">
              {{ condition }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 만기 후 금리 변동 -->
      <div v-if="product.productDetail?.etc_note" class="info-section">
        <h3 class="section-title">만기 해지 시 이자 지급 방식</h3>
        <div class="info-content">
          {{ product.productDetail.mtrt_int }}
        </div>
      </div>

      <!-- 비고 섹션 (추가) -->
      <div v-if="product.productDetail?.etc_note" class="info-section">
        <h3 class="section-title">비고</h3>
        <div class="info-content">
          {{ product.productDetail.etc_note }}
        </div>
      </div>

      <!-- 액션 섹션 -->
      <div class="action-section">
        <button
          v-if="isProductInCompareList"
          class="compare-btn in-list"
          @click="handleRemoveFromCompare"
        >
          비교함에서 제거
        </button>
        <button v-else class="compare-btn add-compare-btn" @click="handleAddToCompare">
          비교함에 추가
        </button>
        <button class="join-btn" @click="joinProduct">홈페이지 이동</button>
      </div>

      <!-- 하단 여백 (CompareFloatingBar가 가리는 콘텐츠 방지) -->
      <div v-if="currentCompareList.length > 0" style="height: 4rem"></div>
    </div>

    <!-- 비교함 플로팅 바 -->
    <CompareFloatingBar
      v-if="currentCompareList.length > 0"
      :compare-list="currentCompareList"
      :product-type="productType"
      @go-to-compare="goToCompare"
      @clear-compare-list="clearCurrentCompareList"
    />

    <!-- GPT 상품 요약 모달 -->
    <GptDetailModal
      :show="showGptDetailModal"
      :product="product"
      :selected-option="selectedOption"
      @close="showGptDetailModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProductDetailAPI } from '@/api/product';
import { recentViewAPI } from '../../api/recentView';
import BackButton from '@/components/common/BackButton.vue';
import ProductInfoCard from '@/components/products/detail/ProductInfoCard.vue';
import ProductRateInfo from '@/components/products/detail/ProductRateInfo.vue';
import ProductFeatures from '@/components/products/detail/ProductFeatures.vue';
import CompareFloatingBar from '@/components/products/compare/CompareFloatingBar.vue';
import GptDetailModal from '@/components/products/detail/GptDetailModal.vue';
import useCompareList from '@/composables/useCompareList';
import { useToast } from '@/composables/useToast';
// 수정된 부분: 경로를 정확하게 지정하고 명시적으로 가져오기
import { resolveCompanyLogo } from '@/constants/companyLogoMap';

const { showToast } = useToast();

const route = useRoute();
const router = useRouter();

// 상태 관리
const product = ref(null);
const loading = ref(true);
const error = ref(null);
const selectedTerm = ref({ name: '', description: '' });

// GPT 상품 요약 모달 상태
const showGptDetailModal = ref(false);

// 비교함 기능 (컴포저블 사용) - 상품군별 비교함으로 업데이트
const {
  depositCompareList,
  savingsCompareList,
  clearCompareList,
  addToCompareList,
  removeFromCompareList,
  isInCompareList,
} = useCompareList();

// 현재 상품 타입 결정 (URL 파라미터 기반)
const productType = computed(() => {
  // rsrvType 쿼리 파라미터가 있거나 category가 'savings'인 경우 적금으로 판단
  if (route.query.rsrvType || route.params.category === 'savings') {
    return 'savings';
  }
  // 그 외의 경우 예금 또는 route.params.category 값 사용
  return route.params.category || 'deposit';
});

// 현재 상품 타입에 맞는 비교함 리스트
const currentCompareList = computed(() => {
  return productType.value === 'deposit' ? depositCompareList.value : savingsCompareList.value;
});

// 현재 상품 타입에 맞는 비교함만 비우기
const clearCurrentCompareList = () => {
  clearCompareList(productType.value);
};

// 🎯 CompanyUrl 추출 함수 추가
const getCompanyUrl = () => {
  if (!product.value) return null;
  return (
    product.value.companyUrl ||
    product.value.company_url ||
    product.value.productDetail?.companyUrl ||
    null
  );
};

// 즐겨찾기 페이지로 이동하는 함수
const goToFavorites = () => {
  router.push('/mypage/favorites');
};

// 비교함에 상품이 있는지 여부를 계산하는 computed 속성 추가
const isProductInCompareList = computed(() => {
  if (!product.value || !selectedOption.value) return false;

  const productId = product.value.product_id || product.value.productId;
  const saveTrm = selectedOption.value.save_trm || selectedOption.value.saveTrm;
  const intrRateType =
    selectedOption.value.intr_rate_type || selectedOption.value.intrRateType || 'S';

  // 현재 상품이 적금인지 확인
  const isSavings = productType.value === 'savings';

  // 적금이면 rsrvType 값 추출, 아니면 null
  let rsrvType = null;
  if (isSavings) {
    rsrvType =
      selectedOption.value.rsrv_type ||
      selectedOption.value.rsrvType ||
      route.query.rsrvType ||
      'F';
  }

  // 비교함 포함 여부 확인 (상품 타입 명시적 전달)
  return isInCompareList(productId, saveTrm, intrRateType, rsrvType, productType.value);
});

// GPT 상품 요약 모달 열기
const handleGptDetail = () => {
  showGptDetailModal.value = true;
};

// 상품 정보 로드
const loadProductDetail = async () => {
  try {
    loading.value = true;
    error.value = null;

    const category = route.params.category;
    const productId = route.params.id;
    const saveTrm = route.query.saveTrm;
    const intrRateType = route.query.intrRateType;

    const response = await getProductDetailAPI(category, productId, {
      saveTrm,
      intrRateType,
    });

    if (response) {
      product.value = response;
      product.value.is_digital_only =
        product.value.join_way === 'online' || product.value.join_way === '인터넷';

      // 상품 정보 로드 성공 후 최근 본 상품으로 저장
      saveAsRecentViewed();
    } else {
      error.value = '상품 정보를 찾을 수 없습니다.';
    }
  } catch (err) {
    console.error('상품 상세 정보 로드 오류:', err);
    error.value = '상품 정보를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

// 최근 본 상품으로 저장하는 함수
const saveAsRecentViewed = async () => {
  try {
    const productId = route.params.id;
    const saveTrm = route.query.saveTrm;
    const intrRateType = route.query.intrRateType;
    // rsrvType은 route.query에서 가져오거나, API 응답에서 추출
    let rsrvType = route.query.rsrvType;

    // rsrvType이 없을 경우 상품 데이터에서 추출 시도
    if (
      !rsrvType &&
      product.value &&
      product.value.productDetail &&
      product.value.productDetail.options
    ) {
      // 선택된 옵션에서 rsrvType 값 추출 시도
      const option = selectedOption.value;
      if (option) {
        rsrvType = option.rsrv_type || option.rsrvType;
      }
    }

    // 적금 상품인데 rsrvType이 없으면 기본값 'F' 사용
    if (route.params.category === 'savings' && !rsrvType) {
      rsrvType = 'F';
    }

    if (!productId) {
      console.warn('상품 ID가 없어 최근 본 상품으로 저장할 수 없습니다.');
      return;
    }

    await recentViewAPI.saveRecentView(productId, saveTrm, intrRateType, rsrvType);
  } catch (error) {
    console.error('최근 본 상품 저장 실패:', error);
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
    if (condition.trim() === '') continue;

    const cleanCondition = condition.replace(/^\d+[\.\)]\s*|\-\s*|\*\s*/, '').trim();

    if (cleanCondition) {
      parsedConditions.push(cleanCondition);
    }
  }

  return parsedConditions;
});

// 비교함에 추가 핸들러
const handleAddToCompare = () => {
  if (!product.value || !selectedOption.value) {
    return;
  }

  // 옵션 객체 복사 (원본 변경 방지)
  const option = { ...selectedOption.value };

  // 적금이고 rsrvType이 없으면 기본값 설정
  if (productType.value === 'savings' && !option.rsrv_type && !option.rsrvType) {
    option.rsrv_type = route.query.rsrvType || 'F';
    option.rsrv_type_nm = option.rsrv_type === 'S' ? '정액적립식' : '자유적립식';
  }

  // 상품 타입 명시적으로 전달
  addToCompareList(product.value, option, productType.value);
};

// 비교함에서 제거 핸들러
const handleRemoveFromCompare = () => {
  if (!product.value || !selectedOption.value) return;

  const productId = product.value.product_id || product.value.productId;
  const saveTrm = selectedOption.value.save_trm || selectedOption.value.saveTrm;
  const intrRateType =
    selectedOption.value.intr_rate_type || selectedOption.value.intrRateType || 'S';

  // 적금이면 rsrvType 값 추출, 아니면 null
  let rsrvType = null;
  if (productType.value === 'savings') {
    rsrvType =
      selectedOption.value.rsrv_type ||
      selectedOption.value.rsrvType ||
      route.query.rsrvType ||
      'F';
  }

  // 상품 타입 명시적으로 전달
  removeFromCompareList(productId, saveTrm, intrRateType, rsrvType, productType.value);
};

// 비교 페이지로 이동
const goToCompare = () => {
  if (currentCompareList.value.length < 2) {
    showToast('2개 이상의 상품을 선택해주세요.', 'warning');
    return;
  }

  router.push({
    path: '/products/compare',
    query: {
      // 현재 상품 타입을 쿼리 파라미터로 전달
      type: productType.value,
    },
  });
};

// 카테고리 이름 가져오기
const getCategoryName = () => {
  const category = route.params.category;

  switch (category) {
    case 'deposit':
      return '정기예금';
    case 'pension':
      return '연금저축';
    case 'savings':
      return '적금';
    default:
      return '금융상품';
  }
};

// 금리 유형 이름 가져오기
const getInterestTypeName = () => {
  if (!product.value) return '';

  const interestTypeCode = selectedOption.value.intr_rate_type || selectedOption.value.intrRateType;

  if (interestTypeCode === 'S') {
    return '단리';
  } else if (interestTypeCode === 'M') {
    return '복리';
  } else {
    return '기본금리';
  }
};

// 은행 로고 URL 가져오기 - 수정된 부분: resolveCompanyLogo 함수 직접 사용
const getBankLogo = () => {
  // resolveCompanyLogo 함수를 사용하여 로고 파일명 가져오기
  const logoFile = resolveCompanyLogo(product.value.korCoNm);
  // 정적 경로 사용 - public 폴더 기준
  return `/images/companies/${logoFile}`;
};

// 은행 이니셜 가져오기 (로고가 없을 경우)
const getBankInitial = () => {
  if (!product.value || !product.value.kor_co_nm) return '';
  return product.value.kor_co_nm.charAt(0);
};

// 🎯 상품 가입하기 - CompanyUrl 활용하도록 수정
const joinProduct = () => {
  if (!product.value) return;

  const companyUrl = getCompanyUrl();

  if (companyUrl && companyUrl.trim() !== '') {
    // companyUrl이 있으면 새 창으로 해당 금융사 홈페이지 열기
    window.open(companyUrl, '_blank', 'noopener,noreferrer');
  } else {
    // companyUrl이 없으면 기존 로직 사용 (external_link 또는 은행 웹사이트)
    const fallbackUrl = product.value.external_link || getBankWebsite();
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }
};

// 은행 웹사이트 URL 가져오기 (fallback용)
const getBankWebsite = () => {
  if (!product.value || !product.value.kor_co_nm) return '#';

  const bankWebsites = {
    국민은행: 'https://www.kbstar.com',
    신한은행: 'https://www.shinhan.com',
    우리은행: 'https://www.wooribank.com',
    하나은행: 'https://www.kebhana.com',
    농협은행: 'https://banking.nonghyup.com',
    기업은행: 'https://www.ibk.co.kr',
  };

  return (
    bankWebsites[product.value.kor_co_nm] ||
    `https://www.google.com/search?q=${encodeURIComponent(product.value.kor_co_nm)}`
  );
};

// 날짜 포맷팅 (YYYYMMDD → YYYY.MM.DD)
const formatDate = (dateStr) => {
  if (!dateStr) return '';

  if (typeof dateStr === 'string') {
    if (/^\d{8}$/.test(dateStr)) {
      return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    }

    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.substring(0, 10).replace(/-/g, '.');
    }
  }

  if (dateStr instanceof Date) {
    const year = dateStr.getFullYear();
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const day = String(dateStr.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  return dateStr;
};

// 금액 포맷팅
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '홈페이지 직접 참고';
  return new Intl.NumberFormat('ko-KR').format(value) + '원';
};

// 금리 포맷팅
const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

// 선택된 옵션 계산 (수정)
const selectedOption = computed(() => {
  if (!product.value || !product.value.productDetail) {
    return null;
  }

  const options = product.value.productDetail.options;

  if (!options || !Array.isArray(options)) {
    return null;
  }

  const saveTrm = route.query.saveTrm;
  const intrRateType = route.query.intrRateType;
  const rsrvType = route.query.rsrvType;

  // 1. 모든 조건이 일치하는 옵션 찾기 (saveTrm + intrRateType + rsrvType)
  if (rsrvType) {
    const fullMatch = options.find(
      (opt) =>
        String(opt.save_trm || opt.saveTrm) === String(saveTrm) &&
        (opt.intr_rate_type || opt.intrRateType) === intrRateType &&
        (opt.rsrv_type || opt.rsrvType) === rsrvType
    );

    if (fullMatch) return fullMatch;
  }

  // 2. saveTrm과 intrRateType 일치하는 옵션 찾기
  const matchedOption = options.find(
    (opt) =>
      String(opt.save_trm || opt.saveTrm) === String(saveTrm) &&
      (opt.intr_rate_type || opt.intrRateType) === intrRateType
  );

  if (matchedOption) return matchedOption;

  // 3. saveTrm만 일치하는 옵션 찾기
  const saveTrmMatchOnly = options.find(
    (opt) => String(opt.save_trm || opt.saveTrm) === String(saveTrm)
  );

  if (saveTrmMatchOnly) return saveTrmMatchOnly;

  // 4. 일치하는 옵션이 없으면 첫 번째 옵션 반환
  return options[0];
});

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadProductDetail();
});
</script>

<style scoped>
/* ==========================================================================
 1. 페이지 기본 레이아웃 및 로딩/에러 상태
========================================================================== */
.product-detail-page {
  /* [수정] 전체 페이지에 box-sizing 적용 */
  box-sizing: border-box;
  padding: 0 0rem; /* 화면 좌우에 일관된 여백 적용 */
  padding-bottom: 6rem;
  min-height: 100vh;
  margin: 0 auto; /* 페이지 콘텐츠 중앙 정렬 */
  max-width: 480px; /* 모바일 화면 최대 너비 설정 (선택 사항) */
}

.product-container {
  /* [수정] 고정 너비를 제거하고 유연한 너비로 변경 */
  width: 100%;
}

.loading-container,
.error-container {
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

.error-container p {
  margin-bottom: 1.5rem;
  font-size: 1rem;
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

/* ==========================================================================
2. 페이지 헤더
========================================================================== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  width: 100%; /* [추가] 헤더가 컨테이너 너비에 맞게 설정 */
}

.header-left {
  display: flex;
  align-items: center;
  /* [수정] 고정 gap 제거 */
}

.favorite-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #fff;
  color: var(--color-main);
  border: 1px solid var(--color-light);
  border-radius: 1.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  background-color: var(--color-bg-light);
}

.favorite-btn:active {
  transform: translateY(1px);
}

.favorite-btn .favorite-icon {
  color: #ffd700;
  font-size: 1rem;
}

.favorite-btn .btn-text {
  white-space: nowrap;
}

.gpt-detail-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
  border: none;
  border-radius: 1.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.3);
  transition: all 0.3s ease;
}

.gpt-detail-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 0.375rem 1rem rgba(45, 51, 107, 0.4);
}

.gpt-detail-btn:active {
  transform: translateY(0);
}

.gpt-detail-btn .gpt-icon {
  font-size: 1rem;
  animation: pulse 2s infinite;
}

.gpt-detail-btn .btn-text {
  white-space: nowrap;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* ==========================================================================
3. 정보 섹션 카드
========================================================================== */
.info-section {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.25rem 1rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
  /* [추가] box-sizing 적용 */
  box-sizing: border-box;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-bg-light);
}

.info-content {
  font-size: 0.9375rem;
  color: var(--color-text);
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: keep-all;
}

.info-content.highlight-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-main);
  text-align: center;
  padding: 0.5rem 0;
}

/* ==========================================================================
4. 우대 조건 리스트 스타일
========================================================================== */
.conditions-list {
  padding-left: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.conditions-list li {
  position: relative;
  padding-left: 1.75rem;
  font-size: 0.9375rem;
}

.conditions-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: var(--color-main);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
}

.info-content.empty {
  color: var(--color-sub);
  text-align: center;
  padding: 1rem 0;
}

/* ==========================================================================
   5. 액션 섹션 스타일
   ========================================================================== */
.action-section {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem; /* [수정] 상단 여백 추가 */
  margin-bottom: 1rem;
  width: 100%;
}

.compare-btn,
.join-btn {
  flex: 1;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease-in-out;
}

.add-compare-btn {
  background: #ffffff;
  color: var(--color-main);
  border: 1px solid var(--color-light);
}

.compare-btn.in-list {
  background: var(--color-main);
  color: #fff;
  border: 1px solid var(--color-main);
}

.join-btn {
  background: var(--color-main);
  color: #fff;
}

.join-btn:hover {
  filter: brightness(110%);
}
</style>
