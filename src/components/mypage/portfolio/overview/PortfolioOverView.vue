<template>
  <div class="tab-pane active">
    <!-- 총 자산 요약 -->
    <div class="row mb-4">
      <div class="col-12">
        <PortfolioSummaryCard
          :total-amount="totalAmount"
          :portfolio-count="portfolioItems.length"
          :category-count="processedSummary.length"
          :average-amount="averageAmount"
          :show-insights="true"
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
            <div v-if="processedSummary.length > 0" class="chart-container-small">
              <canvas
                ref="overviewPieChart"
                width="150"
                height="150"
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
              <small class="empty-subtitle">상품을 추가하여 자산 분배를 확인해보세요</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import PortfolioSummaryCard from './PortfolioSummaryCard.vue';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

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

// FinMate 브랜드 색상 팔레트 - JSON 데이터의 실제 카테고리명에 맞게 수정
const CATEGORY_COLORS = {
  예금: '#10B981',
  적금: '#3B82F6',
  보험: '#8B5CF6',
  연금: '#F59E0B',
  주식: '#EF4444',
  기타: '#6B7280',
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

// 접근성을 위한 차트 설명
const getChartAriaLabel = () => {
  const descriptions = props.processedSummary.map(
    (category) => `${category.categoryName} ${category.ratio.toFixed(1)}%`
  );
  return `자산 분배 현황: ${descriptions.join(', ')}`;
};

// Chart.js 로드
const loadChartJS = async () => {
  if (typeof window.Chart !== 'undefined') return;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    script.onload = () => {
      setTimeout(resolve, 100);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};
let isCreatingChart = false;

// 개요 차트 생성
const createOverviewChart = async () => {
  // 이미 차트를 생성 중이면 중단
  if (isCreatingChart) {
    return;
  }

  if (!overviewPieChart.value || props.processedSummary.length === 0) {
    console.log('차트 생성 조건 불만족:', {
      hasCanvas: !!overviewPieChart.value,
      dataLength: props.processedSummary.length,
    });
    return;
  }

  // 차트 생성 시작 플래그 설정
  isCreatingChart = true;
  isChartLoading.value = true;

  try {
    // 기존 차트 완전히 파괴
    if (overviewChartInstance) {
      overviewChartInstance.destroy();
      overviewChartInstance = null;
    }

    // Chart.js가 canvas를 완전히 해제할 때까지 잠시 대기
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Chart.js 로드 확인
    await loadChartJS();

    // canvas 요소가 여전히 존재하는지 확인
    if (!overviewPieChart.value) {
      return;
    }

    const ctx = overviewPieChart.value.getContext('2d');

    // canvas 상태 초기화
    ctx.clearRect(0, 0, overviewPieChart.value.width, overviewPieChart.value.height);

    const gradients = props.processedSummary.map((item) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      const baseColor = getCategoryColor(item.categoryName);

      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, adjustColorOpacity(baseColor, 0.7));

      return gradient;
    });

    // eslint-disable-next-line no-undef
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
              padding: 10,
              font: {
                size: 11,
                family: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
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
                const amount = props.processedSummary[context.dataIndex]?.totalAmount || 0;
                return `${label}: ${value.toFixed(1)}% (${formatCurrency(amount)})`;
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
    // 에러 발생 시에도 차트 인스턴스 정리
    if (overviewChartInstance) {
      overviewChartInstance.destroy();
      overviewChartInstance = null;
    }
  } finally {
    isChartLoading.value = false;
    // 차트 생성 완료 플래그 해제
    isCreatingChart = false;
  }
};

// 메트릭 포커스 핸들러
const handleMetricFocus = (metric) => {
  emit('focus-metric', metric);
};

// 컴포넌트 정리
const cleanup = () => {
  if (overviewChartInstance) {
    try {
      overviewChartInstance.destroy();
    } catch (error) {
      showToast('차트 정리 중 오류가 발생했습니다.', 'error');
    } finally {
      overviewChartInstance = null;
    }
  }
};

let chartUpdateTimeout = null;

// 데이터 변경 감지
watch(
  () => props.processedSummary,
  (newData) => {
    // 기존 타이머 취소
    if (chartUpdateTimeout) {
      clearTimeout(chartUpdateTimeout);
    }

    if (newData && newData.length > 0) {
      // 300ms 디바운싱으로 불필요한 차트 재생성 방지 (시간 증가)
      chartUpdateTimeout = setTimeout(() => {
        nextTick(() => {
          createOverviewChart();
        });
      }, 300);
    } else {
      // 데이터가 없으면 차트 정리
      cleanup();
    }
  },
  { deep: true, immediate: false }
);

// 생명주기 훅 - 수정된 버전
onMounted(() => {
  // 초기 데이터가 있으면 차트 생성
  if (props.processedSummary && props.processedSummary.length > 0) {
    setTimeout(createOverviewChart, 200);
  }
});
onBeforeUnmount(() => {
  // 타이머 정리
  if (chartUpdateTimeout) {
    clearTimeout(chartUpdateTimeout);
    chartUpdateTimeout = null;
  }

  // 차트 정리
  cleanup();
});
</script>

<style scoped>
.tab-pane {
  min-height: 25rem;
  width: 100%;
  max-width: 26.875rem;
  margin: 0 auto;
}

.stats-card {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 26.875rem;
  width: 100%;
  margin: 0 auto;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-header {
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
}

.stats-title {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
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
  height: 15rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
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
}

.total-label {
  font-size: 0.7rem;
  color: var(--color-sub);
  font-weight: 500;
  margin-top: 0.25rem;
}

/* 빈 상태 */
.chart-empty-state {
  background: var(--color-bg-light);
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--color-bg-light);
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
</style>
