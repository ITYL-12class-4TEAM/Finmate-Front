// 태그 코드 → 한글 변환 맵
export const productTagMap = {
  deposit: '예금',
  savings: '적금',
  fund: '펀드',
  insurance: '보험',
};

// 역매핑 (한글 → 코드)
export const reverseProductTagMap = Object.fromEntries(
  Object.entries(productTagMap).map(([code, label]) => [label, code])
);
