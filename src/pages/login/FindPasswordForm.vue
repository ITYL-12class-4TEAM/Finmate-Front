<template>
  <div class="find-password-container">
    <div class="find-password-form">
      <!-- 헤더 -->
      <div class="header">
        <h1 class="logo">FinMate</h1>
        <p class="subtitle">비밀번호 찾기</p>
        <p class="description">
          가입 시 등록한 정보로 비밀번호를 재설정할 수 있습니다.
        </p>
      </div>

      <!-- 사용자 정보 입력 및 휴대폰 인증 -->
      <div v-if="currentStep === 1" class="form-content">
        <form @submit.prevent="findPasswordByPhone">
          <div class="form-group">
            <label for="name">이름</label>
            <input
              type="text"
              id="name"
              v-model="phoneForm.name"
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          <div class="form-group">
            <label for="phone">휴대폰 번호</label>
            <div class="input-with-button">
              <input
                type="tel"
                id="phone"
                v-model="phoneForm.phone"
                @input="formatPhoneNumber"
                placeholder="010-0000-0000"
                maxlength="13"
                required
              />
              <button
                type="button"
                class="verify-btn"
                @click="sendPhoneVerification"
                :disabled="!phoneForm.phone || phoneVerificationSent"
              >
                {{ phoneVerificationSent ? '발송완료' : '인증하기' }}
              </button>
            </div>
          </div>
          <div v-if="phoneVerificationSent" class="form-group">
            <label for="verificationCode">인증번호</label>
            <div class="input-with-button">
              <input
                type="text"
                id="verificationCode"
                v-model="phoneForm.verificationCode"
                placeholder="인증번호를 입력하세요"
                required
              />
              <button
                type="button"
                class="verify-btn"
                @click="verifyPhoneCode"
                :disabled="!phoneForm.verificationCode"
              >
                인증확인
              </button>
            </div>
          </div>
          <button
            type="submit"
            class="find-btn"
            :disabled="!phoneVerified || isLoading"
          >
            {{ isLoading ? '찾는 중...' : '비밀번호 재설정하기' }}
          </button>
        </form>
      </div>

      <!-- 새 비밀번호 설정 -->
      <div v-if="currentStep === 2" class="form-content">
        <div class="step-info">
          <i class="bi bi-shield-check"></i>
          <p>새로운 비밀번호를 설정해주세요.</p>
        </div>
        <form @submit.prevent="resetPassword">
          <div class="form-group">
            <label for="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              v-model="newPasswordForm.password"
              placeholder="8자 이상, 영문/숫자/특수문자 포함"
              required
            />
            <div class="password-requirements-compact">
              <span
                class="requirement-compact"
                :class="{ valid: passwordChecks.length }"
              >
                8자 이상
              </span>
              <span
                class="requirement-compact"
                :class="{ valid: passwordChecks.hasLetter }"
              >
                영문
              </span>
              <span
                class="requirement-compact"
                :class="{ valid: passwordChecks.hasNumber }"
              >
                숫자
              </span>
              <span
                class="requirement-compact"
                :class="{ valid: passwordChecks.hasSpecial }"
              >
                특수문자
              </span>
            </div>
          </div>
          <div class="form-group">
            <label for="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="newPasswordForm.confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
            <div v-if="newPasswordForm.confirmPassword" class="password-match">
              <i
                class="bi"
                :class="
                  passwordsMatch
                    ? 'bi-check-circle-fill text-success'
                    : 'bi-x-circle-fill text-danger'
                "
              ></i>
              {{
                passwordsMatch
                  ? '비밀번호가 일치합니다'
                  : '비밀번호가 일치하지 않습니다'
              }}
            </div>
          </div>
          <button
            type="submit"
            class="reset-btn"
            :disabled="!isPasswordValid || !passwordsMatch || isLoading"
          >
            {{ isLoading ? '설정 중...' : '비밀번호 변경' }}
          </button>
        </form>
      </div>

      <!-- 완료 단계 -->
      <div v-if="currentStep === 3" class="result-section">
        <div class="success-message">
          <i class="bi bi-check-circle-fill"></i>
          <h3>비밀번호 변경 완료!</h3>
          <p>새로운 비밀번호로 로그인해주세요.</p>
          <button @click="goToLogin" class="login-btn">로그인하러 가기</button>
        </div>
      </div>

      <!-- 링크들 (완료 단계가 아닐 때만 표시) -->
      <div v-if="currentStep !== 3" class="links">
        <router-link to="/login" class="link">로그인</router-link>
        <span class="divider">|</span>
        <router-link to="/login/find-id" class="link">아이디 찾기</router-link>
        <span class="divider">|</span>
        <router-link to="/login/signup" class="link">회원가입</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/index';

const router = useRouter();

// 상태 관리
const currentStep = ref(1);
const isLoading = ref(false);
const phoneVerificationSent = ref(false);
const phoneVerified = ref(false);
const userEmail = ref(''); // 1단계에서 받아온 이메일 저장

// 폼 데이터
const phoneForm = ref({
  name: '',
  phone: '',
  verificationCode: '',
});

const newPasswordForm = ref({
  password: '',
  confirmPassword: '',
});

// 휴대폰 번호 포맷팅
const formatPhoneNumber = (event) => {
  let value = event.target.value.replace(/[^0-9]/g, '');

  if (value.length <= 3) {
    phoneForm.value.phone = value;
  } else if (value.length <= 7) {
    phoneForm.value.phone = `${value.slice(0, 3)}-${value.slice(3)}`;
  } else {
    phoneForm.value.phone = `${value.slice(0, 3)}-${value.slice(
      3,
      7
    )}-${value.slice(7, 11)}`;
  }
};

// 휴대폰 인증번호 발송
const sendPhoneVerification = async () => {
  if (!phoneForm.value.phone) {
    alert('휴대폰 번호를 입력해주세요.');
    return;
  }

  try {
    // 하이픈 제거한 번호로 API 호출
    const phoneNumber = phoneForm.value.phone.replace(/-/g, '');
    const response = await api.get(
      `/sms/send-verification?phoneNumber=${encodeURIComponent(phoneNumber)}`
    );

    if (response.data.header.status === 'OK') {
      phoneVerificationSent.value = true;
      alert(response.data.header.message);
    } else {
      alert(response.data.header.message);
    }
  } catch (error) {
    console.error('인증번호 발송 오류:', error);

    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);

      const errorMessage =
        error.response.data?.header?.message || '인증번호 발송에 실패했습니다.';
      alert(errorMessage);
    } else {
      alert('인증번호 발송에 실패했습니다.');
    }
  }
};

// 휴대폰 인증번호 확인
const verifyPhoneCode = async () => {
  if (!phoneForm.value.verificationCode) {
    alert('인증번호를 입력해주세요.');
    return;
  }

  try {
    // 하이픈 제거한 번호로 API 호출
    const phoneNumber = phoneForm.value.phone.replace(/-/g, '');
    const response = await api.post(
      `/sms/verify-code?phoneNumber=${encodeURIComponent(
        phoneNumber
      )}&code=${encodeURIComponent(phoneForm.value.verificationCode)}`
    );

    if (response.data.header.status === 'OK') {
      phoneVerified.value = true;
      alert(response.data.header.message);
    } else {
      phoneVerified.value = false;
      alert(response.data.header.message);
    }
  } catch (error) {
    phoneVerified.value = false;
    console.error('인증번호 확인 오류:', error);
    alert('인증번호가 일치하지 않습니다.');
  }
};

// 비밀번호 유효성 검사
const passwordChecks = computed(() => ({
  length: newPasswordForm.value.password.length >= 8,
  hasLetter: /[a-zA-Z]/.test(newPasswordForm.value.password),
  hasNumber: /\d/.test(newPasswordForm.value.password),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordForm.value.password),
}));

const isPasswordValid = computed(() => {
  return Object.values(passwordChecks.value).every((check) => check);
});

const passwordsMatch = computed(() => {
  return (
    newPasswordForm.value.password === newPasswordForm.value.confirmPassword
  );
});

// 휴대폰으로 비밀번호 찾기
const findPasswordByPhone = async () => {
  if (!phoneVerified.value) {
    alert('휴대폰 번호 인증을 완료해주세요.');
    return;
  }

  isLoading.value = true;
  try {
    // 하이픈 제거한 번호로 API 호출
    const phoneNumber = phoneForm.value.phone.replace(/-/g, '');
    const response = await api.post('/auth/find-password', {
      name: phoneForm.value.name,
      phoneNumber: phoneNumber,
    });

    if (response.data.header.status === 'OK') {
      // 응답에서 이메일을 받아서 저장
      userEmail.value = response.data.body.data.email;
      currentStep.value = 2;
      alert('본인 인증이 완료되었습니다. 새 비밀번호를 설정해주세요.');
    } else {
      alert(response.data.header.message);
    }
  } catch (error) {
    console.error('비밀번호 찾기 오류:', error);
    alert('입력하신 정보와 일치하는 계정을 찾을 수 없습니다.');
  } finally {
    isLoading.value = false;
  }
};

// 비밀번호 재설정
const resetPassword = async () => {
  isLoading.value = true;
  try {
    const response = await api.post('/auth/reset-password', {
      newPassword: newPasswordForm.value.password,
      newPasswordCheck: newPasswordForm.value.confirmPassword,
      username: userEmail.value, // 1단계에서 받아온 이메일 사용
    });

    if (response.data.header.status === 'OK') {
      currentStep.value = 3;
      alert('비밀번호가 성공적으로 변경되었습니다.');
    } else {
      alert(response.data.header.message);
    }
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    if (error.response && error.response.data && error.response.data.header) {
      alert(error.response.data.header.message);
    } else {
      alert('비밀번호 변경에 실패했습니다.');
    }
  } finally {
    isLoading.value = false;
  }
};

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.find-password-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: white;
  padding: 80px 20px 20px 20px;
}

.find-password-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-main);
  margin: 0 0 8px 0;
}

.subtitle {
  color: var(--color-main);
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.description {
  color: var(--color-sub);
  margin: 0;
  font-size: 0.9rem;
}

.form-content {
  margin-bottom: 20px;
}

.step-info {
  text-align: center;
  margin-bottom: 25px;
  padding: 20px;
  background-color: var(--color-bg-light);
  border-radius: 8px;
}

.step-info i {
  font-size: 2rem;
  color: var(--color-main);
  margin-bottom: 10px;
}

.step-info p {
  margin: 5px 0;
  color: var(--color-main);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-light);
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 2px rgba(45, 51, 107, 0.1);
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button input {
  flex: 1;
}

.verify-btn {
  padding: 12px 16px;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.verify-btn:hover:not(:disabled) {
  background-color: #1e2347;
}

.verify-btn:disabled {
  background-color: var(--color-light);
  cursor: not-allowed;
}

.find-btn,
.reset-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.find-btn:hover:not(:disabled),
.reset-btn:hover:not(:disabled) {
  background-color: #1e2347;
}

.find-btn:disabled,
.reset-btn:disabled {
  background-color: var(--color-light);
  cursor: not-allowed;
}

.password-requirements {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.requirement {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-sub);
  transition: color 0.3s ease;
}

.requirement.valid {
  color: var(--color-main);
}

.requirement i {
  margin-right: 6px;
  font-size: 0.8rem;
}

.password-requirements-compact {
  margin-top: 6px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.requirement-compact {
  font-size: 0.75rem;
  color: var(--color-light);
  transition: color 0.3s ease;
  position: relative;
}

.requirement-compact.valid {
  color: var(--color-main);
}

.requirement-compact.valid::before {
  content: '✓';
  margin-right: 4px;
  font-weight: bold;
}

.password-match {
  margin-top: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.password-match i {
  margin-right: 6px;
}

.text-success {
  color: var(--color-main);
}

.text-danger {
  color: #dc3545;
}

.result-section {
  margin: 30px 0;
  padding: 20px;
  background-color: var(--color-bg-light);
  border-radius: 8px;
  text-align: center;
}

.success-message i {
  font-size: 2rem;
  color: var(--color-main);
  margin-bottom: 10px;
}

.success-message h3 {
  color: var(--color-main);
  margin: 0 0 15px 0;
}

.success-message p {
  color: var(--color-sub);
  margin-bottom: 25px;
}

.login-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: #1e2347;
}

.links {
  text-align: center;
  margin-top: 20px;
}

.link {
  color: var(--color-sub);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.link:hover {
  color: var(--color-main);
}

.divider {
  margin: 0 10px;
  color: var(--color-light);
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .find-password-container {
    padding: 20px 10px;
  }

  .find-password-form {
    padding: 30px 20px;
  }

  .input-with-button {
    flex-direction: column;
  }

  .verify-btn {
    width: 100%;
  }

  .password-requirements {
    grid-template-columns: 1fr;
  }

  .password-requirements-compact {
    justify-content: center;
  }
}
</style>
