<template>
  <div class="like-item" @click="$emit('view', post)">
    <!-- 게시판 뱃지 -->
    <div class="like-badge">
      <PostBadge :type="'board'" :value="post.boardType" />
    </div>

    <!-- 제목 및 미리보기 -->
    <div class="like-content">
      <div class="like-title-wrapper">
        <div class="like-title">
          {{ truncateText(post.title, 20) }}
        </div>
        <div class="like-preview">
          {{ truncateText(post.content, 40) }}
        </div>
      </div>

      <!-- 게시글 정보 -->
      <div class="like-meta">
        <div class="meta-left">
          <span class="like">
            <i class="fa-solid fa-heart"></i> {{ post.likeCount }}
          </span>
          <span class="comment">
            <i class="fa-solid fa-message"></i> {{ post.commentCount }}
          </span>
          <span class="author">{{ post.authorName }}</span>
        </div>
        <span class="date">{{ formatDate(post.likeCreatedAt) }}</span>
      </div>
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

defineEmits(['view', 'view-comment']);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

const truncateText = (text, length) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};
</script>

<style scoped>
.like-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    rgba(248, 249, 252, 0.5) 100%
  );
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.like-item:hover {
  background: linear-gradient(
    135deg,
    rgba(232, 67, 147, 0.02) 0%,
    rgba(248, 249, 252, 0.8) 100%
  );
  transform: translateY(-1px);
}

.like-item:active {
  transform: translateY(0);
}

.like-badge {
  align-self: flex-start;
}

.like-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.like-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.like-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
}

.like-item:hover .like-title {
  color: #1e2347;
}

.like-preview {
  font-size: 0.875rem;
  color: var(--color-sub);
  line-height: 1.5;
  opacity: 0.9;
}

.like-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-light);
  margin-top: 0.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meta-left span {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s ease;
}

.author {
  display: flex;
  align-items: center;
  color: var(--color-sub);
  font-weight: 500;
  font-size: 0.8rem;
}

.like {
  color: #e84393;
  font-weight: 600;
}

.like:hover {
  color: #c0392b;
  transform: scale(1.05);
}

.comment {
  color: #3498db;
}

.comment:hover {
  color: #2980b9;
  transform: scale(1.05);
}

.like i,
.comment i {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.date {
  font-size: 0.75rem;
  color: var(--color-light);
  opacity: 0.8;
  font-weight: 500;
}

/* 좋아요 특별 애니메이션 */
.like-item:hover .like i {
  animation: lovebeat 1.2s ease-in-out infinite;
  color: #e84393;
}

.like-item:hover .comment i {
  transform: rotate(-10deg);
}

@keyframes heartbeat {
  0%,
  50%,
  100% {
    transform: scale(1);
  }
  25%,
  75% {
    transform: scale(1.1);
  }
}

/* 포커스 상태 */
.like-item:focus {
  outline: 2px solid rgba(232, 67, 147, 0.3);
  outline-offset: 2px;
}

/* 선택 방지 */
.like-item {
  user-select: none;
}

/* 미묘한 구분선 효과 */
.like-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1.25rem;
  right: 1.25rem;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(185, 187, 204, 0.3) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.like-item:not(:last-child)::after {
  opacity: 1;
}

/* 하트 글로우 효과 */
.like-item:hover::before {
  box-shadow: 0 0 12px rgba(232, 67, 147, 0.5);
  opacity: 1;
}

/* 좋아요 아이콘 특별 스타일 */
.like-item .like i {
  filter: drop-shadow(0 0 2px rgba(232, 67, 147, 0.3));
}
</style>
