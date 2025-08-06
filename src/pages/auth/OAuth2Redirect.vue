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

// ✅ handleOAuth2Error 함수를 onMounted 밖으로 이동
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
    const errorCode = urlParams.get('errorCode');
    const message = urlParams.get('message');

    if (error === 'oauth2_failed') {
      console.error('OAuth2 오류 발생:', { errorCode, message });
      handleOAuth2Error(errorCode, message);
      router.push('/login');
      return;
    }

    const code = urlParams.get('code');

    console.log('받은 파라미터들:');
    console.log('code:', code);

    if (!code) {
      console.error('코드가 없습니다');
      alert('로그인에 실패했습니다. (코드 없음)');
      router.push('/login');
      return;
    }

    console.log('서버에 토큰 교환 요청 중...');
    const response = await authAPI.exchangeToken(code);

    if (!response.success) {
      console.error('토큰 교환 실패:', response.message);
      alert(`로그인에 실패했습니다: ${response.message}`);
      router.push('/login');
      return;
    }

    console.log('토큰 교환 성공:', response.data);

    const { accessToken, refreshToken, userInfo, isNewMember } = response.data;

    if (isNewMember) {
      console.log('신규 회원 - 회원가입 폼으로 이동');
      console.log('신규 회원 데이터:', userInfo);

      router.push({
        path: '/login/signup',
        query: {
          socialSignup: 'true',
          name: userInfo?.name || userInfo?.username,
          email: userInfo?.email,
          profileImage: userInfo?.profileImage,
          tempToken: accessToken,
        },
      });
    } else {
      console.log('기존 회원 - 홈으로 이동');
      console.log('기존 회원 토큰 정보:', {
        accessToken,
        refreshToken,
        userInfo,
      });

      authStore.setTokens(accessToken, refreshToken);

      if (userInfo) {
        authStore.user = userInfo;
        localStorage.setItem('user', JSON.stringify(userInfo));
      }

      if (typeof authStore.initialize === 'function') {
        await authStore.initialize();
      }

      alert('로그인 성공!');

      const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');

      router.push(redirectTo);
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
