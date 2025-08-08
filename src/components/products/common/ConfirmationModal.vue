<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
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
  show: { type: Boolean, default: false },
  title: { type: String, default: '확인' },
  message: { type: String, required: true },
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 20rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-bg-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--color-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-sub);
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem 1rem;
}

.modal-body p {
  margin: 0;
  color: var(--color-text);
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background-color: var(--color-bg-light);
  color: var(--color-text);
  border: none;
}

.confirm-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
}
</style>
