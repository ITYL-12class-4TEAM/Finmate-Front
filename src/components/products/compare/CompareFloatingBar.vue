<template>
  <div
    class="compare-floating-bar"
    v-if="compareList.length > 0"
    :class="{ 'has-pagination': hasPagination }"
  >
    <div class="floating-bar-content">
      <div class="compare-info">
        <div class="count-badge">{{ compareList.length }}<span class="max-count">/3</span></div>
        <span class="compare-text"> 비교함에 {{ compareList.length }}개의 상품이 담겼습니다 </span>
      </div>
      <button class="compare-btn" @click="handleError">
        <span>비교하기</span>
        <i class="compare-icon">→</i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const props = defineProps({
  compareList: { type: Array, default: () => [] },
  hasPagination: { type: Boolean, default: false },
});
const emit = defineEmits(['go-to-compare']);

const handleError = () => {
  if (props.compareList.length < 2) {
    showToast('2개 이상의 상품을 선택해주세요.', 'warning');
    return;
  }
  emit('go-to-compare');
};
</script>

<style scoped>
:root {
  --floating-bar-max-width: 26.875rem; /* 430px */
  --floating-bar-padding-y: 1rem;
  --floating-bar-padding-x: 1.25rem;
  --badge-size: 2.25rem;
  --badge-font: 1rem;
  --badge-max-font: 0.75rem;
  --compare-text-font: 0.875rem;
  --compare-btn-padding-y: 0.625rem;
  --compare-btn-padding-x: 1rem;
  --compare-btn-font: 0.875rem;
}

/* 밝은 카드형 플로팅바 */
.compare-floating-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  box-shadow: 0 -0.25rem 1.25rem 0 rgba(45, 51, 107, 0.16);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  border: 1.5px solid var(--color-light);
  border-bottom: none;
  transition: transform 0.3s;
  padding: 0;
}
.compare-floating-bar.has-pagination {
  bottom: 3rem;
}

.floating-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--floating-bar-padding-y) var(--floating-bar-padding-x);
  max-width: var(--floating-bar-max-width);
  margin: 0 auto;
}

.compare-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.count-badge {
  background: var(--color-bg-light);
  color: var(--color-main);
  font-weight: 700;
  font-size: var(--badge-font);
  width: var(--badge-size);
  height: var(--badge-size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-main);
  box-shadow: 0 0.125rem 0.25rem rgba(45, 51, 107, 0.1);
  position: relative;
}
.max-count {
  font-size: var(--badge-max-font);
  font-weight: 400;
  opacity: 0.7;
}
.compare-text {
  font-size: var(--compare-text-font);
  font-weight: 500;
  color: var(--color-main);
}

.compare-btn {
  background: var(--color-main);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: var(--compare-btn-padding-y) var(--compare-btn-padding-x);
  font-weight: 600;
  font-size: var(--compare-btn-font);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(45, 51, 107, 0.07);
  transition:
    background 0.2s,
    transform 0.2s;
}
.compare-btn:hover {
  background: var(--color-sub);
  transform: translateY(-2px);
}
.compare-icon {
  font-style: normal;
  font-weight: 700;
}

/* 모바일 */
@media (max-width: 430px) {
  .floating-bar-content {
    width: 100%;
    padding: 0.75rem 1rem;
    max-width: 100vw;
  }
  .compare-text {
    font-size: 0.8125rem;
  }
  .compare-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }
}
</style>
