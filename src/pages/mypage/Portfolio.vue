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
        :assetRangeChart="assetRangeChart"
        :totalAmount="totalAmount"
        :comparisonMessage="comparisonMessage"
      />

      <PortfolioAllocation
        v-else-if="activeTab === 'allocation'"
        :processedSummary="processedSummary"
      />

      <PortfolioWMTI v-else-if="activeTab === 'wmti'" :wmtiData="wmtiData" />
    </div>

    <ProductList
      :portfolioItems="portfolioItems"
      :editingItem="editingItem"
      :editForm="editForm"
      :showSummary="true"
      @add-new-product="addNewProduct"
      @refresh-portfolio="refreshPortfolio"
      @start-edit="startEdit"
      @save-edit="saveEdit"
      @cancel-edit="cancelEdit"
      @delete-product="deleteProduct"
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

// -------------------- 상태 관리 --------------------
const loading = ref(false);
const error = ref('');
const portfolioItems = ref([]);
const summaryData = ref(null);

const editingItem = ref(null);
const comparisonMessage = ref('');
const activeTab = ref('overview');
const editForm = ref({
  amount: 0,
  memo: '',
});

// 사용자 나이대 (추후 API에서 받아올 예정)
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

    // 나이대 정보 설정 - ageGroupStats 배열에서 첫 번째 항목의 ageGroup 사용
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
// subcategory 이름으로 비율을 찾는 함수 - JSON 구조에 맞게 수정
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

// 카테고리 이름으로 비율을 찾는 함수 추가 (byAgeGroup은 카테고리 이름을 사용)
const findCategoryRatioInSummary = (categoryName) => {
  const category = processedSummary.value.find(
    (cat) => cat.categoryName === categoryName
  );
  return category ? category.ratio : 0;
};

const ageComparisonChart = computed(() => {
  const group = summaryData.value?.comparisonSummary?.byAgeGroup || [];
  return group.map((item) => {
    // 먼저 카테고리에서 찾고, 없으면 서브카테고리에서 찾기
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

const assetRangeChart = computed(() => {
  const group = summaryData.value?.comparisonSummary?.byAmountGroup || [];
  return group.map((item) => {
    // 먼저 카테고리에서 찾고, 없으면 서브카테고리에서 찾기
    let my = findCategoryRatioInSummary(item.categoryName);
    if (my === 0) {
      my = findRatioInSummary(item.categoryName);
    }

    return {
      name: item.categoryName,
      my,
      average: item.averageRatio,
    };
  });
});

const wmtiData = computed(() => {
  return summaryData.value?.comparisonSummary?.byWMTI || [];
});

// -------------------- 비교 메시지 생성 --------------------
const generateComparisonMessage = () => {
  const significant = ageComparisonChart.value.filter(
    (c) => Math.abs(c.difference) >= 10
  );

  if (significant.length === 0) {
    comparisonMessage.value = `${userAgeGroup.value} 또래와 비슷한 자산 분배를 하고 있네요 👍`;
    return;
  }

  const highDeposit = significant.find(
    (c) => c.name === '정기예금' && c.difference > 0
  );
  const highSavings = significant.find(
    (c) => c.name === '자유적금' && c.difference > 0
  );
  const highPension = significant.find(
    (c) => c.name === '연금저축' && c.difference > 0
  );
  const lowPension = significant.find(
    (c) => c.name === '연금저축' && c.difference < 0
  );

  if (highDeposit && highSavings) {
    comparisonMessage.value =
      '💼 안정추구형 - 예금·적금 중심의 안전한 투자를 선호하시네요.';
  } else if (highPension) {
    comparisonMessage.value =
      '🎯 미래계획형 - 연금을 일찍 준비한 현명한 투자자시네요!';
  } else if (highDeposit && lowPension) {
    comparisonMessage.value =
      '🏦 현재중심형 - 현재 필요 자금을 우선시하는 성향이에요.';
  } else if (highSavings) {
    comparisonMessage.value =
      '💰 목표달성형 - 적금 위주로 계획적인 재테크 중이시군요!';
  } else if (lowPension) {
    comparisonMessage.value =
      '⚡ 적극투자형 - 연금보다 다른 자산에 더 집중하고 있어요.';
  } else {
    const most = significant.reduce((a, b) =>
      Math.abs(a.difference) > Math.abs(b.difference) ? a : b
    );
    comparisonMessage.value = `📊 ${most.name} 집중형 - 독특한 분배 패턴을 보이고 있어요!`;
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
  if (!editForm.value.amount || editForm.value.amount <= 0) {
    alert('투자금액을 올바르게 입력해주세요.');
    return;
  }

  try {
    const accessToken = localStorage.getItem('accessToken');

    await axios.patch(
      `/api/portfolio/${item.portfolioId}`,
      {
        amount: editForm.value.amount,
        memo: editForm.value.memo,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    // 로컬 상태 업데이트
    const idx = portfolioItems.value.findIndex(
      (p) => p.portfolioId === item.portfolioId
    );
    if (idx !== -1) {
      portfolioItems.value[idx].amount = editForm.value.amount;
      portfolioItems.value[idx].memo = editForm.value.memo;
    }

    cancelEdit();
    alert('수정 완료!');

    // 전체 데이터 다시 불러오기 (요약 데이터 갱신을 위해)
    await fetchPortfolioData();
  } catch (err) {
    alert('수정에 실패했습니다. 다시 시도해주세요.');
    console.error('Edit error:', err);
  }
};

const deleteProduct = async (item) => {
  // JSON 데이터에서는 customProductName을 사용
  const productName = item.customProductName || item.productName || '상품';
  if (!confirm(`${productName}을 삭제할까요?`)) return;

  try {
    const accessToken = localStorage.getItem('accessToken');

    await axios.delete(`/api/portfolio/${item.portfolioId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    alert('삭제 완료');
    await fetchPortfolioData();
  } catch (err) {
    alert('삭제에 실패했습니다. 다시 시도해주세요.');
    console.error('Delete error:', err);
  }
};

// -------------------- 기타 함수 --------------------
const refreshPortfolio = async () => {
  await fetchPortfolioData();
};

const addNewProduct = () => {
  alert('상품 추가 기능은 준비 중입니다.');
  // TODO: 상품 추가 기능 구현
};

// -------------------- Watchers --------------------
// 연령대 비교 차트 데이터가 변경될 때마다 비교 메시지 생성
watch(
  ageComparisonChart,
  () => {
    generateComparisonMessage();
  },
  { deep: true }
);

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
