<template>
  <div class="same-wmti-comparison">
    <!-- 헤더 -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="bi bi-people me-2"></i>
        {{ myWMTI }} 동료들과 비교
      </h2>
      <p class="page-subtitle">
        나와 같은 <strong>{{ myWMTI }}</strong> 투자성향을 가진 사용자들의 평균
        포트폴리오입니다
      </p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">{{ loadingMessage }}</p>
    </div>

    <!-- 메인 컨텐츠 -->
    <div v-else class="content-area">
      <!-- 내 WMTI 정보 카드 -->
      <div class="my-wmti-card mb-4">
        <div class="wmti-info">
          <div class="wmti-badge">
            <span class="wmti-code">{{ myWMTI }}</span>
          </div>
          <div class="wmti-details">
            <h5 class="wmti-name">{{ getWMTIFullName(myWMTI) }}</h5>
            <p class="wmti-description">{{ getWMTIDescription(myWMTI) }}</p>
          </div>
        </div>
        <div class="comparison-note">
          <i class="bi bi-info-circle me-2"></i>
          <span>{{ sameWMTIUsers }}명의 동료 투자자와 비교 중</span>
        </div>
      </div>

      <!-- 비교 통계 요약 -->
      <div class="comparison-stats mb-4">
        <div class="row">
          <div class="col-4">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="bi bi-person-check"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">
                  {{ sameWMTIUsers.toLocaleString() }}
                </div>
                <div class="stat-label">동료 수</div>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="bi bi-pie-chart"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ portfolioSummary.length }}</div>
                <div class="stat-label">상품 종류</div>
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="bi bi-trophy"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">
                  {{ topCategory?.categoryName || '-' }}
                </div>
                <div class="stat-label">인기 1위</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 나 vs 동료들 비교 -->
      <div
        v-if="portfolioSummary.length > 0 && myPortfolio.length > 0"
        class="comparison-section"
      >
        <!-- 섹션 헤더 -->
        <div class="section-header mb-3">
          <h5 class="section-title">
            <i class="bi bi-bar-chart-line me-2"></i>
            나 vs {{ myWMTI }} 동료들
          </h5>
          <small class="section-subtitle">
            각 상품별 나의 비율과 동료들의 평균 비율을 비교해보세요
          </small>
        </div>

        <!-- 비교 리스트 -->
        <div class="comparison-list">
          <div
            v-for="(item, index) in comparisonData"
            :key="item.categoryName"
            class="comparison-item"
            :style="{ animationDelay: index * 0.1 + 's' }"
          >
            <!-- 카테고리 헤더 -->
            <div class="item-header">
              <div class="category-info">
                <span
                  class="category-icon"
                  :style="{
                    backgroundColor: getCategoryColor(item.categoryName),
                  }"
                >
                  <i :class="getCategoryIcon(item.categoryName)"></i>
                </span>
                <div class="category-details">
                  <h6 class="category-name">{{ item.categoryName }}</h6>
                  <small
                    class="category-status"
                    :class="getComparisonClass(item.difference)"
                  >
                    <i
                      :class="getDifferenceIcon(item.difference)"
                      class="me-1"
                    ></i>
                    {{ getComparisonText(item.difference) }}
                  </small>
                </div>
              </div>
              <div
                class="difference-badge"
                :class="getComparisonClass(item.difference)"
              >
                {{ item.difference >= 0 ? '+' : ''
                }}{{ item.difference.toFixed(1) }}%
              </div>
            </div>

            <!-- 비교 차트 -->
            <div class="comparison-chart">
              <!-- 내 비율 -->
              <div class="chart-row my-row">
                <div class="chart-label">
                  <span class="label-text">나</span>
                  <span class="label-value"
                    >{{ item.myRatio.toFixed(1) }}%</span
                  >
                </div>
                <div class="chart-bar-container">
                  <div
                    class="chart-bar my-bar"
                    :style="{ width: getBarWidth(item.myRatio) + '%' }"
                  ></div>
                </div>
              </div>

              <!-- 평균 비율 -->
              <div class="chart-row avg-row">
                <div class="chart-label">
                  <span class="label-text">평균</span>
                  <span class="label-value"
                    >{{ item.avgRatio.toFixed(1) }}%</span
                  >
                </div>
                <div class="chart-bar-container">
                  <div
                    class="chart-bar avg-bar"
                    :style="{ width: getBarWidth(item.avgRatio) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 인사이트 카드 -->
        <div class="insights-card mt-4">
          <div class="insights-header">
            <h6 class="insights-title">
              <i class="bi bi-lightbulb me-2"></i>
              나의 투자 패턴 분석
            </h6>
          </div>
          <div class="insights-content">
            <div
              v-for="insight in getPersonalInsights()"
              :key="insight.text"
              class="insight-item"
            >
              <div class="insight-icon" :class="insight.type">
                <i :class="insight.icon"></i>
              </div>
              <div class="insight-text">
                <strong>{{ insight.title }}</strong>
                <p>{{ insight.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 내 포트폴리오가 없는 경우 -->
      <div v-else-if="myPortfolio.length === 0" class="empty-my-portfolio">
        <div class="empty-icon">
          <i class="bi bi-wallet2"></i>
        </div>
        <h5 class="empty-title">내 포트폴리오를 등록해주세요</h5>
        <p class="empty-text">
          포트폴리오를 등록하면 {{ myWMTI }} 동료들과 비교 분석을 받을 수
          있어요!
        </p>
        <button @click="goToPortfolio" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i>
          포트폴리오 등록하기
        </button>
      </div>

      <!-- 비교 데이터가 없는 경우 -->
      <div v-else class="empty-comparison">
        <div class="empty-icon">
          <i class="bi bi-graph-up"></i>
        </div>
        <h5 class="empty-title">비교 데이터 준비 중</h5>
        <p class="empty-text">
          {{ myWMTI }} 동료들의 데이터를 수집 중입니다.<br />
          곧 정확한 비교 분석을 제공해드릴게요!
        </p>
        <button @click="loadData" class="btn btn-outline-primary">
          <i class="bi bi-arrow-clockwise me-2"></i>
          다시 시도
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// Props (필요시 부모에서 전달)
const props = defineProps({
  myWMTI: {
    type: String,
    default: 'AILP', // 실제로는 사용자의 WMTI 타입
  },
});

// 반응형 데이터
const loading = ref(false);
const loadingMessage = ref('데이터를 불러오는 중...');
const portfolioSummary = ref([]); // API에서 받은 동료들의 평균 데이터
const myPortfolio = ref([]); // 내 포트폴리오 데이터
const sameWMTIUsers = ref(1250); // 같은 WMTI 사용자 수

// Mock 데이터
const mockPortfolioSummary = [
  { categoryName: '해외주식', averageRatio: 55.2 },
  { categoryName: '전세자금대출', averageRatio: 26.5 },
  { categoryName: '신용대출', averageRatio: 18.3 },
  { categoryName: '국내주식', averageRatio: 45.7 },
  { categoryName: '예금', averageRatio: 12.4 },
];

const mockMyPortfolio = [
  { categoryName: '해외주식', ratio: 60.0 },
  { categoryName: '전세자금대출', ratio: 20.0 },
  { categoryName: '신용대출', ratio: 15.0 },
  { categoryName: '국내주식', ratio: 40.0 },
  { categoryName: '예금', ratio: 8.5 },
];

// 컴퓨티드
const topCategory = computed(() => {
  if (portfolioSummary.value.length === 0) return null;
  return [...portfolioSummary.value].sort(
    (a, b) => b.averageRatio - a.averageRatio
  )[0];
});

const comparisonData = computed(() => {
  if (!portfolioSummary.value.length || !myPortfolio.value.length) return [];

  return portfolioSummary.value
    .map((avgItem) => {
      const myItem = myPortfolio.value.find(
        (my) => my.categoryName === avgItem.categoryName
      );
      const myRatio = myItem ? myItem.ratio : 0;
      const difference = myRatio - avgItem.averageRatio;

      return {
        categoryName: avgItem.categoryName,
        avgRatio: avgItem.averageRatio,
        myRatio: myRatio,
        difference: difference,
      };
    })
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)); // 차이가 큰 순으로 정렬
});

const maxRatio = computed(() => {
  const allRatios = comparisonData.value.flatMap((item) => [
    item.myRatio,
    item.avgRatio,
  ]);
  return Math.max(...allRatios, 0);
});

// API 호출
const loadData = async () => {
  loading.value = true;
  loadingMessage.value = '동료들의 데이터를 불러오는 중...';

  try {
    // 실제 API 호출
    // const response = await axios.get('/api/portfolio/summary');
    // portfolioSummary.value = response.data.byWMTI || [];

    // 내 포트폴리오도 가져오기 (실제 구현)
    // const myResponse = await axios.get('/api/portfolio/my');
    // myPortfolio.value = myResponse.data.categories || [];

    // Mock 데이터 사용
    await new Promise((resolve) => setTimeout(resolve, 1000));
    portfolioSummary.value = mockPortfolioSummary;
    myPortfolio.value = mockMyPortfolio;

    console.log('✅ 비교 데이터 로드 완료');
  } catch (error) {
    console.error('❌ 데이터 로드 실패:', error);
    portfolioSummary.value = [];
    myPortfolio.value = [];
  } finally {
    loading.value = false;
  }
};

// 유틸리티 함수들
const getWMTIFullName = (wmti) => {
  const names = {
    AILP: '공격투자형',
    MILC: '중립투자형',
    CIWB: '안정추구형',
    AMLP: '적극성장형',
    BILC: '균형투자형',
    CIMB: '보수안정형',
  };
  return names[wmti] || wmti;
};

const getWMTIDescription = (wmti) => {
  const descriptions = {
    AILP: '높은 수익을 위해 적극적으로 위험을 감수하는 투자성향',
    MILC: '적절한 수익과 안정성의 균형을 추구하는 투자성향',
    CIWB: '원금보장을 최우선으로 하는 안정적인 투자성향',
  };
  return descriptions[wmti] || '나만의 독특한 투자성향을 가지고 있어요';
};

const getCategoryIcon = (categoryName) => {
  const icons = {
    해외주식: 'bi-globe',
    국내주식: 'bi-graph-up',
    예금: 'bi-piggy-bank',
    적금: 'bi-safe',
    전세자금대출: 'bi-house',
    신용대출: 'bi-credit-card',
    보험: 'bi-shield-check',
    펀드: 'bi-briefcase',
    암호화폐: 'bi-currency-bitcoin',
    채권: 'bi-file-earmark-text',
  };
  return icons[categoryName] || 'bi-circle';
};

const getCategoryColor = (categoryName) => {
  const colors = {
    해외주식: '#dc3545',
    국내주식: '#198754',
    예금: '#0d6efd',
    적금: '#6f42c1',
    전세자금대출: '#fd7e14',
    신용대출: '#20c997',
    보험: '#6610f2',
    펀드: '#d63384',
    암호화폐: '#ffc107',
    채권: '#495057',
  };
  return colors[categoryName] || '#6c757d';
};

const getComparisonClass = (difference) => {
  if (Math.abs(difference) < 2) return 'similar';
  return difference > 0 ? 'higher' : 'lower';
};

const getDifferenceIcon = (difference) => {
  if (Math.abs(difference) < 2) return 'bi-dash';
  return difference > 0 ? 'bi-arrow-up' : 'bi-arrow-down';
};

const getComparisonText = (difference) => {
  if (Math.abs(difference) < 2) return '비슷한 수준';
  if (difference > 10) return '훨씬 높음';
  if (difference > 5) return '높은 편';
  if (difference > 0) return '약간 높음';
  if (difference > -5) return '약간 낮음';
  if (difference > -10) return '낮은 편';
  return '훨씬 낮음';
};

const getBarWidth = (ratio) => {
  return maxRatio.value > 0 ? (ratio / maxRatio.value) * 100 : 0;
};

const getPersonalInsights = () => {
  const insights = [];

  comparisonData.value.forEach((item) => {
    if (item.difference > 10) {
      insights.push({
        type: 'positive',
        icon: 'bi-arrow-up-circle',
        title: `${item.categoryName} 집중 투자`,
        text: `동료들보다 ${item.difference.toFixed(
          1
        )}%p 더 높은 비중으로 투자하고 있어요`,
      });
    } else if (item.difference < -10) {
      insights.push({
        type: 'negative',
        icon: 'bi-arrow-down-circle',
        title: `${item.categoryName} 비중 낮음`,
        text: `동료들보다 ${Math.abs(item.difference).toFixed(
          1
        )}%p 낮은 비중이에요`,
      });
    }
  });

  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      icon: 'bi-check-circle',
      title: '균형잡힌 포트폴리오',
      text: '동료들과 비슷한 수준의 분산투자를 하고 있어요',
    });
  }

  return insights.slice(0, 3); // 최대 3개까지만
};

const goToPortfolio = () => {
  console.log('포트폴리오 등록 페이지로 이동');
  // 실제 구현: this.$router.push('/portfolio/add');
};

// 생명주기
onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* FinMate Color Variables */
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
  --color-white: #ffffff;
}

.same-wmti-comparison {
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  background: var(--color-bg-light);
}

/* Header */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-subtitle {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

/* Content Area */
.content-area {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.08);
}

/* 내 WMTI 카드 */
.my-wmti-card {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  border-radius: 1rem;
  padding: 1.5rem;
  color: var(--color-white);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.2);
}

.wmti-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.wmti-badge {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.wmti-code {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.wmti-details {
  flex: 1;
}

.wmti-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.wmti-description {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

.comparison-note {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
}

/* 통계 카드 */
.comparison-stats {
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--color-bg-light);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  border: 1px solid rgba(185, 187, 204, 0.3);
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.1);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-main);
  font-size: 1.125rem;
  box-shadow: 0 2px 4px rgba(45, 51, 107, 0.1);
}

.stat-info {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.125rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
}

/* 섹션 헤더 */
.section-header {
  margin-bottom: 1rem;
}

.section-title {
  color: var(--color-main);
  font-weight: 600;
  font-size: 1.125rem;
  margin: 0 0 0.25rem 0;
}

.section-subtitle {
  color: var(--color-sub);
  font-size: 0.8rem;
  line-height: 1.4;
}

/* 비교 아이템 */
.comparison-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comparison-item {
  background: var(--color-bg-light);
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 1rem;
  padding: 1rem;
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out both;
}

.comparison-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 51, 107, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 1.125rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-details {
  display: flex;
  flex-direction: column;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 0.25rem 0;
}

.category-status {
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.category-status.higher {
  color: #198754;
}

.category-status.lower {
  color: #dc3545;
}

.category-status.similar {
  color: var(--color-sub);
}

.difference-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.difference-badge.higher {
  background: rgba(25, 135, 84, 0.1);
  color: #198754;
}

.difference-badge.lower {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.difference-badge.similar {
  background: rgba(125, 129, 162, 0.1);
  color: var(--color-sub);
}

/* 비교 차트 */
.comparison-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chart-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chart-label {
  min-width: 4rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.label-text {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
}

.label-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
}

.chart-bar-container {
  flex: 1;
  height: 0.5rem;
  background: rgba(185, 187, 204, 0.2);
  border-radius: 0.25rem;
  overflow: hidden;
}

.chart-bar {
  height: 100%;
  border-radius: 0.25rem;
  transition: width 0.8s ease-out;
}

.my-bar {
  background: linear-gradient(
    90deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
}

.avg-bar {
  background: linear-gradient(90deg, var(--color-light) 0%, #9ca0b8 100%);
}

/* 인사이트 카드 */
.insights-card {
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.05) 0%,
    rgba(125, 129, 162, 0.05) 100%
  );
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 1rem;
  padding: 1rem;
}

.insights-title {
  color: var(--color-main);
  font-weight: 600;
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.insights-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-white);
  border-radius: 0.5rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.insight-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: var(--color-white);
  flex-shrink: 0;
}

.insight-icon.positive {
  background: #198754;
}

.insight-icon.negative {
  background: #dc3545;
}

.insight-icon.neutral {
  background: var(--color-sub);
}

.insight-text {
  flex: 1;
}

.insight-text strong {
  color: var(--color-main);
  font-size: 0.875rem;
  display: block;
  margin-bottom: 0.25rem;
}

.insight-text p {
  color: var(--color-sub);
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.4;
}

/* Empty States */
.empty-my-portfolio,
.empty-comparison {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-light) 0%,
    var(--color-sub) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
  color: var(--color-white);
}

.empty-title {
  color: var(--color-main);
  font-weight: 600;
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
}

.btn-primary {
  background-color: var(--color-main);
  border-color: var(--color-main);
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-sub);
  border-color: var(--color-sub);
  transform: translateY(-1px);
}

.btn-outline-primary {
  color: var(--color-main);
  border-color: var(--color-main);
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-outline-primary:hover {
  background-color: var(--color-main);
  border-color: var(--color-main);
  transform: translateY(-1px);
}

/* Loading State */
.spinner-border {
  color: var(--color-main) !important;
  width: 2rem;
  height: 2rem;
}

/* 애니메이션 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comparison-item:nth-child(1) {
  animation-delay: 0.1s;
}
.comparison-item:nth-child(2) {
  animation-delay: 0.2s;
}
.comparison-item:nth-child(3) {
  animation-delay: 0.3s;
}
.comparison-item:nth-child(4) {
  animation-delay: 0.4s;
}
.comparison-item:nth-child(5) {
  animation-delay: 0.5s;
}

/* 반응형 디자인 */
@media (max-width: 26.875rem) {
  .same-wmti-comparison {
    padding: 0.75rem;
  }

  .content-area {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.375rem;
  }

  .my-wmti-card {
    padding: 1rem;
  }

  .wmti-info {
    gap: 0.75rem;
  }

  .wmti-badge {
    width: 3rem;
    height: 3rem;
  }

  .wmti-code {
    font-size: 0.875rem;
  }

  .wmti-name {
    font-size: 1.125rem;
  }

  .wmti-description {
    font-size: 0.8rem;
  }

  .comparison-stats .row {
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .stat-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .stat-value {
    font-size: 1rem;
  }

  .comparison-item {
    padding: 0.75rem;
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .category-info {
    width: 100%;
  }

  .category-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .difference-badge {
    align-self: flex-end;
  }

  .chart-row {
    gap: 0.5rem;
  }

  .chart-label {
    min-width: 3.5rem;
  }

  .label-text,
  .label-value {
    font-size: 0.75rem;
  }

  .insights-card {
    padding: 0.75rem;
  }

  .insight-item {
    padding: 0.5rem;
  }

  .insight-icon {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }

  .insight-text strong {
    font-size: 0.8rem;
  }

  .insight-text p {
    font-size: 0.75rem;
  }

  .empty-my-portfolio,
  .empty-comparison {
    padding: 2rem 1rem;
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .comparison-item,
  .stat-card,
  .chart-bar {
    animation: none;
    transition: none;
  }
}

/* 고대비 모드 */
@media (prefers-contrast: high) {
  .difference-badge.higher,
  .category-status.higher {
    background: #198754;
    color: #fff;
  }

  .difference-badge.lower,
  .category-status.lower {
    background: #dc3545;
    color: #fff;
  }

  .difference-badge.similar,
  .category-status.similar {
    background: var(--color-sub);
    color: #fff;
  }
}

/* 다크 모드 준비 */
@media (prefers-color-scheme: dark) {
  .same-wmti-comparison {
    background: #1a1a1a;
  }

  .content-area {
    background: #2d2d2d;
    color: #ffffff;
  }

  .stat-card {
    background: #3d3d3d;
    border-color: #666;
  }

  .comparison-item {
    background: #3d3d3d;
    border-color: #666;
  }

  .insights-card {
    background: rgba(255, 255, 255, 0.05);
    border-color: #666;
  }

  .insight-item {
    background: #4d4d4d;
    border-color: #666;
  }
}

/* 호버 효과 강화 */
.comparison-item:hover .category-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.comparison-item:hover .chart-bar {
  filter: brightness(1.1);
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
  background: var(--color-main);
  color: var(--color-white);
}

/* 프로그레스 바 애니메이션 지연 */
.my-row .chart-bar {
  animation-delay: 0.2s;
}

.avg-row .chart-bar {
  animation-delay: 0.4s;
}

/* 유틸리티 클래스 */
.me-1 {
  margin-right: 0.25rem;
}
.me-2 {
  margin-right: 0.5rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-3 {
  margin-bottom: 1rem;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
.mt-2 {
  margin-top: 0.5rem;
}
.mt-3 {
  margin-top: 1rem;
}
.mt-4 {
  margin-top: 1.5rem;
}
.py-5 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}
.text-center {
  text-align: center;
}
</style>
