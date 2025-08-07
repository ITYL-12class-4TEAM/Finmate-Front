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

<script setup>
import { computed } from 'vue';
import { wmtiPersonalityMap } from '@/constants/wmtiPersonalityMap';
import { wmtiThemePortfolioMap } from '@/constants/wmtiThemePortfolioMap';

// ✅ Props 선언
const props = defineProps({
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
});

// ✅ WMTI 성향 설명 텍스트
const getWMTIPersonality = () => {
  return wmtiPersonalityMap[props.portfolioCode] || '고객님의 투자 성향을 고려한';
};

const getPortfolioType = () => {
  return wmtiThemePortfolioMap[props.portfolioCode] || '균형잡힌';
};

// ✅ 추천 텍스트
const recommendationText = computed(() => {
  const wmtiPersonality = getWMTIPersonality();
  const portfolioType = getPortfolioType();
  return `${wmtiPersonality}인 고객님께는 ${portfolioType} 포트폴리오가 적합합니다. 고객님의 투자 성향과 위험 수용도를 고려하여 신중하게 선별된 추천입니다.`;
});

// ✅ 주요 강점 분석
const getPortfolioSpecificHighlights = () => {
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

  return specificHighlights[props.portfolioCode] || ['전문가 검증 포트폴리오'];
};

// ✅ 추천 핵심 포인트 3가지 도출
const highlights = computed(() => {
  const highlightsList = [];

  // ResultType 기반 강점
  switch (props.resultType) {
    case 'AGGRESSIVE':
      highlightsList.push('높은 수익률 추구에 적합', '시장 변동성에 대한 내성');
      break;
    case 'ACTIVE':
      highlightsList.push('적극적 투자 성향과 일치', '체계적인 자산배분');
      break;
    case 'BALANCED':
      highlightsList.push('위험과 수익의 균형', '안정적인 장기 성과');
      break;
    case 'PASSIVE':
      highlightsList.push('안정성과 원금보전 중시', '낮은 변동성');
      break;
  }

  // RiskPreference 기반 강점
  switch (props.riskPreference) {
    case 'AGGRESSIVE':
      highlightsList.push('공격적 위험 수용 성향 반영');
      break;
    case 'ACTIVELY':
      highlightsList.push('능동적 위험 관리 전략');
      break;
    case 'STABILITY':
      highlightsList.push('안정성 우선의 보수적 접근');
      break;
  }

  // 포트폴리오별 특화 강점
  highlightsList.push(...getPortfolioSpecificHighlights());

  return highlightsList.slice(0, 3);
});
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
