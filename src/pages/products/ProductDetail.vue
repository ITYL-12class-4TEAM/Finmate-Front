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
      <div class="page-header">
        <div class="header-left">
          <BackButton />
        </div>
        <button class="favorite-btn" title="즐겨찾는 상품" @click="goToFavorites">
          <span class="favorite-icon">★</span>
          <span class="btn-text">즐겨찾기 이동</span>
        </button>
        <button class="gpt-detail-btn" title="GPT 상품 요약" @click="handleGptDetail">
          <i class="fas fa-brain"></i>
          <span class="btn-text">AI 요약</span>
        </button>
      </div>

      <ProductInfoCard
        :product="product"
        :bank-logo="getBankLogo()"
        :bank-initial="getBankInitial()"
        :category-name="getCategoryName()"
        :interest-type-name="getInterestTypeName()"
        :selected-option="selectedOption"
        :savings-type-code="route.query.rsrvType"
      />

      <ProductRateInfo :selected-option="selectedOption" :format-rate="formatRate" />

      <ProductFeatures
        :product="product"
        :selected-option="selectedOption"
        :format-currency="formatCurrency"
        :format-date="formatDate"
      />

      <div v-if="product.productDetail?.join_member" class="info-section">
        <h3 class="section-title">가입 대상</h3>
        <div class="info-content">
          {{ product.productDetail.join_member }}
        </div>
      </div>

      <div
        v-if="product.productDetail?.spcl_cnd || parsedPreferentialConditions.length > 0"
        class="info-section"
      >
        <h3 class="section-title">우대 조건</h3>
        <div class="info-content">
          <p v-if="product.productDetail?.spcl_cnd">
            {{ product.productDetail.spcl_cnd }}
          </p>
          <ul v-if="parsedPreferentialConditions.length > 0" class="conditions-list">
            <li v-for="(condition, idx) in parsedPreferentialConditions" :key="idx">
              {{ condition }}
            </li>
          </ul>
        </div>
      </div>

      <div v-if="product.productDetail?.etc_note" class="info-section">
        <h3 class="section-title">만기 해지 시 이자 지급 방식</h3>
        <div class="info-content">
          {{ product.productDetail.mtrt_int }}
        </div>
      </div>

      <div v-if="product.productDetail?.etc_note" class="info-section">
        <h3 class="section-title">비고</h3>
        <div class="info-content">
          {{ product.productDetail.etc_note }}
        </div>
      </div>

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

      <div v-if="currentCompareList.length > 0" style="height: 4rem"></div>
    </div>

    <CompareFloatingBar
      v-if="currentCompareList.length > 0"
      :compare-list="currentCompareList"
      :product-type="productType"
      @go-to-compare="goToCompare"
      @clear-compare-list="clearCurrentCompareList"
    />

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
import { resolveCompanyLogo } from '@/constants/companyLogoMap';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const showGptDetailModal = ref(false);

const {
  depositCompareList,
  savingsCompareList,
  clearCompareList,
  addToCompareList,
  removeFromCompareList,
  isInCompareList,
} = useCompareList();

const productType = computed(() => {
  if (route.query.rsrvType || route.params.category === 'savings') {
    return 'savings';
  }
  return route.params.category || 'deposit';
});

const currentCompareList = computed(() => {
  return productType.value === 'deposit' ? depositCompareList.value : savingsCompareList.value;
});

const clearCurrentCompareList = () => {
  clearCompareList(productType.value);
};

const getCompanyUrl = () => {
  if (!product.value) return null;
  return (
    product.value.companyUrl ||
    product.value.company_url ||
    product.value.productDetail?.companyUrl ||
    null
  );
};

const goToFavorites = () => {
  router.push('/mypage/favorites');
};

const isProductInCompareList = computed(() => {
  if (!product.value || !selectedOption.value) return false;

  const productId = product.value.product_id || product.value.productId;
  const saveTrm = selectedOption.value.save_trm || selectedOption.value.saveTrm;
  const intrRateType =
    selectedOption.value.intr_rate_type || selectedOption.value.intrRateType || 'S';

  const isSavings = productType.value === 'savings';

  let rsrvType = null;
  if (isSavings) {
    rsrvType =
      selectedOption.value.rsrv_type ||
      selectedOption.value.rsrvType ||
      route.query.rsrvType ||
      'F';
  }

  return isInCompareList(productId, saveTrm, intrRateType, rsrvType, productType.value);
});

const handleGptDetail = () => {
  showGptDetailModal.value = true;
};

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

      saveAsRecentViewed();
    } else {
      error.value = '상품 정보를 찾을 수 없습니다.';
    }
  } catch (err) {
    error.value = '상품 정보를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

const saveAsRecentViewed = async () => {
  try {
    const productId = route.params.id;
    const saveTrm = route.query.saveTrm;
    const intrRateType = route.query.intrRateType;
    let rsrvType = route.query.rsrvType;

    if (
      !rsrvType &&
      product.value &&
      product.value.productDetail &&
      product.value.productDetail.options
    ) {
      const option = selectedOption.value;
      if (option) {
        rsrvType = option.rsrv_type || option.rsrvType;
      }
    }

    if (route.params.category === 'savings' && !rsrvType) {
      rsrvType = 'F';
    }

    if (!productId) {
      return;
    }

    await recentViewAPI.saveRecentView(productId, saveTrm, intrRateType, rsrvType);
  } catch (error) {
    // 에러 무시
  }
};

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

const handleAddToCompare = () => {
  if (!product.value || !selectedOption.value) {
    return;
  }

  const option = { ...selectedOption.value };

  if (productType.value === 'savings' && !option.rsrv_type && !option.rsrvType) {
    option.rsrv_type = route.query.rsrvType || 'F';
    option.rsrv_type_nm = option.rsrv_type === 'S' ? '정액적립식' : '자유적립식';
  }

  addToCompareList(product.value, option, productType.value);
};

const handleRemoveFromCompare = () => {
  if (!product.value || !selectedOption.value) return;

  const productId = product.value.product_id || product.value.productId;
  const saveTrm = selectedOption.value.save_trm || selectedOption.value.saveTrm;
  const intrRateType =
    selectedOption.value.intr_rate_type || selectedOption.value.intrRateType || 'S';

  let rsrvType = null;
  if (productType.value === 'savings') {
    rsrvType =
      selectedOption.value.rsrv_type ||
      selectedOption.value.rsrvType ||
      route.query.rsrvType ||
      'F';
  }

  removeFromCompareList(productId, saveTrm, intrRateType, rsrvType, productType.value);
};

const goToCompare = () => {
  if (currentCompareList.value.length < 2) {
    showToast('2개 이상의 상품을 선택해주세요.', 'warning');
    return;
  }

  router.push({
    path: '/products/compare',
    query: {
      type: productType.value,
    },
  });
};

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

const getBankLogo = () => {
  const logoFile = resolveCompanyLogo(product.value.korCoNm);
  return `/images/companies/${logoFile}`;
};

const getBankInitial = () => {
  if (!product.value || !product.value.kor_co_nm) return '';
  return product.value.kor_co_nm.charAt(0);
};

const joinProduct = () => {
  if (!product.value) return;

  const companyUrl = getCompanyUrl();

  if (companyUrl && companyUrl.trim() !== '') {
    window.open(companyUrl, '_blank', 'noopener,noreferrer');
  } else {
    const fallbackUrl = product.value.external_link || getBankWebsite();
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }
};

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

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '홈페이지 직접 참고';
  return new Intl.NumberFormat('ko-KR').format(value) + '원';
};

const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

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

  if (rsrvType) {
    const fullMatch = options.find(
      (opt) =>
        String(opt.save_trm || opt.saveTrm) === String(saveTrm) &&
        (opt.intr_rate_type || opt.intrRateType) === intrRateType &&
        (opt.rsrv_type || opt.rsrvType) === rsrvType
    );

    if (fullMatch) return fullMatch;
  }

  const matchedOption = options.find(
    (opt) =>
      String(opt.save_trm || opt.saveTrm) === String(saveTrm) &&
      (opt.intr_rate_type || opt.intrRateType) === intrRateType
  );

  if (matchedOption) return matchedOption;

  const saveTrmMatchOnly = options.find(
    (opt) => String(opt.save_trm || opt.saveTrm) === String(saveTrm)
  );

  if (saveTrmMatchOnly) return saveTrmMatchOnly;

  return options[0];
});

onMounted(() => {
  loadProductDetail();
});
</script>

<style scoped>
.product-detail-page {
  box-sizing: border-box;
  padding: 0 0rem;
  padding-bottom: 6rem;
  min-height: 100vh;
  margin: 0 auto;
  max-width: 26.875rem;
}

.product-container {
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

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  width: 100%;
  padding: 0 0.75rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.favorite-btn {
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: 0.3rem;
  gap: 0.375rem;
  background: var(--color-white);
  color: var(--color-main);
  height: 2.1rem;
  border: 0.0625rem solid var(--color-light);
  border-radius: 1.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.1);
}

.favorite-btn:hover {
  background-color: var(--color-bg-light);
}

.favorite-btn:active {
  transform: translateY(0.0625rem);
}

.favorite-btn .favorite-icon {
  color: #ffd700;
}

.favorite-btn .btn-text {
  white-space: nowrap;
}

.gpt-detail-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--color-white);
  color: var(--color-main);
  height: 2.1rem;
  border: 0.0625rem solid var(--color-light);
  border-radius: 1.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.1);
}

.gpt-detail-btn:hover {
  background-color: var(--color-bg-light);
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.15);
}

.gpt-detail-btn:active {
  transform: translateY(0);
}

.gpt-detail-btn i {
  font-size: 1rem;
  color: var(--color-main);
}

.gpt-detail-btn .btn-text {
  white-space: nowrap;
}

.info-section {
  background-color: var(--color-white);
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  margin: 0 0rem 0.5rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
  box-sizing: border-box;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 0.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 0.0625rem solid var(--color-bg-light);
}

.info-content {
  font-size: 0.9375rem;
  color: var(--color-main);
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
  color: var(--color-white);
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

.action-section {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  width: 100%;
  padding: 0 1rem;
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
  background: var(--color-white);
  color: var(--color-main);
  border: 0.0625rem solid var(--color-light);
}

.compare-btn.in-list {
  background: var(--color-main);
  color: var(--color-white);
  border: 0.0625rem solid var(--color-main);
}

.join-btn {
  background: var(--color-main);
  color: var(--color-white);
}

.join-btn:hover {
  filter: brightness(110%);
}

@media (max-width: 20rem) {
  .page-header {
    padding: 0 0.75rem;
  }

  .info-section {
    margin: 0 0.75rem 0.5rem 0.75rem;
    padding: 1rem 0.875rem;
  }

  .action-section {
    padding: 0 0.75rem;
  }

  .gpt-detail-btn .btn-text,
  .favorite-btn .btn-text {
    display: none;
  }
}
</style>
