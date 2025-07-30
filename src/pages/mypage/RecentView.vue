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

// 최근 본 상품 가져오기
const fetchRecentProducts = async () => {
  loading.value = true;
  error.value = '';

  try {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      error.value = '로그인이 필요합니다.';
      loading.value = false;
      return;
    }

    console.log('토큰:', accessToken);

    const response = await axios.get('/api/recent-viewed', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('API 응답:', response.data);
    console.log('응답 타입:', typeof response.data);
    console.log('배열인가?', Array.isArray(response.data));

    // API 응답 구조에 따른 데이터 추출
    if (Array.isArray(response.data)) {
      recentProducts.value = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      // 응답이 { data: [...] } 형태인 경우
      recentProducts.value = response.data.data;
    } else if (response.data && Array.isArray(response.data.items)) {
      // 응답이 { items: [...] } 형태인 경우
      recentProducts.value = response.data.items;
    } else if (
      response.data &&
      response.data.body &&
      Array.isArray(response.data.body)
    ) {
      // 응답이 { header: {...}, body: [...] } 형태인 경우
      recentProducts.value = response.data.body;
    } else if (
      response.data &&
      response.data.body &&
      Array.isArray(response.data.body.data)
    ) {
      // 응답이 { header: {...}, body: { data: [...] } } 형태인 경우
      recentProducts.value = response.data.body.data;
    } else if (
      response.data &&
      response.data.body &&
      Array.isArray(response.data.body.items)
    ) {
      // 응답이 { header: {...}, body: { items: [...] } } 형태인 경우
      recentProducts.value = response.data.body.items;
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
    const accessToken = localStorage.getItem('accessToken');

    await axios.delete(`/api/recent-viewed/${productId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 배열인지 확인 후 필터링
    if (Array.isArray(recentProducts.value)) {
      recentProducts.value = recentProducts.value.filter(
        (p) => p.productId !== productId
      );
    }

    // 현재 페이지에 상품이 없으면 이전 페이지로 이동
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
    const accessToken = localStorage.getItem('accessToken');

    await Promise.all(
      selectedRecent.value.map((productId) =>
        axios.delete(`/api/recent-viewed/${productId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      )
    );

    // 배열인지 확인 후 필터링
    if (Array.isArray(recentProducts.value)) {
      recentProducts.value = recentProducts.value.filter(
        (p) => !selectedRecent.value.includes(p.productId)
      );
    }

    selectedRecent.value = [];
    alert('선택한 상품들이 삭제되었습니다.');
  } catch (err) {
    alert('일부 상품 삭제에 실패했습니다.');
    console.error('Delete selected error:', err);
  }
};

const clearAllHistory = async () => {
  if (!confirm('모든 최근 본 상품을 삭제하시겠습니까?')) return;

  try {
    const accessToken = localStorage.getItem('accessToken');

    await axios.delete('/api/recent-viewed/all', {
      headers: { Authorization: `Bearer ${accessToken}` },
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
