<template>
  <div class="page-info">
    <i class="fas fa-info-circle"></i>
    총 {{ totalPosts }}개 좋아요 중 {{ startIndex + 1 }}-{{ endIndex }}번째
  </div>
</template>

<script setup>
defineProps({
  totalPosts: {
    type: Number,
    required: true,
  },
  startIndex: {
    type: Number,
    required: true,
  },
  endIndex: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
/* 페이지 정보 */
.page-info {
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.page-info i {
  font-size: 0.75rem;
  color: var(--color-sub);
}

/* 반응형 디자인 */
@media (max-width: 48rem) {
  .page-info {
    font-size: 0.6875rem;
  }

  .page-info i {
    font-size: 0.6875rem;
  }
}
</style>
