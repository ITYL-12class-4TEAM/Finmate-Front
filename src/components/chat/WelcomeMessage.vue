<template>
  <div class="welcome-message">
    <div class="bot-avatar">
      <img :src="botAvatarImage" alt="해결사" />
    </div>
    <div class="welcome-content">
      <p>안녕하세요! FinMate 챗봇입니다.</p>
      <p>금융 관련 질문이나 서비스 문의사항을 도와드릴게요!</p>
      <p v-if="!isAuthenticated" class="login-notice">
        🔐 로그인하시면 더 많은 개인화 서비스를 이용하실 수 있습니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import botAvatarImage from '@/assets/images/해결사.png';

defineProps({
  isAuthenticated: Boolean,
});
</script>

<style scoped>
.welcome-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg-light);
  border-radius: 12px;
  color: var(--color-sub);
  font-size: 0.875rem;
}

.bot-avatar {
  width: 48px;
  height: 48px;
  background: var(--color-white);
  border: 1.5px solid #d3d3d3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.bot-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.welcome-content p {
  margin: 0 0 0.5rem 0;
}

.welcome-content p:last-child {
  margin-bottom: 0;
}

.login-notice {
  font-size: 0.8rem;
  color: var(--color-main) !important;
  font-weight: 500;
  background: rgba(45, 51, 107, 0.1);
  padding: 0.5rem;
  border-radius: 6px;
  margin-top: 0.5rem !important;
}
</style>
