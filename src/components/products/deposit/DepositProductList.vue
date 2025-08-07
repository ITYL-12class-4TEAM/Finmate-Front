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
          <button
            v-else
            class="compare-btn add-compare-btn"
            @click.stop="handleAddToCompare(product)"
          >
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
import Pagination from '../Pagination.vue';
import CompareFloatingBar from '@/components/products/compare/CompareFloatingBar.vue';
import useCompareList from '@/composables/useCompareList';

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

const filteredProducts = computed(() => {
  if (!props.products?.length) return [];
  const userAmount = props.depositAmount
    ? Number(String(props.depositAmount).replace(/[^\d]/g, ''))
    : 0;
  return props.products.filter((product) => {
    const minDeposit = Number(
      product.min_deposit || product.minDeposit || product.minDepositAmount || 0
    );
    const maxLimit =
      Number(product.max_limit || product.maxLimit || product.maxDepositAmount) ||
      Number.MAX_SAFE_INTEGER;
    return userAmount >= minDeposit && userAmount <= maxLimit;
  });
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

const handleAddToCompare = (product) => {
  if (compareList.value.length >= 3) {
    alert('최대 3개까지 비교할 수 있습니다.');
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
    alert('최소 2개 이상의 상품을 선택해주세요.');
    return;
  }
  router.push({ path: '/products/compare' });
};
</script>

<style scoped>
/* 요약/정렬 */
.filter-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-bg-light);
  padding: 0.9rem 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
.result-count {
  font-size: 0.92rem;
  color: var(--color-sub);
}
.result-count strong {
  color: var(--color-main);
  font-weight: 600;
}

/* 드롭다운 */
.sort-dropdown {
  position: relative;
}
.sort-select {
  padding: 0.4rem 1.5rem 0.4rem 0.75rem;
  border: 1px solid var(--color-light);
  border-radius: 0.4rem;
  background: #fff;
  color: var(--color-main);
  font-size: 0.92rem;
  font-weight: 500;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L2 5h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
}
.sort-select:focus {
  outline: none;
  border-color: var(--color-main);
}

/* 리스트 */
.product-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  max-width: 430px;
  margin-left: auto;
  margin-right: auto;
}

.product-card {
  background: #fff;
  border-radius: 0.8rem;
  padding: 1.1rem;
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.07);
  display: flex;
  flex-direction: column;
  border: 1.5px solid transparent;
  transition:
    border 0.15s,
    box-shadow 0.15s;
}
.product-card.in-compare {
  border: 1.5px solid var(--color-main);
  box-shadow: 0 0 0 2px var(--color-bg-light);
}

.product-header {
  margin-bottom: 0.75rem;
  cursor: pointer;
}
.bank-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.15rem;
}
.bank-name {
  font-size: 0.87rem;
  color: var(--color-main);
  font-weight: 600;
}
.rate-type-badge {
  padding: 0.1rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.73rem;
  font-weight: 600;
  background: var(--color-bg-light);
  color: var(--color-main);
}
.rate-type-badge.simple-interest {
  background: #e6f2ff;
  color: #256ad7;
  border: 1px solid #b8d7fa;
}
.rate-type-badge.compound-interest {
  background: #fae9f2;
  color: #e91e63;
  border: 1px solid #f8bbd0;
}

.product-name {
  font-size: 1rem;
  font-weight: 500;
  color: #222;
  margin-top: 0.2rem;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex-grow: 1;
  cursor: pointer;
  margin-bottom: 0.75rem;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.detail-label {
  font-size: 0.85rem;
  color: #7d81a2;
}
.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
}
.highlight {
  color: #e91e63;
}

/* 버튼 */
.action-section {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.2rem;
}
.compare-btn,
.join-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition:
    background 0.12s,
    color 0.12s;
}
.add-compare-btn {
  background: var(--color-bg-light);
  color: var(--color-main);
  border: 1px solid var(--color-light);
}
.compare-btn.in-list {
  background: var(--color-main);
  color: #fff;
  font-weight: 700;
  border: 1px solid var(--color-main);
}
.compare-btn.in-list:hover {
  opacity: 0.9;
}
.join-btn {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: #fff;
}

/* 결과 없음 */
.no-results {
  padding: 2.2rem 0.5rem;
  text-align: center;
  background: #fafbfc;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--color-sub);
}
.no-results strong {
  color: var(--color-main);
}
.suggestion {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.7rem;
}
</style>
