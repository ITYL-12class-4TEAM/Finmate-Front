<template>
  <div class="pagination">
    <button
      class="page-btn prev-btn"
      :disabled="currentPage === 1"
      @click="handlePageChange(currentPage - 1)"
    >
      <i class="fas fa-chevron-left"></i>
    </button>

    <div class="page-numbers">
      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="handlePageChange(page)"
      >
        {{ page }}
      </button>
    </div>

    <button
      class="page-btn next-btn"
      :disabled="currentPage === totalPages"
      @click="handlePageChange(currentPage + 1)"
    >
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['page-change']);

// 페이지 번호 표시 로직 (최대 5개 페이지 번호 표시)
const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  const half = Math.floor(maxVisiblePages / 2);

  let start = Math.max(1, props.currentPage - half);
  let end = Math.min(props.totalPages, start + maxVisiblePages - 1);

  // 끝에서부터 계산해서 시작점 조정
  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const handlePageChange = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-change', page);
  }
};
</script>

<style scoped>
/* 페이징 스타일 - 커뮤니티와 동일 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0 1rem 0;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0.0625rem solid #e5e7eb;
  background-color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.page-btn i {
  font-size: 0.875rem;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-main);
  background-color: var(--color-bg-light);
  color: var(--color-main);
}

.page-btn:focus {
  outline: none;
}

.page-btn.active {
  background-color: var(--color-main);
  border-color: var(--color-main);
  color: white;
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}

.prev-btn,
.next-btn {
  font-size: 1rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

/* 반응형 디자인 */
@media (max-width: 48rem) {
  .pagination {
    gap: 0.25rem;
    margin: 1.5rem 0 0.5rem 0;
  }

  .page-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.8125rem;
  }

  .page-btn i {
    font-size: 0.8125rem;
  }
}
</style>
