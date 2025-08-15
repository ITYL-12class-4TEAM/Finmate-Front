<template>
  <div class="products-section mt-4">
    <!-- 헤더 섹션 - 카드 밖으로 분리 -->
    <div class="section-header">
      <div class="header-content">
        <div class="header-top">
          <h5 class="section-title">
            <i class="fas fa-layer-group me-2"></i>
            보유 상품 목록
          </h5>
          <div class="header-actions">
            <button class="btn-add-product" :disabled="isProcessing" @click="handleAddNewProduct">
              <i class="fas fa-plus"></i>
              상품 추가
            </button>
          </div>
        </div>

        <div class="header-stats">
          <div class="stats-card">
            <span class="stats-item">
              <i class="fas fa-box"></i>
              <div class="stats-content">
                <div class="stats-value">{{ portfolioItems.length }}</div>
                <div class="stats-label">총 상품</div>
              </div>
            </span>
          </div>
          <div class="stats-card">
            <span class="stats-item">
              <i class="fas fa-coins"></i>
              <div class="stats-content">
                <div class="stats-value">{{ formatTotalAmount() }}</div>
                <div class="stats-label">총 자산</div>
              </div>
            </span>
          </div>
          <div v-if="portfolioItems.length > 0" class="stats-card">
            <span class="stats-item">
              <i class="fas fa-chart-line"></i>
              <div class="stats-content">
                <div class="stats-value">{{ formatAverageAmount() }}</div>
                <div class="stats-label">평균 금액</div>
              </div>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 필터 및 정렬 - 독립적인 영역 -->
    <div v-if="portfolioItems.length > 0" class="controls-section">
      <div class="filter-controls">
        <div class="filter-group">
          <label>카테고리</label>
          <select v-model="selectedCategory" class="category-filter">
            <option value="">전체 카테고리</option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>정렬</label>
          <select v-model="sortBy" class="sort-control">
            <option value="amount-desc">금액 높은순</option>
            <option value="amount-asc">금액 낮은순</option>
            <option value="date-desc">최신순</option>
            <option value="date-asc">오래된순</option>
            <option value="name-asc">이름순</option>
          </select>
        </div>

        <div class="filter-group search-group">
          <label>검색</label>
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="상품명 또는 회사명 검색..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 상품 리스트 - 더 넓고 시원하게 -->
    <div v-if="filteredItems.length > 0" class="products-container">
      <div class="products-list" :class="[viewMode]">
        <template v-for="(item, index) in filteredItems" :key="item.portfolioId">
          <ProductItem
            v-if="!isEditing(item)"
            :item="item"
            :index="index"
            :total-items="filteredItems.length"
            :is-processing="isProcessing"
            :view-mode="viewMode"
            @start-edit="handleStartEdit"
            @save-product="handleSaveProduct"
            @delete-product="handleDeleteProduct"
          />
          <ProductEditForm
            v-else
            :item="item"
            :edit-form="editForm"
            :is-processing="isProcessing"
            @save-edit="handleSaveEdit"
            @cancel-edit="handleCancelEdit"
          />
        </template>
      </div>
    </div>

    <!-- 검색 결과 없음 -->
    <div v-else-if="portfolioItems.length > 0 && filteredItems.length === 0" class="no-results">
      <div class="no-results-content">
        <div class="no-results-icon">
          <i class="fas fa-search"></i>
        </div>
        <h6 class="no-results-title">검색 결과가 없습니다</h6>
        <p class="no-results-description">다른 검색어를 시도하거나 필터를 변경해보세요</p>
        <button class="btn-reset-filters" @click="resetFilters">
          <i class="fas fa-sync-alt"></i>
          필터 초기화
        </button>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <h6 class="empty-title">아직 보유한 상품이 없습니다</h6>
        <p class="empty-description">
          첫 번째 투자 상품을 추가하여<br />
          포트폴리오 관리를 시작해보세요
        </p>
        <button class="btn-add-first" @click="handleAddNewProduct">
          <i class="fas fa-plus"></i>
          첫 상품 추가하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ProductItem from './ProductItem.vue';
import ProductEditForm from './ProductEditForm.vue';

const props = defineProps({
  portfolioItems: {
    type: Array,
    required: true,
    default: () => [],
  },
  editingItem: {
    type: Object,
    default: null,
  },
  editForm: {
    type: Object,
    default: () => ({ amount: 0, memo: '' }),
  },
});

const emit = defineEmits([
  'start-edit',
  'save-edit',
  'cancel-edit',
  'delete-product',
  'add-new-product',
]);

const isProcessing = ref(false);
const viewMode = ref('list'); // 'card' or 'list'
const selectedCategory = ref('');
const sortBy = ref('amount-desc');
const searchQuery = ref('');

// 편집 중인 아이템 확인
const isEditing = (item) => {
  return props.editingItem?.portfolioId === item.portfolioId;
};

// 사용 가능한 카테고리 목록
const availableCategories = computed(() => {
  const categories = [
    ...new Set(props.portfolioItems.map((item) => item.category || item.subcategoryName || '기타')),
  ];
  return categories.sort();
});

// 필터링 및 정렬된 아이템
const filteredItems = computed(() => {
  let items = [...props.portfolioItems];

  // 카테고리 필터
  if (selectedCategory.value) {
    items = items.filter(
      (item) =>
        item.category === selectedCategory.value || item.subcategoryName === selectedCategory.value
    );
  }

  // 검색 필터 - customProductName과 customCompanyName 사용
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter(
      (item) =>
        item.customProductName?.toLowerCase().includes(query) ||
        item.customCompanyName?.toLowerCase().includes(query) ||
        item.productName?.toLowerCase().includes(query) ||
        item.companyName?.toLowerCase().includes(query)
    );
  }

  // 정렬
  items.sort((a, b) => {
    switch (sortBy.value) {
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'date-desc':
        return new Date(b.joinDate) - new Date(a.joinDate);
      case 'date-asc':
        return new Date(a.joinDate) - new Date(b.joinDate);
      case 'name-asc':
        return (a.customProductName || a.productName || '').localeCompare(
          b.customProductName || b.productName || ''
        );
      default:
        return 0;
    }
  });

  return items;
});

// 필터 초기화
const resetFilters = () => {
  selectedCategory.value = '';
  sortBy.value = 'amount-desc';
  searchQuery.value = '';
};

// 총 금액 포맷팅
const formatTotalAmount = () => {
  const total = props.portfolioItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  return formatCurrency(total);
};

// 평균 금액 포맷팅
const formatAverageAmount = () => {
  if (props.portfolioItems.length === 0) return '0원';
  const average =
    props.portfolioItems.reduce((sum, item) => sum + (item.amount || 0), 0) /
    props.portfolioItems.length;
  return formatCurrency(Math.floor(average));
};

// 통화 포맷팅
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '0원';

  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remainder = amount % 100000000;
    if (remainder === 0) {
      return `${eok}억원`;
    } else {
      const man = Math.floor(remainder / 10000);
      return `${eok}억 ${man}만원`;
    }
  }

  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    } else {
      return `${man}만 ${remainder.toLocaleString()}원`;
    }
  }

  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

// 이벤트 핸들러들
const handleAddNewProduct = () => {
  emit('add-new-product');
};

const handleStartEdit = (item) => {
  if (!isProcessing.value) {
    emit('start-edit', item);
  }
};

const handleSaveProduct = (updatedItem) => {
  if (!isProcessing.value) {
    isProcessing.value = true;
    emit('save-edit', updatedItem);
    setTimeout(() => {
      isProcessing.value = false;
    }, 1000);
  }
};

const handleSaveEdit = (item) => {
  if (!isProcessing.value) {
    isProcessing.value = true;
    emit('save-edit', item);
    setTimeout(() => {
      isProcessing.value = false;
    }, 1000);
  }
};

const handleCancelEdit = () => {
  if (!isProcessing.value) {
    emit('cancel-edit');
  }
};

const handleDeleteProduct = (item) => {
  if (!isProcessing.value) {
    emit('delete-product', item);
  }
};
</script>

<style scoped>
.products-section {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
}

/* 헤더 섹션 - 카드 밖으로 분리 */
.section-header {
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}

.section-title i {
  color: var(--color-sub);
  margin-right: 0.75rem;
}

.btn-add-product {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-product:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-add-product:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 통계 카드들 */
.header-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stats-card {
  background: white;
  border-radius: 0.75rem;
  padding: 0.5rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stats-item i {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: var(--color-main);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.stats-content {
  flex: 1;
}

.stats-value {
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stats-label {
  color: var(--color-sub);
  font-size: 0.8rem;
  font-weight: 500;
}

/* 필터 컨트롤 섹션 */
.controls-section {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.filter-controls {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: var(--color-main);
  font-size: 0.875rem;
  font-weight: 600;
}

.category-filter,
.sort-control {
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-filter:focus,
.sort-control:focus {
  outline: none;
  border-color: var(--color-main);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper i {
  position: absolute;
  left: 1rem;
  color: var(--color-sub);
  font-size: 1rem;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 2.5rem;
  background: white;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-main);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-main);
}

.search-input::placeholder {
  color: var(--color-sub);
  opacity: 0.8;
}

.clear-search {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--color-sub);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.clear-search:hover {
  color: var(--color-main);
  background: rgba(185, 187, 204, 0.1);
}

/* 상품 컨테이너 - 더 넓고 시원하게 */
.products-container {
  margin-bottom: 2rem;
}

.products-list {
  background: white;
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.products-list:hover {
}

.products-list.card,
.products-list.list {
  display: flex;
  flex-direction: column;
}

.products-list :deep(.product-item) {
  border-bottom: 1px solid rgba(185, 187, 204, 0.15);
  transition: all 0.3s ease;
}

.products-list :deep(.product-item:last-child) {
  border-bottom: none;
}

.products-list :deep(.product-item:hover) {
  background: rgba(45, 51, 107, 0.02);
}

/* 검색 결과 없음 */
.no-results {
  background: white;
  border-radius: 1rem;
  border: 2px dashed rgba(185, 187, 204, 0.3);
  padding: 0;
  overflow: hidden;
}

.no-results-content {
  padding: 3rem 2rem;
  text-align: center;
}

.no-results-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: var(--color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.no-results-icon i {
  font-size: 1.5rem;
  color: white;
}

.no-results-title {
  color: var(--color-main);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.no-results-description {
  color: var(--color-sub);
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
}

.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--color-sub);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset-filters:hover {
  background: var(--color-main);
  transform: translateY(-2px);
}

/* 빈 상태 */
.empty-state {
  background: white;
  border-radius: 1rem;
  border: 2px dashed rgba(185, 187, 204, 0.3);
  padding: 0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.empty-state:hover {
  border-color: rgba(185, 187, 204, 0.5);
}

.empty-content {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: var(--color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
}

.empty-icon i {
  font-size: 2rem;
  color: white;
}

.empty-title {
  color: var(--color-main);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.empty-description {
  color: var(--color-sub);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 2.5rem 0;
}

.btn-add-first {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(45, 51, 107, 0.2);
}

.btn-add-first:hover {
  transform: translateY(-3px);
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .filter-controls {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .search-group {
    grid-column: 1 / -1;
  }
}
</style>
