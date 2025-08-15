<template>
  <div class="favorites-summary">
    <div class="summary-container">
      <div class="count-section">
        <span class="count-text">
          총 <strong>{{ formatCount(count) }}개</strong> 상품
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    required: true,
  },
});

const formatCount = (count) => {
  if (!count || count === 0) return '0';
  return new Intl.NumberFormat('ko-KR').format(count);
};
</script>

<style scoped>
.favorites-summary {
  margin-bottom: 1rem;
}

.summary-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--color-white);
  border-radius: 0.75rem;
  border: 1px solid #f1f5f9;
}

.count-section {
  flex: 1;
}

.count-text {
  font-size: 0.875rem;
  color: var(--color-sub);
  font-weight: 500;
}

.count-text strong {
  color: var(--color-main);
  font-weight: 600;
}

@media (max-width: 768px) {
  .summary-container {
    padding: 0.875rem 1rem;
  }

  .count-text {
    font-size: 0.8125rem;
  }
}
</style>
