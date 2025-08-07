<template>
  <div class="summary-card" :class="{ highlight }">
    <div class="summary-title">{{ title }}</div>
    <div class="summary-bank">{{ bankName }}</div>
    <div class="summary-product">{{ productName }}</div>
    <div class="summary-value">{{ value }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  bankName: String,
  productName: String,
  value: String,
  highlight: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.summary-card {
  background-color: var(--color-bg-light);
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid var(--color-main);
  margin-bottom: 0.75rem;
}
.summary-title {
  font-weight: 500;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}
.summary-bank {
  font-size: 0.75rem;
  color: var(--color-sub);
}
.summary-product {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}
.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
}
.summary-card.highlight {
  border-left: 4px solid #e91e63;
  background-color: #fff3f8;
}
</style>
