<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <PostFilter
      v-model:search-query="searchQuery"
      v-model:selected-board="selectedBoard"
      v-model:sort-by="sortBy"
      @filter="filterAndSortPosts"
    />

    <div>
      <PostActions :filtered-count="filteredPosts.length" />
      <PostList :posts="paginatedPosts" @view-post="viewPost" />
      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @change-page="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import router from '@/router';

import LoadingSpinner from '@/components/mypage/common/LoadingSpinner.vue';
import Pagination from '@/components/mypage/common/Pagination.vue';
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import PostFilter from '@/components/mypage/mypost/PostFilter.vue';
import PostActions from '@/components/mypage/mypost/PostAction.vue';
import PostList from '@/components/mypage/mypost/PostList.vue';
import { postsAPI } from '@/api/mypost';

const loading = ref(false);
const error = ref('');
const posts = ref([]);
const searchQuery = ref('');
const selectedBoard = ref('');
const sortBy = ref('date-desc');
const currentPage = ref(1);
const itemsPerPage = 15;

const filteredPosts = computed(() => {
  let filtered = [...posts.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) || post.content.toLowerCase().includes(query)
    );
  }

  if (selectedBoard.value) {
    filtered = filtered.filter((post) => post.boardType === selectedBoard.value);
  }

  switch (sortBy.value) {
    case 'date-desc':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'date-asc':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'like-desc':
      filtered.sort((a, b) => b.likeCount - a.likeCount);
      break;
    case 'comment-desc':
      filtered.sort((a, b) => b.commentCount - a.commentCount);
      break;
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / itemsPerPage);
});

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredPosts.value.slice(start, start + itemsPerPage);
});

const fetchPosts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await postsAPI.getMyPosts();
    const apiData = response.body?.data || response.data;

    posts.value = apiData.map((post) => ({
      postId: post.postId,
      title: post.title,
      content: post.content,
      boardType: post.boardId === 1 ? 'FREE' : post.boardId === 2 ? 'HOT' : 'NOTICE',
      isAnonymous: post.anonymous,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: convertDateArrayToISOString(post.createdAt),
    }));

    currentPage.value = 1;
  } catch (err) {
    error.value = '게시글을 불러오는데 실패했습니다.';
    console.error('Posts fetch error:', err);
  } finally {
    loading.value = false;
  }
};
// 개별 게시글 정보 최신화
const refreshPost = async (postId) => {
  try {
    const res = await postsAPI.getPost(postId);

    const updated = res.data.body?.data;
    const index = posts.value.findIndex((p) => p.postId === postId);
    if (index !== -1) {
      posts.value[index] = {
        ...posts.value[index],
        title: updated.title,
        content: updated.content,
        likeCount: updated.likeCount,
        commentCount: updated.commentCount,
        createdAt: updated.createdAt,
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
defineExpose({ refreshPost });
</script>

<style scoped></style>
