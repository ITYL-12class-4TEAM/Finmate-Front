<template>
  <div class="recommendation-reason">
    <div class="reason-header">
      <i class="fa-solid fa-lightbulb"></i>
      <span class="reason-title">추천 이유</span>
    </div>

    <div class="reason-content">
      <div class="reason-text">
        {{ recommendationText }}
      </div>

      <div class="reason-highlights">
        <div v-for="(highlight, index) in highlights" :key="index" class="highlight-item">
          <i class="fa-solid fa-check-circle"></i>
          <span>{{ highlight }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { wmtiPersonalityMap } from '../../constants/wmtiPersonalityMap';
import { wmtiThemePortfolioMap } from '../../constants/wmtiThemePortfolioMap';
export default {
  name: 'RecommendationReason',
  props: {
    wmtiCode: {
      type: String,
      required: true,
    },
    portfolioCode: {
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
  },
  computed: {
    recommendationText() {
      return this.getRecommendationText();
    },
    highlights() {
      return this.getHighlights();
    },
  },
  methods: {
    getRecommendationText() {
      // WMTI 코드와 포트폴리오에 따른 추천 이유 생성
      const wmtiPersonality = this.getWMTIPersonality();
      const portfolioType = this.getPortfolioType();

      return `${wmtiPersonality}인 고객님께는 ${portfolioType} 포트폴리오가 적합합니다. 고객님의 투자 성향과 위험 수용도를 고려하여 신중하게 선별된 추천입니다.`;
    },

    getWMTIPersonality() {
      return wmtiPersonalityMap[this.portfolioCode] || '고객님의 투자 성향을 고려한';
    },
    getPortfolioType() {
      return wmtiThemePortfolioMap[this.portfolioCode] || '균형잡힌';
    },

    getHighlights() {
      const highlights = [];

      // ResultType 기반 강점
      if (this.resultType === 'AGGRESSIVE') {
        highlights.push('높은 수익률 추구에 적합');
        highlights.push('시장 변동성에 대한 내성');
      } else if (this.resultType === 'ACTIVE') {
        highlights.push('적극적 투자 성향과 일치');
        highlights.push('체계적인 자산배분');
      } else if (this.resultType === 'BALANCED') {
        highlights.push('위험과 수익의 균형');
        highlights.push('안정적인 장기 성과');
      } else if (this.resultType === 'PASSIVE') {
        highlights.push('안정성과 원금보전 중시');
        highlights.push('낮은 변동성');
      }

      // RiskPreference 기반 강점
      if (this.riskPreference === 'AGGRESSIVE') {
        highlights.push('공격적 위험 수용 성향 반영');
      } else if (this.riskPreference === 'ACTIVELY') {
        highlights.push('능동적 위험 관리 전략');
      } else if (this.riskPreference === 'STABILITY') {
        highlights.push('안정성 우선의 보수적 접근');
      }

      // 포트폴리오별 특화 강점
      const portfolioHighlights = this.getPortfolioSpecificHighlights();
      highlights.push(...portfolioHighlights);

      return highlights.slice(0, 3); // 최대 3개까지
    },

    getPortfolioSpecificHighlights() {
      const specificHighlights = {
        TP01: ['높은 배당수익률', '우량 배당주 중심'],
        TP02: ['저평가 주식 발굴', '가치투자 전략'],
        TP03: ['미국 시장 집중', '달러 자산 비중 확대'],
        TP04: ['ESG 경영 우수기업', '지속가능 투자'],
        TP05: ['기술 혁신 수혜', 'IT 산업 성장 동참'],
        TP06: ['글로벌 대장주', '시장 대표 기업들'],
        TP07: ['인플레이션 헤지', '실물자산 투자'],
        TP08: ['전문가 액티브 운용', '시장 대비 초과수익 추구'],
        TP09: ['미중 양국 균형', '글로벌 패권 수혜'],
        TP10: ['글로벌 분산효과', '지역별 균형배분'],
        TP11: ['신흥시장 할인매수', '장기 성장 잠재력'],
        TP12: ['계절 사이클 대응', '시기별 자산 조정'],
        TP13: ['영구 보유 전략', '리밸런싱 효과'],
        TP22: ['원금 안전성', '예금 대체 효과'],
        TP23: ['펀드 입문 최적화', '단계적 학습 가능'],
      };

      return specificHighlights[this.portfolioCode] || ['전문가 검증 포트폴리오'];
    },
  },
};
</script>

<style scoped>
.recommendation-reason {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.05), rgba(52, 152, 219, 0.02));
  border: 0.063rem solid rgba(52, 152, 219, 0.15);
  border-radius: 0.75rem;
  padding: 1rem;
  margin-top: 1rem;
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.reason-header i {
  color: #f39c12;
  font-size: 1rem;
}

.reason-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-main);
}

.reason-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reason-text {
  font-size: 0.825rem;
  line-height: 1.5;
  color: var(--color-sub);
  font-weight: 500;
}

.reason-highlights {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-sub);
}

.highlight-item i {
  color: #27ae60;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.highlight-item span {
  font-weight: 500;
}
</style>
