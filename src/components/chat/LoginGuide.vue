<template>
  <div class="login-guide">
    <div class="guide-header">
      <div class="guide-icon">🔐</div>
      <div class="guide-title">
        <h4>로그인하면 추가로 이용할 수 있는 기능:</h4>
        <p class="guide-subtitle">더 많은 개인화 서비스를 경험해보세요!</p>
      </div>
    </div>

    <div class="member-features">
      <div
        v-for="feature in memberOnlyFeatures"
        :key="`feature-${feature.id}`"
        class="feature-item"
      >
        <span class="feature-icon">{{ feature.icon }}</span>
        <span class="feature-text">{{ feature.text }}</span>
        <span class="feature-badge">Premium</span>
      </div>
    </div>

    <div class="benefits-list">
      <div class="benefit-item">
        <span class="benefit-icon">✨</span>
        <span class="benefit-text">개인 맞춤형 추천</span>
      </div>
      <div class="benefit-item">
        <span class="benefit-icon">🔔</span>
        <span class="benefit-text">실시간 알림 서비스</span>
      </div>
      <div class="benefit-item">
        <span class="benefit-icon">💎</span>
        <span class="benefit-text">프리미엄 콘텐츠 접근</span>
      </div>
    </div>

    <button class="login-btn" aria-label="로그인 페이지로 이동" @click="$emit('navigate-to-login')">
      <div class="login-btn-content">
        <span class="login-btn-icon">🚪</span>
        <span class="login-btn-text">로그인하러 가기</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="login-arrow">
          <path
            d="M5 12h14M12 5l7 7-7 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="login-btn-shine"></div>
    </button>

    <div class="guide-footer">
      <p class="footer-text">
        간편한 소셜 로그인으로 <strong>3초 만에 가입</strong>하고<br />
        모든 기능을 무료로 이용해보세요! 🎉
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  memberOnlyFeatures: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['navigate-to-login']);
</script>

<style scoped>
.login-guide {
  background: linear-gradient(135deg, rgba(90, 106, 207, 0.05) 0%, rgba(154, 165, 208, 0.08) 100%);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(90, 106, 207, 0.15);
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-guide::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-main) 0%, #9c27b0 50%, #e91e63 100%);
  border-radius: 16px 16px 0 0;
}

.guide-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.guide-icon {
  font-size: 2rem;
  animation: bounceRotate 3s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes bounceRotate {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-5deg) scale(1.05);
  }
  50% {
    transform: rotate(0deg) scale(1.1);
  }
  75% {
    transform: rotate(5deg) scale(1.05);
  }
}

.guide-title h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 700;
}

.guide-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
}

.member-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(90, 106, 207, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(90, 106, 207, 0.1), transparent);
  transition: left 0.6s;
}

.feature-item:hover::before {
  left: 100%;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--color-main);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(90, 106, 207, 0.2);
}

.feature-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.feature-text {
  flex: 1;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text);
}

.feature-badge {
  background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(156, 39, 176, 0.5);
  }
  to {
    box-shadow: 0 0 15px rgba(233, 30, 99, 0.7);
  }
}

.benefits-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.benefit-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.02);
}

.benefit-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.benefit-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text);
}

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--color-main) 0%, #9c27b0 50%, #e91e63 100%);
  color: var(--color-white);
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 6px 20px rgba(90, 106, 207, 0.3);
}

.login-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.login-btn-icon {
  font-size: 1.1rem;
  animation: doorSwing 2s ease-in-out infinite;
}

@keyframes doorSwing {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

.login-btn-text {
  flex: 1;
  text-align: center;
}

.login-arrow {
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.login-btn:hover .login-arrow {
  transform: translateX(4px);
}

.login-btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
  z-index: 1;
}

.login-btn:hover .login-btn-shine {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(90, 106, 207, 0.4);
}

.login-btn:active {
  transform: translateY(-1px) scale(1.01);
}

.guide-footer {
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(90, 106, 207, 0.1);
}

.footer-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-sub);
  line-height: 1.5;
}

.footer-text strong {
  color: var(--color-main);
  font-weight: 700;
}

@media (max-width: 768px) {
  .login-guide {
    padding: 1.25rem;
  }

  .guide-header {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .guide-icon {
    font-size: 1.75rem;
  }

  .guide-title h4 {
    font-size: 0.85rem;
  }

  .guide-subtitle {
    font-size: 0.7rem;
  }

  .member-features {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .feature-item {
    padding: 0.6rem 0.8rem;
    gap: 0.5rem;
  }

  .feature-text {
    font-size: 0.75rem;
  }

  .benefits-list {
    grid-template-columns: 1fr;
    gap: 0.4rem;
    margin-bottom: 1.25rem;
  }

  .benefit-item {
    padding: 0.4rem;
  }

  .benefit-text {
    font-size: 0.7rem;
  }

  .login-btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.85rem;
  }

  .login-btn-icon {
    font-size: 1rem;
  }

  .guide-footer {
    padding: 0.6rem;
  }

  .footer-text {
    font-size: 0.7rem;
  }
}

/* 접근성 개선 */
.login-btn:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .login-guide,
  .feature-item,
  .login-btn,
  .benefit-item {
    animation: none;
    transition: none;
  }

  .guide-icon,
  .login-btn-icon,
  .feature-badge {
    animation: none;
  }

  .login-btn-shine,
  .feature-item::before {
    display: none;
  }
}

/* 고대비 모드 */
@media (prefers-contrast: high) {
  .login-guide {
    border: 2px solid var(--color-main);
  }

  .feature-item {
    border: 2px solid var(--color-light);
  }

  .login-btn {
    border: 2px solid var(--color-white);
  }
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .login-guide {
    background: linear-gradient(135deg, rgba(90, 106, 207, 0.1) 0%, rgba(154, 165, 208, 0.15) 100%);
  }

  .feature-item,
  .benefit-item,
  .guide-footer {
    background: rgba(255, 255, 255, 0.1);
  }

  .guide-title h4 {
    color: rgba(255, 255, 255, 0.9);
  }

  .guide-subtitle,
  .feature-text,
  .benefit-text,
  .footer-text {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
