<template>
  <div ref="floatingMenu" class="floating-menu" :class="{ 'chat-open': isOpen }">
    <!-- 챗봇 창 -->
    <ChatWindow v-if="isOpen" ref="chatWindow" class="chat-window" @close="closeChatBot" />
    <!-- 플로팅 버튼 -->
    <button v-show="!isOpen" class="chat-button" @click.stop="toggleChat">
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
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import ChatWindow from './ChatWindow.vue';

const isOpen = ref(false);
const floatingMenu = ref(null);
const chatWindow = ref(null);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const closeChatBot = () => {
  isOpen.value = false;
};

function onClickOutside(event) {
  // 챗봇이 열려있을 때만 외부 클릭 감지
  if (!isOpen.value) return;

  const floatingMenuElement = floatingMenu.value;
  const chatWindowElement = chatWindow.value?.$el || chatWindow.value;

  if (!floatingMenuElement) return;

  // floating-menu 내부 클릭인지 확인
  const isInsideFloatingMenu = floatingMenuElement.contains(event.target);

  // chat-window 내부 클릭인지 확인
  const isInsideChatWindow = chatWindowElement && chatWindowElement.contains(event.target);

  // 둘 다 아니면 챗봇 닫기
  if (!isInsideFloatingMenu && !isInsideChatWindow) {
    isOpen.value = false;
  }
}

onMounted(() => {
  // 약간의 지연을 두어 초기 렌더링 완료 후 이벤트 리스너 등록
  nextTick(() => {
    setTimeout(() => {
      document.addEventListener('click', onClickOutside, true);
    }, 100);
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside, true);
});
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
  width: 3.5rem; /* 56px */
  height: 3.5rem;
  border-radius: 50%;
  border: none;
  background-color: var(--color-main);
  color: white;
  box-shadow: 0 0.25rem 0.3125rem rgba(0, 0, 0, 0.2); /* 4px 5px */
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 1001;
}

.chat-button svg {
  width: 1.5rem; /* 24px */
  height: 1.5rem;
  transition: transform 0.3s ease;
}

.chat-button:hover {
  background-color: var(--color-sub);
  transform: scale(1.05);
}

.chat-button:hover svg {
  transform: scale(1.1);
}

.chat-window {
  position: fixed;
  bottom: 6rem; /* 버튼 위에 위치 */
  right: 2rem;
  width: min(24rem, 90vw); /* 최대 폭 제한 */
  height: auto;
  max-height: calc(100dvh - 8rem); /* 디바이스 높이에 맞춰 조정 */
  background: white;
  border-radius: 1.25rem;
  box-shadow:
    0 0.375rem 1.25rem rgba(0, 0, 0, 0.15),
    0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  z-index: 999;

  display: flex;
  flex-direction: column;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .floating-menu {
    bottom: 1rem;
    right: 1rem;
  }

  .chat-window {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-width: none;
    max-height: none;
    animation: slideUpMobile 0.3s ease;
  }

  .chat-button {
    width: 3.125rem; /* 50px */
    height: 3.125rem;
  }

  .chat-button svg {
    width: 1.25rem; /* 20px */
    height: 1.25rem;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(1rem) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slideUpMobile {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 챗봇이 열렸을 때 버튼 스타일 */
.chat-open .chat-button {
  background-color: var(--color-sub);
  transform: rotate(90deg);
}

.chat-open .chat-button:hover {
  background-color: #dc3545;
}
</style>
