<template>
  <div class="theme-portfolio-section">
    <h3 class="section-title portfolio-title">💼 추천 테마 포트폴리오</h3>

    <div class="portfolio-list">
      <div
        v-for="(portfolio, index) in portfolios"
        :key="portfolio.portfolioCode"
        class="portfolio-item"
        :class="{ expanded: expandedItems[index] }"
      >
        <!-- 기본 헤더 (항상 표시) -->
        <div class="portfolio-header" @click="toggleExpand(index)">
          <div class="header-content">
            <div class="portfolio-badge">
              <span class="badge-text">추천 {{ index + 1 }}</span>
            </div>
            <h4 class="portfolio-name">{{ portfolio.themeName }}</h4>
            <div class="portfolio-code">{{ portfolio.portfolioCode }}</div>
          </div>

          <button class="toggle-button" :class="{ expanded: expandedItems[index] }">
            <i
              class="fa-solid"
              :class="expandedItems[index] ? 'fa-chevron-up' : 'fa-chevron-down'"
            ></i>
            <span>{{ expandedItems[index] ? '접기' : '자세히' }}</span>
          </button>
        </div>

        <!-- 확장 가능한 콘텐츠 -->
        <transition name="expand">
          <div v-if="expandedItems[index]" class="portfolio-content">
            <!-- 포트폴리오 설명 -->
            <div class="portfolio-description">
              <p>{{ portfolio.description }}</p>
            </div>

            <!-- 구성 정보 -->
            <div class="composition-info">
              <h5 class="info-subtitle">
                <i class="fa-solid fa-chart-pie"></i>
                포트폴리오 구성
              </h5>
              <div class="composition-grid">
                <div v-for="(asset, idx) in portfolio.composition" :key="idx" class="asset-item">
                  <div class="asset-info">
                    <span class="asset-name">{{ asset.name }}</span>
                    <span class="asset-ratio">{{ asset.ratio }}%</span>
                  </div>
                  <div class="asset-bar">
                    <div
                      class="asset-progress"
                      :style="{ width: asset.ratio + '%' }"
                      :class="getAssetClass(asset.type)"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 예상 수익률 및 위험도 -->
            <div class="performance-info">
              <h5 class="info-subtitle">
                <i class="fa-solid fa-trending-up"></i>
                예상 성과
              </h5>
              <div class="performance-grid">
                <div class="performance-item">
                  <span class="performance-label">예상 수익률</span>
                  <span class="performance-value positive">{{ portfolio.expectedReturn }}%</span>
                </div>
                <div class="performance-item">
                  <span class="performance-label">위험도</span>
                  <span class="performance-value" :class="getRiskClass(portfolio.riskLevel)">
                    {{ portfolio.riskLevel }}
                  </span>
                </div>
                <div class="performance-item">
                  <span class="performance-label">투자 기간</span>
                  <span class="performance-value">{{ portfolio.investmentPeriod }}</span>
                </div>
              </div>
            </div>

            <!-- 추천 이유 컴포넌트 -->
            <RecommendationReason
              :wmti-code="wmtiCode"
              :portfolio-code="portfolio.portfolioCode"
              :result-type="resultType"
              :risk-preference="riskPreference"
            />

            <!-- 액션 버튼 -->
            <div class="portfolio-actions">
              <button class="action-btn primary">
                <i class="fa-solid fa-shopping-cart"></i>
                투자하기
              </button>
              <button class="action-btn secondary">
                <i class="fa-solid fa-bookmark"></i>
                관심상품 등록
              </button>
              <button class="action-btn tertiary">
                <i class="fa-solid fa-info-circle"></i>
                상세정보
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import RecommendationReason from './RecommendationReason.vue';

export default {
  name: 'ThemePortfolio',
  components: {
    RecommendationReason,
  },
  props: {
    wmtiCode: {
      type: String,
      required: false,
      default: '',
    },
    resultType: {
      type: String,
      required: false,
      default: '',
    },
    riskPreference: {
      type: String,
      required: false,
      default: '',
    },
    userName: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      expandedItems: {}, // 각 포트폴리오의 확장 상태 관리
      portfolios: [
        {
          portfolioCode: 'TP01',
          themeName: '배당 중심 공격적 포트폴리오',
          description:
            '높은 배당수익률과 성장성을 동시에 추구하는 공격적 투자 전략입니다. 우량 배당주를 중심으로 구성하여 안정적인 현금흐름과 자본이득을 목표로 합니다.',
          expectedReturn: '8.5',
          riskLevel: '높음',
          investmentPeriod: '3년 이상',
          composition: [
            { name: '미국 배당주', ratio: 40, type: 'stock' },
            { name: '한국 우량주', ratio: 30, type: 'stock' },
            { name: 'REIT', ratio: 20, type: 'reit' },
            { name: '현금성 자산', ratio: 10, type: 'cash' },
          ],
        },
        {
          portfolioCode: 'TP05',
          themeName: '기술주 중심 성장 포트폴리오',
          description:
            '혁신 기술 기업들의 성장 잠재력에 투자하는 포트폴리오입니다. AI, 클라우드, 반도체 등 미래 성장 동력에 집중합니다.',
          expectedReturn: '12.0',
          riskLevel: '매우높음',
          investmentPeriod: '5년 이상',
          composition: [
            { name: '미국 기술주', ratio: 50, type: 'stock' },
            { name: '한국 IT주', ratio: 25, type: 'stock' },
            { name: '신흥시장 기술주', ratio: 15, type: 'emerging' },
            { name: '현금성 자산', ratio: 10, type: 'cash' },
          ],
        },
        {
          portfolioCode: 'TP13',
          themeName: '영구적 자산배분 균형 포트폴리오',
          description:
            '시장 상황에 관계없이 일정한 자산 배분을 유지하는 장기 투자 전략입니다. 정기적인 리밸런싱을 통해 안정적인 수익을 추구합니다.',
          expectedReturn: '6.2',
          riskLevel: '보통',
          investmentPeriod: '10년 이상',
          composition: [
            { name: '글로벌 주식', ratio: 60, type: 'stock' },
            { name: '글로벌 채권', ratio: 30, type: 'bond' },
            { name: '대체투자', ratio: 10, type: 'alternative' },
          ],
        },
      ],
    };
  },
  methods: {
    toggleExpand(index) {
      this.expandedItems[index] = !this.expandedItems[index];
    },
    getAssetClass(type) {
      const classes = {
        stock: 'asset-stock',
        bond: 'asset-bond',
        reit: 'asset-reit',
        cash: 'asset-cash',
        emerging: 'asset-emerging',
        alternative: 'asset-alternative',
      };
      return classes[type] || 'asset-default';
    },
    getRiskClass(riskLevel) {
      const classes = {
        매우높음: 'risk-very-high',
        높음: 'risk-high',
        보통: 'risk-medium',
        낮음: 'risk-low',
        매우낮음: 'risk-very-low',
      };
      return classes[riskLevel] || 'risk-medium';
    },
  },
};
</script>

<style scoped>
.theme-portfolio-section {
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(248, 249, 252, 0.8) 100%);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 0.25rem 1.25rem rgba(45, 51, 107, 0.08);
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.portfolio-title {
  color: #2c3e50;
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.1), rgba(44, 62, 80, 0.05));
  padding: 0.4rem 0.625rem;
  border-radius: 0.625rem;
  border-left: 0.188rem solid #2c3e50;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.portfolio-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.portfolio-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 252, 0.6));
  border: 0.063rem solid rgba(45, 51, 107, 0.1);
  border-radius: 0.875rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.portfolio-item:hover {
  box-shadow: 0 0.375rem 1.25rem rgba(45, 51, 107, 0.12);
  transform: translateY(-0.063rem);
}

.portfolio-item.expanded {
  border-color: rgba(45, 51, 107, 0.2);
  box-shadow: 0 0.5rem 1.5rem rgba(45, 51, 107, 0.15);
}

.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.portfolio-header:hover {
  background: rgba(45, 51, 107, 0.02);
}

.header-content {
  flex: 1;
}

.portfolio-badge {
  margin-bottom: 0.375rem;
}

.badge-text {
  background: linear-gradient(135deg, #3498db, #5dade2);
  color: var(--color-white);
  padding: 0.2rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.031rem;
}

.portfolio-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0.25rem 0;
  line-height: 1.3;
}

.portfolio-code {
  font-size: 0.75rem;
  color: var(--color-light);
  font-weight: 500;
  background: rgba(45, 51, 107, 0.05);
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  display: inline-block;
  font-family: 'Courier New', monospace;
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.08), rgba(45, 51, 107, 0.04));
  border: 0.063rem solid rgba(45, 51, 107, 0.15);
  border-radius: 1.25rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.toggle-button:hover {
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.12), rgba(45, 51, 107, 0.06));
  transform: translateY(-0.031rem);
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.2);
}

.toggle-button.expanded {
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: var(--color-white);
  border-color: var(--color-main);
}

.toggle-button i {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
}

.toggle-button.expanded i {
  transform: rotate(180deg);
}

/* 확장 애니메이션 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-0.625rem);
}

.expand-enter-to,
.expand-leave {
  max-height: 50rem;
  opacity: 1;
  transform: translateY(0);
}

.portfolio-content {
  padding: 0 1rem 1rem;
  border-top: 0.063rem solid rgba(45, 51, 107, 0.1);
  background: linear-gradient(135deg, rgba(248, 249, 252, 0.3), rgba(255, 255, 255, 0.1));
}

.portfolio-description {
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(45, 51, 107, 0.02);
  border-radius: 0.5rem;
  border-left: 0.188rem solid #3498db;
}

.portfolio-description p {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-sub);
  margin: 0;
  font-weight: 500;
}

.info-subtitle {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 1rem 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-subtitle i {
  color: #3498db;
  font-size: 0.8rem;
}

.composition-info,
.performance-info {
  margin: 1rem 0;
}

.composition-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-item {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 0.063rem solid rgba(45, 51, 107, 0.08);
}

.asset-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}

.asset-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-sub);
}

.asset-ratio {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-main);
}

.asset-bar {
  width: 100%;
  height: 0.375rem;
  background: rgba(185, 187, 204, 0.2);
  border-radius: 0.188rem;
  overflow: hidden;
}

.asset-progress {
  height: 100%;
  border-radius: 0.188rem;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.asset-stock {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

.asset-bond {
  background: linear-gradient(90deg, #27ae60, #58d68d);
}

.asset-reit {
  background: linear-gradient(90deg, #e67e22, #f8c471);
}

.asset-cash {
  background: linear-gradient(90deg, #95a5a6, #bdc3c7);
}

.asset-emerging {
  background: linear-gradient(90deg, #8e44ad, #bb8fce);
}

.asset-alternative {
  background: linear-gradient(90deg, #e74c3c, #f1948a);
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
  gap: 0.75rem;
}

.performance-item {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.5rem;
  padding: 0.75rem;
  text-align: center;
  border: 0.063rem solid rgba(45, 51, 107, 0.08);
}

.performance-label {
  display: block;
  font-size: 0.7rem;
  color: var(--color-light);
  font-weight: 500;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.031rem;
}

.performance-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-main);
}

.performance-value.positive {
  color: #27ae60;
}

.risk-very-high {
  color: #e74c3c !important;
}

.risk-high {
  color: #e67e22 !important;
}

.risk-medium {
  color: #f39c12 !important;
}

.risk-low {
  color: #27ae60 !important;
}

.risk-very-low {
  color: #2ecc71 !important;
}

.portfolio-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 6rem;
  border: none;
  padding: 0.6rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-family: inherit;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: var(--color-white);
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-0.063rem);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.4);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #3498db, #5dade2);
  color: var(--color-white);
  box-shadow: 0 0.125rem 0.5rem rgba(52, 152, 219, 0.3);
}

.action-btn.secondary:hover {
  transform: translateY(-0.063rem);
  box-shadow: 0 0.25rem 0.75rem rgba(52, 152, 219, 0.4);
}

.action-btn.tertiary {
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.1), rgba(45, 51, 107, 0.05));
  color: var(--color-main);
  border: 0.063rem solid rgba(45, 51, 107, 0.2);
}

.action-btn.tertiary:hover {
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.15), rgba(45, 51, 107, 0.08));
  transform: translateY(-0.063rem);
}

.action-btn i {
  font-size: 0.7rem;
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
@media (max-width: 26.875rem) {
  .theme-portfolio-section {
    padding: 1rem;
  }

  .portfolio-header {
    padding: 0.875rem;
  }

  .portfolio-name {
    font-size: 0.9rem;
  }

  .toggle-button {
    padding: 0.4rem 0.6rem;
    font-size: 0.7rem;
  }

  .portfolio-content {
    padding: 0 0.875rem 0.875rem;
  }

  .performance-grid {
    grid-template-columns: 1fr;
  }

  .portfolio-actions {
    flex-direction: column;
  }

  .action-btn {
    min-width: auto;
  }
}
</style>
