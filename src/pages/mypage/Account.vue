<template>
  <div class="password-verify">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h2 class="page-title">본인 확인</h2>
      <p class="page-subtitle">
        회원정보 변경을 위해 현재 비밀번호를 입력해주세요
      </p>
    </div>

    <!-- 메인 카드 -->
    <div class="verify-container">
      <div class="verify-card">
        <!-- 사용자 정보 카드 -->
        <div class="user-info-card">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-details">
            <div class="user-name">{{ userInfo.nickname }}</div>
            <div class="user-email">{{ userInfo.email }}</div>
          </div>
        </div>

        <!-- 비밀번호 입력 폼 -->
        <form @submit.prevent="verifyPassword" class="verify-form">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-key me-2"></i>
              현재 비밀번호
            </label>
            <div class="password-input-wrapper">
              <input
                v-model="currentPassword"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="현재 비밀번호를 입력하세요"
                :class="{ error: hasError }"
                :disabled="loading"
                @input="clearError"
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePasswordVisibility"
                :disabled="loading"
              >
                <i
                  :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                ></i>
              </button>
            </div>
            <div v-if="hasError" class="error-message">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ errorMessage }}
            </div>
          </div>

          <!-- 제출 버튼 -->
          <button
            type="submit"
            class="verify-btn"
            :disabled="loading || !currentPassword.trim()"
            :class="{ loading: loading }"
          >
            <div class="btn-content">
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check-circle"></i>
              <span>{{ loading ? '확인 중...' : '비밀번호 확인' }}</span>
            </div>
          </button>
        </form>

        <!-- 보안 안내 -->
        <div class="security-notice">
          <div class="notice-header">
            <i class="fas fa-info-circle"></i>
            <span>보안 안내</span>
          </div>
          <ul class="notice-list">
            <li>비밀번호는 암호화되어 안전하게 처리됩니다</li>
            <li>본인 확인 후 회원정보를 안전하게 변경할 수 있습니다</li>
            <li>비밀번호를 잊으셨다면 비밀번호 찾기를 이용해주세요</li>
          </ul>
        </div>

        <!-- 하단 링크 -->
        <div class="bottom-links">
          <button
            @click="forgotPassword"
            class="link-btn primary"
            :disabled="loading"
          >
            <i class="fas fa-question-circle me-2"></i>
            비밀번호를 잊으셨나요?
          </button>
        </div>
      </div>
    </div>

    <!-- 성공 모달 (옵션) -->
    <div
      v-if="showSuccessModal"
      class="success-modal"
      @click="closeSuccessModal"
    >
      <div class="modal-content" @click.stop>
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>비밀번호 확인 완료</h3>
        <p>
          본인 확인이 완료되었습니다.<br />회원정보 수정 페이지로 이동합니다.
        </p>
        <button @click="proceedToEdit" class="modal-btn">계속하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 반응형 데이터
const loading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const currentPassword = ref('');
const showPassword = ref(false);
const showSuccessModal = ref(false);

// 사용자 정보
const userInfo = ref({
  nickname: '테스트유저',
  email: 'testuser@example.com',
  profileImage: null,
});

// 비밀번호 표시/숨김 토글
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// 에러 메시지 클리어
const clearError = () => {
  if (hasError.value) {
    hasError.value = false;
    errorMessage.value = '';
  }
};

// 비밀번호 확인
const verifyPassword = async () => {
  if (!currentPassword.value.trim()) {
    hasError.value = true;
    errorMessage.value = '비밀번호를 입력해주세요.';
    return;
  }

  loading.value = true;
  hasError.value = false;
  errorMessage.value = '';

  try {
    // 서버 요청 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 간단한 비밀번호 체크 (실제로는 서버에서 검증)
    if (currentPassword.value === 'Test@1234') {
      // 인증 정보 저장
      localStorage.setItem('passwordVerified', 'true');
      localStorage.setItem('verificationTime', Date.now().toString());

      // 성공 모달 표시
      showSuccessModal.value = true;
    } else {
      hasError.value = true;
      errorMessage.value = '비밀번호가 일치하지 않습니다. 다시 확인해주세요.';
    }
  } catch (err) {
    hasError.value = true;
    errorMessage.value = '비밀번호 확인 중 오류가 발생했습니다.';
    console.error('Password verification error:', err);
  } finally {
    loading.value = false;
  }
};

// 성공 모달 닫기
const closeSuccessModal = () => {
  showSuccessModal.value = false;
  proceedToEdit();
};

// 수정 페이지로 이동
const proceedToEdit = () => {
  showSuccessModal.value = false;
  router.push('/mypage/settings/edit');
};

// 비밀번호 찾기
const forgotPassword = () => {
  // 실제로는 비밀번호 찾기 페이지로 이동
  alert('비밀번호 찾기 기능은 준비 중입니다.');
};
</script>

<style scoped>
.password-verify {
  min-height: 40vh;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
}

/* 페이지 헤더 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.5rem;
  font-family: 'Pretendard', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-subtitle {
  color: var(--color-sub);
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

/* 메인 컨테이너 */
.verify-container {
  display: flex;
  justify-content: center;
  flex: 1;
}

.verify-card {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 480px;
  height: fit-content;
}

/* 보안 섹션 */
.security-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(185, 187, 204, 0.2);
}

/* 사용자 정보 카드 */
.user-info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  margin-bottom: 1.5rem;
  position: relative;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-sub) 0%,
    var(--color-light) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.85rem;
  color: var(--color-sub);
  font-weight: 500;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
}

/* 폼 스타일 */
.verify-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: flex;
  align-items: center;
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.password-input-wrapper {
  position: relative;
  display: flex;
}

.form-input {
  flex: 1;
  padding: 0.875rem 3rem 0.875rem 0.875rem;
  border: 2px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  font-family: 'Pretendard', sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 4px rgba(45, 51, 107, 0.1);
  background: white;
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-sub);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.password-toggle:hover:not(:disabled) {
  color: var(--color-main);
  background: rgba(185, 187, 204, 0.1);
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

/* 확인 버튼 */
.verify-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(45, 51, 107, 0.2);
}

.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.verify-btn.loading {
  background: linear-gradient(
    135deg,
    var(--color-sub) 0%,
    var(--color-light) 100%
  );
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 하단 링크 */
.bottom-links {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.link-btn {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  flex: 1;
  justify-content: center;
}

.link-btn.secondary {
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-sub);
  border: 1px solid rgba(185, 187, 204, 0.3);
}

.link-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-main);
  border-color: rgba(185, 187, 204, 0.5);
}

.link-btn.primary {
  background: linear-gradient(
    135deg,
    rgba(185, 187, 204, 0.2) 0%,
    rgba(125, 129, 162, 0.2) 100%
  );
  color: var(--color-main);
  border: 1px solid rgba(185, 187, 204, 0.3);
}

.link-btn.primary:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    rgba(185, 187, 204, 0.3) 0%,
    rgba(125, 129, 162, 0.3) 100%
  );
  border-color: rgba(185, 187, 204, 0.5);
}

.link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 성공 모달 */
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.success-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: white;
}

.modal-content h3 {
  color: var(--color-main);
  margin-bottom: 1rem;
}

.modal-content p {
  color: var(--color-sub);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(45, 51, 107, 0.2);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .password-verify {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .verify-card {
    padding: 1.5rem;
  }

  .security-icon {
    width: 3rem;
    height: 3rem;
  }

  .security-icon i {
    font-size: 1.25rem;
  }

  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .bottom-links {
    flex-direction: column;
  }

  .link-btn {
    flex: none;
  }
}

@media (max-width: 480px) {
  .verify-card {
    padding: 1rem;
  }

  .user-info-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .verified-badge {
    position: static;
    align-self: center;
  }
}
</style>
