<template>
  <div class="login-form">
    <!-- 헤더 -->
    <div class="header">
      <h1 class="logo">FinMate</h1>
      <p class="subtitle">로그인</p>
    </div>
    <!-- 로그인 폼 -->
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">이메일 입력</label>
        <input
          id="email"
          v-model="loginForm.email"
          type="email"
          placeholder="이메일을 입력하세요"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">비밀번호 입력</label>
        <div class="password-input">
          <input
            id="password"
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="비밀번호를 입력하세요"
            required
          />
          <button type="button" class="password-toggle" @click="togglePassword">
            <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
          </button>
        </div>
      </div>
      <button type="submit" class="login-btn" :disabled="isLoading">
        {{ isLoading ? '로그인 중...' : '로그인' }}
      </button>
    </form>
    <!-- 링크들 -->
    <div class="links">
      <router-link to="/login/signup" class="link">회원가입</router-link>
      <span class="divider">|</span>
      <router-link to="/login/find-id" class="link">아이디 찾기</router-link>
      <span class="divider">|</span>
      <router-link to="/login/find-password" class="link">비밀번호 찾기</router-link>
    </div>
    <!-- 소셜 로그인 -->
    <div class="social-login">
      <button class="social-btn google" @click="handleGoogleLogin">
        <img src="@/assets/images/google_icon.png" alt="Google" />
      </button>
      <button class="social-btn kakao" @click="handleKakaoLogin">
        <img src="@/assets/images/kakao_icon.png" alt="Kakao" />
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const router = useRouter();
const authStore = useAuthStore();
const loginForm = ref({
  email: '',
  password: '',
});

const showPassword = ref(false);

// computed 속성
const isLoading = computed(() => authStore.isLoading);

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    showToast('이메일과 비밀번호를 입력해주세요.', 'warning');
    return;
  }
  if (!isValidEmail(loginForm.value.email)) {
    showToast('올바른 이메일 형식을 입력해주세요.', 'warning');
    return;
  }

  try {
    const result = await authStore.login(loginForm.value.email, loginForm.value.password);

    if (result.success) {
      showToast('로그인 성공!');
      const redirectTo = router.currentRoute.value.query.redirect || '/';
      await router.push(redirectTo);
      // alert(`환영합니다! ${authStore.userInfo?.nickname || authStore.userInfo?.username || ''}님`);
    } else {
      showToast(result.message, 'error');
    }
  } catch (error) {
    showToast('로그인 처리 중 오류가 발생했습니다.', 'error');
  }
};

const getSocialLoginURL = (provider) => {
  const baseURL = 'http://54.180.75.58:8080';
  return `${baseURL}/oauth2/authorization/${provider}`;
};

const handleGoogleLogin = () => {
  window.location.href = getSocialLoginURL('google');
};

const handleKakaoLogin = () => {
  window.location.href = getSocialLoginURL('kakao');
};
</script>

<style scoped>
/* LoginLayout에서 컨테이너 스타일 처리 */

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

.login-btn {
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

.login-btn:hover {
  background-color: #171d4e;
}

.login-btn:disabled {
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

.social-login {
  display: flex;
  justify-content: center;
  gap: 1rem; /* 16px */
  margin-top: 1.25rem; /* 20px */
  position: relative;
  padding-top: 1.25rem; /* 20px */
}

.social-login::before {
  content: 'SNS LOGIN';
  position: absolute;
  top: -0.9375rem; /* -15px */
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem; /* 12px */
  color: var(--color-sub);
  background: white;
  padding: 0 0.9375rem; /* 15px */
}

.social-login::after {
  content: '';
  position: absolute;
  top: 0.625rem; /* 10px */
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-light);
  z-index: -1;
}

.social-btn {
  width: 3.125rem; /* 50px */
  height: 3.125rem; /* 50px */
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.2s ease;
}

.social-btn:hover {
  transform: scale(1.05);
}

.social-btn img {
  width: 1.875rem; /* 30px */
  height: 1.875rem; /* 30px */
  object-fit: contain;
}

.social-btn.kakao {
  background-color: #fee500;
  box-shadow: 0 0.125rem 0.5rem rgba(254, 229, 0, 0.3); /* 2px 8px */
}

.social-btn.google {
  background-color: #fff;
  border: 1px solid #dadce0;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1); /* 2px 8px */
}
</style>
