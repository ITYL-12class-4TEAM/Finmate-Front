<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <PortfolioTabs v-model:activeTab="activeTab" />

    <div class="tab-content">
      <PortfolioOverview
        v-if="activeTab === 'overview'"
        :portfolioItems="portfolioItems"
        :processedSummary="processedSummary"
        :totalAmount="totalAmount"
        :averageAmount="averageAmount"
        :topCategory="topCategory"
        :diversityScore="diversityScore"
        :recentProduct="recentProduct"
      />

      <PortfolioComparison
        v-else-if="activeTab === 'comparison'"
        :userAgeGroup="userAgeGroup"
        :ageComparisonChart="ageComparisonChart"
        :totalAmount="totalAmount"
      />

      <PortfolioAllocation
        v-else-if="activeTab === 'allocation'"
        :processedSummary="processedSummary"
      />

      <!-- <PortfolioWMTI  v-else-if="activeTab === 'wmti'":wmtiData="wmtiData" /> -->
      <PortfolioWMTI
        v-else-if="activeTab === 'wmti'"
        :myWMTI="'AILP'"
        :sameWMTIUsers="2370"
        :wmtiComparisonChart="wmtiComparisonChart"
        :totalAmount="totalAmount"
      />
    </div>

    <ProductList
      :portfolioItems="portfolioItems"
      :editingItem="editingItem"
      :editForm="editForm"
      :showSummary="true"
      @add-new-product="openAddModal"
      @refresh-portfolio="refreshPortfolio"
      @start-edit="startEdit"
      @save-edit="saveEdit"
      @cancel-edit="cancelEdit"
      @delete-product="deleteProduct"
    />

    <!-- 상품 추가 모달 -->
    <ProductAddModal
      :isVisible="showAddModal"
      @close="closeAddModal"
      @add-product="addNewProduct"
    />

    <!-- 삭제 확인 모달 -->
    <DeleteConfirmModal
      :isVisible="showDeleteModal"
      :productName="productToDelete?.customProductName || '상품'"
      :isProcessing="isDeleting"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

// 공통 컴포넌트
import PageHeader from '../../components/mypage/common/pageHeader.vue';
import LoadingSpinner from '../../components/mypage/common/LoadingSpinner.vue';
import ErrorAlert from '../../components/mypage/common/ErrorAlert.vue';

// 포트폴리오 전용 컴포넌트
import PortfolioTabs from '../../components/mypage/portfolio/tab/PortfolioTabs.vue';
import PortfolioOverview from '../../components/mypage/portfolio/first/PortfolioOverView.vue';
import PortfolioComparison from '../../components/mypage/portfolio/second/PortfolioComparison.vue';
import PortfolioAllocation from '../../components/mypage/portfolio/third/PortfolioAllocation.vue';
import PortfolioWMTI from '../../components/mypage/portfolio/fourth/PortfolioWMTI.vue';
import ProductList from '../../components/mypage/portfolio/ProductList.vue';
import ProductAddModal from '../../components/mypage/portfolio/ProductAddModal.vue';
import DeleteConfirmModal from '../../components/mypage/portfolio/DeleteConfirmModal.vue';

// -------------------- 상태 관리 --------------------
const loading = ref(false);
const error = ref('');
const portfolioItems = ref([]);
const summaryData = ref(null);

const editingItem = ref(null);
const activeTab = ref('overview');
const editForm = ref({
  amount: 0,
  memo: '',
});

// 모달 상태
const showAddModal = ref(false);
const showDeleteModal = ref(false);
const productToDelete = ref(null);
const isDeleting = ref(false);

// 사용자 나이대
const userAgeGroup = ref('');

// -------------------- API 호출 --------------------
const fetchPortfolioData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const accessToken = localStorage.getItem('accessToken');

    const [itemsRes, summaryRes] = await Promise.all([
      axios.get('/api/portfolio', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get('/api/portfolio/summary', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    // JSON 구조에 맞게 수정: body.data로 접근
    portfolioItems.value = itemsRes.data.body.data || [];
    summaryData.value = summaryRes.data.body.data || {};

    // 나이대 정보 설정
    const ageStat = summaryData.value?.comparisonSummary?.ageGroupStats?.[0];
    if (ageStat?.ageGroup) {
      userAgeGroup.value = `${ageStat.ageGroup}대`;
    } else {
      userAgeGroup.value = '기타';
    }
  } catch (err) {
    error.value = '포트폴리오 데이터를 불러오는데 실패했습니다.';
    console.error('Portfolio fetch error:', err);
  } finally {
    loading.value = false;
  }
};

// -------------------- Computed Properties --------------------

const processedSummary = computed(() => summaryData.value?.mySummary || []);

const totalAmount = computed(() =>
  processedSummary.value.reduce((sum, cat) => sum + cat.totalAmount, 0)
);

const averageAmount = computed(() =>
  portfolioItems.value.length > 0
    ? Math.floor(totalAmount.value / portfolioItems.value.length)
    : 0
);

const topCategory = computed(() => {
  if (!processedSummary.value.length) return null;
  return processedSummary.value.reduce((max, cur) =>
    cur.totalAmount > max.totalAmount ? cur : max
  );
});

const diversityScore = computed(() => {
  const count = processedSummary.value.length;
  if (count === 1) return 3;
  if (count === 2) return 6;
  if (count >= 3) return 9;
  return 0;
});

const recentProduct = computed(() => {
  if (!portfolioItems.value.length) return null;
  return portfolioItems.value.reduce((latest, curr) =>
    new Date(curr.joinDate) > new Date(latest.joinDate) ? curr : latest
  );
});

// -------------------- 비교 데이터 --------------------
const findRatioInSummary = (subcategoryName) => {
  for (const cat of processedSummary.value) {
    for (const sub of cat.subcategories || []) {
      if (sub.subcategoryName === subcategoryName) {
        return sub.ratio;
      }
    }
  }
  return 0;
};

const findCategoryRatioInSummary = (categoryName) => {
  const category = processedSummary.value.find(
    (cat) => cat.categoryName === categoryName
  );
  return category ? category.ratio : 0;
};

const ageComparisonChart = computed(() => {
  const group = summaryData.value?.comparisonSummary?.byAgeGroup || [];
  return group.map((item) => {
    let my = findCategoryRatioInSummary(item.categoryName);
    if (my === 0) {
      my = findRatioInSummary(item.categoryName);
    }

    const average = item.averageRatio;
    return {
      name: item.categoryName,
      my,
      average,
      difference: Math.round((my - average) * 10) / 10,
    };
  });
});

// wmtiComparisonChart computed 수정
const wmtiComparisonChart = computed(() => {
  const group = summaryData.value?.comparisonSummary?.byWMTI || [];

  if (!group.length) {
    return [];
  }

  return group.map((item) => {
    const categoryName = item.categoryName || item.name || item.category;
    const averageRatio = item.averageRatio || item.average || item.ratio || 0;
    let my = findCategoryRatioInSummary(categoryName);
    if (my === 0) {
      my = findRatioInSummary(categoryName);
    }

    const result = {
      name: categoryName,
      my: Number(my) || 0,
      average: Number(averageRatio) || 0,
      difference: Math.round((my - averageRatio) * 10) / 10,
    };
    return result;
  });
});

// -------------------- 모달 관리 --------------------
const openAddModal = () => {
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const openDeleteModal = (item) => {
  productToDelete.value = item;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  if (!isDeleting.value) {
    showDeleteModal.value = false;
    productToDelete.value = null;
  }
};

// -------------------- 상품 추가 --------------------
const addNewProduct = async (newProduct) => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await axios.post('/api/portfolio', newProduct, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 200 || response.status === 201) {
      closeAddModal();

      // 성공 알림 (더 사용자 친화적으로)
      const productName = newProduct.customProductName;

      // 포트폴리오 데이터 새로고침
      await fetchPortfolioData();
    }
  } catch (err) {
    console.error('상품 추가 실패:', err);

    // 에러 메시지 개선
    let errorMessage = '상품 추가 중 오류가 발생했습니다.';
    if (err.response?.status === 400) {
      errorMessage = '입력 정보를 확인해주세요.';
    } else if (err.response?.status === 401) {
      errorMessage = '로그인이 필요합니다.';
    } else if (err.response?.status === 403) {
      errorMessage = '권한이 없습니다.';
    }

    alert(`❌ ${errorMessage} 다시 시도해주세요.`);
  }
};

// -------------------- 상품 편집/삭제 --------------------
const startEdit = (item) => {
  editingItem.value = item;
  editForm.value = {
    amount: item.amount,
    memo: item.memo || '',
  };
};

const cancelEdit = () => {
  editingItem.value = null;
  editForm.value = { amount: 0, memo: '' };
};

const saveEdit = async (item) => {
  console.log('🔶 saveEdit 호출됨:', item);

  // item 파라미터에서 수정된 데이터 사용
  if (!item.amount || item.amount <= 0) {
    alert('투자금액을 올바르게 입력해주세요.');
    return;
  }

  // portfolioId 확인
  if (!item.portfolioId) {
    alert('상품 ID가 없어 수정할 수 없습니다.');
    console.error('portfolioId 없음:', item);
    return;
  }

  try {
    const accessToken = localStorage.getItem('accessToken');

    console.log('API 요청 데이터:', {
      portfolioId: item.portfolioId,
      amount: item.amount,
      memo: item.memo,
    });

    await axios.patch(
      `/api/portfolio/${item.portfolioId}`,
      {
        // item에서 필요한 필드들 추출
        amount: item.amount,
        memo: item.memo || '',
        // 추가 필드들도 포함 (ProductEditModal에서 모든 데이터를 보내므로)
        customProductName: item.customProductName,
        customCompanyName: item.customCompanyName,
        category: item.category,
        subcategory: item.subcategory,
        interestRate: item.interestRate,
        customRate: item.customRate,
        expectedReturn: item.expectedReturn,
        saveTrm: item.saveTrm,
        joinDate: item.joinDate,
        maturityDate: item.maturityDate,
        estimatedInterest: item.estimatedInterest,
        estimatedAfterTax: item.estimatedAfterTax,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // 로컬 상태 업데이트 - item 데이터로 업데이트
    const idx = portfolioItems.value.findIndex(
      (p) => p.portfolioId === item.portfolioId
    );

    console.log('업데이트할 인덱스:', idx);

    if (idx !== -1) {
      // 전체 아이템 정보 업데이트
      portfolioItems.value[idx] = { ...portfolioItems.value[idx], ...item };
      console.log('로컬 상태 업데이트 완료');
    }

    cancelEdit();

    // 전체 데이터 다시 불러오기 (요약 데이터 갱신을 위해)
    await fetchPortfolioData();
  } catch (err) {
    console.error('수정 에러 상세:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message,
    });

    let errorMessage = '수정에 실패했습니다.';
    if (err.response?.status === 400) {
      errorMessage = '잘못된 요청입니다. 입력값을 확인해주세요.';
    } else if (err.response?.status === 401) {
      errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
    } else if (err.response?.status === 404) {
      errorMessage = '해당 상품을 찾을 수 없습니다.';
    }

    alert(`❌ ${errorMessage}`);
  }
};

const deleteProduct = (item) => {
  openDeleteModal(item);
};

const confirmDelete = async () => {
  if (!productToDelete.value) return;

  isDeleting.value = true;

  try {
    const accessToken = localStorage.getItem('accessToken');

    await axios.delete(`/api/portfolio/${productToDelete.value.portfolioId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const productName = productToDelete.value.customProductName || '상품';

    closeDeleteModal();

    // 포트폴리오 데이터 새로고침
    await fetchPortfolioData();
  } catch (err) {
    alert('❌ 삭제에 실패했습니다. 다시 시도해주세요.');
    console.error('Delete error:', err);
  } finally {
    isDeleting.value = false;
  }
};

// -------------------- 기타 함수 --------------------
const refreshPortfolio = async () => {
  await fetchPortfolioData();
};

// -------------------- 생명주기 --------------------
onMounted(() => {
  fetchPortfolioData();
});
</script>

<style scoped>
.tab-content {
  margin-top: 1rem;
}
</style>
