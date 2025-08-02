<template>
  <div class="tab-pane active">
    <!-- 총 자산 요약 -->
    <div class="row mb-4">
      <div class="col-12">
        <PortfolioSummaryCard
          :totalAmount="totalAmount"
          :portfolioCount="portfolioItems.length"
          :categoryCount="processedSummary.length"
          :averageAmount="averageAmount"
          :showInsights="true"
          @focus-metric="handleMetricFocus"
        />
      </div>
    </div>

    <!-- 자산 분배 현황 -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="stats-card">
          <div class="stats-header">
            <h5 class="stats-title">
              <i class="fas fa-chart-pie me-2"></i>
              자산 분배 현황
            </h5>
            <small class="stats-subtitle">
              {{
                processedSummary.length > 0
                  ? `${processedSummary.length}개 카테고리`
                  : '분배 정보 없음'
              }}
            </small>
          </div>

          <div class="stats-content">
            <div
              v-if="processedSummary.length > 0"
              class="chart-container-small"
            >
              <canvas
                ref="overviewPieChart"
                width="200"
                height="200"
                :aria-label="getChartAriaLabel()"
              ></canvas>

              <!-- 중앙 총액 표시 -->
              <div class="chart-center-info">
                <div class="total-amount">
                  {{ formatCurrency(totalAmount) }}
                </div>
                <div class="total-label">총 자산</div>
              </div>
            </div>

            <!-- 빈 상태 -->
            <div v-else class="chart-empty-state">
              <div class="empty-icon">
                <i class="fas fa-chart-pie"></i>
              </div>
              <p class="empty-text">투자 상품이 없습니다</p>
              <small class="empty-subtitle"
                >상품을 추가하여 자산 분배를 확인해보세요</small
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 간단한 분석 -->
    <div class="row" v-if="processedSummary.length > 0">
      <div class="col-12">
        <div class="stats-card analysis-card">
          <div class="stats-header">
            <h5 class="stats-title">
              <i class="fas fa-lightbulb me-2"></i>
              포트폴리오 분석
            </h5>
          </div>

          <div class="stats-content">
            <div class="analysis-content">
              <div class="analysis-item">
                <div class="analysis-icon">
                  <i class="fas fa-shield-alt"></i>
                </div>
                <div class="analysis-text">
                  <h6>안정성 평가</h6>
                  <p>{{ getStabilityAnalysis() }}</p>
                </div>
              </div>

              <div class="analysis-item">
                <div class="analysis-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="analysis-text">
                  <h6>성장 가능성</h6>
                  <p>{{ getGrowthAnalysis() }}</p>
                </div>
              </div>

              <div class="analysis-item">
                <div class="analysis-icon">
                  <i class="fas fa-bullseye"></i>
                </div>
                <div class="analysis-text">
                  <h6>추천 사항</h6>
                  <p>{{ getRecommendation() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  ref,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
  computed,
} from 'vue';
import PortfolioSummaryCard from './PortfolioSummaryCard.vue';

const props = defineProps({
  portfolioItems: {
    type: Array,
    required: true,
    default: () => [],
  },
  processedSummary: {
    type: Array,
    required: true,
    default: () => [],
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  averageAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  topCategory: {
    type: Object,
    default: null,
  },
  diversityScore: {
    type: Number,
    required: true,
    default: 0,
  },
  recentProduct: {
    type: Object,
    default: null,
  },
});

// 이벤트 정의
const emit = defineEmits(['focus-metric']);

// 반응형 데이터
const overviewPieChart = ref(null);
let overviewChartInstance = null;
let isChartLoading = ref(false);

// FinMate 브랜드 색상 팔레트
const CATEGORY_COLORS = {
  예금: '#2d336b',
  적금: '#7d81a2',
  펀드: '#b9bbcc',
  대출: '#9ca0b8',
  보험: '#6b7394',
  연금: '#5a6085',
  투자: '#4a5578',
  기타: '#8a8ea6',
};

// 색상 가져오기
const getCategoryColor = (categoryName) => {
  return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS['기타'];
};

// 색상 투명도 조절
const adjustColorOpacity = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// 통화 포맷팅
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '0원';

  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remainder = amount % 100000000;
    if (remainder === 0) {
      return `${eok}억원`;
    } else {
      const man = Math.floor(remainder / 10000);
      return `${eok}억 ${man}만원`;
    }
  }

  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    } else {
      return `${man}만 ${remainder.toLocaleString()}원`;
    }
  }

  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 접근성을 위한 차트 설명
const getChartAriaLabel = () => {
  const descriptions = props.processedSummary.map(
    (category) => `${category.categoryName} ${category.ratio.toFixed(1)}%`
  );
  return `자산 분배 현황: ${descriptions.join(', ')}`;
};

// 안정성 분석
const getStabilityAnalysis = () => {
  const depositRatio =
    props.processedSummary.find((cat) => cat.categoryName === '예금')?.ratio ||
    0;
  const savingsRatio =
    props.processedSummary.find((cat) => cat.categoryName === '적금')?.ratio ||
    0;
  const safeRatio = depositRatio + savingsRatio;

  if (safeRatio > 70) return '매우 안정적인 포트폴리오입니다';
  if (safeRatio > 50) return '안정성이 높은 구성입니다';
  if (safeRatio > 30) return '균형 잡힌 안정성을 보입니다';
  return '공격적인 투자 성향입니다';
};

// 성장 가능성 분석
const getGrowthAnalysis = () => {
  const fundRatio =
    props.processedSummary.find((cat) => cat.categoryName === '펀드')?.ratio ||
    0;
  const investRatio =
    props.processedSummary.find((cat) => cat.categoryName === '투자')?.ratio ||
    0;
  const growthRatio = fundRatio + investRatio;

  if (growthRatio > 30) return '높은 성장 잠재력을 가지고 있습니다';
  if (growthRatio > 15) return '적정한 성장 기회를 확보했습니다';
  if (growthRatio > 0) return '보수적이지만 안정적인 성장 추구';
  return '안전 자산 중심의 보수적 운용';
};

// 추천 사항
const getRecommendation = () => {
  const categoryCount = props.processedSummary.length;
  const totalAmount = props.totalAmount;

  if (categoryCount <= 1) {
    return '투자 다양성을 높이기 위해 다른 카테고리 상품을 고려해보세요';
  }

  if (totalAmount < 10000000) {
    return '꾸준한 적립으로 자산 규모를 늘려나가세요';
  }

  if (categoryCount >= 3 && totalAmount >= 50000000) {
    return '현재 포트폴리오를 유지하며 정기적으로 리밸런싱하세요';
  }

  return '현재 수준을 유지하며 점진적으로 확장해보세요';
};

// Chart.js 로드
const loadChartJS = async () => {
  if (typeof window.Chart !== 'undefined') return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    script.onload = () => {
      setTimeout(resolve, 100);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// 개요 차트 생성
const createOverviewChart = async () => {
  if (!overviewPieChart.value || props.processedSummary.length === 0) return;

  isChartLoading.value = true;

  try {
    if (overviewChartInstance) {
      overviewChartInstance.destroy();
      overviewChartInstance = null;
    }

    await loadChartJS();

    const ctx = overviewPieChart.value.getContext('2d');

    const gradients = props.processedSummary.map((item) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      const baseColor = getCategoryColor(item.categoryName);

      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, adjustColorOpacity(baseColor, 0.7));

      return gradient;
    });

    overviewChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: props.processedSummary.map((item) => item.categoryName),
        datasets: [
          {
            data: props.processedSummary.map((item) => item.ratio),
            backgroundColor: gradients,
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverBorderWidth: 4,
            hoverBorderColor: '#f8f9fa',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 11,
                family:
                  "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
              },
              color: '#2d336b',
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(45, 51, 107, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#7d81a2',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const amount =
                  props.processedSummary[context.dataIndex]?.totalAmount || 0;
                return `${label}: ${value.toFixed(1)}% (${formatCurrency(
                  amount
                )})`;
              },
            },
          },
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart',
        },
        hover: {
          animationDuration: 300,
        },
      },
    });
  } catch (error) {
    console.error('개요 차트 생성 실패:', error);
  } finally {
    isChartLoading.value = false;
  }
};

// 메트릭 포커스 핸들러
const handleMetricFocus = (metric) => {
  emit('focus-metric', metric);
};

// 컴포넌트 정리
const cleanup = () => {
  if (overviewChartInstance) {
    overviewChartInstance.destroy();
    overviewChartInstance = null;
  }
};

// 데이터 변경 감지
watch(
  () => props.processedSummary,
  (newData) => {
    if (newData && newData.length > 0) {
      nextTick(() => {
        setTimeout(createOverviewChart, 100);
      });
    }
  },
  { deep: true }
);

// 생명주기 훅
onMounted(() => {
  setTimeout(createOverviewChart, 200);
});

onBeforeUnmount(cleanup);
</script>

<style scoped>
.tab-pane {
  min-height: 25rem;
  width: 100%;
  max-width: 26.875rem;
  margin: 0 auto;
}

.stats-card {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(45, 51, 107, 0.1),
    0 2px 4px -1px rgba(45, 51, 107, 0.06);
  border: 1px solid rgba(185, 187, 204, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 26.875rem;
  width: 100%;
  margin: 0 auto;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(45, 51, 107, 0.15);
}

.stats-header {
  margin-bottom: 1.25rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
}

.stats-title {
  color: var(--color-main);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
}

.stats-title i {
  color: var(--color-sub);
}

.stats-subtitle {
  color: var(--color-sub);
  font-weight: 500;
  font-size: 0.85rem;
}

.chart-container-small {
  position: relative;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  backdrop-filter: blur(5px);
}

.chart-center-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -80%);
  text-align: center;
  pointer-events: none;
}

.total-amount {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-main);
  font-family: 'Pretendard', sans-serif;
}

.total-label {
  font-size: 0.7rem;
  color: var(--color-sub);
  font-weight: 500;
  margin-top: 0.25rem;
}

/* 빈 상태 */
.chart-empty-state {
  background: linear-gradient(
    135deg,
    rgba(185, 187, 204, 0.1) 0%,
    rgba(125, 129, 162, 0.1) 100%
  );
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
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
}

.empty-icon i {
  font-size: 1.25rem;
  color: white;
}

.empty-text {
  color: var(--color-main);
  font-weight: 600;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  color: var(--color-sub);
  font-size: 0.85rem;
}

/* 분석 카드 */
.analysis-card {
  border: 2px solid rgba(185, 187, 204, 0.2);
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.analysis-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.analysis-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--color-light) 0%,
    var(--color-sub) 100%
  );
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.analysis-text {
  flex: 1;
}

.analysis-text h6 {
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.analysis-text p {
  color: var(--color-sub);
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
}

/* 반응형 */
@media (max-width: 480px) {
  .tab-pane {
    max-width: none;
  }

  .stats-card {
    max-width: none;
    padding: 1rem;
  }

  .chart-container-small {
    height: 180px;
    padding: 0.75rem;
  }

  .metrics-grid {
    gap: 0.75rem;
  }

  .metric-item {
    padding: 0.75rem;
  }

  .analysis-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
