<template>
  <div
    class="product-item"
    :class="{
      editing: isEditing,
      processing: isProcessing,
      expanded: isExpanded,
      'first-item': index === 0,
      'last-item': index === totalItems - 1,
    }"
    @click="toggleExpanded"
  >
    <!-- 메인 카드 (항상 표시) -->
    <div class="product-main">
      <div class="product-header">
        <div class="product-title" :title="item.productName">
          {{ item.productName }}
        </div>
        <div class="product-subtitle">{{ item.subcategoryName }}</div>
      </div>

      <div class="product-summary">
        <div class="amount-display">
          <div class="amount-value">{{ formatCurrency(item.amount) }}</div>
          <div class="amount-ratio">{{ getAmountRatio() }}</div>
        </div>

        <div class="product-category">
          <div
            class="category-badge"
            :style="{
              backgroundColor: getCategoryColor(
                getCategoryFromSubcategory(item.subcategoryName)
              ),
            }"
          >
            <i class="fas fa-tag"></i>
            {{ getCategoryFromSubcategory(item.subcategoryName) }}
          </div>
        </div>
      </div>
    </div>
    <!-- 상품 상태 뱃지 -->
    <div class="product-status" v-if="getProductStatus()">
      <div class="status-badge" :class="getProductStatus().class">
        <i :class="getProductStatus().icon"></i>
        {{ getProductStatus().text }}
      </div>
    </div>
    <!-- 확장/축소 인디케이터 -->
    <div class="expand-indicator" @click.stop="toggleExpanded">
      <i :class="isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
    </div>

    <!-- 세부 정보 컴포넌트 -->
    <ProductDetails
      v-if="!isEditing"
      :item="item"
      :is-expanded="isExpanded"
      :is-editing="isEditing"
      :is-processing="isProcessing"
      @start-edit="handleEdit"
      @delete-product="handleDelete"
    />

    <!-- 수정 폼 컴포넌트 -->
    <ProductEditForm
      v-if="isEditing && isExpanded"
      :item="item"
      :is-processing="isProcessing"
      @save-product="handleSave"
      @cancel-edit="handleCancel"
    />

    <!-- 순서 표시 (옵션) -->
    <div class="product-index" v-if="showIndex">
      {{ index + 1 }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ProductDetails from './ProductDetails.vue';
import ProductEditForm from './ProductEditForm.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  index: {
    type: Number,
    default: 0,
  },
  totalItems: {
    type: Number,
    default: 1,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  showIndex: {
    type: Boolean,
    default: false,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
});

// 이벤트 정의
const emit = defineEmits([
  'start-edit',
  'save-product',
  'cancel-edit',
  'delete-product',
  'toggle-expand',
]);

// 반응형 데이터
const isExpanded = ref(false);

// 카테고리 매핑
const getCategoryFromSubcategory = (subcategoryName) => {
  if (!subcategoryName) return '';

  const categoryMapping = {
    연금저축: '연금',
    자유적금: '적금',
    정기예금: '예금',
    정기적금: '적금',
    정액적금: '적금',
    변동금리예금: '예금',
    복리예금: '예금',
    단리예금: '예금',
    퇴직연금: '연금',
    개인연금: '연금',
    IRP: '연금',
    ISA: '투자',
    CMA: '예금',
    MMF: '펀드',
    ETF: '펀드',
    주식형펀드: '펀드',
    채권형펀드: '펀드',
  };

  return categoryMapping[subcategoryName] || subcategoryName;
};

// FinMate 브랜드 색상 팔레트
const CATEGORY_COLORS = {
  예금: '#2d336b',
  적금: '#7d81a2',
  펀드: '#b9bbcc',
  대출: '#9ca0b8',
  보험: '#6b7394',
  연금: '#5a6085',
  투자: '#4a5578',
  기타: '#8a8ea6',
};

// 색상 가져오기
const getCategoryColor = (categoryName) => {
  return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS['기타'];
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

// 금액 비율 계산
const getAmountRatio = () => {
  if (!props.totalAmount || props.totalAmount === 0) return '';
  const ratio = ((props.item.amount / props.totalAmount) * 100).toFixed(1);
  return `전체의 ${ratio}%`;
};

// 상품 상태 계산
const getProductStatus = () => {
  const today = new Date();

  // 만기일 체크
  if (props.item.maturityDate) {
    const maturityDate = new Date(props.item.maturityDate);
    const diffTime = maturityDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return {
        text: '만기완료',
        class: 'completed',
        icon: 'fas fa-check-circle',
      };
    } else if (diffDays <= 30) {
      return {
        text: '만기임박',
        class: 'warning',
        icon: 'fas fa-exclamation-triangle',
      };
    }
  }

  // 가입일 체크 (신규 상품)
  if (props.item.joinDate) {
    const joinDate = new Date(props.item.joinDate);
    const diffTime = today - joinDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return { text: '신규', class: 'new', icon: 'fas fa-star' };
    }
  }

  // 고수익 상품 체크
  if (props.item.customRate && props.item.customRate >= 4.0) {
    return { text: '고수익', class: 'high-yield', icon: 'fas fa-arrow-up' };
  }

  return null;
};

const toggleExpanded = (event) => {
  // 버튼이나 특정 요소 클릭 시에는 토글하지 않음
  if (
    event.target.closest('.action-btn') ||
    event.target.closest('.expand-indicator') ||
    event.target.closest('.category-badge') ||
    event.target.closest('.status-badge') ||
    event.target.closest('.form-input') ||
    event.target.closest('.form-btn')
  ) {
    return;
  }

  isExpanded.value = !isExpanded.value;
  emit('toggle-expand', { item: props.item, expanded: isExpanded.value });
};

// 이벤트 핸들러
const handleEdit = () => {
  if (!props.isEditing && !props.isProcessing) {
    emit('start-edit', props.item);
  }
};

const handleSave = (updatedItem) => {
  emit('save-product', updatedItem);
};

const handleCancel = () => {
  emit('cancel-edit');
};

const handleDelete = () => {
  if (!props.isProcessing) {
    if (confirm(`"${props.item.productName}"을(를) 삭제하시겠습니까?`)) {
      emit('delete-product', props.item);
    }
  }
};
</script>

<style scoped>
.product-item {
  padding: 0.75rem;
  max-width: 26.875rem;
  width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.product-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
}

.product-item:hover::before {
  background: linear-gradient(
    to bottom,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
}

.product-item.expanded {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 0.75rem;
  margin: 0.5rem auto;
  border: 1px solid rgba(185, 187, 204, 0.4);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.1);
}

.product-item.expanded::before {
  background: linear-gradient(
    to bottom,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
}

.product-item.editing {
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.05) 0%,
    rgba(125, 129, 162, 0.05) 100%
  );
  border-color: var(--color-main);
  cursor: default;
}

.product-item.processing {
  opacity: 0.7;
  pointer-events: none;
}

.product-item.first-item {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.product-item.last-item {
  border-bottom: none;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
}

/* 메인 정보 */
.product-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-header {
  flex: 1;
}

.product-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.25rem;
  line-height: 1.4;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-subtitle {
  font-size: 0.7rem;
  color: var(--color-sub);
  font-weight: 500;
}

.product-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.amount-display {
  flex: 1;
}

.amount-value {
  font-size: 1rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.25rem;
  font-family: 'Pretendard', sans-serif;
}

.amount-ratio {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
}

.product-category {
  flex-shrink: 0;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-badge i {
  font-size: 0.7rem;
}

/* 확장 인디케이터 */
.expand-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(185, 187, 204, 0.2);
  color: var(--color-sub);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  cursor: pointer;
  z-index: 10;
}

.product-item.expanded .expand-indicator {
  background: var(--color-main);
  color: white;
}

/* 상품 상태 */
.product-status {
  position: absolute;
  top: 4.6rem;
  left: 8rem;
  z-index: 10;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge.new {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.status-badge.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.status-badge.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.status-badge.high-yield {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.status-badge i {
  font-size: 0.6rem;
}

/* 순서 표시 */
.product-index {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: rgba(185, 187, 204, 0.3);
  color: var(--color-sub);
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 애니메이션 */
.product-item {
  animation: slideInUp 0.4s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 로딩 애니메이션 */
.product-item.processing {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
