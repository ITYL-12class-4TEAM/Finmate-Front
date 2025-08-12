<template>
  <div class="recent-view-item" :class="{ selected: isSelected }" @click="handleCardClick">
    <RecentViewItemCategory :product="product" :is-selected="isSelected" @select="handleSelect" />

    <div class="item-content">
      <RecentViewItemInfo :product="product" />
    </div>

    <div class="click-indicator">
      <i class="fa-solid fa-chevron-right"></i>
    </div>
  </div>
</template>

<script setup>
import RecentViewItemCategory from './RecentViewItemCategory.vue';
import RecentViewItemInfo from './RecentViewInfo.vue';

const props = defineProps({
  product: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'remove-from-history', 'view-detail', 'click-recent']);

const handleSelect = (isSelected) => {
  console.log('handleSelect 호출:', {
    productId: props.product.productId,
    isSelected: isSelected,
    currentSelection: props.isSelected,
  });

  // 부모 컴포넌트로 이벤트 전달
  emit('select', props.product.productId, isSelected);
};

const handleCardClick = (event) => {
  // 체크박스나 다른 컨트롤 영역 클릭이 아닌 경우에만 카드 클릭 처리
  console.log('카드 클릭됨:', props.product);
  emit('click-recent', props.product);
};
</script>

<style scoped>
.recent-view-item {
  background: var(--color-white);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.recent-view-item:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.recent-view-item.selected {
  background: #f8fafc;
  border-color: var(--color-main);
  box-shadow: 0 0 0 1px var(--color-main);
}

.item-content {
  margin-top: 0.75rem;
}

.click-indicator {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #cbd5e1;
  transition: all 0.2s ease;
  opacity: 0;
}

.recent-view-item:hover .click-indicator {
  opacity: 1;
  color: var(--color-main);
}

.click-indicator i {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .recent-view-item {
    padding: 0.875rem;
  }

  .item-content {
    margin-top: 0.625rem;
  }

  .click-indicator {
    right: 0.875rem;
    opacity: 0.5;
  }

  .click-indicator i {
    font-size: 0.8125rem;
  }
}
</style>
