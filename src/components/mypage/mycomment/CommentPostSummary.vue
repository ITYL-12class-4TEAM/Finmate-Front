<template>
  <div class="post-summary">
    <div class="summary-container">
      <div class="count-section">
        <div class="count-badge">
          <span class="count-text"
            >총 <strong>{{ formatCount(count) }}개</strong> 게시글</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    required: true,
  },
});

// 숫자 포맷팅 함수 (다른 컴포넌트와 일관성 유지)
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
</script>

<style scoped>
.post-summary {
  margin-bottom: 1.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.count-section {
  flex: 1;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem;
  transition: all 0.3s ease;
}

.count-text {
  font-size: 0.875rem;
  color: var(--color-sub);
  font-weight: 500;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.count-text strong {
  color: var(--color-main);
  font-weight: 700;
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideInRight 0.3s ease;
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

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  }
  50% {
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.5),
      0 0 0 4px rgba(220, 53, 69, 0.1);
  }
}

/* 빈 상태일 때 */
.post-summary.empty .count-badge {
  background: rgba(185, 187, 204, 0.1);
  border-color: rgba(185, 187, 204, 0.2);
}

.post-summary.empty .count-badge i {
  color: var(--color-light);
}

/* 접근성 */
.delete-btn:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
</style>
