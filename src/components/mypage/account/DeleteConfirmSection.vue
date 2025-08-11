<template>
  <div class="confirmation-section">
    <div class="section-header">
      <h3 class="section-title danger">
        <i class="fas fa-exclamation-circle"></i>
        탈퇴 확인
      </h3>
    </div>

    <div class="confirmation-form">
      <!-- 이메일 확인 -->
      <div class="form-group">
        <label class="form-label">
          <i class="fas fa-envelope"></i>
          본인 확인을 위해 이메일을 입력해주세요
        </label>
        <div class="email-display">
          <strong>입력해야 할 이메일:</strong> {{ userInfo.email }}
        </div>
        <input
          :value="confirmEmail"
          type="email"
          class="form-input"
          placeholder="위의 이메일을 정확히 입력하세요"
          :class="{ error: emailError }"
          @input="$emit('update:confirmEmail', $event.target.value)"
          @keyup.enter="$emit('proceed')"
        />
        <div v-if="emailError" class="form-message error">
          <i class="fas fa-exclamation-triangle"></i>
          {{ emailError }}
        </div>
      </div>

      <!-- 탈퇴 사유 -->
      <div class="form-group">
        <label class="form-label">
          <i class="fas fa-comment"></i>
          탈퇴 사유를 선택해주세요 (선택사항)
        </label>
        <select 
          :value="deleteReason" 
          class="form-select"
          @change="$emit('update:deleteReason', $event.target.value)"
        >
          <option value="">사유를 선택하세요</option>
          <option value="not-useful">서비스가 유용하지 않음</option>
          <option value="privacy">개인정보 보호 우려</option>
          <option value="too-complex">사용이 복잡함</option>
          <option value="alternative">다른 서비스 이용</option>
          <option value="temporary">일시적으로 사용 중단</option>
          <option value="other">기타</option>
        </select>
      </div>

      <!-- 추가 의견 -->
      <div v-if="deleteReason === 'other'" class="form-group">
        <label class="form-label">
          <i class="fas fa-edit"></i>
          추가 의견
        </label>
        <textarea
          :value="additionalFeedback"
          class="form-textarea"
          placeholder="서비스 개선을 위한 의견을 남겨주세요"
          rows="3"
          @input="$emit('update:additionalFeedback', $event.target.value)"
        ></textarea>
      </div>

      <!-- 최종 확인 체크박스 -->
      <div class="final-check">
        <label class="check-label">
          <input 
            :checked="finalConfirm" 
            type="checkbox" 
            class="check-input"
            @change="$emit('update:finalConfirm', $event.target.checked)"
          />
          <span class="check-mark"></span>
          <span class="check-text">
            위의 모든 내용을 확인했으며, 계정 탈퇴에 따른
            <strong>데이터 영구 삭제</strong>에 동의합니다.
          </span>
        </label>
      </div>

      <!-- 버튼 그룹 -->
      <div class="form-actions">
        <button
          type="button"
          class="action-btn secondary"
          :disabled="processing"
          @click="$emit('cancel')"
        >
          <i class="fas fa-times"></i>
          취소
        </button>
        <button
          type="button"
          class="action-btn danger"
          :disabled="!canProceed || processing"
          :class="{ processing: processing }"
          @click="$emit('proceed')"
        >
          <i v-if="processing" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-trash"></i>
          {{ processing ? '처리 중...' : '회원 탈퇴' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
  confirmEmail: {
    type: String,
    required: true,
  },
  deleteReason: {
    type: String,
    required: true,
  },
  additionalFeedback: {
    type: String,
    required: true,
  },
  finalConfirm: {
    type: Boolean,
    required: true,
  },
  emailError: {
    type: String,
    required: true,
  },
  canProceed: {
    type: Boolean,
    required: true,
  },
  processing: {
    type: Boolean,
    required: true,
  },
});

defineEmits([
  'update:confirmEmail',
  'update:deleteReason',
  'update:additionalFeedback',
  'update:finalConfirm',
  'clear-email-error',
  'proceed',
  'cancel',
]);
</script>

<style scoped>
.confirmation-section {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.02) 0%, rgba(185, 28, 28, 0.02) 100%);
  border-bottom: 1px solid var(--color-bg-light);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title.danger {
  color: #dc2626;
}

.section-title i {
  font-size: 1rem;
}

.confirmation-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 500;
}

.email-display {
  padding: 0.75rem;
  background: var(--color-bg-light);
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--color-sub);
}

.email-display strong {
  color: var(--color-main);
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--color-white);
  transition: all 0.2s ease;
  color: var(--color-main);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--color-sub);
  opacity: 0.7;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
}

.form-message.error {
  color: #dc2626;
}

/* 체크박스 */
.final-check {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.05) 100%);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 8px;
}

.check-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.check-input {
  display: none;
}

.check-mark {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(220, 38, 38, 0.5);
  border-radius: 4px;
  background: white;
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s ease;
}

.check-input:checked + .check-mark {
  background: #dc2626;
  border-color: #dc2626;
}

.check-input:checked + .check-mark::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.check-text {
  color: var(--color-main);
  font-size: 0.9rem;
  line-height: 1.4;
}

.check-text strong {
  color: #dc2626;
}

/* 액션 버튼 */
.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  justify-content: center;
}

.action-btn.secondary {
  background: var(--color-bg-light);
  color: var(--color-sub);
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover:not(:disabled) {
  background: #e8e9ee;
  color: var(--color-main);
}

.action-btn.danger {
  background: #dc2626;
  color: white;
}

.action-btn.danger:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-btn.processing {
  background: var(--color-sub);
}

@media (max-width: 768px) {
  .confirmation-section {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .action-btn {
    width: 100%;
  }
}
</style>