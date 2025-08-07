<template>
  <div class="interest-section">
    <div class="interest-rates">
      <div class="rate-item">
        <div class="rate-label">기본금리</div>
        <div class="rate-value">
          {{ formatRate(selectedOption?.intr_rate) }}
        </div>
      </div>
      <div class="rate-divider"></div>

      <div class="rate-item">
        <div class="rate-label">우대금리</div>
        <div class="rate-value highlight">
          {{ formatRate(selectedOption?.intr_rate2) }}
        </div>
      </div>
    </div>

    <div class="rate-notice">
      <div class="notice-icon">i</div>
      <div>
        금리는
        <strong>{{ selectedOption?.save_trm || selectedOption?.saveTrm || '-' }}개월</strong>
        기준이며, 실제 금리는 가입 시점과 조건에 따라 달라질 수 있습니다.
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ProductRateInfo',
  props: {
    selectedOption: {
      type: Object,
      default: null,
    },
    formatRate: {
      type: Function,
      required: true,
    },
  },
};
</script>
<style scoped>
.interest-section {
  padding: 1.5rem;
  background-color: var(--color-bg-light);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.interest-rates {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.rate-item {
  text-align: center;
}

.rate-label {
  font-size: 0.875rem;
  color: var(--color-sub);
  margin-bottom: 0.25rem;
}

.rate-value {
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--color-main);
}

.rate-value.highlight {
  color: #e91e63;
}

.rate-divider {
  width: 1px;
  height: 3.75rem;
  background-color: var(--color-light);
}

.rate-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background-color: white;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-sub);
}

.notice-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: var(--color-bg-light);
  font-style: italic;
  font-weight: bold;
  font-size: 0.75rem;
  color: var(--color-sub);
  flex-shrink: 0;
}
</style>
