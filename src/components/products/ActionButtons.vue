<template>
  <div class="action-section">
    <button class="add-compare-btn" @click="$emit('add-to-compare')">
      비교함에 추가
    </button>
    <button class="join-btn" @click="$emit('join-product')">가입하기</button>
  </div>
</template>
<script>
export default {
  name: "ActionButtons",
  emits: ["add-to-compare", "join-product"],
};
</script>
<style scoped>
.action-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0 2rem;
}

.add-compare-btn,
.join-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  max-width: 10rem;
  white-space: nowrap;
}

.add-compare-btn {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  border: 1px solid var(--color-light);
}

.add-compare-btn:hover {
  background-color: #e9e9ef;
}

.join-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
}

.join-btn:hover {
  background-color: #232856;
}
</style>
