<template>
  <div class="posts-section">
    <CommentPostSummary :total-posts="posts.length" />

    <!-- 게시글 목록 -->
    <section class="post-list">
      <div v-if="paginatedPosts.length === 0" class="empty-message">
        <i class="fas fa-search"></i>
        <p>댓글을 작성한 게시글이 없습니다.</p>
      </div>
      <div v-else class="post-card-container">
        <PostCard
          v-for="post in paginatedPosts"
          :key="`comment-post-${post.postId}`"
          :post="convertToPostCardFormat(post)"
          :is-liked="post.isLiked || false"
          :is-scrapped="post.isScrapped || false"
          @click="$emit('post-click', post.postId)"
          @scrap="$emit('scrap', $event)"
        />
      </div>
    </section>

    <!-- 페이징 컨트롤 -->
    <CommentPostPagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="$emit('page-change', $event)"
    />

    <!-- 페이지 정보 -->
    <CommentPostPageInfo
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
import CommentPostSummary from './CommentPostSummary.vue';
import CommentPostPagination from './CommentPostPagination.vue';
import CommentPostPageInfo from './CommentPostPageInfo.vue';

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

defineEmits(['page-change', 'post-click', 'scrap']);

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
    createdAt: convertToDateArray(post.postCreatedAt),
    likes: post.likeCount || 0,
    comments: post.commentCount || 0,
    scraps: post.scrapCount || 0,
    nickname: post.authorName,
    boardType: post.boardType,
    productType: post.productType,
    // 내 댓글 정보 추가 표시
    myComment: {
      content: post.myCommentContent,
      createdAt: convertToDateArray(post.myCommentCreatedAt),
    },
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

/* 게시글 목록 */
.post-list {
  margin-top: 1rem;
  min-height: 25rem;
}

.post-card-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
}
</style>
