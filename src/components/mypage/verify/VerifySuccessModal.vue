<template>
  <div class="success-modal" @click="$emit('close')">
    <div class="modal-backdrop"></div>
    <div class="modal-content" @click.stop>
      <div class="success-icon">
        <i class="fas fa-check"></i>
      </div>

      <div class="modal-body">
        <h3>비밀번호 확인 완료</h3>
        <p>
          본인 확인이 성공적으로 완료되었습니다.<br />
          이제 회원정보를 안전하게 수정할 수 있습니다.
        </p>
      </div>

      <div class="modal-actions">
        <button class="modal-btn" @click="$emit('proceed')">
          <span>회원정보 수정하기</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close', 'proceed']);
</script>

<style scoped>
.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
}

.modal-content {
  background: var(--color-white);
  border-radius: 1rem;
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  max-width: 25rem;
  width: 100%;
  box-shadow: 0 1.25rem 2.5rem rgba(0, 0, 0, 0.15);
  position: relative;
  animation: modalSlideIn 0.4s ease-out;
  border: 0.0625rem solid var(--color-bg-light);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(1.25rem);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.success-icon {
  width: 5rem;
  height: 5rem;
  margin: 0 auto 2rem;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 2rem;
  animation: iconScale 0.5s ease-out 0.2s both;
}

@keyframes iconScale {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.modal-body h3 {
  color: var(--color-main);
  margin: 0 0 1rem 0;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.modal-body p {
  color: var(--color-sub);
  margin: 0 0 2rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
  font-weight: 500;
}

.modal-actions {
  margin-top: 1rem;
}

.modal-btn {
  width: 100%;
  padding: 1.125rem 2rem;
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  letter-spacing: -0.01em;
}

.modal-btn:hover {
  background: var(--color-sub);
  transform: translateY(-0.125rem);
  box-shadow: 0 0.5rem 1.25rem rgba(45, 51, 107, 0.25);
}

.modal-btn:active {
  transform: translateY(0);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.2);
}

.modal-btn i {
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.modal-btn:hover i {
  transform: translateX(0.125rem);
}

@media (max-width: 23.4375rem) {
  .success-modal {
    padding: 1rem;
  }

  .modal-content {
    border-radius: 0.75rem;
    padding: 2rem 1.5rem 1.5rem;
    max-width: calc(100vw - 2rem);
  }

  .success-icon {
    width: 3.75rem;
    height: 3.75rem;
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .modal-body h3 {
    font-size: 1.25rem;
  }

  .modal-body p {
    font-size: 0.85rem;
    margin-bottom: 1.25rem;
  }

  .modal-btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.85rem;
  }
}
</style>
