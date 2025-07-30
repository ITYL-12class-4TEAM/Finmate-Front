<template>
  <div class="product-details" v-show="isExpanded">
    <div class="details-separator"></div>

    <div class="details-grid">
      <!-- 가입일 -->
      <div class="detail-item">
        <div class="detail-icon">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <div class="detail-content">
          <div class="detail-label">가입일</div>
          <div class="detail-value">{{ formatDate(item.joinDate) }}</div>
          <div class="detail-sub">{{ getDaysAgo() }}</div>
        </div>
      </div>

      <!-- 카테고리 정보 -->
      <div class="detail-item">
        <div class="detail-icon">
          <i class="fas fa-tag"></i>
        </div>
        <div class="detail-content">
          <div class="detail-label">카테고리</div>
          <div class="detail-value">{{ item.categoryName }}</div>
          <div class="detail-sub">{{ item.subcategoryName }}</div>
        </div>
      </div>

      <!-- 저축 기간 -->
      <div class="detail-item" v-if="item.saveTerm">
        <div class="detail-icon">
          <i class="fas fa-hourglass-half"></i>
        </div>
        <div class="detail-content">
          <div class="detail-label">저축 기간</div>
          <div class="detail-value">{{ item.saveTerm }}개월</div>
          <div class="detail-sub">{{ getMaturityInfo() }}</div>
        </div>
      </div>

      <!-- 금리/예상 수익 -->
      <div class="detail-item" v-if="item.customRate || item.estimatedInterest">
        <div class="detail-icon">
          <i class="fas fa-percentage"></i>
        </div>
        <div class="detail-content">
          <div class="detail-label">
            {{ item.customRate ? '연 금리' : '예상 수익' }}
          </div>
          <div class="detail-value interest">
            {{
              item.customRate
                ? `${item.customRate}%`
                : formatCurrency(item.estimatedInterest)
            }}
          </div>
          <div class="detail-sub" v-if="item.estimatedAfterTax">
            세후 {{ formatCurrency(item.estimatedAfterTax) }}
          </div>
        </div>
      </div>

      <!-- 만기일 -->
      <div class="detail-item" v-if="item.maturityDate">
        <div class="detail-icon">
          <i class="fas fa-flag-checkered"></i>
        </div>
        <div class="detail-content">
          <div class="detail-label">만기일</div>
          <div class="detail-value">{{ formatDate(item.maturityDate) }}</div>
          <div class="detail-sub">{{ getMaturityDaysLeft() }}</div>
        </div>
      </div>

      <!-- 메모 -->
      <div class="detail-item full-width" v-if="item.memo">
        <div class="detail-icon">
          <i class="fas fa-sticky-note"></i>
        </div>
        <div class="detail-content">
          <div class="detail-label">메모</div>
          <div class="detail-value memo">{{ item.memo }}</div>
        </div>
      </div>

      <!-- 추가 정보가 없는 경우를 위한 안내 -->
      <div
        class="detail-item full-width info-notice"
        v-if="!hasAdditionalInfo()"
      >
        <div class="detail-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <div class="detail-content">
          <div class="detail-label">추가 정보</div>
          <div class="detail-value">
            저축 기간, 금리, 만기일 등의 상세 정보는 아직 등록되지 않았습니다.
          </div>
        </div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="product-actions">
      <button
        @click.stop="handleEdit"
        class="action-btn edit-btn"
        :title="isEditing ? '수정 중' : '수정'"
        :disabled="isEditing || isProcessing"
        :class="{ active: isEditing }"
      >
        <i :class="isEditing ? 'fas fa-spinner fa-spin' : 'fas fa-edit'"></i>
        <span class="btn-text">수정</span>
      </button>

      <button
        @click.stop="handleDelete"
        class="action-btn delete-btn"
        title="삭제"
        :disabled="isProcessing"
      >
        <i class="fas fa-trash"></i>
        <span class="btn-text">삭제</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['start-edit', 'delete-product']);

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

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    '0'
  )}.${String(date.getDate()).padStart(2, '0')}`;
};

// 가입 일수 계산
const getDaysAgo = () => {
  if (!props.item.joinDate) return '';

  const joinDate = new Date(props.item.joinDate);
  const today = new Date();
  const diffTime = Math.abs(today - joinDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘 가입';
  if (diffDays < 30) return `${diffDays}일 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
};

// 만기 정보 계산
const getMaturityInfo = () => {
  if (!props.item.maturityDate || !props.item.joinDate) return '';

  const joinDate = new Date(props.item.joinDate);
  const maturityDate = new Date(props.item.maturityDate);
  const today = new Date();

  if (today > maturityDate) return '만기 완료';

  const totalDays = Math.floor(
    (maturityDate - joinDate) / (1000 * 60 * 60 * 24)
  );
  const passedDays = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
  const progress = Math.floor((passedDays / totalDays) * 100);

  return `진행률 ${progress}%`;
};

// 만기까지 남은 일수
const getMaturityDaysLeft = () => {
  if (!props.item.maturityDate) return '';

  const maturityDate = new Date(props.item.maturityDate);
  const today = new Date();
  const diffTime = maturityDate - today;

  if (diffTime < 0) return '만기 완료';

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '오늘 만기';
  if (diffDays < 30) return `${diffDays}일 남음`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 남음`;
  return `${Math.floor(diffDays / 365)}년 남음`;
};

// 추가 정보 존재 여부 확인
const hasAdditionalInfo = () => {
  return (
    props.item.saveTerm ||
    props.item.customRate ||
    props.item.estimatedInterest ||
    props.item.estimatedAfterTax ||
    props.item.maturityDate
  );
};

// 이벤트 핸들러
const handleEdit = () => {
  if (!props.isEditing && !props.isProcessing) {
    emit('start-edit', props.item);
  }
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
/* 세부 정보 */
.product-details {
  margin-top: 1rem;
  animation: expandIn 0.3s ease-out;
}

.details-separator {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(185, 187, 204, 0.3) 50%,
    transparent 100%
  );
  margin-bottom: 1rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
  transition: all 0.3s ease;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(185, 187, 204, 0.3);
}

.detail-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
  color: white;
  background: linear-gradient(
    135deg,
    var(--color-sub) 0%,
    var(--color-light) 100%
  );
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-value.interest {
  color: #10b981;
  font-weight: 700;
}

.detail-value.memo {
  font-weight: 500;
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.detail-sub {
  font-size: 0.7rem;
  color: var(--color-sub);
  font-weight: 400;
  margin-top: 0.25rem;
  opacity: 0.8;
}

.info-notice {
  background: linear-gradient(
    135deg,
    rgba(185, 187, 204, 0.1) 0%,
    rgba(125, 129, 162, 0.1) 100%
  );
  border: 1px dashed rgba(185, 187, 204, 0.3);
}

.info-notice .detail-icon {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
}

.info-notice .detail-value {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-sub);
  white-space: normal;
  line-height: 1.4;
}

/* 액션 버튼 */
.product-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(185, 187, 204, 0.2);
}

.action-btn {
  flex: 1;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  font-family: 'Pretendard', sans-serif;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.edit-btn {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: white;
}

.edit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-text {
  font-size: 0.8rem;
}

/* 애니메이션 */
@keyframes expandIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .action-btn {
    height: 2.25rem;
    font-size: 0.75rem;
  }

  .btn-text {
    display: none;
  }
}
</style>
