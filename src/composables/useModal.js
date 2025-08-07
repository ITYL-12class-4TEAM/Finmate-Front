import { useModalStore } from '@/stores/useModalStore';

export function useModal() {
  const modalStore = useModalStore();

  const showModal = (message) => {
    return modalStore.showModal(message);
  };

  return { showModal };
}
