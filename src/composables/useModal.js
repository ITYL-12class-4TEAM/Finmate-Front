import { inject } from 'vue';

export function useModal() {
  const modalState = inject('modalState');
  const modalHandlers = inject('modalHandlers');

  return (message) =>
    new Promise((resolve) => {
      modalState.isOpen = true;
      modalState.message = message;
      modalHandlers.resolve = (result) => {
        modalState.isOpen = false;
        resolve(result);
      };
    });
}
