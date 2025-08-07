<template>
  <div class="message bot typing-message">
    <div class="message-content">
      <!-- 봇 아바타 -->
      <div class="bot-avatar">
        <div class="avatar-ring"></div>
        <div class="avatar-inner">
          <img :src="botAvatarImage" alt="해결사" />
          <div class="avatar-pulse"></div>
        </div>
      </div>

      <!-- 타이핑 버블 -->
      <div class="message-bubble typing-bubble">
        <!-- 타이핑 애니메이션 -->
        <div class="typing-content">
          <div class="typing-dots">
            <span class="dot dot-1"></span>
            <span class="dot dot-2"></span>
            <span class="dot dot-3"></span>
          </div>
          <div class="typing-text">입력중...</div>
        </div>

        <!-- 파티클 효과 -->
        <div class="typing-particles">
          <div class="particle particle-1">💭</div>
          <div class="particle particle-2">✨</div>
          <div class="particle particle-3">💫</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import botAvatarImage from '@/assets/images/해결사.png';
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
}

.typing-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  animation: typingSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  max-width: 85%;
}

/* 봇 아바타 스타일링 */
.bot-avatar {
  position: relative;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2); /* 연한 배경색 */
  backdrop-filter: blur(8px); /* ✅ 블러 효과 핵심 */
  -webkit-backdrop-filter: blur(8px); /* Safari 지원 */
  z-index: 0;
  animation: avatarPulse 3s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(45, 51, 107, 0.2); /* 추가 glow */
}

.avatar-inner {
  position: relative;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  padding: 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.15);
}

.avatar-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-pulse {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgba(45, 51, 107, 0.3);
  border-radius: 50%;
  animation: avatarPulseRing 2s ease-in-out infinite;
}

/* 타이핑 버블 스타일링 */
.typing-bubble {
  position: relative;
  min-width: 120px;
  border-radius: 1.5rem 1.5rem 1.5rem 0.375rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.08);
  animation: bubbleBreathe 3s ease-in-out infinite;
}

.typing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  position: relative;
  z-index: 1;
}

.typing-dots {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-main);
  animation: typingBounce 1.6s infinite ease-in-out;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.2s;
}

.dot-3 {
  animation-delay: 0.4s;
}

.typing-text {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-sub);
  opacity: 0.8;
  letter-spacing: 0.02em;
  animation: textFade 2s ease-in-out infinite;
}

/* 파티클 효과 */
.typing-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  font-size: 0.625rem;
  opacity: 0.2;
  animation: particleFloat 4s ease-in-out infinite;
}

.particle-1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
}

.particle-2 {
  top: 60%;
  right: 20%;
  animation-delay: 1.3s;
}

.particle-3 {
  bottom: 25%;
  left: 70%;
  animation-delay: 2.6s;
}

/* 애니메이션 키프레임 */
@keyframes typingSlideIn {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes avatarPulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes avatarPulseRing {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

@keyframes bubbleBreathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes typingBounce {
  0%,
  60%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-8px) scale(1.1);
    opacity: 1;
  }
}

@keyframes textFade {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.1;
  }
  33% {
    transform: translate(3px, -5px) rotate(120deg);
    opacity: 0.3;
  }
  66% {
    transform: translate(-2px, -8px) rotate(240deg);
    opacity: 0.2;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .message-content {
    gap: 0.5rem;
  }

  .bot-avatar {
    width: 2rem;
    height: 2rem;
  }

  .typing-content {
    padding: 0.875rem 1rem;
  }

  .dot {
    width: 0.4375rem;
    height: 0.4375rem;
  }

  .typing-particles {
    display: none; /* 모바일에서는 파티클 숨김 */
  }
}

/* 다크모드 지원 */
@media (prefers-color-scheme: dark) {
  .typing-bubble {
    background: rgba(45, 51, 107, 0.15);
  }

  .typing-text {
    color: var(--color-light);
  }

  .avatar-inner {
    background: rgba(255, 255, 255, 0.9);
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .typing-message,
  .avatar-ring,
  .dot,
  .particle {
    animation-duration: 0.2s;
  }

  .bubbleBreathe,
  .textFade {
    animation: none;
  }
}

/* 호버 효과 */
.typing-bubble:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 25px rgba(45, 51, 107, 0.12);
}

.typing-bubble:hover .dot {
  animation-duration: 0.8s;
}
</style>
