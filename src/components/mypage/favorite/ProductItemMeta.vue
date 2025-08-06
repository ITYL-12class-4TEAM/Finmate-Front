<template>
  <div class="favorite-item-meta">
    <div class="meta-content">
      <i class="fa-solid fa-star"></i>
      <span class="meta-text">
        <strong>{{ formatCount(favorite.wishlistCount) }}명</strong>의 관심상품
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
    const remainder = count % 10000;
    if (remainder === 0) {
      return `${man}만`;
    } else if (remainder >= 1000) {
      const thousand = Math.floor(remainder / 1000);
      return `${man}만${thousand}천`;
    } else {
      return `${man}만`;
    }
  }

  if (count >= 1000) {
    const thousand = Math.floor(count / 1000);
    const remainder = count % 1000;
    if (remainder === 0) {
      return `${thousand}천`;
    } else {
      return `${thousand}천`;
    }
  }

  return new Intl.NumberFormat('ko-KR').format(count);
};
</script>

<style scoped>
.favorite-item-meta {
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.meta-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.meta-content i {
  color: #f0a146;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.meta-text {
  color: var(--color-sub);
  font-weight: 500;
  line-height: 1.4;
}

.meta-text strong {
  color: var(--color-main);
  font-weight: 700;
}

/* 접근성 */
.favorite-item-meta:focus-within {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}
</style>
