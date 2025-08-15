<template>
  <div class="my-comments-container">
    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="error" :message="error" />

    <div v-else class="my-comments-content">
      <!-- 필터 섹션 -->
      <CommentPostFilter
        :product-tags="productTags"
        :selected-products="selectedProducts"
        @toggle-product="toggleProduct"
      />

      <!-- 댓글 작성 게시글 목록 섹션 -->
      <CommentPostList
        :posts="filteredPosts"
        :current-page="currentPage"
        :posts-per-page="itemsPerPage"
        @page-change="changePage"
        @post-click="goToDetailPage"
        @scrap="handleScrap"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import router from '@/router';

import LoadingSpinner from '@/components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import CommentPostFilter from '@/components/mypage/mycomment/CommentPostFilter.vue';
import CommentPostList from '@/components/mypage/mycomment/CommentPostList.vue';
import { postsAPI } from '@/api/mypost';

const loading = ref(false);
const error = ref('');
const posts = ref([]);
const currentPage = ref(1);
const itemsPerPage = 5;

// 필터 관련 상태
const productTags = ['예금', '적금', '펀드', '보험'];
const selectedProducts = ref([]);

// 필터링된 게시글 목록
const filteredPosts = computed(() => {
  let filtered = [...posts.value];

  // 상품군 필터링
  if (selectedProducts.value.length > 0) {
    filtered = filtered.filter((post) => {
      return selectedProducts.value.includes(post.productType);
    });
  }

  // 최신 댓글순 정렬
  return filtered.sort((a, b) => new Date(b.myCommentCreatedAt) - new Date(a.myCommentCreatedAt));
});

// 필터링 함수
const toggleProduct = (tag) => {
  const index = selectedProducts.value.indexOf(tag);
  if (index === -1) {
    selectedProducts.value.push(tag);
  } else {
    selectedProducts.value.splice(index, 1);
  }
  // 필터 변경 시 첫 페이지로 이동
  currentPage.value = 1;
};

// 날짜 배열을 ISO 문자열로 변환
function convertDateArrayToISOString(arr) {
  if (!Array.isArray(arr) || arr.length < 3) return '';
  const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
  return new Date(year, month - 1, day, hour, minute, second).toISOString();
}

const fetchPosts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await postsAPI.getMyComments();
    const commentList = response.body?.data || [];

    // 각 댓글에 대해 게시글 정보를 가져오기
    const postPromises = commentList.map(async (comment) => {
      try {
        const postRes = await postsAPI.getPost(comment.postId);
        const post = postRes.body?.data || postRes.data;

        return {
          postId: post.postId,
          title: post.title,
          content: post.content,
          authorName: post.anonymous
            ? '익명'
            : post.nickname || post.authorName || `사용자 ${post.memberId}`,
          postCreatedAt: convertDateArrayToISOString(post.createdAt),
          boardType: post.boardId === 1 ? 'FREE' : 'HOT',
          likeCount: post.likeCount || 0,
          commentCount: post.commentCount || 0,
          scrapCount: post.scrapCount || 0,
          // 좋아요 및 스크랩 상태 추가
          isLiked: post.isLiked || post.liked || false,
          isScrapped: post.isScrapped || post.scraped || false,
          myCommentId: comment.commentId,
          myCommentContent: comment.content,
          myCommentCreatedAt: convertDateArrayToISOString(comment.createdAt),
          // 상품군 정보 추가 (실제 API에서 제공되면 사용, 아니면 임시 할당)
          productType:
            post.productType || productTags[Math.floor(Math.random() * productTags.length)],
        };
      } catch (postErr) {
        console.error(`게시글 ${comment.postId} 조회 실패:`, postErr);
        return null;
      }
    });

    const allPosts = await Promise.all(postPromises);

    // null 값 제거 (에러로 인해 가져오지 못한 게시글)
    const validPosts = allPosts.filter((post) => post !== null);

    // postId로 중복 제거
    const uniquePosts = [];
    const seen = new Set();

    for (const post of validPosts) {
      if (!seen.has(post.postId)) {
        seen.add(post.postId);
        uniquePosts.push(post);
      }
    }

    posts.value = uniquePosts;
    currentPage.value = 1;
  } catch (err) {
    error.value = '댓글 작성 게시글을 불러오는데 실패했습니다.';
    console.error('Posts fetch error:', err);
  } finally {
    loading.value = false;
  }
};

// 스크랩 토글 함수
const handleScrap = async (post) => {
  try {
    // 스크랩 API 호출 (실제 API 구현 필요)
    // const response = await postsAPI.toggleScrap(post.id);

    // 임시로 로컬 상태 토글
    const postIndex = posts.value.findIndex((p) => p.postId === post.id);
    if (postIndex !== -1) {
      posts.value[postIndex].isScrapped = !posts.value[postIndex].isScrapped;
      posts.value[postIndex].scrapCount += posts.value[postIndex].isScrapped ? 1 : -1;
    }
  } catch (err) {
    console.error('스크랩 처리 실패:', err);
  }
};

// 게시글 상세 페이지로 이동
const goToDetailPage = (postId) => {
  router.push(`/community/${postId}`);
};

const changePage = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 필터 변경 시 첫 페이지로 이동하는 watcher
watch(
  selectedProducts,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

onMounted(() => {
  fetchPosts();
});

defineExpose({ fetchPosts });
</script>

<style scoped>
.my-comments-container {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--color-white);
  min-height: 100vh;
}

.my-comments-content {
  width: 100%;
}

/* 모바일 최적화 - 작은 화면에서 패딩 조정 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .my-comments-container {
    padding: 0.75rem;
  }
}
</style>
