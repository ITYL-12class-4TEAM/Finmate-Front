<template>
  <div class="password-verify">
    <!-- 메인 카드 -->
    <div class="verify-container">
      <div class="verify-card">
        <!-- 비밀번호 입력 폼 -->
        <form class="verify-form" @submit.prevent="verifyPassword">
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
                :disabled="loading"
                @click="togglePasswordVisibility"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
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
      </div>
    </div>

    <!-- 성공 모달 (옵션) -->
    <div v-if="showSuccessModal" class="success-modal" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h4>비밀번호 확인 완료</h4>
        <p>본인 확인이 완료되었습니다.<br />회원정보 수정 페이지로 이동합니다.</p>
        <button class="modal-btn" @click="proceedToEdit">계속하기</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { memberAPI } from '../../api/member';
import { authAPI } from '../../api/auth';

// 사용자 정보
const userInfo = ref({
  nickname: '',
  email: '',
  profileImage: '',
  phoneNumber: '',
  birthDate: '',
  gender: '',
  receivePushNotification: '',
  createdAt: '',
  updatedAt: '',
});

onMounted(async () => {
  console.log('API 호출 시작');

  const response = await memberAPI.getMyInfo();
  console.log('사용자 정보:', response.data);

  if (response.success) {
    userInfo.value = response.data;

    if (response.data.socialType != 'none') {
      console.log('일반 로그인 사용자 - 비밀번호 확인 생략');

      localStorage.setItem('passwordVerified', 'true');
      localStorage.setItem('verificationTime', Date.now().toString());

      router.push('/mypage/settings/edit');
      return;
    }

    console.log('일반 로그인 사용자 - 비밀번호 확인 필요');
  } else {
    console.error('사용자 정보 조회 실패:', response.message);
    alert('사용자 정보를 불러올 수 없습니다.');
  }
});

const router = useRouter();

// 반응형 데이터
const loading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const currentPassword = ref('');
const showPassword = ref(false);
const showSuccessModal = ref(false);

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

    const response = await authAPI.checkPassword(currentPassword.value);
    if (response.success) {
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
</script>

<style scoped>
.password-verify {
  min-height: 40vh;
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
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 480px;
  height: fit-content;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateZ(0);
}

.verify-card:hover {
  border-color: rgba(185, 187, 204, 0.4);
  box-shadow: 0 4px 12px -2px rgba(45, 51, 107, 0.15);
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
  transition: all 0.3s ease;
}

.user-info-card:hover .user-avatar {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.2);
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-sub) 0%, var(--color-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-main);
}

.form-input::placeholder {
  color: var(--color-sub);
  opacity: 0.7;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 4px rgba(45, 51, 107, 0.1);
  background: white;
}

.form-input:focus-visible {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 자동완성 스타일링 */
.form-input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.9) inset;
  -webkit-text-fill-color: var(--color-main);
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

.password-toggle:focus-visible {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
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
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 확인 버튼 */
.verify-btn {
  width: 100%;
  padding: 0.8rem;
  background: var(--color-sub);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 1rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-btn:hover:not(:disabled) {
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 8px 24px rgba(45, 51, 107, 0.2);
  will-change: transform, box-shadow;
}

.verify-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.verify-btn:focus-visible {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}

.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.verify-btn.loading {
  background: var(--color-sub);
}

.verify-btn.loading .btn-content {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 보안 안내 */
.security-notice {
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.05) 0%, rgba(125, 129, 162, 0.03) 100%);
  border: 1px solid rgba(45, 51, 107, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-main);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-sub);
  line-height: 1.5;
}

.notice-list li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

.notice-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-light);
  font-weight: bold;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  flex: 1;
  justify-content: center;
}

.link-btn.primary {
  background: linear-gradient(135deg, rgba(185, 187, 204, 0.2) 0%, rgba(125, 129, 162, 0.2) 100%);
  color: var(--color-main);
  border: 1px solid rgba(185, 187, 204, 0.3);
}

.link-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(185, 187, 204, 0.3) 0%, rgba(125, 129, 162, 0.3) 100%);
  border-color: rgba(185, 187, 204, 0.5);
  transform: translateY(-1px);
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  max-width: 300px;
  width: 100%;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(185, 187, 204, 0.3);
  transform: translateZ(0);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.success-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.modal-content h3 {
  color: var(--color-main);
  margin-bottom: 1rem;
  font-weight: 700;
}

.modal-content p {
  color: var(--color-sub);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-btn {
  width: 100%;
  padding: 0.5rem;
  background: var(--color-sub);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(45, 51, 107, 0.2);
}
</style>
