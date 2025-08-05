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
            <canvas 
              :ref="`chart-${portfolio.portfolioCode}`"
              class="portfolio-chart"
            ></canvas>
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
                :style="{ backgroundColor: asset.percentage > 0 ? getAssetColor(asset.category) : '#BDC3C7' }"
              ></div>
              <span class="legend-label">{{ asset.category }}</span>
              <span class="legend-value">{{ asset.percentage }}%</span>
            </div>
          </div>
  
          <!-- 추천 이유 -->
          <RecommendationReason 
            :wmtiCode="wmtiCode"
            :portfolioCode="portfolio.portfolioCode"
            :resultType="resultType"
            :riskPreference="riskPreference"
          />
        </div>
      </div>
  
      <!-- 더 많은 포트폴리오 버튼 -->
      <div class="more-portfolios">
        <button class="more-button" @click="goToPortfolioList">
          <i class="fa-solid fa-plus-circle"></i>
          더 많은 포트폴리오 보기
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import Chart from 'chart.js/auto';
  import RecommendationReason from './RecommendationReason.vue';
  import themePortfoliosData from '../../assets/data/theme_portfolios_full.json';
  
  export default {
    name: 'ThemePortfolio',
    components: {
      RecommendationReason,
    },
    props: {
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
        default: '고객',
      },
    },
    data() {
      return {
        portfolios: themePortfoliosData,
        charts: {},
        assetColors: {
          '국내채권': '#2ECC71',
          '해외채권': '#3498DB', 
          '국내주식': '#E74C3C',
          '선진주식': '#9B59B6',
          '신흥주식': '#F39C12',
        },
      };
    },
    computed: {
      recommendedPortfolios() {
        return this.getRecommendedPortfolios();
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.renderCharts();
      });
    },
    beforeUnmount() {
      // 차트 인스턴스 정리
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.destroy();
      });
    },
    methods: {
      getRecommendedPortfolios() {
        // WMTI 코드와 투자 성향에 따른 포트폴리오 추천 로직
        let recommendations = [];
  
        // ResultType과 RiskPreference 기반 필터링
        if (this.resultType === 'AGGRESSIVE') {
          // 공격적 투자형
          if (this.riskPreference === 'AGGRESSIVE') {
            recommendations = this.portfolios.filter(p => 
              p.themeName.includes('공격투자형') || 
              ['TP01', 'TP02', 'TP03', 'TP05', 'TP06'].includes(p.portfolioCode)
            );
          } else {
            recommendations = this.portfolios.filter(p => 
              p.themeName.includes('적극투자형') || 
              ['TP14', 'TP15', 'TP16', 'TP17'].includes(p.portfolioCode)
            );
          }
        } else if (this.resultType === 'ACTIVE') {
          // 적극적 설계형
          recommendations = this.portfolios.filter(p => 
            p.themeName.includes('적극투자형') || 
            ['TP15', 'TP16', 'TP17', 'TP18'].includes(p.portfolioCode)
          );
        } else if (this.resultType === 'BALANCED') {
          // 균형잡힌 실속형
          recommendations = this.portfolios.filter(p => 
            p.themeName.includes('위험중립형') || 
            ['TP12', 'TP13', 'TP19', 'TP20', 'TP21'].includes(p.portfolioCode)
          );
        } else if (this.resultType === 'PASSIVE') {
          // 소극적 관리형
          if (this.riskPreference === 'STABILITY') {
            recommendations = this.portfolios.filter(p => 
              p.themeName.includes('안정형') || 
              ['TP24', 'TP25'].includes(p.portfolioCode)
            );
          } else {
            recommendations = this.portfolios.filter(p => 
              p.themeName.includes('안정추구형') || 
              ['TP22', 'TP23'].includes(p.portfolioCode)
            );
          }
        }
  
        // WMTI 코드별 세부 조정
        const wmtiAdjustments = this.getWMTISpecificRecommendations();
        if (wmtiAdjustments.length > 0) {
          recommendations = [...recommendations, ...wmtiAdjustments];
        }
  
        // 중복 제거 및 최대 2개 선택
        const uniqueRecommendations = recommendations.filter((portfolio, index, self) =>
          index === self.findIndex(p => p.portfolioCode === portfolio.portfolioCode)
        );
  
        return uniqueRecommendations.slice(0, 2);
      },
  
      getWMTISpecificRecommendations() {
        // WMTI 코드별 특화 추천
        const wmtiMap = {
          'APML': ['TP01', 'TP05'], // 리더형 - 배당특급, IT
          'IPMC': ['TP06', 'TP08'], // 분석형 - 글로벌 대장주, 전지적 펀드시점
          'ABWC': ['TP02', 'TP07'], // 실행형 - 가치주, 실물투자
          'PBWL': ['TP12', 'TP13'], // 안정형 - 사계절, 영구배분
        };
  
        const codes = wmtiMap[this.wmtiCode] || [];
        return this.portfolios.filter(p => codes.includes(p.portfolioCode));
      },
  
      renderCharts() {
        this.recommendedPortfolios.forEach(portfolio => {
          const canvas = this.$refs[`chart-${portfolio.portfolioCode}`];
          if (canvas && canvas[0]) {
            this.createDonutChart(canvas[0], portfolio);
          }
        });
      },
  
      createDonutChart(canvas, portfolio) {
        const ctx = canvas.getContext('2d');
        
        // 모든 자산 포함 (0%도 포함)
        const allAssets = portfolio.composition;
        
        const data = {
          labels: allAssets.map(asset => asset.category),
          datasets: [{
            data: allAssets.map(asset => asset.percentage === 0 ? 0.1 : asset.percentage), // 0%는 0.1%로 표시하여 시각적으로 보이게 함
            backgroundColor: allAssets.map(asset => 
              asset.percentage > 0 ? this.getAssetColor(asset.category) : '#BDC3C7'
            ),
            borderWidth: 3,
            borderColor: '#ffffff',
            hoverBorderWidth: 4,
            hoverBorderColor: '#ffffff',
          }]
        };
  
        const options = {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: 'rgba(45, 51, 107, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  // 실제 데이터에서 원래 퍼센트 값을 가져옴
                  const realPercentage = allAssets[context.dataIndex].percentage;
                  return `${context.label}: ${realPercentage}%`;
                }
              }
            }
          },
          cutout: '65%',
          animation: {
            animateScale: true,
            duration: 1000,
          }
        };
  
        this.charts[portfolio.portfolioCode] = new Chart(ctx, {
          type: 'doughnut',
          data: data,
          options: options
        });
      },
  
      getAssetColor(category) {
        return this.assetColors[category] || '#95A5A6';
      },
  
      goToPortfolioList() {
        this.$router.push('/portfolios');
      },
    },
  };
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
    color: #2C3E50;
    background: linear-gradient(135deg, rgba(44, 62, 80, 0.1), rgba(44, 62, 80, 0.05));
    padding: 0.4rem 0.625rem;
    border-radius: 0.625rem;
    border-left: 3px solid #2C3E50;
  }
  
  .portfolios-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .portfolio-card {
    background: linear-gradient(
      135deg,
      var(--color-white) 0%,
      rgba(248, 249, 252, 0.8) 100%
    );
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 4px 20px rgba(45, 51, 107, 0.08);
    transition: all 0.3s ease;
    border: 2px solid transparent;
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
    background: linear-gradient(135deg, #F39C12, #E67E22);
    color: var(--color-white);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
  }
  
  .recommendation-2 .portfolio-badge {
    background: linear-gradient(135deg, #3498DB, #2980B9);
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
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
    height: 200px;
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .portfolio-chart {
    max-width: 200px;
    max-height: 200px;
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
    background: linear-gradient(135deg, var(--color-light), #BDC3C7);
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
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(125, 129, 162, 0.3);
  }
  </style>