<template>
  <div class="compare-floating-bar">
    <div class="compare-count">
      <strong>{{ compareList.length }}개</strong> 비교 중
    </div>
    <div class="action-buttons">
      <button class="clear-btn" @click="handleClearList">비우기</button>
      <button class="compare-btn" @click="$emit('go-to-compare')">비교</button>
    </div>
  </div>
</template>

<script setup>
import { useModal } from '@/composables/useModal';

const { showModal } = useModal();

const props = defineProps({
  compareList: {
    type: Array,
    required: true,
  },
  productType: {
    type: String,
    default: 'deposit',
  },
});

const emit = defineEmits(['go-to-compare', 'clear-compare-list']);

// 비우기 버튼 클릭 시 확인 모달 표시
const handleClearList = async () => {
  // 상품 타입에 따라 메시지 조정
  const productLabel = props.productType === 'deposit' ? '예금' : '적금';

  // 모달 표시 및 사용자 확인 대기
  const confirmed = await showModal(`${productLabel} 비교함을 비우시겠습니까?`);

  // 사용자가 확인을 누른 경우에만 비우기 이벤트 발생
  if (confirmed) {
    emit('clear-compare-list');
  }
};
</script>

<style scoped>
.compare-floating-bar {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-main);
  border-radius: 2rem;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  width: 240px;
  max-width: 16rem;
  box-shadow: 0 0.25rem 1rem rgba(45, 51, 107, 0.2);
  z-index: 100;
}

.compare-count {
  color: #fff;
  font-size: 0.8rem;
}

.compare-count strong {
  font-weight: 600;
  font-size: 0.85rem;
}

.action-buttons {
  display: flex;
  gap: 0.6rem;
}

.clear-btn,
.compare-btn {
  padding: 0.5rem 0.875rem;
  border-radius: 1.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.clear-btn {
  background: #fff;
  color: var(--color-main);
}

.clear-btn:hover {
  background: rgba(83, 83, 83, 0.25);
  color: #fff;
}

.compare-btn {
  background: #fff;
  color: var(--color-main);
}

.compare-btn:hover {
  background: rgba(83, 83, 83, 0.25);
  color: #fff;
}
</style>
