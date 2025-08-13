<template>
  <div class="compare-floating-bar">
    <div class="compare-count">
      <strong>{{ compareList.length }}개</strong> 상품 비교 중
    </div>
    <div class="action-buttons">
      <button class="clear-btn" @click="$emit('clear-compare-list')">비우기</button>
      <button class="compare-btn" @click="$emit('go-to-compare')">비교하기</button>
    </div>
  </div>
</template>

<script setup>
// productType 추가
defineProps({
  compareList: {
    type: Array,
    required: true,
  },
  productType: {
    type: String,
    default: 'deposit',
  },
});

defineEmits(['go-to-compare', 'clear-compare-list']);
</script>

<style scoped>
.compare-floating-bar {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-main);
  border-radius: 2rem;
  padding: 0.75rem 1.25rem;
  width: 90%;
  max-width: 24rem;
  box-shadow: 0 0.25rem 1rem rgba(45, 51, 107, 0.2);
  z-index: 100;
}

.compare-count {
  color: #fff;
  font-size: 0.875rem;
}

.compare-count strong {
  font-weight: 600;
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.clear-btn,
.compare-btn {
  padding: 0.5rem 0.875rem;
  border-radius: 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.compare-btn {
  background: #fff;
  color: var(--color-main);
}

.compare-btn:hover {
  background: #f0f0f0;
}
</style>
