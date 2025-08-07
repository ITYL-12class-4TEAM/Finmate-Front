<template>
  <div class="welcome-message">
    <!-- 배경 장식 -->
    <div class="welcome-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="welcome-main">
      <!-- 아바타 섹션 -->
      <div class="avatar-section">
        <div class="bot-avatar">
          <div class="avatar-inner">
            <img :src="botAvatarImage" alt="해결사" />
            <div class="avatar-sparkle">✨</div>
          </div>
        </div>
        <div class="avatar-speech-bubble">
          <span class="typing-text">
            안녕하세요! 👋<br />
            저는 <strong>FinMate</strong>, 당신의 금융 해결사입니다 💼✨
          </span>
        </div>
      </div>

      <!-- 웰컴 콘텐츠 -->
      <div class="welcome-content">
        <!-- 로그인 알림 -->
        <div v-if="!isAuthenticated" class="login-notice">
          <div class="notice-icon">🔐</div>
          <div class="notice-content">
            <p class="notice-title">더 많은 서비스를 경험해보세요!</p>
            <p class="notice-subtitle">로그인하시면 개인화된 금융 정보를 제공해드려요</p>
          </div>
          <div class="notice-sparkle">💫</div>
        </div>
      </div>
    </div>

    <!-- 떠다니는 장식 -->
    <div class="floating-decorations">
      <div class="decoration decoration-1">💎</div>
      <div class="decoration decoration-2">✨</div>
      <div class="decoration decoration-3">🌟</div>
      <div class="decoration decoration-4">💫</div>
      <div class="decoration decoration-5">💙</div>
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
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  animation: welcomeSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

/* 배경 효과 */
.welcome-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -2;
}
.avatar-speech-bubble {
  position: relative;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  text-align: center;
  font-size: 0.875rem;
  color: #374151;
  animation: welcomeSlideIn 0.8s ease-out;
}

.avatar-speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px 8px 0;
  border-style: solid;
  border-color: white transparent transparent;
  filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.03));
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.9) 30%,
    rgba(240, 249, 255, 0.95) 70%,
    rgba(239, 246, 255, 0.9) 100%
  );
  backdrop-filter: blur(12px) saturate(110%);
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.04) 0%, transparent 50%);
  animation: patternShift 15s ease-in-out infinite;
}

.welcome-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 1.75rem;
  position: relative;
  z-index: 1;
}

/* 아바타 섹션 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
}

.bot-avatar {
  position: relative;
  width: 8rem;
  height: 8rem;
  flex-shrink: 0;
}

.avatar-inner {
  position: relative;
  width: 100%;
  height: 100%;
  /* border-radius: 50%; */
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15); */
  /* border: 3px solid rgba(79, 172, 254, 0.2); */
  animation: avatarBreathe 4s ease-in-out infinite;
}

.avatar-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* border-radius: 50%; */
}

.avatar-sparkle {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 1.25rem;
  animation: sparkleRotate 2s ease-in-out infinite;
  z-index: 2;
}

.speech-tail {
  position: absolute;
  bottom: -8px;
  right: 15px;
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 16px solid rgba(255, 255, 255, 0.95);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  z-index: 1;
}

.avatar-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bot-name {
  font-size: 1.125rem;
  font-weight: 700;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.bot-status {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* 웰컴 콘텐츠 */
.welcome-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.greeting-section {
  text-align: center;
}

.greeting-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #374151;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.wave-emoji {
  animation: wave 2s ease-in-out infinite;
}

.greeting-subtitle {
  font-size: 0.9375rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.greeting-subtitle strong {
  color: #4facfe;
  font-weight: 700;
}

/* 말하는 중 인디케이터 */
.speaking-indicators {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  opacity: 0.7;
}

.sound-wave {
  display: flex;
  align-items: center;
  gap: 0.1875rem;
}

.wave {
  width: 0.1875rem;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 0.09375rem;
  animation: soundWave 1.2s ease-in-out infinite;
}

.wave-1 {
  height: 0.75rem;
  animation-delay: 0s;
}

.wave-2 {
  height: 1.25rem;
  animation-delay: 0.2s;
}

.wave-3 {
  height: 0.875rem;
  animation-delay: 0.4s;
}

.speaking-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* 서비스 소개 */
.service-intro {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  border: 1px solid rgba(79, 172, 254, 0.1);
}

.intro-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.intro-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.05));
  border-radius: 50%;
  font-size: 1rem;
}

/* 로그인 알림 */
.login-notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

.login-notice::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

.notice-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3730a3;
  margin: 0 0 0.25rem 0;
}

.notice-subtitle {
  font-size: 0.8125rem;
  color: #6366f1;
  margin: 0;
}

.notice-sparkle {
  font-size: 1rem;
  animation: sparkleFloat 2s ease-in-out infinite;
}

/* 시작 안내 */
.start-guide {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 0.75rem;
  border: 1px dashed rgba(79, 172, 254, 0.3);
}

.guide-text {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.typing-cursor {
  color: #4facfe;
  font-weight: 300;
  animation: blink 1s infinite;
}

/* 떠다니는 장식 */
.floating-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.decoration {
  position: absolute;
  font-size: 0.875rem;
  opacity: 0.15;
  animation: floatDecoration 8s ease-in-out infinite;
}

.decoration-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 25%;
  right: 15%;
  animation-delay: 1.6s;
}

.decoration-3 {
  bottom: 40%;
  left: 20%;
  animation-delay: 3.2s;
}

.decoration-4 {
  top: 60%;
  right: 25%;
  animation-delay: 4.8s;
}

.decoration-5 {
  bottom: 20%;
  right: 40%;
  animation-delay: 6.4s;
}

/* 애니메이션 키프레임 */
@keyframes welcomeSlideIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes patternShift {
  0%,
  100% {
    background-position:
      0% 0%,
      100% 100%,
      50% 50%;
  }
  50% {
    background-position:
      100% 100%,
      0% 0%,
      25% 75%;
  }
}

@keyframes avatarPulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
    background-position: 0% 50%;
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
    background-position: 100% 50%;
  }
}

@keyframes sparkleRotate {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(20deg);
  }
  75% {
    transform: rotate(-20deg);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes sparkleFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(180deg);
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes floatDecoration {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.1;
  }
  25% {
    transform: translate(5px, -8px) rotate(90deg);
    opacity: 0.2;
  }
  50% {
    transform: translate(-3px, -12px) rotate(180deg);
    opacity: 0.25;
  }
  75% {
    transform: translate(-8px, -5px) rotate(270deg);
    opacity: 0.15;
  }
}
</style>
