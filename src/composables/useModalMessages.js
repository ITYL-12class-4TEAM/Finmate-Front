// src/composables/useModalMessages.js
import { nextTick, watch } from 'vue';
import { useModalStore } from '@/stores/useModalStore';

export function useModalMessages() {
  const modalStore = useModalStore();

  // 모달 메시지에 줄바꿈 강제 적용하는 함수
  const fixModalLineBreaks = () => {
    nextTick(() => {
      const message = document.querySelector('.modal-message');
      if (message) {
        message.style.whiteSpace = 'pre-line';
        message.style.lineHeight = '1.6';
      }
    });
  };

  // 모달이 열릴 때마다 줄바꿈 적용
  watch(
    () => modalStore.isOpen,
    (isOpen) => {
      if (isOpen) {
        setTimeout(fixModalLineBreaks, 50);
      }
    }
  );

  // 백업/복원 관련 모달들
  const showBackupRestoreModal = async (restoreFormData, clearBackup) => {
    const message = `이전에 작성하던 정보가 있어요! 

계속해서 작성하시겠어요?`;

    const result = await modalStore.showModal(message);

    if (result) {
      // 토스트 메시지는 여기서 처리하지 않고 호출부에서 각자 처리하도록.
      return { action: 'restore', data: restoreFormData() };
    } else {
      clearBackup();
      return { action: 'clear', data: null };
    }
  };

  const showDataRestoredModal = async () => {
    const message = `이전에 입력하신 정보가 복원되었어요!

계속해서 작성해주세요.`;

    await modalStore.showModal(message);
  };

  // 일반적인 확인 모달
  const showConfirmModal = async (title, content, confirmText = '확인', cancelText = '취소') => {
    const message = `${title}

${content}

${confirmText}: 계속하기
${cancelText}: 취소하기`;

    return await modalStore.showModal(message);
  };

  // 정보 모달 (확인 버튼만)
  const showInfoModal = async (title, content) => {
    const message = `${title}

${content}`;

    await modalStore.showModal(message);
  };

  // 성공 모달
  const showSuccessModal = async (title, content) => {
    const message = `${title}

${content}`;

    await modalStore.showModal(message);
  };

  // 경고 모달
  const showWarningModal = async (title, content, actionText = '확인') => {
    const message = `${title}

${content}

${actionText}: 계속하기
취소: 돌아가기`;

    return await modalStore.showModal(message);
  };

  // 에러 모달
  const showErrorModal = async (title, content, retryText = '다시 시도') => {
    const message = `${title}

${content}

${retryText}: 다시 시도하기
취소: 나중에 하기`;

    return await modalStore.showModal(message);
  };

  return {
    // 핵심 함수
    fixModalLineBreaks,

    // 백업/복원 관련
    showBackupRestoreModal,
    showDataRestoredModal,

    // 일반 모달들
    showConfirmModal,
    showInfoModal,
    showSuccessModal,
    showWarningModal,
    showErrorModal,

    // 직접 modalStore 접근
    showModal: modalStore.showModal,
  };
}
