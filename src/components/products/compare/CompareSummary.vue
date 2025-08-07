<template>
  <div class="compare-summary">
    <div class="comparison-summary">
      <div class="summary-icon">💡</div>
      <p>금융 상품 비교 결과 요약</p>
    </div>
    <SummaryCards :cards="cards" />
  </div>
</template>

<script setup>
import SummaryCards from './SummaryCards.vue';

defineProps({
  cards: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.compare-summary {
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}
.comparison-summary {
  background-color: #e9f7ff;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}
.summary-icon {
  font-size: 1.25rem;
  line-height: 1;
}
.comparison-summary p {
  margin: 0;
  color: var(--color-main);
  line-height: 1.5;
}
</style>
