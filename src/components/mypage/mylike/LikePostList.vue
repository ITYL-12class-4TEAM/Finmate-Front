<template>
  <div class="posts-section">
    <LikePostSummary :total-posts="posts.length" />

    <!-- 게시글 목록 -->
    <section class="post-list">
      <div v-if="paginatedPosts.length === 0" class="empty-message">
        <i class="fas fa-search"></i>
        <p>조건에 맞는 좋아요 게시글이 없습니다.</p>
      </div>
      <PostCard
        v-for="post in paginatedPosts"
        v-else
        :key="post.postId"
        :post="convertToPostCardFormat(post)"
        :is-liked="post.liked || false"
        :is-scrapped="post.scraped || false"
        @click="$emit('post-click', post.postId)"
        @like="$emit('like', $event)"
        @scrap="$emit('scrap', $event)"
      />
    </section>

    <!-- 페이징 컨트롤 -->
    <LikePostPagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="$emit('page-change', $event)"
    />

    <!-- 페이지 정보 -->
    <LikePostPageInfo
      v-if="posts.length > 0"
      :total-posts="posts.length"
      :start-index="startIndex"
      :end-index="endIndex"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PostCard from '@/components/community/PostCard.vue';
import LikePostSummary from './LikePostSummary.vue';
import LikePostPagination from './LikePostPagination.vue';
import LikePostPageInfo from './LikePostPageInfo.vue';

const props = defineProps({
  posts: {
    type: Array,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  postsPerPage: {
    type: Number,
    default: 5,
  },
});

defineEmits(['page-change', 'post-click', 'like', 'scrap']);

const totalPages = computed(() => {
  return Math.ceil(props.posts.length / props.postsPerPage);
});

const startIndex = computed(() => (props.currentPage - 1) * props.postsPerPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + props.postsPerPage, props.posts.length)
);

const paginatedPosts = computed(() => {
  return props.posts.slice(startIndex.value, endIndex.value);
});

// PostCard 컴포넌트에 맞는 형식으로 변환
const convertToPostCardFormat = (post) => {
  return {
    id: post.postId,
    title: post.title,
    content: post.content,
    createdAt: convertToDateArray(post.postCreatedAt), // 게시글 작성일
    likes: post.likeCount,
    comments: post.commentCount,
    scraps: post.scrapCount || 0,
    // 실제 닉네임 표시 (익명이면 '익명', 아니면 실제 닉네임)
    nickname: post.isAnonymous ? '익명' : post.nickname || post.authorName || '작성자',
    productType: post.productType,
  };
};

// ISO 문자열을 배열 형식으로 변환
const convertToDateArray = (isoString) => {
  if (!isoString) return [];
  const date = new Date(isoString);
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
};
</script>

<style scoped>
.posts-section {
  margin-top: 0;
}

/* 게시글 목록 - 커뮤니티와 동일한 스타일 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  min-height: 25rem;
}

.empty-message {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 2rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-message i {
  font-size: 2rem;
  color: #d1d5db;
}

.empty-message p {
  margin: 0;
}

/* 반응형 디자인 */
@media (max-width: 48rem) {
  .post-list {
    min-height: 21.875rem;
  }

  .empty-message {
    font-size: 0.8125rem;
  }

  .empty-message i {
    font-size: 1.75rem;
  }
}
</style>
