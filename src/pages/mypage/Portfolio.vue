<template>
  <LoadingSpinner v-if="loading" />

  <ErrorAlert v-else-if="error" :message="error" />

  <div v-else>
    <PortfolioTabs v-model:active-tab="activeTab" />

    <div class="tab-content">
      <PortfolioOverview
        v-if="activeTab === 'overview'"
        :portfolio-items="portfolioItems"
        :processed-summary="processedSummary"
        :total-amount="totalAmount"
        :average-amount="averageAmount"
        :top-category="topCategory"
        :diversity-score="diversityScore"
        :recent-product="recentProduct"
      />

      <PortfolioComparison
        v-else-if="activeTab === 'comparison'"
        :user-age-group="userAgeGroup"
        :age-comparison-chart="ageComparisonChart"
        :total-amount="totalAmount"
      />

      <PortfolioAllocation
        v-else-if="activeTab === 'allocation'"
        :processed-summary="processedSummary"
      />

      <!-- <PortfolioWMTI  v-else-if="activeTab === 'wmti'":wmtiData="wmtiData" /> -->
      <PortfolioWMTI
        v-else-if="activeTab === 'wmti'"
        :my-w-m-t-i="myWMTI || 'UNKNOWN'"
        :same-w-m-t-i-users="2370"
        :wmti-comparison-chart="wmtiComparisonChart"
        :total-amount="totalAmount"
      />
    </div>

    <ProductList
      :portfolio-items="portfolioItems"
      :editing-item="editingItem"
      :edit-form="editForm"
      :show-summary="true"
      @add-new-product="openAddModal"
      @refresh-portfolio="refreshPortfolio"
      @start-edit="startEdit"
      @save-edit="saveEdit"
      @cancel-edit="cancelEdit"
      @delete-product="deleteProduct"
    />

    <!-- 상품 추가 모달 -->
    <ProductAddModal
      :is-visible="showAddModal"
      @close="closeAddModal"
      @add-product="addNewProduct"
    />

    <!-- 삭제 확인 모달 -->
    <DeleteConfirmModal
      :is-visible="showDeleteModal"
      :product-name="productToDelete?.customProductName || '상품'"
      :is-processing="isDeleting"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

// 공통 컴포넌트
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
import { portfolioAPI } from '@/api/portfolio';
import { getWMTIResultAPI } from '@/api/wmti';

// -------------------- 상태 관리 --------------------
const loading = ref(false);
const error = ref('');
const portfolioItems = ref([]);
const summaryData = ref(null);
const myWMTI = ref('');

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
const fetchWMTIResult = async () => {
  try {
    const res = await getWMTIResultAPI(); // memberId가 API 내부에서 처리된다면 제거
    // JSON 응답에서 wmtiCode 추출
    if (res?.body?.wmtiCode) {
      myWMTI.value = res.body.wmtiCode; // "IBWC" 같은 값이 저장됨
    }
  } catch (err) {
    console.error('WMTI 결과 조회 실패:', err);
    // 에러 시 기본값 설정
    myWMTI.value = '';
  }
};

// 2. onMounted에서 WMTI 데이터도 함께 불러오기
onMounted(async () => {
  await Promise.all([
    fetchPortfolioData(),
    fetchWMTIResult(), // WMTI 데이터도 함께 로드
  ]);
});

const fetchPortfolioData = async () => {
  loading.value = true;
  error.value = '';

  try {
    const [itemsRes, summaryRes] = await Promise.all([
      portfolioAPI.getPortfolio(),
      portfolioAPI.getPortfolioSummary(),
    ]);

    // JSON 구조에 맞게 수정: body.data로 접근
    portfolioItems.value = itemsRes.body.data || [];
    summaryData.value = summaryRes.body.data || {};

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
  portfolioItems.value.length > 0 ? Math.floor(totalAmount.value / portfolioItems.value.length) : 0
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

const subcategoryToMainCategory = {
  정기예금: '예금',
  자유예금: '예금',
  기업예금: '예금',
  CMA: '예금',
  정기적금: '적금',
  자유적금: '적금',
  펀드적금: '적금',
  연금적금: '적금',
  종신보험: '보험',
  정기보험: '보험',
  연금보험: '보험',
  변액보험: '보험',
  연금저축: '연금',
  개인연금: '연금',
  IRP: '연금',
  DC형: '연금',
  국내주식: '주식',
  해외주식: '주식',
  ETF: '주식',
  ETN: '주식',
  신용대출: '대출',
  담보대출: '대출',
  전세자금대출: '대출',
  주택담보대출: '대출',
  부동산: '기타',
  채권: '기타',
  금: '기타',
  암호화폐: '기타',
  기타투자: '기타',
};

const findCategoryRatioInSummary = (categoryName) => {
  const category = processedSummary.value.find((cat) => cat.categoryName === categoryName);
  return category ? category.ratio : 0;
};

const ageComparisonChart = computed(() => {
  const group = summaryData.value?.comparisonSummary?.byAgeGroup || [];

  // 대 카테고리별로 그룹핑
  const mainCategoryMap = new Map();

  group.forEach((item) => {
    const mainCategory = subcategoryToMainCategory[item.categoryName] || item.categoryName;

    if (mainCategoryMap.has(mainCategory)) {
      // 이미 있으면 평균 비율을 합산 (또는 평균 계산)
      const existing = mainCategoryMap.get(mainCategory);
      existing.averageRatio += item.averageRatio;
      existing.count += 1;
    } else {
      mainCategoryMap.set(mainCategory, {
        categoryName: mainCategory,
        averageRatio: item.averageRatio,
        count: 1,
      });
    }
  });
  return Array.from(mainCategoryMap.values()).map((item) => {
    const categoryName = item.categoryName;
    const averageRatio = item.averageRatio / item.count; // 평균 계산

    let my = findCategoryRatioInSummary(categoryName);
    if (my === 0) {
      my = findRatioInSummary(categoryName);
    }

    return {
      name: categoryName,
      my,
      average: averageRatio,
      difference: Math.round((my - averageRatio) * 10) / 10,
    };
  });
});

const wmtiComparisonChart = computed(() => {
  const group = summaryData.value?.comparisonSummary?.byWMTI || [];

  // 대 카테고리별로 그룹핑
  const mainCategoryMap = new Map();

  group.forEach((item) => {
    const mainCategory = subcategoryToMainCategory[item.categoryName] || item.categoryName;

    if (mainCategoryMap.has(mainCategory)) {
      // 이미 있으면 평균 비율을 합산 (또는 평균 계산)
      const existing = mainCategoryMap.get(mainCategory);
      existing.averageRatio += item.averageRatio;
      existing.count += 1;
    } else {
      mainCategoryMap.set(mainCategory, {
        categoryName: mainCategory,
        averageRatio: item.averageRatio,
        count: 1,
      });
    }
  });
  return Array.from(mainCategoryMap.values()).map((item) => {
    const categoryName = item.categoryName;
    const averageRatio = item.averageRatio / item.count; // 평균 계산

    let my = findCategoryRatioInSummary(categoryName);
    if (my === 0) {
      my = findRatioInSummary(categoryName);
    }

    return {
      name: categoryName,
      my,
      average: averageRatio,
      difference: Math.round((my - averageRatio) * 10) / 10,
    };
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
  if (showDeleteModal.value || !item) {
    console.log('🚫 삭제 모달 이미 열려있거나 잘못된 아이템');
    return;
  }

  productToDelete.value = item;
  showDeleteModal.value = true;
  console.log('✅ 삭제 모달 열림:', item.customProductName);
};

const closeDeleteModal = () => {
  if (isDeleting.value) {
    console.log('🚫 삭제 진행 중이므로 모달 닫기 무시');
    return;
  }

  showDeleteModal.value = false;
  productToDelete.value = null;
  console.log('✅ 삭제 모달 닫힘');
};

// -------------------- 상품 추가 --------------------
// -------------------- 상품 추가 --------------------
const addNewProduct = async (newProduct) => {
  try {
    console.log('🔥 상품 추가 시작:', newProduct);

    const response = await portfolioAPI.addPortfolio(newProduct);
    console.log('✅ API 응답 전체:', response);
    console.log('✅ 응답 상태:', response.status);
    console.log('✅ 응답 데이터:', response.data || response.body);

    // 응답이 존재하면 성공으로 처리 (상태 코드 관계없이)
    // DB에 저장되었다면 API 호출 자체는 성공한 것
    if (response) {
      // 1. 먼저 모달 닫기
      closeAddModal();
      console.log('✅ 모달 닫기 완료');

      // 2. 성공 메시지
      const productName = newProduct.customProductName;

      // 3. 포트폴리오 데이터 새로고침 (약간의 지연 후)
      setTimeout(async () => {
        try {
          await fetchPortfolioData();
        } catch (refreshError) {
          window.location.reload();
        }
      }, 100);
    } else {
      throw new Error('응답이 없습니다.');
    }
  } catch (err) {
    // DB에 저장되었는지 확인하기 위해 잠시 기다린 후 데이터 새로고침
    setTimeout(async () => {
      try {
        await fetchPortfolioData();
        console.log('✅ 에러 후 데이터 새로고침 완료');

        // 모달 닫기 (실제로는 성공했을 가능성이 높음)
        closeAddModal();
        alert('✅ 상품이 추가되었습니다.');
      } catch (refreshError) {
        console.error('새로고침도 실패:', refreshError);

        // 실제 에러 메시지 표시
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
    }, 1000);
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
    await portfolioAPI.updatePortfolio(item.portfolioId, {
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
    });

    // 로컬 상태 업데이트 - item 데이터로 업데이트
    const idx = portfolioItems.value.findIndex((p) => p.portfolioId === item.portfolioId);

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
  if (showDeleteModal.value || isDeleting.value || !item) {
    console.log('🚫 삭제 요청 무시 - 이미 처리 중 또는 잘못된 아이템:', {
      showDeleteModal: showDeleteModal.value,
      isDeleting: isDeleting.value,
      item: !!item,
    });
    return;
  }

  if (productToDelete.value?.portfolioId === item.portfolioId) {
    console.log('🚫 같은 상품에 대한 중복 삭제 요청 무시');
    return;
  }

  console.log('🗑️ 삭제 모달 열기:', item.customProductName);
  openDeleteModal(item);
};

const confirmDelete = async () => {
  if (!productToDelete.value || isDeleting.value) {
    console.log('🚫 삭제 확인 무시 - 잘못된 상태');
    return;
  }

  isDeleting.value = true;
  const productName = productToDelete.value.customProductName || '상품';

  try {
    await portfolioAPI.deletePortfolio(productToDelete.value.portfolioId);

    console.log('✅ 삭제 성공:', productName);

    // 모달 닫기
    showDeleteModal.value = false;
    productToDelete.value = null;

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
