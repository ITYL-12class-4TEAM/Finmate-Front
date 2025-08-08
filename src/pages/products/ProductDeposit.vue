<template>
  <div class="product-deposit-page">
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
      @search="onSearch"
      @reset="onReset"
    />

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
      @page-change="onPageChange"
      @sort-change="onSortChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getProductsAPI, getProductsFilterOptionsAPI } from '@/api/product';
import DepositSearchForm from '../../components/products/deposit/DepositSearchForm.vue';
import DepositProductList from '../../components/products/deposit/DepositProductList.vue';

const router = useRouter();
const route = useRoute();

// ------ State ------
const depositAmount = ref(route.query.amount ? route.query.amount : '100000');
const period = ref(route.query.saveTrm || '6');
const interestType = ref(route.query.intrRateType || 'S');
const joinWay = ref(route.query.joinWays ? route.query.joinWays.split(',') : 'all');
const sortBy = ref(route.query.sortBy || 'intrRate');
const depositProducts = ref([]);
const loading = ref(false);
const error = ref(null);
const totalCount = ref(0);
const currentPage = ref(parseInt(route.query.page) || 1);
const pageSize = ref(10);
const banks = ref([]);
const selectedBanks = ref(route.query.banks ? route.query.banks.split(',') : []);
const selectedBankApiCodes = ref([]);

// ------ Fetch Banks ------
// API 호출 후 데이터 변환
const fetchBanks = async () => {
  try {
    const response = await getProductsFilterOptionsAPI('deposit');

    banks.value = response.banks;

    // 기본 데이터 설정 (데이터가 없는 경우)
    if (!banks.value.length) {
      console.log('기본 은행 데이터 사용');
      banks.value = [
        'KB국민은행',
        '신한은행',
        'NH농협은행',
        '우리은행',
        '하나은행',
        'IBK기업은행',
        'BNK저축은행',
        'DK저축은행',
        'HB저축은행',
        'IBK저축은행',
        'JT저축은행',
      ];
    }

    // 선택된 은행 초기화
    if (selectedBanks.value.length === 0) {
      const regularBanks = banks.value.filter(
        (bank) => typeof bank === 'string' && !bank.includes('저축은행')
      );
      selectedBanks.value = [...regularBanks];
      selectedBankApiCodes.value = [...regularBanks];
    }
  } catch (error) {
    console.error('은행 목록 로딩 실패:', error);

    // 오류 시 기본 데이터
    banks.value = ['KB국민은행', '신한은행', 'NH농협은행', '우리은행', '하나은행', 'IBK기업은행'];

    if (selectedBanks.value.length === 0) {
      selectedBanks.value = [...banks.value];
      selectedBankApiCodes.value = [...banks.value];
    }
  }
};

// ------ Fetch Products ------
const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    // 파라미터 구성 (객체 대신 URLSearchParams 직접 사용)
    const searchParams = new URLSearchParams();

    // 기본 파라미터 추가
    searchParams.append('category', 'deposit');
    searchParams.append('categoryId', '1');
    searchParams.append('subCategoryId', '101');
    searchParams.append('depositAmount', String(depositAmount.value).replace(/[^\d]/g, ''));
    searchParams.append('saveTrm', period.value);
    searchParams.append('page', String(currentPage.value));
    searchParams.append('size', String(pageSize.value));
    searchParams.append('sortBy', sortBy.value);
    searchParams.append('sortDirection', 'desc');
    searchParams.append('intrRateType', interestType.value);

    // 가입방식
    if (joinWay.value !== 'all') {
      if (Array.isArray(joinWay.value)) {
        joinWay.value.forEach((way) => searchParams.append('joinWays', way));
      } else {
        searchParams.append('joinWays', joinWay.value);
      }
    }

    // 은행 - 이 부분이 중요함!
    if (selectedBankApiCodes.value.length >= 0) {
      // forEach에서 append 사용하여 각 은행을 별도 파라미터로 추가
      selectedBankApiCodes.value.forEach((bank) => {
        searchParams.append('banks', bank);
      });

      console.log('API 요청에 포함된 은행 수:', selectedBankApiCodes.value.length);
    }

    const res = await getProductsAPI(searchParams);
    depositProducts.value = res.products || [];
    totalCount.value = res.totalCount || depositProducts.value.length || 0;
  } catch (err) {
    console.error('상품 검색 오류:', err);
    error.value = '상품을 검색하는 중 오류가 발생했습니다. ' + (err.message || '');
    depositProducts.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

// ------ Form Handlers ------
const onSearch = (formData) => {
  depositAmount.value = formData.depositAmount;
  period.value = formData.period;
  interestType.value = formData.interestType;
  joinWay.value = formData.joinWays ?? 'all';

  selectedBanks.value = formData.selectedBanks?.uiCodes || [];
  selectedBankApiCodes.value = formData.selectedBanks?.apiCodes || [];

  currentPage.value = 1;
  updateQueryAndFetch();
};

const onReset = () => {
  depositAmount.value = '100000';
  period.value = '6';
  interestType.value = 'S';
  joinWay.value = 'all';
  sortBy.value = 'intrRate';
  currentPage.value = 1;

  // 저축은행 제외 초기화
  const regularBanks = banks.value.filter((b) => typeof b === 'string' && !b.includes('저축은행'));
  selectedBanks.value = [...regularBanks];
  selectedBankApiCodes.value = [...regularBanks];

  // 쿼리 리셋
  router.replace({ query: {} });
  nextTick(fetchProducts);
};

const onSortChange = ({ sortBy: newSort }) => {
  sortBy.value = newSort;
  updateQueryAndFetch();
};

const onPageChange = (page) => {
  currentPage.value = page;
  updateQueryAndFetch();
};

const updateQueryAndFetch = () => {
  // query string 동기화
  const query = {};

  if (depositAmount.value.replace(/,/g, '') !== '100000')
    query.amount = depositAmount.value.replace(/,/g, '');
  if (period.value !== '6') query.saveTrm = period.value;
  if (interestType.value !== 'S') query.intrRateType = interestType.value;
  if (joinWay.value !== 'all' && joinWay.value.length > 0)
    query.joinWays = [].concat(joinWay.value).join(',');
  if (sortBy.value !== 'intrRate') query.sortBy = sortBy.value;
  if (currentPage.value > 1) query.page = currentPage.value;
  if (selectedBanks.value.length > 0) query.banks = selectedBanks.value.join(',');

  router.push({ query });
  fetchProducts();
};

const goToProductDetail = (product) => {
  const productId = product.productId || product.product_id;
  const saveTrm = product.save_trm || product.saveTrm;
  router.push({
    path: `/products/deposit/${productId}`,
    query: {
      saveTrm,
      intrRateType: product.intr_rate_type || product.intrRateType,
    },
  });
};

// ------ Watch route.query ------
watch(
  () => route.query,
  (newQuery) => {
    // 값 동기화
    if ('amount' in newQuery)
      depositAmount.value = new Intl.NumberFormat('ko-KR').format(newQuery.amount);
    if ('saveTrm' in newQuery) period.value = newQuery.saveTrm;
    if ('intrRateType' in newQuery) interestType.value = newQuery.intrRateType;
    if ('joinWays' in newQuery) joinWay.value = newQuery.joinWays.split(',');
    if ('sortBy' in newQuery) sortBy.value = newQuery.sortBy;
    if ('page' in newQuery) currentPage.value = parseInt(newQuery.page);
    if ('banks' in newQuery) selectedBanks.value = newQuery.banks.split(',');
    // fetch
    fetchProducts();
  }
);

onMounted(async () => {
  console.log('[타임스탬프]', new Date().toISOString(), 'ProductDeposit 마운트됨');
  await fetchBanks();
  console.log(
    '[타임스탬프]',
    new Date().toISOString(),
    'fetchBanks 완료, 데이터:',
    banks.value.length
  );
  await fetchProducts();
  console.log('[타임스탬프]', new Date().toISOString(), 'fetchProducts 완료');
});
</script>

<style scoped>
/* ==========================================================================
   1. 페이지 전체 레이아웃
   - 상세 페이지와 동일한 배경색과 여백을 적용하여 통일성 유지
   ========================================================================== */
.product-deposit-page {
  background-color: var(--color-bg-light);
  padding: 1rem;
  min-height: 100vh;
}
</style>
