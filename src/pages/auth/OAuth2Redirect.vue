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

function handleOAuth2Error(errorCode, message) {
  console.error('OAuth2 오류:', { errorCode, message });

  const decodedMessage = message
    ? decodeURIComponent(message)
    : '소셜 로그인 중 오류가 발생했습니다.';

  alert(decodedMessage);
}

onMounted(async () => {
  try {
    console.log('OAuth2 리다이렉트 페이지 로드됨');
    console.log('현재 URL:', window.location.href);

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

    console.log('받은 파라미터들:');
    console.log('code:', code);
    console.log('isNewMember:', isNewMember, '(타입:', typeof isNewMember, ')');
    console.log('email:', email);
    console.log('username:', username);
    console.log('profileImage:', profileImage);

    if (error === 'oauth2_failed' && errorMessage) {
      console.error('OAuth2 로그인 실패:', errorMessage);

      const decodedMessage = decodeURIComponent(errorMessage);
      alert(decodedMessage);

      router.push('/login');
      return;
    }

    if (isNewMember) {
      console.log('신규 회원 - 회원가입 폼으로 이동');

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

    console.log('토큰 교환 요청 시작');
    const result = await authAPI.exchangeOAuth2Token(code);

    console.log('토큰 교환 결과:', result);

    if (result.success) {
      const authResult = result.data;

      console.log('authResult:', authResult);

      if (authResult && authResult.accessToken && authResult.refreshToken) {
        console.log('기존 회원 - 토큰 저장 후 홈으로 이동');
        authStore.setTokens(authResult.accessToken, authResult.refreshToken);

        if (authResult.userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(authResult.userInfo));
        }
        console.log('토큰 저장 완료');
        alert('로그인 성공!');
        router.push('/');
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
