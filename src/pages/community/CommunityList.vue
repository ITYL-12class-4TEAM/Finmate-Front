<template>
  <div class="community-list">
    <section class="filter-section">
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
      <div v-if="loading" class="empty-message">로딩 중…</div>

      <div v-else-if="displayPosts.length === 0" class="empty-message">
        <i class="fas fa-search"></i>
        <p>조건에 맞는 게시글이 없습니다.</p>
      </div>

      <template v-else>
        <PostCard
          v-for="post in displayPosts"
          :key="post.id"
          :post="post"
          :is-liked="post.liked"
          :is-scrapped="post.scraped"
          @click="goToDetailPage(post.id)"
          @like="handleLike"
          @scrap="handleScrap"
        />
      </template>
    </section>

    <Pagination
      v-if="!loading && totalPages > 1"
      :total-pages="totalPages"
      :current-page="currentPage"
      @page-change="changePage"
    />

    <!-- 페이지 정보 -->
    <div v-if="!loading && totalElements > 0" class="page-info">
      <i class="fas fa-info-circle"></i>
      총 {{ totalElements }}개 게시글 중 {{ (currentPage - 1) * postsPerPage + 1 }}-{{
        Math.min(currentPage * postsPerPage, totalElements)
      }}번째
    </div>

    <!-- 플로팅 글 작성 버튼 -->
    <button class="floating-write-button" @click="goToWritePage">
      <i class="fas fa-pen"></i>
      글 쓰기
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getPostsAPI } from '@/api/posts';
import { togglePostLikeAPI } from '@/api/postLike';
import { togglePostScrapAPI } from '@/api/postScrap';
import PostCard from '@/components/community/PostCard.vue';
import Pagination from '@/components/products/common/Pagination.vue';

const router = useRouter();
const posts = ref([]);
const loading = ref(false);

// 페이징 관련 상태
const currentPage = ref(1);
const postsPerPage = 5;
const totalElements = ref(0);
const totalPages = ref(1);

const fetchPosts = async () => {
  try {
    loading.value = true;
    const {
      content,
      totalElements: tEl,
      totalPages: tPg,
    } = await getPostsAPI({
      page: currentPage.value,
      size: postsPerPage,
    });
    posts.value = content;
    totalElements.value = tEl;
    totalPages.value = tPg;
  } catch (e) {
    console.error('게시물 불러오기 실패:', e);
    alert('게시물을 불러오지 못했습니다.');
  } finally {
    loading.value = false;
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
const selectedProducts = ref([]);

const displayPosts = computed(() => {
  if (selectedProducts.value.length === 0) return posts.value;
  return posts.value.filter((p) => selectedProducts.value.includes(p.productType));
});

// 공통 토글 헬퍼
const toggleItem = (listRef, item) => {
  const index = listRef.value.indexOf(item);
  index === -1 ? listRef.value.push(item) : listRef.value.splice(index, 1);
};

// 필터 선택 핸들러
const toggleProduct = (t) => {
  toggleItem(selectedProducts, t);
  currentPage.value = 1;
};

// 페이지 변경
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// 페이지/필터 변경 시 재호출
watch(currentPage, fetchPosts);

// 라우팅
const goToWritePage = () => router.push({ name: 'CommunityWrite' });
const goToDetailPage = (id) => router.push({ name: 'CommunityDetail', params: { id } });
</script>

<style scoped>
.community-list {
  padding: 1rem;
  max-width: 48rem;
  margin: 0 auto;
  padding-bottom: 5rem;
}

.filter-section {
  padding: 1rem;
  border: 0.125rem solid var(--color-main);
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
  outline: none;
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
  outline: none;
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
  min-height: 37.5rem;
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
  outline: none;
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
  outline: none;
}

.floating-write-button:active {
  transform: translateX(-50%) translateY(0) scale(0.95);
}

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
  outline: none;
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
  outline: none;
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

@media (max-width: 26.875rem) {
  .community-list {
    padding: 0.5rem;
    padding-bottom: 5rem;
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
