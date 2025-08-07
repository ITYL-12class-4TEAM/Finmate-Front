<template>
  <div class="pagination">
    <button
      class="pagination-arrow"
      @click="goToPage(1)"
      :disabled="currentPage === 1"
      :class="{ disabled: currentPage === 1 }"
      aria-label="첫 페이지"
    >
      <span>«</span>
    </button>
    <button
      class="pagination-arrow"
      @click="goToPage(Math.max(1, currentPage - maxPageButtons))"
      :disabled="currentPage === 1"
      :class="{ disabled: currentPage === 1 }"
      aria-label="이전 그룹"
    >
      <span>‹</span>
    </button>
    <button
      v-for="page in displayedPages"
      :key="page"
      @click="goToPage(page)"
      :class="['pagination-number', { active: currentPage === page }]"
      :aria-current="currentPage === page ? 'page' : false"
    >
      {{ page }}
    </button>
    <button
      class="pagination-arrow"
      @click="goToPage(Math.min(totalPages, currentPage + maxPageButtons))"
      :disabled="currentPage >= totalPages"
      :class="{ disabled: currentPage >= totalPages }"
      aria-label="다음 그룹"
    >
      <span>›</span>
    </button>
    <button
      class="pagination-arrow"
      @click="goToPage(totalPages)"
      :disabled="currentPage === totalPages"
      :class="{ disabled: currentPage === totalPages }"
      aria-label="마지막 페이지"
    >
      <span>»</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  totalPages: { type: Number, required: true },
  currentPage: { type: Number, required: true },
});

const emit = defineEmits(['page-change']);
const maxPageButtons = 5;

const displayedPages = computed(() => {
  const pages = [];
  let start = Math.max(1, props.currentPage - Math.floor(maxPageButtons / 2));
  let end = Math.min(props.totalPages, start + maxPageButtons - 1);
  start = Math.max(1, end - maxPageButtons + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const goToPage = (page) => {
  if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
    emit('page-change', page);
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1.2rem;
  width: 100%;
  max-width: 430px;
}

.pagination button {
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--color-light);
  background: #fff;
  border-radius: 0.75rem;
  font-size: 1rem;
  color: var(--color-main);
  cursor: pointer;
  font-weight: 500;
  transition:
    background 0.16s,
    color 0.16s,
    border 0.18s;
  outline: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination button:active:not(.disabled):not(.active) {
  background: var(--color-bg-light);
}

.pagination button.active {
  background: var(--color-main);
  color: #fff;
  border-color: var(--color-main);
}

.pagination button.disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: var(--color-bg-light);
  color: var(--color-light);
  border-color: var(--color-bg-light);
}

.pagination-arrow {
  font-weight: bold;
  font-size: 1.13rem;
}

.pagination-number {
  font-weight: 600;
}
</style>
