<template>
  <div class="recent-view-page">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-icon">
          <i class="fa-regular fa-clock fa-spin"></i>
        </div>
        <p class="loading-text">최근 조회 내역을 불러오는 중...</p>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h4 class="error-title">데이터를 불러올 수 없습니다</h4>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="fetchRecentProducts">
          <i class="fa-solid fa-arrow-rotate-right"></i>
          <span>다시 시도</span>
        </button>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div v-else class="main-content">
      <!-- 요약 정보 -->
      <RecentViewSummary
        :count="filteredProducts.length"
        :selected-count="selectedRecent.length"
        @delete-selected="deleteSelected"
        @delete-all="clearAllHistory"
      />

      <!-- 상품 리스트 -->
      <RecentViewList
        :selected-recent="selectedRecent"
        :products="paginatedProducts"
        :favorite-product-ids="favoriteProductIds"
        @update:selected-recent="updateSelectedRecent"
        @click-recent="clickRecent"
        @remove-from-history="removeFromHistory"
      />
      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination-container">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import router from '@/router';
import { useModal } from '@/composables/useModal';
import { useToast } from '@/composables/useToast';
const { showModal } = useModal();
const { showToast } = useToast();

// API
import { recentViewAPI } from '@/api/recentView';

// 컴포넌트
import Pagination from '@/components/mypage/common/Pagination.vue';
import RecentViewSummary from '@/components/mypage/recentview/RecentViewSummary.vue';
import RecentViewList from '@/components/mypage/recentview/RecentViewList.vue';

// 상태 관리
const loading = ref(false);
const error = ref('');
const recentProducts = ref([]);
const currentPage = ref(1);
const itemsPerPage = 5;
const selectedRecent = ref([]);
const favoriteProductIds = ref(new Set());
const searchQuery = ref('');

// 필터 상태
const currentFilters = ref({
  categories: [],
  period: 'all',
  sort: 'recent',
});
const updateSelectedRecent = (newSelected) => {
  selectedRecent.value = newSelected;
};
// filteredProducts computed를 다음과 같이 수정
const filteredProducts = computed(() => {
  const products = recentProducts.value;
  if (!products || !Array.isArray(products)) {
    return [];
  }

  if (products.length === 0) {
    return [];
  }

  let filtered = [...recentProducts.value];

  // 검색 필터 추가
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((product) => {
      const productName = (product.productName || '').toLowerCase();
      const companyName = (product.korCoNm || '').toLowerCase();
      return productName.includes(query) || companyName.includes(query);
    });
  }

  // 카테고리 필터
  if (currentFilters.value.categories?.length > 0) {
    filtered = filtered.filter((product) => {
      const category = getCategoryFromSubcategory(product.subcategoryName);
      return currentFilters.value.categories.includes(category.toLowerCase());
    });
  }

  // 기간 필터 (기존 코드 유지)
  if (currentFilters.value.period !== 'all') {
    const now = new Date();
    filtered = filtered.filter((product) => {
      if (!product.viewedAt) return false;

      const viewed = new Date(product.viewedAt);
      const diffInDays = Math.floor((now - viewed) / (1000 * 60 * 60 * 24));

      switch (currentFilters.value.period) {
        case 'today':
          return diffInDays === 0;
        case 'week':
          return diffInDays <= 7;
        case 'month':
          return diffInDays <= 30;
        default:
          return true;
      }
    });
  }

  // 정렬
  switch (currentFilters.value.sort) {
    case 'name':
      filtered.sort((a, b) => a.productName.localeCompare(b.productName));
      break;
    case 'company':
      filtered.sort((a, b) => a.korCoNm.localeCompare(b.korCoNm));
      break;
    case 'popular':
      // 인기순 정렬 로직이 있다면 여기에 추가
      // 예: filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      // 없다면 최신순으로 폴백
      filtered.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
      break;
    case 'recent':
    default:
      filtered.sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt));
      break;
  }

  return filtered;
});

// 페이지네이션 계산
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage);
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProducts.value.slice(start, end);
});

// 유틸리티 함수
const getCategoryFromSubcategory = (subcategoryName) => {
  if (!subcategoryName) return '';

  const categoryMapping = {
    // 예금 관련
    정기예금: 'deposit',
    변동금리예금: 'deposit',
    복리예금: 'deposit',
    단리예금: 'deposit',

    // 적금 관련
    연금저축: 'pension',
    자유적금: 'savings',
    정기적금: 'savings',
    정액적금: 'savings',

    // 기타 가능한 카테고리들
    펀드: 'fund',
    대출: 'loan',
    보험: 'insurance',
  };

  return categoryMapping[subcategoryName] || 'fund';
};

const clickRecent = async (recent) => {
  const subcategory = recent.subcategoryName;
  const productId = recent.productId;
  const saveTrm = recent.saveTrm;
  const intrRateType = recent.intrRateType;
  const rsrvValue = recent.rstvValue;

  let routePath = '';

  if (subcategory === '정기예금') {
    routePath = `/products/deposit/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}`;
  } else if (subcategory === '자유적금') {
    routePath = `/products/savings/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}&rsrvType=${rsrvValue}`;
  } else if (subcategory === '연금저축') {
    routePath = `/products/pension/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}`;
  } else {
    routePath = `/products/unknown/${productId}`;
  }

  try {
    await recentViewAPI.saveRecentView(productId, saveTrm, intrRateType, rsrvValue);
    router.push(routePath);
  } catch (err) {
    console.error('최근 본 상품 저장 실패:', err);
    router.push(routePath);
  }
};

const fetchRecentProducts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await recentViewAPI.getRecentView();

    if (response.data && response.data.body && Array.isArray(response.data.body.data)) {
      recentProducts.value = response.data.body.data;
    } else {
      console.warn('예상하지 못한 API 응답 구조:', response.data);
      recentProducts.value = [];
    }

    currentPage.value = 1;
  } catch (err) {
    error.value = '최근 본 상품을 불러오는데 실패했습니다.';
    console.error('Recent products fetch error:', err);
    recentProducts.value = [];
  } finally {
    loading.value = false;
  }
};

const removeFromHistory = async (productId) => {
  const confirmed = await showModal('이 상품을 최근 본 상품에서 삭제하시겠습니까?');
  if (!confirmed) return;

  try {
    await recentViewAPI.deleteRecentView(productId);

    if (Array.isArray(recentProducts.value)) {
      recentProducts.value = recentProducts.value.filter((p) => p.productId !== productId);
    }

    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value = currentPage.value - 1;
    }

    showToast('상품이 삭제되었습니다.', 'success');
  } catch (err) {
    showToast('상품 삭제에 실패했습니다.', 'error');
    console.error('Remove from history error:', err);
  }
};

const deleteSelected = async () => {
  if (selectedRecent.value.length === 0) return;

  const confirmed = await showModal(
    `선택한 ${selectedRecent.value.length}개 상품을 삭제하시겠습니까?`
  );
  if (!confirmed) return;

  try {
    await Promise.all(
      selectedRecent.value.map((productId) => recentViewAPI.deleteRecentView(productId))
    );

    if (Array.isArray(recentProducts.value)) {
      recentProducts.value = recentProducts.value.filter(
        (p) => !selectedRecent.value.includes(p.productId)
      );
    }

    selectedRecent.value = [];
    showToast('선택한 상품들이 삭제되었습니다!', 'success');

    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value -= 1;
    }
  } catch (err) {
    showToast('일부 삭제에 실패했습니다.', 'error');
    console.error('Delete selected error:', err);
  }
};

const clearAllHistory = async () => {
  const confirmed = await showModal(`모든 최근 본 상품을 삭제하시겠습니까?`);
  if (!confirmed) return;

  try {
    await recentViewAPI.deleteAllRecentView();

    recentProducts.value = [];
    currentPage.value = 1;
    showToast('모든 최근 본 상품이 삭제되었습니다.', 'success');
  } catch (err) {
    showToast('전체 삭제에 실패했습니다.', 'error');
    console.error('Clear all history error:', err);
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
  }
};

onMounted(() => {
  fetchRecentProducts();
});
</script>

<style scoped>
.recent-view-page {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--color-white);
  min-height: 100vh;
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 31.25rem; /* 500px */
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
  background: var(--color-white);
  border-radius: 1rem;
  border: 0.0625rem solid var(--color-bg-light);
  box-shadow: 0 0.125rem 0.75rem -0.25rem rgba(45, 51, 107, 0.05);
}

.spinner-icon {
  margin-bottom: 1rem;
}

.spinner-icon i {
  font-size: 2rem;
  color: var(--color-main);
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 0.875rem;
  color: var(--color-sub);
  font-weight: 500;
  margin: 0 0 1rem 0;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.loading-dots span {
  width: 0.375rem;
  height: 0.375rem;
  background: var(--color-main);
  border-radius: 50%;
  animation: loadingDots 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}
.loading-dots span:nth-child(3) {
  animation-delay: -0.32s;
}

@keyframes loadingDots {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 에러 상태 */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 31.25rem; /* 500px */
}

.error-content {
  text-align: center;
  padding: 2rem;
  background: var(--color-white);
  border-radius: 1rem;
  border: 0.0625rem solid var(--color-bg-light);
  box-shadow: 0 0.125rem 0.75rem -0.25rem rgba(45, 51, 107, 0.05);
  max-width: 25rem; /* 400px */
}

.error-icon {
  margin-bottom: 1rem;
}

.error-icon i {
  font-size: 2rem;
  color: #ef4444;
}

.error-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 0.875rem;
  color: var(--color-sub);
  margin-bottom: 1.5rem;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--color-sub);
  transform: translateY(-0.0625rem);
}

.retry-btn i {
  font-size: 0.875rem;
}

/* 메인 콘텐츠 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 페이지네이션 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--color-white);
  border-radius: 1rem;
  border: 0.0625rem solid var(--color-bg-light);
  box-shadow: 0 0.125rem 0.75rem -0.25rem rgba(45, 51, 107, 0.05);
}

/* 모바일 최적화 - 작은 화면에서 패딩 조정 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .recent-view-page {
    padding: 0.75rem;
  }

  .main-content {
    gap: 1.25rem;
  }

  .loading-spinner,
  .error-content {
    padding: 1.5rem;
  }

  .spinner-icon i,
  .error-icon i {
    font-size: 1.5rem;
  }

  .loading-text {
    font-size: 0.8rem;
  }

  .error-title {
    font-size: 1rem;
  }

  .error-message {
    font-size: 0.8rem;
  }

  .retry-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8rem;
  }

  .pagination-container {
    padding: 0.75rem;
  }
}

/* 접근성 최적화 */
@media (prefers-reduced-motion: reduce) {
  .spinner-icon i,
  .loading-dots span {
    animation: none;
  }

  .retry-btn {
    transition: none;
  }
}
</style>
