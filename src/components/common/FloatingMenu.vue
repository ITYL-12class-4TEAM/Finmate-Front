<template>
  <div class="floating-menu">
    <!-- 챗봇 창 -->
    <ChatWindow v-if="isOpen" class="chat-window" />

    <!-- 플로팅 버튼 -->
    <button class="chat-button" @click="toggleChat">
      <span v-if="!isOpen">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
      </span>
      <span v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import ChatWindow from './ChatWindow.vue';

const isOpen = ref(false);
const toggleChat = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.floating-menu {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

/* 플로팅 챗봇 버튼 스타일 */
.chat-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background-color: var(--color-main);
  color: white;
  box-shadow: 0 4px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.chat-button svg {
  width: 24px;
}

.chat-button:hover {
  background-color: var(--color-sub);
}

.chat-window {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 320px;
  height: 400px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: fadeIn 0.3s ease;
}

@media (max-width: 768px) {
  .chat-window {
    width: 90vw;
    right: -1rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
