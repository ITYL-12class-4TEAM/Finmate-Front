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
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { authAPI } from '@/api/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    console.log('OAuth2 리다이렉트 페이지 로드됨');
    console.log('현재 URL:', window.location.href);

    const urlParams = new URLSearchParams(window.location.search);

    const error = urlParams.get('error');
    const errorMessage = urlParams.get('message');

    if (error === 'oauth2_failed' && errorMessage) {
      console.error('OAuth2 로그인 실패:', errorMessage);

      const decodedMessage = decodeURIComponent(errorMessage);
      alert(decodedMessage);

      router.push('/login');
      return;
    }

    const code = urlParams.get('code');

    console.log('받은 파라미터들:');
    console.log('code:', code);

    if (!code) {
      console.error('Authorization code가 없습니다');
      alert('로그인에 실패했습니다. (인증 코드 없음)');
      router.push('/login');
      return;
    }

    console.log('토큰 교환 요청 시작');
    const result = await authAPI.exchangeOAuth2Token(code);

    console.log('토큰 교환 결과:', result);

    if (result.success) {
      const authResult = result.data;

      console.log('authResult:', authResult);

      if (authResult && authResult.accessToken && authResult.refreshToken) {
        if (authResult.isNewMember) {
          console.log('신규 회원 - 회원가입 폼으로 이동');

          router.push({
            path: '/login/signup',
            query: {
              socialSignup: 'true',
              name: authResult.userMember?.username || authResult.username,
              email: authResult.userMember?.email || authResult.email,
              profileImage:
                authResult.userMember?.profileImage || authResult.profileImage,
              tempToken: authResult.accessToken,
            },
          });
        } else {
          console.log('기존 회원 - 토큰 저장 후 홈으로 이동');
          authStore.setTokens(authResult.accessToken, authResult.refreshToken);

          if (authResult.userInfo) {
            localStorage.setItem(
              'userInfo',
              JSON.stringify(authResult.userInfo)
            );
          }
          console.log('토큰 저장 완료');
          alert('로그인 성공!');
          router.push('/');
        }
      } else {
        console.error('토큰 정보가 없습니다:', authResult);
        alert('로그인 정보 저장에 실패했습니다.');
        router.push('/login');
      }
    } else {
      console.error('토큰 교환 실패:', result.message);
      alert(result.message);
      router.push('/login');
    }
  } catch (error) {
    console.error('OAuth2 리다이렉트 처리 오류:', error);
    alert('로그인 처리 중 오류가 발생했습니다.');
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
