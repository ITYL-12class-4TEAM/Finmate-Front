<template>
  <div class="products-section mt-4">
    <!-- 헤더 섹션 -->
    <div class="products-header">
      <div class="header-content">
        <h5 class="section-title">
          <i class="fas fa-list me-2"></i>
          보유 상품 목록
        </h5>
        <div class="header-stats">
          <span class="stats-item">
            <i class="fas fa-box"></i>
            총 {{ portfolioItems.length }}개 상품
          </span>
          <span class="stats-item">
            <i class="fas fa-coins"></i>
            {{ formatTotalAmount() }}
          </span>
        </div>
      </div>

      <div class="header-actions">
        <button
          class="btn-add-product"
          @click="$emit('add-new-product')"
          :disabled="isProcessing"
        >
          <i class="fas fa-plus"></i>
          상품 추가
        </button>
      </div>
    </div>

    <!-- 상품 리스트 -->
    <div class="products-list" v-if="portfolioItems.length > 0">
      <template v-for="(item, index) in portfolioItems" :key="item.portfolioId">
        <!-- 기본 상품 아이템 -->
        <ProductItem
          :item="item"
          :index="index"
          :totalItems="portfolioItems.length"
          :isEditing="editingItem?.portfolioId === item.portfolioId"
          :isProcessing="isProcessing"
          @start-edit="handleStartEdit"
          @delete-product="handleDeleteProduct"
        />

        <!-- 수정 폼 (조건부 렌더링) -->
        <ProductEditForm
          v-if="editingItem?.portfolioId === item.portfolioId"
          :item="item"
          :editForm="editForm"
          :isProcessing="isProcessing"
          @save-edit="handleSaveEdit"
          @cancel-edit="handleCancelEdit"
        />
      </template>
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
      <button class="btn-add-first" @click="$emit('add-new-product')">
        <i class="fas fa-plus"></i>
        첫 상품 추가하기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
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
  showSummary: {
    type: Boolean,
    default: false,
  },
});

// 이벤트 정의
const emit = defineEmits([
  'start-edit',
  'save-edit',
  'cancel-edit',
  'delete-product',
  'add-new-product',
]);

// 반응형 데이터
const isProcessing = ref(false);

// 총 금액 포맷팅
const formatTotalAmount = () => {
  const total = props.portfolioItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  return formatCurrency(total);
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
const handleStartEdit = (item) => {
  isProcessing.value = true;
  emit('start-edit', item);
  setTimeout(() => {
    isProcessing.value = false;
  }, 300);
};

const handleSaveEdit = async (item) => {
  isProcessing.value = true;
  try {
    emit('save-edit', item);
  } finally {
    setTimeout(() => {
      isProcessing.value = false;
    }, 500);
  }
};

const handleCancelEdit = () => {
  isProcessing.value = true;
  emit('cancel-edit');
  setTimeout(() => {
    isProcessing.value = false;
  }, 200);
};

const handleDeleteProduct = async (item) => {
  isProcessing.value = true;
  try {
    emit('delete-product', item);
  } finally {
    setTimeout(() => {
      isProcessing.value = false;
    }, 1000);
  }
};
</script>

<style scoped>
.products-section {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 0.875rem;
  padding: 1.25rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 4px 6px -1px rgba(45, 51, 107, 0.1),
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
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(185, 187, 204, 0.2);
}

.header-content {
  flex: 1;
}

.section-title {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
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
  font-size: 0.85rem;
  font-weight: 500;
}

.stats-item i {
  font-size: 0.8rem;
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
  padding: 0.5rem 0.75rem;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 상품 리스트 */
.products-list {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 4px 6px -1px rgba(45, 51, 107, 0.1),
    0 2px 4px -1px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.products-list:hover {
  box-shadow: 0 8px 25px -5px rgba(45, 51, 107, 0.15);
}

/* 리스트 내부 아이템들 사이 구분선 */
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

/* 수정 폼 스타일링 */
.products-list :deep(.edit-form) {
  background: linear-gradient(
    135deg,
    rgba(185, 187, 204, 0.1) 0%,
    rgba(125, 129, 162, 0.1) 100%
  );
  border-top: 1px solid rgba(185, 187, 204, 0.2);
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
  backdrop-filter: blur(5px);
}

/* 빈 상태 */
.empty-state {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  border: 2px dashed rgba(185, 187, 204, 0.4);
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.empty-state:hover {
  border-color: rgba(185, 187, 204, 0.6);
  background: linear-gradient(135deg, #f8f9fc 0%, #f0f4f8 100%);
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-light) 0%,
    var(--color-sub) 100%
  );
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
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.2);
}

/* 로딩 상태 */
.products-list.loading {
  opacity: 0.7;
  pointer-events: none;
}

.products-list.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-light);
  border-top: 3px solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  transform: translate(-50%, -50%);
}
</style>
