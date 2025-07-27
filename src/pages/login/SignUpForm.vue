<template>
  <div class="signup-container">
    <div class="signup-form">
      <!-- 헤더 -->
      <div class="header">
        <h1 class="logo">FinMate</h1>
        <p class="subtitle">회원가입</p>
      </div>

      <!-- 회원가입 폼 -->
      <form @submit.prevent="handleSignup">
        <!-- 이름 -->
        <div class="form-group">
          <label for="name">이름</label>
          <input
            type="text"
            id="name"
            v-model="signupForm.name"
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        <!-- 이메일 -->
        <div class="form-group">
          <label for="email">이메일</label>
          <div class="input-with-button">
            <input
              type="email"
              id="email"
              v-model="signupForm.email"
              placeholder="이메일을 입력하세요"
              required
            />
            <button
              type="button"
              class="verify-btn"
              @click="checkEmailDuplicate"
              :disabled="!signupForm.email"
            >
              중복확인
            </button>
          </div>
          <div v-if="emailVerified" class="success-message">
            ✓ 사용 가능한 이메일입니다
          </div>
        </div>

        <!-- 닉네임 -->
        <div class="form-group">
          <label for="nickname">닉네임</label>
          <div class="input-with-button">
            <input
              type="text"
              id="nickname"
              v-model="signupForm.nickname"
              placeholder="닉네임을 입력하세요"
              required
            />
            <button
              type="button"
              class="verify-btn"
              @click="checkNicknameDuplicate"
              :disabled="!signupForm.nickname"
            >
              중복확인
            </button>
          </div>
          <div v-if="nicknameVerified" class="success-message">
            ✓ 사용 가능한 닉네임입니다
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="signupForm.password"
              placeholder="비밀번호를 입력하세요"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePassword"
            >
              <i
                class="bi"
                :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
              ></i>
            </button>
          </div>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="form-group">
          <label for="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            v-model="signupForm.passwordConfirm"
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
          <div
            v-if="signupForm.passwordConfirm && !passwordMatch"
            class="error-message"
          >
            비밀번호가 일치하지 않습니다
          </div>
        </div>

        <!-- 휴대폰 번호 -->
        <div class="form-group">
          <label for="phone">휴대폰 번호</label>
          <div class="input-with-button">
            <input
              type="tel"
              id="phone"
              v-model="signupForm.phone"
              placeholder="010-0000-0000"
              required
            />
            <button
              type="button"
              class="verify-btn"
              @click="sendPhoneVerification"
              :disabled="!signupForm.phone"
            >
              인증하기
            </button>
          </div>
        </div>

        <!-- 인증 코드 -->
        <div class="form-group" v-if="phoneVerificationSent">
          <label for="verificationCode">인증 코드</label>
          <div class="input-with-button">
            <input
              type="text"
              id="verificationCode"
              v-model="signupForm.verificationCode"
              placeholder="인증 코드를 입력하세요"
              required
            />
            <button
              type="button"
              class="verify-btn"
              @click="verifyPhoneCode"
              :disabled="!signupForm.verificationCode"
            >
              확인
            </button>
          </div>
          <div v-if="phoneVerified" class="success-message">
            ✓ 인증이 완료되었습니다
          </div>
        </div>

        <!-- 생일 -->
        <div class="form-group">
          <label for="birthdate">생년월일</label>
          <input
            type="date"
            id="birthdate"
            v-model="signupForm.birthdate"
            required
          />
        </div>

        <!-- 성별 -->
        <div class="form-group">
          <label>성별 (선택 안 함)</label>
          <div class="gender-buttons">
            <button
              type="button"
              class="gender-btn"
              :class="{ active: signupForm.gender === 'female' }"
              @click="signupForm.gender = 'female'"
            >
              여성
            </button>
            <button
              type="button"
              class="gender-btn"
              :class="{ active: signupForm.gender === 'male' }"
              @click="signupForm.gender = 'male'"
            >
              남성
            </button>
          </div>
        </div>

        <!-- 약관 동의 -->
        <div class="form-group">
          <label>약관 동의</label>
          <div class="agreement-section">
            <!-- 전체 동의 -->
            <label class="agreement-item all-agreement">
              <input
                type="checkbox"
                v-model="agreements.all"
                @change="toggleAllAgreements"
              />
              <span class="checkmark"></span>
              <span class="agreement-text">전체 동의</span>
            </label>

            <!-- 구분선 -->
            <hr class="agreement-divider" />

            <!-- 개별 약관들 -->
            <div class="individual-agreements">
              <label class="agreement-item">
                <input type="checkbox" v-model="agreements.terms" required />
                <span class="checkmark"></span>
                <span class="agreement-text">이용약관 동의 (필수)</span>
                <button
                  type="button"
                  class="view-btn"
                  @click="showTermsModal = true"
                >
                  보기
                </button>
              </label>

              <label class="agreement-item">
                <input type="checkbox" v-model="agreements.privacy" required />
                <span class="checkmark"></span>
                <span class="agreement-text"
                  >개인정보 처리방침 동의 (필수)</span
                >
                <button
                  type="button"
                  class="view-btn"
                  @click="showPrivacyModal = true"
                >
                  보기
                </button>
              </label>

              <label class="agreement-item optional">
                <input type="checkbox" v-model="agreements.marketing" />
                <span class="checkmark"></span>
                <span class="agreement-text">마케팅 정보 수신 동의 (선택)</span>
                <button
                  type="button"
                  class="view-btn"
                  @click="showMarketingModal = true"
                >
                  보기
                </button>
              </label>
            </div>
          </div>
        </div>

        <!-- 약관 모달들 -->
        <!-- 이용약관 모달 -->
        <div
          v-if="showTermsModal"
          class="modal-overlay"
          @click="showTermsModal = false"
        >
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>이용약관</h3>
              <button @click="showTermsModal = false" class="close-btn">
                &times;
              </button>
            </div>
            <div class="modal-body">
              <h4>제1조 (목적)</h4>
              <p>
                본 약관은 FinMate(이하 "회사")가 제공하는 금융 서비스의 이용조건
                및 절차에 관한 사항을 규정함을 목적으로 합니다.
              </p>

              <h4>제2조 (정의)</h4>
              <p>
                1. "서비스"라 함은 회사가 제공하는 금융상품 추천, 자산관리,
                투자정보 등의 서비스를 말합니다.
              </p>
              <p>
                2. "회원"이라 함은 본 약관에 따라 서비스를 이용하는 자를
                말합니다.
              </p>

              <h4>제3조 (약관의 효력 및 변경)</h4>
              <p>1. 본 약관은 회원가입 시 동의함으로써 효력이 발생합니다.</p>
              <p>
                2. 회사는 필요시 약관을 변경할 수 있으며, 변경된 약관은 공지 후
                효력이 발생합니다.
              </p>

              <h4>제4조 (서비스의 제공)</h4>
              <p>회사는 회원에게 다음과 같은 서비스를 제공합니다:</p>
              <p>- 개인 맞춤형 금융상품 추천</p>
              <p>- 자산관리 및 포트폴리오 분석</p>
              <p>- 투자정보 및 시장분석 자료 제공</p>
            </div>
          </div>
        </div>

        <!-- 개인정보 처리방침 모달 -->
        <div
          v-if="showPrivacyModal"
          class="modal-overlay"
          @click="showPrivacyModal = false"
        >
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>개인정보 처리방침</h3>
              <button @click="showPrivacyModal = false" class="close-btn">
                &times;
              </button>
            </div>
            <div class="modal-body">
              <h4>1. 개인정보의 처리목적</h4>
              <p>FinMate는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
              <p>- 회원가입 및 관리</p>
              <p>- 금융상품 추천 서비스 제공</p>
              <p>- 고객 상담 및 불만처리</p>

              <h4>2. 처리하는 개인정보 항목</h4>
              <p>- 필수항목: 이름, 이메일, 휴대폰번호, 생년월일</p>
              <p>- 선택항목: 성별, 관심 금융상품</p>

              <h4>3. 개인정보의 처리 및 보유기간</h4>
              <p>
                개인정보는 수집·이용에 관한 동의일로부터 개인정보의
                수집·이용목적을 달성할 때까지 보유·이용됩니다.
              </p>

              <h4>4. 개인정보의 제3자 제공</h4>
              <p>
                회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법
                제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게
                제공합니다.
              </p>
            </div>
          </div>
        </div>

        <!-- 마케팅 정보 수신 동의 모달 -->
        <div
          v-if="showMarketingModal"
          class="modal-overlay"
          @click="showMarketingModal = false"
        >
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>마케팅 정보 수신 동의</h3>
              <button @click="showMarketingModal = false" class="close-btn">
                &times;
              </button>
            </div>
            <div class="modal-body">
              <h4>마케팅 정보 수신 동의 안내</h4>
              <p>
                FinMate에서는 회원님께 더 나은 서비스를 제공하기 위해 다음과
                같은 마케팅 정보를 발송할 수 있습니다:
              </p>

              <h4>수신 정보 유형</h4>
              <p>- 새로운 금융상품 및 서비스 안내</p>
              <p>- 맞춤형 투자정보 및 시장 분석 자료</p>
              <p>- 이벤트 및 프로모션 정보</p>
              <p>- 금융 관련 교육 콘텐츠</p>

              <h4>발송 방법</h4>
              <p>- 이메일, SMS, 앱 푸시 알림</p>

              <h4>동의 철회</h4>
              <p>
                마케팅 정보 수신에 대한 동의는 언제든지 철회하실 수 있으며,
                마이페이지에서 설정을 변경하거나 고객센터를 통해 요청하실 수
                있습니다.
              </p>

              <p>
                <strong
                  >※ 본 동의는 선택사항이며, 동의하지 않아도 서비스 이용에는
                  제한이 없습니다.</strong
                >
              </p>
            </div>
          </div>
        </div>

        <button type="submit" class="signup-btn" :disabled="!isFormValid">
          이메일로 회원가입
        </button>
      </form>

      <!-- 링크들 -->
      <div class="links">
        <router-link to="/login" class="link">로그인</router-link>
        <span class="divider">|</span>
        <a href="#" class="link">아이디 찾기</a>
        <span class="divider">|</span>
        <a href="#" class="link">비밀번호 찾기</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/index';

const router = useRouter();

const signupForm = ref({
  name: '',
  email: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  verificationCode: '',
  birthdate: '',
  gender: '',
});

const agreements = ref({
  all: false,
  terms: false,
  privacy: false,
  marketing: false,
});

const genderMapping = {
  male: '남',
  female: '여',
};

const showPassword = ref(false);
const emailVerified = ref(false);
const nicknameVerified = ref(false);
const phoneVerificationSent = ref(false);
const phoneVerified = ref(false);
const showTermsModal = ref(false);
const showPrivacyModal = ref(false);
const showMarketingModal = ref(false);

// 비밀번호 일치 확인
const passwordMatch = computed(() => {
  return signupForm.value.password === signupForm.value.passwordConfirm;
});

// 폼 유효성 검사
const isFormValid = computed(() => {
  return (
    signupForm.value.name &&
    signupForm.value.email &&
    emailVerified.value &&
    signupForm.value.nickname &&
    nicknameVerified.value &&
    signupForm.value.password &&
    passwordMatch.value &&
    signupForm.value.phone &&
    phoneVerified.value &&
    signupForm.value.birthdate &&
    signupForm.value.gender &&
    agreements.value.terms &&
    agreements.value.privacy
  );
});

// 전체 동의 처리
const toggleAllAgreements = () => {
  const allChecked = agreements.value.all;
  agreements.value.terms = allChecked;
  agreements.value.privacy = allChecked;
  agreements.value.marketing = allChecked;
};

// 개별 동의 변경 시 전체 동의 상태 업데이트
watch(
  () => [
    agreements.value.terms,
    agreements.value.privacy,
    agreements.value.marketing,
  ],
  () => {
    agreements.value.all =
      agreements.value.terms &&
      agreements.value.privacy &&
      agreements.value.marketing;
  }
);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const checkEmailDuplicate = async () => {
  if (!signupForm.value.email) {
    alert('이메일을 입력해주세요.');
    return;
  }

  try {
    const response = await api.get(
      `/validation/check/email?email=${encodeURIComponent(
        signupForm.value.email
      )}`
    );

    if (response.data.header.status === 'OK') {
      emailVerified.value = true;
      alert(response.data.header.message);
    } else {
      emailVerified.value = false;
      alert(response.data.header.message);
    }
  } catch (error) {
    emailVerified.value = false;
    console.error('이메일 중복 확인 오류:', error);

    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }

    alert('이메일 중복 확인 중 오류가 발생했습니다.');
  }
};

const checkNicknameDuplicate = async () => {
  if (!signupForm.value.nickname) {
    alert('닉네임을 입력해주세요.');
    return;
  }

  try {
    const response = await api.get(
      `/validation/check/nickname?nickname=${encodeURIComponent(
        signupForm.value.nickname
      )}`
    );

    if (response.data.header.status === 'OK') {
      nicknameVerified.value = true;
      alert(response.data.header.message);
    } else {
      nicknameVerified.value = false;
      alert(response.data.header.message);
    }
  } catch (error) {
    nicknameVerified.value = false;
    console.error('닉네임 중복 확인 오류:', error);
    alert('닉네임 중복 확인 중 오류가 발생했습니다.');
  }
};

const sendPhoneVerification = async () => {
  if (!signupForm.value.phone) {
    alert('휴대폰 번호를 입력해주세요.');
    return;
  }

  try {
    const response = await api.get(
      `/sms/send-verification?phoneNumber=${encodeURIComponent(
        signupForm.value.phone
      )}`
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
const verifyPhoneCode = async () => {
  if (!signupForm.value.verificationCode) {
    alert('인증번호를 입력해주세요.');
    return;
  }

  try {
    const response = await api.post(
      `/sms/verify-code?phoneNumber=${encodeURIComponent(
        signupForm.value.phone
      )}&code=${encodeURIComponent(signupForm.value.verificationCode)}`
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

const handleSignup = async () => {
  if (!isFormValid.value) {
    alert('모든 필수 항목을 입력해주세요.');
    return;
  }

  try {
    const signupData = {
      username: signupForm.value.name,
      password: signupForm.value.password,
      passwordCheck: signupForm.value.passwordConfirm,
      nickname: signupForm.value.nickname,
      email: signupForm.value.email,
      phoneNumber: signupForm.value.phone,
      birthDate: signupForm.value.birthdate,
      gender: genderMapping[signupForm.value.gender] || signupForm.value.gender,
      termsRequired1: agreements.value.terms,
      termsRequired2: agreements.value.privacy,
      receive_push_notification: agreements.value.marketing,
    };

    const response = await api.post(`/signup`, signupData);
    if (response.data.header.status === 'OK') {
      alert(response.data.header.message);
      router.push('/login');
    } else {
      alert(response.data.header.message);
    }
  } catch (error) {
    console.error('회원가입 오류:', error);

    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);

      const errorMessage =
        error.response.data?.header?.message || '회원가입에 실패했습니다.';
      alert(errorMessage);
    } else {
      alert('회원가입에 실패했습니다.');
    }
  }
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: white;
  padding: 50px 20px;
}

.signup-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  color: #2d336b;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
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
}

.form-group input:focus {
  outline: none;
  border-color: #2d336b;
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
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.verify-btn:hover {
  background-color: #5a6268;
}

.verify-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

/* 약관 동의 스타일 수정 */
.agreement-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.agreement-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  position: relative;
}

.agreement-item input[type='checkbox'] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 0;
  height: 0;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 12px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.agreement-item input[type='checkbox']:checked + .checkmark {
  background-color: #2d336b;
  border-color: #2d336b;
}

.agreement-item input[type='checkbox']:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.agreement-text {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
}

.all-agreement {
  font-weight: 600;
  font-size: 1rem;
}

.all-agreement .checkmark {
  width: 22px;
  height: 22px;
}

.agreement-divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 12px 0;
}

.individual-agreements {
  padding-left: 8px;
}

.view-btn {
  background: none;
  border: 1px solid #ddd;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: 8px;
}

.view-btn:hover {
  background-color: #f5f5f5;
  border-color: #999;
}

.optional .agreement-text {
  color: #666;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body h4 {
  color: #333;
  margin: 16px 0 8px 0;
  font-size: 1rem;
}

.modal-body p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}

/* 기존 checkbox-group 관련 스타일 제거 */
.checkbox-group {
  display: none;
}

.main-checkbox,
.sub-agreements,
.sub-checkbox {
  display: none;
}

.success-message {
  color: #28a745;
  font-size: 0.8rem;
  margin-top: 4px;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 4px;
}

.signup-btn {
  width: 100%;
  padding: 12px;
  background-color: #2d336b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 20px;
}

.signup-btn:hover {
  background-color: #1e2453;
}

.signup-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.links {
  text-align: center;
  margin-bottom: 30px;
}

.link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.link:hover {
  color: #333;
}

.divider {
  margin: 0 10px;
  color: #ccc;
}

/* 성별 버튼 스타일 */
.gender-buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.gender-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.gender-btn:hover {
  border-color: #2d336b;
}

.gender-btn.active {
  background-color: #2d336b;
  color: white;
  border-color: #2d336b;
}

/* 라디오 그룹 스타일 제거 (성별 부분에서 더 이상 사용하지 않음) */
.radio-group {
  display: none;
}

.radio-label {
  display: none;
}
</style>
