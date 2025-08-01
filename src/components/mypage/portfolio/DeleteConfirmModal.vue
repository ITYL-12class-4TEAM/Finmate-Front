<template>
  <div class="modal-overlay" v-if="isVisible" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <div class="modal-title">
          <i class="fas fa-exclamation-triangle"></i>
          상품 삭제 확인
        </div>
      </div>

      <!-- 모달 바디 -->
      <div class="modal-body">
        <div class="warning-icon">
          <i class="fas fa-trash-alt"></i>
        </div>

        <div class="delete-message">
          <h4 class="message-title">정말 삭제하시겠습니까?</h4>
          <p class="message-content">
            <strong>"{{ productName }}"</strong> 상품을 삭제하면<br />
            포트폴리오에서 완전히 제거되며 복구할 수 없습니다.
          </p>

          <div class="warning-note">
            <i class="fas fa-info-circle"></i>
            <span>이 작업은 되돌릴 수 없습니다.</span>
          </div>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <button
          type="button"
          @click="handleCancel"
          class="modal-btn cancel-btn"
          :disabled="isProcessing"
        >
          <i class="fas fa-times"></i>
          취소
        </button>

        <button
          @click="handleConfirm"
          class="modal-btn delete-btn"
          :disabled="isProcessing"
        >
          <i
            :class="isProcessing ? 'fas fa-sync-alt spin' : 'fas fa-trash-alt'"
          ></i>
          {{ isProcessing ? '삭제 중...' : '삭제' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  productName: {
    type: String,
    default: '상품',
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'confirm']);

// 오버레이 클릭 처리
const handleOverlayClick = () => {
  if (!props.isProcessing) {
    emit('close');
  }
};

// 취소 처리
const handleCancel = () => {
  if (!props.isProcessing) {
    emit('close');
  }
};

// 삭제 확인 처리
const handleConfirm = () => {
  if (!props.isProcessing) {
    emit('confirm');
  }
};

// ESC 키로 모달 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isVisible && !props.isProcessing) {
    emit('close');
  }
};

// 이벤트 리스너 등록/해제
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 모달이 열릴 때 스크롤 방지
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(220, 38, 38, 0.2);
  max-width: 450px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  border: 2px solid rgba(220, 38, 38, 0.1);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(220, 38, 38, 0.2);
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0.05),
    rgba(239, 68, 68, 0.05)
  );
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #dc2626;
}

.modal-title i {
  font-size: 1.25rem;
}

.modal-body {
  padding: 0.5rem 0.5rem;
  text-align: center;
}

.warning-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 3px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  animation: pulse 2s infinite;
}

.warning-icon i {
  font-size: 1.75rem;
  color: #dc2626;
}

.delete-message {
  margin-bottom: 1rem;
}

.message-title {
  color: var(--color-main);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.message-content {
  color: var(--color-sub);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
}

.message-content strong {
  color: var(--color-main);
  font-weight: 600;
}

.warning-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.1),
    rgba(220, 38, 38, 0.1)
  );
  border-radius: 0.5rem;
  border: 1px solid rgba(220, 38, 38, 0.2);
  font-size: 0.85rem;
  color: #dc2626;
  font-weight: 500;
}

.warning-note i {
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid rgba(185, 187, 204, 0.2);
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Pretendard', sans-serif;
  min-width: 100px;
  justify-content: center;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.cancel-btn {
  background: var(--color-light);
  color: white;
  border: 2px solid transparent;
}

.cancel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
  border-color: #4b5563;
}

.delete-btn {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
  border: 2px solid transparent;
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  border-color: #991b1b;
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 포커스 상태 */
.modal-btn:focus {
  outline: 3px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}
</style>
