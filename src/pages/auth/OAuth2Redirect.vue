<template>
  <div class="oauth2-redirect">
    <div class="loading-container">
      <div class="spinner"></div>
      <p>로그인 처리 중...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { authAPI } from '@/api/auth';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);

    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');
    const code = urlParams.get('code');
    const isNewMember = urlParams.get('isNewMember') === 'true';
    const email = urlParams.get('email') ? decodeURIComponent(urlParams.get('email')) : '';
    const username = urlParams.get('username') ? decodeURIComponent(urlParams.get('username')) : '';
    const profileImage = urlParams.get('profileImage')
      ? decodeURIComponent(urlParams.get('profileImage'))
      : '';

    if (error === 'oauth2_failed' && errorMessage) {
      const decodedMessage = decodeURIComponent(errorMessage);
      console.error('OAuth2 로그인 실패:', decodedMessage);

      router.push('/login');
      return;
    }

    if (isNewMember) {
      localStorage.setItem('signupPending', 'true');
      router.push({
        path: '/login/signup',
        query: {
          socialSignup: 'true',
          name: username,
          email: email,
          profileImage: profileImage || '',
        },
      });

      return;
    }

    const result = await authAPI.exchangeOAuth2Token(code);

    if (result.success) {
      const authResult = result.data;

      if (authResult && authResult.accessToken && authResult.refreshToken) {
        authStore.setTokens(authResult.accessToken, authResult.refreshToken);

        if (authResult.userInfo) {
          authStore.user = authResult.userInfo;
          localStorage.setItem('userInfo', JSON.stringify(authResult.userInfo));
        }
        showToast('로그인 성공!');
        router.push('/');
      } else {
        showToast('로그인 정보 저장에 실패했습니다.', 'error');
        router.push('/login');
      }
    } else {
      showToast(result.message, 'error');
      router.push('/login');
    }
  } catch (error) {
    showToast('로그인 처리 중 오류가 발생했습니다.', 'error');
    router.push('/login');
  }
});
</script>

<style scoped>
.oauth2-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: white;
}

.loading-container {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-light);
  border-top: 4px solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: var(--color-sub);
  font-size: 1rem;
}
</style>
