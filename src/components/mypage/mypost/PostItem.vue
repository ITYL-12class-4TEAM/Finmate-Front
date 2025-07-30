<template>
  <div class="post-item" @click="$emit('view', post)">
    <!-- 게시판 뱃지 -->
    <div class="post-badge">
      <PostBadge :type="'board'" :value="post.boardType" />
    </div>

    <!-- 제목 및 미리보기 -->
    <div class="post-content">
      <div class="post-title">
        {{ truncateText(post.title, 20) }}
        <i
          v-if="post.isAnonymous"
          class="bi bi-incognito text-muted ms-1"
          title="익명"
        ></i>
      </div>
      <div class="post-preview">
        {{ truncateText(post.content, 40) }}
      </div>
    </div>

    <!-- 게시글 정보 -->
    <div class="post-meta">
      <span class="like">
        <i class="bi bi-heart-fill text-danger"></i> {{ post.likeCount }}
      </span>
      <span class="comment">
        <i class="bi bi-chat-dots text-primary"></i> {{ post.commentCount }}
      </span>
      <span class="date"></span>
      <span class="date">{{ formatDate(post.createdAt) }}</span>
    </div>
  </div>
</template>

<script setup>
import PostBadge from '../common/PostBadge.vue';

defineProps({
  post: {
    type: Object,
    required: true,
  },
});

defineEmits(['view']);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

const truncateText = (text, length) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};
</script>

<style scoped>
.post-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  background-color: white;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.post-item:hover {
  background-color: #f8f9fa;
}

.post-badge {
  align-self: flex-start;
}

.post-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.post-title {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  line-height: 1.4;
  display: flex;
  align-items: center;
}

.post-preview {
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.4;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6c757d;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.date {
  font-size: 0.75rem;
}
</style>
