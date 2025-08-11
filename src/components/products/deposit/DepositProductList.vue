<template>
  <div class="search-results">
    <!-- 로딩/에러 -->
    <div v-if="loading" class="loading">로딩 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- 검색 요약 & 정렬 -->
    <div v-else-if="depositAmount && filteredProducts.length > 0" class="filter-summary">
      <div class="result-count">
        가입 가능한 상품 <strong>{{ totalCount }}</strong
        >개
      </div>
      <div class="sort-dropdown">
        <select v-model="localSortBy" @change="onSortChange" class="sort-select">
          <option value="intrRate">기본금리순</option>
          <option value="intrRate2">우대금리순</option>
        </select>
      </div>
    </div>

    <!-- 결과 없음 -->
    <div v-else-if="depositAmount && filteredProducts.length === 0" class="no-results">
      <p>
        <strong>{{ formatNumber(depositAmount) }}원</strong>으로 가입 가능한 상품이 없습니다.
      </p>
      <p class="suggestion">다른 금액으로 검색해보세요.</p>
    </div>
    <div v-else-if="!products || products.length === 0" class="no-results">
      검색 조건에 맞는 상품이 없습니다.
    </div>

    <!-- 상품 목록 -->
    <div v-if="filteredProducts.length > 0" class="product-list">
      <div
        v-for="(product, idx) in filteredProducts"
        :key="`product-${getProductId(product) || idx}`"
        class="product-card"
        :class="{
          'in-compare': isInCompareList(
            getProductId(product),
            getSaveTrm(product),
            product.intr_rate_type || product.intrRateType || 'S'
          ),
        }"
      >
        <div class="product-header" @click="onProductClick(product)">
          <div class="bank-info">
            <span class="bank-name">{{ product.kor_co_nm || product.korCoNm }}</span>
            <span class="rate-type-badge" :class="getRateTypeClass(product)">
              {{ getRateTypeLabel(product) }}
            </span>
          </div>
          <div class="product-name">
            {{ product.product_name || product.finPrdtNm }}
          </div>
        </div>
        <div class="product-details" @click="onProductClick(product)">
          <div class="detail-row">
            <span class="detail-label">기본 금리</span>
            <span class="detail-value">{{
              formatRate(product.intr_rate || product.intrRate)
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">우대 금리</span>
            <span class="detail-value highlight">{{
              formatRate(product.intr_rate2 || product.intrRate2)
            }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">가입 기간</span>
            <span class="detail-value">{{ product.save_trm || product.saveTrm }}개월</span>
          </div>
        </div>
        <div class="action-section">
          <button
            v-if="
              isInCompareList(
                getProductId(product),
                getSaveTrm(product),
                product.intr_rate_type || product.intrRateType || 'S'
              )
            "
            class="compare-btn in-list"
            @click.stop="handleRemoveFromCompare(product)"
          >
            비교함에서 제거
          </button>
          <button v-else class="compare-btn add-compare-btn" @click.stop="handleWarning(product)">
            비교함에 추가
          </button>
          <button class="join-btn" @click.stop="goToJoinPage(product)">가입하기</button>
        </div>
      </div>

      <Pagination
        v-if="totalPages >= 1"
        :total-pages="totalPages"
        :current-page="currentPage"
        @page-change="onPageChange"
      />
    </div>

    <CompareFloatingBar
      v-if="compareList.length > 0"
      :compareList="compareList"
      @go-to-compare="goToCompare"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Pagination from '../common/Pagination.vue';
import CompareFloatingBar from '@/components/products/compare/CompareFloatingBar.vue';
import useCompareList from '@/composables/useCompareList';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const props = defineProps({
  products: { type: Array, required: true },
  depositAmount: { type: String, default: '100000' },
  loading: Boolean,
  error: String,
  totalCount: Number,
  currentPage: Number,
  pageSize: Number,
  sortBy: { type: String, default: 'intrRate' },
  productType: { type: String, default: 'deposit' },
});
const emit = defineEmits(['product-click', 'page-change', 'sort-change']);
const router = useRouter();

const localSortBy = ref(props.sortBy);
const { compareList, addToCompareList, removeFromCompareList, isInCompareList } = useCompareList();

const getProductId = (product) => {
  if (!product) return null;
  const fields = ['product_id', 'productId', 'id', 'finPrdtCd'];
  for (const f of fields) if (product[f] !== undefined) return product[f];
  return null;
};
const getSaveTrm = (product) => {
  if (!product) return null;
  const fields = ['save_trm', 'saveTrm', 'term'];
  for (const f of fields) if (product[f] !== undefined) return product[f];
  return null;
};
const formatNumber = (value) => {
  if (!value) return '0';
  if (typeof value === 'string' && value.includes(',')) return value;
  return new Intl.NumberFormat('ko-KR').format(
    typeof value === 'string' ? value.replace(/[^\d]/g, '') : value
  );
};
const getRateTypeLabel = (product) => {
  const rateType = product.intr_rate_type || product.intrRateType || 'S';
  return rateType === 'S' ? '단리' : '복리';
};
const getRateTypeClass = (product) => {
  const rateType = product.intr_rate_type || product.intrRateType || 'S';
  return rateType === 'S' ? 'simple-interest' : 'compound-interest';
};

// filteredProducts computed 속성을 수정
const filteredProducts = computed(() => {
  if (!props.products?.length) return [];

  const userAmount = props.depositAmount
    ? Number(String(props.depositAmount).replace(/[^\d]/g, ''))
    : 0;

  // 금액 필터링
  let filtered = props.products.filter((product) => {
    const minDeposit = Number(
      product.min_deposit || product.minDeposit || product.minDepositAmount || 0
    );
    const maxLimit =
      Number(product.max_limit || product.maxLimit || product.maxDepositAmount) ||
      Number.MAX_SAFE_INTEGER;
    return userAmount >= minDeposit && userAmount <= maxLimit;
  });

  // 정렬 로직 추가
  filtered.sort((a, b) => {
    // 기본금리 추출
    const intrRateA = parseFloat(a.intr_rate || a.intrRate || 0);
    const intrRateB = parseFloat(b.intr_rate || b.intrRate || 0);

    // 우대금리 추출
    const intrRate2A = parseFloat(a.intr_rate2 || a.intrRate2 || 0);
    const intrRate2B = parseFloat(b.intr_rate2 || b.intrRate2 || 0);

    // localSortBy에 따라 정렬
    if (localSortBy.value === 'intrRate') {
      // 기본금리순 정렬, 같으면 우대금리 높은순
      if (intrRateA === intrRateB) {
        return intrRate2B - intrRate2A; // 우대금리 내림차순
      }
      return intrRateB - intrRateA; // 기본금리 내림차순
    } else {
      // 우대금리순 정렬, 같으면 기본금리 높은순
      if (intrRate2A === intrRate2B) {
        return intrRateB - intrRateA; // 기본금리 내림차순
      }
      return intrRate2B - intrRate2A; // 우대금리 내림차순
    }
  });

  return filtered;
});

watch(
  () => props.sortBy,
  (newValue) => (localSortBy.value = newValue)
);

const totalPages = computed(() => Math.ceil(props.totalCount / props.pageSize));
const formatRate = (rate) => (rate == null ? '정보 없음' : parseFloat(rate).toFixed(2) + '%');

const onProductClick = (product) => emit('product-click', product);
const onPageChange = (page) => emit('page-change', page);
const onSortChange = () => emit('sort-change', { sortBy: localSortBy.value });

const handleWarning = (product) => {
  if (compareList.value.length >= 3) {
    showToast('상품은 최대 3개까지 비교할 수 있습니다', 'warning');
    return;
  }
  const option = {
    save_trm: product.save_trm || product.saveTrm,
    intr_rate: product.intr_rate || product.intrRate,
    intr_rate2: product.intr_rate2 || product.intrRate2,
    intr_rate_type: product.intr_rate_type || product.intrRateType || 'S',
    option_id: product.option_id || product.optionId || null,
  };
  const result = addToCompareList(product, option, props.productType);
  if (!result.success) alert(result.message);
};
const handleRemoveFromCompare = (product) => {
  removeFromCompareList(
    getProductId(product),
    getSaveTrm(product),
    product.intr_rate_type || product.intrRateType || 'S'
  );
};
const goToJoinPage = (product) => {
  router.push({
    name: 'ProductDetail',
    params: { category: props.productType, id: getProductId(product) },
    query: { saveTrm: getSaveTrm(product) },
  });
};
const goToCompare = () => {
  if (compareList.value.length < 2) {
    showToast('2개 이상의 상품을 선택해주세요.', 'warning');
    return;
  }
  router.push({ path: '/products/compare' });
};
</script>

<style scoped>
/* ==========================================================================
   1. 검색 요약 및 정렬
   ========================================================================== */
.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 0.3rem 0.8rem;
  border-radius: 0.5rem; /* 8px */
  margin-bottom: 0.5rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.03);
}

.result-count {
  font-size: 0.875rem; /* 15px */
  color: var(--color-sub);
}

.result-count strong {
  color: var(--color-main);
  font-weight: 600;
}

.sort-dropdown {
  position: relative;
}

.sort-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.375rem; /* 6px */
  background-color: transparent;
  color: var(--color-main);
  font-size: 0.75rem; /* 14px */
  font-weight: 500;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237d81a2'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  transition: background-color 0.2s;
}
.sort-select:hover {
  background-color: var(--color-bg-light);
}
.sort-select:focus {
  outline: none;
}

/* ==========================================================================
   2. 상품 카드 리스트
   ========================================================================== */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.product-card {
  background: #fff;
  border-radius: 0.75rem; /* 12px */
  padding: 0.8rem 1.2rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
  display: flex;
  flex-direction: column;
  border: 0.125rem solid transparent; /* 2px */
  transition: all 0.2s ease-in-out;
}

.product-card.in-compare {
  border-color: var(--color-main);
  box-shadow: 0 0.25rem 1.5rem rgba(45, 51, 107, 0.08);
}

.product-header {
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.bank-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.1rem;
}

.bank-name {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
}

.rate-type-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--color-bg-light);
  color: var(--color-main);
}

.product-name {
  font-size: 1rem; /* 18px */
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.325rem; /* 10px */
  flex-grow: 1;
  cursor: pointer;
  margin-bottom: 0.5rem;
  border-top: 1px solid var(--color-bg-light);
  padding-top: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.85rem; /* 15px */
  color: var(--color-sub);
}

.detail-value {
  font-size: 1rem; /* 16px */
  font-weight: 600;
  color: var(--color-main);
}

.detail-value.highlight {
  font-size: 1rem; /* 18px */
  color: var(--color-accent, #e91e63);
}

/* ==========================================================================
   3. 액션 버튼
   ========================================================================== */
.action-section {
  display: flex;
  gap: 0.75rem;
}

.compare-btn,
.join-btn {
  flex: 1;
  height: 2.5rem; /* 48px */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem; /* 8px */
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease-in-out;
}

.add-compare-btn {
  background: #ffffff;
  color: var(--color-main);
  border: 0.0625rem solid var(--color-light);
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

/* ==========================================================================
   4. 결과 없음 / 로딩
   ========================================================================== */
.no-results,
.loading,
.error {
  padding: 3rem 1rem;
  text-align: center;
  background: #ffffff;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  color: var(--color-sub);
}

.no-results strong {
  color: var(--color-main);
}

.suggestion {
  font-size: 0.9375rem;
  margin-top: 0.5rem;
}

.error {
  color: #d32f2f;
}
</style>
