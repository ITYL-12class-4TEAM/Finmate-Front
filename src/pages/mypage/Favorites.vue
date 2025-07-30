<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <FavoritesFilter
      v-model:searchQuery="searchQuery"
      v-model:selectedType="selectedType"
      v-model:sortBy="sortBy"
      @filter="filterAndSortFavorites"
    />

    <EmptyState
      v-if="filteredFavorites.length === 0"
      :hasFilters="!!(searchQuery || selectedType)"
      :icon="'bi-star'"
      :emptyText="'즐겨찾기한 상품이 없습니다'"
      :emptySubtext="'관심 있는 금융 상품을 즐겨찾기에 추가해보세요.'"
      :noResultText="'검색 결과가 없습니다'"
      :noResultSubtext="'다른 검색어나 필터를 시도해보세요.'"
    >
      <template #action>
        <router-link to="/products" class="btn btn-primary">
          <i class="bi bi-search me-2"></i>상품 둘러보기
        </router-link>
      </template>
    </EmptyState>

    <div v-else>
      <FavoritesSummary
        :count="filteredFavorites.length"
        :selectedCount="selectedFavorites.length"
        @delete-selected="deleteSelected"
      />

      <FavoritesList
        :favorites="paginatedFavorites"
        v-model:selectedFavorites="selectedFavorites"
        @remove-favorite="removeFavorite"
        @view-detail="viewDetail"
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// 공통 컴포넌트
import PageHeader from '@/components/mypage/common/PageHeader.vue';
import LoadingSpinner from '@/components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import EmptyState from '@/components/mypage/favorite/EmptyState.vue';
import Pagination from '@/components/mypage/common/Pagination.vue';

// 즐겨찾기 전용 컴포넌트
import FavoritesFilter from '@/components/mypage/favorite/FavoriteFilters.vue';
import FavoritesSummary from '@/components/mypage/favorite/FavoritsSummary.vue';
import FavoritesList from '@/components/mypage/favorite/FavoriteList.vue';

const loading = ref(false);
const error = ref('');
const favorites = ref([]);
const currentPage = ref(1);
const itemsPerPage = 12;
const searchQuery = ref('');
const selectedType = ref('');
const sortBy = ref('name-asc');
const selectedFavorites = ref([]);

// subcategoryName을 대분류로 매핑하는 함수
const getCategoryFromSubcategory = (subcategoryName) => {
  if (!subcategoryName) return '';

  const categoryMapping = {
    연금저축: '연금',
    자유적금: '적금',
    정기예금: '예금',
    정기적금: '적금',
    정액적금: '적금',
    변동금리예금: '예금',
    복리예금: '예금',
    단리예금: '예금',
  };

  return categoryMapping[subcategoryName] || subcategoryName;
};

// 필터링된 즐겨찾기 목록
const filteredFavorites = computed(() => {
  let filtered = [...favorites.value];

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (favorite) =>
        favorite.productName.toLowerCase().includes(query) ||
        favorite.korCoNm.toLowerCase().includes(query)
    );
  }

  // 카테고리 필터 (subcategoryName 기준)
  if (selectedType.value) {
    filtered = filtered.filter(
      (favorite) =>
        getCategoryFromSubcategory(favorite.subcategoryName) ===
        selectedType.value
    );
  }

  // 정렬
  switch (sortBy.value) {
    case 'interest-desc':
      filtered.sort((a, b) => {
        const aRate = a.maxRate || a.baseRate || 0;
        const bRate = b.maxRate || b.baseRate || 0;
        return bRate - aRate;
      });
      break;
    case 'interest-asc':
      filtered.sort((a, b) => {
        const aRate = a.maxRate || a.baseRate || 0;
        const bRate = b.maxRate || b.baseRate || 0;
        return aRate - bRate;
      });
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.productName.localeCompare(b.productName));
      break;
    case 'wishlist-desc':
      filtered.sort((a, b) => b.wishlistCount - a.wishlistCount);
      break;
  }

  return filtered;
});

// 페이지네이션 계산
const totalPages = computed(() => {
  return Math.ceil(filteredFavorites.value.length / itemsPerPage);
});

const paginatedFavorites = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredFavorites.value.slice(start, end);
});

const fetchFavorites = async () => {
  loading.value = true;
  error.value = '';

  try {
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsIm1lbWJlcklkIjoxLCJpYXQiOjE3NTM4NDU0NDcsImV4cCI6MTc1Mzg0NzI0N30.GJdVOhVYgFqsYBZ2Tf50HQMJdyW_--csEe6_8_j2lq8';
    const response = await axios.get('/api/wishlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    favorites.value = response.data;
    currentPage.value = 1;
  } catch (err) {
    error.value = '즐겨찾기를 불러오는데 실패했습니다.';
    console.error('Favorites fetch error:', err);
  } finally {
    loading.value = false;
  }
};

const filterAndSortFavorites = () => {
  currentPage.value = 1; // 필터 변경 시 첫 페이지로 이동
};

const removeFavorite = async (favorite) => {
  if (!confirm('즐겨찾기에서 삭제하시겠습니까?')) return;

  try {
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsIm1lbWJlcklkIjoxLCJpYXQiOjE3NTM4NDU0NDcsImV4cCI6MTc1Mzg0NzI0N30.GJdVOhVYgFqsYBZ2Tf50HQMJdyW_--csEe6_8_j2lq8';
    await axios.delete(`/api/wishlist/${favorite.productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    favorites.value = favorites.value.filter(
      (f) => f.productId !== favorite.productId
    );
    alert('즐겨찾기에서 삭제되었습니다.');
  } catch (err) {
    alert('즐겨찾기 삭제에 실패했습니다.');
    console.error('Remove favorite error:', err);
  }
};

const deleteSelected = async () => {
  if (selectedFavorites.value.length === 0) return;
  if (
    !confirm(
      `선택한 ${selectedFavorites.value.length}개 상품을 즐겨찾기에서 삭제하시겠습니까?`
    )
  )
    return;

  try {
    const token =
      'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsIm1lbWJlcklkIjoxLCJpYXQiOjE3NTM4MDU2MTAsImV4cCI6MTc1MzgwNzQxMH0.DcRuqXxjx_OpJFcVTTKUJR2KKE2KDbFrnB-VZgQGyR0';

    // 선택된 상품들을 병렬로 삭제
    await Promise.all(
      selectedFavorites.value.map((productId) =>
        axios.delete(`/api/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );

    // UI에서 삭제된 상품들 제거
    favorites.value = favorites.value.filter(
      (f) => !selectedFavorites.value.includes(f.productId)
    );
    selectedFavorites.value = [];
    alert('선택한 상품들이 즐겨찾기에서 삭제되었습니다.');
  } catch (err) {
    alert('일부 상품 삭제에 실패했습니다.');
    console.error('Delete selected error:', err);
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
  }
};

const viewDetail = (favorite) => {
  if (favorite.externalLink) {
    window.open(favorite.externalLink, '_blank');
  } else {
    alert('상세 정보 링크가 없습니다.');
  }
};

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped></style>
