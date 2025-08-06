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
import { onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getProductsAPI, getProductsFilterOptionsAPI } from '@/api/product';
import DepositSearchForm from '../../components/products/deposit/DepositSearchForm.vue';
import DepositProductList from '../../components/products/deposit/DepositProductList.vue';

const router = useRouter();
const route = useRoute();

// 폼 입력 데이터
const depositAmount = ref('100000');
const period = ref('6'); // 기본값 6개월
const interestType = ref('B'); // 기본값 전체
const joinWay = ref('all'); // 기본값 전체
const sortBy = ref('intrRate'); // 정렬 기준 : 기본 금리순

// 상품 목록 상태
const depositProducts = ref([]);
const loading = ref(false);
const error = ref(null);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 은행 필터링
const banks = ref([]);
const selectedBanks = ref([]);
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

      // 직접 기본값 설정 (저축은행 제외한 모든 은행)
      const regularBanks = banks.value.filter(
        (bank) => typeof bank === 'string' && !bank.includes('저축은행')
      );

      selectedBanks.value = [...regularBanks];
      selectedBankApiCodes.value = [...regularBanks];

      console.log('기본 선택 은행 설정 완료:', selectedBanks.value);
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

// 검색 폼 이벤트 핸들러
const handleSearch = (formData) => {
  depositAmount.value = formData.depositAmount;
  period.value = formData.period;
  interestType.value = formData.interestType;
  joinWay.value = formData.joinWay;

  // 은행 선택 정보 업데이트
  if (formData.selectedBanks) {
    selectedBanks.value = formData.selectedBanks.uiCodes || [];
    selectedBankApiCodes.value = formData.selectedBanks.apiCodes || [];

    console.log('선택된 은행 (UI):', selectedBanks.value);
    console.log('선택된 은행 (API):', selectedBankApiCodes.value);
  }

  currentPage.value = 1; // 검색 시 첫 페이지로 초기화
  searchProducts();
};

// 초기화 핸들러
const handleReset = () => {
  depositAmount.value = '100000';
  period.value = '6';
  interestType.value = 'B';
  joinWay.value = 'all';
  sortBy.value = 'intrRate';

  // 은행 선택 초기화: 저축은행 제외한 모든 은행
  const regularBanks = banks.value.filter(
    (bank) => typeof bank === 'string' && !bank.includes('저축은행')
  );
  selectedBanks.value = [...regularBanks];
  selectedBankApiCodes.value = [...regularBanks];

  currentPage.value = 1;
  searchProducts();
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

// API 호출 전용 함수 (실제 데이터 가져오기)
const fetchProducts = async () => {
  try {
    // 검색 파라미터 구성 - 기본 파라미터는 객체로 유지
    const params = {
      category: 'deposit',
      categoryId: 1,
      subCategoryId: 101, // 적금은 102, 정기예금은 101
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

    // 금리 유형 필터 추가 (전체가 아닌 경우)
    if (interestType.value !== 'B') {
      searchParams.append('intrRateType', interestType.value);
    }

    // 가입 방식 필터 추가 (전체가 아닌 경우)
    if (joinWay.value !== 'all') {
      if (Array.isArray(joinWay.value) && joinWay.value.length > 0) {
        // 각 항목을 별도의 joinWay 파라미터로 추가
        joinWay.value.forEach((way) => {
          searchParams.append('joinWay', way);
        });
        console.log('가입 방식 필터링:', joinWay.value);
      } else if (typeof joinWay.value === 'string' && joinWay.value !== 'all') {
        // 단일 문자열인 경우 하나의 파라미터로 추가
        searchParams.append('joinWay', joinWay.value);
      }
    }

    // 은행 필터 추가
    if (selectedBankApiCodes.value && selectedBankApiCodes.value.length > 0) {
      selectedBankApiCodes.value.forEach((bank) => {
        searchParams.append('banks', bank);
      });
    }

    // console.log('API 호출 파라미터:', searchParams.toString());

    // API 호출 - 수정된 방식으로 호출 (getProductsAPI 함수가 URLSearchParams를 지원하는지 확인 필요)
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

    // joinWay 배열 처리 - banks와 동일한 방식으로 처리
    if (joinWay.value !== 'all') {
      if (Array.isArray(joinWay.value) && joinWay.value.length > 0) {
        queryParams.joinWay = joinWay.value.join(',');
      } else if (typeof joinWay.value === 'string' && joinWay.value !== 'all') {
        queryParams.joinWay = joinWay.value;
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
    // 로딩 상태 활성화
    loading.value = true;
    await fetchBanks();

    // URL 쿼리 파라미터 확인
    if (route.query.banks) {
      selectedBanks.value = route.query.banks.split(',');

      // API 코드 변환 (저축은행 처리)
      if (selectedBanks.value.includes('savings_all')) {
        // 저축은행 코드 목록 생성
        const savingsBanks = banks.value.filter(
          (bank) => typeof bank === 'string' && bank.includes('저축은행')
        );

        // API 코드 생성
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

    if (route.query.sortBy) {
      sortBy.value = route.query.sortBy;
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

    // joinWay URL 파라미터 처리 - banks와 유사하게 처리
    if (newQuery.joinWay) {
      const joinWayFromUrl = newQuery.joinWay.split(',');
      // 배열인 경우와 문자열인 경우 모두 고려
      const currentJoinWay = Array.isArray(joinWay.value) ? joinWay.value.join(',') : joinWay.value;

      if (newQuery.joinWay !== currentJoinWay) {
        // 쉼표 구분 문자열을 배열로 변환하여 저장
        joinWay.value = joinWayFromUrl;
        shouldReload = true;
      }
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
