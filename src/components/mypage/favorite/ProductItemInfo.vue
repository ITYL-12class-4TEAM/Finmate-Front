<template>
  <div class="favorite-item-info">
    <h5 class="item-title">{{ favorite.productName }}</h5>
    <!-- 가로로배치 -->
    <div class="meta-section">
      <p class="item-subtitle">{{ favorite.korCoNm }}</p>
      <ProductItemMeta :favorite="favorite" />
    </div>
  </div>
</template>

<script setup>
import ProductItemMeta from './ProductItemMeta.vue';

defineProps({
  favorite: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.meta-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.item-subtitle {
  font-size: 0.875rem;
  color: var(--color-sub);
  font-weight: 500;
  opacity: 0.9;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-item-info {
  padding: 0.5rem 0.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.item-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: var(--color-main);
  line-height: 1.4;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: color 0.2s ease;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  font-size: 0.875rem;
  color: var(--color-sub);
  margin-bottom: 0;
  font-weight: 500;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  opacity: 0.9;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 로딩 상태 애니메이션 (옵션) */
.favorite-item-info.loading .item-title,
.favorite-item-info.loading .item-subtitle {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  color: transparent;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 포커스 상태 */
.favorite-item-info:focus-within {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}
</style>
