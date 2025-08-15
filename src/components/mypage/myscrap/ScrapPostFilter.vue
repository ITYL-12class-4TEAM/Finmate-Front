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
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  border: 0.125rem solid var(--color-bg-light);
  border-radius: 1.25rem;
  margin-bottom: 0.5rem;
  background-color: var(--color-white);
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

/* 스크롤바 스타일링 */
.tag-list::-webkit-scrollbar {
  height: 0.125rem;
}

.tag-list::-webkit-scrollbar-track {
  background: transparent;
}

.tag-list::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 0.0625rem;
}

.tag-button {
  font-size: 0.8rem;
  padding: 0.4rem 1rem;
  border-radius: 1.25rem;
  border: 0.125rem solid var(--color-bg-light);
  background-color: var(--color-white);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0; /* 버튼 크기 고정 */
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  color: var(--color-main);
}

.tag-button i {
  font-size: 0.7rem;
  color: var(--color-sub);
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
  color: var(--color-white);
}

.tag-button.selected i {
  color: var(--color-white);
}

/* 모바일 최적화 */
@media (max-width: 23.4375rem) {
  /* 375px */
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
