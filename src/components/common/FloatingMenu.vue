<template>
  <div class="floating-menu" :class="{ 'chat-open': isOpen }">
    <!-- 챗봇 창 -->
    <ChatWindow v-if="isOpen" class="chat-window" @close="closeChatBot" />
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
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
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
const closeChatBot = () => {
  console.log('부모: 챗봇 닫기 이벤트 받음');
  isOpen.value = false;
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
  position: fixed;
  bottom: 130px; /* 기존 70px에서 130px로 변경하여 버튼 위에 충분한 공간 확보 */
  right: 2rem; /* 오른쪽에 여백 추가 */
  width: 600px;
  max-height: calc(
    100vh - 180px
  ); /* 최대 높이도 조정하여 화면을 벗어나지 않도록 */
  background: white;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: fadeIn 0.3s ease;
}
@media (max-width: 768px) {
  .chat-window-inner {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    padding: 0.5rem;
    box-sizing: border-box;
    max-width: 500px; /* 최대 가로 폭 제한 */
    margin: 0 auto; /* 중앙 정렬 */
  }

  .button-grid {
    grid-template-columns: repeat(
      4,
      minmax(0, 1fr)
    ); /* 칸 넓이 균일, 넘침 방지 */
    gap: 0.15rem;
    max-width: 100%;
  }
  .service-btn {
    width: 24px !important;
    height: 24px !important;
    padding: 0.1rem 0.05rem !important;
    font-size: 0.35rem !important;
    max-width: 24px !important;
    min-width: 24px !important;
    margin: 0 auto !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 3px;
    box-sizing: border-box;
  }

  .service-icon {
    font-size: clamp(0.5rem, 2vw, 0.75rem);
    margin-bottom: 0.1rem;
  }

  .member-features {
    flex-direction: column;
  }

  .chat-title,
  .chat-description {
    font-size: 0.8rem;
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
