<template>
  <div class="modal-overlay" v-if="isVisible" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <div class="modal-title">
          <i class="fas fa-plus-circle"></i>
          새 상품 추가
        </div>
        <button
          class="modal-close"
          @click="handleClose"
          :disabled="isProcessing"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- 모달 바디 -->
      <div class="modal-body">
        <div class="modal-subtitle">
          새로운 투자 상품을 포트폴리오에 추가해보세요
        </div>

        <form @submit.prevent="handleSubmit" class="add-form">
          <div class="form-grid">
            <!-- 상품명 -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-tag"></i>
                상품명
              </label>
              <input
                v-model="formData.customProductName"
                type="text"
                class="form-input"
                placeholder="예: KB Star 정기예금"
                required
                maxlength="100"
                autofocus
              />
            </div>

            <!-- 회사명 -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-building"></i>
                금융회사
              </label>
              <input
                v-model="formData.customCompanyName"
                type="text"
                class="form-input"
                placeholder="예: 국민은행"
                required
                maxlength="50"
                list="company-suggestions"
              />
              <datalist id="company-suggestions">
                <option
                  v-for="company in companySuggestions"
                  :key="company"
                  :value="company"
                >
                  {{ company }}
                </option>
              </datalist>
            </div>

            <!-- 카테고리 -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-th-large"></i>
                카테고리
              </label>
              <select
                v-model="formData.category"
                class="form-input form-select"
                required
              >
                <option value="">카테고리 선택</option>
                <option value="예금">예금</option>
                <option value="적금">적금</option>
                <option value="보험">보험</option>
                <option value="연금">연금</option>
                <option value="주식">주식</option>
                <option value="대출">대출</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <!-- 세부 카테고리 -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tags"></i>
                세부 카테고리
              </label>
              <select
                v-model="formData.subcategory"
                class="form-input form-select"
                :disabled="!formData.category"
              >
                <option value="">세부 분류 선택</option>
                <option
                  v-for="subcategory in availableSubcategories"
                  :key="subcategory"
                  :value="subcategory"
                >
                  {{ subcategory }}
                </option>
              </select>
            </div>

            <!-- 투자금액 -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-coins"></i>
                투자금액
              </label>
              <div class="input-with-unit">
                <input
                  v-model.number="formData.amount"
                  type="number"
                  class="form-input"
                  placeholder="0"
                  min="0"
                  step="10000"
                  required
                />
                <span class="input-unit">원</span>
              </div>
            </div>

            <!-- 금리 -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-percent"></i>
                연 금리 (%)
              </label>
              <div class="input-with-unit">
                <input
                  v-model.number="formData.customRate"
                  type="number"
                  class="form-input"
                  placeholder="0.00"
                  min="0"
                  max="50"
                  step="0.01"
                />
                <span class="input-unit">%</span>
              </div>
            </div>

            <!-- 저축 기간 -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-calendar-alt"></i>
                저축 기간
              </label>
              <div class="input-with-unit">
                <input
                  v-model.number="formData.saveTrm"
                  type="number"
                  class="form-input"
                  placeholder="0"
                  min="0"
                  max="1200"
                />
                <span class="input-unit">개월</span>
              </div>
            </div>

            <!-- 가입일 -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-calendar-plus"></i>
                가입일
              </label>
              <input
                v-model="formData.joinDate"
                type="date"
                class="form-input"
                :max="todayDate"
              />
            </div>

            <!-- 메모 -->
            <div class="form-group full-width">
              <label class="form-label">
                <i class="fas fa-sticky-note"></i>
                메모
              </label>
              <textarea
                v-model="formData.memo"
                class="form-input form-textarea"
                placeholder="상품에 대한 추가 정보를 입력..."
                rows="3"
                maxlength="500"
              ></textarea>
              <div class="character-count" v-if="formData.memo">
                {{ formData.memo.length }}/500자
              </div>
            </div>
          </div>

          <!-- 미리보기 -->
          <div class="preview-section" v-if="canShowPreview">
            <div class="preview-header">
              <i class="fas fa-eye"></i>
              미리보기
            </div>
            <div class="preview-content">
              <div class="preview-item">
                <span class="preview-label">투자금액</span>
                <span class="preview-value">
                  {{ formatCurrency(formData.amount) }}
                </span>
              </div>
              <div
                class="preview-item"
                v-if="formData.customRate && formData.saveTrm"
              >
                <span class="preview-label">예상 이자</span>
                <span class="preview-value profit">
                  {{ formatCurrency(calculateEstimatedInterest()) }}
                </span>
              </div>
              <div
                class="preview-item"
                v-if="formData.joinDate && formData.saveTrm"
              >
                <span class="preview-label">예상 만기일</span>
                <span class="preview-value">
                  {{ calculateMaturityDate() }}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <button
          type="button"
          @click="handleClose"
          class="modal-btn cancel-btn"
          :disabled="isProcessing"
        >
          <i class="fas fa-times"></i>
          취소
        </button>

        <button
          type="button"
          @click="resetForm"
          class="modal-btn reset-btn"
          :disabled="isProcessing"
        >
          <i class="fas fa-sync-alt"></i>
          초기화
        </button>

        <button
          @click="handleSubmit"
          class="modal-btn save-btn"
          :disabled="isProcessing || !isFormValid"
        >
          <i :class="isProcessing ? 'fas fa-sync-alt spin' : 'fas fa-save'"></i>
          {{ isProcessing ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'add-product']);

// 처리 상태
const isProcessing = ref(false);

// 오늘 날짜
const todayDate = new Date().toISOString().split('T')[0];

// 금융회사 추천 목록
const companySuggestions = [
  '국민은행',
  'KB은행',
  '신한은행',
  '하나은행',
  '우리은행',
  'SC제일은행',
  '삼성증권',
  'NH투자증권',
  '키움증권',
  '미래에셋증권',
  '한국투자증권',
  '삼성생명',
  '한화생명',
  '교보생명',
  'DB생명',
  '흥국생명',
  '국민연금',
  '삼성자산운용',
  '미래에셋자산운용',
  'KB자산운용',
];

// 카테고리별 세부 카테고리 매핑
const subcategoryMapping = {
  예금: ['정기예금', '자유예금', '기업예금', 'CMA'],
  적금: ['정기적금', '자유적금', '펀드적금', '연금적금'],
  보험: ['종신보험', '정기보험', '연금보험', '변액보험'],
  연금: ['연금저축', '개인연금', 'IRP', 'DC형'],
  주식: ['국내주식', '해외주식', 'ETF', 'ETN'],
  대출: ['신용대출', '담보대출', '전세자금대출', '주택담보대출'],
  기타: ['부동산', '채권', '금', '암호화폐', '기타투자'],
};

// 사용 가능한 세부 카테고리
const availableSubcategories = computed(() => {
  return subcategoryMapping[formData.value.category] || [];
});

// 폼 데이터
const formData = ref({
  customProductName: '',
  customCompanyName: '',
  category: '',
  subcategory: '',
  amount: null,
  riskLevel: '',
  customRate: null,
  saveTrm: null,
  joinDate: todayDate,
  memo: '',
});

// 폼 유효성 검사
const isFormValid = computed(() => {
  return (
    formData.value.customProductName.trim().length > 0 &&
    formData.value.customCompanyName.trim().length > 0 &&
    formData.value.category.trim().length > 0 &&
    formData.value.amount > 0
  );
});

// 미리보기 표시 여부
const canShowPreview = computed(() => {
  return (
    formData.value.amount > 0 &&
    (formData.value.customRate > 0 ||
      formData.value.saveTrm > 0 ||
      formData.value.joinDate)
  );
});

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

// 예상 이자 계산
const calculateEstimatedInterest = () => {
  if (
    !formData.value.amount ||
    !formData.value.customRate ||
    !formData.value.saveTrm
  )
    return 0;

  const principal = formData.value.amount;
  const rate = formData.value.customRate / 100;
  const months = formData.value.saveTrm;

  // 월 복리 계산
  const futureValue = principal * Math.pow(1 + rate / 12, months);
  return Math.round(futureValue - principal);
};

// 만기일 계산
const calculateMaturityDate = () => {
  if (!formData.value.joinDate || !formData.value.saveTrm) return '';

  const joinDate = new Date(formData.value.joinDate);
  const maturityDate = new Date(joinDate);
  maturityDate.setMonth(maturityDate.getMonth() + formData.value.saveTrm);

  return maturityDate.toLocaleDateString('ko-KR');
};

// 카테고리 변경 시 세부 카테고리 초기화
watch(
  () => formData.value.category,
  (newCategory) => {
    if (
      newCategory &&
      !availableSubcategories.value.includes(formData.value.subcategory)
    ) {
      formData.value.subcategory = '';
    }
  }
);

// 폼 초기화
const resetForm = () => {
  formData.value = {
    customProductName: '',
    customCompanyName: '',
    category: '',
    subcategory: '',
    amount: null,
    riskLevel: '',
    customRate: null,
    saveTrm: null,
    joinDate: todayDate,
    memo: '',
  };
};

// 오버레이 클릭 처리
const handleOverlayClick = () => {
  if (!isProcessing.value) {
    handleClose();
  }
};

// 모달 닫기
const handleClose = () => {
  if (!isProcessing.value) {
    emit('close');
    resetForm();
  }
};

// 폼 제출
const handleSubmit = async () => {
  if (!isFormValid.value || isProcessing.value) return;

  isProcessing.value = true;

  try {
    // 새 상품 데이터 준비
    const newProduct = {
      customProductName: formData.value.customProductName.trim(),
      customCompanyName: formData.value.customCompanyName.trim(),
      category: formData.value.category,
      subcategory: formData.value.subcategory || null,
      amount: formData.value.amount,
      riskLevel: formData.value.riskLevel || null,
      customRate: formData.value.customRate || null,
      saveTrm: formData.value.saveTrm || null,
      joinDate: formData.value.joinDate || null,
      memo: formData.value.memo.trim() || null,
      // 자동 계산된 값들
      estimatedInterest: calculateEstimatedInterest() || null,
      maturityDate:
        formData.value.joinDate && formData.value.saveTrm
          ? new Date(
              new Date(formData.value.joinDate).getTime() +
                formData.value.saveTrm * 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0]
          : null,
    };

    emit('add-product', newProduct);

    // 성공 시 폼 초기화하고 모달 닫기
    resetForm();
  } catch (error) {
    console.error('상품 추가 실패:', error);
  } finally {
    isProcessing.value = false;
  }
};

// ESC 키로 모달 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isVisible && !isProcessing.value) {
    handleClose();
  }
};

// 이벤트 리스너 등록/해제
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 모달이 열릴 때 스크롤 방지
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);
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
  backdrop-filter: blur(0.25rem); /* 4px */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem; /* 16px */
  animation: fadeIn 0.3s ease-out;
}

/* 모달 컨테이너 */
.modal-container {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem; /* 16px */
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.3); /* 0 20px 60px */
  max-width: 26.875rem; /* 430px */
  width: 100%;
  max-height: 80svh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column; /* 플렉스 컨테이너로 만들기 */
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem; /* 16px */
  border-bottom: 0.0625rem solid rgba(185, 187, 204, 0.2); /* 1px */
  background: rgba(255, 255, 255, 0.8);
  flex-shrink: 0; /* 헤더 크기 고정 */
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 8px */
  font-size: 0.875rem; /* 14px */
  font-weight: 700;
  color: var(--color-main);
}

.modal-title i {
  color: var(--color-sub);
  font-size: 0.75rem; /* 12px */
}

.modal-close {
  width: 1.75rem; /* 28px */
  height: 1.75rem; /* 28px */
  border-radius: 50%;
  border: none;
  background: rgba(185, 187, 204, 0.2);
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* 12px */
}

.modal-close:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  transform: scale(1.1);
}

/* 모달 바디 */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 180px);
}

.modal-subtitle {
  color: var(--color-sub);
  font-size: 0.75rem; /* 12px */
  margin-bottom: 1rem; /* 16px */
  text-align: center;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem; /* 8px */
}

.form-group.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-main);
  min-width: 120px;
  flex-shrink: 0;
  white-space: nowrap;
}

.form-label.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 0.25rem;
}

.form-label i {
  font-size: 0.8rem;
  color: var(--color-sub);
  width: 1rem;
  text-align: center;
}

.form-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: 'Pretendard', sans-serif;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  min-width: 0;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
  background: white;
}
.form-select {
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 4rem; /* 64px */
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-with-unit .form-input {
  padding-right: 2rem; /* 32px */
}

.input-unit {
  position: absolute;
  right: 0.75rem; /* 12px */
  color: var(--color-sub);
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  pointer-events: none;
}

.character-count {
  font-size: 0.625rem; /* 10px */
  color: var(--color-sub);
  text-align: right;
  margin-top: 0.25rem; /* 4px */
}

/* 미리보기 섹션 */
.preview-section {
  margin-top: 1rem; /* 16px */
  padding: 1rem; /* 16px */
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.05),
    rgba(125, 129, 162, 0.05)
  );
  border-radius: 0.75rem; /* 12px */
  border: 0.0625rem solid rgba(185, 187, 204, 0.2); /* 1px */
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* 4px */
  font-size: 0.75rem; /* 12px */
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.75rem; /* 12px */
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* 8px */
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem; /* 8px */
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem; /* 8px */
}

.preview-label {
  font-size: 0.75rem; /* 12px */
  color: var(--color-sub);
  font-weight: 500;
}

.preview-value {
  font-size: 0.8125rem; /* 13px */
  font-weight: 600;
  color: var(--color-main);
}

.preview-value.profit {
  color: #10b981;
}

/* 모달 푸터 */
.modal-footer {
  padding: 1rem;
  border-top: 1px solid rgba(185, 187, 204, 0.15);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 249, 252, 0.9) 100%
  );
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.5rem 0.5rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Pretendard', sans-serif;
  min-width: 5rem;
  justify-content: center;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.cancel-btn {
  background: var(--color-light);
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.reset-btn {
  background: var(--color-sub);
  color: white;
}

.reset-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.save-btn {
  background: var(--color-main);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
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
    transform: translateY(1.875rem) scale(0.95); /* 30px */
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

/* 스크롤바 커스터마이징 */
.modal-body::-webkit-scrollbar {
  width: 0.25rem; /* 4px */
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(185, 187, 204, 0.1);
  border-radius: 0.125rem; /* 2px */
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(185, 187, 204, 0.4);
  border-radius: 0.125rem; /* 2px */
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(185, 187, 204, 0.6);
}
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-container,
  .modal-btn,
  .form-input {
    animation: none;
    transition: none;
  }
}

/* 포커스 상태 */
.modal-btn:focus,
.form-input:focus {
  outline: 0.125rem solid var(--color-main); /* 2px */
  outline-offset: 0.125rem; /* 2px */
}
</style>
