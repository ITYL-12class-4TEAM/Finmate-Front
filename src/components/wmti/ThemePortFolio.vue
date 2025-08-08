<template>
  <div class="portfolio-section">
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
            <div class="badge-icon"></div>
          </div>
          <h4 class="portfolio-name">{{ portfolio.themeName }}</h4>
          <div class="portfolio-code">{{ portfolio.portfolioCode }}</div>
        </div>

        <!-- 자세히 보기 버튼 -->
        <div class="toggle-section">
          <button
            class="detail-toggle-btn"
            :class="{ expanded: expandedPortfolios.has(portfolio.portfolioCode) }"
            @click="togglePortfolioDetail(portfolio.portfolioCode)"
          >
            <span>{{
              expandedPortfolios.has(portfolio.portfolioCode) ? '간단히 보기' : '자세히 보기'
            }}</span>
            <div
              class="toggle-icon"
              :class="{ rotated: expandedPortfolios.has(portfolio.portfolioCode) }"
            ></div>
          </button>
        </div>

        <!-- 확장 가능한 콘텐츠 -->
        <div
          class="portfolio-details"
          :class="{ expanded: expandedPortfolios.has(portfolio.portfolioCode) }"
        >
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
    </div>

    <!-- 더 많은 포트폴리오 보기 버튼 -->
    <div class="more-portfolios">
      <button class="more-button" @click="goToPortfolioList">
        <div class="button-icon plus-icon"></div>
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

// props
const props = defineProps({
  wmtiCode: { type: String, required: true },
  resultType: { type: String, required: true },
  riskPreference: { type: String, required: true },
  userName: { type: String, default: '고객' },
});

// router
const router = useRouter();

// 상태
const portfolios = ref(themePortfoliosData);
const charts = ref({});
const expandedPortfolios = ref(new Set());

const assetColors = {
  국내채권: '#2ECC71',
  해외채권: '#3498DB',
  국내주식: '#E74C3C',
  선진주식: '#9B59B6',
  신흥주식: '#F39C12',
};

// 추천 포트폴리오 계산 - 리스크 기반 필터링 + 가중치 알고리즘
const recommendedPortfolios = computed(() => {
  // 1단계: RiskPreference에 따른 포트폴리오 필터링
  const candidatePortfolios = filterPortfoliosByRisk(props.riskPreference);

  // 2단계: 각 후보에 대해 가중치 점수 계산
  const portfolioScores = candidatePortfolios.map((portfolio) => {
    const score = calculatePortfolioScore(portfolio);
    return {
      ...portfolio,
      similarityScore: score,
    };
  });

  // 3단계: 점수 기준으로 정렬하고 상위 2개 선택
  return portfolioScores.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 2);
});

// RiskPreference에 따른 포트폴리오 필터링
const filterPortfoliosByRisk = (riskPreference) => {
  // 위험성향별 테마 포트폴리오 매핑 (실제 데이터 기반)
  const riskMapping = {
    STABILITY: {
      allowedTypes: ['안정형', '안정추구형'],
      preferredType: '안정형',
    },
    STABILITY_ORIENTED: {
      allowedTypes: ['안정형', '안정추구형'],
      preferredType: '안정추구형',
    },
    RISK_NEUTRAL: {
      allowedTypes: ['안정추구형', '위험중립형'],
      preferredType: '위험중립형',
    },
    ACTIVELY: {
      allowedTypes: ['위험중립형', '적극투자형'],
      preferredType: '적극투자형',
    },
    AGGRESSIVE: {
      allowedTypes: ['적극투자형', '공격투자형'],
      preferredType: '공격투자형',
    },
  };

  const config = riskMapping[riskPreference];
  if (!config) return portfolios.value;

  // 허용된 위험성향의 포트폴리오만 필터링
  return portfolios.value.filter((portfolio) => {
    return config.allowedTypes.some(
      (type) => portfolio.themeName.includes(type) || portfolio.riskLevel === type
    );
  });
};

// 포트폴리오 유사도 점수 계산 함수 (WMTI 중심)
const calculatePortfolioScore = (portfolio) => {
  let score = 0;

  // 1. WMTI 코드 특화 점수 (60% 가중치) - 메인
  const wmtiScore = getWMTISpecificScore(portfolio, props.wmtiCode) * 0.6;

  // 2. RiskPreference 매칭 (25% 가중치) - 필터링된 범위 내에서 선호도
  const riskScore = getRiskPreferenceScore(portfolio, props.riskPreference) * 0.25;

  // 3. ResultType 보조 점수 (15% 가중치) - 보조 역할
  const resultTypeScore = getResultTypeScore(portfolio, props.resultType) * 0.15;

  score = wmtiScore + riskScore + resultTypeScore;

  return Math.round(score * 100) / 100;
};

// WMTI 코드별 특화 점수 (메인 점수)
const getWMTISpecificScore = (portfolio, wmtiCode) => {
  // 16가지 WMTI 코드별 선호 포트폴리오 매핑
  const wmtiPreferences = {
    // A (적극적) 성향
    APML: {
      primary: ['배당특급(공격투자형)', '글로벌 자산배분(공격투자형)', '영구 자산배분'],
      secondary: ['캡틴 아메리카(공격투자형)', 'ESG 워너비', '사계절 자산배분'],
    },
    APMC: {
      primary: ['가치주 대반란(공격투자형)', '캡틴 아메리카(공격투자형)', '대체불가 실물투자'],
      secondary: ['배당특급(공격투자형)', '글로벌 바겐세일', 'G2'],
    },
    APWL: {
      primary: ['지금은 IT시대', '글로벌 대장주', '전지적 펀드시점'],
      secondary: ['캡틴 아메리카(공격투자형)', 'ESG 워너비', '글로벌 자산배분(공격투자형)'],
    },
    APWC: {
      primary: ['G2', '글로벌 바겐세일', '대체불가 실물투자'],
      secondary: ['배당특급(공격투자형)', '가치주 대반란(공격투자형)', '영구 자산배분'],
    },
    ABML: {
      primary: ['영구 자산배분', '사계절 자산배분', '글로벌 자산배분(공격투자형)'],
      secondary: ['배당특급(적극투자형)', '가치주 대반란(적극투자형)', '펀린이 컬렉션(적극투자형)'],
    },
    ABMC: {
      primary: ['배당특급(적극투자형)', '가치주 대반란(적극투자형)', '글로벌 자산배분(적극투자형)'],
      secondary: ['캡틴 아메리카(적극투자형)', '펀린이 컬렉션(적극투자형)', '사계절 자산배분'],
    },
    ABWL: {
      primary: [
        '캡틴 아메리카(적극투자형)',
        '펀린이 컬렉션(적극투자형)',
        '글로벌 자산배분(적극투자형)',
      ],
      secondary: ['배당특급(적극투자형)', '가치주 대반란(적극투자형)', '영구 자산배분'],
    },
    ABWC: {
      primary: ['펀린이 컬렉션(위험중립형)', '배당특급(위험중립형)', '가치주 대반란(위험중립형)'],
      secondary: [
        '배당특급(적극투자형)',
        '가치주 대반란(적극투자형)',
        '글로벌 자산배분(적극투자형)',
      ],
    },

    // I (내향적) 성향
    IPML: {
      primary: ['영구 자산배분', '사계절 자산배분', '배당특급(적극투자형)'],
      secondary: [
        '글로벌 자산배분(적극투자형)',
        '가치주 대반란(적극투자형)',
        '펀린이 컬렉션(적극투자형)',
      ],
    },
    IPMC: {
      primary: ['배당특급(적극투자형)', '가치주 대반란(적극투자형)', '펀린이 컬렉션(적극투자형)'],
      secondary: ['캡틴 아메리카(적극투자형)', '글로벌 자산배분(적극투자형)', '사계절 자산배분'],
    },
    IPWL: {
      primary: [
        '캡틴 아메리카(적극투자형)',
        '펀린이 컬렉션(적극투자형)',
        '글로벌 자산배분(적극투자형)',
      ],
      secondary: ['배당특급(적극투자형)', '가치주 대반란(적극투자형)', '영구 자산배분'],
    },
    IPWC: {
      primary: ['펀린이 컬렉션(위험중립형)', '배당특급(위험중립형)', '가치주 대반란(위험중립형)'],
      secondary: ['펀린이 컬렉션(적극투자형)', '배당특급(적극투자형)', '사계절 자산배분'],
    },
    IBML: {
      primary: ['펀린이 컬렉션(위험중립형)', '배당특급(위험중립형)', '사계절 자산배분'],
      secondary: ['가치주 대반란(위험중립형)', '펀린이 컬렉션(적극투자형)', '영구 자산배분'],
    },
    IBMC: {
      primary: ['펀린이 컬렉션(위험중립형)', '배당특급(위험중립형)', '가치주 대반란(위험중립형)'],
      secondary: [
        '펀린이 컬렉션(적극투자형)',
        '배당특급(적극투자형)',
        '글로벌 자산배분(적극투자형)',
      ],
    },
    IBWL: {
      primary: ['수퍼세이브(안정추구형)', '펀린이 컬렉션(안정추구형)', '펀린이 컬렉션(위험중립형)'],
      secondary: ['배당특급(위험중립형)', '가치주 대반란(위험중립형)', '사계절 자산배분'],
    },
    IBWC: {
      primary: ['수퍼세이브(안정형)', '펀린이 컬렉션(안정형)', '수퍼세이브(안정추구형)'],
      secondary: ['펀린이 컬렉션(안정추구형)', '펀린이 컬렉션(위험중립형)', '배당특급(위험중립형)'],
    },
  };

  const preferences = wmtiPreferences[wmtiCode];
  if (!preferences) return 0;

  // 테마명으로 매칭
  const themeName = portfolio.themeName;

  // 1순위 매칭: 100점
  if (preferences.primary.includes(themeName)) {
    return 100;
  }

  // 2순위 매칭: 60점
  if (preferences.secondary.includes(themeName)) {
    return 60;
  }

  return 0;
};

// RiskPreference 매칭 점수 (필터링된 범위 내 선호도)
const getRiskPreferenceScore = (portfolio, riskPreference) => {
  // 위험성향별 선호 테마 매핑
  const riskPreferenceMapping = {
    STABILITY: {
      perfect: ['안정형'],
      good: ['안정추구형'],
      acceptable: [],
    },
    STABILITY_ORIENTED: {
      perfect: ['안정추구형'],
      good: ['안정형', '위험중립형'],
      acceptable: [],
    },
    RISK_NEUTRAL: {
      perfect: ['위험중립형'],
      good: ['안정추구형'],
      acceptable: [],
    },
    ACTIVELY: {
      perfect: ['적극투자형'],
      good: ['위험중립형'],
      acceptable: [],
    },
    AGGRESSIVE: {
      perfect: ['공격투자형'],
      good: ['적극투자형'],
      acceptable: [],
    },
  };

  const config = riskPreferenceMapping[riskPreference];
  if (!config) return 0;

  const themeName = portfolio.themeName;

  // 완벽 매칭: 100점
  if (config.perfect.some((type) => themeName.includes(type))) {
    return 100;
  }

  // 양호 매칭: 60점
  if (config.good.some((type) => themeName.includes(type))) {
    return 60;
  }

  // 수용 가능: 30점
  if (config.acceptable.some((type) => themeName.includes(type))) {
    return 30;
  }

  return 0;
};

// ResultType 보조 점수 (보조 역할)
const getResultTypeScore = (portfolio, resultType) => {
  // ResultType별 선호 키워드 (보조적 역할)
  const typeMapping = {
    AGGRESSIVE: ['공격', '고수익', '성장', '적극'],
    ACTIVE: ['적극', '성장', '활성', '배당'],
    BALANCED: ['균형', '중립', '안정', '배분'],
    PASSIVE: ['안정', '보수', '수퍼세이브', '컬렉션'],
  };

  const keywords = typeMapping[resultType] || [];
  const themeName = portfolio.themeName;

  // 키워드 매칭 개수에 따른 점수
  const matchCount = keywords.filter((keyword) => themeName.includes(keyword)).length;

  return Math.min(matchCount * 25, 100); // 최대 100점
};

// 포트폴리오 상세 토글
const togglePortfolioDetail = (portfolioCode) => {
  if (expandedPortfolios.value.has(portfolioCode)) {
    expandedPortfolios.value.delete(portfolioCode);
  } else {
    expandedPortfolios.value.add(portfolioCode);
    // 차트 렌더링을 위해 nextTick 사용
    nextTick(() => {
      const portfolio = recommendedPortfolios.value.find((p) => p.portfolioCode === portfolioCode);
      if (portfolio) {
        const canvas = document.querySelector(`canvas[ref-id="chart-${portfolioCode}"]`);
        if (canvas && !charts.value[portfolioCode]) {
          createDonutChart(canvas, portfolio);
        }
      }
    });
  }
};

// 자산 색상
const getAssetColor = (category) => {
  return assetColors[category] || '#95A5A6';
};

// 차트 렌더링
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

// 페이지 이동
const goToPortfolioList = () => {
  router.push('/wmti/theme-collection');
};

onMounted(() => {
  // 초기에는 차트를 렌더링하지 않음
});

onBeforeUnmount(() => {
  Object.values(charts.value).forEach((chart) => chart?.destroy());
});
</script>

<style scoped>
.portfolio-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--color-white);
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 1.25rem 2.5rem rgba(45, 51, 107, 0.15);
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.section-icon {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.portfolio-icon {
  background: linear-gradient(135deg, #2c3e50, #34495e);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
}

.portfolios-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.portfolio-card {
  background: rgba(248, 249, 252, 0.5);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.3s ease;
  border: 0.0625rem solid transparent;
}

.portfolio-card.recommendation-1 {
  border-color: rgba(231, 76, 60, 0.3);
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.02), rgba(248, 249, 252, 0.5));
}

.portfolio-card.recommendation-2 {
  border-color: rgba(52, 152, 219, 0.3);
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.02), rgba(248, 249, 252, 0.5));
}

.portfolio-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
}

.portfolio-badge {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: var(--color-white);
  padding: 0.25rem 0.75rem;
  border-radius: 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 0.125rem 0.5rem rgba(243, 156, 18, 0.3);
}

.badge-icon {
  width: 0.75rem;
  height: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

.recommendation-2 .portfolio-badge {
  background: linear-gradient(135deg, #3498db, #2980b9);
  box-shadow: 0 0.125rem 0.5rem rgba(52, 152, 219, 0.3);
}

.portfolio-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
  line-height: 1.3;
}

.portfolio-code {
  font-size: 0.75rem;
  color: var(--color-light);
  font-weight: 500;
  background: rgba(185, 187, 204, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

/* 토글 섹션 */
.toggle-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.detail-toggle-btn {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: var(--color-white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.625rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
}

.detail-toggle-btn:hover {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.3);
}

.toggle-icon {
  width: 0.75rem;
  height: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")
    center/contain no-repeat;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

/* 확장 가능한 콘텐츠 */
.portfolio-details {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.portfolio-details.expanded {
  max-height: 50rem;
}

.chart-container {
  position: relative;
  height: 12.5rem;
  width: 12.5rem;
  margin: 1rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
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
  border-top: 0.0625rem solid rgba(185, 187, 204, 0.2);
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
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
}

.more-button:hover {
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(125, 129, 162, 0.3);
}

.button-icon {
  width: 1rem;
  height: 1rem;
  border-radius: 0.125rem;
  flex-shrink: 0;
}

.plus-icon {
  background: rgba(255, 255, 255, 0.8);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z'/%3e%3c/svg%3e")
    center/contain no-repeat;
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

/* 반응형 */
@media (max-width: 30rem) {
  .portfolio-section {
    padding: 1.25rem;
  }

  .portfolio-card {
    padding: 0.875rem;
  }

  .chart-container {
    height: 10rem;
    width: 10rem;
  }

  .portfolio-chart {
    max-width: 10rem;
    max-height: 10rem;
  }
}
</style>
