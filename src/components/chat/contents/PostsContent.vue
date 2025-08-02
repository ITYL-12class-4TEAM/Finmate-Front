<template>
  <div class="posts-content">
    <p class="content-title">{{ message.title }}</p>
    <div class="posts-list">
      <div
        v-for="post in displayPosts"
        :key="`post-${post.postId}`"
        class="post-item"
        @click="$emit('navigate-to-post', post.postId)"
        :aria-label="`게시글: ${post.title}`"
      >
        <div class="post-info">
          <h4 :title="post.title">{{ post.title }}</h4>
          <p class="post-meta">
            <span class="author">
              {{ post.nickname || post.author || '작성자 없음' }}
            </span>
            <span class="separator">·</span>
            <span class="date">
              {{ formatDate(post.createdAt || post.created_at || post.date) }}
            </span>
            <span
              v-if="post.likeCount || post.like_count"
              class="like-count"
              :title="`좋아요 ${post.likeCount || post.like_count}개`"
            >
              <i class="bi bi-heart-fill" aria-hidden="true"></i>
              {{ post.likeCount || post.like_count }}
            </span>
            <span
              v-if="post.commentCount || post.comment_count"
              class="comment-count"
              :title="`댓글 ${post.commentCount || post.comment_count}개`"
            >
              <i class="bi bi-chat-fill" aria-hidden="true"></i>
              {{ post.commentCount || post.comment_count }}
            </span>
          </p>
        </div>
        <div class="post-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
      v-if="hasMorePosts"
      @click="$emit('navigate-to-more', message.moreUrl)"
      class="more-btn"
      :aria-label="`더보기 (${remainingCount}개)`"
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

const displayPosts = computed(() => {
  return props.message.data?.slice(0, 5) || [];
});

const hasMorePosts = computed(() => {
  return props.message.data?.length > 5;
});

const remainingCount = computed(() => {
  return Math.max(0, (props.message.data?.length || 0) - 5);
});

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
    } else if (
      typeof dateString === 'string' ||
      typeof dateString === 'number'
    ) {
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

.posts-content {
  width: 100%;
  overflow: hidden; /* 전체 컨테이너 오버플로우 숨김 */
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
  width: 100%;
  overflow: hidden; /* 리스트 컨테이너 오버플로우 숨김 */
}

.post-item {
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
  width: 100%;
  min-width: 0; /* flex 축소 허용 */
}

.post-item::before {
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

.post-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  border-color: var(--color-main);
}

.post-item:hover::before {
  transform: scaleY(1);
}

.post-item:hover .post-arrow {
  transform: translateX(0.125rem);
  opacity: 1;
}

.post-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* flex item이 축소될 수 있도록 */
  margin-right: 0.5rem; /* 화살표와의 간격 */
  overflow: hidden; /* 중요: 오버플로우 숨김 */
  width: calc(100% - 2rem); /* 화살표 영역 제외한 최대 너비 */
}

.post-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;

  /* 강제 말줄임표 처리 */
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;

  /* 강제 너비 제한 */
  width: 100% !important;
  max-width: 200px !important; /* 고정 최대 너비 설정 */
  min-width: 0 !important;
  display: block !important;
  box-sizing: border-box !important;
}

.post-meta {
  margin: 0;
  font-size: 0.65rem;
  color: var(--color-sub);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  overflow: hidden; /* 메타 정보도 오버플로우 방지 */
  width: 100%;
}

.separator {
  opacity: 0.5;
}

.like-count {
  color: #e91e63;
}

.like-count,
.comment-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 500;
  flex-shrink: 0; /* 숫자는 축소되지 않도록 */
}

.comment-count {
  color: #2196f3;
}

.post-arrow {
  color: var(--color-sub);
  opacity: 0.6;
  transition: all 0.2s ease;
  flex-shrink: 0; /* 화살표 크기 고정 */
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-btn {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
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
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
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
  .posts-list {
    gap: 0.2rem;
    margin-bottom: 0.4rem;
  }

  .post-item {
    padding: 0.5rem;
  }

  .post-info {
    margin-right: 0.25rem;
    width: calc(100% - 1.5rem); /* 모바일에서 더 좁은 여백 */
  }

  .post-info h4 {
    font-size: 0.75rem;
    max-width: 150px !important; /* 모바일에서 더 짧게 */
  }

  .post-meta {
    font-size: 0.6rem;
    gap: 0.3rem;
  }

  .more-btn {
    padding: 0.55rem 0.8rem;
    font-size: 0.7rem;
  }
}
</style>
