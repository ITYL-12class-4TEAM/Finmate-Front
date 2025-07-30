<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else></div>

  <div v-else>
    <RecentViewSummary
      :count="recentProducts.length"
      :selectedCount="selectedRecent.length"
      @delete-selected="deleteSelected"
      @delete-all="clearAllHistory"
    />

    <RecentViewList
      :products="paginatedProducts"
      :favoriteProductIds="favoriteProductIds"
      v-model:selectedRecent="selectedRecent"
      @remove-from-history="removeFromHistory"
      @view-detail="viewProductDetail"
    />

    <Pagination
      v-if="totalPages > 1"
      :currentPage="currentPage"
      :totalPages="totalPages"
      @change-page="changePage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// 공통 컴포넌트
import PageHeader from '../../components/mypage/common/pageHeader.vue';
import LoadingSpinner from '../../components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '../../components/mypage/common/ErrorAlert.vue';
import Pagination from '../../components/mypage/common/Pagination.vue';

// 최근 본 상품 전용 컴포넌트
import RecentViewSummary from '../../components/mypage/recentview/RecentViewSummary.vue';
import RecentViewList from '../../components/mypage/recentview/RecentViewList.vue';

const loading = ref(false);
const error = ref('');
const recentProducts = ref([]);
const currentPage = ref(1);
const itemsPerPage = 15;
const selectedRecent = ref([]);
const favoriteProductIds = ref(new Set());

// ✅ 토큰 관리 함수
const getAuthToken = () => {
  return 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsIm1lbWJlcklkIjoxLCJpYXQiOjE3NTM3NjI2ODYsImV4cCI6MTc1Mzc2NDQ4Nn0.M63yhK9aSlBzDgtk0kXZao4TZMOdTjWx2b8DL8Nosnc';
};

// 페이지네이션 계산
const totalPages = computed(() => {
  return Math.ceil(recentProducts.value.length / itemsPerPage);
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return recentProducts.value.slice(start, end);
});

// ✅ 최근 본 상품과 즐겨찾기 함께 가져오기
const fetchRecentProducts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const token = getAuthToken();

    // 병렬로 두 API 호출
    const [recentResponse] = await Promise.all([
      axios.get('/api/recent-viewed', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    recentProducts.value = recentResponse.data || [];
    currentPage.value = 1;
  } catch (err) {
    error.value = '최근 본 상품을 불러오는데 실패했습니다.';
    console.error('Recent products fetch error:', err);
  } finally {
    loading.value = false;
  }
};

const removeFromHistory = async (productId) => {
  if (!confirm('이 상품을 최근 본 상품에서 삭제하시겠습니까?')) return;

  try {
    const token = getAuthToken();
    await axios.delete(`/api/recent-viewed/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    recentProducts.value = recentProducts.value.filter(
      (p) => p.productId !== productId
    );

    if (paginatedProducts.value.length === 0 && currentPage.value > 1) {
      currentPage.value = currentPage.value - 1;
    }

    alert('상품이 삭제되었습니다.');
  } catch (err) {
    alert('상품 삭제에 실패했습니다.');
    console.error('Remove from history error:', err);
  }
};

const deleteSelected = async () => {
  if (selectedRecent.value.length === 0) return;
  if (
    !confirm(`선택한 ${selectedRecent.value.length}개 상품을 삭제하시겠습니까?`)
  )
    return;

  try {
    const token = getAuthToken();
    await Promise.all(
      selectedRecent.value.map((productId) =>
        axios.delete(`/api/recent-viewed/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );

    recentProducts.value = recentProducts.value.filter(
      (p) => !selectedRecent.value.includes(p.productId)
    );
    selectedRecent.value = [];
    alert('선택한 상품들이 삭제되었습니다.');
  } catch (err) {
    alert('일부 상품 삭제에 실패했습니다.');
  }
};

const clearAllHistory = async () => {
  if (!confirm('모든 최근 본 상품을 삭제하시겠습니까?')) return;

  try {
    const token = getAuthToken();
    await axios.delete('/api/recent-viewed/all', {
      headers: { Authorization: `Bearer ${token}` },
    });

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
