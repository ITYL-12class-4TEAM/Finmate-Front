<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <FavoritesFilter
      v-model:search-query="searchQuery"
      v-model:selected-type="selectedType"
      v-model:sort-by="sortBy"
      @filter="filterAndSortFavorites"
    />

    <div>
      <FavoritesSummary :count="filteredFavorites.length" />

      <FavoritesList
        :favorites="paginatedFavorites"
        @click-favorite="clickFavorite"
        @remove-favorite="removeFavorite"
        @view-detail="viewDetail"
      />

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
import { wishlistAPI } from '@/api/favorite';
import { useModal } from '@/composables/useModal';
import { useToast } from '@/composables/useToast';
const { showToast } = useToast();
const { showModal } = useModal();

// 공통 컴포넌트
import LoadingSpinner from '@/components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '@/components/mypage/common/ErrorAlert.vue';
import Pagination from '@/components/mypage/common/Pagination.vue';

// 즐겨찾기 전용 컴포넌트
import FavoritesFilter from '@/components/mypage/favorite/FavoriteFilters.vue';
import FavoritesSummary from '@/components/mypage/favorite/FavoritsSummary.vue';
import FavoritesList from '@/components/mypage/favorite/FavoriteList.vue';

const loading = ref(false);
const error = ref('');
const favorites = ref([]); // 빈 배열로 초기화
const currentPage = ref(1);
const itemsPerPage = 12;
const searchQuery = ref('');
const selectedType = ref('');
const sortBy = ref('name-asc');

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

const clickFavorite = (favorite) => {
  const subcategory = favorite.subcategoryName;
  const productId = favorite.productId;
  const saveTrm = favorite.saveTrm;
  const intrRateType = favorite.intrRateType;
  const rsrvValue = favorite.rstvValue;

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

  router.push(routePath);
};

const filteredFavorites = computed(() => {
  if (!Array.isArray(favorites.value)) {
    console.warn('favorites.value is not an array:', favorites.value);
    return [];
  }

  let filtered = [...favorites.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (favorite) =>
        favorite.productName?.toLowerCase().includes(query) ||
        favorite.korCoNm?.toLowerCase().includes(query)
    );
  }

  if (selectedType.value) {
    filtered = filtered.filter(
      (favorite) => getCategoryFromSubcategory(favorite.subcategoryName) === selectedType.value
    );
  }

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
      filtered.sort((a, b) => a.productName?.localeCompare(b.productName) || 0);
      break;
    case 'wishlist-desc':
      filtered.sort((a, b) => (b.wishlistCount || 0) - (a.wishlistCount || 0));
      break;
  }

  return filtered;
});

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
    const response = await wishlistAPI.getList();

    console.log('API 응답:', response);
    console.log('응답 타입:', typeof response);

    // API 응답 구조에 따른 데이터 추출
    if (response.body && Array.isArray(response.body.data)) {
      favorites.value = response.body.data;
    } else if (Array.isArray(response.data)) {
      favorites.value = response.data;
    } else if (Array.isArray(response)) {
      favorites.value = response;
    } else {
      console.warn('예상하지 못한 API 응답 구조:', response);
      favorites.value = [];
    }

    currentPage.value = 1;
  } catch (err) {
    error.value = '즐겨찾기를 불러오는데 실패했습니다.';
    console.error('Favorites fetch error:', err);
    favorites.value = []; // 에러 시에도 배열로 초기화
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (favorite) => {
  const confirmed = await showModal('즐겨찾기에서 삭제하시겠습니까?');
  if (!confirmed) return;

  try {
    await wishlistAPI.remove(favorite.productId);

    // 배열인지 확인 후 필터링
    if (Array.isArray(favorites.value)) {
      favorites.value = favorites.value.filter((f) => f.productId !== favorite.productId);
    }
    showToast('삭제되었습니다!', 'success');
  } catch (err) {
    showToast('즐겨찾기 삭제에 실패했습니다.', 'error');
    console.error('Remove favorite error:', err);
  }
};

const filterAndSortFavorites = () => {
  currentPage.value = 1; // 필터 변경 시 첫 페이지로 이동
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
    showToast('상세 정보 링크가 없습니다.', 'error');
  }
};

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped></style>
