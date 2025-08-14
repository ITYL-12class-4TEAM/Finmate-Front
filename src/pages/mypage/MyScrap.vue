<template>
  <!-- <PageHeader title="내 스크랩" /> -->

  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <ScrappedPostFilter
      v-model:search-query="searchQuery"
      v-model:selected-board="selectedBoard"
      v-model:sort-by="sortBy"
      @filter="filterAndSortPosts"
    />

    <div>
      <ScrappedPostActions :filtered-count="filteredPosts.length" />

      <ScrappedPostList :posts="paginatedPosts" @view-post="viewPost" />

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
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import Pagination from '@/components/mypage/common/Pagination.vue';
import ScrappedPostFilter from '@/components/mypage/myscrap/ScrapPostFilter.vue';
import ScrappedPostActions from '@/components/mypage/myscrap/ScrapPostAction.vue';
import ScrappedPostList from '@/components/mypage/myscrap/ScrapPostList.vue';
import { postsAPI } from '@/api/mypost';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const loading = ref(false);
const error = ref('');
const posts = ref([]);
const searchQuery = ref('');
const selectedBoard = ref('');
const sortBy = ref('scrap-date-desc');
const currentPage = ref(1);
const itemsPerPage = 15;

// 날짜 배열 → Date 객체로 변환
const toDate = (input) => {
  if (Array.isArray(input)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = input;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  return new Date(input);
};

const filteredPosts = computed(() => {
  let filtered = [...posts.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.authorName || '').toLowerCase().includes(query)
    );
  }

  if (selectedBoard.value) {
    filtered = filtered.filter((post) => post.boardType === selectedBoard.value);
  }

  switch (sortBy.value) {
    case 'scrap-date-desc':
      filtered.sort((a, b) => toDate(b.scrapCreatedAt) - toDate(a.scrapCreatedAt));
      break;
    case 'post-date-desc':
      filtered.sort((a, b) => toDate(b.postCreatedAt) - toDate(a.postCreatedAt));
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
  const end = start + itemsPerPage;
  return filteredPosts.value.slice(start, end);
});

const fetchPosts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await postsAPI.getMyScraps();

    const apiData = response.body?.data || response.data;
    const postPromises = apiData.map(async (item) => {
      const postRes = await postsAPI.getPost(item.postId);
      const post = postRes.body.data;

      return {
        postId: post.postId,
        title: post.title,
        content: post.content,
        authorName: post.anonymous ? '익명' : `사용자 ${post.memberId}`,
        postCreatedAt: convertDateArrayToISOString(post.createdAt),
        boardType: post.boardId === 1 ? 'FREE' : 'HOT',
        isAnonymous: post.anonymous,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        scrapCreatedAt: convertDateArrayToISOString(item.hotBoardTime),
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.my-scrapped-posts {
  padding: 1rem 0;
}

.content-area {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
