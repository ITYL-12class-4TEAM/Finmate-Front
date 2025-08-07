<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="$emit('cancel')">×</button>
      </div>
      <div class="modal-body">
        <p>{{ message }}</p>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('cancel')">취소</button>
        <button class="confirm-btn" @click="$emit('confirm')">확인</button>
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps({
  title: { type: String, default: '확인' },
  message: { type: String, default: '' },
});
</script>
<style scoped>
/* 위에 썼던 스타일 그대로 써도 되고, 아래처럼 기본만 둬도 됩니다 */
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
  background: #fff;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 20rem;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f2f2f2;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #aaa;
  cursor: pointer;
}
.modal-body {
  padding: 1.5rem 1rem;
}
.modal-footer {
  padding: 1rem;
  border-top: 1px solid #f2f2f2;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.cancel-btn {
  background: #f6f7fa;
  color: #333;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
}
.confirm-btn {
  background: var(--color-main, #2d336b);
  color: #fff;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
}
</style>
