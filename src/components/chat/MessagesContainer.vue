<template>
  <div ref="messagesContainer" class="messages-container">
    <!-- 떠다니는 장식 요소들 -->
    <div class="floating-decorations">
      <div class="decoration decoration-1">💫</div>
      <div class="decoration decoration-2">✨</div>
      <div class="decoration decoration-3">🌟</div>
      <div class="decoration decoration-4">💙</div>
    </div>

    <!-- 메시지 콘텐츠 래퍼 -->
    <div class="messages-content">
      <WelcomeMessage
        v-if="messages.length === 0"
        :is-authenticated="isAuthenticated"
        class="welcome-wrapper"
      />

      <MessageItem
        v-for="(message, index) in messages"
        :key="`message-${message.id}`"
        :message="message"
        :class="['message-wrapper', { 'animate-in': true }]"
        :style="{ '--animation-delay': `${index * 0.1}s` }"
        @navigate-to-post="$emit('navigate-to-post', $event)"
        @navigate-to-more="$emit('navigate-to-more', $event)"
        @navigate-to-survey="$emit('navigate-to-survey')"
      />

      <TypingIndicator v-if="isTyping" class="typing-wrapper" />
    </div>

    <!-- 스크롤 인디케이터 -->
    <div class="scroll-indicator" :class="{ visible: showScrollIndicator }">
      <div class="scroll-track">
        <div
          class="scroll-thumb"
          :style="{ height: scrollThumbHeight, top: scrollThumbPosition }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import MessageItem from './MessageItem.vue';
import WelcomeMessage from './WelcomeMessage.vue';
import TypingIndicator from './TypingIndicator.vue';

const props = defineProps({
  messages: Array,
  isTyping: Boolean,
  isAuthenticated: Boolean,
});

defineEmits(['navigate-to-post', 'navigate-to-more', 'navigate-to-survey']);

const messagesContainer = ref(null);
const showScrollIndicator = ref(false);
const scrollThumbHeight = ref('20%');
const scrollThumbPosition = ref('0%');

// 스크롤 인디케이터 업데이트
const updateScrollIndicator = () => {
  if (!messagesContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  const scrollPercent = scrollTop / (scrollHeight - clientHeight);
  const thumbHeight = Math.max((clientHeight / scrollHeight) * 100, 10);

  showScrollIndicator.value = scrollHeight > clientHeight;
  scrollThumbHeight.value = `${thumbHeight}%`;
  scrollThumbPosition.value = `${scrollPercent * (100 - thumbHeight)}%`;
};

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', updateScrollIndicator);
    updateScrollIndicator();
  }
});

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', updateScrollIndicator);
  }
});

defineExpose({
  messagesContainer,
});
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
}

.messages-container {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: rgba(238, 238, 243, 0.3);
  backdrop-filter: blur(8px) saturate(110%);
}

.floating-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.decoration {
  position: absolute;
  font-size: 0.75rem;
  opacity: 0.15;
  animation: gentle-float 8s ease-in-out infinite;
}

.decoration-1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 40%;
  right: 15%;
  animation-delay: 2s;
}

.decoration-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.decoration-4 {
  top: 70%;
  right: 25%;
  animation-delay: 6s;
}

.messages-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  min-height: 100%;
  z-index: 5;
}

.welcome-wrapper {
  animation: fade-slide-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.message-wrapper {
  animation: message-slide-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--animation-delay, 0s);
}

.typing-wrapper {
  animation: typing-bounce-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.scroll-indicator {
  position: absolute;
  top: 1rem;
  right: 0.5rem;
  bottom: 1rem;
  width: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.scroll-indicator.visible {
  opacity: 1;
}

.scroll-track {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(185, 187, 204, 0.2);
  border-radius: 2px;
  backdrop-filter: blur(4px);
}

.scroll-thumb {
  position: absolute;
  left: 0;
  width: 100%;
  background: var(--color-main);
  border-radius: 2px;
  transition: all 0.2s ease;
  min-height: 20px;
  opacity: 0.6;
}

/* 스크롤바 스타일링 */
.messages-container::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

/* 호버 시 스크롤 인디케이터 표시 */
.messages-container:hover .scroll-indicator {
  opacity: 1;
}

/* 애니메이션 키프레임 */
@keyframes gentle-float {
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

@keyframes fade-slide-in {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes message-slide-in {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes typing-bounce-in {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.9);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-2px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .messages-content {
    padding: 1rem;
    gap: 1rem;
  }

  .floating-decorations {
    display: none; /* 모바일에서는 장식 요소 숨김 */
  }

  .scroll-indicator {
    right: 0.25rem;
  }
}

/* 다크모드 지원 */
@media (prefers-color-scheme: dark) {
  .messages-container {
    background: rgba(45, 51, 107, 0.15);
  }

  .scroll-track {
    background: rgba(255, 255, 255, 0.08);
  }

  .scroll-thumb {
    background: var(--color-light);
    opacity: 0.7;
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .decoration {
    animation: none;
  }

  .message-wrapper,
  .welcome-wrapper,
  .typing-wrapper {
    animation-duration: 0.1s;
  }
}

/* 스크롤 성능 최적화 */
.messages-container {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  will-change: scroll-position;
}

/* 메시지 간격 조정 */
.messages-content > * + * {
  margin-top: 0;
}

/* 글로우 효과가 있는 커스텀 스크롤 인디케이터 */
.scroll-indicator:hover .scroll-thumb {
  background: var(--color-sub);
  opacity: 0.8;
  box-shadow: 0 0 8px rgba(45, 51, 107, 0.3);
}
</style>
