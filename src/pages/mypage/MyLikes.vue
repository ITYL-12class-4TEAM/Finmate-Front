<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <LikedPostFilter
      v-model:searchQuery="searchQuery"
      v-model:selectedBoard="selectedBoard"
      v-model:sortBy="sortBy"
      @filter="filterAndSortPosts"
    />

    <EmptyState
      v-if="filteredPosts.length === 0"
      :hasFilters="!!(searchQuery || selectedBoard)"
      :icon="'bi-heart'"
      :emptyText="'좋아요를 누른 게시글이 없습니다'"
      :emptySubtext="'마음에 드는 게시글에 좋아요를 눌러보세요.'"
      :noResultText="'검색 결과가 없습니다'"
      :noResultSubtext="'다른 검색어나 필터를 시도해보세요.'"
    />

    <div v-else>
      <LikedPostActions :filteredCount="filteredPosts.length" />

      <LikedPostList :posts="paginatedPosts" @view-post="viewPost" />

      <Pagination
        v-if="totalPages > 1"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @change-page="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import router from '@/router';

import LoadingSpinner from '@/components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import EmptyState from '@/components/mypage/mylike/EmptyState.vue';
import Pagination from '@/components/mypage/common/Pagination.vue';
import LikedPostFilter from '@/components/mypage/mylike/LikePostFilter.vue';
import LikedPostActions from '@/components/mypage/mylike/LikePostActions.vue';
import LikedPostList from '@/components/mypage/mylike/LikePostList.vue';
import { postsAPI } from '@/api/posts';

const loading = ref(false);
const error = ref('');
const posts = ref([]);
const searchQuery = ref('');
const selectedBoard = ref('');
const sortBy = ref('like-date-desc');
const currentPage = ref(1);
const itemsPerPage = 15;

// 필터링된 게시글 목록
const filteredPosts = computed(() => {
  let filtered = [...posts.value];

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query)
    );
  }

  // 게시판 필터
  if (selectedBoard.value) {
    filtered = filtered.filter(
      (post) => post.boardType === selectedBoard.value
    );
  }

  // 정렬
  switch (sortBy.value) {
    case 'like-date-desc':
      filtered.sort(
        (a, b) => new Date(b.likeCreatedAt) - new Date(a.likeCreatedAt)
      );
      break;
    case 'post-date-desc':
      filtered.sort(
        (a, b) => new Date(b.postCreatedAt) - new Date(a.postCreatedAt)
      );
      break;
    case 'total-like-desc':
      filtered.sort((a, b) => b.likeCount - a.likeCount);
      break;
    case 'comment-desc':
      filtered.sort((a, b) => b.commentCount - a.commentCount);
      break;
  }

  return filtered;
});

// 페이지네이션
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / itemsPerPage);
});

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPosts.value.slice(start, end);
});

const fetchPosts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await postsAPI.getMyLikes();

    const apiData = response.body?.data || response.data;

    const postPromises = apiData.map(async (item) => {
      const postRes = await postsAPI.getPost(item.postId);
      const post = postRes.body.data;

      return {
        postId: post.postId,
        title: post.title,
        content: post.content,
        authorName: post.anonymous ? '익명' : `사용자 ${post.memberId}`,
        boardType: post.boardId === 1 ? 'FREE' : 'HOT',
        isAnonymous: post.anonymous,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        postCreatedAt: convertDateArrayToISOString(post.createdAt),
        likeCreatedAt: convertDateArrayToISOString(item.lastUpdated), // ← item에서 가져와야 정확
      };
    });

    posts.value = await Promise.all(postPromises); // ✅ 누락된 부분 추가
    currentPage.value = 1;
  } catch (err) {
    error.value = '좋아요 누른 게시글을 불러오는데 실패했습니다.';
    console.error('Posts fetch error:', err);
  } finally {
    loading.value = false;
  }
};
function convertDateArrayToISOString(arr) {
  if (!Array.isArray(arr) || arr.length < 3) return '';
  const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
  return new Date(year, month - 1, day, hour, minute, second).toISOString();
}

const filterAndSortPosts = () => {
  currentPage.value = 1;
};

const viewPost = (post) => {
  router.push(`/community/${post.postId}`);
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped></style>
