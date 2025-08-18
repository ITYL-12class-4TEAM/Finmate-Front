<template>
  <div class="product-item-meta">
    <div class="meta-content">
      <i class="fa-solid fa-star"></i>
      <span class="meta-text">
        <strong>{{ formatCount(favorite.wishlistCount) }}명</strong>
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  favorite: {
    type: Object,
    required: true,
  },
});

// 숫자 포맷팅 함수
const formatCount = (count) => {
  if (!count || count === 0) return '0';

  if (count >= 10000) {
    const man = Math.floor(count / 10000);
    return `${man}만`;
  }

  if (count >= 1000) {
    const thousand = Math.floor(count / 1000);
    return `${thousand}천`;
  }

  return new Intl.NumberFormat('ko-KR').format(count);
};
</script>

<style scoped>
.product-item-meta {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.meta-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--color-light);
  white-space: nowrap;
}

.meta-content i {
  color: #fbbf24; /* 노란색 별 */
  font-size: 0.625rem;
}

.meta-text {
  font-weight: 500;
}

.meta-text strong {
  color: var(--color-main);
  font-weight: 600;
}

@media (max-width: 768px) {
  .meta-content {
    font-size: 0.625rem;
  }

  .meta-content i {
    font-size: 0.5625rem;
  }
}
</style>
