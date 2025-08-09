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
            <!-- 날짜를 absolute로 이동 -->
            <span class="post-date-abs">
              {{ formatDate(post.createdAt || post.created_at || post.date) }}
            </span>

            <div class="row g-0 align-items-center">
              <div class="col">
                <div class="post-header mb-2">
                  <!-- 제목 -->
                  <h6 class="post-title mb-0">
                    {{ post.title }}
                  </h6>
                </div>

                <div class="post-meta">
                  <div class="post-stats">
                    <!-- 좋아요 표시 (클릭 기능 제거) -->
                    <div
                      class="stat-item"
                      :class="{ liked: post.isLiked || post.is_liked || post.liked }"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        :fill="
                          post.isLiked || post.is_liked || post.liked ? 'currentColor' : 'none'
                        "
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        />
                      </svg>
                      <span class="stat-count">{{ post.likes || post.likeCount || 0 }}</span>
                    </div>

                    <!-- 댓글 아이콘 (Bootstrap Icons bi-chat-fill로 통일) -->
                    <div class="stat-item">
                      <i class="bi bi-chat" style="font-size: 0.65rem; color: #6b7280"></i>
                      <span class="stat-count">{{ post.comments || post.commentCount || 0 }}</span>
                    </div>

                    <!-- 스크랩 표시 (클릭 기능 제거) -->
                    <div
                      class="stat-item"
                      :class="{ scraped: post.isScrapped || post.is_scrapped || post.scraped }"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        :fill="
                          post.isScrapped || post.is_scrapped || post.scraped
                            ? 'currentColor'
                            : 'none'
                        "
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      <span class="stat-count">{{ post.scraps || post.scrapCount || 0 }}</span>
                    </div>
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

const emit = defineEmits(['navigate-to-post', 'navigate-to-more']);

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
  padding: 0.2rem;
}

.header-section {
  padding: 0.4rem 0 0rem 0;
  padding-left: 0.2rem;
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

.posts-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.post-title {
  font-size: 0.72rem !important;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 1rem;
}

.post-date-abs {
  position: absolute;
  top: 0.5rem;
  right: 0.6rem;
  font-size: 0.6rem;
  color: #9ca3af;
  white-space: nowrap;
  z-index: 1;
}

.post-meta {
  font-size: 0.5rem;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  color: #9ca3af;
  transition: all 0.2s ease;
  padding: 0.1rem;
  border-radius: 0.25rem;
  user-select: none;
}

/* 좋아요 활성화 상태 */
.stat-item.liked {
  color: #ef4444;
}

/* 스크랩 활성화 상태 */
.stat-item.scraped {
  color: var(--color-main);
}

.stat-count {
  font-size: 0.625rem;
  font-weight: 500;
  min-width: 1rem;
  text-align: center;
}

.post-owner {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-sub);
  white-space: nowrap;
}

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

.more-section.mt-4 {
  margin-top: 0.5rem !important;
  text-align: center;
}

.more-button {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-main);
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.12);
}

.more-button:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(45, 51, 107, 0.2);
}

.button-arrow {
  transition: transform 0.3s ease;
}

.more-button:hover .button-arrow {
  transform: translateX(3px);
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

/* 반응형 */
@media (max-width: 768px) {
  .stat-count {
    font-size: 0.5625rem;
  }

  .post-owner {
    font-size: 0.625rem;
  }

  .post-stats {
    gap: 0.2rem;
  }
}
</style>
