<template>
  <div :class="['message', message.type]" :style="{ '--message-delay': messageDelay }">
    <div class="message-content">
      <!-- 봇 아바타 -->
      <div v-if="message.type === 'bot'" class="bot-avatar">
        <div class="avatar-ring"></div>
        <div class="avatar-inner">
          <img :src="botAvatarImage" alt="해결사" />
          <div class="avatar-status"></div>
        </div>
      </div>

      <!-- 메시지 버블 -->
      <div class="message-bubble">
        <!-- 메시지 콘텐츠 -->
        <div class="message-inner">
          <component
            :is="getContentComponent(message.contentType)"
            :message="message"
            :data="message.data"
            :title="message.title"
            :moreUrl="message.moreUrl"
            @navigate-to-post="$emit('navigate-to-post', $event)"
            @navigate-to-more="$emit('navigate-to-more', $event)"
            @navigate-to-survey="$emit('navigate-to-survey')"
          />
        </div>

        <!-- 타임스탬프 -->
        <div class="timestamp-wrapper">
          <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          <div v-if="message.type === 'user'" class="read-status">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path
                d="M1 3.5L4 6.5L11 1"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import botAvatarImage from '@/assets/images/해결사.png';
import TextContent from './contents/TextContent.vue';
import SurveyContent from './contents/SurveyContent.vue';
import PostsContent from './contents/PostsContent.vue';
import CommentsContent from './contents/CommentsContent.vue';
import WmtiContent from './contents/WmtiContent.vue';
import FinanceContent from './contents/FinanceContent.vue';
import RecentProductsContent from './contents/RecentProductsContent.vue';
import WishlistProductsContent from './contents/WishlistProductsContent.vue';

const props = defineProps({
  message: Object,
});

defineEmits(['navigate-to-post', 'navigate-to-more', 'navigate-to-survey']);

const isLiked = ref(false);
const messageDelay = computed(() => `${Math.random() * 0.3}s`);

const toggleLike = () => {
  isLiked.value = !isLiked.value;
};

const getContentComponent = (contentType) => {
  console.log('🔍 MessageItem contentType:', contentType);

  const components = {
    text: TextContent,
    survey: SurveyContent,
    posts: PostsContent,
    comments: CommentsContent,
    wmti: WmtiContent,
    finance: FinanceContent,
    recent: RecentProductsContent,
    wishlist: WishlistProductsContent,
    recentProduct: RecentProductsContent,
    wishlistProduct: WishlistProductsContent,
  };

  const component = components[contentType] || TextContent;
  console.log('🎯 선택된 컴포넌트:', component.name || 'TextContent');

  return component;
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
}

.message {
  display: flex;
  flex-direction: column;
  animation: messageSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--message-delay, 0s);
}

.message.user {
  align-items: flex-end;
}

.message.bot {
  align-items: flex-start;
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 80%;
  position: relative;
  font-size: 0.68rem;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

/* 봇 아바타 스타일링 */
.bot-avatar {
  position: relative;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
}

.avatar-ring {
  position: absolute;
  top: -0.25rem;
  left: -0.25rem;
  right: -0.25rem;
  bottom: -0.25rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(0.5rem);
  -webkit-backdrop-filter: blur(0.5rem);
  z-index: 0;
  animation: avatarPulse 3s ease-in-out infinite;
  box-shadow: 0 0 0.5rem rgba(45, 51, 107, 0.2);
}

.avatar-inner {
  position: relative;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  padding: 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.15);
}

.avatar-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-status {
  position: absolute;
  bottom: 0.125rem;
  right: 0.125rem;
  width: 0.5rem;
  height: 0.5rem;
  background: #00d084;
  border: 0.125rem solid white;
  border-radius: 50%;
  box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.2);
}

/* 메시지 버블 스타일링 */
.message-bubble {
  position: relative;
  max-width: 100%;
  min-width: 7.5rem;
  border-radius: 1.25rem 1.25rem 1.25rem 0.3125rem;
  overflow: hidden;
  backdrop-filter: blur(0.75rem) saturate(120%);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  border: 0.0625rem solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0.25rem 1.25rem rgba(45, 51, 107, 0.08);
}

.message.user .message-bubble {
  border-radius: 1.25rem 1.25rem 0.3125rem 1.25rem;
  background: var(--color-main);
  border: 0.0625rem solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0.25rem 1.25rem rgba(45, 51, 107, 0.25);
}

.message-inner {
  padding: 0.5rem 0.625rem;
  position: relative;
  z-index: 1;
}
.message-inner p {
  margin: 0;
}
.message.user .message-inner {
  color: white;
}

/* 타임스탬프 */
.timestamp-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem;
  padding: 0rem 0.75rem 0.375rem;
  position: relative;
  z-index: 1;
}

.timestamp {
  font-size: 0.625rem;
  font-weight: 500;
  opacity: 0.6;
  letter-spacing: 0.01em;
  color: var(--color-sub);
}

.message.user .timestamp {
  color: rgba(255, 255, 255, 0.8);
}

.read-status {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
}

.reaction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-sub);
}

.reaction-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.15);
}

.reaction-btn.active {
  background: rgba(255, 48, 64, 0.1);
  color: #ff3040;
  border-color: rgba(255, 48, 64, 0.2);
  animation: likeHeartbeat 0.4s ease-in-out;
}

/* 애니메이션 키프레임 */
@keyframes messageSlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes avatarPulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes likeHeartbeat {
  0% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.3);
  }
  30% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.15);
  }
  60% {
    transform: scale(1);
  }
}

/* 호버 효과 */
.message.bot .message-bubble:hover {
  transform: translateY(-0.0625rem);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0.375rem 1.5625rem rgba(45, 51, 107, 0.12);
}

.message.user .message-bubble:hover {
  transform: translateY(-0.0625rem);
  background: var(--color-sub);
  box-shadow: 0 0.375rem 1.5625rem rgba(45, 51, 107, 0.3);
}
</style>
