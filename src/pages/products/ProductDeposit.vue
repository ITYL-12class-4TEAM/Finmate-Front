<template>
  <div>
    <!-- 검색 폼 컴포넌트 -->
    <DepositSearchForm
      :deposit-amount="depositAmount"
      :period="period"
      :interest-type="interestType"
      :join-way="joinWay"
      :banks="banks"
      :selected-banks="{
        uiCodes: selectedBanks,
        apiCodes: selectedBankApiCodes,
      }"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 상품 목록 컴포넌트 -->
    <DepositProductList
      :products="depositProducts"
      :deposit-amount="depositAmount"
      :loading="loading"
      :error="error"
      :total-count="totalCount"
      :current-page="currentPage"
      :page-size="pageSize"
      :sort-by="sortBy"
      @product-click="goToProductDetail"
      @page-change="goToPage"
      @sort-change="handleSortChange"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getProductsAPI, getProductsFilterOptionsAPI } from '@/api/product';
import DepositSearchForm from '../../components/products/deposit/DepositSearchForm.vue';
import DepositProductList from '../../components/products/deposit/DepositProductList.vue';

const router = useRouter();
const route = useRoute();

// 폼 입력 데이터 - URL 쿼리 파라미터를 기반으로 초기값 설정
const depositAmount = ref(route.query.amount ? route.query.amount : '100000');
const period = ref(route.query.saveTrm || '6'); // 기본값 6개월
const interestType = ref(route.query.intrRateType || 'S'); // 단리리
const joinWay = ref(route.query.joinWays ? route.query.joinWays.split(',') : 'all'); // 기본값 전체
const sortBy = ref(route.query.sortBy || 'intrRate'); // 정렬 기준 : 기본 금리순

// 상품 목록 상태
const depositProducts = ref([]);
const loading = ref(false);
const error = ref(null);
const totalCount = ref(0);
const currentPage = ref(parseInt(route.query.page) || 1);
const pageSize = ref(10);

// 은행 필터링
const banks = ref([]);
const selectedBanks = ref(route.query.banks ? route.query.banks.split(',') : []);
const selectedBankApiCodes = ref([]);

// API에서 은행 목록 가져오기
const fetchBanks = async () => {
  try {
    loading.value = true;

    // API 호출
    const response = await getProductsFilterOptionsAPI('deposit');
    console.log('필터 옵션 응답:', response);

    // 은행 데이터 처리
    if (response && response.body && response.body.data && response.body.data.banks) {
      // API 응답에서 banks 배열 가져오기
      banks.value = response.body.data.banks;
      console.log('은행 목록 로드됨:', banks.value);

      // URL에 banks 파라미터가 없을 때만 기본값 설정
      if (!route.query.banks) {
        const regularBanks = banks.value.filter(
          (bank) => typeof bank === 'string' && !bank.includes('저축은행')
        );

        selectedBanks.value = [...regularBanks];
        selectedBankApiCodes.value = [...regularBanks];

        console.log('기본 선택 은행 설정 완료:', selectedBanks.value);
      }
      // route.query.banks가 있으면 selectedBanks는 이미 초기화 시 설정되어 있음
    } else {
      console.warn('예상치 못한 API 응답 구조:', response);
      banks.value = [];
    }
  } catch (error) {
    console.error('은행 목록 가져오기 실패:', error);
    banks.value = [];
  } finally {
    loading.value = false;
  }
};

// 검색 폼 이벤트 핸들러 수정
const handleSearch = (formData) => {
  depositAmount.value = formData.depositAmount;
  period.value = formData.period;
  interestType.value = formData.interestType;

  // joinWays 값 처리 수정
  if (formData.joinWays) {
    joinWay.value = formData.joinWays; // joinWay 변수에 저장 (변수명 유지)
  }

  // 은행 선택 정보 업데이트
  if (formData.selectedBanks) {
    selectedBanks.value = formData.selectedBanks.uiCodes || [];
    selectedBankApiCodes.value = formData.selectedBanks.apiCodes || [];
  }

  currentPage.value = 1; // 검색 시 첫 페이지로 초기화
  searchProducts();
};

// 초기화 핸들러
const handleReset = () => {
  // 상태를 명확히 초기화
  depositAmount.value = '100000';
  period.value = '6';
  interestType.value = 'S'; // 단리로 명확히 지정
  joinWay.value = 'all';
  sortBy.value = 'intrRate';

  // 은행 선택 초기화: 저축은행 제외한 모든 은행
  const regularBanks = banks.value.filter(
    (bank) => typeof bank === 'string' && !bank.includes('저축은행')
  );
  selectedBanks.value = [...regularBanks];
  selectedBankApiCodes.value = [...regularBanks];

  currentPage.value = 1;

  // URL 쿼리 파라미터 제거 (모든 필터 제거)
  router.replace({ query: {} });

  // nextTick을 사용해 상태 업데이트 후 검색 실행
  nextTick(() => {
    searchProducts();
  });
};

// 정렬 이벤트 핸들러
const handleSortChange = (sortData) => {
  sortBy.value = sortData.sortBy;
  searchProducts();
};

// 페이지 이동 함수
const goToPage = (page) => {
  currentPage.value = page;
  searchProducts();
};

// fetchProducts 함수 수정
const fetchProducts = async () => {
  try {
    // 검색 파라미터 구성 - 기본 파라미터
    const params = {
      category: 'deposit',
      categoryId: 1,
      subCategoryId: 101,
      depositAmount: String(depositAmount.value).replace(/[^\d]/g, ''),
      saveTrm: period.value,
      page: currentPage.value,
      size: pageSize.value,
      sortBy: sortBy.value,
      sortDirection: 'desc',
    };

    // 수치형 데이터 변환 확인
    params.depositAmount = parseInt(params.depositAmount) || 0;
    params.page = parseInt(params.page) || 1;
    params.size = parseInt(params.size) || 10;

    // URLSearchParams 객체 생성
    const searchParams = new URLSearchParams();

    // 기본 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });

    // 금리 유형 필터 추가 - 항상 추가 (S, M, B 모두)
    searchParams.append('intrRateType', interestType.value);

    // 가입 방식 필터 추가 (전체가 아닌 경우)
    if (joinWay.value !== 'all') {
      if (Array.isArray(joinWay.value) && joinWay.value.length > 0) {
        joinWay.value.forEach((way) => {
          searchParams.append('joinWays', way);
        });
      } else if (typeof joinWay.value === 'string' && joinWay.value !== 'all') {
        searchParams.append('joinWays', joinWay.value);
      }
    }

    // 은행 필터 추가
    if (selectedBankApiCodes.value && selectedBankApiCodes.value.length > 0) {
      selectedBankApiCodes.value.forEach((bank) => {
        searchParams.append('banks', bank);
      });
    }

    // API 호출
    const response = await getProductsAPI(searchParams);
    console.log('API 응답 (원본):', response);

    // API 응답 처리
    if (response && response.products) {
      depositProducts.value = response.products;
      totalCount.value = response.totalCount || response.products.length;
    } else if (Array.isArray(response)) {
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

// URL 쿼리 파라미터 업데이트 함수 수정
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

    if (interestType.value !== 'S') {
      queryParams.intrRateType = interestType.value;
    }

    // joinWay 배열 처리 (쉼표로 구분하되 한 번만 저장)
    if (joinWay.value !== 'all') {
      if (Array.isArray(joinWay.value) && joinWay.value.length > 0) {
        // 중복 제거 후 쉼표로 구분된 문자열로 변환
        const uniqueJoinWays = [...new Set(joinWay.value)];
        queryParams.joinWays = uniqueJoinWays.join(',');
      } else if (typeof joinWay.value === 'string' && joinWay.value !== 'all') {
        queryParams.joinWays = joinWay.value;
      }
    }

    if (sortBy.value != 'intrRate') {
      queryParams.sortBy = sortBy.value;
    }

    if (currentPage.value > 1) {
      queryParams.page = currentPage.value;
    }

    // 은행 필터 쿼리 파라미터 추가 (UI 코드 사용)
    if (selectedBanks.value.length > 0) {
      queryParams.banks = selectedBanks.value.join(',');
    }

    // URL 업데이트 (현재 경로 유지하면서 쿼리만 변경)
    router.push({
      query: queryParams,
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
    loading.value = true;

    // 은행 목록 먼저 로드
    await fetchBanks();

    // URL 쿼리에서 은행 정보만 처리 (다른 값들은 이미 ref 초기화 시 설정됨)
    if (route.query.banks) {
      selectedBanks.value = route.query.banks.split(',');

      // API 코드 변환 (저축은행 처리)
      if (selectedBanks.value.includes('savings_all')) {
        const savingsBanks = banks.value.filter(
          (bank) => typeof bank === 'string' && bank.includes('저축은행')
        );

        const apiCodes = [...selectedBanks.value];
        const index = apiCodes.indexOf('savings_all');
        if (index !== -1) {
          apiCodes.splice(index, 1, ...savingsBanks);
        }

        selectedBankApiCodes.value = apiCodes;
      } else {
        selectedBankApiCodes.value = [...selectedBanks.value];
      }
    }

    // depositAmount 포맷팅 (이미 값이 설정되어 있으므로 포맷팅만)
    if (depositAmount.value && depositAmount.value !== '100000') {
      depositAmount.value = new Intl.NumberFormat('ko-KR').format(
        depositAmount.value.toString().replace(/,/g, '')
      );
    }

    // 필터 옵션 로드 시도
    try {
      const filterOptions = await getProductsFilterOptionsAPI('deposit');
      console.log('필터 옵션:', filterOptions);
    } catch (optionErr) {
      console.warn('필터 옵션 로드 실패, 기본값을 사용합니다:', optionErr);
    }

    // 초기 검색 실행
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
watch(
  () => route.query,
  (newQuery) => {
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

    // joinWays URL 파라미터 처리 (쉼표로 구분된 문자열을 배열로 변환)
    if (newQuery.joinWays) {
      const uniqueJoinWays = [...new Set(newQuery.joinWays.split(','))];
      joinWay.value = uniqueJoinWays;
      shouldReload = true;
    } else if (!newQuery.joinWays && joinWay.value !== 'all') {
      // joinWays 파라미터가 없어지면 전체로 초기화
      joinWay.value = 'all';
      shouldReload = true;
    }

    if (newQuery.sortBy && newQuery.sortBy !== sortBy.value) {
      sortBy.value = newQuery.sortBy;
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
  },
  { deep: true }
);
</script>

<style>
.product-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
</style>
