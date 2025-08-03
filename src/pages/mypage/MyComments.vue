<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <CommentedPostFilter
      v-model:searchQuery="searchQuery"
      v-model:selectedBoard="selectedBoard"
      v-model:sortBy="sortBy"
      @filter="filterAndSortPosts"
    />

    <EmptyState
      v-if="filteredPosts.length === 0"
      :hasFilters="!!(searchQuery || selectedBoard)"
      :icon="'bi-chat-text'"
      :emptyText="'댓글을 작성한 게시글이 없습니다'"
      :emptySubtext="'커뮤니티에 참여해보세요.'"
      :noResultText="'검색 결과가 없습니다'"
      :noResultSubtext="'다른 검색어나 필터를 시도해보세요.'"
    />

    <div v-else>
      <CommentedPostSummary :count="filteredPosts.length" />

      <CommentedPostList
        :posts="paginatedPosts"
        @view-post="viewPost"
        @view-comment="viewMyComment"
      />

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
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import router from '@/router';
import LoadingSpinner from '@/components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import EmptyState from '@/components/mypage/mycomment/EmptyState.vue';
import Pagination from '@/components/mypage/common/Pagination.vue';

import CommentedPostFilter from '@/components/mypage/mycomment/CommentPostFilter.vue';
import CommentedPostSummary from '@/components/mypage/mycomment/CommentPostSummary.vue';
import CommentedPostList from '@/components/mypage/mycomment/CommentPostList.vue';

const loading = ref(false);
const error = ref('');
const posts = ref([]);
const searchQuery = ref('');
const selectedBoard = ref('');
const sortBy = ref('comment-date-desc');
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
        post.authorName.toLowerCase().includes(query) ||
        post.myCommentContent.toLowerCase().includes(query)
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
    const accessToken = localStorage.getItem('accessToken');

    const response = await axios.get('/api/comments/my', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const commentList = response.data.body?.data || [];

    // 각 댓글에 대해 게시글 정보를 가져오기
    const postPromises = commentList.map(async (comment) => {
      const postRes = await axios.get(`/api/posts/${comment.postId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const post = postRes.data.body.data;

      return {
        postId: post.postId,
        title: post.title,
        content: post.content,
        authorName: post.anonymous ? '익명' : `사용자 ${post.memberId}`,
        postCreatedAt: convertDateArrayToISOString(post.createdAt),
        boardType: post.boardId === 1 ? 'FREE' : 'HOT',
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        myCommentId: comment.commentId,
        myCommentContent: comment.content,
        myCommentCreatedAt: convertDateArrayToISOString(comment.createdAt),
      };
    });

    const allPosts = await Promise.all(postPromises);

    // postId로 중복 제거
    const uniquePosts = [];
    const seen = new Set();

    for (const post of allPosts) {
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
// 개별 게시글 정보 최신화
const refreshPost = async (postId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const res = await axios.get(`/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const updated = res.data.body?.data;

    // 같은 postId를 가진 모든 항목을 찾아서 업데이트
    posts.value = posts.value.map((p) => {
      if (p.postId === postId) {
        return {
          ...p,
          title: updated.title,
          content: updated.content,
          likeCount: updated.likeCount,
          commentCount: updated.commentCount,
          createdAt: convertDateArrayToISOString(updated.createdAt),
        };
      }
      return p;
    });
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR');
};

onMounted(() => {
  fetchPosts();
});
defineExpose({ refreshPost });
</script>

<style scoped></style>
