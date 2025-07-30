<template>
  <PageHeader title="내 스크랩" />

  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <ScrappedPostFilter
      v-model:searchQuery="searchQuery"
      v-model:selectedBoard="selectedBoard"
      v-model:sortBy="sortBy"
      @filter="filterAndSortPosts"
    />

    <EmptyState
      v-if="filteredPosts.length === 0"
      :hasFilters="!!(searchQuery || selectedBoard)"
      :icon="'bi-bookmark'"
      :emptyText="'스크랩한 게시글이 없습니다'"
      :emptySubtext="'마음에 드는 게시글을 스크랩해보세요.'"
      :noResultText="'검색 결과가 없습니다'"
      :noResultSubtext="'다른 검색어나 필터를 시도해보세요.'"
    />

    <div v-else>
      <ScrappedPostActions :filteredCount="filteredPosts.length" />

      <ScrappedPostList :posts="paginatedPosts" @view-post="viewPost" />

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
import axios from 'axios';

import PageHeader from '@/components/mypage/common/PageHeader.vue';
import LoadingSpinner from '@/components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import EmptyState from '@/components/mypage/myscrap/EmptyState.vue';
import Pagination from '@/components/mypage/common/Pagination.vue';
import ScrappedPostFilter from '@/components/mypage/myscrap/ScrapPostFilter.vue';
import ScrappedPostActions from '@/components/mypage/myscrap/ScrapPostAction.vue';
import ScrappedPostList from '@/components/mypage/myscrap/ScrapPostList.vue';

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

// 날짜 → 표시용 문자열
const formatDate = (date) => {
  const d = toDate(date);
  return d.toLocaleDateString('ko-KR');
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
    filtered = filtered.filter(
      (post) => post.boardType === selectedBoard.value
    );
  }

  switch (sortBy.value) {
    case 'scrap-date-desc':
      filtered.sort(
        (a, b) => toDate(b.scrapCreatedAt) - toDate(a.scrapCreatedAt)
      );
      break;
    case 'post-date-desc':
      filtered.sort(
        (a, b) => toDate(b.postCreatedAt) - toDate(a.postCreatedAt)
      );
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
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsIm1lbWJlcklkIjoxLCJpYXQiOjE3NTM2OTc1OTAsImV4cCI6MTc1MzY5OTM5MH0.T-NMfkuNL-32qmy1LjN5ls9ElsX-9l9H5MJgrpisIEw';

    const response = await axios.get('/api/scraps/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const apiData = response.data.body?.data || response.data;
    const postPromises = apiData.map(async (item) => {
      const postRes = await axios.get(`/api/posts/${item.postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const post = postRes.data.body.data;

      return {
        postId: post.postId,
        title: post.title,
        content: post.content,
        authorName: post.anonymous ? '익명' : `사용자 ${post.memberId}`,
        postCreatedAt: convertDateArrayToISOString(post.createdAt),
        boardType: post.boardId === 1 ? 'FREE' : 'HOT',
        categoryTag: post.categoryTag,
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
    console.error('Scraps fetch error:', err);
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
  alert(
    `"${post.title}" 상세보기\n\n작성자: ${post.authorName}\n카테고리: ${
      getCategoryName(post.categoryTag) || '없음'
    }\n작성일: ${formatDate(post.postCreatedAt)}\n스크랩일: ${formatDate(
      post.scrapCreatedAt
    )}\n좋아요: ${post.likeCount}개\n댓글: ${post.commentCount}개`
  );
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const getCategoryName = (categoryTag) => {
  const names = {
    QUESTION: '질문',
    RECOMMEND: '추천',
    EXPERIENCE: '후기',
    FREE: '자유',
  };
  return names[categoryTag] || categoryTag;
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

@media (max-width: 992px) {
  .content-area {
    padding: 1rem;
  }
}
</style>
