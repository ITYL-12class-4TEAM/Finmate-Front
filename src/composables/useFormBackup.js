// src/composables/useFormBackup.js (console 제거된 버전)
import { onBeforeUnmount } from 'vue';
import { useToast } from '@/composables/useToast';

export function useFormBackup(options = {}) {
  const {
    pageKey = 'default',
    expiryHours = 1,
    storageKey = 'formBackup',
    formRef = null,
    autoBackup = true,
    submittedKey = null,
    forceBackup = false, // 제출 여부 무시하고 강제 백업(에러처리용)
    silentBackup = false, // 토스트 메시지 없이 백업
  } = options;

  const { showToast } = useToast();

  // localStorage 지원 확인
  const checkLocalStorageSupport = () => {
    try {
      const testKey = 'localStorage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      showToast('브라우저에서 데이터 저장이 지원되지 않습니다.', 'warning');
      return false;
    }
  };

  // 폼 데이터 백업 (강제 옵션,토스트메시지 제어 추가)
  const backupFormData = (force = false, silent = silentBackup) => {
    if (!checkLocalStorageSupport()) {
      return false;
    }

    if (!formRef?.value) {
      return false;
    }

    // 강제 백업이 아닐 때만 제출 상태 확인
    if (!force && !forceBackup) {
      const submitted = isSubmitted();
      if (submitted) {
        return false;
      }
    }

    try {
      const formBackup = {
        ...formRef.value,
        timestamp: Date.now(),
        page: pageKey,
      };

      localStorage.setItem(storageKey, JSON.stringify(formBackup));

      // 백업 검증
      const verification = localStorage.getItem(storageKey);
      if (verification) {
        // silent 모드가 아닐 때만 토스트 표시
        if (!silent) {
          showToast('입력 정보가 임시 저장되었어요', 'info');
        }
        return true;
      } else {
        throw new Error('백업 검증 실패');
      }
    } catch (error) {
      if (!silent) {
        showToast('임시 저장 실패. 중요한 정보는 별도로 메모해주세요.', 'warning');
      }
      return false;
    }
  };

  // 폼 데이터 복원
  const restoreFormData = () => {
    const backup = localStorage.getItem(storageKey);
    if (!backup) {
      return false;
    }

    try {
      const formBackup = JSON.parse(backup);

      const expiryTime = expiryHours * 60 * 60 * 1000;
      const isRecent = Date.now() - formBackup.timestamp < expiryTime;
      const isCorrectPage = formBackup.page === pageKey;

      if (isRecent && isCorrectPage && formRef?.value) {
        // 폼 데이터 복원
        Object.keys(formBackup).forEach((key) => {
          if (key !== 'timestamp' && key !== 'page' && key in formRef.value) {
            formRef.value[key] = formBackup[key];
          }
        });

        localStorage.removeItem(storageKey);
        return true;
      } else {
        localStorage.removeItem(storageKey);
        return false;
      }
    } catch (error) {
      localStorage.removeItem(storageKey);
      return false;
    }
  };

  // 백업 데이터 존재 여부 확인
  const hasValidBackup = () => {
    const backup = localStorage.getItem(storageKey);
    if (!backup) {
      return false;
    }

    try {
      const backupData = JSON.parse(backup);
      const expiryTime = expiryHours * 60 * 60 * 1000;
      const isRecent = Date.now() - backupData.timestamp < expiryTime;
      const isCorrectPage = backupData.page === pageKey;

      return isRecent && isCorrectPage;
    } catch (error) {
      localStorage.removeItem(storageKey);
      return false;
    }
  };

  // 백업 데이터 삭제
  const clearBackup = () => {
    localStorage.removeItem(storageKey);
  };

  // 폼에 데이터가 있는지 확인
  const hasFormData = () => {
    if (!formRef?.value) {
      return false;
    }

    const values = Object.values(formRef.value);
    const hasData = values.some((value) => value !== null && value !== '' && value !== undefined);

    return hasData;
  };

  // 제출 완료 여부 확인
  const isSubmitted = () => {
    if (!submittedKey) {
      return false;
    }

    const submitted = localStorage.getItem(submittedKey) === 'true';
    return submitted;
  };

  // 강제 백업 함수
  const forceBackupFormData = (silent = false) => {
    return backupFormData(true, silent);
  };

  // 자동 백업 설정
  if (autoBackup) {
    onBeforeUnmount(() => {
      const hasData = hasFormData();
      const submitted = isSubmitted();

      // forceBackup이 true이거나, 데이터가 있고 제출되지 않았을 때 백업
      if (hasData && (forceBackup || !submitted)) {
        backupFormData(true, true); // 자동백업(은 항상ture), 강제 백업
      }
    });
  }

  return {
    backupFormData,
    restoreFormData,
    hasValidBackup,
    clearBackup,
    hasFormData,
    isSubmitted,
    checkLocalStorageSupport,
    forceBackupFormData,
  };
}
