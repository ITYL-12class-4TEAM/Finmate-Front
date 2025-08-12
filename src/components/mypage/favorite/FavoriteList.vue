<template>
  <div class="favorites-list">
    <!-- 빈 상태 -->
    <div v-if="favorites.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fa-regular fa-star"></i>
      </div>
      <h4 class="empty-title">즐겨찾기한 상품이 없습니다</h4>
      <p class="empty-description">관심 있는 금융상품을 즐겨찾기에 추가해보세요</p>
      <button class="explore-btn" @click="$emit('explore-products')">
        <i class="fa-solid fa-search"></i>
        상품 둘러보기
      </button>
    </div>

    <!-- 즐겨찾기 목록 -->
    <div v-else class="list-container">
      <div class="items-grid">
        <FavoriteItem
          v-for="favorite in favorites"
          :key="favorite.productId"
          :favorite="favorite"
          @click-favorite="$emit('click-favorite', $event)"
          @remove-favorite="$emit('remove-favorite', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import FavoriteItem from './FavoriteItem.vue';

defineProps({
  favorites: { type: Array, required: true },
});

defineEmits(['remove-favorite', 'explore-products', 'click-favorite']);
</script>

<style scoped>
.favorites-list {
  min-height: 200px;
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  background: var(--color-white);
  border-radius: 0.75rem;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-light);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}

.empty-icon i {
  font-size: 2rem;
  color: #fbbf24; /* 별 색상 */
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: var(--color-sub);
  margin-bottom: 2rem;
  max-width: 300px;
}

.explore-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.explore-btn:hover {
  background: var(--color-sub);
}

.explore-btn i {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .items-grid {
    gap: 0.625rem;
  }

  .empty-state {
    padding: 2rem 1.5rem;
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
  }

  .empty-icon i {
    font-size: 1.5rem;
  }

  .empty-title {
    font-size: 1.125rem;
  }

  .empty-description {
    font-size: 0.8125rem;
    margin-bottom: 1.5rem;
  }

  .explore-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }
}
</style>
