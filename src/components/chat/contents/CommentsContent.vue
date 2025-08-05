<template>
  <div class="comments-content">
    <p class="content-title">{{ message.title }}</p>
    <div class="comments-list">
      <div
        v-for="comment in displayComments"
        :key="`comment-${comment.id || comment.commentId}`"
        class="comment-item"
        :aria-label="`댓글: ${comment.content || comment.text}`"
        @click="$emit('navigate-to-post', comment.postId)"
      >
        <div class="comment-info">
          <h4 class="comment-title">
            {{ truncateText(comment.content || comment.text, 35) }}
          </h4>
          <p class="comment-meta">
            <span class="post-ref">게시글 #{{ comment.postId }}</span>
            <span class="separator">·</span>
            <span class="date">
              {{ formatDate(comment.createdAt || comment.created_at || comment.date) }}
            </span>
            <span
              v-if="comment.likeCount || comment.like_count"
              class="like-count"
              :title="`좋아요 ${comment.likeCount || comment.like_count}개`"
            >
              <i class="bi bi-heart-fill"></i>
              {{ comment.likeCount || comment.like_count }}
            </span>
            <span v-if="comment.parentComment" class="reply-badge" title="답글"> ↳ 답글 </span>
          </p>
        </div>
        <div class="comment-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
    <button
      v-if="hasMoreComments"
      class="more-btn"
      :aria-label="`더보기 (${remainingCount}개)`"
      @click="$emit('navigate-to-more', message.moreUrl)"
    >
      더보기 ({{ remainingCount }}개)
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

defineEmits(['navigate-to-post', 'navigate-to-more']);

const displayComments = computed(() => {
  return props.message.data?.slice(0, 5) || [];
});

const hasMoreComments = computed(() => {
  return props.message.data?.length > 5;
});

const remainingCount = computed(() => {
  return Math.max(0, (props.message.data?.length || 0) - 5);
});

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatDate = (dateString) => {
  if (!dateString || dateString === 'null' || dateString === 'undefined') {
    return '날짜 없음';
  }

  try {
    let date;

    if (Array.isArray(dateString) && dateString.length >= 3) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
      date = new Date(year, month - 1, day, hour, minute, second);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string' || typeof dateString === 'number') {
      date = new Date(dateString);
    } else if (typeof dateString === 'object' && dateString.$date) {
      date = new Date(dateString.$date);
    } else {
      return '날짜 형식 오류';
    }

    if (isNaN(date.getTime())) {
      return '유효하지 않은 날짜';
    }

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('날짜 포맷팅 에러:', error);
    return '날짜 오류';
  }
};
</script>

<style scoped>
/* Bootstrap Icons 로드 확인을 위한 폴백 */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');

.content-title {
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--color-main);
  font-size: 0.85rem;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comments-content {
  width: 100%;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.comment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 0.0625rem solid var(--color-light);
  position: relative;
  overflow: hidden;
}

.comment-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 0.1875rem;
  height: 100%;
  background: var(--color-main);
  transform: scaleY(0);
  transition: transform 0.2s ease;
}

.comment-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border-color: var(--color-main);
}

.comment-item:hover::before {
  transform: scaleY(1);
}

.comment-item:hover .comment-arrow {
  transform: translateX(0.125rem);
  opacity: 1;
}

.comment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 100%;
}

.comment-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 20rem;
}

.comment-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-meta {
  margin: 0;
  font-size: 0.65rem;
  color: var(--color-sub);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.separator {
  opacity: 0.5;
}

.post-ref {
  color: #2196f3;
  font-weight: 500;
}

.like-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 500;
  color: #e91e63;
}

.like-count .bi-heart-fill {
  font-size: 0.7rem;
  color: #e91e63;
}

.reply-badge {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
  padding: 0.125rem 0.375rem;
  border-radius: 0.625rem;
  font-size: 0.65rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.comment-arrow {
  flex-shrink: 0;
  color: var(--color-sub);
  opacity: 0.6;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
}

.more-btn {
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: var(--color-white);
  border: none;
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.more-btn:hover::before {
  left: 100%;
}

.more-btn:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.375rem 1.25rem rgba(90, 106, 207, 0.4);
}

/* 모바일 대응 */
@media (max-width: 48rem) {
  .comments-list {
    gap: 0.2rem;
    margin-bottom: 0.4rem;
  }

  .comment-item {
    padding: 0.5rem;
  }

  .comment-info h4 {
    font-size: 0.75rem;
    max-width: 12rem;
  }

  .comment-title {
    font-size: 0.8rem;
  }

  .comment-meta {
    font-size: 0.6rem;
    gap: 0.3rem;
  }

  .like-count .bi-heart-fill {
    font-size: 0.65rem;
  }

  .reply-badge {
    font-size: 0.6rem;
    padding: 0.1rem 0.3rem;
  }

  .more-btn {
    padding: 0.55rem 0.8rem;
    font-size: 0.7rem;
  }
}
</style>
