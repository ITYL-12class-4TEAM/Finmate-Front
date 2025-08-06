<template>
  <div class="input-area">
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
    <div class="input-container">
      <input
        ref="messageInput"
        :value="inputMessage"
        placeholder="메시지를 입력하세요..."
        :disabled="isTyping"
        class="message-input"
        @input="$emit('update:inputMessage', $event.target.value)"
        @keypress.enter="$emit('send-message')"
      />
      <button
        :disabled="!inputMessage.trim() || isTyping"
        class="send-btn"
        type="button"
        @click="$emit('send-message')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
.input-area {
  position: relative; /* 상대 기준 */
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
  background: var(--color-white);
}

.input-container {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  background: var(--color-white);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  z-index: 50; /* 메뉴보단 아래 */
  height: 60px; /* 메뉴 띄울 때 bottom 기준 */
}
.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-light);
  border-radius: 25px;
  outline: none;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: var(--color-main);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 44px;
  height: 44px;
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: var(--color-sub);
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.service-menu-overlay {
  width: 100%;
  max-width: 480px; /* 필요에 따라 조절 */
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  max-height: 250px;
  overflow-y: auto;
}
.service-toggle-wrapper {
  position: sticky;
  bottom: 60px; /* 입력창 높이만큼 띄우기 */
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center; /* 가운데 정렬 */
  z-index: 110; /* 입력창 위, 서비스 메뉴보다 위 */
  gap: 0.5rem;
}
</style>
