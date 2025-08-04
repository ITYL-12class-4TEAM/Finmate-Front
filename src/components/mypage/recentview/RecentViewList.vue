<template>
  <div class="recent-view-list" :class="{ empty: products.length === 0 }">
    <!-- 빈 상태 -->
    <div v-if="products.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fa-regular fa-clock"></i>
      </div>
      <h4 class="empty-title">최근 조회한 상품이 없습니다</h4>
      <p class="empty-description">
        금융상품을 조회하면 여기에 기록이 남습니다
      </p>
      <button class="explore-btn" @click="$emit('explore-products')">
        <i class="fa-solid fa-search"></i>
        상품 둘러보기
      </button>
    </div>

    <!-- 상품 리스트 -->
    <div v-else class="products-container">
      <TransitionGroup
        name="recent-item"
        tag="div"
        class="products-grid"
        appear
      >
        <RecentViewItem
          v-for="(product, index) in products"
          :key="product.productId"
          :product="product"
          :isSelected="selectedRecent.includes(product.productId)"
          :isFavorite="favoriteProductIds.has(product.productId)"
          :style="{ 'animation-delay': `${index * 50}ms` }"
          @select="handleSelect"
          @click-recent="$emit('click-recent', $event)"
          @remove-from-history="$emit('remove-from-history', $event)"
          @view-detail="$emit('view-detail', $event)"
          class="recent-item-wrapper"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import RecentViewItem from './RecentViewItem.vue';

const props = defineProps({
  products: {
    type: Array,
    required: true,
  },
  selectedRecent: {
    type: Array,
    required: true,
  },
  favoriteProductIds: {
    type: Set,
    required: true,
  },
});

const emit = defineEmits([
  'update:selectedRecent',
  'remove-from-history',
  'view-detail',
  'explore-products',
  'click-recent',
]);

const handleSelect = (productId, isSelected) => {
  let newSelected = [...props.selectedRecent];

  if (isSelected) {
    newSelected.push(productId);
  } else {
    newSelected = newSelected.filter((id) => id !== productId);
  }

  emit('update:selectedRecent', newSelected);
};
</script>

<style scoped>
.recent-view-list {
  position: relative;
  min-height: 200px;
}

.products-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-item-wrapper {
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
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    var(--color-bg-light) 100%
  );
  border-radius: 1.5rem;
  border: 2px dashed rgba(185, 187, 204, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-state:hover {
  border-color: rgba(185, 187, 204, 0.6);
  background: linear-gradient(
    135deg,
    var(--color-bg-light) 0%,
    var(--color-light) 100%
  );
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.1) 0%,
    rgba(45, 51, 107, 0.05) 100%
  );
  border-radius: 50%;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.empty-icon i {
  font-size: 2rem;
  color: rgba(45, 51, 107, 0.6);
  transition: all 0.3s ease;
}

.empty-state:hover .empty-icon {
  transform: scale(1.1);
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.15) 0%,
    rgba(45, 51, 107, 0.08) 100%
  );
}

.empty-state:hover .empty-icon i {
  color: rgba(45, 51, 107, 0.8);
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
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
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
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
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
.recent-item-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.recent-item-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.recent-item-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.recent-item-leave-to {
  opacity: 0;
  transform: translateX(-100%) scale(0.95);
}

.recent-item-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .products-container {
    padding: 0.375rem;
  }

  .products-grid {
    gap: 0.5rem;
  }

  .empty-state {
    padding: 2rem 1.5rem;
    margin: 0 0.5rem;
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
    margin-bottom: 0.5rem;
  }

  .empty-description {
    font-size: 0.8rem;
    margin-bottom: 1.5rem;
  }

  .explore-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .products-container {
    padding: 0.25rem;
  }

  .products-grid {
    gap: 0.375rem;
  }

  .empty-state {
    padding: 1.5rem 1rem;
  }
}

/* 로딩 상태 */
.recent-view-list.loading .products-grid {
  opacity: 0.7;
  pointer-events: none;
}

.recent-view-list.loading .recent-item-wrapper {
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
.recent-view-list::-webkit-scrollbar {
  width: 6px;
}

.recent-view-list::-webkit-scrollbar-track {
  background: rgba(185, 187, 204, 0.1);
  border-radius: 3px;
}

.recent-view-list::-webkit-scrollbar-thumb {
  background: rgba(185, 187, 204, 0.3);
  border-radius: 3px;
}

.recent-view-list::-webkit-scrollbar-thumb:hover {
  background: rgba(185, 187, 204, 0.5);
}

/* 특별한 상태 표시 */
.recent-view-list.has-new-items .products-container {
  animation: newItemsGlow 0.6s ease-out;
}

@keyframes newItemsGlow {
  0% {
    box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  }
  50% {
    box-shadow: 0 4px 20px rgba(45, 51, 107, 0.3);
  }
  100% {
    box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  }
}
</style>
