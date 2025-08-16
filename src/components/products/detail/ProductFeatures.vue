<template>
  <div class="key-features">
    <h3 class="section-title">상품 주요 정보</h3>
    <div class="feature-grid">
      <div v-for="f in features" :key="f.label" class="feature-item">
        <div class="feature-icon" :aria-label="f.label">
          <i :class="f.icon"></i>
        </div>
        <div class="feature-content">
          <div class="feature-label">{{ f.label }}</div>
          <div class="feature-value">{{ f.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: { type: Object, required: true },
  selectedOption: { type: Object, default: null },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true },
});

// 통화 단위 포맷팅 함수 (만원, 천만원, 억원 단위로 변환)
const formatKoreanCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return '홈페이지 참고';
  }

  // 숫자로 변환
  const num = Number(amount);
  if (isNaN(num)) {
    return '홈페이지 참고';
  }

  // 0원인 경우
  if (num === 0) {
    return '0원';
  }

  // 1억 이상인 경우 (1억 = 100,000,000)
  if (num >= 100000000) {
    const billion = Math.floor(num / 100000000);
    // 1억 이상일 경우 만원 단위는 생략
    return `${billion}억원`;
  }

  // 1천만 이상인 경우 (1천만 = 10,000,000)
  if (num >= 10000000) {
    const tenMillion = Math.floor(num / 10000000);
    return `${tenMillion}천만원`;
  }

  // 만원 단위로 표시 (1만원 = 10,000)
  if (num >= 10000) {
    const tenThousand = Math.floor(num / 10000);
    return `${tenThousand}만원`;
  }

  // 천원 단위로 표시 (1천원 = 1,000)
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    return `${thousand}천원`;
  }

  // 그 외의 경우
  return `${num}원`;
};

const features = computed(() => {
  const p = props.product?.productDetail || {};
  const opt = props.selectedOption || {};
  return [
    {
      // ✨ 아이콘 값을 전체 클래스 이름으로 변경
      icon: 'fas fa-dollar-sign',
      label: '최소 가입금액',
      value: formatKoreanCurrency(p.minDepositAmount) || '0원',
    },
    {
      icon: 'fas fa-chart-line',
      label: '최대 가입금액',
      value: p.maxDepositAmount ? formatKoreanCurrency(p.maxDepositAmount) : '홈페이지 참고',
    },
    {
      icon: 'fas fa-clock',
      label: '가입 기간',
      value: opt.save_trm || opt.saveTrm ? `${opt.save_trm || opt.saveTrm}개월` : '-',
    },
    {
      icon: 'fas fa-calendar-days',
      label: '공시 시작일',
      value: props.formatDate?.(p.dcls_strt_day) || '-',
    },
    {
      icon: 'fas fa-right-left',
      label: '가입 방법',
      value: p.join_way || '제한 없음',
    },
  ];
});
</script>

<style scoped>
/* ==========================================================================
   1. 카드 기본 레이아웃 (유지)
   ========================================================================== */
.key-features {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 0.5rem 1rem; /* 내부 여백 상하로 조금 더 확보 */
  margin-bottom: 0.5rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
}

/* ==========================================================================
   2. 섹션 제목 (유지)
   ========================================================================== */
.section-title {
  font-size: 1.125rem; /* 18px */
  font-weight: 700; /* 좀 더 강조 */
  color: var(--color-main);
  margin: 0 0 0.5rem 0; /* 하단 마진 증가 */
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f1f5; /* var(--color-bg-light) 와 유사한 색상 */
}

/* ==========================================================================
   3. ✨ 정보 그리드 (2열 구조로 변경)
   ========================================================================== */
.feature-grid {
  display: grid;
  /* 2개의 열을 만들고, 각 열이 동일한 너비를 갖도록 설정 (1fr = 1 fraction) */
  grid-template-columns: repeat(2, 1fr);
  row-gap: 0.75rem; /* 행(세로) 간격 */
  column-gap: 0.5rem; /* 열(가로) 간격 */
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem; /* 아이콘과 콘텐츠 사이 간격 */
}

/* ==========================================================================
   4. 아이콘 및 콘텐츠 스타일 (레이아웃에 맞게 유지 및 미세 조정)
   ========================================================================== */
.feature-icon {
  width: 2.25rem; /* 36px */
  height: 2.25rem; /* 36px */
  background: #f0f1f5; /* var(--color-bg-light)와 유사한 색상 */
  border-radius: 50%;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon i {
  color: var(--color-main);
}

.feature-content {
  flex: 1;
  min-width: 0;
  padding-top: 0.125rem;
}

.feature-label {
  font-size: 0.8125rem; /* 13px */
  color: var(--color-sub);
  margin-bottom: 0.25rem;
}

.feature-value {
  font-size: 0.8rem; /* 15px */
  font-weight: 600;
  color: var(--color-main);
  white-space: normal;
  word-break: keep-all;
  line-height: 1.4;
}
</style>
