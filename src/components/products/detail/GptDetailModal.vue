<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Mate의 상품 상세 요약</h3>
        <button @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <p>요약내용</p>
        <!-- 여기서 GPT 비교 로직 구현 -->
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  compareList: { type: Array, default: () => [] },
});

defineEmits(['close']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  max-width: 90%;
  max-height: 90%;
}
</style>
