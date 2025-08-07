<template>
  <div>
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
const fetchBanks = async () => {
  loading.value = true;
  try {
    const res = await getProductsFilterOptionsAPI('deposit');
    const bankList = res?.body?.data?.banks || [];
    banks.value = bankList;

    if (!route.query.banks) {
      // 저축은행 제외 기본 선택
      const regularBanks = bankList.filter((b) => typeof b === 'string' && !b.includes('저축은행'));
      selectedBanks.value = [...regularBanks];
      selectedBankApiCodes.value = [...regularBanks];
    }
  } catch (e) {
    banks.value = [];
  } finally {
    loading.value = false;
  }
};

// ------ Fetch Products ------
const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    // 파라미터 구성
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
      intrRateType: interestType.value,
    };

    // 가입방식
    if (joinWay.value !== 'all') {
      [].concat(joinWay.value).forEach((w) => (params.joinWays = w));
    }
    // 은행
    if (selectedBankApiCodes.value.length > 0) {
      selectedBankApiCodes.value.forEach((bank) => (params.banks = bank));
    }

    // URLSearchParams → getProductsAPI에서 잘 처리한다면 직접 넘겨도 됨
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => searchParams.append(k, v));

    const res = await getProductsAPI(searchParams);
    depositProducts.value = res.products || [];
    totalCount.value = res.totalCount || depositProducts.value.length || 0;
  } catch (err) {
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
  await fetchBanks();
  await fetchProducts();
});
</script>

<style>
.product-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
</style>
