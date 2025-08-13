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

const features = computed(() => {
  const p = props.product?.productDetail || {};
  const opt = props.selectedOption || {};
  return [
    {
      // ✨ 아이콘 값을 전체 클래스 이름으로 변경
      icon: 'fas fa-dollar-sign',
      label: '최소 가입금액',
      value: props.formatCurrency?.(p.minDepositAmount) || '0원',
    },
    {
      icon: 'fas fa-chart-line',
      label: '최대 가입금액',
      value: p.maxDepositAmount ? props.formatCurrency(p.maxDepositAmount) : '홈페이지 직접 참고',
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
    {
      icon: 'fas fa-percent',
      label: '금리 유형',
      value: p.intr_rate_type_nm || '단리',
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
  color: #9387d6;
}

.feature-content {
  flex: 1;
  min-width: 0;
  padding-top: 0.125rem;
}

.feature-label {
  font-size: 0.8125rem; /* 13px */
  color: #5a607c; /* var(--color-sub)와 유사한 색상 */
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
