<template>
  <section class="interest-section">
    <div class="interest-rates">
      <div class="rate-item">
        <span class="rate-label">기본금리</span>
        <span class="rate-value">
          {{ formatRate(selectedOption?.intr_rate) }}
        </span>
      </div>
      <div class="rate-divider"></div>
      <div class="rate-item">
        <span class="rate-label">우대금리</span>
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
defineProps({
  selectedOption: { type: Object, default: null },
  formatRate: { type: Function, required: true },
});
</script>

<style scoped>
.interest-section {
  padding: 1.25rem;
  background: var(--color-bg-light);
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  max-width: 430px;
}

.interest-rates {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 1.2rem;
  margin-bottom: 0.85rem;
}

.rate-item {
  flex: 1;
  text-align: center;
}

.rate-label {
  display: block;
  font-size: 0.86rem;
  color: var(--color-sub);
  margin-bottom: 0.21rem;
  letter-spacing: -0.01em;
}

.rate-value {
  font-size: 1.53rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.2;
}

.rate-value.highlight {
  color: #e91e63;
}

.rate-divider {
  width: 1px;
  height: 3.2rem;
  background: var(--color-light);
  align-self: center;
}

.rate-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  background: #fff;
  border-radius: 0.38rem;
  padding: 0.7rem 0.9rem;
  font-size: 0.81rem;
  color: var(--color-sub);
  box-shadow: 0 1px 4px rgba(45, 51, 107, 0.04);
}

.notice-icon {
  width: 1.16rem;
  height: 1.16rem;
  background: var(--color-bg-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  font-weight: 700;
  font-size: 0.79rem;
  color: var(--color-sub);
  flex-shrink: 0;
}
</style>
