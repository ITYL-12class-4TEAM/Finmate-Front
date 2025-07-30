<template>
  <div class="recent-item-header">
    <div class="category-info">
      <span
        class="category-badge"
        :class="
          getProductTypeBadge(
            getCategoryFromSubcategory(product.subcategoryName)
          )
        "
      >
        {{ getCategoryFromSubcategory(product.subcategoryName) }}
      </span>
      <small class="subcategory-name">{{ product.subcategoryName }}</small>
    </div>

    <div class="item-controls">
      <div class="custom-checkbox">
        <input
          type="checkbox"
          :id="`recent-checkbox-${product.id || Math.random()}`"
          :checked="isSelected"
          @change="handleCheckboxChange"
          @click.stop
          class="checkbox-input"
        />
        <label
          :for="`recent-checkbox-${product.id || Math.random()}`"
          class="checkbox-label"
        ></label>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select']);

const handleCheckboxChange = (event) => {
  emit('select', event.target.checked);
};

const getCategoryFromSubcategory = (subcategoryName) => {
  if (!subcategoryName) return '';

  const categoryMapping = {
    연금저축: '연금',
    자유적금: '적금',
    정기예금: '예금',
    정기적금: '적금',
    정액적금: '적금',
    변동금리예금: '예금',
    복리예금: '예금',
    단리예금: '예금',
  };

  return categoryMapping[subcategoryName] || subcategoryName;
};

const getProductTypeBadge = (type) => {
  const badges = {
    예금: 'badge-deposit',
    적금: 'badge-savings',
    펀드: 'badge-fund',
    대출: 'badge-loan',
    보험: 'badge-insurance',
    연금: 'badge-pension',
  };
  return badges[type] || 'badge-default';
};
</script>

<style scoped>
.recent-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: all 0.2s ease;
}

/* 카테고리별 배지 스타일 - 즐겨찾기와 동일 */
.badge-deposit {
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
}

.badge-savings {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
}

.badge-fund {
  background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
  color: white;
}

.badge-loan {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: white;
}

.badge-insurance {
  background: linear-gradient(135deg, var(--color-sub) 0%, #9ca0b8 100%);
  color: white;
}

.badge-pension {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: white;
}

.badge-default {
  background: linear-gradient(135deg, var(--color-light) 0%, #9ca0b8 100%);
  color: white;
}

.subcategory-name {
  color: var(--color-sub);
  font-size: 0.8rem;
  font-weight: 500;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  opacity: 0.8;
}

.item-controls {
  display: flex;
  align-items: center;
}

/* 커스텀 체크박스 - 즐겨찾기와 동일 */
.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
}

.checkbox-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
  margin: 0;
}

.checkbox-label {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--color-light);
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  pointer-events: none; /* label은 클릭 이벤트를 차단하고 input으로 전달 */
}

.checkbox-label::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.5rem;
  height: 0.25rem;
  border: 2px solid white;
  border-top: none;
  border-right: none;
  transform: translate(-50%, -65%) scale(0) rotate(-45deg);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkbox-input:checked + .checkbox-label {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  border-color: var(--color-main);
}

.checkbox-input:checked + .checkbox-label::after {
  transform: translate(-50%, -65%) scale(1) rotate(-45deg);
}

.checkbox-input:hover + .checkbox-label {
  border-color: var(--color-main);
  transform: scale(1.05);
}

/* 최근 조회 특화 스타일 */
.recent-item-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(45, 51, 107, 0.3) 0%,
    rgba(125, 129, 162, 0.3) 100%
  );
  border-radius: 0 0.75rem 0.75rem 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.recent-item-header:hover::before {
  opacity: 1;
}

/* 최근성 인디케이터 (선택적 사용) */
.recent-item-header.recent-indicator {
  position: relative;
}

.recent-item-header.recent-indicator::after {
  content: '최근';
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  transform: scale(0.9);
  animation: recentPulse 2s infinite;
}

@keyframes recentPulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.8;
    transform: scale(1);
  }
}
</style>
