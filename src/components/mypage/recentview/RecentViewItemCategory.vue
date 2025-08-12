<template>
  <div class="recent-item-header">
    <div class="category-info">
      <span
        class="category-badge"
        :class="getProductTypeBadge(getCategoryFromSubcategory(product.subcategoryName))"
      >
        {{ getCategoryFromSubcategory(product.subcategoryName) }}
      </span>
      <span class="subcategory-name">{{ product.subcategoryName }}</span>
    </div>

    <div class="item-controls" @click.stop>
      <div class="custom-checkbox">
        <input
          :id="`recent-checkbox-${product.productId || Math.random()}`"
          type="checkbox"
          :checked="isSelected"
          class="checkbox-input"
          @change="handleCheckboxChange"
          @click.stop
        />
        <label
          :for="`recent-checkbox-${product.productId || Math.random()}`"
          class="checkbox-label"
          @click.stop
        >
          <i class="fa-solid fa-check checkbox-icon"></i>
        </label>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  product: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
});

const emit = defineEmits(['select']);

const handleCheckboxChange = (event) => {
  console.log('체크박스 변경:', event.target.checked, 'Product ID:', props.product.productId);
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
  padding: 0.875rem 0;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  color: var(--color-white);
}

.badge-deposit {
  background: var(--color-main);
}
.badge-savings {
  background: #059669;
}
.badge-fund {
  background: #0891b2;
}
.badge-loan {
  background: #d97706;
}
.badge-insurance {
  background: #7c3aed;
}
.badge-pension {
  background: #374151;
}
.badge-default {
  background: var(--color-sub);
}

.subcategory-name {
  color: var(--color-sub);
  font-size: 0.8125rem;
  font-weight: 500;
}

.item-controls {
  display: flex;
  align-items: center;
}

.custom-checkbox {
  position: relative;
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
}

.checkbox-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1.5px solid #d1d5db;
  border-radius: 0.375rem;
  background: var(--color-white);
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-icon {
  font-size: 0.6875rem;
  color: var(--color-white);
  transform: scale(0);
  transition: transform 0.2s ease;
}

.checkbox-input:checked + .checkbox-label {
  background: var(--color-main);
  border-color: var(--color-main);
}

.checkbox-input:checked + .checkbox-label .checkbox-icon {
  transform: scale(1);
}

.checkbox-input:hover + .checkbox-label {
  border-color: var(--color-main);
}

@media (max-width: 768px) {
  .recent-item-header {
    padding: 0.75rem 0;
  }

  .category-badge {
    font-size: 0.6875rem;
    padding: 0.3125rem 0.625rem;
  }

  .subcategory-name {
    font-size: 0.75rem;
  }

  .custom-checkbox {
    width: 1.125rem;
    height: 1.125rem;
  }

  .checkbox-label {
    width: 1.125rem;
    height: 1.125rem;
  }

  .checkbox-icon {
    font-size: 0.625rem;
  }
}
</style>
