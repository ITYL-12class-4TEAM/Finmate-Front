<!-- FavoriteItemHeader.vue -->
<template>
  <div class="favorite-item-header">
    <div class="category-info">
      <span
        class="category-badge"
        :class="getProductTypeBadge(getCategoryFromSubcategory(favorite.subcategoryName))"
      >
        {{ getCategoryFromSubcategory(favorite.subcategoryName) }}
      </span>
      <span class="subcategory-name">{{ favorite.subcategoryName }}</span>
    </div>

    <div class="item-controls">
      <FavoriteButton
        :is-favorite="isFavorite"
        :product-id="favorite.productId"
        :loading="statusLoading"
        @remove-favorite="handleRemoveFavorite"
        @add-favorite="handleAddFavorite"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FavoriteButton from './FavoriteButton.vue';
import { wishlistAPI } from '../../../api/favorite';

const props = defineProps({
  favorite: { type: Object, required: true },
});

const emit = defineEmits(['remove-favorite']);

const isFavorite = ref(true);
const statusLoading = ref(true);

onMounted(async () => {
  try {
    isFavorite.value = await wishlistAPI.isFavorite(props.favorite.productId);
  } catch (error) {
    console.error('즐겨찾기 상태 확인 실패:', error);
    isFavorite.value = true;
  } finally {
    statusLoading.value = false;
  }
});

const handleRemoveFavorite = () => {
  isFavorite.value = false;
  emit('remove-favorite', props.favorite);
};

const handleAddFavorite = () => {
  isFavorite.value = true;
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
.favorite-item-header {
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

@media (max-width: 768px) {
  .favorite-item-header {
    padding: 0.75rem 0;
  }

  .category-badge {
    font-size: 0.6875rem;
    padding: 0.3125rem 0.625rem;
  }

  .subcategory-name {
    font-size: 0.75rem;
  }
}
</style>
