<template>
  <div class="favorite-item-header">
    <div class="category-info">
      <span
        class="category-badge"
        :class="
          getProductTypeBadge(
            getCategoryFromSubcategory(favorite.subcategoryName)
          )
        "
      >
        {{ getCategoryFromSubcategory(favorite.subcategoryName) }}
      </span>
      <small class="subcategory-name">{{ favorite.subcategoryName }}</small>
    </div>

    <div class="item-controls">
      <button
        @click.stop="$emit('remove-favorite')"
        class="favorite-btn"
        title="즐겨찾기 해제"
      >
        <i class="fa-solid fa-star"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  favorite: {
    type: Object,
    required: true,
  },
});

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

<style>
/* 나머지 스타일은 그대로 유지 */
.favorite-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  backdrop-filter: blur(5px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-item-header:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.4);
  transform: translateY(-1px);
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
  transition: all 0.2s ease;
}

/* 카테고리별 배지 스타일 */
.badge-deposit {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
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
  opacity: 0.8;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* 즐겨찾기 버튼 */
.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.favorite-btn i {
  font-size: 1rem;
  color: #f59e0b;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  transform: scale(1.05);
}

.favorite-btn:hover i {
  color: #d97706;
  transform: scale(1.1);
}

.favorite-btn:active {
  transform: scale(0.95);
}
</style>
