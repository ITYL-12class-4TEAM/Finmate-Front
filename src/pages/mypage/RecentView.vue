<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <RecentViewSummary
      :count="recentProducts.length"
      :selected-count="selectedRecent.length"
      @delete-selected="deleteSelected"
      @delete-all="clearAllHistory"
    />

    <RecentViewList
      v-model:selected-recent="selectedRecent"
      :products="paginatedProducts"
      :favorite-product-ids="favoriteProductIds"
      @click-recent="clickRecent"
      @remove-from-history="removeFromHistory"
    />

    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @change-page="changePage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import router from '@/router';

// 공통 컴포넌트
import LoadingSpinner from '../../components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '../../components/mypage/common/ErrorAlert.vue';
import Pagination from '../../components/mypage/common/Pagination.vue';
import { recentViewAPI } from '@/api/recentView';

// 최근 본 상품 전용 컴포넌트
import RecentViewSummary from '../../components/mypage/recentview/RecentViewSummary.vue';
import RecentViewList from '../../components/mypage/recentview/RecentViewList.vue';

const loading = ref(false);
const error = ref('');
const recentProducts = ref([]); // 빈 배열로 초기화
const currentPage = ref(1);
const itemsPerPage = 15;
const selectedRecent = ref([]);
const favoriteProductIds = ref(new Set());

// 페이지네이션 계산
const totalPages = computed(() => {
  return Math.ceil(recentProducts.value.length / itemsPerPage);
});

const paginatedProducts = computed(() => {
  // 배열인지 확인
  if (!Array.isArray(recentProducts.value)) {
    console.warn('recentProducts.value is not an array:', recentProducts.value);
    return [];
  }

  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return recentProducts.value.slice(start, end);
});

const clickRecent = (recent) => {
  const subcategory = recent.subcategoryName;
  const productId = recent.productId;
  const saveTrm = recent.saveTrm;
  const intrRateType = recent.intrRateType;
  const rsrvValue = recent.rstvValue;

  let routePath = '';

  if (subcategory === '정기예금') {
    routePath = `/products/deposit/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}`;
  } else if (subcategory === '자유적금') {
    routePath = `/products/saving/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}&rsrvType=${rsrvValue}`;
  } else if (subcategory === '연금저축') {
    routePath = `/products/pension/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}`;
  } else {
    routePath = `/products/unknown/${productId}`;
  }

  router.push(routePath);
};

// 최근 본 상품 가져오기
const fetchRecentProducts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await recentViewAPI.getRecentView();

    if (response.data && response.data.body && Array.isArray(response.data.body.data)) {
      recentProducts.value = response.data.body.data;
    } else {
      console.warn('예상하지 못한 API 응답 구조:', response.data);
      if (response.data && response.data.body) {
        console.log('body 내용:', response.data.body);
      }
      recentProducts.value = [];
    }

    currentPage.value = 1;
  } catch (err) {
    error.value = '최근 본 상품을 불러오는데 실패했습니다.';
    console.error('Recent products fetch error:', err);
    console.error('Error response:', err.response?.data);
    recentProducts.value = []; // 에러 시에도 배열로 초기화
  } finally {
    loading.value = false;
  }
};

const removeFromHistory = async (productId) => {
  if (!confirm('이 상품을 최근 본 상품에서 삭제하시겠습니까?')) return;

  try {
    await recentViewAPI.deleteRecentView(productId);

    // 배열인지 확인 후 필터링
    if (Array.isArray(recentProducts.value)) {
      recentProducts.value = recentProducts.value.filter((p) => p.productId !== productId);
    }

    // 현재 페이지에 상품이 없으면 이전 페이지로 이동
    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value = currentPage.value - 1;
    }
  } catch (err) {
    alert('상품 삭제에 실패했습니다.');
    console.error('Remove from history error:', err);
  }
};

const deleteSelected = async () => {
  if (selectedRecent.value.length === 0) return;
  if (!confirm(`선택한 ${selectedRecent.value.length}개 상품을 삭제하시겠습니까?`)) return;

  try {
    await Promise.all(
      selectedRecent.value.map((productId) => recentViewAPI.deleteRecentView(productId))
    );

    // 배열인지 확인 후 필터링
    if (Array.isArray(recentProducts.value)) {
      recentProducts.value = recentProducts.value.filter(
        (p) => !selectedRecent.value.includes(p.productId)
      );
    }

    selectedRecent.value = [];
  } catch (err) {
    alert('일부 상품 삭제에 실패했습니다.');
    console.error('Delete selected error:', err);
  }
};

const clearAllHistory = async () => {
  if (!confirm('모든 최근 본 상품을 삭제하시겠습니까?')) return;

  try {
    await recentViewAPI.deleteAllRecentView();

    recentProducts.value = [];
    currentPage.value = 1;
    alert('모든 최근 본 상품이 삭제되었습니다.');
  } catch (err) {
    alert('전체 삭제에 실패했습니다.');
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

<style scoped></style>
