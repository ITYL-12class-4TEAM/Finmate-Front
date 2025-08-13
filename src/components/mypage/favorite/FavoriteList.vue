<template>
  <div class="favorites-list" :class="{ empty: favorites.length === 0 }">
    <!-- 빈 상태 -->
    <div v-if="favorites.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fa-regular fa-heart"></i>
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
      <TransitionGroup name="favorite-item" tag="div" class="items-grid" appear>
        <FavoriteItem
          v-for="(favorite, index) in favorites"
          :key="favorite.productId"
          :favorite="favorite"
          :style="{ 'animation-delay': `${index * 50}ms` }"
          class="favorite-item-wrapper"
          @click="() => $emit('click-favorite', favorite)"
          @remove-favorite="$emit('remove-favorite', $event)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import FavoriteItem from './FavoriteItem.vue';

defineProps({
  favorites: {
    type: Array,
    required: true,
  },
});

defineEmits(['remove-favorite', 'explore-products', 'click-favorite']);
</script>

<style scoped>
.favorites-list {
  position: relative;
  min-height: 200px;
  max-height: 400px;
}

.list-container {
  width: 100%;
  min-height: 25rem;
  max-height: 400px;
  max-width: 26.875rem;
  overflow-y: auto;
}

.items-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.favorite-item-wrapper {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 빈 상태 스타일 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1.5rem;
  border: 2px dashed rgba(185, 187, 204, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-state:hover {
  border-color: rgba(185, 187, 204, 0.6);
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
  border-radius: 50%;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.empty-icon i {
  font-size: 2rem;
  color: rgba(220, 53, 69, 0.6);
  transition: all 0.3s ease;
}

.empty-state:hover .empty-icon {
  transform: scale(1.1);
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.15) 0%, rgba(220, 53, 69, 0.08) 100%);
}

.empty-state:hover .empty-icon i {
  color: rgba(220, 53, 69, 0.8);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.75rem;
}

.empty-description {
  font-size: 0.875rem;
  color: var(--color-sub);
  margin-bottom: 2rem;
  font-weight: 500;
  line-height: 1.5;
  max-width: 300px;
}

.explore-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  border: none;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.2);
}

.explore-btn:hover {
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 51, 107, 0.3);
}

.explore-btn:active {
  transform: translateY(0);
}

.explore-btn i {
  font-size: 0.875rem;
}

/* 리스트 아이템 애니메이션 */
.favorite-item-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-item-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-item-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.favorite-item-leave-to {
  opacity: 0;
  transform: translateX(-100%) scale(0.95);
}

.favorite-item-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 로딩 상태 */
.favorites-list.loading .items-grid {
  opacity: 0.7;
  pointer-events: none;
}

.favorites-list.loading .favorite-item-wrapper {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 스크롤바 스타일링 (웹킷 기반 브라우저) */
.favorites-list::-webkit-scrollbar {
  width: 6px;
}

.favorites-list::-webkit-scrollbar-track {
  background: rgba(185, 187, 204, 0.1);
  border-radius: 3px;
}

.favorites-list::-webkit-scrollbar-thumb {
  background: rgba(185, 187, 204, 0.3);
  border-radius: 3px;
}

.favorites-list::-webkit-scrollbar-thumb:hover {
  background: rgba(185, 187, 204, 0.5);
}
</style>
