<template>
  <div>
    <!-- 게시글 리스트 -->
    <div class="posts-list">
      <PostItem
        v-for="post in posts"
        :key="post.postId"
        :post="post"
        @view="$emit('view-post', $event)"
        @like="(postId) => refreshPost(postId)"
        @comment="(postId) => refreshPost(postId)"
      />
    </div>
  </div>
</template>

<script setup>
import PostItem from './PostItem.vue';

const props = defineProps({
  posts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['view-post']);
</script>

<style scoped>
.posts-list {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.posts-list:hover {
  border-color: rgba(185, 187, 204, 0.4);
  box-shadow: 0 4px 12px -2px rgba(45, 51, 107, 0.15);
}

/* 빈 상태 처리 */
.posts-list:empty::after {
  content: '게시글이 없습니다.';
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--color-sub);
  font-size: 0.95rem;
  font-weight: 500;
}

/* 로딩 상태 */
.posts-list.loading {
  opacity: 0.7;
  pointer-events: none;
}

.posts-list.loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(var(--color-light), 0.3), transparent);
  animation: shimmer 2s infinite;
  z-index: 1;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* PostItem 간격 조정 */
.posts-list :deep(.post-item:not(:last-child)) {
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
}

.posts-list :deep(.post-item) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.posts-list :deep(.post-item:hover) {
  background: rgba(45, 51, 107, 0.02);
  transform: translateY(-1px);
}
</style>
