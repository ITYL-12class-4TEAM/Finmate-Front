<template>
  <div class="portfolio-section">
    <h3 class="section-title">💼 {{ userName }}님에게 추천하는 테마 포트폴리오</h3>

    <div class="portfolios-container">
      <div
        v-for="(portfolio, index) in recommendedPortfolios"
        :key="portfolio.portfolioCode"
        class="portfolio-card"
        :class="`recommendation-${index + 1}`"
      >
        <!-- 포트폴리오 헤더 -->
        <div class="portfolio-header">
          <div class="portfolio-badge">
            <span class="badge-text">추천 {{ index + 1 }}</span>
            <i class="fa-solid fa-star"></i>
          </div>
          <h4 class="portfolio-name">{{ portfolio.themeName }}</h4>
          <div class="portfolio-code">{{ portfolio.portfolioCode }}</div>
        </div>

        <!-- 도넛 차트 -->
        <div class="chart-container">
          <canvas :ref-id="`chart-${portfolio.portfolioCode}`" class="portfolio-chart"></canvas>
          <div class="chart-center">
            <div class="center-text">
              <span class="center-title">자산배분</span>
              <span class="center-subtitle">Portfolio</span>
            </div>
          </div>
        </div>

        <!-- 자산 구성 범례 -->
        <div class="composition-legend">
          <div
            v-for="(asset, idx) in portfolio.composition"
            :key="idx"
            class="legend-item"
            :class="{ 'zero-percentage': asset.percentage === 0 }"
          >
            <div
              class="legend-color"
              :style="{
                backgroundColor: asset.percentage > 0 ? getAssetColor(asset.category) : '#BDC3C7',
              }"
            ></div>
            <span class="legend-label">{{ asset.category }}</span>
            <span class="legend-value">{{ asset.percentage }}%</span>
          </div>
        </div>

        <!-- 추천 이유 컴포넌트 -->
        <RecommendationReason
          :wmti-code="wmtiCode"
          :portfolio-code="portfolio.portfolioCode"
          :result-type="resultType"
          :risk-preference="riskPreference"
        />
      </div>
    </div>

    <!-- 더 많은 포트폴리오 보기 버튼 -->
    <div class="more-portfolios">
      <button class="more-button" @click="goToPortfolioList">
        <i class="fa-solid fa-plus-circle"></i>
        다른 테마-포트폴리오는 뭐가 있을까?
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import RecommendationReason from './RecommendationReason.vue';
import themePortfoliosData from '@/constants/themePortfolios.js';

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

// ✅ props
const props = defineProps({
  wmtiCode: { type: String, required: true },
  resultType: { type: String, required: true },
  riskPreference: { type: String, required: true },
  userName: { type: String, default: '고객' },
});

// ✅ router
const router = useRouter();

// ✅ 상태
const portfolios = ref(themePortfoliosData);
const charts = ref({});
const assetColors = {
  국내채권: '#2ECC71',
  해외채권: '#3498DB',
  국내주식: '#E74C3C',
  선진주식: '#9B59B6',
  신흥주식: '#F39C12',
};

// ✅ 추천 포트폴리오 계산
const recommendedPortfolios = computed(() => {
  let recommendations = [];

  if (props.resultType === 'AGGRESSIVE') {
    recommendations = portfolios.value.filter((p) =>
      props.riskPreference === 'AGGRESSIVE'
        ? p.themeName.includes('공격투자형') ||
          ['TP01', 'TP02', 'TP03', 'TP05', 'TP06'].includes(p.portfolioCode)
        : p.themeName.includes('적극투자형') ||
          ['TP14', 'TP15', 'TP16', 'TP17'].includes(p.portfolioCode)
    );
  } else if (props.resultType === 'ACTIVE') {
    recommendations = portfolios.value.filter(
      (p) =>
        p.themeName.includes('적극투자형') ||
        ['TP15', 'TP16', 'TP17', 'TP18'].includes(p.portfolioCode)
    );
  } else if (props.resultType === 'BALANCED') {
    recommendations = portfolios.value.filter(
      (p) =>
        p.themeName.includes('위험중립형') ||
        ['TP12', 'TP13', 'TP19', 'TP20', 'TP21'].includes(p.portfolioCode)
    );
  } else if (props.resultType === 'PASSIVE') {
    recommendations = portfolios.value.filter((p) =>
      props.riskPreference === 'STABILITY'
        ? p.themeName.includes('안정형') || ['TP24', 'TP25'].includes(p.portfolioCode)
        : p.themeName.includes('안정추구형') || ['TP22', 'TP23'].includes(p.portfolioCode)
    );
  }

  const additional = getWMTISpecificRecommendations();
  recommendations = [...recommendations, ...additional];

  const unique = recommendations.filter(
    (p, idx, self) => idx === self.findIndex((q) => q.portfolioCode === p.portfolioCode)
  );

  return unique.length > 0
    ? unique.slice(0, 2)
    : [
        portfolios.value.find((p) => p.portfolioCode === 'TP01'),
        portfolios.value.find((p) => p.portfolioCode === 'TP22'),
      ].filter(Boolean);
});

// ✅ WMTI 코드별 특화 추천
const getWMTISpecificRecommendations = () => {
  const wmtiMap = {
    APML: ['TP01', 'TP05'],
    IPMC: ['TP06', 'TP08'],
    ABWC: ['TP02', 'TP07'],
    PBWL: ['TP12', 'TP13'],
  };
  const targetCodes = wmtiMap[props.wmtiCode] || [];
  return portfolios.value.filter((p) => targetCodes.includes(p.portfolioCode));
};

// ✅ 자산 색상
const getAssetColor = (category) => {
  return assetColors[category] || '#95A5A6';
};

// ✅ 차트 렌더링
const renderCharts = () => {
  Object.values(charts.value).forEach((chart) => chart?.destroy());
  charts.value = {};

  recommendedPortfolios.value.forEach((portfolio) => {
    const refName = `chart-${portfolio.portfolioCode}`;
    const canvas = document.querySelector(`canvas[ref-id="${refName}"]`);
    if (canvas) createDonutChart(canvas, portfolio);
  });
};

const createDonutChart = (canvas, portfolio) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const data = {
    labels: portfolio.composition.map((a) => a.category),
    datasets: [
      {
        data: portfolio.composition.map((a) => (a.percentage === 0 ? 0.1 : a.percentage)),
        backgroundColor: portfolio.composition.map((a) =>
          a.percentage > 0 ? getAssetColor(a.category) : '#BDC3C7'
        ),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(45, 51, 107, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const real = portfolio.composition[context.dataIndex].percentage;
            return `${context.label}: ${real}%`;
          },
        },
      },
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      duration: 1000,
    },
  };

  charts.value[portfolio.portfolioCode] = new ChartJS(ctx, {
    type: 'doughnut',
    data,
    options,
  });
};

// ✅ 페이지 이동
const goToPortfolioList = () => {
  router.push('/portfolios');
};

// ✅ 차트 리렌더링 트리거
watch(recommendedPortfolios, async () => {
  await nextTick();
  renderCharts();
});

onMounted(() => {
  renderCharts();
});

onBeforeUnmount(() => {
  Object.values(charts.value).forEach((chart) => chart?.destroy());
});
</script>

<style scoped>
.portfolio-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #2c3e50;
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.1), rgba(44, 62, 80, 0.05));
  padding: 0.4rem 0.625rem;
  border-radius: 0.625rem;
  border-left: 0.188rem solid #2c3e50;
}

.portfolios-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.portfolio-card {
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(248, 249, 252, 0.8) 100%);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 0.25rem 1.25rem rgba(45, 51, 107, 0.08);
  transition: all 0.3s ease;
  border: 0.125rem solid transparent;
}

.portfolio-card.recommendation-1 {
  border-color: rgba(231, 76, 60, 0.3);
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.02), rgba(248, 249, 252, 0.8));
}

.portfolio-card.recommendation-2 {
  border-color: rgba(52, 152, 219, 0.3);
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.02), rgba(248, 249, 252, 0.8));
}

.portfolio-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.25rem;
  gap: 0.5rem;
}

.portfolio-badge {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: var(--color-white);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 0.125rem 0.5rem rgba(243, 156, 18, 0.3);
}

.recommendation-2 .portfolio-badge {
  background: linear-gradient(135deg, #3498db, #2980b9);
  box-shadow: 0 0.125rem 0.5rem rgba(52, 152, 219, 0.3);
}

.portfolio-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
}

.portfolio-code {
  font-size: 0.8rem;
  color: var(--color-light);
  font-weight: 500;
  background: rgba(185, 187, 204, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

.chart-container {
  position: relative;
  height: 12.5rem;
  width: 12.5rem; /* 명시적 너비 추가 */
  margin: 0 auto 1rem auto; /* 중앙 정렬 */
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0.063rem dashed #ccc; /* 디버깅용 테두리 */
}

.portfolio-chart {
  max-width: 12.5rem;
  max-height: 12.5rem;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.center-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
}

.center-subtitle {
  font-size: 0.75rem;
  color: var(--color-sub);
}

.composition-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  background: rgba(248, 249, 252, 0.5);
  transition: all 0.3s ease;
}

.legend-item.zero-percentage {
  opacity: 0.6;
  background: rgba(189, 195, 199, 0.1);
}

.legend-item.zero-percentage .legend-label {
  color: var(--color-light);
  text-decoration: line-through;
  text-decoration-color: rgba(185, 187, 204, 0.5);
}

.legend-item.zero-percentage .legend-value {
  color: var(--color-light);
  font-style: italic;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-sub);
}

.legend-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-main);
}

.more-portfolios {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}

.more-button {
  background: linear-gradient(135deg, var(--color-light), #bdc3c7);
  color: var(--color-white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
}

.more-button:hover {
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  transform: translateY(-0.063rem);
  box-shadow: 0 0.25rem 0.75rem rgba(125, 129, 162, 0.3);
}
</style>
