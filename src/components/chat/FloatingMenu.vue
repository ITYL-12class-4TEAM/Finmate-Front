<template>
  <div
    v-show="shouldShowChatbot"
    ref="floatingMenu"
    class="floating-menu"
    :class="{ 'chat-open': isOpen }"
  >
    <!-- 챗봇 창 -->
    <ChatWindow v-if="isOpen" ref="chatWindow" class="chat-window" @close="closeChatBot" />
    <!-- 플로팅 버튼 -->
    <button v-show="!isOpen" class="chat-button" @click.stop="toggleChat">
      <span v-if="!isOpen">
        <i class="fas fa-comment-dots"></i>
      </span>
      <span v-else>
        <i class="fas fa-times"></i>
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useRoute } from 'vue-router';
import ChatWindow from './ChatWindow.vue';

const route = useRoute();
const isOpen = ref(false);
const floatingMenu = ref(null);
const chatWindow = ref(null);

// 챗봇을 숨길 페이지들 정의
const hiddenRoutes = ['CommunityDetail']; // 필요에 따라 다른 route name도 추가 가능

// 현재 페이지에서 챗봇을 보여줄지 결정
const shouldShowChatbot = computed(() => {
  return !hiddenRoutes.includes(route.name);
});

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
  bottom: 1.25rem; /* 20px / 16 */
  right: 1.25rem; /* 20px / 16 */
  z-index: 1000;
}

/* 플로팅 챗봇 버튼 스타일 */
.chat-button {
  width: 3.5rem; /* 56px / 16 */
  height: 3.5rem;
  border-radius: 50%;
  border: none;
  background-color: var(--color-main);
  color: var(--color-white);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15); /* 4px 12px / 16 */
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-button i {
  font-size: 1.25rem; /* 20px / 16 */
  transition: transform 0.3s ease;
}

.chat-button:hover {
  background-color: var(--color-sub);
  transform: scale(1.05);
  box-shadow: 0 0.375rem 1rem rgba(0, 0, 0, 0.2); /* 6px 16px / 16 */
}

.chat-button:hover i {
  transform: scale(1.1);
}

.chat-window {
  position: fixed;
  bottom: 1.25rem; /* 20px / 16 */
  right: 1.25rem; /* 20px / 16 */
  width: min(21.875rem, 85vw); /* 350px / 16, 85vw */
  height: auto;
  max-height: calc(100vh - 4rem); /* 64px / 16 */
  min-height: 32rem; /* 512px / 16 */
  background: var(--color-white);
  border-radius: 1rem; /* 16px / 16 */
  box-shadow:
    0 0.625rem 2rem rgba(0, 0, 0, 0.15),
    /* 10px 32px / 16 */ 0 0.25rem 1rem rgba(0, 0, 0, 0.1); /* 4px 16px / 16 */
  overflow: hidden;
  animation: slideUp 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

/* 태블릿 사이즈 */
@media (max-width: 48rem) {
  /* 768px / 16 */
  .floating-menu {
    bottom: 1rem; /* 16px / 16 */
    right: 1rem; /* 16px / 16 */
  }

  .chat-window {
    bottom: 1rem; /* 16px / 16 */
    right: 1rem; /* 16px / 16 */
    width: min(20rem, 80vw); /* 320px / 16, 80vw */
    min-height: 30rem; /* 480px / 16 */
  }
}

/* 모바일 사이즈 */
@media (max-width: 26.875rem) {
  /* 430px / 16 */
  .floating-menu {
    bottom: 0.75rem; /* 12px / 16 */
    right: 0.75rem; /* 12px / 16 */
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
    min-height: 100vh;
    animation: slideUpMobile 0.3s ease;
  }

  .chat-button {
    width: 3rem; /* 48px / 16 */
    height: 3rem;
  }

  .chat-button i {
    font-size: 1.125rem; /* 18px / 16 */
  }
}

/* 매우 작은 모바일 */
@media (max-width: 23.4375rem) {
  /* 375px / 16 */
  .floating-menu {
    bottom: 0.5rem; /* 8px / 16 */
    right: 0.5rem; /* 8px / 16 */
  }

  .chat-button {
    width: 2.75rem; /* 44px / 16 */
    height: 2.75rem;
  }

  .chat-button i {
    font-size: 1rem; /* 16px / 16 */
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(1.25rem) scale(0.95); /* 20px / 16 */
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
  background-color: var(--color-light);
  transform: rotate(90deg) scale(1.05);
}
</style>
