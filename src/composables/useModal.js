import { inject } from 'vue';

export function useModal() {
  const modalState = inject('modalState');
  const modalHandlers = inject('modalHandlers');

  if (!modalState || !modalHandlers) {
    throw new Error('ModalProvider가 App.vue에서 등록되지 않았습니다.');
  }

  const showModal = (message) => {
    return new Promise((resolve) => {
      modalState.isOpen = true;
      modalState.message = message;
      modalHandlers.resolve = (result) => {
        modalState.isOpen = false;
        resolve(result);
      };
    });
  };

  return { showModal };
}
