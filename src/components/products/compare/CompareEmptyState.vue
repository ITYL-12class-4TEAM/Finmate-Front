<template>
  <div class="empty-state">
    <div class="empty-icon">🔍</div>
    <p>비교함이 비어있습니다.</p>
    <p class="empty-subtitle">상품 목록에서 비교할 상품을 추가해 주세요.</p>
    <button class="primary-btn" @click="$emit('goToProducts')">상품 목록으로 이동</button>
  </div>
</template>

<script setup>
defineEmits(['goToProducts']);
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.empty-subtitle {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.primary-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}
</style>
