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

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    console.log('OAuth2 리다이렉트 페이지 로드됨');
    console.log('현재 URL:', window.location.href);

    const urlParams = new URLSearchParams(window.location.search);

    // 서버에서 보내는 파라미터 이름에 맞게 수정
    const token = urlParams.get('token'); // 서버에서 'token'으로 보냄
    const refreshToken = urlParams.get('refreshToken');
    const isNewMember = urlParams.get('isNewMember') === 'true';
    const memberId = urlParams.get('memberId');
    const email = urlParams.get('email');
    const username = urlParams.get('username'); // username 추가
    const profileImage = urlParams.get('profileImage');

    console.log('받은 파라미터들:');
    console.log('token:', token);
    console.log('refreshToken:', refreshToken);
    console.log('isNewMember:', isNewMember);
    console.log('memberId:', memberId);
    console.log('email:', email);
    console.log('username:', username);

    if (!token) {
      console.error('토큰이 없습니다');
      alert('로그인에 실패했습니다. (토큰 없음)');
      router.push('/login');
      return;
    }

    if (isNewMember) {
      console.log('신규 회원 - 회원가입 폼으로 이동');
      console.log('신규 회원 데이터:', { email, username });

      // 신규 회원인 경우 회원가입 폼으로 이동
      router.push({
        path: '/login/signup',
        query: {
          socialSignup: 'true',
          name: username,
          email: email,
          profileImage: profileImage,
          tempToken: token, // temp 토큰 추가
        },
      });
    } else {
      console.log('기존 회원 - 홈으로 이동');
      console.log('기존 회원 토큰 정보:', {
        accessToken: token,
        refreshToken: refreshToken,
        memberId: memberId,
      });

      // 기존 회원은 토큰 저장하고 홈으로
      authStore.setTokens(token, refreshToken, memberId);

      // setup 함수가 있다면 호출
      if (typeof authStore.setup === 'function') {
        await authStore.setup();
      }

      alert('로그인 성공!');
      router.push('/');
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
