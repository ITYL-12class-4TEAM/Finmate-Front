<template>
  <div class="recent-view-list">
    <!-- 빈 상태 -->
    <div v-if="products.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fa-regular fa-clock"></i>
      </div>
      <h4 class="empty-title">최근 조회한 상품이 없습니다</h4>
      <p class="empty-description">금융상품을 조회하면 여기에 기록이 남습니다</p>
      <button class="explore-btn" @click="exploreProducts">
        <i class="fa-solid fa-search"></i>
        상품 둘러보기
      </button>
    </div>

    <!-- 상품 리스트 -->
    <div v-else class="products-container">
      <div class="products-grid">
        <RecentViewItem
          v-for="product in products"
          :key="product.productId"
          :product="product"
          :is-selected="selectedRecent.includes(product.productId)"
          :is-favorite="favoriteProductIds.has(product.productId)"
          @select="handleSelect"
          @click-recent="$emit('click-recent', $event)"
          @remove-from-history="$emit('remove-from-history', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import RecentViewItem from './RecentViewItem.vue';
import router from '@/router';

const props = defineProps({
  products: { type: Array, required: true },
  selectedRecent: { type: Array, required: true },
  favoriteProductIds: { type: Set, required: true },
});

const emit = defineEmits([
  'update:selectedRecent',
  'remove-from-history',
  'explore-products',
  'click-recent',
]);

const handleSelect = (productId, isSelected) => {
  console.log('RecentViewList handleSelect:', {
    productId,
    isSelected,
    currentSelected: props.selectedRecent,
  });

  let newSelected = [...props.selectedRecent];

  if (isSelected) {
    // 선택: 배열에 추가 (중복 방지)
    if (!newSelected.includes(productId)) {
      newSelected.push(productId);
    }
  } else {
    // 해제: 배열에서 제거
    newSelected = newSelected.filter((id) => id !== productId);
  }

  console.log('새로운 선택된 항목들:', newSelected);
  emit('update:selectedRecent', newSelected);
};
const exploreProducts = () => {
  router.push('/products/deposit');
};
</script>

<style scoped>
.recent-view-list {
  min-height: 200px;
}

.products-grid {
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
  color: var(--color-sub);
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
  .products-grid {
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
