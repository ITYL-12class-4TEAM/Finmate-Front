<template>
  <div
    class="favorite-item"
    :class="{
      selected: isSelected,
      'hover-effect': !isSelected,
    }"
  >
    <ProductItemHeader
      :favorite="favorite"
      :isSelected="isSelected"
      @select="handleHeaderSelect"
      @remove-favorite="$emit('remove-favorite', favorite)"
    />

    <div class="item-content">
      <div class="info-section">
        <ProductItemInfo :favorite="favorite" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductItemHeader from './ProductItemHeader.vue';
import ProductItemInfo from './ProductItemInfo.vue';

const props = defineProps({
  favorite: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select', 'remove-favorite']);

const handleHeaderSelect = (isSelected) => {
  console.log(
    'Header select received:',
    isSelected,
    'ProductId:',
    props.favorite.productId
  ); // 디버깅
  emit('select', props.favorite.productId, isSelected);
};
</script>

<style scoped>
.favorite-item {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 0.5rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  line-height: 1.4;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
}

/* 선택되지 않은 상태에서의 호버 효과 */
.favorite-item.hover-effect:hover {
  background: linear-gradient(135deg, var(--color-white) 0%, #f1f3f8 100%);
  border-color: rgba(185, 187, 204, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(45, 51, 107, 0.15);
}

/* 컨텐츠 레이아웃 */
.item-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 0.5rem;
}

.info-section {
  flex: 1;
  min-width: 0; /* 텍스트 오버플로우 처리를 위해 */
}

.meta-section {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
}

/* 활성 상태 애니메이션 */
.favorite-item:active {
  transform: translateY(0) scale(0.98);
}

/* 로딩 상태 */
.favorite-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.favorite-item.loading::after {
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
.favorite-item:focus-within {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}

/* 삭제 애니메이션 준비 */
.favorite-item.removing {
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

/* 특별한 상태 표시 */
.favorite-item.new {
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

/* 드래그 상태 (향후 확장용) */
.favorite-item.dragging {
  transform: rotate(5deg) scale(1.05);
  z-index: 1000;
  box-shadow: 0 10px 30px rgba(45, 51, 107, 0.3);
}
</style>
