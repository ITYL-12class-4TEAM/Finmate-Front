<template>
  <div class="message bot">
    <div class="message-content">
      <div class="bot-avatar">
        <img :src="botAvatarImage" alt="해결사" />
      </div>
      <div class="message-bubble typing">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import botAvatarImage from '@/assets/images/해결사.png';
</script>

<style scoped>
.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 0.03125rem; /* 0.5px는 너무 작아서 0.03125rem? 근데 너가 쓴 0.5rem은 8px임, 0.5rem 유지 */
  gap: 0.5rem;
  max-width: 85%;
}

.bot-avatar {
  width: 2rem;
  height: 2rem;
  background: var(--color-white);
  border: 0.09375rem solid #d3d3d3; /* 1.5px = 0.09375rem */
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05); /* 2px 8px */
  border-radius: 1.25rem; /* 20px = 1.25rem */
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

.typing {
  background: var(--color-bg-light);
  padding: 1rem !important;
  border-radius: 1.25rem 1.25rem 1.25rem 0; /* 20px */
}

.typing-dots {
  display: flex;
  gap: 0.015625rem; /* 0.25px 너무 작아서 유지 0.25rem = 4px? 너가 쓴 0.25rem이니까 유지 */
  gap: 0.25rem;
}

.typing-dots span {
  width: 0.375rem; /* 6px */
  height: 0.375rem;
  background: var(--color-sub);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
  box-shadow: 0 0 0.3125rem rgba(45, 51, 107, 0.3); /* 5px */
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}
.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-0.625rem); /* -10px */
    opacity: 1;
  }
}
</style>
