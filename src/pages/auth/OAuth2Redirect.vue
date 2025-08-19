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
      showToast(decodedMessage, 'error');

      router.push('/login');
      return;
    }

    // 신규 회원인 경우 로그인 처리 없이 바로 추가정보 입력 페이지로 이동
    if (isNewMember) {
      // 임시로 코드를 localStorage에 저장 (추가정보 입력 완료 후 사용)
      localStorage.setItem('pendingOAuth2Code', code);

      router.push({
        path: '/login/signup',
        query: {
          socialSignup: 'true',
          name: username,
          email: email,
          profileImage: profileImage || '',
          required: 'true',
        },
        replace: true,
      });

      return;
    }

    // 기존 회원 로그인 처리
    const result = await authAPI.exchangeOAuth2Token(code);

    if (result.success) {
      const authResult = result.data;

      if (authResult && authResult.accessToken && authResult.refreshToken) {
        authStore.setTokens(authResult.accessToken, authResult.refreshToken);

        if (authResult.userInfo) {
          authStore.setUser(authResult.userInfo);

          setTimeout(() => {
            if (authStore.needsAdditionalInfo) {
              router.push({
                path: '/login/signup',
                query: {
                  socialSignup: 'true',
                  name: authResult.userInfo?.username,
                  email: authResult.userInfo?.email,
                  required: 'true',
                },
                replace: true,
              });
              showToast('서비스 이용을 위해 추가 정보를 입력해주세요.', 'info');
              return;
            }

            showToast('로그인 성공!');
            router.push('/');
          }, 100);
        } else {
          showToast('로그인 정보 저장에 실패했습니다.', 'error');
          router.push('/login');
        }
      } else {
        showToast('로그인 정보 저장에 실패했습니다.', 'error');
        router.push('/login');
      }
    } else {
      showToast(result.message, 'error');
      router.push('/login');
    }
  } catch (error) {
    console.error('OAuth2 redirect error:', error);
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
