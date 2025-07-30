<template>
  <div class="product-edit-form">
    <div class="form-separator"></div>

    <div class="form-header">
      <div class="form-title">
        <i class="fas fa-edit"></i>
        상품 정보 수정
      </div>
      <div class="form-subtitle">필요한 정보를 수정하고 저장해주세요</div>
    </div>

    <form @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-grid">
        <!-- 상품명 -->
        <div class="form-group full-width">
          <label class="form-label">
            <i class="fas fa-tag"></i>
            상품명
          </label>
          <input
            v-model="formData.productName"
            type="text"
            class="form-input"
            placeholder="상품명을 입력하세요"
            required
          />
        </div>

        <!-- 카테고리 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-list"></i>
            카테고리
          </label>
          <select
            v-model="formData.categoryName"
            class="form-input form-select"
          >
            <option value="">카테고리 선택</option>
            <option value="예금">예금</option>
            <option value="적금">적금</option>
            <option value="펀드">펀드</option>
            <option value="연금">연금</option>
            <option value="투자">투자</option>
            <option value="보험">보험</option>
            <option value="대출">대출</option>
          </select>
        </div>

        <!-- 세부 카테고리 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-tags"></i>
            세부 카테고리
          </label>
          <input
            v-model="formData.subcategoryName"
            type="text"
            class="form-input"
            placeholder="예: 정기예금, 자유적금"
          />
        </div>

        <!-- 금액 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-won-sign"></i>
            금액
          </label>
          <input
            v-model.number="formData.amount"
            type="number"
            class="form-input"
            placeholder="0"
            min="0"
            step="10000"
            required
          />
        </div>

        <!-- 연 금리 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-percentage"></i>
            연 금리 (%)
          </label>
          <input
            v-model.number="formData.customRate"
            type="number"
            class="form-input"
            placeholder="0.00"
            min="0"
            max="100"
            step="0.01"
          />
        </div>

        <!-- 저축 기간 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-calendar"></i>
            저축 기간 (개월)
          </label>
          <input
            v-model.number="formData.saveTerm"
            type="number"
            class="form-input"
            placeholder="0"
            min="0"
            max="1200"
          />
        </div>

        <!-- 가입일 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-calendar-plus"></i>
            가입일
          </label>
          <input v-model="formData.joinDate" type="date" class="form-input" />
        </div>

        <!-- 만기일 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-flag-checkered"></i>
            만기일
          </label>
          <input
            v-model="formData.maturityDate"
            type="date"
            class="form-input"
          />
        </div>

        <!-- 예상 수익 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-chart-line"></i>
            예상 수익
          </label>
          <input
            v-model.number="formData.estimatedInterest"
            type="number"
            class="form-input"
            placeholder="0"
            min="0"
            step="1000"
          />
        </div>

        <!-- 세후 예상 수익 -->
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-calculator"></i>
            세후 예상 수익
          </label>
          <input
            v-model.number="formData.estimatedAfterTax"
            type="number"
            class="form-input"
            placeholder="0"
            min="0"
            step="1000"
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
            placeholder="추가 메모를 입력하세요..."
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- 폼 액션 버튼 -->
      <div class="form-actions">
        <button
          type="button"
          @click="handleCancel"
          class="form-btn cancel-btn"
          :disabled="isProcessing"
        >
          <i class="fas fa-times"></i>
          <span class="btn-text">취소</span>
        </button>

        <button
          type="submit"
          class="form-btn save-btn"
          :disabled="isProcessing || !isFormValid"
        >
          <i
            :class="isProcessing ? 'fas fa-spinner fa-spin' : 'fas fa-save'"
          ></i>
          <span class="btn-text">{{
            isProcessing ? '저장 중...' : '저장'
          }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save-product', 'cancel-edit']);

// 폼 데이터 초기화
const formData = ref({
  portfolioId: props.item.portfolioId || '',
  productName: props.item.productName || '',
  categoryName: props.item.categoryName || '',
  subcategoryName: props.item.subcategoryName || '',
  amount: props.item.amount || 0,
  customRate: props.item.customRate || null,
  saveTerm: props.item.saveTerm || null,
  joinDate: props.item.joinDate ? formatDateForInput(props.item.joinDate) : '',
  maturityDate: props.item.maturityDate
    ? formatDateForInput(props.item.maturityDate)
    : '',
  estimatedInterest: props.item.estimatedInterest || null,
  estimatedAfterTax: props.item.estimatedAfterTax || null,
  memo: props.item.memo || '',
});

// 날짜를 input[type="date"] 형식으로 변환
function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// 폼 유효성 검사
const isFormValid = computed(() => {
  return (
    formData.value.productName.trim().length > 0 && formData.value.amount > 0
  );
});

// 가입일이 변경될 때 저축 기간에 따라 만기일 자동 계산
watch([() => formData.value.joinDate, () => formData.value.saveTerm], () => {
  if (formData.value.joinDate && formData.value.saveTerm > 0) {
    const joinDate = new Date(formData.value.joinDate);
    const maturityDate = new Date(joinDate);
    maturityDate.setMonth(maturityDate.getMonth() + formData.value.saveTerm);

    formData.value.maturityDate = formatDateForInput(maturityDate);
  }
});

// 연 금리와 금액이 변경될 때 예상 수익 자동 계산
watch(
  [
    () => formData.value.customRate,
    () => formData.value.amount,
    () => formData.value.saveTerm,
  ],
  () => {
    if (
      formData.value.customRate > 0 &&
      formData.value.amount > 0 &&
      formData.value.saveTerm > 0
    ) {
      // 단순한 복리 계산 (실제로는 더 복잡한 계산이 필요할 수 있음)
      const principal = formData.value.amount;
      const rate = formData.value.customRate / 100;
      const time = formData.value.saveTerm / 12;

      const estimatedTotal = principal * Math.pow(1 + rate, time);
      const estimatedInterest = Math.round(estimatedTotal - principal);

      formData.value.estimatedInterest = estimatedInterest;

      // 세후 수익 (일반적으로 이자소득세 15.4% 적용)
      const taxRate = 0.154;
      formData.value.estimatedAfterTax = Math.round(
        estimatedInterest * (1 - taxRate)
      );
    }
  }
);

// 폼 제출 처리
const handleSubmit = () => {
  if (!isFormValid.value || props.isProcessing) return;

  // 빈 값들을 null로 변환
  const cleanedData = { ...formData.value };

  Object.keys(cleanedData).forEach((key) => {
    if (cleanedData[key] === '' || cleanedData[key] === 0) {
      if (key === 'productName' || key === 'portfolioId') return; // 필수 필드는 제외
      cleanedData[key] = null;
    }
  });

  emit('save-product', cleanedData);
};

// 취소 처리
const handleCancel = () => {
  if (!props.isProcessing) {
    emit('cancel-edit');
  }
};
</script>

<style scoped>
.product-edit-form {
  margin-top: 1rem;
  animation: slideDown 0.3s ease-out;
}

.form-separator {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(45, 51, 107, 0.3) 50%,
    transparent 100%
  );
  margin-bottom: 1rem;
}

.form-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.25rem;
}

.form-title i {
  color: var(--color-sub);
}

.form-subtitle {
  font-size: 0.85rem;
  color: var(--color-sub);
  font-weight: 500;
}

.edit-form {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-main);
}

.form-label i {
  font-size: 0.8rem;
  color: var(--color-sub);
  width: 1rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: 'Pretendard', sans-serif;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
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
  min-height: 4rem;
  font-family: 'Pretendard', sans-serif;
}

.form-input::placeholder {
  color: rgba(125, 129, 162, 0.6);
}

/* 숫자 입력 필드 스타일 */
.form-input[type='number'] {
  text-align: right;
}

.form-input[type='date'] {
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(185, 187, 204, 0.2);
}

.form-btn {
  flex: 1;
  height: 2.75rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.9rem;
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

.form-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.cancel-btn {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.save-btn {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
}

.btn-text {
  font-size: 0.9rem;
}

/* 애니메이션 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 폼 입력 포커스 애니메이션 */
.form-input {
  position: relative;
}

.form-input:focus {
  animation: focusGlow 0.3s ease-out;
}

@keyframes focusGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(45, 51, 107, 0.3);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .edit-form {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-btn {
    height: 2.5rem;
  }

  .btn-text {
    font-size: 0.85rem;
  }
}

/* 유효성 검사 시각적 피드백 */
.form-input:invalid {
  border-color: #ef4444;
}

.form-input:valid {
  border-color: #10b981;
}

/* 로딩 상태 */
.form-btn .fa-spinner {
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
</style>
