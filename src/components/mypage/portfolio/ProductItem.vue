<template>
  <div
    class="product-item"
    :class="{
      editing: isEditing,
      processing: isProcessing,
      'first-item': index === 0,
      'last-item': index === totalItems - 1,
      [viewMode]: true,
    }"
    @click="openModal"
  >
    <!-- 메인 카드 -->
    <div class="product-main">
      <div class="product-header">
        <div class="product-title" :title="item.customProductName">
          {{ item.customProductName || '상품명 없음' }}
        </div>
        <div class="product-subtitle">
          <span class="company-name">{{
            item.customCompanyName || '회사명 없음'
          }}</span>
          <span class="category-divider">•</span>
          <span class="subcategory-name">{{
            item.subcategory || '분류 없음'
          }}</span>
        </div>
      </div>

      <div class="product-summary">
        <div class="amount-display">
          <div class="amount-value">{{ formatCurrency(item.amount) }}</div>
          <div class="amount-ratio" v-if="totalAmount">
            {{ getAmountRatio() }}
          </div>
        </div>

        <!-- 상품 상태 + 카테고리 가로 정렬 영역 -->
        <div class="product-meta">
          <ProductStatus :item="item" />
          <div class="product-category">
            <div
              class="category-badge"
              :style="{ backgroundColor: getCategoryColor(item.category) }"
            >
              <i class="fas fa-tag"></i>
              {{ item.category }}
            </div>
          </div>
        </div>
      </div>

      <!-- 주요 정보 미리보기 -->
      <div class="product-preview">
        <div
          class="preview-item"
          v-if="item.interestRate || item.customRate || item.expectedReturn"
        >
          <i class="fas fa-percent"></i>
          <span>{{ getBestRate() }}%</span>
        </div>
        <div class="preview-item" v-if="item.maturityDate">
          <i class="fas fa-calendar-alt"></i>
          <span>{{ formatDateShort(item.maturityDate) }} 만기</span>
        </div>
        <div class="preview-item" v-if="item.saveTrm">
          <i class="fas fa-clock"></i>
          <span>{{ item.saveTrm }}개월</span>
        </div>
      </div>
    </div>

    <!-- 순서 표시 (옵션) -->
    <div class="product-index" v-if="showIndex">
      {{ index + 1 }}
    </div>
  </div>

  <!-- 상세 정보 모달 -->
  <ProductDetailsModal
    :is-visible="showDetailModal"
    :item="item"
    :is-editing="isEditing"
    :is-processing="isProcessing"
    :total-amount="totalAmount"
    @close="closeDetailModal"
    @start-edit="openEditModal"
    @delete-product="handleDelete"
  />

  <!-- 편집 모달 -->
  <ProductEditModal
    :is-visible="showEditModal"
    :item="item"
    :is-processing="isProcessing"
    @close="closeEditModal"
    @save-product="handleSave"
  />
</template>

<script setup>
import { ref } from 'vue';
import ProductDetailsModal from './ProductDetails.vue';
import ProductEditModal from './ProductEditForm.vue';
import ProductStatus from './ProductStatusBadge.vue';

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
  viewMode: {
    type: String,
    default: 'card', // 'card' or 'list'
  },
});

// 이벤트 정의
const emit = defineEmits([
  'start-edit',
  'save-product',
  'cancel-edit',
  'delete-product',
]);

// 반응형 데이터
const showDetailModal = ref(false);
const showEditModal = ref(false);

// 6개 메인 카테고리에 맞춘 색상 팔레트
const CATEGORY_COLORS = {
  예금: '#2d336b', // 진한 네이비
  적금: '#5a6085', // 미디엄 네이비
  보험: '#6b7394', // 그레이 네이비
  대출: '#9ca0b8', // 라이트 그레이
  주식: '#7d81a2', // 퍼플 그레이
  기타: '#8a8ea6', // 중간 그레이
  연금: '#5a6085', // 연금 (적금과 동일하게 처리)
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

// 최고 수익률 찾기
const getBestRate = () => {
  const rates = [
    props.item.interestRate,
    props.item.customRate,
    props.item.expectedReturn,
  ].filter((rate) => rate && rate > 0);

  if (rates.length === 0) return '0.0';
  return Math.max(...rates).toFixed(1);
};

// 날짜 짧은 형식
const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

// 모달 관련 메서드
const openModal = (event) => {
  // 특정 요소 클릭 시에는 모달을 열지 않음
  if (
    event?.target.closest('.category-badge') ||
    event?.target.closest('.status-badge') ||
    event?.target.closest('.preview-item')
  ) {
    return;
  }

  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

// 편집 모달 열기 (상세 모달에서 호출)
const openEditModal = () => {
  showDetailModal.value = false; // 상세 모달 닫기
  showEditModal.value = true; // 편집 모달 열기
};

// 이벤트 핸들러
const handleEdit = () => {
  if (!props.isEditing && !props.isProcessing) {
    emit('start-edit', props.item);
  }
};

const handleSave = (updatedItem) => {
  emit('save-product', updatedItem);
  closeEditModal(); // 저장 후 편집 모달 닫기
};

const handleDelete = () => {
  if (!props.isProcessing) {
    emit('delete-product', props.item);
    closeDetailModal(); // 삭제 후 상세 모달 닫기
  }
};
</script>

<style scoped>
.product-item {
  padding: 1rem;
  max-width: 26.875rem;
  width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInUp 0.4s ease-out;
}

.product-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: all 0.3s ease;
}

.product-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.product-item:hover::before,
.product-item.expanded::before {
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
  box-shadow: 0 8px 25px rgba(45, 51, 107, 0.12);
  transform: translateY(-2px);
}

.product-item.editing {
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.08) 0%,
    rgba(125, 129, 162, 0.08) 100%
  );
  border-color: var(--color-main);
  cursor: default;
}

.product-item.processing {
  opacity: 0.7;
  pointer-events: none;
  animation: pulse 1.5s ease-in-out infinite;
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
  gap: 0.5rem;
}

.product-header {
  flex: 1;
}

.product-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.4rem;
  line-height: 1.4;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-subtitle {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.company-name {
  font-weight: 600;
}

.category-divider {
  opacity: 0.6;
}

.subcategory-name {
  opacity: 0.8;
}

.product-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.amount-display {
  flex: 1;
}

.amount-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.25rem;
  font-family: 'Pretendard', sans-serif;
}

.amount-ratio {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
  opacity: 0.8;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-category {
  flex-shrink: 0;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.category-badge:hover {
  transform: scale(1.05);
}

.category-badge i {
  font-size: 0.65rem;
}

/* 미리보기 정보 */
.product-preview {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(185, 187, 204, 0.15);
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.4rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  font-size: 0.7rem;
  color: var(--color-sub);
  font-weight: 500;
  transition: all 0.3s ease;
}

.preview-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.4);
  color: var(--color-main);
}

.preview-item i {
  font-size: 0.65rem;
  opacity: 0.8;
}

.product-item.expanded .expand-indicator {
  background: var(--color-main);
  color: white;
  border-color: var(--color-main);
}

/* 순서 표시 */
.product-index {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
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
  z-index: 5;
}

/* 애니메이션 */
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
