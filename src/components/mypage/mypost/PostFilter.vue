<template>
  <section class="filter-section">
    <div class="filter-group">
      <div class="filter-label">
        <i class="fas fa-filter"></i>
        상품군
      </div>
      <div class="tag-list">
        <button
          v-for="tag in productTags"
          :key="tag"
          class="tag-button"
          :class="{ selected: selectedProducts.includes(tag) }"
          @click="handleToggleProduct(tag)"
        >
          <i class="fas fa-hashtag"></i>{{ tag }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  productTags: {
    type: Array,
    required: true,
  },
  selectedProducts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['toggle-product']);

const handleToggleProduct = (tag) => {
  emit('toggle-product', tag);
};
</script>

<style scoped>
/* 필터 섹션 */
.filter-section {
  padding: 1rem;
  border: 0.125rem solid var(--color-bg-light);
  border-radius: 1.25rem;
  margin-bottom: 0.5rem;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label i {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.tag-list {
  display: flex;
  flex-wrap: nowrap; /* 줄바꿈 방지 */
  gap: 0.2rem;
  margin-top: 0.5rem;
  -webkit-overflow-scrolling: touch; /* iOS 부드러운 스크롤 */
  padding-bottom: 0.25rem;
  text-align: center;
  justify-content: center;
}
.tag-button {
  font-size: 0.8rem;
  padding: 0.4rem 1rem;
  border-radius: 1.25rem;
  border: 0.125rem solid var(--color-bg-light);
  background-color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-button i {
  font-size: 0.7rem;
}

.tag-button:hover {
  border-color: var(--color-main);
  background-color: var(--color-bg-light);
}

.tag-button:focus {
  outline: none;
}

.tag-button.selected {
  background-color: var(--color-main);
  border-color: var(--color-main);
  color: white;
}

/* 반응형 디자인 */
@media (max-width: 48rem) {
  .filter-section {
    padding: 0.75rem;
  }

  .filter-label {
    font-size: 0.8125rem;
  }

  .filter-label i {
    font-size: 0.8125rem;
  }

  .tag-button {
    font-size: 0.75rem;
    padding: 0.3rem 0.8rem;
  }

  .tag-button i {
    font-size: 0.65rem;
  }
}
</style>
