<template>
  <div>
    <!-- 검색 카테고리명 -->
    <h2 class="product-title">정기예금</h2>
    
    <!-- 검색 폼 컴포넌트 -->
    <DepositSearchForm
      :deposit-amount="depositAmount"
      :period="period"
      :interest-type="interestType"
      :join-way="joinWay"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 상품 목록 컴포넌트 -->
    <DepositProductList
      :products="depositProducts"
      :loading="loading"
      :error="error"
      :total-count="totalCount"
      :current-page="currentPage"
      :page-size="pageSize"
      @product-click="goToProductDetail"
      @page-change="goToPage"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  getProductsAPI,
  getProductsFilterOptionsAPI,
} from '@/api/product';
import DepositSearchForm from '../../components/products/deposit/DepositSearchForm.vue';
import DepositProductList from '../../components/products/deposit/DepositProductList.vue';

const router = useRouter();
const route = useRoute();

// 폼 입력 데이터
const depositAmount = ref('100000');
const period = ref('6'); // 기본값 6개월
const interestType = ref('B'); // 기본값 전체
const joinWay = ref('all'); // 기본값 전체

// 상품 목록 상태
const depositProducts = ref([]);
const loading = ref(false);
const error = ref(null);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 검색 폼 이벤트 핸들러
const handleSearch = (formData) => {
  depositAmount.value = formData.depositAmount;
  period.value = formData.period;
  interestType.value = formData.interestType;
  joinWay.value = formData.joinWay;
  currentPage.value = 1; // 검색 시 첫 페이지로 초기화
  searchProducts();
};

// 초기화 핸들러
const handleReset = () => {
  depositAmount.value = '100000';
  period.value = '6';
  interestType.value = 'B';
  joinWay.value = 'all';
  currentPage.value = 1;
  searchProducts();
};

// 페이지 이동 함수
const goToPage = (page) => {
  currentPage.value = page;
  searchProducts();
};

// API 호출 전용 함수 (실제 데이터 가져오기)
const fetchProducts = async () => {
  try {
    // 검색 파라미터 구성
    const params = {
      category: 'deposit',
      categoryId: 1,
      subcategoryId: 101,
      minAmount: String(depositAmount.value).replace(/[^\d]/g, ''),
      saveTrm: period.value,
      page: currentPage.value,
      size: pageSize.value,
      sortBy: 'intrRate',
      sortDirection: 'desc',
    };

    // 금리 유형 필터 추가 (전체가 아닌 경우)
    if (interestType.value !== 'B') {
      params.intrRateType = interestType.value;
    }

    // 가입 방식 필터 추가 (전체가 아닌 경우)
    if (joinWay.value !== 'all') {
      params.joinWay = joinWay.value;
    }

    // 수치형 데이터 변환 확인
    params.minAmount = parseInt(params.minAmount) || 0;
    params.page = parseInt(params.page) || 1;
    params.size = parseInt(params.size) || 10;

    console.log('API 호출 파라미터:', params);

    // API 호출
    const response = await getProductsAPI(params);
    console.log('API 응답 (원본):', response);

    // API 응답 처리 - 다양한 응답 구조 대응
    if (response && response.body && response.body.data) {
      console.log('API 응답 구조 타입 1:', response.body.data);
      const data = response.body.data;
      depositProducts.value = Array.isArray(data.products) ? data.products : [];
      totalCount.value = data.totalCount || 0;
    } else if (response && response.products) {
      console.log('API 응답 구조 타입 2:', response.products);
      depositProducts.value = Array.isArray(response.products) ? response.products : [];
      totalCount.value = response.totalCount || 0;
    } else if (response && Array.isArray(response)) {
      console.log('API 응답 구조 타입 3 (배열):', response);
      depositProducts.value = response;
      totalCount.value = response.length;
    } else {
      console.warn('예상치 못한 API 응답 구조:', response);
      depositProducts.value = [];
      totalCount.value = 0;
    }
    
    return true;
  } catch (err) {
    console.error('상품 검색 API 호출 실패:', err);
    throw err;
  }
};

// 상품 검색 함수 (URL 업데이트 + API 호출)
const searchProducts = async () => {
  loading.value = true;
  error.value = null;

  try {
    // URL 쿼리 파라미터 업데이트
    const queryParams = {};
    
    // 기본값이 아닌 경우에만 URL에 포함
    const amountWithoutCommas = depositAmount.value.replace(/,/g, '');
    if (amountWithoutCommas !== '100000') {
      queryParams.amount = amountWithoutCommas;
    }
    
    if (period.value !== '6') {
      queryParams.saveTrm = period.value;
    }
    
    if (interestType.value !== 'B') {
      queryParams.intrRateType = interestType.value;
    }
    
    if (joinWay.value !== 'all') {
      queryParams.joinWay = joinWay.value;
    }
    
    if (currentPage.value > 1) {
      queryParams.page = currentPage.value;
    }

    // URL 업데이트 (현재 경로 유지하면서 쿼리만 변경)
    router.push({
      query: queryParams
    });

    // API 호출하여 데이터 가져오기
    await fetchProducts();
    
  } catch (err) {
    console.error('상품 검색 실패:', err);
    error.value = '상품을 검색하는 중 오류가 발생했습니다. ' + (err.message || '');
    depositProducts.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

// 상품 상세 페이지로 이동하는 함수
const goToProductDetail = (product) => {
  const productId = product.productId || product.product_id;
  const saveTrm = product.save_trm || product.saveTrm;

  router.push({
    path: `/products/deposit/${productId}`,
    query: {
      saveTrm: saveTrm,
      intrRateType: product.intr_rate_type || product.intrRateType,
    },
  });
};

// 초기 데이터 로딩
onMounted(async () => {
  try {
    // 로딩 상태 활성화
    loading.value = true;
    
    // URL 쿼리 파라미터 확인
    if (route.query.amount) {
      depositAmount.value = route.query.amount;
      // 숫자 포맷팅
      depositAmount.value = new Intl.NumberFormat('ko-KR').format(depositAmount.value);
    }
    
    if (route.query.saveTrm) {
      period.value = route.query.saveTrm;
    }
    
    if (route.query.intrRateType) {
      interestType.value = route.query.intrRateType;
    }
    
    if (route.query.joinWay) {
      joinWay.value = route.query.joinWay;
    }
    
    if (route.query.page) {
      currentPage.value = parseInt(route.query.page) || 1;
    }

    // 필터 옵션 로드 시도 (선택 사항)
    try {
      const filterOptions = await getProductsFilterOptionsAPI('deposit');
      console.log('필터 옵션:', filterOptions);
    } catch (optionErr) {
      console.warn('필터 옵션 로드 실패, 기본값을 사용합니다:', optionErr);
    }

    // 초기 검색 실행 (URL 업데이트 없이 API 직접 호출)
    await fetchProducts();
    
  } catch (err) {
    console.error('초기 데이터 로딩 실패:', err);
    error.value = '데이터를 불러오는 중 오류가 발생했습니다. ' + (err.message || '');
    depositProducts.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
});

// URL 쿼리 변경 시 자동으로 검색 실행 (백버튼 등의 경우 대응)
watch(() => route.query, (newQuery) => {
  if (Object.keys(newQuery).length === 0) {
    // 쿼리가 없어진 경우 (초기 상태로)
    handleReset();
    return;
  }
  
  // 쿼리 변경 감지하여 현재 상태와 다른 경우에만 업데이트
  let shouldReload = false;
  
  if (newQuery.amount && newQuery.amount !== depositAmount.value.replace(/,/g, '')) {
    depositAmount.value = newQuery.amount;
    depositAmount.value = new Intl.NumberFormat('ko-KR').format(depositAmount.value);
    shouldReload = true;
  }
  
  if (newQuery.saveTrm && newQuery.saveTrm !== period.value) {
    period.value = newQuery.saveTrm;
    shouldReload = true;
  }
  
  if (newQuery.intrRateType && newQuery.intrRateType !== interestType.value) {
    interestType.value = newQuery.intrRateType;
    shouldReload = true;
  }
  
  if (newQuery.joinWay && newQuery.joinWay !== joinWay.value) {
    joinWay.value = newQuery.joinWay;
    shouldReload = true;
  }
  
  if (newQuery.page && parseInt(newQuery.page) !== currentPage.value) {
    currentPage.value = parseInt(newQuery.page);
    shouldReload = true;
  }
  
  // 상태가 변경된 경우에만 API 다시 호출
  if (shouldReload) {
    fetchProducts();
  }
}, { deep: true });
</script>

<style>
.product-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
</style>