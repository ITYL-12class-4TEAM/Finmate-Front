<template>
  <div class="result-card" :class="{ 'highlight-card': highlight }">
    <div class="card-header">
      <div class="card-badge">{{ title }}</div>
      <div class="card-bank">{{ bankName }}</div>
    </div>
    <div class="card-body">
      <div class="product-name">{{ productName }}</div>
      <div class="value-info" :class="{ 'rate-value': highlight }">
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultCard',
  props: {
    title: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      default: '은행 정보',
    },
    productName: {
      type: String,
      default: '상품 정보',
    },
    value: {
      type: String,
      default: '-',
    },
    highlight: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.result-card {
  background-color: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
  position: relative;
  border-left: 4px solid var(--color-main);
}

.highlight-card {
  border-left: 4px solid #e91e63;
}

.card-header {
  background-color: var(--color-bg-light);
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.card-badge {
  background-color: var(--color-main);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.highlight-card .card-badge {
  background-color: #e91e63;
}

.card-bank {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.card-body {
  padding: 1rem;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-main);
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.value-info {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin-top: 0.5rem;
}

.rate-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e91e63;
}
</style>
