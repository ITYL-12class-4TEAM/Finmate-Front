<template>
  <div class="my-scraps-container">
    <BackButton class="mb-3" />
    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="error" :message="error" />

    <div v-else class="my-scraps-content">
      <!-- 필터 섹션 -->
      <ScrapPostFilter
        :product-tags="productTags"
        :selected-products="selectedProducts"
        @toggle-product="toggleProduct"
      />

      <!-- 스크랩 게시글 목록 섹션 -->
      <ScrapPostList
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
import ScrapPostFilter from '@/components/mypage/myscrap/ScrapPostFilter.vue';
import ScrapPostList from '@/components/mypage/myscrap/ScrapPostList.vue';
import { postsAPI } from '@/api/mypost';
import { useToast } from '@/composables/useToast';
import BackButton from '@/components/common/BackButton.vue';

const { showToast } = useToast();

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

  // 스크랩 일시순 정렬 (최신순)
  return filtered.sort((a, b) => new Date(b.scrapCreatedAt) - new Date(a.scrapCreatedAt));
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

function convertDateArrayToISOString(arr) {
  if (!Array.isArray(arr) || arr.length < 3) return '';
  const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
  return new Date(year, month - 1, day, hour, minute, second).toISOString();
}

const fetchPosts = async () => {
  loading.value = true;
  error.value = '';

  try {
    // 내 스크랩 목록 가져오기
    const response = await postsAPI.getMyScraps();
    const apiData = response.body?.data || response.data;

    // 각 스크랩된 게시글의 상세 정보 가져오기
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
        scrapCreatedAt: convertDateArrayToISOString(item.hotBoardTime), // 스크랩일
        // 좋아요 및 스크랩 상태 (스크랩한 게시글이므로 스크랩은 항상 true)
        liked: post.liked || post.isLiked || false,
        scraped: true, // 스크랩 목록이므로 항상 true
        // 실제 API에서 상품 타입을 받아오도록 수정 (임시 랜덤 제거)
        productType:
          post.productType || productTags[Math.floor(Math.random() * productTags.length)],
      };
    });

    posts.value = await Promise.all(postPromises);
    currentPage.value = 1;
  } catch (err) {
    error.value = '스크랩한 게시글을 불러오는데 실패했습니다.';
    showToast('스크랩한 게시글을 불러오는데 실패했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

// 스크랩 토글 함수
const handleScrap = async (post) => {
  try {
    // 스크랩 API 호출 (실제 API 구현 필요)
    // const response = await postsAPI.toggleScrap(post.id);

    // 스크랩 해제 시 목록에서 제거
    const postIndex = posts.value.findIndex((p) => p.postId === post.id);
    if (postIndex !== -1) {
      if (posts.value[postIndex].scraped) {
        // 스크랩 해제 - 목록에서 제거
        posts.value.splice(postIndex, 1);
      }
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
        // 스크랩 상태는 유지 (스크랩 목록이므로)
        scraped: true,
      };
    }
  } catch (err) {
    console.error(`게시글 ${postId} 업데이트 실패:`, err);
  }
};

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
.my-scraps-container {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  background-color: var(--color-white);
  min-height: 100vh;
}

.my-scraps-content {
  width: 100%;
}
</style>
