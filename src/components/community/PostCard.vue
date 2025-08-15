<template>
  <div class="post-card" @click="$emit('click')">
    <div class="post-card-inner">
      <div class="post-header">
        <h4 class="post-title">{{ post.title }}</h4>
        <span class="post-date">{{ formattedDate }}</span>
      </div>

      <p class="post-content">{{ post.content }}</p>

      <div class="post-meta">
        <div class="post-stats">
          <!-- 좋아요 버튼: Font Awesome heart icon -->
          <div class="stat-item" :class="{ liked: isLiked }" @click.stop="handleLike">
            <i class="fa-heart interaction-icon" :class="isLiked ? 'fas' : 'far'"></i>
            <span class="stat-count">{{ post.likes || 0 }}</span>
          </div>

          <!-- 댓글 아이콘: Font Awesome comment icon -->
          <div class="stat-item">
            <i class="fas fa-comment interaction-icon"></i>
            <span class="stat-count">{{ post.comments || 0 }}</span>
          </div>

          <!-- 스크랩 버튼: Font Awesome bookmark icon -->
          <div class="stat-item" :class="{ scraped: isScrapped }" @click.stop="handleScrap">
            <i class="fa-bookmark interaction-icon" :class="isScrapped ? 'fas' : 'far'"></i>
            <span class="stat-count">{{ post.scraps || post.scrapCount || 0 }}</span>
          </div>
        </div>
        <div class="post-owner">{{ post.nickname }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
  isScrapped: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click', 'like', 'scrap']);

// 좋아요 버튼 핸들러
const handleLike = () => {
  emit('like', props.post.id);
};

// 스크랩 버튼 핸들러
const handleScrap = () => {
  emit('scrap', props.post.id);
};

const formattedDate = computed(() => {
  const arr = props.post.createdAt;
  if (!arr || arr.length < 5) return '';
  // eslint-disable-next-line no-unused-vars
  const [_, month, day, hour, minute] = arr;
  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0'
  )} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});
</script>

<style scoped>
/* 기존 첫 번째 버전 스타일 유지 */
.post-card {
  background: white;
  border-radius: 0.75rem; /* 12px / 16 */
  padding: 0.75rem; /* 12px / 16 */
  border: 0.0625rem solid #f3f4f6; /* 1px / 16 */
  box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.02); /* 0 1px 3px / 16 */
  cursor: pointer;
  transition: all 0.2s ease;
  height: 7rem; /* 112px / 16 */
}

.post-card:hover {
  border-color: var(--color-light);
  box-shadow: 0 0.25rem 1rem rgba(45, 51, 107, 0.08); /* 0 4px 16px / 16 */
  transform: translateY(-0.0625rem); /* -1px / 16 */
}

.post-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem; /* 8px / 16 */
}

.post-title {
  font-size: 0.875rem; /* 14px / 16 */
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
  line-height: 1.3;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  padding-right: 0.5rem; /* 8px / 16 */
}

.post-date {
  font-size: 0.5625rem; /* 9px / 16 */
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.post-content {
  font-size: 0.6875rem; /* 11px / 16 */
  line-height: 1.4;
  color: #6b7280;
  margin: 0 0 0rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 1rem; /* 16px / 16 - 스크랩과 다른 버튼들 사이 간격 증가 */
}

/* 작성자 영역 */
.post-author {
  display: flex;
  align-items: center;
  gap: 0.375rem; /* 6px / 16 */
}

.author-avatar {
  width: 1.375rem; /* 22px / 16 */
  height: 1.375rem; /* 22px / 16 */
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  color: white;
  font-size: 0.5625rem; /* 9px / 16 */
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0.0625rem 0.1875rem rgba(45, 51, 107, 0.2); /* 0 1px 3px / 16 */
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.1875rem; /* 3px / 16 */
  color: var(--color-sub);
  transition: color 0.2s ease;
  cursor: pointer;
  padding: 0.1875rem; /* 3px / 16 */
  border-radius: 0.25rem; /* 4px / 16 */
}

.stat-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.stat-item.liked {
  color: #ef4444;
}

.stat-item.scraped {
  color: var(--color-sub);
}

.post-card:hover .stat-item:not(.liked):not(.scraped) {
  color: var(--color-sub);
}

/* Font Awesome 아이콘 스타일 */
.interaction-icon {
  font-size: 0.65rem; /* 10.4px / 16 */
  color: var(--color-sub);
  transition: color 0.2s ease;
}

.stat-item.liked .interaction-icon {
  color: #ef4444;
}

.stat-item.scraped .interaction-icon {
  color: var(--color-sub);
}

.stat-count {
  font-size: 0.625rem; /* 10px / 16 */
  font-weight: 500;
}

.post-owner {
  font-size: 0.6875rem; /* 11px / 16 */
  font-weight: 600;
  color: var(--color-sub);
  white-space: nowrap; /* 줄바꿈 방지 */
}

/* 반응형 - 모바일 기준 (23.4375rem = 375px / 16) */
@media (max-width: 26.875rem) {
  /* 430px / 16 */
  .post-card {
    padding: 0.8rem; /* 12.8px / 16 */
    height: 6.5rem; /* 104px / 16 */
  }

  .post-title {
    font-size: 0.8125rem; /* 13px / 16 */
  }

  .post-content {
    font-size: 0.65rem; /* 10.4px / 16 */
  }

  .post-date {
    font-size: 0.5rem; /* 8px / 16 */
  }

  .stat-count {
    font-size: 0.5625rem; /* 9px / 16 */
  }

  .author-avatar {
    width: 1.25rem; /* 20px / 16 */
    height: 1.25rem; /* 20px / 16 */
    font-size: 0.5rem; /* 8px / 16 */
  }

  .post-owner {
    font-size: 0.625rem; /* 10px / 16 */
  }

  .post-stats {
    gap: 0.75rem; /* 12px / 16 - 모바일에서도 충분한 간격 유지 */
  }

  .interaction-icon {
    font-size: 0.6rem; /* 9.6px / 16 */
  }
}
</style>
