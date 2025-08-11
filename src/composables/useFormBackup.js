// src/composables/useFormBackup.js (수정된 버전)
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
    forceBackup = false, // 🔥 새 옵션: 제출 여부 무시하고 강제 백업
  } = options;

  const { showToast } = useToast();

  console.log('🔧 useFormBackup 초기화:', {
    pageKey,
    expiryHours,
    storageKey,
    formRef: formRef?.value,
    autoBackup,
    submittedKey,
    forceBackup,
  });

  // localStorage 지원 확인
  const checkLocalStorageSupport = () => {
    try {
      const testKey = 'localStorage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      console.log('✅ localStorage 지원됨');
      return true;
    } catch (error) {
      console.error('❌ localStorage 지원되지 않음:', error);
      showToast('브라우저에서 데이터 저장이 지원되지 않습니다.', 'warning');
      return false;
    }
  };

  // 폼 데이터 백업 (강제 옵션 추가)
  const backupFormData = (force = false) => {
    console.log('🔍 백업 시도 시작', force ? '(강제 모드)' : '');

    if (!checkLocalStorageSupport()) {
      console.log('❌ localStorage 지원 안됨');
      return false;
    }

    if (!formRef?.value) {
      console.log('❌ formRef가 없음');
      return false;
    }

    // 🔥 강제 백업이 아닐 때만 제출 상태 확인
    if (!force && !forceBackup) {
      const submitted = isSubmitted();
      if (submitted) {
        console.log('⚠️ 이미 제출된 폼이므로 백업하지 않음');
        return false;
      }
    }

    try {
      const formBackup = {
        ...formRef.value,
        timestamp: Date.now(),
        page: pageKey,
      };

      console.log(`🔍 [${pageKey}] 백업할 데이터:`, formBackup);

      localStorage.setItem(storageKey, JSON.stringify(formBackup));

      // 백업 검증
      const verification = localStorage.getItem(storageKey);
      if (verification) {
        const parsed = JSON.parse(verification);
        console.log(`✅ [${pageKey}] 백업 검증 성공:`, Object.keys(parsed).length, '개 필드');
        showToast('입력 정보가 임시 저장되었어요 📝', 'info');
        return true;
      } else {
        throw new Error('백업 검증 실패');
      }
    } catch (error) {
      console.error(`❌ [${pageKey}] 폼 데이터 백업 실패:`, error);
      showToast('임시 저장 실패. 중요한 정보는 별도로 메모해주세요.', 'warning');
      return false;
    }
  };

  // 폼 데이터 복원
  const restoreFormData = () => {
    console.log(`🔍 [${pageKey}] 폼 데이터 복원 시도`);

    const backup = localStorage.getItem(storageKey);
    if (!backup) {
      console.log(`❌ [${pageKey}] 백업 데이터가 없음`);
      return false;
    }

    try {
      const formBackup = JSON.parse(backup);
      console.log(`🔍 [${pageKey}] 백업 데이터:`, formBackup);

      const expiryTime = expiryHours * 60 * 60 * 1000;
      const isRecent = Date.now() - formBackup.timestamp < expiryTime;
      const isCorrectPage = formBackup.page === pageKey;

      console.log(`🔍 [${pageKey}] 복원 조건:`, {
        isRecent,
        isCorrectPage,
        timeDiff: (Date.now() - formBackup.timestamp) / 1000 / 60, // 분 단위
        expiryHours,
      });

      if (isRecent && isCorrectPage && formRef?.value) {
        // 폼 데이터 복원
        let restoredCount = 0;
        Object.keys(formBackup).forEach((key) => {
          if (key !== 'timestamp' && key !== 'page' && key in formRef.value) {
            console.log(`🔄 복원: ${key} = ${formBackup[key]}`);
            formRef.value[key] = formBackup[key];
            restoredCount++;
          }
        });

        console.log(`✅ [${pageKey}] ${restoredCount}개 필드 복원 완료`);
        localStorage.removeItem(storageKey);
        return true;
      } else {
        console.log(`❌ [${pageKey}] 복원 조건 불충족`);
        localStorage.removeItem(storageKey);
        return false;
      }
    } catch (error) {
      console.error(`❌ [${pageKey}] 폼 데이터 복원 실패:`, error);
      localStorage.removeItem(storageKey);
      return false;
    }
  };

  // 백업 데이터 존재 여부 확인
  const hasValidBackup = () => {
    console.log('🔍 백업 데이터 존재 여부 확인');

    const backup = localStorage.getItem(storageKey);
    if (!backup) {
      console.log('❌ 백업 데이터 없음');
      return false;
    }

    try {
      const backupData = JSON.parse(backup);
      const expiryTime = expiryHours * 60 * 60 * 1000;
      const isRecent = Date.now() - backupData.timestamp < expiryTime;
      const isCorrectPage = backupData.page === pageKey;

      console.log('🔍 백업 유효성:', {
        isRecent,
        isCorrectPage,
        page: backupData.page,
        expectedPage: pageKey,
        ageMinutes: (Date.now() - backupData.timestamp) / 1000 / 60,
      });

      return isRecent && isCorrectPage;
    } catch (error) {
      console.error(`❌ [${pageKey}] 백업 데이터 파싱 오류:`, error);
      localStorage.removeItem(storageKey);
      return false;
    }
  };

  // 백업 데이터 삭제
  const clearBackup = () => {
    localStorage.removeItem(storageKey);
    console.log(`🗑️ [${pageKey}] 백업 데이터 삭제됨`);
  };

  // 폼에 데이터가 있는지 확인
  const hasFormData = () => {
    if (!formRef?.value) {
      console.log('❌ formRef 없음');
      return false;
    }

    const values = Object.values(formRef.value);
    const hasData = values.some((value) => value !== null && value !== '' && value !== undefined);

    console.log('🔍 폼 데이터 존재:', hasData);
    console.log(
      '🔍 비어있지 않은 필드들:',
      Object.entries(formRef.value)
        .filter(([key, value]) => value !== null && value !== '' && value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
    );

    return hasData;
  };

  // 제출 완료 여부 확인
  const isSubmitted = () => {
    if (!submittedKey) {
      console.log('🔍 제출 키가 설정되지 않음');
      return false;
    }

    const submitted = localStorage.getItem(submittedKey) === 'true';
    console.log(`🔍 제출 완료 여부 (${submittedKey}):`, submitted);
    return submitted;
  };

  // 🔥 강제 백업 함수 추가
  const forceBackupFormData = () => {
    console.log('🔥 강제 백업 실행');
    return backupFormData(true);
  };

  // 자동 백업 설정
  if (autoBackup) {
    console.log('🔧 자동 백업 설정됨');

    onBeforeUnmount(() => {
      console.log('🔍 페이지 이탈 감지 - 자동 백업 체크');

      const hasData = hasFormData();
      const submitted = isSubmitted();

      console.log('🔍 자동 백업 조건:', { hasData, submitted, forceBackup });

      // 🔥 forceBackup이 true이거나, 데이터가 있고 제출되지 않았을 때 백업
      if (hasData && (forceBackup || !submitted)) {
        console.log('✅ 자동 백업 실행');
        backupFormData(true); // 강제 백업
      } else {
        console.log('❌ 자동 백업 조건 불충족');
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
    forceBackupFormData, // 🔥 새로 추가
  };
}
