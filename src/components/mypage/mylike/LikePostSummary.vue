<template>
  <div class="summary-section">
    <div class="summary-info">
      <i class="fas fa-heart"></i>
      내가 좋아요 누른 게시글 {{ totalPosts }}개
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalPosts: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
/* 요약 섹션 */
.summary-section {
  margin: 1rem 0 0.5rem 0;
}

.summary-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-main);
  padding: 0.75rem 1rem;
  background-color: var(--color-bg-light);
  border-radius: 1rem;
}

.summary-info i {
  font-size: 0.875rem;
  color: var(--color-sub);
}
</style>
