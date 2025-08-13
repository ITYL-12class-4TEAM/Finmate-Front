<template>
  <div class="chat-header">
    <!-- 메인 콘텐츠 -->
    <div class="header-content">
      <!-- 왼쪽 타이틀 영역 -->
      <div class="chat-title">
        <!-- 상태 표시 -->
        <div class="status-indicator">
          <div
            class="status-dot"
            :class="{
              'status-active': isSessionActive,
              'status-expired': !isSessionActive,
            }"
          ></div>
        </div>

        <!-- 타이틀 콘텐츠 -->
        <div class="title-content">
          <div class="main-title">
            <span class="title-text">FinMate</span>
          </div>
          <div class="sub-title">
            <span v-if="isSessionActive" class="sub-text">
              {{ formatTimeRemaining(sessionTimeRemaining) }} 남음
            </span>
            <span v-else class="sub-text text-warning"> 세션 만료됨 </span>
            <div v-if="isSessionActive" class="typing-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 오른쪽 액션 버튼들 -->
      <div class="header-actions">
        <!-- 대화 초기화 버튼 -->
        <button
          class="action-btn clear-btn"
          type="button"
          title="대화 내용 삭제"
          :disabled="!isSessionActive"
          @click="$emit('clear-chat')"
        >
          <i class="fas fa-trash-alt"></i>
        </button>

        <!-- 닫기 버튼 -->
        <button class="action-btn close-btn" type="button" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- 세션 시간 프로그레스 바 -->
    <div v-if="isSessionActive" class="session-progress">
      <div
        class="progress-bar"
        :style="{ width: `${sessionProgress}%` }"
        :class="{
          'progress-warning': sessionProgress <= 25,
          'progress-danger': sessionProgress <= 10,
        }"
      ></div>
    </div>

    <!-- 하단 세밀한 보더 라인 -->
    <div class="bottom-border"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  sessionTimeRemaining: {
    type: Number,
    default: 0,
  },
  isSessionActive: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close', 'clear-chat']);

// 세션 진행률 계산 (1시간 기준)
const sessionProgress = computed(() => {
  const totalTime = 60 * 60 * 1000; // 1시간
  const progress = (props.sessionTimeRemaining / totalTime) * 100;
  return Math.max(0, Math.min(100, progress));
});

// 남은 시간 포맷팅
const formatTimeRemaining = (milliseconds) => {
  if (milliseconds <= 0) return '0분';

  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  } else {
    return `${minutes}분`;
  }
};
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
  padding: 1.25rem 1.5rem 1rem;
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
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-active {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
  animation: gentle-pulse 3s ease-in-out infinite;
}

.status-expired {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
  animation: warning-pulse 1s ease-in-out infinite;
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

.text-warning {
  color: #f59e0b !important;
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
  gap: 0.5rem;
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

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-main);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.15);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn:hover:not(:disabled) {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.close-btn:hover {
  color: var(--color-main);
}

/* 세션 프로그레스 바 */
.session-progress {
  position: relative;
  height: 3px;
  background: rgba(185, 187, 204, 0.2);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: all 0.3s ease;
}

.progress-warning {
  background: linear-gradient(90deg, #f59e0b, #d97706) !important;
}

.progress-danger {
  background: linear-gradient(90deg, #ef4444, #dc2626) !important;
  animation: pulse-progress 1s ease-in-out infinite;
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

@keyframes warning-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
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

@keyframes pulse-progress {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Font Awesome 아이콘 */
.fas {
  font-size: 14px;
}

/* 반응형 */
@media (max-width: 576px) {
  .header-content {
    padding: 1rem 1.25rem 0.75rem;
  }

  .title-text {
    font-size: 1rem;
  }

  .sub-text {
    font-size: 0.75rem;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }

  .fas {
    font-size: 12px;
  }
}
</style>
