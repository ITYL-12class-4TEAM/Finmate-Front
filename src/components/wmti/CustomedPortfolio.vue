<template>
  <div class="customed-portfolio-section">
    <!-- 1단계: 헤더 -->
    <div class="portfolio-header">
      <h2 class="header-title">{{ userName }}님을 위한 <br />맞춤형 포트폴리오가 준비되었어요!</h2>
      <p class="user-info">
        {{ userName }}님은 <br /><span class="highlight">{{ wmtiCode }}</span
        >, <span class="highlight">{{ getResultTypeLabel(resultType) }}</span
        >, <span class="highlight">{{ getRiskPreferenceLabel(riskPreference) }}</span> <br />이에요.
      </p>
    </div>

    <!-- 2단계: 차트 영역 -->
    <div class="chart-section">
      <div class="chart-header">
        <h4 class="chart-title">추천 자산 분배</h4>
      </div>

      <!-- 차트 영역 -->
      <div v-if="portfolioData.length > 0" class="chart-container">
        <canvas
          ref="chartCanvas"
          width="280"
          height="280"
          :aria-label="getChartAriaLabel()"
        ></canvas>

        <!-- 중앙 총액 표시 (도넛 차트 중앙) -->
        <div class="chart-center-info">
          <div class="total-amount">100%</div>
          <div class="total-label">포트폴리오</div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-pie-chart"></i>
        </div>
        <p class="empty-text">포트폴리오를 생성 중입니다.</p>
        <small class="empty-subtitle">잠시만 기다려주세요</small>
      </div>

      <!-- 범례 -->
      <div v-if="portfolioData.length > 0" class="chart-legend">
        <div
          v-for="(item, index) in portfolioData"
          :key="item.category"
          class="legend-item"
          :class="{
            'legend-hidden': hiddenCategories.has(index),
          }"
          @click="toggleCategoryVisibility(index)"
        >
          <div class="legend-info">
            <div class="legend-indicator">
              <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
              <span class="legend-name">
                {{ item.category }}
              </span>
            </div>
            <div class="legend-values">
              <div class="legend-percentage">{{ item.percentage.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3단계: 포트폴리오 구성 근거 -->
    <div class="reasoning-section">
      <button
        class="reasoning-header"
        :class="{ expanded: isReasoningExpanded }"
        @click="toggleReasoningSection"
      >
        <h4 class="subsection-title">
          <i class="fa-regular fa-lightbulb"></i>
          포트폴리오 구성 근거
        </h4>
        <span class="accordion-toggle">
          <svg :class="{ rotated: isReasoningExpanded }" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 9l-7 7-7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>

      <div class="reasoning-content" :class="{ expanded: isReasoningExpanded }">
        <div class="step">
          <h5>1단계: 기본 분배</h5>
          <p>
            {{ userName }}님의 <strong>{{ getRiskPreferenceLabel(riskPreference) }}</strong> 성향에
            따라 기본 포트폴리오를 구성했어요.
          </p>
        </div>
        <div class="step">
          <h5>2단계: WMTI 조정</h5>
          <p>
            WMTI 결과 <strong>{{ wmtiCode }}</strong
            >를 반영하여 {{ adjustmentReason }}로 조정했어요.
          </p>
        </div>
        <div class="step">
          <h5>3단계: 최적화</h5>
          <p>투자여력과 목표를 고려하여 최적의 비율로 조정했어요.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

// Props 정의 - 부모 컴포넌트에서 전달받을 데이터
const props = defineProps({
  // WMTI 결과 데이터
  wmtiCode: {
    type: String,
    required: true,
  },
  resultType: {
    type: String,
    required: true,
  },
  riskPreference: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  // WMTI 점수들
  ascore: { type: Number, default: 50 },
  iscore: { type: Number, default: 50 },
  pscore: { type: Number, default: 50 },
  bscore: { type: Number, default: 50 },
  mscore: { type: Number, default: 50 },
  wscore: { type: Number, default: 50 },
  lscore: { type: Number, default: 50 },
  cscore: { type: Number, default: 50 },

  // PreInfo 데이터
  investmentCapacity: {
    type: String,
    default: 'NORMAL',
  },
  investmentPeriod: {
    type: String,
    default: 'MEDIUM',
  },
  purposeCategory: {
    type: String,
    default: 'ASSET_GROWTH',
  },
  age: {
    type: Number,
    default: 30,
  },
  monthlyIncome: {
    type: Number,
    default: 3000000,
  },
  savingsRate: {
    type: Number,
    default: 30,
  },
  financialHealthScore: {
    type: Number,
    default: 70,
  },
});

// 반응형 데이터
const adjustmentReason = ref('');
const isReasoningExpanded = ref(false); // 아코디언 토글 상태

const chartCanvas = ref(null);
const hiddenCategories = ref(new Set());
let chartInstance = null;

// 아코디언 토글 함수
const toggleReasoningSection = () => {
  isReasoningExpanded.value = !isReasoningExpanded.value;
};

// 포트폴리오 기본 데이터
const categories = ['예금', '적금', '보험', '연금', '주식', '기타'];
const categoryColors = {
  예금: '#10B981', // 에메랄드 그린 (안정성과 성장)
  적금: '#3B82F6', // 브라이트 블루 (신뢰성과 미래)
  보험: '#8B5CF6', // 바이올렛 퍼플 (보호와 안전)
  연금: '#F59E0B', // 앰버 오렌지 (따뜻함과 장기적 가치)
  주식: '#EF4444', // 레드 (역동성과 수익성)
  기타: '#6B7280', // 세련된 그레이 (다양성과 균형)
};

// 위험성향별 기본 분배 (대출 제외)
const riskAllocationBase = {
  STABILITY: { 예금: 30, 적금: 30, 보험: 20, 연금: 10, 주식: 5, 기타: 5 },
  STABILITY_ORIENTED: { 예금: 20, 적금: 20, 보험: 15, 연금: 20, 주식: 15, 기타: 10 },
  RISK_NEUTRAL: { 예금: 10, 적금: 10, 보험: 10, 연금: 25, 주식: 30, 기타: 15 },
  ACTIVELY: { 예금: 5, 적금: 5, 보험: 10, 연금: 20, 주식: 40, 기타: 20 },
  AGGRESSIVE: { 예금: 0, 적금: 5, 보험: 5, 연금: 10, 주식: 50, 기타: 30 },
};

const currentAllocation = ref({});

// 계산된 포트폴리오 데이터
const portfolioData = computed(() => {
  return categories
    .filter((category) => currentAllocation.value[category] > 0)
    .map((category) => ({
      category,
      percentage: currentAllocation.value[category] || 0,
      color: categoryColors[category],
    }))
    .sort((a, b) => b.percentage - a.percentage);
});

// 라벨 함수들 (부모 페이지와 동일)
const getResultTypeLabel = (type) =>
  ({
    AGGRESSIVE: '고수익 지향형',
    ACTIVE: '적극적 설계형',
    BALANCED: '균형잡힌 실속형',
    PASSIVE: '소극적 관리형',
  })[type] || '투자형';

const getRiskPreferenceLabel = (risk) =>
  ({
    STABILITY: '안정형',
    STABILITY_ORIENTED: '안정추구형',
    RISK_NEUTRAL: '위험중립형',
    ACTIVELY: '적극투자형',
    AGGRESSIVE: '공격투자형',
  })[risk] || '위험 수용';

// 1단계: 위험성향별 기본 분배
const classifyByRiskPreference = () => {
  const baseAllocation = riskAllocationBase[props.riskPreference];

  if (!baseAllocation) {
    console.error('위험성향을 찾을 수 없습니다:', props.riskPreference);
    return riskAllocationBase['RISK_NEUTRAL'];
  }

  return { ...baseAllocation };
};

// 2단계: WMTI 결과 적용
const applyWMTIResult = (allocation) => {
  if (!props.wmtiCode) return allocation;

  const scores = {
    A: props.aScore,
    I: props.iScore,
    P: props.pScore,
    B: props.bScore,
    M: props.mScore,
    W: props.wScore,
    L: props.lScore,
    C: props.cScore,
  };

  // 각 차원별 편차 계산 및 조정
  const adjustments = calculateWMTIAdjustments(props.wmtiCode, scores);

  // PreInfo 기반 추가 조정
  const preInfoAdjustments = calculatePreInfoAdjustments();

  // 조정 적용
  Object.keys(adjustments).forEach((category) => {
    if (allocation[category] !== undefined) {
      allocation[category] += adjustments[category];
      allocation[category] += preInfoAdjustments[category] || 0;
      allocation[category] = Math.max(0, allocation[category]); // 음수 방지
    }
  });

  return allocation;
};

// WMTI 조정값 계산
const calculateWMTIAdjustments = (code, scores) => {
  const adjustments = { 예금: 0, 적금: 0, 보험: 0, 연금: 0, 주식: 0, 기타: 0 };
  let reasonParts = [];

  // A vs I 분석
  const aiDiff = Math.abs(scores.A - scores.I);
  if (aiDiff >= 50) {
    if (scores.A > scores.I) {
      // Active: 수익성 증대
      adjustments['주식'] += 4;
      adjustments['기타'] += 1;
      adjustments['예금'] -= 5;
      reasonParts.push('적극적 투자 성향을 반영하여 주식과 기타 투자 비중을 늘렸어요');
    } else {
      // Inactive: 안정성 증대
      adjustments['예금'] += 5;
      adjustments['보험'] += 3;
      adjustments['기타'] -= 5;
      reasonParts.push('안정적 투자 성향을 반영하여 예금과 보험 비중을 늘렸어요');
    }
  } else if (aiDiff >= 20) {
    if (scores.A > scores.I) {
      adjustments['주식'] += 2;
      adjustments['예금'] -= 2;
    } else {
      adjustments['예금'] += 2;
      adjustments['주식'] -= 2;
    }
  }

  // P vs B 분석
  const pbDiff = Math.abs(scores.P - scores.B);
  if (pbDiff >= 50) {
    if (scores.P > scores.B) {
      // Professional: 수익성 증대
      adjustments['주식'] += 8;
      adjustments['기타'] += 3;
      adjustments['예금'] -= 7;
      adjustments['적금'] -= 4;
      reasonParts.push('전문적 투자 성향을 반영하여 고수익 상품 비중을 높였어요');
    } else {
      // Beginner: 유동성 확보
      adjustments['예금'] += 5;
      adjustments['적금'] += 5;
      adjustments['연금'] -= 5;
      reasonParts.push('초보 투자자 성향을 고려하여 유동성이 높은 상품 비중을 늘렸어요');
    }
  }

  adjustmentReason.value = reasonParts.join(', ') || '균형잡힌 투자 성향';

  return adjustments;
};

// PreInfo 기반 추가 조정
const calculatePreInfoAdjustments = () => {
  const adjustments = { 예금: 0, 적금: 0, 보험: 0, 연금: 0, 주식: 0, 기타: 0 };
  let additionalReasons = [];

  // 1. 나이 기반 조정 (생애주기별)
  if (props.age < 30) {
    // 청년층: 적극적 투자 + 비상자금 확보
    adjustments['주식'] += 3;
    adjustments['예금'] += 2;
    adjustments['연금'] -= 3;
    adjustments['보험'] -= 2;
    additionalReasons.push('젊은 나이를 고려하여 주식 비중을 늘리고 장기 투자에 집중했어요');
  } else if (props.age >= 50) {
    // 중장년층: 안정성 강화 + 연금 준비
    adjustments['연금'] += 5;
    adjustments['보험'] += 3;
    adjustments['주식'] -= 5;
    adjustments['기타'] -= 3;
    additionalReasons.push('중장년층 특성을 반영하여 연금과 보험 비중을 강화했어요');
  }

  // 2. 저축률 기반 조정
  if (props.savingsRate >= 50) {
    // 고저축률: 적극적 투자 가능
    adjustments['주식'] += 3;
    adjustments['기타'] += 2;
    adjustments['예금'] -= 3;
    adjustments['적금'] -= 2;
    additionalReasons.push('높은 저축률을 고려하여 수익성 높은 투자 비중을 늘렸어요');
  } else if (props.savingsRate < 20) {
    // 저저축률: 안정성 우선
    adjustments['예금'] += 3;
    adjustments['적금'] += 2;
    adjustments['주식'] -= 3;
    adjustments['기타'] -= 2;
    additionalReasons.push('저축률을 고려하여 안정성 있는 상품 비중을 늘렸어요');
  }

  // 3. 재무건전성 점수 기반 조정
  if (props.financialHealthScore >= 80) {
    // 우수한 재무상태: 리스크 감수 가능
    adjustments['주식'] += 2;
    adjustments['기타'] += 1;
    adjustments['예금'] -= 2;
    adjustments['보험'] -= 1;
    additionalReasons.push('우수한 재무건전성을 바탕으로 수익성 투자 비중을 늘렸어요');
  } else if (props.financialHealthScore < 60) {
    // 재무상태 개선 필요: 안정성 우선
    adjustments['예금'] += 3;
    adjustments['보험'] += 2;
    adjustments['주식'] -= 3;
    adjustments['기타'] -= 2;
    additionalReasons.push('재무건전성 개선을 위해 안정적인 상품 비중을 늘렸어요');
  }

  // 4. 투자목적 기반 조정
  switch (props.purposeCategory) {
    case 'EMERGENCY_FUND':
      // 비상자금: 유동성 최우선
      adjustments['예금'] += 10;
      adjustments['적금'] += 5;
      adjustments['주식'] -= 8;
      adjustments['기타'] -= 5;
      adjustments['연금'] -= 2;
      additionalReasons.push('비상자금 마련 목적에 따라 유동성 높은 상품을 우선시했어요');
      break;
    case 'TRAVEL':
    case 'MARRIAGE':
      // 단기 목표: 안정성과 유동성 균형
      adjustments['적금'] += 5;
      adjustments['예금'] += 3;
      adjustments['주식'] -= 5;
      adjustments['기타'] -= 3;
      additionalReasons.push('단기 목표 달성을 위해 안정적인 상품 비중을 늘렸어요');
      break;
    case 'HOUSE_PURCHASE':
      // 주택구입: 중기 안정 투자
      adjustments['적금'] += 3;
      adjustments['연금'] += 2;
      adjustments['주식'] -= 3;
      adjustments['기타'] -= 2;
      additionalReasons.push('주택구입 목표에 맞춰 중기 안정 투자를 강화했어요');
      break;
    case 'RETIREMENT':
      // 노후준비: 연금 중심
      adjustments['연금'] += 8;
      adjustments['보험'] += 3;
      adjustments['예금'] -= 5;
      adjustments['적금'] -= 3;
      adjustments['기타'] -= 3;
      additionalReasons.push('노후준비 목적에 따라 연금상품 비중을 크게 늘렸어요');
      break;
    case 'CHILD_EDUCATION':
      // 자녀교육비: 장기 안정 성장
      adjustments['연금'] += 3;
      adjustments['적금'] += 3;
      adjustments['보험'] += 2;
      adjustments['주식'] -= 5;
      adjustments['기타'] -= 3;
      additionalReasons.push('자녀교육비 준비를 위해 장기 안정 상품을 강화했어요');
      break;
    case 'ASSET_GROWTH':
      // 자산증식: 수익성 중심
      adjustments['주식'] += 5;
      adjustments['기타'] += 3;
      adjustments['예금'] -= 5;
      adjustments['적금'] -= 3;
      additionalReasons.push('자산증식 목표에 따라 수익성 높은 투자 비중을 늘렸어요');
      break;
  }

  // 기존 조정 이유에 추가
  if (additionalReasons.length > 0) {
    const existingReason = adjustmentReason.value;
    adjustmentReason.value = existingReason
      ? `${existingReason}, ${additionalReasons.join(', ')}`
      : additionalReasons.join(', ');
  }

  return adjustments;
};

// 3단계: 100% 리밸런싱
const normalizeTo100 = (allocation) => {
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  if (total === 0) return allocation;

  const normalized = {};
  Object.keys(allocation).forEach((key) => {
    normalized[key] = Math.round((allocation[key] / total) * 100);
  });

  // 반올림으로 인한 오차 조정
  const newTotal = Object.values(normalized).reduce((sum, val) => sum + val, 0);
  const diff = 100 - newTotal;

  if (diff !== 0) {
    const maxCategory = Object.keys(normalized).reduce((a, b) =>
      normalized[a] > normalized[b] ? a : b
    );
    normalized[maxCategory] += diff;
  }

  return normalized;
};

// 포트폴리오 계산
const calculatePortfolio = () => {
  // 1단계: 기본 분배
  let allocation = classifyByRiskPreference();

  // 2단계: WMTI 조정
  allocation = applyWMTIResult(allocation);

  // 3단계: 정규화
  allocation = normalizeTo100(allocation);

  currentAllocation.value = allocation;
};

// 차트 업데이트
const updateChart = () => {
  if (!chartInstance) return;

  const validData = portfolioData.value.filter((item) => item.percentage > 0);

  chartInstance.data.labels = validData.map((item) => item.category);
  chartInstance.data.datasets[0].data = validData.map((item) => item.percentage);
  chartInstance.data.datasets[0].backgroundColor = createGradients(validData);

  chartInstance.update();
};

// 그라디언트 생성
const createGradients = (data) => {
  if (!chartCanvas.value) return data.map((item) => item.color);

  const ctx = chartCanvas.value.getContext('2d');
  return data.map((item) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    const baseColor = item.color;

    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, adjustColorOpacity(baseColor, 0.7));

    return gradient;
  });
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

// 접근성을 위한 차트 설명
const getChartAriaLabel = () => {
  const descriptions = portfolioData.value.map(
    (item) => `${item.category} ${item.percentage.toFixed(1)}%`
  );
  return `포트폴리오 분배 차트: ${descriptions.join(', ')}`;
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

// 차트 초기화
const initChart = () => {
  if (!chartCanvas.value) return;

  const ctx = chartCanvas.value.getContext('2d');
  const validData = portfolioData.value.filter((item) => item.percentage > 0);

  if (validData.length === 0) return;

  const gradients = createGradients(validData);

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: validData.map((item) => item.category),
      datasets: [
        {
          data: validData.map((item) => item.percentage),
          backgroundColor: gradients,
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4,
          hoverBorderColor: '#f8f9fa',
          hoverBackgroundColor: validData.map((item) => adjustColorOpacity(item.color, 0.8)),
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
              return `${label}: ${value.toFixed(1)}%`;
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
        if (chartCanvas.value) {
          chartCanvas.value.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
      },
    },
  });
};

// Props 변경 감지
watch(
  () => [props.wmtiCode, props.riskPreference],
  () => {
    calculatePortfolio();
    if (chartInstance) {
      updateChart();
    }
  },
  { immediate: true }
);

onMounted(() => {
  calculatePortfolio();
  initChart();
});
</script>

<style scoped>
/* 컴포넌트 전체 컨테이너 */
.customed-portfolio-section {
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(248, 249, 252, 0.8) 100%);
  border-radius: 1rem;
  box-shadow: 0 0.25rem 1.25rem rgba(45, 51, 107, 0.08);
  animation: fadeInUp 0.6s ease-out 0.6s both;
  margin-bottom: 1.25rem;
}

/* 섹션 타이틀 (부모와 동일한 스타일) */
.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.portfolio-title {
  color: #2c3e50;
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.1), rgba(44, 62, 80, 0.05));
  padding: 0.4rem 0.625rem;
  border-radius: 0.625rem;
  border-left: 0.1875rem solid #2c3e50;
}

/* 헤더 스타일 */
.portfolio-header {
  text-align: center;
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.02), rgba(125, 129, 162, 0.01));
  border-radius: 0.75rem;
  padding: 1rem 0 1rem 0;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.user-info {
  font-size: 0.875rem;
  color: var(--color-sub);
  line-height: 1.4;
}

.highlight {
  color: var(--color-main);
  font-weight: 600;
  background: rgba(45, 51, 107, 0.08);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

/* 차트 섹션 */
.chart-section {
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  padding: 1rem;
  border: 0.0625rem solid rgba(185, 187, 204, 0.3);
  box-shadow:
    0 0.25rem 0.375rem -0.0625rem rgba(45, 51, 107, 0.1),
    0 0.125rem 0.25rem -0.0625rem rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(0.625rem);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-section:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.5rem 1.5625rem -0.3125rem rgba(45, 51, 107, 0.15);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 0.0625rem solid rgba(185, 187, 204, 0.2);
}

.chart-title {
  color: var(--color-main);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

/* 차트 영역 */
.chart-container {
  position: relative;
  height: 17.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  backdrop-filter: blur(0.3125rem);
  margin-bottom: 1.25rem;
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
  font-family: 'Inter', sans-serif;
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
  border: 0.0625rem solid rgba(185, 187, 204, 0.15);
  backdrop-filter: blur(0.3125rem);
  transition: all 0.3s ease;
  cursor: pointer;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.3);
  transform: translateY(-0.0625rem);
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
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.legend-item:hover .legend-color {
  transform: scale(1.1);
}

.legend-name {
  color: var(--color-main);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.legend-values {
  text-align: right;
}

.legend-percentage {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}
/* 아코디언 근거 설명 섹션 */
.reasoning-section {
  margin-top: 1rem;
  border: 0.0625rem solid rgba(45, 51, 107, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--color-white);
  box-shadow: 0 0.125rem 0.25rem rgba(45, 51, 107, 0.05);
  transition: all 0.3s ease;
}

.reasoning-section:hover {
  box-shadow: 0 0.25rem 0.5rem rgba(45, 51, 107, 0.1);
}

/* 아코디언 헤더 (클릭 가능한 버튼) */
.reasoning-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(45, 51, 107, 0.02);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-family: inherit;
}

.reasoning-header:hover {
  background: rgba(45, 51, 107, 0.05);
}

.reasoning-header.expanded {
  background: rgba(45, 51, 107, 0.08);
  border-bottom: 0.0625rem solid rgba(45, 51, 107, 0.1);
}

/* 근거 설명 서브섹션 제목 */
.subsection-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 0.875rem 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* 토글 아이콘 */
.accordion-toggle {
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-sub);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.accordion-toggle svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s ease;
}

.accordion-toggle svg.rotated {
  transform: rotate(180deg);
}

/* 아코디언 콘텐츠 */
.reasoning-content {
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s ease,
    padding 0.3s ease;
  padding: 0 1.25rem;
}

.reasoning-content.expanded {
  max-height: 30rem; /* 충분히 큰 값 */
  padding: 1rem 1.25rem 1.25rem;
}

.reasoning-content .step {
  background: var(--color-white);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border-left: 0.125rem solid var(--color-light);
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
}

.reasoning-content .step:last-child {
  margin-bottom: 0;
}

.reasoning-content .step:hover {
  border-left-color: var(--color-main);
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.08);
}

.reasoning-content .step h5 {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 0.375rem 0;
}

.reasoning-content .step p {
  font-size: 0.8rem;
  color: var(--color-sub);
  line-height: 1.4;
  margin: 0;
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(1.875rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeInContent {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reasoning-content.expanded .step {
  animation: fadeInContent 0.3s ease-out;
}

.reasoning-content.expanded .step:nth-child(1) {
  animation-delay: 0.1s;
}

.reasoning-content.expanded .step:nth-child(2) {
  animation-delay: 0.2s;
}

.reasoning-content.expanded .step:nth-child(3) {
  animation-delay: 0.3s;
}

/* 반응형 */
@media (max-width: 26.875rem) {
  .chart-container {
    height: 16.25rem;
  }

  .chart-legend {
    gap: 0.4rem;
  }

  .legend-item {
    padding: 0.4rem;
  }

  .legend-indicator {
    gap: 0.5rem;
  }

  .legend-color {
    width: 1rem;
    height: 1rem;
  }

  .legend-name {
    font-size: 0.85rem;
  }

  .legend-percentage {
    font-size: 0.9rem;
  }

  .header-title {
    font-size: 1rem;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .reasoning-header {
    padding: 0.875rem 1rem;
  }

  .reasoning-content.expanded {
    padding: 0.875rem 1rem 1rem;
  }

  .subsection-title {
    font-size: 0.8rem;
  }
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
  border: 0.1875rem solid var(--color-light);
  border-top: 0.1875rem solid var(--color-main);
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
  .chart-section {
    transition: none;
  }

  .chart-container.loading::after {
    animation: none;
  }
}
</style>
