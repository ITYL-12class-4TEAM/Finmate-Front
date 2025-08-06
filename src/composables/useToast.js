import { inject } from 'vue';

export function useToast() {
  const showToast = inject('showToast');
  if (!showToast) throw new Error('ToastProvider가 설정되지 않았습니다.');
  return { showToast };
}
