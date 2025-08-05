<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container" @click.stop>
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <div class="modal-title-section">
            <h4 class="modal-title">
              {{ item.customProductName || '상품 상세정보' }}
            </h4>
            <div class="modal-subtitle">
              <span class="company-name">{{ item.customCompanyName || '회사명 없음' }}</span>
              <span class="category-divider">•</span>
              <span class="subcategory-name">{{ item.subcategory || '분류 없음' }}</span>
            </div>
          </div>
          <button class="modal-close" title="닫기" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 모달 바디 -->
        <div class="modal-body">
          <!-- 세부 정보 그리드 -->
          <div class="details-grid">
            <!-- 가입일 -->
            <div class="detail-item">
              <div class="detail-icon calendar">
                <i class="fas fa-calendar-plus"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">가입일</div>
                <div class="detail-value">{{ formatDate(item.joinDate) }}</div>
                <div class="detail-sub">{{ getDaysAgo() }}</div>
              </div>
            </div>

            <!-- 카테고리 정보 -->
            <div class="detail-item">
              <div class="detail-icon category">
                <i class="fas fa-tags"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">상품 분류</div>
                <div class="detail-value">{{ item.category }}</div>
                <div class="detail-sub">{{ item.subcategory }}</div>
              </div>
            </div>

            <!-- 회사명 -->
            <div class="detail-item">
              <div class="detail-icon company">
                <i class="fas fa-building"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">금융회사</div>
                <div class="detail-value">
                  {{ item.customCompanyName || '회사명 없음' }}
                </div>
                <div v-if="getCompanyType()" class="detail-sub">
                  {{ getCompanyType() }}
                </div>
              </div>
            </div>

            <!-- 저축 기간 -->
            <div v-if="item.saveTrm" class="detail-item">
              <div class="detail-icon duration">
                <i class="fas fa-hourglass-half"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">저축 기간</div>
                <div class="detail-value">{{ item.saveTrm }}개월</div>
                <div class="detail-sub">{{ getMaturityInfo() }}</div>
              </div>
            </div>

            <!-- 금리 정보 -->
            <div v-if="hasRateInfo()" class="detail-item">
              <div class="detail-icon rate">
                <i class="fas fa-percent"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">수익률 정보</div>
                <div class="detail-value interest">{{ formatRateInfo() }}</div>
                <div v-if="item.expectedReturn" class="detail-sub">
                  예상수익률 {{ item.expectedReturn }}%
                </div>
              </div>
            </div>

            <!-- 만기일 -->
            <div v-if="item.maturityDate" class="detail-item">
              <div class="detail-icon maturity">
                <i class="fas fa-flag"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">만기일</div>
                <div class="detail-value">
                  {{ formatDate(item.maturityDate) }}
                </div>
                <div class="detail-sub" :class="getMaturityStatusClass()">
                  {{ getMaturityDaysLeft() }}
                </div>
              </div>
            </div>

            <!-- 예상 수익 -->
            <div v-if="item.estimatedInterest || item.estimatedAfterTax" class="detail-item">
              <div class="detail-icon profit">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">예상 수익</div>
                <div v-if="item.estimatedInterest" class="detail-value profit">
                  {{ formatCurrency(item.estimatedInterest) }}
                </div>
                <div v-if="item.estimatedAfterTax" class="detail-sub">
                  세후 {{ formatCurrency(item.estimatedAfterTax) }}
                </div>
              </div>
            </div>

            <!-- 메모 -->
            <div v-if="item.memo && item.memo.trim()" class="detail-item full-width">
              <div class="detail-icon memo">
                <i class="fas fa-sticky-note"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">메모</div>
                <div class="detail-value memo">{{ item.memo }}</div>
              </div>
            </div>

            <!-- 추가 정보 없음 -->
            <div v-if="!hasAdditionalInfo()" class="detail-item full-width info-notice">
              <div class="detail-icon info">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">추가 정보</div>
                <div class="detail-value">
                  저축 기간, 금리, 만기일 등의 상세 정보를 추가로 등록할 수 있습니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 모달 푸터 -->
        <div class="modal-footer">
          <div class="product-actions">
            <button
              class="action-btn edit-btn"
              :title="isEditing ? '수정 중' : '수정'"
              :disabled="isEditing || isProcessing"
              :class="{ active: isEditing }"
              @click="handleEdit"
            >
              <i :class="isEditing ? 'fas fa-sync-alt spin' : 'fas fa-pen'"></i>
              <span class="btn-text">수정</span>
            </button>

            <!-- ProductDetails.vue 템플릿 -->
            <button
              class="action-btn delete-btn"
              title="삭제"
              :disabled="isProcessing || isDeleting"
              @click="handleDelete"
            >
              <i :class="isDeleting ? 'fas fa-sync-alt spin' : 'fas fa-trash'"></i>
              <span class="btn-text">{{ isDeleting ? '처리중...' : '삭제' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, Teleport } from 'vue';
import ProductStatus from './ProductStatusBadge.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close', 'start-edit', 'delete-product']);

const isDeleting = ref(false);

// 애니메이션 상태
const isOpening = ref(false);
const isClosing = ref(false);

// 6개 메인 카테고리 색상 팔레트
const CATEGORY_COLORS = {
  예금: '#2d336b',
  적금: '#5a6085',
  보험: '#6b7394',
  대출: '#9ca0b8',
  주식: '#7d81a2',
  기타: '#8a8ea6',
  연금: '#5a6085',
};

// 모달 닫기
const closeModal = () => {
  emit('close');
};

// ESC 키로 모달 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isVisible) {
    closeModal();
  }
};

// 키보드 이벤트 리스너 등록
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    } else {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    }
  }
);

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

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}.${String(date.getDate()).padStart(2, '0')}`;
  } catch (error) {
    return '-';
  }
};

// 회사 타입 추측
const getCompanyType = () => {
  const companyName = props.item.customCompanyName || '';
  if (companyName.includes('은행')) return '은행';
  if (companyName.includes('증권')) return '증권회사';
  if (companyName.includes('보험')) return '보험회사';
  if (companyName.includes('카드')) return '카드회사';
  if (companyName.includes('캐피탈')) return '캐피탈';
  if (companyName.includes('농협')) return '농협';
  if (companyName.includes('신협')) return '신용협동조합';
  if (companyName.includes('주식회사') || companyName.includes('(주)')) return '주식회사';
  if (companyName.includes('유한회사')) return '유한회사';
  return '';
};

// 가입 일수 계산
const getDaysAgo = () => {
  if (!props.item.joinDate) return '';
  try {
    const joinDate = new Date(props.item.joinDate);
    if (isNaN(joinDate.getTime())) return '';
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘 가입';
    if (diffDays < 30) return `${diffDays}일 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  } catch (error) {
    return '';
  }
};

// 수익률 정보 존재 여부
const hasRateInfo = () => {
  return !!(props.item.interestRate || props.item.customRate);
};

// 수익률 정보 포맷팅
const formatRateInfo = () => {
  const rates = [];
  if (props.item.interestRate) {
    rates.push(`기준금리 ${props.item.interestRate}%`);
  }
  if (props.item.customRate) {
    rates.push(`실제금리 ${props.item.customRate}%`);
  }
  return rates.join(' / ') || '정보 없음';
};

// 만기 정보 계산
const getMaturityInfo = () => {
  if (!props.item.maturityDate || !props.item.joinDate) return '';
  try {
    const joinDate = new Date(props.item.joinDate);
    const maturityDate = new Date(props.item.maturityDate);
    const today = new Date();
    if (isNaN(joinDate.getTime()) || isNaN(maturityDate.getTime())) return '';
    if (today > maturityDate) return '만기 완료';
    const totalDays = Math.floor((maturityDate - joinDate) / (1000 * 60 * 60 * 24));
    const passedDays = Math.max(0, Math.floor((today - joinDate) / (1000 * 60 * 60 * 24)));
    const progress = Math.min(100, Math.floor((passedDays / totalDays) * 100));
    return `진행률 ${progress}%`;
  } catch (error) {
    return '';
  }
};

// 만기까지 남은 일수
const getMaturityDaysLeft = () => {
  if (!props.item.maturityDate) return '';
  try {
    const maturityDate = new Date(props.item.maturityDate);
    if (isNaN(maturityDate.getTime())) return '';
    const today = new Date();
    const diffTime = maturityDate - today;
    if (diffTime < 0) return '만기 완료';
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘 만기';
    if (diffDays <= 7) return `${diffDays}일 남음 (임박)`;
    if (diffDays <= 30) return `${diffDays}일 남음`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 남음`;
    return `${Math.floor(diffDays / 365)}년 남음`;
  } catch (error) {
    return '';
  }
};

// 만기 상태 클래스
const getMaturityStatusClass = () => {
  if (!props.item.maturityDate) return '';
  try {
    const maturityDate = new Date(props.item.maturityDate);
    if (isNaN(maturityDate.getTime())) return '';
    const today = new Date();
    const diffTime = maturityDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffTime < 0) return 'completed';
    if (diffDays <= 7) return 'urgent';
    if (diffDays <= 30) return 'warning';
    return '';
  } catch (error) {
    return '';
  }
};

// 추가 정보 존재 여부 확인
const hasAdditionalInfo = () => {
  return !!(
    props.item.saveTrm ||
    props.item.interestRate ||
    props.item.customRate ||
    props.item.expectedReturn ||
    props.item.estimatedInterest ||
    props.item.estimatedAfterTax ||
    props.item.maturityDate ||
    (props.item.memo && props.item.memo.trim())
  );
};

// 이벤트 핸들러
const handleEdit = () => {
  if (!props.isEditing && !props.isProcessing) {
    emit('start-edit', props.item);
  }
};

const handleDelete = (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (props.isProcessing || isDeleting.value) {
    console.log('🚫 삭제 요청 무시 - 이미 처리 중');
    return;
  }

  console.log('🗑️ 삭제 요청 시작');
  isDeleting.value = true;

  emit('delete-product', props.item);

  setTimeout(() => {
    closeModal();
  }, 100);
};
</script>

<style scoped>
/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

/* 모달 컨테이너 */
.modal-container {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 2px solid rgba(185, 187, 204, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 252, 0.9) 100%);
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 0.5rem 0;
}

.modal-subtitle {
  font-size: 0.85rem;
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

.modal-close {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(185, 187, 204, 0.3);
  color: var(--color-sub);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: white;
  border-color: var(--color-main);
  color: var(--color-main);
  transform: scale(1.1);
}

/* 모달 바디 */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

/* 상품 요약 카드 */
.product-summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 252, 0.9) 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.08);
}

.amount-display {
  flex: 1;
}

.amount-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.25rem;
}

.amount-ratio {
  font-size: 0.85rem;
  color: var(--color-sub);
  font-weight: 500;
  opacity: 0.8;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.category-badge i {
  font-size: 0.75rem;
}

/* 세부 정보 그리드 */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.1);
}

.detail-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
  color: white;
  transition: all 0.3s ease;
}

/* 아이콘별 색상 */
.detail-icon.calendar {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}
.detail-icon.category {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}
.detail-icon.company {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}
.detail-icon.duration {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}
.detail-icon.rate {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
.detail-icon.maturity {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
.detail-icon.profit {
  background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
}
.detail-icon.memo {
  background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
}
.detail-icon.info {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--color-sub);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.detail-value.interest {
  color: #10b981;
  font-weight: 700;
}

.detail-value.profit {
  color: #059669;
  font-weight: 700;
}

.detail-value.memo {
  font-weight: 500;
  white-space: normal;
  line-height: 1.5;
}

.detail-sub {
  font-size: 0.8rem;
  color: var(--color-sub);
  font-weight: 400;
  opacity: 0.8;
  line-height: 1.4;
}

.detail-sub.completed {
  color: #10b981;
  font-weight: 500;
}
.detail-sub.urgent {
  color: #dc2626;
  font-weight: 600;
}
.detail-sub.warning {
  color: #f59e0b;
  font-weight: 500;
}

/* 특별 상태 */
.info-notice {
  background: linear-gradient(135deg, rgba(185, 187, 204, 0.1) 0%, rgba(125, 129, 162, 0.1) 100%);
  border: 1px dashed rgba(185, 187, 204, 0.4);
}

.info-notice .detail-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-sub);
  line-height: 1.5;
}

/* 모달 푸터 */
.modal-footer {
  padding: 0.5rem;
  border-top: 1px solid rgba(185, 187, 204, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 252, 0.9) 100%);
}

.product-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  flex: 1;
  height: 2rem;
  width: 5rem;
  border-radius: 1rem;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.edit-btn {
  background: var(--color-main);
  color: white;
}

.edit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 51, 107, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.3);
}

.btn-text {
  font-size: 0.9rem;
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 반응형 */
</style>
