<template>
  <div class="chat-header">
    <!-- 메인 콘텐츠 -->
    <div class="header-content">
      <!-- 왼쪽 타이틀 영역 -->
      <div class="chat-title">
        <!-- 상태 표시 -->
        <div class="status-indicator">
          <div class="status-dot"></div>
        </div>

        <!-- 타이틀 콘텐츠 -->
        <div class="title-content">
          <div class="main-title">
            <span class="title-text">FinMate</span>
          </div>
          <div class="sub-title">
            <span class="sub-text">궁금한 것을 물어보세요</span>
            <div class="typing-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 오른쪽 액션 버튼들 -->
      <div class="header-actions">
        <!-- 닫기 버튼 -->
        <button class="action-btn close-btn" type="button" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 하단 세밀한 보더 라인 -->
    <div class="bottom-border"></div>
  </div>
</template>

<script setup>
defineEmits(['close']);
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
}

.chat-header {
  position: relative;
  /* overflow: hidden; */
  border-radius: 1rem 1rem 0 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.1);
}

.header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  z-index: 10;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.status-indicator {
  position: relative;
  width: 8px;
  height: 8px;
}

.status-dot {
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
  animation: gentle-pulse 3s ease-in-out infinite;
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.main-title {
  display: flex;
  align-items: center;
}

.title-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  letter-spacing: -0.01em;
}

.sub-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sub-text {
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--color-sub);
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 0.1875rem;
}

.typing-dots .dot {
  width: 3px;
  height: 3px;
  background: var(--color-light);
  border-radius: 50%;
  animation: subtle-typing 2s ease-in-out infinite;
}

.typing-dots .dot:nth-child(2) {
  animation-delay: 0.3s;
}

.typing-dots .dot:nth-child(3) {
  animation-delay: 0.6s;
}

.header-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.08);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-main);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.15);
}

.action-btn:active {
  transform: translateY(0);
}

.bottom-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(185, 187, 204, 0.3) 50%,
    transparent 100%
  );
}

/* 애니메이션 키프레임 */
@keyframes gentle-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes subtle-typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-1px);
    opacity: 1;
  }
}

/* 반응형 */
@media (max-width: 576px) {
  .header-content {
    padding: 1rem 1.25rem;
  }

  .title-text {
    font-size: 1rem;
  }

  .sub-text {
    font-size: 0.75rem;
  }
}
</style>
