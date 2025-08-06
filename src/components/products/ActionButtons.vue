<template>
  <div class="action-section">
    <button
      :class="['compare-btn', isInCompareList ? 'in-list' : 'add-compare-btn']"
      @click="handleCompareClick"
      :disabled="isInCompareList"
    >
      {{ isInCompareList ? '비교함에 추가됨' : '비교함에 추가' }}
    </button>
    <button class="join-btn" @click="$emit('join-product')">가입하기</button>
  </div>
</template>

<script setup>
// Props 정의
const props = defineProps({
  isInCompareList: {
    type: Boolean,
    default: false,
  },
});

// 이벤트 정의
const emit = defineEmits(['add-to-compare', 'join-product']);

// 비교함 버튼 클릭 핸들러
const handleCompareClick = () => {
  if (!props.isInCompareList) {
    // props에서 isInCompareList 참조
    emit('add-to-compare');
  }
};
</script>

<style scoped>
.action-section {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.compare-btn,
.join-btn {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  flex: 1;
}

.add-compare-btn {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  border: 1px solid var(--color-light);
  margin-right: 0.5rem;
}

.in-list {
  background-color: #e0e0e0;
  color: #888;
  border: 1px solid #ccc;
  cursor: default;
  margin-right: 0.5rem;
}

.join-btn {
  background-color: var(--color-main);
  color: white;
}
</style>
