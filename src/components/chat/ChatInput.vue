<template>
  <div class="input-area">
    <!-- 서비스 메뉴 토글 -->
    <div class="service-toggle-wrapper">
      <ServiceMenuToggle
        v-if="messages.length > 0"
        :show-service-menu="showServiceMenu"
        @toggle="$emit('toggle-service-menu')"
      />
      <ServiceButtons
        v-if="showServiceMenu && messages.length > 0"
        :available-services="availableServices"
        :member-only-features="memberOnlyFeatures"
        :is-authenticated="isAuthenticated"
        class="service-menu-overlay"
        @service-action="$emit('service-action', $event)"
        @navigate-to-login="$emit('navigate-to-login')"
      />
    </div>

    <!-- 메인 입력 컨테이너 -->
    <div class="input-container">
      <!-- 입력 영역 -->
      <div class="input-wrapper">
        <!-- 실제 입력 필드 -->
        <input
          ref="messageInput"
          :value="inputMessage"
          placeholder="메시지를 입력하세요..."
          :disabled="isTyping"
          class="message-input"
          @input="$emit('update:inputMessage', $event.target.value)"
          @keypress.enter="$emit('send-message')"
        />

        <!-- 전송 버튼 -->
        <button
          :disabled="!inputMessage.trim() || isTyping"
          class="send-btn"
          type="button"
          @click="$emit('send-message')"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            class="send-icon"
            :class="{ spinning: isTyping }"
          >
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ServiceMenuToggle from './ServiceMenuToggle.vue';
import ServiceButtons from './ServiceButtons.vue';

defineProps({
  messages: Array,
  inputMessage: String,
  isTyping: Boolean,
  showServiceMenu: Boolean,
  availableServices: Array,
  memberOnlyFeatures: Array,
  isAuthenticated: Boolean,
});

defineEmits([
  'update:inputMessage',
  'send-message',
  'toggle-service-menu',
  'service-action',
  'navigate-to-login',
]);
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
}

.input-area {
  position: relative;
  padding: 1rem;
  background: rgba(238, 238, 243, 0.5);
  backdrop-filter: blur(12px) saturate(120%);
  border-top: 1px solid rgba(185, 187, 204, 0.3);
}

.input-container {
  position: relative;
  z-index: 10;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.08);
  transition: all 0.2s ease;
}

.input-wrapper:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 6px 25px rgba(45, 51, 107, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
}

.input-wrapper:focus-within {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow:
    0 6px 25px rgba(45, 51, 107, 0.15),
    0 0 0 3px rgba(45, 51, 107, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-main);
  line-height: 1.5;
}

.message-input::placeholder {
  color: var(--color-light);
  font-weight: 400;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  position: relative;
  width: 2.75rem;
  height: 2.75rem;
  background: var(--color-main);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.2);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  background: var(--color-sub);
  box-shadow: 0 6px 25px rgba(45, 51, 107, 0.3);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  background: var(--color-light);
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.1);
}

.send-icon {
  transition: transform 0.2s ease;
}

.send-icon.spinning {
  animation: spin 1s linear infinite;
}

.send-btn:hover:not(:disabled) .send-icon {
  transform: translateX(1px);
}

.service-menu-overlay {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 1rem;
  box-shadow: 0 8px 30px rgba(45, 51, 107, 0.12);
  max-height: 20rem;
  overflow-y: auto;
  padding: 0.75rem;
}

.service-toggle-wrapper {
  position: sticky;
  bottom: 5rem;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 110;
  gap: 0.75rem;
}

/* 애니메이션 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .input-area {
    padding: 0.75rem;
  }

  .input-wrapper {
    padding: 0.625rem 0.875rem;
  }

  .send-btn {
    width: 2.5rem;
    height: 2.5rem;
  }

  .message-input {
    font-size: 0.9rem;
  }
}

/* 다크모드 */
@media (prefers-color-scheme: dark) {
  .input-area {
    background: rgba(45, 51, 107, 0.2);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .input-wrapper {
    background: rgba(45, 51, 107, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .input-wrapper:hover {
    background: rgba(45, 51, 107, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .input-wrapper:focus-within {
    background: rgba(45, 51, 107, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow:
      0 6px 25px rgba(45, 51, 107, 0.2),
      0 0 0 3px rgba(45, 51, 107, 0.2);
  }

  .message-input {
    color: #f9fafb;
  }

  .message-input::placeholder {
    color: var(--color-light);
  }

  .service-menu-overlay {
    background: rgba(45, 51, 107, 0.2);
    border-color: rgba(255, 255, 255, 0.2);
  }
}
</style>
