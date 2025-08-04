<template>
  <teleport to="body">
    <div v-if="modalState.isOpen" class="modal-backdrop" @click.self="onCancel">
      <div class="modal-box">
        <p class="modal-message">{{ modalState.message }}</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="onCancel">취소</button>
          <button class="confirm-btn" @click="onConfirm">확인</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { inject } from 'vue';

const modalState = inject('modalState');
const modalHandlers = inject('modalHandlers');

const onCancel = () => {
  modalHandlers.resolve?.(false); // false = 취소
};

const onConfirm = () => {
  modalHandlers.resolve?.(true); // true = 확인
};
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
