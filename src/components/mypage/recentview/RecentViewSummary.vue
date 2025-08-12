<template>
  <div class="recent-view-summary">
    <div class="summary-container">
      <!-- 결과 정보 -->
      <div class="results-section">
        <span class="count-text">
          총 <strong>{{ formatCount(count) }}개</strong>
        </span>
      </div>

      <!-- 액션 버튼들 -->
      <div class="actions-section">
        <!-- 선택된 항목이 있을 때 -->
        <template v-if="selectedCount > 0">
          <div class="selection-indicator">{{ selectedCount }}개 선택</div>
          <button class="action-btn delete-selected" @click="$emit('delete-selected')">삭제</button>
        </template>

        <!-- 선택된 항목이 없을 때 -->
        <template v-else>
          <button class="action-btn delete-all" :disabled="count === 0" @click="handleClearAll">
            전체 삭제
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
  selectedCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['delete-selected', 'delete-all']);

// 숫자 포맷팅 함수
const formatCount = (count) => {
  if (!count || count === 0) return '0';
  return new Intl.NumberFormat('ko-KR').format(count);
};

const handleClearAll = () => emit('delete-all');
</script>

<style scoped>
.recent-view-summary {
  margin-bottom: 1rem;
}

.summary-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--color-white);
  border-radius: 0.75rem;
  border: 1px solid #f1f5f9;
  gap: 1rem;
}

/* 결과 정보 섹션 */
.results-section {
  flex: 1;
}

.count-text {
  font-size: 0.875rem;
  color: var(--color-sub);
  font-weight: 500;
}

.count-text strong {
  color: var(--color-main);
  font-weight: 600;
}

/* 액션 섹션 */
.actions-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.selection-indicator {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  background: var(--color-main);
  color: var(--color-white);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 액션 버튼 공통 스타일 */
.action-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 선택 삭제 버튼 */
.delete-selected {
  background: #ef4444;
  color: var(--color-white);
}

.delete-selected:hover:not(:disabled) {
  background: #dc2626;
}

/* 전체 삭제 버튼 */
.delete-all {
  background: var(--color-bg-light);
  color: var(--color-sub);
  border: 1px solid #e2e8f0;
}

.delete-all:hover:not(:disabled) {
  background: #e2e8f0;
  color: var(--color-main);
}

.action-btn:active:not(:disabled) {
  transform: scale(0.98);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .summary-container {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }

  .count-text {
    font-size: 0.8125rem;
  }

  .selection-indicator {
    padding: 0.3125rem 0.625rem;
    font-size: 0.6875rem;
  }

  .action-btn {
    padding: 0.4375rem 0.875rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .summary-container {
    padding: 0.75rem 0.875rem;
    gap: 0.5rem;
  }

  .count-text {
    font-size: 0.75rem;
  }

  .selection-indicator {
    padding: 0.25rem 0.5rem;
    font-size: 0.625rem;
  }

  .action-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
  }
}

/* 포커스 상태 */
.action-btn:focus-visible {
  outline: 2px solid var(--color-main);
  outline-offset: 1px;
}
</style>
