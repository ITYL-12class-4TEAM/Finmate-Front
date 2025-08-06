<template>
  <div :class="['message', message.type]">
    <div class="message-content">
      <div v-if="message.type === 'bot'" class="bot-avatar">
        <img :src="botAvatarImage" alt="해결사" />
      </div>
      <div class="message-bubble">
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
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import botAvatarImage from '@/assets/images/해결사.png';
import TextContent from './contents/TextContent.vue';
import SurveyContent from './contents/SurveyContent.vue';
import PostsContent from './contents/PostsContent.vue';
import CommentsContent from './contents/CommentsContent.vue';
import WmtiContent from './contents/WmtiContent.vue';
import FinanceContent from './contents/FinanceContent.vue';
import RecentProductsContent from './contents/RecentProductsContent.vue';
import WishlistProductsContent from './contents/WishlistProductsContent.vue';

defineProps({
  message: Object,
});

defineEmits(['navigate-to-post', 'navigate-to-more', 'navigate-to-survey']);

const getContentComponent = (contentType) => {
  console.log('🔍 MessageItem contentType:', contentType); // 디버깅용 로그 추가

  const components = {
    text: TextContent,
    survey: SurveyContent,
    posts: PostsContent,
    comments: CommentsContent,
    wmti: WmtiContent,
    finance: FinanceContent,
    // 📝 수정: ChatWindow.vue에서 전달하는 contentType과 일치하도록 변경
    recent: RecentProductsContent,
    wishlist: WishlistProductsContent,
    // 📝 추가: 기존 이름도 호환성을 위해 유지
    recentProduct: RecentProductsContent,
    wishlistProduct: WishlistProductsContent,
  };

  const component = components[contentType] || TextContent;
  console.log('🎯 선택된 컴포넌트:', component.name || 'TextContent'); // 디버깅용 로그 추가

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
.message {
  display: flex;
  flex-direction: column;
  animation: fadeUp 0.3s ease-in-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(0.625rem); /* 10px */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  max-width: 85%;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.bot-avatar {
  width: 2rem;
  height: 2rem;
  background: var(--color-white);
  border: 0.09375rem solid #d3d3d3; /* 1.5px */
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05); /* 2px 8px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.bot-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-bubble {
  background: var(--color-bg-light);
  padding: 0.75rem 1rem;
  border-radius: 1.25rem 1.25rem 1.25rem 0; /* 20px */
  position: relative;
  font-size: 0.7rem;
  letter-spacing: 0.01rem;
  line-height: 1.6;
  margin-bottom: 0;
}

.message-bubble p {
  margin-bottom: 0;
}

.message.user .message-bubble {
  background: var(--color-main);
  color: var(--color-white);
  border-radius: 1.25rem 1.25rem 0 1.25rem; /* 20px */
}

.timestamp {
  margin-top: 0.25rem;
  font-size: 0.5rem;
  opacity: 0.6;
  display: block;
}
</style>
