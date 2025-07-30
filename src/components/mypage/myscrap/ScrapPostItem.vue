<template>
  <div class="scrap-item">
    <!-- 게시판 뱃지 -->
    <div class="scrap-badge">
      <PostBadge :type="'board'" :value="post.boardType" />
    </div>

    <!-- 제목 및 미리보기 -->
    <div class="scrap-content">
      <div class="scrap-title">
        {{ truncateText(post.title, 20) }}
        <i
          v-if="post.isAnonymous"
          class="bi bi-incognito text-muted ms-1"
          title="익명"
        ></i>
      </div>
      <div class="scrap-preview">
        {{ truncateText(post.content, 40) }}
      </div>
    </div>
    <!-- 게시글 정보 -->
    <div class="scrap-meta">
      <span class="like">
        <i class="bi bi-heart-fill text-danger"></i> {{ post.likeCount }}
      </span>
      <span class="comment">
        <i class="bi bi-chat-dots text-primary"></i> {{ post.commentCount }}
      </span>
      <span class="author">{{ post.authorName }}</span>
      <span class="date">{{ formatDate(post.postCreatedAt) }}</span>
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

defineEmits(['view-post']);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

const truncateText = (text, length) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};
</script>

<style scoped>
.scrap-item {
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

.scrap-item:hover {
  background-color: #f8f9fa;
}

.scrap-badge {
  align-self: flex-start;
}

.scrap-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.scrap-title {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  line-height: 1.4;
  display: flex;
  align-items: center;
}

.scrap-preview {
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.4;
}

.scrap-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6c757d;
}

.scrap-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.date {
  font-size: 0.75rem;
}
</style>
