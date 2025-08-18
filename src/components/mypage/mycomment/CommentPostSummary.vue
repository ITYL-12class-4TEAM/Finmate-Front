<template>
  <div class="summary-section">
    <div class="summary-info">
      <i class="fas fa-comment-dots"></i>
      내가 댓글을 작성한 게시글 {{ totalPosts }}개
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

/* 반응형 디자인 */
@media (max-width: 48rem) {
  .summary-info {
    font-size: 0.8125rem;
    padding: 0.5rem 0.75rem;
  }
}
</style>