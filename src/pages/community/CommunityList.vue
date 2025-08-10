<template>
  <div class="community-list">
    <!-- 상품군 & 속성 필터 -->
    <section class="filter-section">
      <!-- 상품군 -->
      <div class="filter-group">
        <div class="filter-label">
          <i class="fas fa-filter"></i>
          상품군
        </div>
        <div class="tag-list">
          <button
            v-for="tag in productTags"
            :key="tag"
            class="tag-button"
            :class="{ selected: selectedProducts.includes(tag) }"
            @click="toggleProduct(tag)"
          >
            <i class="fas fa-hashtag"></i>{{ tag }}
          </button>
        </div>
      </div>
    </section>

    <!-- 게시글 목록 -->
    <section class="post-list">
      <div v-if="filteredPosts.length === 0" class="empty-message">
        <i class="fas fa-search"></i>
        <p>조건에 맞는 게시글이 없습니다.</p>
      </div>
      <PostCard
        v-for="post in paginatedPosts"
        v-else
        :key="post.id"
        :post="post"
        :isLiked="post.liked"
        :isScrapped="post.scraped"
        @click="goToDetailPage(post.id)"
        @like="handleLike"
        @scrap="handleScrap"
      />
    </section>

    <!-- 페이징 컨트롤 -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn prev-btn"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="page-btn next-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 페이지 정보 -->
    <div v-if="filteredPosts.length > 0" class="page-info">
      <i class="fas fa-info-circle"></i>
      총 {{ filteredPosts.length }}개 게시글 중 {{ startIndex + 1 }}-{{ endIndex }}번째
    </div>

    <!-- 플로팅 글 작성 버튼 -->
    <button class="floating-write-button" @click="goToWritePage">
      <i class="fas fa-pen"></i>
      글 쓰기
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getPostsAPI } from '@/api/posts';
import { togglePostLikeAPI } from '@/api/postLike';
import { togglePostScrapAPI } from '@/api/postScrap';
import { mockPosts } from './communityMock';
import PostCard from '@/components/community/PostCard.vue';

const router = useRouter();
const posts = ref([]);
const boardId = 1; // 자유게시판

// 페이징 관련 상태
const currentPage = ref(1);
const postsPerPage = 5;

const useMock = false;

const fetchPosts = async () => {
  try {
    posts.value = useMock ? mockPosts : await getPostsAPI(boardId);
  } catch (e) {
    console.error('게시물 불러오기 실패:', e);
    alert('게시물을 불러오지 못했습니다.');
  }
};

// 좋아요 처리
const handleLike = async (postId) => {
  try {
    const newLikedState = await togglePostLikeAPI(postId);

    // 게시글 상태 업데이트
    const post = posts.value.find((p) => p.id === postId);
    if (post) {
      post.liked = newLikedState;
      // 좋아요 수 업데이트
      if (newLikedState) {
        post.likes = (post.likes || 0) + 1;
      } else {
        post.likes = Math.max(0, (post.likes || 0) - 1);
      }
    }
  } catch (error) {
    console.error('좋아요 처리 실패:', error);
  }
};

// 스크랩 처리
const handleScrap = async (postId) => {
  try {
    const newScrappedState = await togglePostScrapAPI(postId);

    // 게시글 상태 업데이트
    const post = posts.value.find((p) => p.id === postId);
    if (post) {
      post.scraped = newScrappedState;
      // 스크랩 수 업데이트
      if (newScrappedState) {
        post.scrapCount = (post.scrapCount || 0) + 1;
      } else {
        post.scrapCount = Math.max(0, (post.scrapCount || 0) - 1);
      }
    }
  } catch (error) {
    console.error('스크랩 처리 실패:', error);
  }
};

onMounted(fetchPosts);

// 필터 옵션
const productTags = ['예금', '적금', '펀드', '보험'];
const selectedTendency = ref([]);
const selectedProducts = ref([]);

// 공통 토글 헬퍼
const toggleItem = (listRef, item) => {
  const index = listRef.value.indexOf(item);
  index === -1 ? listRef.value.push(item) : listRef.value.splice(index, 1);
};

// 필터 선택 핸들러
const toggleProduct = (t) => {
  toggleItem(selectedProducts, t);
  // 필터 변경 시 첫 페이지로 이동
  currentPage.value = 1;
};

// 필터링 로직
const filteredPosts = computed(() => {
  return posts.value.filter((post) => {
    const hasTendency =
      selectedTendency.value.length === 0 ||
      selectedTendency.value.every((t) => post.tendency?.includes(t));
    const hasProduct =
      selectedProducts.value.length === 0 || selectedProducts.value.includes(post.productType);

    return hasTendency && hasProduct;
  });
});

// 페이징 계산
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage));

const startIndex = computed(() => (currentPage.value - 1) * postsPerPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + postsPerPage, filteredPosts.value.length)
);

const paginatedPosts = computed(() => {
  return filteredPosts.value.slice(startIndex.value, endIndex.value);
});

// 페이지 번호 표시 로직 (최대 5개 페이지 번호 표시)
const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  const half = Math.floor(maxVisiblePages / 2);

  let start = Math.max(1, currentPage.value - half);
  let end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  // 끝에서부터 계산해서 시작점 조정
  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// 페이지 변경
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// 필터 변경 시 첫 페이지로 이동하는 watcher
watch(
  [selectedTendency, selectedProducts],
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

// 라우팅
const goToWritePage = () => router.push({ name: 'CommunityWrite' });
const goToDetailPage = (id) => router.push({ name: 'CommunityDetail', params: { id } });
</script>

<style scoped>
.community-list {
  padding: 1rem;
  max-width: 48rem;
  margin: 0 auto;
  padding-bottom: 5rem; /* 플로팅 버튼을 위한 하단 여백 */
}

.filter-section {
  padding: 1rem;
  border: 0.125rem solid var(--color-bg-light);
  border-radius: 1.25rem;
  margin-bottom: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label i {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag-button {
  font-size: 0.8rem;
  padding: 0.4rem 1rem;
  border-radius: 1.25rem;
  border: 0.125rem solid var(--color-bg-light);
  background-color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none; /* 포커스 아웃라인 제거 */
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-button i {
  font-size: 0.7rem;
}

.tag-button:hover {
  border-color: var(--color-main);
  background-color: var(--color-bg-light);
}

.tag-button:focus {
  outline: none; /* 포커스 시에도 아웃라인 제거 */
}

.tag-button.selected {
  background-color: var(--color-main);
  border-color: var(--color-main);
  color: white;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  min-height: 25rem;
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

/* 플로팅 글 작성 버튼 */
.floating-write-button {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: 5.5rem;
  height: 3rem;
  padding: 0 1.5rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  outline: none; /* 포커스 아웃라인 제거 */
}

.floating-write-button i {
  font-size: 0.875rem;
}

.floating-write-button:hover {
  background-color: var(--color-sub);
  transform: translateX(-50%) translateY(-0.125rem) scale(1.05);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
}

.floating-write-button:focus {
  outline: none; /* 포커스 시에도 아웃라인 제거 */
}

.floating-write-button:active {
  transform: translateX(-50%) translateY(0) scale(0.95);
}

/* 페이징 스타일 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0 1rem 0;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0.0625rem solid #e5e7eb;
  background-color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none; /* 포커스 아웃라인 제거 */
}

.page-btn i {
  font-size: 0.875rem;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-main);
  background-color: var(--color-bg-light);
  color: var(--color-main);
}

.page-btn:focus {
  outline: none; /* 포커스 시에도 아웃라인 제거 */
}

.page-btn.active {
  background-color: var(--color-main);
  border-color: var(--color-main);
  color: white;
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.prev-btn,
.next-btn {
  font-size: 1rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

/* 페이지 정보 */
.page-info {
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.page-info i {
  font-size: 0.75rem;
  color: var(--color-sub);
}

/* 반응형 */
@media (max-width: 48rem) {
  .community-list {
    padding: 0.5rem;
    padding-bottom: 5rem; /* 모바일에서도 플로팅 버튼 여백 유지 */
  }

  .filter-section {
    padding: 0.75rem;
  }

  .filter-label {
    font-size: 0.8125rem;
  }

  .filter-label i {
    font-size: 0.8125rem;
  }

  .tag-button {
    font-size: 0.75rem;
    padding: 0.3rem 0.8rem;
  }

  .tag-button i {
    font-size: 0.65rem;
  }

  .pagination {
    gap: 0.25rem;
    margin: 1.5rem 0 0.5rem 0;
  }

  .page-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.8125rem;
  }

  .page-btn i {
    font-size: 0.8125rem;
  }

  .page-info {
    font-size: 0.6875rem;
  }

  .page-info i {
    font-size: 0.6875rem;
  }

  .post-list {
    min-height: 21.875rem;
  }

  .empty-message {
    font-size: 0.8125rem;
  }

  .empty-message i {
    font-size: 1.75rem;
  }

  /* 모바일에서 플로팅 버튼 크기 조정 */
  .floating-write-button {
    min-width: 5rem;
    height: 2.75rem;
    bottom: 1.5rem;
    font-size: 0.9rem;
    padding: 0 1.25rem;
    gap: 0.375rem;
  }

  .floating-write-button i {
    font-size: 0.8125rem;
  }

  .floating-write-button:hover {
    transform: translateX(-50%) translateY(-0.125rem) scale(1.05);
  }

  .floating-write-button:active {
    transform: translateX(-50%) translateY(0) scale(0.95);
  }
}
</style>
