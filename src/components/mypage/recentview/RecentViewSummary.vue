<template>
  <div class="favorites-actions">
    <div class="actions-container">
      <!-- 결과 정보 -->
      <div class="results-section">
        <div class="count-display">
          <span class="count-text">
            총 <strong>{{ formatCount(count) }}개</strong> 상품
          </span>
        </div>
      </div>

      <!-- 액션 버튼들 -->
      <div class="actions-section">
        <!-- 선택된 항목이 있을 때 -->
        <div v-if="selectedCount > 0" class="selected-actions">
          <div class="selection-indicator">
            <i class="fa-solid fa-check-circle"></i>
            <span>{{ selectedCount }}개 선택됨</span>
          </div>
          <button class="action-btn delete-selected" @click="$emit('delete-selected')">
            <i class="fa-solid fa-trash"></i>
            <span>선택 삭제</span>
          </button>
        </div>

        <!-- 선택된 항목이 없을 때 -->
        <div v-else class="default-actions">
          <button class="action-btn delete-all" :disabled="count === 0" @click="handleClearAll">
            <i class="fa-solid fa-trash-can"></i>
            <span>전체 삭제</span>
          </button>
        </div>
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

// 숫자 포맷팅 함수 (일관성 유지)
const formatCount = (count) => {
  if (!count || count === 0) return '0';

  if (count >= 10000) {
    const man = Math.floor(count / 10000);
    const remainder = count % 10000;
    if (remainder === 0) {
      return `${man}만`;
    } else if (remainder >= 1000) {
      const thousand = Math.floor(remainder / 1000);
      return `${man}만${thousand}천`;
    } else {
      return `${man}만`;
    }
  }

  if (count >= 1000) {
    const thousand = Math.floor(count / 1000);
    return `${thousand}천`;
  }

  return new Intl.NumberFormat('ko-KR').format(count);
};

const handleClearAll = () => emit('delete-all');
</script>

<style scoped>
.favorites-actions {
  margin-bottom: 1.5rem;
  position: relative;
}

.actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 1rem;
}

.actions-container:hover {
  border-color: rgba(185, 187, 204, 0.4);
  box-shadow: 0 4px 12px -2px rgba(45, 51, 107, 0.15);
}

/* 결과 정보 섹션 */
.results-section {
  flex: 1;
}

.count-display {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.05rem;
  transition: all 0.3s ease;
}

.count-text {
  font-size: 0.875rem;
  color: var(--color-sub);
  font-weight: 500;
}

.count-text strong {
  color: var(--color-main);
  font-weight: 700;
}

/* 액션 섹션 */
.actions-section {
  flex-shrink: 0;
}

.selected-actions,
.default-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.selection-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: var(--color-main);
  color: white;
  border-radius: 1.5rem;
  font-size: 0.6rem;
  font-weight: 500;
  animation: slideInRight 0.3s ease;
}

.selection-indicator i {
  font-size: 0.6rem;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 액션 버튼 공통 스타일 */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.6rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.action-btn i {
  font-size: 0.6rem;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* 선택 삭제 버튼 */
.delete-selected {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.delete-selected:hover:not(:disabled) {
  background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

/* 전체 삭제 버튼 */
.delete-all {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
}

.delete-all:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
}
</style>
