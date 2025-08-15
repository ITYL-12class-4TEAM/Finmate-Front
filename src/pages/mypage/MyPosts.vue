<template>
  <div class="my-posts-container">
    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="error" :message="error" />

    <div v-else class="my-posts-content">
      <!-- 필터 섹션 -->
      <PostFilter
        :product-tags="productTags"
        :selected-products="selectedProducts"
        @toggle-product="toggleProduct"
      />

      <!-- 게시글 목록 섹션 -->
      <PostList
        :posts="filteredPosts"
        :current-page="currentPage"
        :posts-per-page="postsPerPage"
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
import PostFilter from '@/components/mypage/mypost/PostFilter.vue';
import PostList from '@/components/mypage/mypost/PostList.vue';
import { postsAPI } from '@/api/mypost';

const loading = ref(false);
const error = ref('');
const posts = ref([]);
const currentPage = ref(1);
const postsPerPage = 5;

// 필터 관련 상태
const productTags = ['예금', '적금', '펀드', '보험'];
const selectedProducts = ref([]);

const filteredPosts = computed(() => {
  let filtered = [...posts.value];

  // 상품군 필터링
  if (selectedProducts.value.length > 0) {
    filtered = filtered.filter((post) => {
      return selectedProducts.value.includes(post.productType);
    });
  }

  // 최신순 정렬
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

const fetchPosts = async () => {
  loading.value = true;
  error.value = '';

  try {
    // 내 게시글만 가져오기
    const response = await postsAPI.getMyPosts();
    const apiData = response.body?.data || response.data;

    posts.value = apiData.map((post) => ({
      postId: post.postId,
      title: post.title,
      content: post.content,
      boardType: post.boardId === 1 ? 'FREE' : post.boardId === 2 ? 'HOT' : 'NOTICE',
      isAnonymous: post.anonymous,
      nickname: post.nickname || post.authorName || post.writer || '작성자',
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      scrapCount: post.scrapCount || 0,
      createdAt: convertDateArrayToISOString(post.createdAt),
      liked: post.liked || post.isLiked || false,
      scraped: post.scraped || post.isScrapped || false,
      productType: post.productType || productTags[Math.floor(Math.random() * productTags.length)],
    }));

    currentPage.value = 1;
  } catch (err) {
    error.value = '내 게시글을 불러오는데 실패했습니다.';
    console.error('My posts fetch error:', err);
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
      posts.value[postIndex].scraped = !posts.value[postIndex].scraped;
      posts.value[postIndex].scrapCount += posts.value[postIndex].scraped ? 1 : -1;
    }
  } catch (err) {
    console.error('스크랩 처리 실패:', err);
  }
};

// 개별 게시글 정보 최신화
const refreshPost = async (postId) => {
  try {
    const res = await postsAPI.getPost(postId);
    const updated = res.data.body?.data || res.body?.data || res.data;

    const index = posts.value.findIndex((p) => p.postId === postId);
    if (index !== -1) {
      posts.value[index] = {
        ...posts.value[index],
        title: updated.title,
        content: updated.content,
        likeCount: updated.likeCount || 0,
        commentCount: updated.commentCount || 0,
        scrapCount: updated.scrapCount || posts.value[index].scrapCount || 0,
        liked: updated.liked || updated.isLiked || posts.value[index].liked || false,
        scraped: updated.scraped || updated.isScrapped || posts.value[index].scraped || false,
        createdAt: updated.createdAt || posts.value[index].createdAt,
      };
    }
  } catch (err) {
    console.error(`게시글 ${postId} 업데이트 실패:`, err);
  }
};

function convertDateArrayToISOString(arr) {
  if (!Array.isArray(arr) || arr.length < 3) return '';
  const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
  return new Date(year, month - 1, day, hour, minute, second).toISOString();
}

const goToDetailPage = (postId) => {
  router.push(`/community/${postId}`);
};

// 페이지 변경
const changePage = (page) => {
  if (page >= 1) {
    currentPage.value = page;
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
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

defineExpose({ refreshPost });
</script>

<style scoped>
.my-posts-container {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--color-white);
  min-height: 100vh;
}

.my-posts-content {
  width: 100%;
}

/* 모바일 최적화 - 작은 화면에서 패딩 조정 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .my-posts-container {
    padding: 0.75rem;
  }
}
</style>
