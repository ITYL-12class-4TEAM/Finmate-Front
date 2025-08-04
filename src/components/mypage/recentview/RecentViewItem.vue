<template>
  <div
    class="recent-view-item"
    :class="{
      selected: isSelected,
      'hover-effect': !isSelected,
    }"
    @click="handleCardClick"
  >
    <RecentViewItemCategory
      :product="product"
      :isSelected="isSelected"
      @select="handleSelect"
      @click.stop
    />

    <div class="item-content">
      <RecentViewItemInfo :product="product" />
    </div>
  </div>
</template>

<script setup>
import RecentViewItemCategory from './RecentViewItemCategory.vue';
import RecentViewItemInfo from './RecentViewInfo.vue';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'select',
  'remove-from-history',
  'view-detail',
  'click-recent',
]);

const handleSelect = (isSelected) => {
  emit('select', props.product.productId, isSelected);
};

const handleCardClick = () => {
  console.log('카드 클릭됨:', props.product);
  emit('click-recent', props.product); // ✅ 이 줄 추가
};
</script>

<style scoped>
.recent-view-item {
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    var(--color-bg-light) 100%
  );
  border-radius: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  line-height: 1.4;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  cursor: pointer;
  max-width: 26.875rem;
  width: 100%;
}

/* 컨텐츠 레이아웃 */
.item-content {
  margin-top: 0.5rem;
}

.favorite-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #dc3545;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 1rem;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.favorite-indicator i {
  font-size: 0.65rem;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: rgba(220, 53, 69, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.2);
}

.remove-btn:hover {
  background: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.4);
  transform: scale(1.1);
}

.remove-btn i {
  font-size: 0.7rem;
}

/* 클릭 가능 인디케이터 */
.click-indicator {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: var(--color-light);
  transition: all 0.3s ease;
  opacity: 0;
}

.recent-view-item:hover .click-indicator {
  opacity: 1;
  color: var(--color-sub);
  transform: translateY(-50%) translateX(-2px);
}

.click-indicator i {
  font-size: 0.875rem;
}

/* 활성 상태 애니메이션 */
.recent-view-item:active {
  transform: translateY(0) scale(0.98);
}

/* 로딩 상태 */
.recent-view-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.recent-view-item.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 포커스 상태 */
.recent-view-item:focus-within {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}

/* 삭제 애니메이션 준비 */
.recent-view-item.removing {
  animation: removeItem 0.3s ease-out forwards;
}

@keyframes removeItem {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.02);
  }
  100% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    height: 0;
    padding: 0;
    margin: 0;
  }
}

/* 새 아이템 등장 애니메이션 */
.recent-view-item.new {
  animation: newItemPulse 0.6s ease-out;
}

@keyframes newItemPulse {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 최근 조회 특화 스타일 */
.recent-view-item.just-viewed {
  border-color: rgba(5, 150, 105, 0.4);
  background: linear-gradient(
    135deg,
    rgba(5, 150, 105, 0.02) 0%,
    rgba(16, 185, 129, 0.01) 100%
  );
}

.recent-view-item.just-viewed::before {
  background: linear-gradient(90deg, #059669 0%, #10b981 100%);
}
</style>
