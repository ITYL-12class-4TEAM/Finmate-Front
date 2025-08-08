<template>
  <div class="product-detail-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>상품 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <BackButton title="이전으로" />
    </div>

    <div v-else-if="product" class="product-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <BackButton title="이전으로" />
      </div>

      <!-- 상품 기본 정보 카드 -->
      <ProductInfoCard
        :product="product"
        :bank-logo="getBankLogo()"
        :bank-initial="getBankInitial()"
        :category-name="getCategoryName()"
        :interest-type-name="getInterestTypeName()"
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
      <!-- 액션 섹션 -->
      <ActionButtons
        :is-in-compare-list="
          isInCompareList(
            product.product_id,
            selectedOption?.save_trm || selectedOption?.saveTrm,
            selectedOption?.intr_rate_type || selectedOption?.intrRateType || 'S'
          )
        "
        @add-to-compare="handleAddToCompare"
        @remove-from-compare="handleRemoveFromCompare"
        @join-product="joinProduct"
      />

      <!-- 하단 여백 (CompareFloatingBar가 가리는 콘텐츠 방지) -->
      <div v-if="compareList.length > 0" style="height: 4rem"></div>
    </div>

    <!-- 비교함 플로팅 바 -->
    <CompareFloatingBar :compare-list="compareList" @go-to-compare="goToCompare" />
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
// todo
// import PreferentialConditions from '@/components/products/PreferentialConditions.vue';
import ActionButtons from '@/components/products/ActionButtons.vue';
import CompareFloatingBar from '@/components/products/compare/CompareFloatingBar.vue';
import useCompareList from '@/composables/useCompareList';

const route = useRoute();
const router = useRouter();

// 상태 관리
const product = ref(null);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const selectedTerm = ref({ name: '', description: '' });

// 비교함 기능 (컴포저블 사용)
const { compareList, addToCompareList, removeFromCompareList, isInCompareList } = useCompareList();

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

    if (!productId) {
      console.warn('상품 ID가 없어 최근 본 상품으로 저장할 수 없습니다.');
      return;
    }

    await recentViewAPI.saveRecentView(productId, saveTrm, intrRateType, rsrvType);
    console.log('최근 본 상품 저장 성공');
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
    alert('상품 정보가 없어 비교함에 추가할 수 없습니다.');
    return;
  }

  // 로컬 스토리지 디버깅 출력
  console.log('현재 로컬 스토리지:', localStorage.getItem('finmate_compare_list'));

  console.log('비교함 추가 전 상품/옵션 정보:', {
    product: product.value,
    selectedOption: selectedOption.value,
    category: route.params.category,
  });

  const result = addToCompareList(product.value, selectedOption.value, route.params.category);

  alert(result.message);

  // 결과 확인을 위해 로컬 스토리지 다시 출력
  console.log('추가 후 로컬 스토리지:', localStorage.getItem('finmate_compare_list'));
};

const handleRemoveFromCompare = () => {
  if (!product.value || !selectedOption.value) return;

  const productId = product.value.product_id || product.value.productId;
  const saveTrm = selectedOption.value.save_trm || selectedOption.value.saveTrm;
  const intrRateType =
    selectedOption.value.intr_rate_type || selectedOption.value.intrRateType || 'S';

  const result = removeFromCompareList(productId, saveTrm, intrRateType);
  alert(result.message);
};

// 비교 페이지로 이동
const goToCompare = () => {
  router.push({
    path: '/products/compare',
    query: {
      // compareList에 있는 상품 ID들을 쿼리 파라미터로 전달
      productIds: compareList.value.map((item) => item.productId),
    },
  });
};

// todo 상품 유형 체크 함수
// const isDepositProduct = () => {
//   return route.params.category === 'deposit';
// };

// const isPensionProduct = () => {
//   return route.params.category === 'pension';
// };

// 카테고리 이름 가져오기
const getCategoryName = () => {
  const category = route.params.category;

  switch (category) {
    case 'deposit':
      return '정기예금';
    case 'pension':
      return '연금저축';
    case 'saving':
      return '적금';
    default:
      return '금융상품';
  }
};

// 금리 유형 이름 가져오기
const getInterestTypeName = () => {
  if (!product.value) return '';

  const interestTypeCode = product.value.intr_rate_type;

  if (interestTypeCode === 'S') {
    return '단리';
  } else if (interestTypeCode === 'M') {
    return '복리';
  } else {
    return '기본금리';
  }
};

// 은행 로고 URL 가져오기
const getBankLogo = () => {
  if (!product.value || !product.value.kor_co_nm) return null;

  const bankLogos = {
    국민은행: '/bank-logos/kb.png',
    신한은행: '/bank-logos/shinhan.png',
    우리은행: '/bank-logos/woori.png',
    하나은행: '/bank-logos/hana.png',
    농협은행: '/bank-logos/nh.png',
    기업은행: '/bank-logos/ibk.png',
  };

  return bankLogos[product.value.kor_co_nm] || null;
};

// 은행 이니셜 가져오기 (로고가 없을 경우)
const getBankInitial = () => {
  if (!product.value || !product.value.kor_co_nm) return '';
  return product.value.kor_co_nm.charAt(0);
};

// 상품 가입하기
const joinProduct = () => {
  if (!product.value) return;
  const joinUrl = product.value.external_link || getBankWebsite();
  window.open(joinUrl, '_blank');
};

// 은행 웹사이트 URL 가져오기
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

  // saveTrm과 intrRateType 모두 일치하는 옵션 찾기
  const matchedOption = options.find(
    (opt) =>
      String(opt.save_trm || opt.saveTrm) === String(saveTrm) &&
      (opt.intr_rate_type || opt.intrRateType) === intrRateType
  );

  // 일치하는 옵션이 없으면 saveTrm만 일치하는 옵션 찾기
  if (!matchedOption) {
    const saveTrmMatchOnly = options.find(
      (opt) => String(opt.save_trm || opt.saveTrm) === String(saveTrm)
    );

    if (saveTrmMatchOnly) {
      return saveTrmMatchOnly;
    }
  }

  // 일치하는 옵션이 있으면 반환, 없으면 첫 번째 옵션 반환
  return matchedOption || options[0];
});

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadProductDetail();
});
</script>

<style scoped>
/* ==========================================================================
   1. 페이지 기본 레이아웃 및 로딩/에러 상태 (유지)
   ========================================================================== */
.product-detail-page {
  background-color: var(--color-bg-light);
  padding: 1rem;
  padding-bottom: 6rem; /* 하단 플로팅 바를 위한 여백 확보 */
  min-height: 100vh;
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
   2. 페이지 헤더 (유지)
   ========================================================================== */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

/* ==========================================================================
   3. 정보 섹션 카드 (✨ 시각적 요소 추가)
   ========================================================================== */
.info-section {
  background-color: #ffffff;
  border-radius: 0.75rem; /* 12px */
  padding: 1.25rem 1rem; /* 20px 16px */
  margin-bottom: 1rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 0.0625rem solid var(--color-bg-light);
}

.info-content {
  font-size: 0.9375rem; /* 15px */
  color: var(--color-text);
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: keep-all;
}

/* ✨ '가입 대상'과 같이 간단한 정보는 강조된 텍스트로 표시 */
.info-content.highlight-text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-main);
  text-align: center;
  padding: 0.5rem 0;
}

/* ==========================================================================
   4. 우대 조건 리스트 스타일 (✨ 시각적 개선)
   ========================================================================== */
.conditions-list {
  padding-left: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* 항목 간 간격 */
}

.conditions-list li {
  position: relative;
  padding-left: 1.75rem; /* 아이콘을 위한 공간 확보 */
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

/* ✨ 내용이 없는 경우를 위한 스타일 */
.info-content.empty {
  color: var(--color-sub);
  text-align: center;
  padding: 1rem 0;
}
</style>
