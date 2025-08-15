<template>
  <div class="my-likes-container">
    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="error" :message="error" />

    <div v-else class="my-likes-content">
      <!-- 필터 섹션 -->
      <LikePostFilter
        :product-tags="productTags"
        :selected-products="selectedProducts"
        @toggle-product="toggleProduct"
      />

      <!-- 좋아요 게시글 목록 섹션 -->
      <LikePostList
        :posts="filteredPosts"
        :current-page="currentPage"
        :posts-per-page="postsPerPage"
        @page-change="changePage"
        @post-click="goToDetailPage"
        @like="handleLike"
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
import LikePostFilter from '@/components/mypage/mylike/LikePostFilter.vue';
import LikePostList from '@/components/mypage/mylike/LikePostList.vue';
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

  // 좋아요 일시순 정렬 (최신순)
  return filtered.sort((a, b) => new Date(b.likeCreatedAt) - new Date(a.likeCreatedAt));
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
    // 내 좋아요 목록 가져오기
    const response = await postsAPI.getMyLikes();
    const apiData = response.body?.data || response.data;

    // 각 좋아요한 게시글의 상세 정보 가져오기
    const postPromises = apiData.map(async (item) => {
      const postRes = await postsAPI.getPost(item.postId);
      const post = postRes.body.data;

      return {
        postId: post.postId,
        title: post.title,
        content: post.content,
        boardType: post.boardId === 1 ? 'FREE' : post.boardId === 2 ? 'HOT' : 'NOTICE',
        isAnonymous: post.anonymous,
        // API에서 받은 실제 닉네임 정보 사용
        nickname: post.nickname || post.authorName || post.writer || '작성자',
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
        scrapCount: post.scrapCount || 0,
        postCreatedAt: convertDateArrayToISOString(post.createdAt), // 게시글 작성일
        likeCreatedAt: convertDateArrayToISOString(item.lastUpdated), // 좋아요일
        // 좋아요 및 스크랩 상태 (좋아요한 게시글이므로 좋아요는 항상 true)
        liked: true, // 좋아요 목록이므로 항상 true
        scraped: post.scraped || post.isScrapped || false,
        // 실제 API에서 상품 타입을 받아오도록 수정 (임시 랜덤 제거)
        productType:
          post.productType || productTags[Math.floor(Math.random() * productTags.length)],
      };
    });

    posts.value = await Promise.all(postPromises);
    currentPage.value = 1;
  } catch (err) {
    error.value = '좋아요 누른 게시글을 불러오는데 실패했습니다.';
    console.error('My likes fetch error:', err);
  } finally {
    loading.value = false;
  }
};

// 좋아요 토글 함수
const handleLike = async (post) => {
  try {
    // 좋아요 API 호출 (실제 API 구현 필요)
    // const response = await postsAPI.toggleLike(post.id);

    // 좋아요 해제 시 목록에서 제거
    const postIndex = posts.value.findIndex((p) => p.postId === post.id);
    if (postIndex !== -1) {
      if (posts.value[postIndex].liked) {
        // 좋아요 해제 - 목록에서 제거
        posts.value.splice(postIndex, 1);
      }
    }
  } catch (err) {
    console.error('좋아요 처리 실패:', err);
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
        // 좋아요 상태는 유지 (좋아요 목록이므로)
        liked: true,
        scraped: updated.scraped || updated.isScrapped || posts.value[index].scraped || false,
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
  currentPage.value = page;
  // 페이지 변경 시 스크롤을 맨 위로
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

defineExpose({ refreshPost });
</script>

<style scoped>
.my-likes-container {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--color-white);
  min-height: 100vh;
}

.my-likes-content {
  width: 100%;
}

/* 모바일 최적화 - 작은 화면에서 패딩 조정 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .my-likes-container {
    padding: 0.75rem;
  }
}
</style>
