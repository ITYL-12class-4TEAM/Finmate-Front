import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false);
  const message = ref('');
  let resolver = null;

  const showModal = (msg) => {
    message.value = msg;
    isOpen.value = true;

    return new Promise((resolve) => {
      resolver = resolve;
    });
  };

  const confirm = () => {
    isOpen.value = false;
    resolver?.(true);
    resolver = null;
  };

  const cancel = () => {
    isOpen.value = false;
    resolver?.(false);
    resolver = null;
  };

  return {
    isOpen,
    message,
    showModal,
    confirm,
    cancel,
  };
});
