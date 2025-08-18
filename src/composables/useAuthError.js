import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/composables/useToast';

export function useAuthError(options = {}) {
  const {
    maxRetryCount = 3,
    retryDelay = 1000,
    serverErrorDelay = 3000,
    refreshOptionDelay = 3000,
  } = options;

  const router = useRouter();
  const authStore = useAuthStore();
  const { showToast } = useToast();

  // 상태
  const isRetrying = ref(false);
  const retryCount = ref(0);

  // 재시도 카운트 초기화
  const resetRetryCount = () => {
    retryCount.value = 0;
  };

  // 에러 타입별 처리
  const processSubmissionError = async (error, options = {}) => {
    const { showModalFn, backupFormData, scrollToFirstError, handleSubmitFn } = options;

    // 에러 타입별 처리
    if (error.response?.status === 401) {
      return await handleTokenExpired(backupFormData, showModalFn, handleSubmitFn);
    } else if (error.response?.status === 400) {
      await showInputErrorModal(showModalFn, scrollToFirstError);
      return { shouldRetry: false };
    } else if (error.response?.status >= 500) {
      await showServerErrorModal(showModalFn, handleSubmitFn);
      return { shouldRetry: false };
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      await showNetworkErrorModal(showModalFn, handleSubmitFn);
      return { shouldRetry: false };
    } else {
      return await showGenericErrorModal(showModalFn, backupFormData, handleSubmitFn);
    }
  };

  // 토큰 만료 처리
  const handleTokenExpired = async (backupFormData, showModalFn) => {
    if (backupFormData) {
      backupFormData();
    }

    showToast('로그인 상태를 확인하고 있어요...', 'info');

    try {
      const isValid = await authStore.refreshUser();

      if (isValid) {
        showToast('로그인 상태가 확인되었어요! 다시 제출하고 있어요...', 'success');
        isRetrying.value = true;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));

        if (retryCount.value < maxRetryCount) {
          retryCount.value++;
          return { shouldRetry: true };
        } else {
          await showLoginExpiredModal(showModalFn, backupFormData);
          return { shouldRetry: false };
        }
      } else {
        await showLoginExpiredModal(showModalFn, backupFormData);
        return { shouldRetry: false };
      }
    } catch (refreshError) {
      await showLoginExpiredModal(showModalFn, backupFormData);
      return { shouldRetry: false };
    } finally {
      isRetrying.value = false;
    }
  };

  // 로그인 만료 모달
  const showLoginExpiredModal = async (showModalFn, backupFormData) => {
    const message = `로그인이 만료되었어요.

입력하신 정보는 안전하게 임시 저장되었으니 걱정하지 마세요!
로그인 후 이 페이지로 돌아오면 자동으로 복원됩니다.`;

    const result = await showModalFn(message);

    if (result) {
      if (backupFormData) {
        backupFormData();
      }

      const returnUrl = encodeURIComponent(window.location.pathname);
      const targetUrl = `/login?returnUrl=${returnUrl}&restored=true`;
      router.push(targetUrl);
    } else {
      showRefreshPageOption(showModalFn, backupFormData);
    }
  };

  // 입력 에러 모달
  const showInputErrorModal = async (showModalFn, scrollToFirstError) => {
    const message = `입력하신 정보에 문제가 있어요.

각 항목을 다시 한번 확인해주시고,
특히 숫자 입력 부분을 점검해보세요.

확인을 누르시면 문제가 있는 항목으로 이동합니다.`;

    const result = await showModalFn(message);

    if (result && scrollToFirstError) {
      scrollToFirstError();
    }
  };

  // 서버 에러 모달
  const showServerErrorModal = async (showModalFn, handleSubmitFn) => {
    const message = `서버에 일시적인 문제가 발생했어요.

보통 금방 해결되니까 조금만 기다리신 후 다시 시도해주세요!`;

    const result = await showModalFn(message);

    if (result) {
      setTimeout(async () => {
        await showRetryModal(showModalFn, handleSubmitFn);
      }, serverErrorDelay);
    }
  };

  // 네트워크 에러 모달
  const showNetworkErrorModal = async (showModalFn, handleSubmitFn) => {
    const message = `인터넷 연결에 문제가 있는 것 같아요.

Wi-Fi나 데이터 연결을 확인하시고 다시 시도해주세요.`;

    const result = await showModalFn(message);

    if (result) {
      await checkNetworkAndRetry(handleSubmitFn);
    }
  };

  // 일반 에러 모달
  const showGenericErrorModal = async (showModalFn, backupFormData) => {
    const message = `예상치 못한 문제가 발생했어요.

입력하신 정보는 임시 저장되었으니 안심하시고 잠시 후 다시 시도해주세요.`;

    const result = await showModalFn(message);

    if (result) {
      if (retryCount.value < maxRetryCount) {
        retryCount.value++;
        return { shouldRetry: true };
      } else {
        showToast('재시도 횟수가 초과되었습니다. 페이지를 새로고침해주세요.', 'warning');
        showRefreshPageOption(showModalFn, backupFormData);
        return { shouldRetry: false };
      }
    } else {
      showRefreshPageOption(showModalFn, backupFormData);
      return { shouldRetry: false };
    }
  };

  // 재시도 모달
  const showRetryModal = async (showModalFn, handleSubmitFn) => {
    const message = `다시 시도할 준비가 되었나요?

입력하신 정보는 그대로 유지됩니다.`;

    const result = await showModalFn(message);

    if (result) {
      if (retryCount.value < maxRetryCount) {
        retryCount.value++;
        if (handleSubmitFn) {
          await handleSubmitFn(true);
        }
      } else {
        showToast('재시도 횟수가 초과되었습니다.', 'warning');
      }
    }
  };

  // 페이지 새로고침 옵션
  const showRefreshPageOption = (showModalFn, backupFormData) => {
    showToast('페이지를 새로고침하시면 문제가 해결될 수 있어요.', 'info');

    setTimeout(async () => {
      const message = `페이지를 새로고침하시겠어요?

입력하신 정보는 자동으로 백업됩니다.`;

      const result = await showModalFn(message);

      if (result) {
        if (backupFormData) {
          backupFormData();
        }
        window.location.reload();
      }
    }, refreshOptionDelay);
  };

  // 네트워크 상태 확인 및 재시도
  const checkNetworkAndRetry = async (handleSubmitFn) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(window.location.origin, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status < 500) {
        showToast('네트워크가 복구되었어요! 다시 시도하고 있어요...', 'success');

        if (retryCount.value < maxRetryCount) {
          retryCount.value++;
          if (handleSubmitFn) {
            await handleSubmitFn(true);
          }
        } else {
          showToast('재시도 횟수가 초과되었습니다.', 'warning');
        }
      } else {
        throw new Error('Network still unstable');
      }
    } catch (networkError) {
      showToast('아직 네트워크에 문제가 있어요. 조금 더 기다려주세요.', 'warning');
    }
  };

  return {
    isRetrying,
    retryCount,
    processSubmissionError,
    resetRetryCount,
    checkNetworkAndRetry,
  };
}
