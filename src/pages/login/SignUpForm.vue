<template>
  <div class="signup-form">
    <!-- 헤더 -->
    <div class="header">
      <h1 class="logo">FinMate</h1>
      <p class="subtitle">회원가입</p>
    </div>

    <!-- 회원가입 폼 -->
    <form autocomplete="off" @submit.prevent="handleSignup">
      <!-- 이름 -->
      <div class="form-group">
        <label for="name">이름</label>
        <input
          id="name"
          v-model="signupForm.name"
          type="text"
          placeholder="이름을 입력하세요"
          :disabled="isSocialSignup"
          required
        />
      </div>

      <!-- 이메일 -->
      <div class="form-group">
        <label for="email">이메일</label>
        <div class="input-with-button">
          <input
            id="email"
            v-model="signupForm.email"
            autocomplete="off"
            type="email"
            placeholder="이메일을 입력하세요"
            :disabled="isSocialSignup"
            required
          />
          <button
            v-if="!isSocialSignup"
            type="button"
            class="verify-btn"
            :disabled="!signupForm.email || isSocialSignup"
            @click="checkEmailDuplicate"
          >
            중복확인
          </button>
        </div>
        <div v-if="emailVerified" class="success-message">
          ✓
          {{ isSocialSignup ? '소셜 로그인 인증된 이메일입니다' : '사용 가능한 이메일입니다' }}
        </div>
      </div>

      <!-- 닉네임 -->
      <div class="form-group">
        <label for="nickname">닉네임</label>
        <div class="input-with-button">
          <input
            id="nickname"
            v-model="signupForm.nickname"
            autocomplete="off"
            type="text"
            placeholder="닉네임을 입력하세요"
          />
          <button
            type="button"
            class="verify-btn"
            :disabled="!signupForm.nickname"
            @click="checkNicknameDuplicate"
          >
            중복확인
          </button>
        </div>
        <div v-if="nicknameVerified" class="success-message">✓ 사용 가능한 닉네임입니다</div>
      </div>

      <!-- 비밀번호 (소셜 로그인이 아닌 경우만 표시) -->
      <div v-if="!isSocialSignup" class="form-group">
        <label for="password">비밀번호</label>
        <div class="password-input">
          <input
            id="password"
            v-model="signupForm.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="8자 이상, 영문/숫자/특수문자 포함"
            :required="!isSocialSignup"
          />
          <button type="button" class="password-toggle" @click="togglePassword">
            <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
          </button>
        </div>
        <div class="password-requirements-compact">
          <span class="requirement-compact" :class="{ valid: passwordChecks.length }">
            8자 이상
          </span>
          <span class="requirement-compact" :class="{ valid: passwordChecks.hasLetter }">
            영문
          </span>
          <span class="requirement-compact" :class="{ valid: passwordChecks.hasNumber }">
            숫자
          </span>
          <span class="requirement-compact" :class="{ valid: passwordChecks.hasSpecial }">
            특수문자
          </span>
        </div>
      </div>

      <!-- 비밀번호 확인 (소셜 로그인이 아닌 경우만 표시) -->
      <div v-if="!isSocialSignup" class="form-group">
        <label for="passwordConfirm">비밀번호 확인</label>
        <input
          id="passwordConfirm"
          v-model="signupForm.passwordConfirm"
          autocomplete="off"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          :required="!isSocialSignup"
        />
        <div v-if="signupForm.passwordConfirm" class="password-match">
          <i
            class="bi"
            :class="
              passwordsMatch ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'
            "
          ></i>
          {{ passwordsMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다' }}
        </div>
      </div>

      <!-- 휴대폰 번호 (일반 회원가입에서만 표시) -->
      <div v-if="!isSocialSignup" class="form-group">
        <label for="phone">휴대폰 번호</label>
        <div class="input-with-button">
          <input
            id="phone"
            v-model="signupForm.phone"
            autocomplete="off"
            type="tel"
            placeholder="010-0000-0000"
            required
          />
          <button
            type="button"
            class="verify-btn"
            :disabled="!signupForm.phone"
            @click="sendPhoneVerification"
          >
            인증하기
          </button>
        </div>
      </div>

      <!-- 인증 코드 (일반 회원가입에서만 표시) -->
      <div v-if="phoneVerificationSent && !isSocialSignup" class="form-group">
        <label for="verificationCode">인증 코드</label>
        <div class="input-with-button">
          <input
            id="verificationCode"
            v-model="signupForm.verificationCode"
            autocomplete="off"
            type="text"
            placeholder="인증 코드를 입력하세요"
            required
          />
          <button
            type="button"
            class="verify-btn"
            :disabled="!signupForm.verificationCode"
            @click="verifyPhoneCode"
          >
            확인
          </button>
        </div>
        <div v-if="phoneVerified" class="success-message">✓ 인증이 완료되었습니다</div>
      </div>

      <!-- 생일 -->
      <div class="form-group">
        <label for="birthdate">생년월일</label>
        <input id="birthdate" v-model="signupForm.birthdate" type="date" required />
      </div>

      <!-- 성별 -->
      <div class="form-group">
        <label>성별</label>
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
            <input v-model="agreements.all" type="checkbox" @change="toggleAllAgreements" />
            <span class="checkmark"></span>
            <span class="agreement-text">전체 동의</span>
          </label>

          <!-- 구분선 -->
          <hr class="agreement-divider" />

          <!-- 개별 약관들 -->
          <div class="individual-agreements">
            <label class="agreement-item">
              <input v-model="agreements.terms" type="checkbox" required />
              <span class="checkmark"></span>
              <span class="agreement-text">이용약관 동의 (필수)</span>
              <button type="button" class="view-btn" @click="showTermsModal = true">보기</button>
            </label>

            <label class="agreement-item">
              <input v-model="agreements.privacy" type="checkbox" required />
              <span class="checkmark"></span>
              <span class="agreement-text">개인정보 처리방침 동의 (필수)</span>
              <button type="button" class="view-btn" @click="showPrivacyModal = true">보기</button>
            </label>

            <label class="agreement-item optional">
              <input v-model="agreements.marketing" type="checkbox" />
              <span class="checkmark"></span>
              <span class="agreement-text">마케팅 정보 수신 동의 (선택)</span>
              <button type="button" class="view-btn" @click="showMarketingModal = true">
                보기
              </button>
            </label>
          </div>
        </div>
      </div>

      <!-- 약관 모달들 -->
      <!-- 이용약관 모달 -->
      <div v-if="showTermsModal" class="modal-overlay" @click="showTermsModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>이용약관</h3>
            <button class="close-btn" @click="showTermsModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <h4>제1조 (목적)</h4>
            <p>
              본 약관은 FinMate(이하 "회사")가 제공하는 금융 서비스의 이용조건 및 절차에 관한 사항을
              규정함을 목적으로 합니다.
            </p>

            <h4>제2조 (정의)</h4>
            <p>
              1. "서비스"라 함은 회사가 제공하는 금융상품 추천, 자산관리, 투자정보 등의 서비스를
              말합니다.
            </p>
            <p>2. "회원"이라 함은 본 약관에 따라 서비스를 이용하는 자를 말합니다.</p>

            <h4>제3조 (약관의 효력 및 변경)</h4>
            <p>1. 본 약관은 회원가입 시 동의함으로써 효력이 발생합니다.</p>
            <p>
              2. 회사는 필요시 약관을 변경할 수 있으며, 변경된 약관은 공지 후 효력이 발생합니다.
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
      <div v-if="showPrivacyModal" class="modal-overlay" @click="showPrivacyModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>개인정보 처리방침</h3>
            <button class="close-btn" @click="showPrivacyModal = false">&times;</button>
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
              개인정보는 수집·이용에 관한 동의일로부터 개인정보의 수집·이용목적을 달성할 때까지
              보유·이용됩니다.
            </p>

            <h4>4. 개인정보의 제3자 제공</h4>
            <p>
              회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에
              해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
          </div>
        </div>
      </div>

      <!-- 마케팅 정보 수신 동의 모달 -->
      <div v-if="showMarketingModal" class="modal-overlay" @click="showMarketingModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>마케팅 정보 수신 동의</h3>
            <button class="close-btn" @click="showMarketingModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <h4>마케팅 정보 수신 동의 안내</h4>
            <p>
              FinMate에서는 회원님께 더 나은 서비스를 제공하기 위해 다음과 같은 마케팅 정보를 발송할
              수 있습니다:
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
              마케팅 정보 수신에 대한 동의는 언제든지 철회하실 수 있으며, 마이페이지에서 설정을
              변경하거나 고객센터를 통해 요청하실 수 있습니다.
            </p>

            <p>
              <strong
                >※ 본 동의는 선택사항이며, 동의하지 않아도 서비스 이용에는 제한이 없습니다.</strong
              >
            </p>
          </div>
        </div>
      </div>

      <button type="submit" class="signup-btn" :disabled="!isFormValid">
        {{ isSocialSignup ? '소셜 회원가입 완료' : '이메일로 회원가입' }}
      </button>
    </form>

    <!-- 링크들 -->
    <div class="links">
      <router-link to="/login" class="link">로그인</router-link>
      <span class="divider">|</span>
      <router-link to="/login/find-id" class="link">아이디 찾기</router-link>
      <span class="divider">|</span>
      <router-link to="/login/find-password" class="link">비밀번호 찾기</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { authAPI } from '@/api/auth';
import { smsAPI } from '@/api/sms';
import { validationAPI } from '@/api/validation';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

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
const isSocialSignup = ref(false);

// 컴포넌트 마운트 시 URL 파라미터 확인
onMounted(() => {
  console.log('=== SignUpForm onMounted ===');
  console.log('route.query:', route.query);
  console.log('socialSignup 체크:', route.query.socialSignup === 'true');

  if (route.query.socialSignup === 'true') {
    isSocialSignup.value = true;
    console.log('소셜 회원가입 모드로 설정됨');

    // URL에서 받은 정보로 폼 미리 채우기
    if (route.query.name) {
      signupForm.value.name = route.query.name;
      console.log('이름 설정:', route.query.name);
    }

    if (route.query.email) {
      signupForm.value.email = route.query.email;
      emailVerified.value = true;
      console.log('이메일 설정:', route.query.email);
    }

    if (route.query.phone) {
      signupForm.value.phone = route.query.phone;
      phoneVerified.value = true;
      console.log('전화번호 설정:', route.query.phone);
    }

    showToast('추가 정보를 입력해주세요.');
  } else {
    console.log('일반 회원가입 모드');
  }
});

// 비밀번호 유효성 검사
const passwordChecks = computed(() => ({
  length: signupForm.value.password.length >= 8,
  hasLetter: /[a-zA-Z]/.test(signupForm.value.password),
  hasNumber: /\d/.test(signupForm.value.password),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(signupForm.value.password),
}));

const isPasswordValid = computed(() => {
  return Object.values(passwordChecks.value).every((check) => check);
});

const passwordsMatch = computed(() => {
  return signupForm.value.password === signupForm.value.passwordConfirm;
});
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 폼 유효성 검사 수정
const isFormValid = computed(() => {
  const baseValidation =
    signupForm.value.name &&
    signupForm.value.email &&
    (emailVerified.value || isSocialSignup.value) &&
    signupForm.value.birthdate &&
    signupForm.value.gender &&
    agreements.value.terms &&
    agreements.value.privacy;

  if (isSocialSignup.value) {
    // 소셜 로그인 시: 닉네임 무조건 필수 및 검증 필요
    return baseValidation && signupForm.value.nickname && nicknameVerified.value;
  } else {
    // 일반 회원가입 시: 모든 필드 필수
    return (
      baseValidation &&
      signupForm.value.nickname &&
      nicknameVerified.value &&
      signupForm.value.phone &&
      phoneVerified.value &&
      isPasswordValid.value &&
      passwordsMatch.value
    );
  }
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
  () => [agreements.value.terms, agreements.value.privacy, agreements.value.marketing],
  () => {
    agreements.value.all =
      agreements.value.terms && agreements.value.privacy && agreements.value.marketing;
  }
);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const checkEmailDuplicate = async () => {
  if (!signupForm.value.email) {
    showToast('이메일을 입력해주세요.', 'warning');
    return;
  }
  if (!isValidEmail(signupForm.value.email)) {
    showToast('올바른 이메일 형식을 입력해주세요.', 'warning');
    return;
  }

  try {
    const response = await validationAPI.checkEmail(signupForm.value.email);

    if (response.success) {
      emailVerified.value = true;
      showToast(response.message);
    } else {
      emailVerified.value = false;
      showToast(response.message, 'warning');
    }
  } catch (error) {
    emailVerified.value = false;
    showToast('이메일 중복 확인 중 오류가 발생했습니다.', 'error');
  }
};

const checkNicknameDuplicate = async () => {
  if (!signupForm.value.nickname) {
    showToast('닉네임을 입력해주세요.', 'warning');
    return;
  }

  try {
    const response = await validationAPI.checkNickname(signupForm.value.nickname);

    if (response.success) {
      nicknameVerified.value = true;
      showToast(response.message);
    } else {
      nicknameVerified.value = false;
      showToast(response.message, 'warning');
    }
  } catch (error) {
    nicknameVerified.value = false;
    showToast('닉네임 중복 확인 중 오류가 발생했습니다.', 'error');
  }
};

const sendPhoneVerification = async () => {
  if (!signupForm.value.phone) {
    showToast('휴대폰 번호를 입력해주세요.', 'warning');
    return;
  }

  try {
    const response = await smsAPI.sendVerification(signupForm.value.phone);

    if (response.success) {
      phoneVerificationSent.value = true;
      showToast(response.message);
    } else {
      showToast(response.message, 'warning');
    }
  } catch (error) {
    showToast('인증번호 발송에 실패했습니다.', 'error');
  }
};

const verifyPhoneCode = async () => {
  if (!signupForm.value.verificationCode) {
    showToast('인증번호를 입력해주세요.', 'warning');
    return;
  }

  try {
    const response = await smsAPI.verifyCode(
      signupForm.value.phone,
      signupForm.value.verificationCode
    );

    if (response.success) {
      phoneVerified.value = true;
      showToast(response.message);
    } else {
      phoneVerified.value = false;
      showToast(response.message, 'warning');
    }
  } catch (error) {
    phoneVerified.value = false;
    showToast('인증번호가 일치하지 않습니다.', 'error');
  }
};

const handleSignup = async () => {
  if (!isFormValid.value) {
    showToast('모든 필수 항목을 입력해주세요.', 'warning');
    return;
  }

  try {
    const signupData = {
      username: signupForm.value.name,
      email: signupForm.value.email,
      nickname: signupForm.value.nickname,
      birthDate: signupForm.value.birthdate,
      gender: genderMapping[signupForm.value.gender] || signupForm.value.gender,
      termsRequired1: agreements.value.terms,
      termsRequired2: agreements.value.privacy,
      receivePushNotification: agreements.value.marketing,
    };

    if (!isSocialSignup.value) {
      signupData.password = signupForm.value.password;
      signupData.passwordCheck = signupForm.value.passwordConfirm;
      signupData.phoneNumber = signupForm.value.phone;
    }

    // API 호출
    const response = isSocialSignup.value
      ? await authAPI.socialSignup(signupData)
      : await authAPI.signup(signupData);

    if (response.success) {
      if (isSocialSignup.value) {
        // 소셜 회원가입 완료 후 OAuth2 토큰 교환
        const pendingCode = localStorage.getItem('pendingOAuth2Code');

        if (pendingCode) {
          // 저장된 OAuth2 코드로 실제 로그인 처리
          const authResult = await authAPI.exchangeOAuth2Token(pendingCode);

          if (authResult.success && authResult.data) {
            const authData = authResult.data;

            // 토큰 설정
            authStore.setTokens(authData.accessToken, authData.refreshToken);

            // 사용자 정보 설정
            if (authData.userInfo) {
              authStore.setUser(authData.userInfo);
            }

            // 임시 코드 삭제
            localStorage.removeItem('pendingOAuth2Code');

            showToast('소셜 회원가입이 완료되었습니다!');

            // 원래 가려던 페이지로 이동
            const redirectTo = route.query.from || '/';
            router.push(redirectTo);
          } else {
            showToast('로그인 처리 중 오류가 발생했습니다.', 'error');
            router.push('/login');
          }
        } else {
          showToast('인증 정보가 없습니다. 다시 로그인해주세요.', 'error');
          router.push('/login');
        }
      } else {
        showToast('회원가입이 완료되었습니다. 로그인해주세요.');
        router.push('/login');
      }
    } else {
      showToast(response.message, 'error');
    }
  } catch (error) {
    showToast('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
  }
};
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 2.5rem; /* 40px */
}

.logo {
  font-size: 2rem; /* 32px */
  font-weight: bold;
  color: var(--color-main);
  margin: 0 0 0.5rem 0; /* 8px */
}

.subtitle {
  color: var(--color-sub);
  margin: 0;
  font-size: 0.875rem; /* 14px */
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
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-main);
}

.form-group input:disabled {
  background-color: var(--color-bg-light);
  color: var(--color-sub);
  cursor: not-allowed;
}

.input-with-button {
  display: flex;
  gap: 0.5rem; /* 8px */
}

.input-with-button input {
  flex: 1;
}
/* 비밀번호 요구사항 - 컴팩트 버전 */
.password-requirements-compact {
  margin-top: 0.375rem; /* 6px */
  display: flex;
  gap: 0.75rem; /* 12px */
  flex-wrap: wrap;
}

.requirement-compact {
  font-size: 0.75rem; /* 12px */
  color: var(--color-light);
  transition: color 0.3s ease;
  position: relative;
}

.requirement-compact.valid {
  color: var(--color-main);
}

.requirement-compact.valid::before {
  content: '✓';
  margin-right: 0.25rem; /* 4px */
  font-weight: bold;
}

/* 비밀번호 일치 확인 */
.password-match {
  margin-top: 0.5rem; /* 8px */
  font-size: 0.875rem; /* 14px */
  display: flex;
  align-items: center;
}

.password-match i {
  margin-right: 0.375rem; /* 6px */
}

.text-success {
  color: var(--color-main);
}

.text-danger {
  color: #dc3545;
}

.verify-btn {
  padding: 0.75rem 1rem;
  width: 30%; /* 12px 16px */
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.375rem; /* 6px */
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.875rem; /* 14px */
}

.verify-btn:hover {
  background-color: #1e2347;
}

.verify-btn:disabled {
  background-color: var(--color-light);
  cursor: not-allowed;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem; /* 12px */
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-sub);
}

/* 약관 동의 스타일 */
.agreement-section {
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem; /* 8px */
  padding: 1rem; /* 16px */
  margin-top: 0.5rem; /* 8px */
}

.agreement-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0; /* 8px */
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
  width: 1.25rem; /* 20px */
  height: 1.25rem; /* 20px */
  border: 2px solid var(--color-light);
  border-radius: 0.25rem; /* 4px */
  margin-right: 0.75rem; /* 12px */
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.agreement-item input[type='checkbox']:checked + .checkmark {
  background-color: var(--color-main);
  border-color: var(--color-main);
}

.agreement-item input[type='checkbox']:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 0.375rem; /* 6px */
  top: 0.125rem; /* 2px */
  width: 0.375rem; /* 6px */
  height: 0.625rem; /* 10px */
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.agreement-text {
  flex: 1;
  font-size: 0.875rem; /* 14px */
  color: var(--color-main);
}

.all-agreement {
  font-weight: 600;
  font-size: 1rem; /* 16px */
}

.all-agreement .checkmark {
  width: 1.375rem; /* 22px */
  height: 1.375rem; /* 22px */
}

.agreement-divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 0.75rem 0; /* 12px */
}

.individual-agreements {
  padding-left: 0.5rem; /* 8px */
}

.view-btn {
  background: none;
  border: 1px solid var(--color-light);
  color: var(--color-sub);
  padding: 0.25rem 0.5rem; /* 4px 8px */
  border-radius: 0.25rem; /* 4px */
  font-size: 0.75rem; /* 12px */
  cursor: pointer;
  margin-left: 0.5rem; /* 8px */
}

.view-btn:hover {
  background-color: var(--color-bg-light);
  border-color: var(--color-sub);
}

.optional .agreement-text {
  color: var(--color-sub);
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
  border-radius: 0.5rem; /* 8px */
  width: 90%;
  max-width: 37.5rem; /* 600px */
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.15); /* 4px 20px */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem; /* 20px */
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem; /* 24px */
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 1.875rem; /* 30px */
  height: 1.875rem; /* 30px */
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.25rem; /* 20px */
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body h4 {
  color: #333;
  margin: 1rem 0 0.5rem 0; /* 16px 8px */
  font-size: 1rem; /* 16px */
}

.modal-body p {
  color: #666;
  line-height: 1.5;
  margin-bottom: 0.5rem; /* 8px */
}

.success-message {
  color: var(--color-main);
  font-size: 0.75rem; /* 12px */
  margin-top: 0.25rem; /* 4px */
}

.error-message {
  color: #dc3545;
  font-size: 0.75rem; /* 12px */
  margin-top: 0.25rem; /* 4px */
}

.signup-btn {
  width: 100%;
  padding: 0.75rem; /* 12px */
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.375rem; /* 6px */
  font-size: 1rem; /* 16px */
  cursor: pointer;
  margin-bottom: 1.25rem; /* 20px */
}

.signup-btn:hover {
  background-color: #1e2453;
}

.signup-btn:disabled {
  background-color: var(--color-light);
  cursor: not-allowed;
}

.links {
  text-align: center;
  margin-bottom: 1.875rem; /* 30px */
}

.link {
  color: var(--color-sub);
  text-decoration: none;
  font-size: 0.875rem; /* 14px */
}

.link:hover {
  color: var(--color-main);
}

.divider {
  margin: 0 0.625rem; /* 10px */
  color: var(--color-light);
}

/* 성별 버튼 스타일 */
.gender-buttons {
  display: flex;
  gap: 0.5rem; /* 8px */
  margin-top: 0.5rem; /* 8px */
}

.gender-btn {
  flex: 1;
  padding: 0.75rem; /* 12px */
  border: 1px solid #ddd;
  border-radius: 0.375rem; /* 6px */
  background-color: white;
  color: #666;
  cursor: pointer;
  font-size: 0.875rem; /* 14px */
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
</style>
