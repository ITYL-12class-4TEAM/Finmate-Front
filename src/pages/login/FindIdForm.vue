<template>
  <div class="find-id-container">
    <div class="find-id-form">
      <!-- 헤더 -->
      <div class="header">
        <h1 class="logo">FinMate</h1>
        <p class="subtitle">아이디 찾기</p>
        <p class="description">
          가입 시 등록한 정보로 아이디를 찾을 수 있습니다.
        </p>
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
          <button
            type="submit"
            class="find-btn"
            :disabled="!phoneVerified || isLoading"
          >
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
        <router-link to="/login/find-password" class="link"
          >비밀번호 찾기</router-link
        >
        <span class="divider">|</span>
        <router-link to="/login/signup" class="link">회원가입</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/index';

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

// 휴대폰으로 아이디 찾기
const findIdByPhone = async () => {
  if (!phoneVerified.value) {
    alert('휴대폰 번호 인증을 완료해주세요.');
    return;
  }

  isLoading.value = true;
  try {
    // 하이픈 제거한 번호로 API 호출
    const phoneNumber = phoneForm.value.phone.replace(/-/g, '');
    const response = await api.post('/auth/find-id', {
      name: phoneForm.value.name,
      phoneNumber: phoneNumber,
    });

    if (response.data.header.status === 'OK') {
      foundId.value = response.data.body.data.email;
      foundDate.value = response.data.body.joinDate || '정보 없음';
    } else {
      alert(response.data.header.message);
    }
  } catch (error) {
    console.error('아이디 찾기 오류:', error);
    alert('입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.find-id-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: white;
  padding: 80px 20px 20px 20px;
}

.find-id-form {
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
  color: #2d336b;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.description {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.form-content {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #2d336b;
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
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.verify-btn:hover:not(:disabled) {
  background-color: #218838;
}

.verify-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.find-btn {
  width: 100%;
  padding: 12px;
  background-color: #2d336b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.find-btn:hover:not(:disabled) {
  background-color: #1e2347;
}

.find-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.result-section {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.success-message i {
  font-size: 2rem;
  color: #28a745;
  margin-bottom: 10px;
}

.success-message h3 {
  color: #333;
  margin: 0 0 15px 0;
}

.found-id {
  margin: 15px 0;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.id-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2d336b;
}

.result-info {
  color: #666;
  font-size: 0.9rem;
  margin: 10px 0 0 0;
}

.links {
  text-align: center;
  margin-top: 20px;
}

.link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.link:hover {
  color: #2d336b;
}

.divider {
  margin: 0 10px;
  color: #ccc;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .find-id-container {
    padding: 20px 10px;
  }

  .find-id-form {
    padding: 30px 20px;
  }

  .input-with-button {
    flex-direction: column;
  }

  .verify-btn {
    width: 100%;
  }
}
</style>
