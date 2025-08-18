<template>
  <teleport to="body">
    <div v-if="modalStore.isOpen" class="modal-backdrop" @click.self="modalStore.cancel">
      <div class="modal-box">
        <p class="modal-message">{{ modalStore.message }}</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="modalStore.cancel">취소</button>
          <button class="confirm-btn" @click="modalStore.confirm">확인</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { useModalStore } from '@/stores/useModalStore';

const modalStore = useModalStore();
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-box {
  background: white;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  width: 90%;
  max-width: 360px;
  text-align: center;
}

.modal-message {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: #333;
  white-space: pre-line;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 0.5rem 0;
  min-width: 80px;
  border-radius: 6px;
  font-weight: 500;
}

.cancel-btn {
  background-color: var(--color-bg-light);
  color: #333;
}

.confirm-btn {
  background-color: var(--color-main);
  color: white;
}
</style>
