<template>
  <div class="container-fluid px-0">
    <div class="posts-container">
      <!-- 헤더 섹션 -->
      <div class="header-section mb-3">
        <div class="d-flex align-items-center gap-2">
          <div>
            <h5 class="header-title mb-0">{{ message.title }}</h5>
            <small class="header-subtitle">{{ message.subtitle }}</small>
          </div>
        </div>
      </div>

      <!-- 게시글 리스트 -->
      <div class="posts-grid">
        <div
          v-for="(post, index) in displayPosts"
          :key="`post-${post.postId}`"
          class="post-card"
          @click="$emit('navigate-to-post', post.postId)"
        >
          <!-- 카드 컨텐츠 -->
          <div class="card-content position-relative">
            <div class="row g-0 align-items-center">
              <!-- 메인 컨텐츠 -->
              <div class="col">
                <div class="post-header mb-2">
                  <!-- 게시글 제목과 날짜 -->
                  <div
                    class="d-flex align-items-start justify-content-between mb-1"
                    style="width: 100%"
                  >
                    <h6
                      class="post-title mb-0"
                      style="flex: 0 1 auto; max-width: calc(100% - 3rem)"
                    >
                      {{ post.title }}
                    </h6>
                    <!-- 날짜 -->
                    <span class="post-date" style="flex: 0 0 auto; margin-left: auto">
                      {{ formatDate(post.createdAt || post.created_at || post.date) }}
                    </span>
                  </div>

                  <!-- 작성자 정보 -->
                  <div class="post-meta d-flex align-items-center gap-2 flex-wrap">
                    <div class="d-flex align-items-center gap-1">
                      <div class="author-avatar">
                        {{ (post.nickname || post.author || '?').charAt(0).toUpperCase() }}
                      </div>
                      <span class="author-name">
                        {{ post.nickname || post.author || '익명' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 상호작용 정보 -->
                <div class="interaction-info d-flex align-items-center gap-3">
                  <div
                    v-if="post.likeCount || post.like_count"
                    class="like-info d-flex align-items-center gap-1"
                  >
                    <i class="bi bi-heart-fill interaction-icon text-danger"></i>
                    <span class="interaction-count">{{ post.likeCount || post.like_count }}</span>
                  </div>

                  <div
                    v-if="post.commentCount || post.comment_count"
                    class="comment-info d-flex align-items-center gap-1"
                  >
                    <i class="bi bi-chat-fill interaction-icon text-primary"></i>
                    <span class="interaction-count">{{
                      post.commentCount || post.comment_count
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- 화살표 아이콘 -->
              <div class="col-auto">
                <div class="arrow-wrapper">
                  <svg
                    width="1.25rem"
                    height="1.25rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    class="arrow-icon"
                  >
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
          </div>
        </div>
      </div>

      <!-- 더보기 버튼 -->
      <div v-if="hasMorePosts" class="more-section mt-4">
        <button class="more-button w-100" @click="$emit('navigate-to-more', message.moreUrl)">
          <div class="button-content d-flex align-items-center justify-content-center gap-1">
            <span class="button-text">더보기</span>
            <span class="button-count">({{ remainingCount }})</span>
            <div class="button-arrow">
              <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
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
    return '방금';
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
      return '방금';
    }

    if (isNaN(date.getTime())) {
      return '방금';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('날짜 포맷팅 에러:', error);
    return '방금';
  }
};
</script>

<style scoped>
.posts-container {
  max-width: 65vw;
  margin: 0 auto;
  padding: 0.5rem;
}

/* 헤더 섹션 */
.header-section {
  padding: 0rem 0 0rem 0;
}

.header-title {
  font-size: 0.9rem !important;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.header-subtitle {
  font-size: 0.7rem !important;
  color: #6b7280;
  font-weight: 400;
}

/* 게시글 그리드 */
.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-card {
  background: white;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.post-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e5e7eb;
}

.card-content {
  padding: 0.6rem;
}

.post-header.mb-2 {
  margin-bottom: 0.5rem !important;
}

/* 게시글 헤더 */
.post-title {
  font-size: 0.72rem !important;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 날짜 스타일 */
.post-date {
  font-size: 0.6rem;
  color: #9ca3af;
  white-space: nowrap;
}

/* 메타 정보 */
.post-meta {
  font-size: 0.5rem;
  color: #6b7280;
}

.author-avatar {
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.author-name {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.65rem;
  max-width: 5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.separator {
  opacity: 0.5;
  color: #d1d5db;
}

/* 상호작용 정보 */
.interaction-info {
  margin-top: 0.5rem;
}

.interaction-icon {
  font-size: 0.65rem;
}

.interaction-count {
  font-size: 0.65rem;
  font-weight: 500;
  color: #6b7280;
}

/* 화살표 */
.arrow-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  transition: all 0.2s ease;
}

.post-card:hover .arrow-wrapper {
  background: #f3f4f6;
}

.arrow-icon {
  color: #9ca3af;
  transition: all 0.2s ease;
}

.post-card:hover .arrow-icon {
  color: #6b7280;
  transform: translateX(1px);
}

/* 더보기 버튼 */
.more-section {
  text-align: center;
}

.more-button {
  position: relative;
  padding: 0.875rem 1.25rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-text {
  font-size: 0.875rem;
}

.button-count {
  font-size: 0.8125rem;
  opacity: 0.7;
}

.button-arrow {
  transition: transform 0.2s ease;
}

.more-button:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.more-button:hover .button-arrow {
  transform: translateX(2px);
}

.row {
  flex-wrap: nowrap;
}

.card-content .row {
  flex-wrap: nowrap;
}

.card-content .col {
  min-width: 0;
}
</style>
