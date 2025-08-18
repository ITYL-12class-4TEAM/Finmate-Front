<template>
  <section class="interest-section">
    <div class="interest-rates">
      <div class="rate-item">
        <span class="rate-label"><FinancialTerm term="기본금리" /></span>
        <span class="rate-value">
          {{ formatRate(selectedOption?.intr_rate) }}
        </span>
      </div>
      <div class="rate-divider"></div>
      <div class="rate-item">
        <span class="rate-label"><FinancialTerm term="우대금리" /></span>
        <span class="rate-value highlight">
          {{ formatRate(selectedOption?.intr_rate2) }}
        </span>
      </div>
    </div>
    <div class="rate-notice" role="note" aria-label="금리 안내">
      <span class="notice-icon" aria-hidden="true">i</span>
      <span>
        금리는
        <strong>{{ selectedOption?.save_trm || selectedOption?.saveTrm || '-' }}개월</strong>
        기준이며, 실제 금리는 가입 시점과 조건에 따라 달라질 수 있습니다.
      </span>
    </div>
  </section>
</template>

<script setup>
import FinancialTerm from '@/components/common/FinancialTerm.vue';

defineProps({
  selectedOption: { type: Object, default: null },
  formatRate: { type: Function, required: true },
});
</script>

<style scoped>
/* ==========================================================================
   1. 섹션 기본 레이아웃
   - 다른 카드들과 일관된 흰색 카드 디자인 적용
   ========================================================================== */
.interest-section {
  background-color: #ffffff;
  border-radius: 0.75rem; /* 12px */
  padding: 0.25rem 0.75rem; /* 20px */
  margin-bottom: 0.5rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
}

/* ==========================================================================
   2. 금리 표시 영역
   ========================================================================== */
.interest-rates {
  display: flex;
  align-items: stretch;
  justify-content: space-around; /* 공간을 균등하게 분배 */
  margin-bottom: 0.75rem;
}

.rate-item {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.rate-label {
  display: block;
  font-size: 0.8rem; /* 15px */
  color: var(--color-sub);
  margin-bottom: 0.375rem; /* 6px */
}

.rate-value {
  font-size: 1.25rem; /* 28px */
  font-weight: 700;
  color: var(--color-main);
  line-height: 1.2;
}

.rate-value.highlight {
  /* ✨ 색상 규칙 준수 */
  color: var(--color-accent, #e91e63);
}

.rate-divider {
  width: 0.0625rem; /* 1px */
  background: var(--color-bg-light);
}

/* ==========================================================================
   3. 하단 안내 문구
   - 더 깔끔하고 통합된 디자인으로 변경
   ========================================================================== */
.rate-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem; /* 8px */
  background: var(--color-bg-light);
  border-radius: 0.5rem; /* 8px */
  padding: 0.75rem 1rem; /* 12px 16px */
  font-size: 0.75rem; /* 13px */
  color: var(--color-sub);
  line-height: 1.3;
}

.notice-icon {
  width: 1.25rem; /* 20px */
  height: 1.25rem; /* 20px */
  background: var(--color-light);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  font-weight: 600;
  font-size: 0.875rem; /* 14px */
  flex-shrink: 0;
  margin-top: 0.125rem; /* 텍스트와 시각적 정렬 */
}
</style>
