<template>
  <div
    v-if="compareList.length > 0"
    class="compare-floating-bar"
    :class="{ 'has-pagination': hasPagination }"
  >
    <div class="floating-bar-content">
      <div class="compare-info">
        <div class="count-badge">{{ compareList.length }}<span class="max-count">/3</span></div>
        <span class="compare-text"> 담긴 상품 개수 </span>
      </div>
      <div class="button-group">
        <button class="clear-btn" @click="handleClearWithConfirm">
          <span>비우기</span>
        </button>
        <button class="compare-btn" @click="handleError">
          <span>비교</span>
          <i class="compare-icon">→</i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';
import { useModal } from '@/composables/useModal';

const { showToast } = useToast();
const { showModal } = useModal();

const props = defineProps({
  compareList: { type: Array, default: () => [] },
  hasPagination: { type: Boolean, default: false },
});
const emit = defineEmits(['go-to-compare', 'clear-compare-list']);

const handleError = () => {
  if (props.compareList.length < 2) {
    showToast('2개 이상의 상품을 선택해주세요.', 'warning');
    return;
  }
  emit('go-to-compare');
};

const handleClearWithConfirm = async () => {
  const confirmed = await showModal('비교함을 비우시겠습니까?');
  if (confirmed) {
    emit('clear-compare-list');
  }
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
  left: -17.5%;
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
  width: 310px;
  margin: 0 auto;
}
.compare-floating-bar.has-pagination {
  bottom: 3rem;
}

.floating-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  padding: 0.75rem 1rem;
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
  width: 2.5rem;
  height: 2.5rem;
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
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-main);
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn {
  background: var(--color-light);
  color: var(--color-main);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 0.125rem 0.25rem rgba(45, 51, 107, 0.07);
  transition:
    background 0.2s,
    transform 0.2s;
}

.clear-btn:hover {
  background: #d0d1e0;
  transform: translateY(-2px);
}

.compare-btn {
  background: var(--color-main);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
</style>
