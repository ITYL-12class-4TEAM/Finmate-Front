<template>
  <div v-if="compareList.length > 0" class="compare-floating-bar">
    <div class="compare-count">
      <span class="count">{{ compareList.length }}</span>
      <span class="max">/4</span>
    </div>
    <div class="compare-info">
      비교함에 <strong>{{ compareList.length }}개</strong>의 상품이 담겨있습니다.
    </div>
    <button class="compare-btn" @click="goToCompare">비교하기</button>
  </div>
</template>
<script setup>
// props 정의
const props = defineProps({
  compareList: {
    type: Array,
    required: true,
  },
});

// emits 정의
const emit = defineEmits(['go-to-compare']);

// 비교하기 버튼 클릭 핸들러
const goToCompare = () => {
  emit('go-to-compare');
};
</script>
<style scoped>
.compare-floating-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -0.25rem 0.5rem rgba(0, 0, 0, 0.1);
  padding: 0.875rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  max-width: 375px;
  margin: 0 auto;
}

.compare-count {
  display: flex;
  align-items: baseline;
  margin-right: 0.5rem;
}

.count {
  font-size: 1.125rem;
  font-weight: bold;
  color: var(--color-main);
}

.max {
  font-size: 0.875rem;
  color: var(--color-sub);
  margin-left: 0.125rem;
}

.compare-info {
  flex: 1;
  font-size: 0.875rem;
  color: var(--color-sub);
}

.compare-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.compare-btn:hover {
  background-color: #232856;
}
</style>
