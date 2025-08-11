<template>
  <form v-if="editForm && userInfo" class="edit-section" @submit.prevent="$emit('submit')">
    <div class="section-header">
      <h3 class="section-title">
        <i class="fas fa-edit"></i>
        수정 가능한 정보
      </h3>
    </div>

    <!-- 닉네임 변경 -->
    <div class="form-group">
      <label class="form-label">
        <i class="fas fa-user"></i>
        닉네임
      </label>
      <div class="input-with-button">
        <input
          v-model="editForm.nickname"
          type="text"
          class="form-input"
          placeholder="새 닉네임을 입력하세요"
          maxlength="30"
          :class="{ error: nicknameError, success: nicknameChecked }"
          @input="$emit('nickname-change')"
        />
        <button
          type="button"
          class="check-button"
          :disabled="!editForm.nickname || checkingNickname"
          :class="{ loading: checkingNickname }"
          @click="$emit('check-nickname')"
        >
          <i v-if="checkingNickname" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-check"></i>
          중복확인
        </button>
      </div>

      <div v-if="nicknameError" class="form-message error">
        <i class="fas fa-exclamation-triangle"></i>
        {{ nicknameError }}
      </div>
      <div v-else-if="nicknameChecked" class="form-message success">
        <i class="fas fa-check-circle"></i>
        사용 가능한 닉네임입니다.
      </div>
      <div class="form-hint">2-30자의 한글, 영문, 숫자 조합 (특수문자 제외)</div>
    </div>

    <!-- 비밀번호 변경 -->
    <div v-if="userInfo && userInfo.phoneNumber !== null" class="form-group">
      <div class="toggle-section">
        <label class="toggle-label">
          <input
            :checked="changePassword"
            type="checkbox"
            class="toggle-input"
            @change="$emit('password-change', $event.target.checked)"
          />
          <span class="toggle-slider"></span>
          <span class="toggle-text">
            <i class="fas fa-key"></i>
            비밀번호 변경
          </span>
        </label>
      </div>

      <div v-if="changePassword" class="password-fields">
        <div class="form-group">
          <label class="form-label">새 비밀번호</label>
          <div class="password-input-wrapper">
            <input
              v-model="editForm.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="새 비밀번호를 입력하세요"
              :class="{ error: passwordError }"
              @input="$emit('validate-password')"
            />
            <button
              type="button"
              class="password-toggle-btn"
              @click="$emit('show-password', !showNewPassword)"
            >
              <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div v-if="passwordError" class="form-message error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ passwordError }}
          </div>
          <div class="form-hint">8자 이상, 영문+숫자+특수문자 조합</div>
        </div>

        <div class="form-group">
          <label class="form-label">새 비밀번호 확인</label>
          <input
            v-model="editForm.confirmPassword"
            :type="showNewPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="새 비밀번호를 다시 입력하세요"
            :class="{ error: confirmPasswordError }"
            @input="$emit('validate-password')"
          />
          <div v-if="confirmPasswordError" class="form-message error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ confirmPasswordError }}
          </div>
        </div>
      </div>
    </div>

    <!-- 알림 설정 -->
    <div class="form-group">
      <div class="section-header small">
        <h4 class="section-title small">
          <i class="fas fa-bell"></i>
          알림 설정
        </h4>
      </div>

      <div class="notification-setting">
        <label class="notification-label">
          <input
            v-model="editForm.receivePushNotification"
            type="checkbox"
            class="notification-input"
          />
          <span class="notification-slider"></span>
          <div class="notification-content">
            <span class="notification-title">푸시 알림 받기</span>
            <span class="notification-desc"
              >새로운 댓글, 좋아요, 공지사항 등의 알림을 받을 수 있습니다.</span
            >
          </div>
        </label>
      </div>
    </div>

    <!-- 수정 버튼 -->
    <div class="form-actions">
      <button
        type="submit"
        class="submit-button"
        :disabled="loading || !isFormValid"
        :class="{ loading: loading }"
      >
        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-save"></i>
        {{ loading ? '저장 중...' : '변경사항 저장' }}
      </button>
    </div>
  </form>

  <!-- 로딩 상태 -->
  <div v-else class="loading-container">
    <div class="loading-spinner"></div>
    <span>폼을 준비하는 중...</span>
  </div>
</template>

<script setup>
defineProps({
  editForm: {
    type: Object,
    required: true,
  },
  userInfo: {
    type: Object,
    required: true,
  },
  changePassword: {
    type: Boolean,
    default: false,
  },
  showNewPassword: {
    type: Boolean,
    default: false,
  },
  checkingNickname: {
    type: Boolean,
    default: false,
  },
  nicknameChecked: {
    type: Boolean,
    default: false,
  },
  nicknameError: {
    type: String,
    default: '',
  },
  passwordError: {
    type: String,
    default: '',
  },
  confirmPasswordError: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isFormValid: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  'nickname-change',
  'check-nickname',
  'password-change',
  'show-password',
  'validate-password',
  'submit',
]);
</script>

<style scoped>
.edit-section {
  padding: 0;
}

.section-header {
  margin-bottom: 1.25rem;
}

.section-header.small {
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
}

.section-title.small {
  font-size: 0.95rem;
}

.section-title i {
  font-size: 0.9rem;
  color: var(--color-sub);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-main);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  background: #f8fafc;
  transition: all 0.2s ease;
  color: var(--color-main);
  font-weight: 500;
}

.form-input::placeholder {
  color: var(--color-light);
  font-weight: 400;
}

.form-input:focus {
  outline: none;
  background: var(--color-white);
  box-shadow: 0 0 0 2px var(--color-main);
}

.form-input.error {
  background: #fef2f2;
  box-shadow: 0 0 0 2px #dc2626;
}

.form-input.success {
  background: #f0fdf4;
  box-shadow: 0 0 0 2px #10b981;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.input-with-button .form-input {
  flex: 1;
}

.check-button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.875rem 1rem;
  background: var(--color-main);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: auto;
}

.check-button:hover:not(:disabled) {
  background: #252968;
  transform: translateY(-1px);
}

.check-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.check-button.loading {
  background: var(--color-sub);
}

.form-message {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.form-message.error {
  color: #dc2626;
}

.form-message.success {
  color: #10b981;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-top: 0.4rem;
  font-weight: 500;
}

/* 토글 스타일 */
.toggle-section {
  margin-bottom: 1rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: var(--color-main);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-main);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.password-fields {
  margin-top: 1.25rem;
  padding: 1.25rem;
  background: var(--color-white);
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}

.password-fields .form-input {
  background: var(--color-white);
  border: 1px solid #e2e8f0;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle-btn {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-light);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.password-toggle-btn:hover {
  color: var(--color-main);
  background: #f1f5f9;
}

/* 알림 설정 */
.notification-setting {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.notification-setting:hover {
  background: #f1f5f9;
}

.notification-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.notification-input {
  display: none;
}

.notification-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.notification-input:checked + .notification-slider {
  background: #10b981;
}

.notification-input:checked + .notification-slider::before {
  transform: translateX(20px);
}

.notification-content {
  flex: 1;
}

.notification-title {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.2rem;
}

.notification-desc {
  font-size: 0.8rem;
  color: var(--color-sub);
  line-height: 1.4;
  font-weight: 500;
}

/* 제출 버튼 */
.form-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
}

.submit-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--color-main);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
}

.submit-button:hover:not(:disabled) {
  background: #252968;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 51, 107, 0.25);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.submit-button.loading {
  background: var(--color-sub);
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 2rem;
}

.loading-container .loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-container span {
  font-size: 0.9rem;
  color: var(--color-sub);
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .edit-section {
    padding: 0;
  }

  .input-with-button {
    flex-direction: row;
    gap: 0.5rem;
  }

  .check-button {
    padding: 0.875rem 0.875rem;
    font-size: 0.75rem;
  }

  .password-fields {
    padding: 1rem;
  }

  .form-actions {
    padding-top: 1.25rem;
  }

  .submit-button {
    padding: 0.875rem;
    font-size: 0.85rem;
  }
}
</style>
