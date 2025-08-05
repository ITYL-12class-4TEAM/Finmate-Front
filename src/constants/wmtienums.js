// 투자기간 ENUM
export const InvestmentPeriodEnum = [
  { label: '단기', value: 'SHORT' },
  { label: '중기', value: 'MEDIUM' },
  { label: '장기', value: 'LONG' },
];
// 리스크 수용성 ENUM
export const RiskPreferenceEnum = [
  { value: 'STABILITY', label: '안정형' },
  { value: 'STABILITY_ORIENTED', label: '안정지향형' },
  { value: 'RISK_NEUTRAL', label: '위험중립형' },
  { value: 'ACTIVELY', label: '적극투자형' },
  { value: 'AGGRESSIVE', label: '공격투자형' },
];
// 자금사용목적 카테고리 ENUM
export const PurposeCategoryEnum = [
  { value: 'EMERGENCY', label: '비상자금 마련' },
  { value: 'TRAVEL', label: '여행자금' },
  { value: 'MARRIAGE', label: '결혼자금' },
  { value: 'HOUSE_PURCHASE', label: '주택구입' },
  { value: 'RETIREMENT', label: '노후준비' },
  { value: 'CHILD_EDUCATION', label: '자녀교육비' },
  { value: 'WEALTH_BUILDING', label: '자산증식' },
  { value: 'OTHER', label: '기타' },
];
export const ResultTypeEnum = {
  AGGRESSIVE: '고수익 지향형',
  ACTIVE: '적극적 설계형',
  BALANCED: '균형잡힌 실속형',
  PASSIVE: '소극적 관리형',
};

export const RiskPreferenceDescriptionEnum = {
  STABILITY: '원금 보전을 최우선으로 하며 낮은 수익률이라도 안정적인 투자를 추구하는 성향',
  STABILITY_ORIENTED: '위험을 최소화하고 예측 가능한 수익을 선호하며 보수적인 투자를 지향하는 성향',
  RISK_NEUTRAL: '적정 수준의 위험을 감수하여 균형 잡힌 수익을 추구하는 중립적 투자 성향',
  ACTIVELY: '적극적인 자산 배분을 통해 시장 기회를 포착하고 능동적인 투자 전략을 선호하는 성향',
  AGGRESSIVE: '높은 위험을 감수하더라도 시장 평균을 뛰어넘는 고수익 달성을 목표로 하는 성향',
};

// // value → label 변환 함수 (영문-> 한글 GET용)
// export function getInvestmentPeriodLabel(value) {
//   const found = InvestmentPeriodEnum.find((item) => item.value === value);
//   return found ? found.label : value;
// }

// // label → value 변환 (역방향)(한글->영문 POST용)
// export function getInvestmentPeriodValue(label) {
//   const found = InvestmentPeriodEnum.find((item) => item.label === label);
//   return found ? found.value : label;
// }
