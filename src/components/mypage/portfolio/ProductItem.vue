<template>
  <div
    class="product-item"
    :class="{
      editing: isEditing,
      processing: isProcessing,
      'first-item': index === 0,
      'last-item': index === totalItems - 1,
      [viewMode]: true,
      [`category-${item.category}`]: true,
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
          <span class="company-name">{{ item.customCompanyName || '회사명 없음' }}</span>
          <span class="category-divider">•</span>
          <span class="subcategory-name">{{ item.subcategory || '분류 없음' }}</span>
        </div>
      </div>

      <div class="product-summary">
        <div class="amount-display">
          <div class="amount-value">{{ formatCurrency(item.amount) }}</div>
          <div class="amount-label">{{ getAmountLabel() }}</div>
          <div v-if="totalAmount" class="amount-ratio">
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
              <i :class="getCategoryIcon(item.category)"></i>
              {{ item.category }}
            </div>
          </div>
        </div>
      </div>

      <!-- 상품별 특화 정보 미리보기 -->
      <div class="product-preview">
        <!-- 예금/적금 정보 -->
        <template v-if="['예금', '적금'].includes(item.category)">
          <div v-if="getBestRate()" class="preview-item rate-item">
            <i class="fas fa-percent"></i>
            <span>{{ getBestRate() }}%</span>
          </div>
          <div v-if="item.maturityDate" class="preview-item">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDateShort(item.maturityDate) }} 만기</span>
          </div>
          <div v-if="item.saveTrm" class="preview-item">
            <i class="fas fa-clock"></i>
            <span>{{ item.saveTrm }}개월</span>
          </div>
          <div v-if="item.estimatedInterest" class="preview-item profit-item">
            <i class="fas fa-coins"></i>
            <span>예상이자 {{ formatCurrency(item.estimatedInterest) }}</span>
          </div>
        </template>

        <!-- 주식 정보 -->
        <template v-if="item.category === '주식'">
          <div v-if="stockInfo.currentPrice" class="preview-item">
            <i class="fas fa-chart-line"></i>
            <span>{{ stockInfo.currentPrice.toLocaleString() }}원</span>
          </div>
          <div v-if="stockInfo.quantity" class="preview-item">
            <i class="fas fa-cubes"></i>
            <span>{{ stockInfo.quantity }}주</span>
          </div>
          <div v-if="stockInfo.marketType" class="preview-item">
            <i class="fas fa-globe"></i>
            <span>{{ stockInfo.marketType }}</span>
          </div>
          <div
            v-if="stockInfo.returnRate !== null"
            class="preview-item"
            :class="stockInfo.returnRate >= 0 ? 'profit-item' : 'loss-item'"
          >
            <i :class="stockInfo.returnRate >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            <span
              >{{ stockInfo.returnRate >= 0 ? '+' : ''
              }}{{ stockInfo.returnRate.toFixed(1) }}%</span
            >
          </div>
        </template>

        <!-- 보험 정보 -->
        <template v-if="item.category === '보험'">
          <div v-if="insuranceInfo.coverage" class="preview-item coverage-item">
            <i class="fas fa-shield-alt"></i>
            <span>{{ formatCurrency(insuranceInfo.coverage) }} 보장</span>
          </div>
          <div v-if="insuranceInfo.beneficiary" class="preview-item">
            <i class="fas fa-user-friends"></i>
            <span>{{ insuranceInfo.beneficiary }}</span>
          </div>
          <div v-if="item.maturityDate" class="preview-item">
            <i class="fas fa-calendar-alt"></i>
            <span>{{ formatDateShort(item.maturityDate) }} 만기</span>
          </div>
          <div v-else class="preview-item">
            <i class="fas fa-infinity"></i>
            <span>종신보장</span>
          </div>
        </template>

        <!-- 연금 정보 -->
        <template v-if="item.category === '연금'">
          <div v-if="pensionInfo.pensionType" class="preview-item">
            <i class="fas fa-university"></i>
            <span>{{ pensionInfo.pensionType }}</span>
          </div>
          <div v-if="pensionInfo.taxBenefit" class="preview-item tax-item">
            <i class="fas fa-receipt"></i>
            <span>{{ pensionInfo.taxBenefit }}</span>
          </div>
          <div v-if="getBestRate()" class="preview-item rate-item">
            <i class="fas fa-percent"></i>
            <span>{{ getBestRate() }}%</span>
          </div>
          <div v-if="item.saveTrm" class="preview-item">
            <i class="fas fa-clock"></i>
            <span>{{ item.saveTrm }}개월</span>
          </div>
        </template>

        <!-- 대출 정보 -->
        <template v-if="item.category === '대출'">
          <div v-if="getBestRate()" class="preview-item rate-item loan-rate">
            <i class="fas fa-percent"></i>
            <span>{{ getBestRate() }}% 금리</span>
          </div>
          <div v-if="item.maturityDate" class="preview-item">
            <i class="fas fa-calendar-check"></i>
            <span>{{ formatDateShort(item.maturityDate) }} 상환</span>
          </div>
          <div v-if="item.saveTrm" class="preview-item">
            <i class="fas fa-clock"></i>
            <span>{{ item.saveTrm }}개월</span>
          </div>
        </template>

        <!-- 기타 투자 정보 -->
        <template v-if="item.category === '기타'">
          <div v-if="getBestRate()" class="preview-item rate-item">
            <i class="fas fa-chart-area"></i>
            <span>{{ getBestRate() }}% 수익률</span>
          </div>
          <div v-if="item.saveTrm" class="preview-item">
            <i class="fas fa-clock"></i>
            <span>{{ item.saveTrm }}개월</span>
          </div>
          <div v-if="item.maturityDate" class="preview-item">
            <i class="fas fa-flag"></i>
            <span>{{ formatDateShort(item.maturityDate) }} 목표</span>
          </div>
        </template>
      </div>
    </div>

    <!-- 순서 표시 (옵션) -->
    <div v-if="showIndex" class="product-index">
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
import { ref, computed } from 'vue';
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
const emit = defineEmits(['start-edit', 'save-product', 'cancel-edit', 'delete-product']);

// 반응형 데이터
const showDetailModal = ref(false);
const showEditModal = ref(false);

// 카테고리별 색상과 아이콘
const CATEGORY_CONFIG = {
  예금: { color: '#059669', icon: 'fas fa-piggy-bank' },
  적금: { color: '#0891b2', icon: 'fas fa-coins' },
  보험: { color: '#7c3aed', icon: 'fas fa-shield-alt' },
  연금: { color: '#dc2626', icon: 'fas fa-university' },
  주식: { color: '#ea580c', icon: 'fas fa-chart-line' },
  대출: { color: '#6b7280', icon: 'fas fa-credit-card' },
  기타: { color: '#4338ca', icon: 'fas fa-cube' },
};

// 메모에서 추가 정보 파싱
const parseAdditionalInfo = (memo) => {
  if (!memo) return {};

  const info = {};
  const lines = memo.split('\n');

  for (const line of lines) {
    if (line.includes('현재가:')) {
      const match = line.match(/현재가:\s*([\d,]+)원/);
      if (match) info.currentPrice = parseInt(match[1].replace(/,/g, ''));
    }
    if (line.includes('보유수량:')) {
      const match = line.match(/보유수량:\s*(\d+)주/);
      if (match) info.quantity = parseInt(match[1]);
    }
    if (line.includes('시장:')) {
      const match = line.match(/시장:\s*(.+?)(?:,|$)/);
      if (match) info.marketType = match[1].trim();
    }
    if (line.includes('보장금액:')) {
      const match = line.match(/보장금액:\s*([\d,]+)원/);
      if (match) info.coverage = parseInt(match[1].replace(/,/g, ''));
    }
    if (line.includes('수익자:')) {
      const match = line.match(/수익자:\s*(.+?)(?:,|$)/);
      if (match) info.beneficiary = match[1].trim();
    }
    if (line.includes('연금종류:')) {
      const match = line.match(/연금종류:\s*(.+?)(?:,|$)/);
      if (match) info.pensionType = match[1].trim();
    }
    if (line.includes('세제혜택:')) {
      const match = line.match(/세제혜택:\s*(.+?)(?:,|$)/);
      if (match) info.taxBenefit = match[1].trim();
    }
  }

  return info;
};

// 주식 정보 계산
const stockInfo = computed(() => {
  if (props.item.category !== '주식') return {};

  const additionalInfo = parseAdditionalInfo(props.item.memo);
  const info = { ...additionalInfo };

  // 수익률 계산
  if (info.currentPrice && info.quantity && props.item.amount) {
    const currentValue = info.currentPrice * info.quantity;
    info.returnRate = ((currentValue - props.item.amount) / props.item.amount) * 100;
  } else {
    info.returnRate = null;
  }

  return info;
});

// 보험 정보
const insuranceInfo = computed(() => {
  if (props.item.category !== '보험') return {};
  return parseAdditionalInfo(props.item.memo);
});

// 연금 정보
const pensionInfo = computed(() => {
  if (props.item.category !== '연금') return {};
  return parseAdditionalInfo(props.item.memo);
});

// 색상 가져오기
const getCategoryColor = (categoryName) => {
  return CATEGORY_CONFIG[categoryName]?.color || CATEGORY_CONFIG['기타'].color;
};

// 아이콘 가져오기
const getCategoryIcon = (categoryName) => {
  return CATEGORY_CONFIG[categoryName]?.icon || CATEGORY_CONFIG['기타'].icon;
};

// 금액 라벨 가져오기
const getAmountLabel = () => {
  const category = props.item.category;
  const labels = {
    예금: '예치금액',
    적금: '월 적립금액',
    보험: '월 보험료',
    연금: '월 납입금액',
    주식: '투자금액',
    대출: '대출금액',
    기타: '투자금액',
  };
  return labels[category] || '투자금액';
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
  const rates = [props.item.interestRate, props.item.customRate, props.item.expectedReturn].filter(
    (rate) => rate && rate > 0
  );

  if (rates.length === 0) return null;
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

.product-item.expanded {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 0.75rem;
  margin: 0.5rem auto;
  border: 1px solid rgba(185, 187, 204, 0.4);
  transform: translateY(-2px);
}

.product-item.expanded::before {
  background: var(--color-main);
}

.product-item.editing {
  background: var(--color-bg-light);
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
}

.amount-label {
  font-size: 0.7rem;
  color: var(--color-sub);
  font-weight: 500;
  opacity: 0.8;
  margin-bottom: 0.15rem;
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

/* 특수 스타일 */
.preview-item.rate-item {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #1d4ed8;
}

.preview-item.profit-item {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #047857;
}

.preview-item.loss-item {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.3);
  color: #b91c1c;
}

.preview-item.coverage-item {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.3);
  color: #6d28d9;
}

.preview-item.tax-item {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #047857;
}

.preview-item.loan-rate {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #d97706;
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
