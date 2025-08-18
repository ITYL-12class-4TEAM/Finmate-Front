<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>최종 확인</h3>
        <button type="button" class="modal-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="modal-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p class="modal-text">정말로 회원탈퇴를 진행하시겠습니까?</p>
        <p class="modal-warning"><strong>이 작업은 되돌릴 수 없습니다.</strong></p>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" :disabled="processing" @click="$emit('close')">
          <i class="fas fa-times"></i>
          취소
        </button>
        <button type="button" class="btn-danger" :disabled="processing" @click="$emit('confirm')">
          <i v-if="processing" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-trash"></i>
          <span v-if="processing">처리 중...</span>
          <span v-else>탈퇴 확정</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  processing: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['close', 'confirm']);
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
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: var(--color-white);
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-bg-light);
}

.modal-header h3 {
  color: var(--color-main);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-sub);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.modal-close:hover {
  color: var(--color-main);
  background: var(--color-bg-light);
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: #fef3cd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.modal-icon i {
  color: #dc2626;
  font-size: 1.5rem;
}

.modal-text {
  color: var(--color-main);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.modal-warning {
  color: var(--color-sub);
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.modal-warning strong {
  color: #dc2626;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid var(--color-bg-light);
}

.btn-secondary,
.btn-danger {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 2.5rem;
}

.btn-secondary {
  background: var(--color-bg-light);
  color: var(--color-sub);
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  color: var(--color-main);
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
}

.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger:disabled {
  background: var(--color-light);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    border-radius: 8px;
  }

  .modal-header,
  .modal-body,
  .modal-actions {
    padding: 1rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn-secondary,
  .btn-danger {
    width: 100%;
  }

  .modal-icon {
    width: 3rem;
    height: 3rem;
  }

  .modal-icon i {
    font-size: 1.25rem;
  }
}
</style>
