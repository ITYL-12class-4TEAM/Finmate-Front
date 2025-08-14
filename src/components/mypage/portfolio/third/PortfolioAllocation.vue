<template>
  <div class="tab-pane active">
    <div class="row">
      <!-- 파이 차트 섹션 -->
      <div class="mb-4">
        <div class="stats-card">
          <div class="stats-header">
            <h5 class="stats-title">
              <i class="bi bi-pie-chart me-2"></i>
              카테고리별 자산 분배
            </h5>
            <small class="stats-subtitle"> 총 {{ processedSummary.length }}개 카테고리 </small>
            <!-- http://localhost:5173/wmti/result 여기로 가는 라우팅 버튼 -->
          </div>

          <div class="stats-content">
            <!-- 차트 영역 -->
            <div v-if="processedSummary.length > 0" class="chart-container">
              <canvas
                ref="pieChart"
                width="200"
                height="200"
                :aria-label="getChartAriaLabel()"
              ></canvas>

              <!-- 중앙 총액 표시 (도넛 차트 중앙) -->
              <div class="chart-center-info">
                <div class="total-amount">
                  {{ formatCurrency(getTotalAmount()) }}
                </div>
                <div class="total-label">총 자산</div>
              </div>
            </div>

            <!-- 빈 상태 -->
            <div v-else class="empty-state">
              <div class="empty-icon">
                <i class="bi bi-pie-chart"></i>
              </div>
              <p class="empty-text">투자 상품이 없습니다.</p>
              <small class="empty-subtitle">상품을 추가하여 자산 분배를 확인해보세요</small>
            </div>

            <!-- 범례 -->
            <div v-if="processedSummary.length > 0" class="chart-legend">
              <div
                v-for="(category, index) in processedSummary"
                :key="category.categoryName"
                class="legend-item"
                :class="{ 'legend-hidden': hiddenCategories.has(index) }"
                @click="toggleCategoryVisibility(index)"
              >
                <div class="legend-info">
                  <div class="legend-indicator">
                    <div
                      class="legend-color"
                      :style="{
                        backgroundColor: getCategoryColor(category.categoryName),
                      }"
                    ></div>
                    <span class="legend-name">{{ category.categoryName }}</span>
                  </div>
                  <div class="legend-values">
                    <div class="legend-percentage">{{ category.ratio.toFixed(1) }}%</div>
                    <div class="legend-amount">
                      {{ formatCurrency(category.totalAmount) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 서브카테고리 분석 섹션 -->
      <div>
        <SubcategoryBreakdown :processed-summary="processedSummary" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
import SubcategoryBreakdown from './SubcategoryBreakdown.vue';
import { Chart } from 'chart.js/auto';

const props = defineProps({
  processedSummary: {
    type: Array,
    required: true,
    default: () => [],
  },
});

// 반응형 데이터
const pieChart = ref(null);
const hiddenCategories = ref(new Set());
let chartInstance = null;
let isChartLoading = ref(false);

// 6개 메인 카테고리에 맞춘 색상 팔레트
const CATEGORY_COLORS = {
  예금: '#2d336b', // 진한 네이비
  적금: '#5a6085', // 미디엄 네이비
  보험: '#6b7394', // 그레이 네이비
  대출: '#9ca0b8', // 라이트 그레이
  주식: '#7d81a2', // 퍼플 그레이
  기타: '#8a8ea6', // 중간 그레이
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

// 총 자산 계산
const getTotalAmount = () => {
  return props.processedSummary.reduce((sum, category) => sum + category.totalAmount, 0);
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
  return `자산 분배 파이차트: ${descriptions.join(', ')}`;
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

// 파이차트 생성
const createPieChart = async () => {
  if (!pieChart.value || props.processedSummary.length === 0) return;

  isChartLoading.value = true;

  try {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    await loadChartJS();

    const ctx = pieChart.value.getContext('2d');

    const gradients = props.processedSummary.map((item) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      const baseColor = getCategoryColor(item.categoryName);

      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, adjustColorOpacity(baseColor, 0.7));

      return gradient;
    });

    chartInstance = new Chart(ctx, {
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
            hoverBackgroundColor: props.processedSummary.map((item) =>
              adjustColorOpacity(getCategoryColor(item.categoryName), 0.8)
            ),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(45, 51, 107, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#7d81a2',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
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
        onHover: (event, elements) => {
          if (pieChart.value) {
            pieChart.value.style.cursor = elements.length > 0 ? 'pointer' : 'default';
          }
        },
      },
    });
  } catch (error) {
    console.error('차트 생성 실패:', error);
  } finally {
    isChartLoading.value = false;
  }
};

// 카테고리 표시/숨김 토글
const toggleCategoryVisibility = (index) => {
  if (hiddenCategories.value.has(index)) {
    hiddenCategories.value.delete(index);
  } else {
    hiddenCategories.value.add(index);
  }

  if (chartInstance) {
    chartInstance.getDatasetMeta(0).data[index].hidden = hiddenCategories.value.has(index);
    chartInstance.update();
  }
};

// 컴포넌트 정리
const cleanup = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

// 데이터 변경 감지
watch(
  () => props.processedSummary,
  (newData) => {
    if (newData && newData.length > 0) {
      nextTick(() => {
        setTimeout(createPieChart, 100);
      });
    }
  },
  { deep: true }
);

// 생명주기 훅
onMounted(() => {
  setTimeout(createPieChart, 200);
});

onBeforeUnmount(cleanup);
</script>

<style scoped>
.tab-pane {
  min-height: 400px;
}

.stats-card {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(45, 51, 107, 0.1),
    0 2px 4px -1px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(45, 51, 107, 0.15);
}

.stats-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
}

.stats-title {
  color: var(--color-main);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-family:
    'Pretendard',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
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

.stats-content {
  padding: 0;
}

.chart-container {
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
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.total-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-main);
  font-family: 'Pretendard', sans-serif;
}

.total-label {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
  margin-top: 0.25rem;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, rgba(185, 187, 204, 0.1) 0%, rgba(125, 129, 162, 0.1) 100%);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-light) 0%, var(--color-sub) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-icon i {
  font-size: 1.5rem;
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
  margin: 0;
}

/* 범례 */
.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.3);
  transform: translateY(-1px);
}

.legend-item.legend-hidden {
  opacity: 0.5;
  background: rgba(200, 200, 200, 0.3);
}

.legend-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.legend-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.legend-color {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 0.25rem;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.legend-item:hover .legend-color {
  transform: scale(1.1);
}

.legend-name {
  color: var(--color-main);
  font-size: 0.95rem;
  font-weight: 600;
}

.legend-values {
  text-align: right;
}

.legend-percentage {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  font-family: 'Pretendard', sans-serif;
}

.legend-amount {
  color: var(--color-sub);
  font-size: 0.8rem;
  font-weight: 500;
}

/* 로딩 상태 */
.chart-container.loading {
  opacity: 0.7;
}

.chart-container.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--color-light);
  border-top: 3px solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .legend-item,
  .analysis-item {
    transition: none;
  }

  .chart-container.loading::after {
    animation: none;
  }
}
</style>
