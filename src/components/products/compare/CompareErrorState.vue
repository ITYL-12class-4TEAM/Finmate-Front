<template>
  <div class="error-state">
    <div class="error-icon">!</div>
    <p>{{ error }}</p>
    <p class="error-subtitle">API 연결에 실패했지만, 기본 비교 정보를 확인할 수 있습니다.</p>
    <div v-if="summary" class="summary-cards">
      <div class="summary-card">
        <div class="summary-title">최고 금리 상품</div>
        <div class="summary-bank">
          {{ summary.bestRate.bankName }}
        </div>
        <div class="summary-product">
          {{ summary.bestRate.productName }}
        </div>
        <div class="summary-value">
          {{ formatRate(summary.bestRate.rate) }}
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-title">최단 가입 기간</div>
        <div class="summary-bank">
          {{ summary.shortestTerm.bankName }}
        </div>
        <div class="summary-product">
          {{ summary.shortestTerm.productName }}
        </div>
        <div class="summary-value">{{ summary.shortestTerm.term }}개월</div>
      </div>
    </div>
    <button class="retry-btn" @click="$emit('retry')">다시 시도</button>
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    required: true,
  },
  summary: {
    type: Object,
    default: null,
  },
});

defineEmits(['retry']);

// 금리 포맷팅
const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  text-align: center;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.error-icon {
  width: 3.125rem;
  height: 3.125rem;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.error-subtitle {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.summary-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
  width: 100%;
  max-width: 20rem;
}

.summary-card {
  background-color: var(--color-bg-light);
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid var(--color-main);
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
</style>
