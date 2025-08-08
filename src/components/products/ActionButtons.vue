<template>
  <div class="action-section">
    <button
      class="compare-btn"
      :class="isInCompareList ? 'in-list' : 'add-btn'"
      @click="handleCompareClick"
    >
      {{ isInCompareList ? '비교함에서 제거' : '비교함에 추가' }}
    </button>
    <button class="join-btn" @click="$emit('join-product')">가입하기</button>
  </div>
</template>

<script setup>
const props = defineProps({
  isInCompareList: Boolean,
});
const emit = defineEmits(['add-to-compare', 'remove-from-compare', 'join-product']);

const handleCompareClick = () => {
  props.isInCompareList ? emit('remove-from-compare') : emit('add-to-compare');
};
</script>

<style scoped>
.action-section {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  max-width: 430px;
}

.compare-btn,
.join-btn {
  flex: 1;
  padding: 0.68rem 0.8rem;
  border-radius: 0.75rem;
  font-size: 0.96rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}

.add-btn {
  background: var(--color-bg-light);
  color: var(--color-main);
  border: 1px solid var(--color-light);
}
.in-list {
  background: var(--color-sub);
  color: #fff;
  border: 1px solid var(--color-sub);
}
.join-btn {
  background: var(--color-main);
  color: #fff;
  border: none;
}
.compare-btn:active,
.join-btn:active {
  opacity: 0.92;
}
</style>
