<template>
  <div class="login-container">
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
            type="email"
            id="email"
            v-model="loginForm.email"
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">비밀번호 입력</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="loginForm.password"
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
        <router-link to="/login/find-password" class="link"
          >비밀번호 찾기</router-link
        >
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
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
const router = useRouter();
const authStore = useAuthStore();
const loginForm = ref({
  email: '',
  password: '',
});
const showPassword = ref(false);

// computed 속성
const isLoading = computed(() => authStore.isLoading);

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    alert('이메일과 비밀번호를 입력해주세요.');
    return;
  }

  try {
    const result = await authStore.login(
      loginForm.value.email,
      loginForm.value.password
    );

    if (result.success) {
      console.log('로그인 성공:', authStore.userInfo);
      alert('로그인 성공!');
      router.push('/'); // 홈으로 이동
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('로그인 처리 중 오류:', error);
    alert('로그인 처리 중 오류가 발생했습니다.');
  }
};

// 소셜 로그인 함수들
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
};

const handleKakaoLogin = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/kakao';
};
</script>
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: white;
  padding: 150px 0px 20px 0px;
}
.login-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
.header {
  text-align: center;
  margin-bottom: 40px;
}
.logo {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-main);
  margin: 0 0 8px 0;
}
.subtitle {
  color: var(--color-sub);
  margin: 0;
  font-size: 0.9rem;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-main);
  font-size: 0.9rem;
}
.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-light);
  border-radius: 6px;
  font-size: 1rem;
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
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-sub);
}
.login-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 20px;
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
  margin-bottom: 30px;
}
.link {
  color: var(--color-sub);
  text-decoration: none;
  font-size: 0.9rem;
}
.link:hover {
  color: var(--color-main);
}
.divider {
  margin: 0 10px;
  color: var(--color-light);
}
.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.social-login::before {
  content: 'SNS LOGIN';
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--color-sub);
  background: white;
  padding: 0 15px;
}

.social-login {
  position: relative;
  padding-top: 20px;
}

.social-login::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-light);
  z-index: -1;
}

.social-btn {
  width: 50px;
  height: 50px;
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
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.social-btn.kakao {
  background-color: #fee500;
  box-shadow: 0 2px 8px rgba(254, 229, 0, 0.3);
}

.social-btn.google {
  background-color: #fff;
  border: 1px solid #dadce0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
