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
    console.log('현재 포트:', window.location.port);

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');
    const isNewMember = urlParams.get('isNewMember') === 'true';
    const email = urlParams.get('email');
    const nickname = urlParams.get('nickname');
    const profileImage = urlParams.get('profileImage');

    console.log('받은 파라미터들:');
    console.log('token:', token);
    console.log('refreshToken:', refreshToken);
    console.log('isNewMember:', isNewMember);
    console.log('email:', email);
    console.log('nickname:', nickname);
    console.log('profileImage:', profileImage);

    if (!token) {
      console.error('토큰이 없습니다');
      console.log('URL 전체 쿼리 스트링:', window.location.search);
      alert('로그인에 실패했습니다. 콘솔을 확인해주세요.');
      router.push('/login');
      return;
    }

    // 토큰을 스토어에 저장
    console.log('토큰 저장 중...');
    authStore.setTokens(token, refreshToken);

    if (isNewMember) {
      console.log('신규 회원 - 회원가입 폼으로 이동');
      // 신규 회원인 경우 회원가입 폼으로 이동 (정보 미리 채워넣기)
      router.push({
        path: '/login/signup',
        query: {
          email: email,
          nickname: nickname,
          profileImage: profileImage,
          socialSignup: 'true',
        },
      });
    } else {
      console.log('기존 회원 - 홈으로 이동');
      // 기존 회원인 경우 홈으로 이동
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
