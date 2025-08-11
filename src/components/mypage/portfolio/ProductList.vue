<template>
  <div class="products-section mt-4">
    <!-- 헤더 섹션 -->
    <div class="products-header">
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
          <span class="stats-item">
            <i class="fas fa-box"></i>
            총 {{ portfolioItems.length }}개 상품
          </span>
          <span class="stats-item">
            <i class="fas fa-coins"></i>
            {{ formatTotalAmount() }}
          </span>
          <span v-if="portfolioItems.length > 0" class="stats-item">
            <i class="fas fa-chart-line"></i>
            평균 {{ formatAverageAmount() }}
          </span>
        </div>
      </div>
    </div>

    <!-- 필터 및 정렬 -->
    <div v-if="portfolioItems.length > 0" class="list-controls">
      <div class="filter-controls">
        <select v-model="selectedCategory" class="category-filter">
          <option value="">전체 카테고리</option>
          <option v-for="category in availableCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <select v-model="sortBy" class="sort-control">
          <option value="amount-desc">금액 높은순</option>
          <option value="amount-asc">금액 낮은순</option>
          <option value="date-desc">최신순</option>
          <option value="date-asc">오래된순</option>
          <option value="name-asc">이름순</option>
        </select>
      </div>

      <div class="search-control">
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

    <!-- 상품 리스트 -->
    <div v-if="filteredItems.length > 0" class="products-list" :class="[viewMode]">
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

    <!-- 검색 결과 없음 -->
    <div v-else-if="portfolioItems.length > 0 && filteredItems.length === 0" class="no-results">
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

    <!-- 빈 상태 -->
    <div v-else class="empty-state">
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
    emit('save-edit', updatedItem); // 메인 컴포넌트로 전달

    // 처리 완료 후 상태 초기화
    setTimeout(() => {
      isProcessing.value = false;
    }, 1000);
  }
};

const handleSaveEdit = (item) => {
  if (!isProcessing.value) {
    isProcessing.value = true;
    emit('save-edit', item);
    // 메인에서 처리 완료 후 isProcessing을 false로 변경
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
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 0.875rem;
  padding: 1.25rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(45, 51, 107, 0.1),
    0 2px 4px -1px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 26.875rem;

  width: 100%;
  margin: 0 auto;
}

/* 헤더 */
.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(185, 187, 204, 0.2);
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.header-content {
  flex: 1;
}

.section-title {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
}

.section-title i {
  color: var(--color-sub);
}

.header-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-sub);
  font-size: 0.8rem;
  font-weight: 500;
}

.stats-item i {
  font-size: 0.75rem;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-add-product {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.6rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(45, 51, 107, 0.2);
}

.btn-add-product:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
}

.btn-add-product:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 리스트 컨트롤 */
.list-controls {
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
}

.category-filter,
.sort-control {
  padding: 0.4rem 0.75rem;
  background: white;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-main);
  width: 100%;
  cursor: pointer;
}

.search-control {
  flex: 1;
  max-width: none;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper i {
  position: absolute;
  left: 0.75rem;
  color: var(--color-sub);
  font-size: 0.8rem;
}

.search-input {
  width: 100%;
  padding: 0.4rem 0.75rem 0.4rem 2rem;
  background: white;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-main);
}

.search-input::placeholder {
  color: var(--color-sub);
  opacity: 0.8;
}

.search-input {
  width: 100%;
  padding: 0.4rem 2rem 0.4rem 2rem;
  background: white;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-main);
  box-sizing: border-box;
}

.clear-search {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-sub);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 상품 리스트 */
.products-list {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(45, 51, 107, 0.1),
    0 2px 4px -1px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.products-list:hover {
  box-shadow: 0 8px 25px -5px rgba(45, 51, 107, 0.15);
}

.products-list.card,
.products-list.list {
  display: flex;
  flex-direction: column;
}

.products-list :deep(.product-item) {
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
  transition: all 0.3s ease;
}

.products-list :deep(.product-item:last-child) {
  border-bottom: none;
}

.products-list :deep(.product-item:hover) {
  background: rgba(255, 255, 255, 0.8);
}

/* 검색 결과 없음 */
.no-results {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  border: 2px dashed rgba(185, 187, 204, 0.4);
  padding: 2rem;
  text-align: center;
}

.no-results-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-light) 0%, var(--color-sub) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.no-results-icon i {
  font-size: 1.25rem;
  color: white;
}

.no-results-title {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.no-results-description {
  color: var(--color-sub);
  font-size: 0.85rem;
  margin: 0 0 1rem 0;
}

.btn-reset-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-sub);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset-filters:hover {
  background: var(--color-main);
}

/* 빈 상태 */
.empty-state {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  border: 2px dashed rgba(185, 187, 204, 0.4);
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.empty-state:hover {
  border-color: rgba(185, 187, 204, 0.6);
  background: linear-gradient(135deg, var(--color-bg-light) 0%, var(--color-light) 100%);
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-light) 0%, var(--color-sub) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.empty-icon i {
  font-size: 1.75rem;
  color: white;
}

.empty-title {
  color: var(--color-main);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.empty-description {
  color: var(--color-sub);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 2rem 0;
}

.btn-add-first {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.2);
}

.btn-add-first:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 51, 107, 0.3);
}
</style>
