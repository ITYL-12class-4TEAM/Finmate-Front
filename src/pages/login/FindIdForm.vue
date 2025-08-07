<template>
  <div class="find-id-form">
    <!-- 헤더 -->
    <div class="header">
      <h1 class="logo">FinMate</h1>
      <p class="subtitle">아이디 찾기</p>
      <p class="description">가입 시 등록한 정보로 아이디를 찾을 수 있습니다.</p>
    </div>

    <!-- 휴대폰 인증으로 아이디 찾기 -->
    <div v-if="!foundId" class="form-content">
      <form @submit.prevent="findIdByPhone">
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
        <button type="submit" class="find-btn" :disabled="!phoneVerified || isLoading">
          {{ isLoading ? '찾는 중...' : '아이디 찾기' }}
        </button>
      </form>
    </div>

    <!-- 결과 표시 -->
    <div v-if="foundId" class="result-section">
      <div class="success-message">
        <i class="bi bi-check-circle-fill"></i>
        <h3>아이디를 찾았습니다!</h3>
        <div class="found-id">
          <span class="id-text">{{ foundId }}</span>
        </div>
      </div>
    </div>

    <!-- 링크들 -->
    <div class="links">
      <router-link to="/login" class="link">로그인</router-link>
      <span class="divider">|</span>
      <router-link to="/login/find-password" class="link">비밀번호 찾기</router-link>
      <span class="divider">|</span>
      <router-link to="/login/signup" class="link">회원가입</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authAPI } from '@/api/auth';
import { smsAPI } from '@/api/sms';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const router = useRouter();

// 상태 관리
const isLoading = ref(false);
const phoneVerificationSent = ref(false);
const phoneVerified = ref(false);
const foundId = ref('');
const foundDate = ref('');

// 폼 데이터
const phoneForm = ref({
  name: '',
  phone: '',
  verificationCode: '',
});

// 휴대폰 번호 포맷팅
const formatPhoneNumber = (event) => {
  let value = event.target.value.replace(/[^0-9]/g, '');

  if (value.length <= 3) {
    phoneForm.value.phone = value;
  } else if (value.length <= 7) {
    phoneForm.value.phone = `${value.slice(0, 3)}-${value.slice(3)}`;
  } else {
    phoneForm.value.phone = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
  }
};

// 휴대폰 인증번호 발송
const sendPhoneVerification = async () => {
  if (!phoneForm.value.phone) {
    showToast('휴대폰 번호를 입력해주세요.', 'warning');
    return;
  }

  try {
    const phoneNumber = phoneForm.value.phone.replace(/-/g, '');
    const response = await smsAPI.sendVerification(phoneNumber);

    if (response.success) {
      phoneVerificationSent.value = true;
      showToast(response.message);
    } else {
      showToast(response.message);
    }
  } catch (error) {
    showToast('인증번호 발송에 실패했습니다.', 'error');
  }
};

// 휴대폰 인증번호 확인
const verifyPhoneCode = async () => {
  if (!phoneForm.value.verificationCode) {
    showToast('인증번호를 입력해주세요.', 'warning');
    return;
  }

  try {
    const phoneNumber = phoneForm.value.phone.replace(/-/g, '');
    const result = await smsAPI.verifyCode(phoneNumber, phoneForm.value.verificationCode);

    if (result.success) {
      phoneVerified.value = true;
      showToast(result.message);
    } else {
      phoneVerified.value = false;
      showToast(result.message, 'error');
    }
  } catch (error) {
    phoneVerified.value = false;
    console.error('인증번호 확인 오류:', error);
    showToast('인증번호가 일치하지 않습니다.', 'error');
  }
};

// 휴대폰으로 아이디 찾기
const findIdByPhone = async () => {
  if (!phoneVerified.value) {
    showToast('휴대폰 번호 인증을 완료해주세요.', 'warning');
    return;
  }

  isLoading.value = true;
  try {
    const phoneNumber = phoneForm.value.phone.replace(/-/g, '');
    const result = await authAPI.findId(phoneForm.value.name, phoneNumber);

    if (result.success) {
      foundId.value = result.data.email;
      foundDate.value = result.data.joinDate || '정보 없음';
      console.log('아이디 찾기 성공:', result.message);
    } else {
      showToast(result.message, 'error');
    }
  } catch (error) {
    console.error('아이디 찾기 오류:', error);
    showToast('입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* LoginLayout에서 컨테이너 스타일 처리 */

.header {
  text-align: center;
  margin-bottom: 1.875rem; /* 30px */
}

.logo {
  font-size: 2rem; /* 32px */
  font-weight: bold;
  color: var(--color-main);
  margin: 0 0 0.5rem 0; /* 8px */
}

.subtitle {
  color: var(--color-main);
  margin: 0 0 0.5rem 0; /* 8px */
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
}

.description {
  color: var(--color-sub);
  margin: 0;
  font-size: 0.875rem; /* 14px */
}

.form-content {
  margin-bottom: 1.25rem; /* 20px */
}

.form-group {
  margin-bottom: 1.25rem; /* 20px */
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem; /* 8px */
  color: var(--color-main);
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem; /* 12px */
  border: 1px solid var(--color-light);
  border-radius: 0.375rem; /* 6px */
  font-size: 1rem; /* 16px */
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 0.125rem rgba(45, 51, 107, 0.1); /* 2px */
}

.input-with-button {
  display: flex;
  gap: 0.5rem; /* 8px */
  align-items: stretch; /* 버튼과 입력 필드 높이 맞춤 */
}

.input-with-button input {
  flex: 1;
  min-width: 0; /* flexbox에서 텍스트 오버플로우 방지 */
}

.verify-btn {
  padding: 0.75rem 0.75rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.3s ease;
  min-width: 4.5rem;
  flex-shrink: 0;
}

.verify-btn:hover:not(:disabled) {
  background-color: #1e2347;
}

.verify-btn:disabled {
  background-color: var(--color-light);
  cursor: not-allowed;
}

@media (max-width: 23.4375rem) {
  .input-with-button {
    flex-direction: column;
  }

  .verify-btn {
    width: 100%;
    min-width: auto;
  }
}
.find-btn {
  width: 100%;
  padding: 0.75rem; /* 12px */
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.375rem; /* 6px */
  font-size: 1rem; /* 16px */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.find-btn:hover:not(:disabled) {
  background-color: #1e2347;
}

.find-btn:disabled {
  background-color: var(--color-light);
  cursor: not-allowed;
}

.result-section {
  margin: 1.875rem 0; /* 30px */
  padding: 1.25rem; /* 20px */
  background-color: var(--color-bg-light);
  border-radius: 0.5rem; /* 8px */
  text-align: center;
}

.success-message i {
  font-size: 2rem; /* 32px */
  color: var(--color-main);
  margin-bottom: 0.625rem; /* 10px */
}

.success-message h3 {
  color: var(--color-main);
  margin: 0 0 0.9375rem 0; /* 15px */
}

.found-id {
  margin: 0.9375rem 0; /* 15px */
  padding: 0.9375rem; /* 15px */
  background-color: white;
  border-radius: 0.375rem; /* 6px */
  border: 1px solid var(--color-light);
}

.id-text {
  font-size: 1.125rem; /* 18px */
  font-weight: bold;
  color: var(--color-main);
}

.links {
  text-align: center;
  margin-top: 1.25rem; /* 20px */
}

.link {
  color: var(--color-sub);
  text-decoration: none;
  font-size: 0.875rem; /* 14px */
  transition: color 0.3s ease;
}

.link:hover {
  color: var(--color-main);
}

.divider {
  margin: 0 0.625rem; /* 10px */
  color: var(--color-light);
}

/* 모바일 최적화 */
@media (max-width: 375px) {
  .input-with-button {
    flex-direction: column;
  }

  .verify-btn {
    width: 100%;
  }
}
</style>
