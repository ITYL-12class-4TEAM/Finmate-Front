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
