<template>
  <div class="edit-profile">
    <div class="edit-container">
      <!-- 수정 불가능한 정보 -->
      <ProfileReadOnlySection :user-info="userInfo" />

      <!-- 수정 가능한 정보 -->
      <ProfileEditSection
        :edit-form="editForm"
        :user-info="userInfo"
        :change-password="changePassword"
        :show-new-password="showNewPassword"
        :checking-nickname="checkingNickname"
        :nickname-checked="nicknameChecked"
        :nickname-error="nicknameError"
        :password-error="passwordError"
        :confirm-password-error="confirmPasswordError"
        :loading="loading"
        :is-form-valid="isFormValid"
        @nickname-change="onNicknameChange"
        @check-nickname="checkNicknameAvailability"
        @password-change="onPasswordChange"
        @show-password="showNewPassword = $event"
        @validate-password="validatePassword"
        @submit="updateProfile"
        @update:receive-push-notification="updateNotificationSetting"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { memberAPI } from '../../api/member';
import { authAPI } from '../../api/auth';
import { useToast } from '../../composables/useToast';
import { useAuthStore } from '../../stores/useAuthStore';
import ProfileReadOnlySection from '@/components/mypage/profile/ProfileReadOnlySection.vue';
import ProfileEditSection from '@/components/mypage/profile/ProfileEditSection.vue';

const { showToast } = useToast();
const authStore = useAuthStore();
const router = useRouter();

// 반응형 데이터
const loading = ref(false);
const changePassword = ref(false);
const showNewPassword = ref(false);
const checkingNickname = ref(false);
const nicknameChecked = ref(false);
const nicknameError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

// 사용자 기본 정보 (수정 불가)
const userInfo = ref({
  username: '',
  nickname: '',
  email: '',
  profileImage: '',
  phoneNumber: '',
  birthDate: '',
  gender: '',
  receivePushNotification: false,
  createdAt: '',
  updatedAt: '',
});

// 수정 폼 데이터
const editForm = ref({
  nickname: '',
  newPassword: '',
  confirmPassword: '',
  receivePushNotification: false,
});

// 변경사항 추적을 위한 computed
const hasChanges = computed(() => {
  const nicknameChanged =
    editForm.value.nickname && editForm.value.nickname !== userInfo.value.nickname;
  const passwordChanged = changePassword.value;
  const notificationChanged =
    editForm.value.receivePushNotification !== userInfo.value.receivePushNotification;

  return nicknameChanged || passwordChanged || notificationChanged;
});

// 개선된 폼 유효성 검사
const isFormValid = computed(() => {
  if (!hasChanges.value) return false;

  // 닉네임 유효성 - 변경된 경우에만 중복확인 필요
  const nicknameValid =
    !editForm.value.nickname ||
    editForm.value.nickname === userInfo.value.nickname ||
    (nicknameChecked.value && !nicknameError.value);

  // 비밀번호 유효성 - 변경하려는 경우에만 검증
  const passwordValid =
    !changePassword.value ||
    (editForm.value.newPassword &&
      editForm.value.confirmPassword &&
      !passwordError.value &&
      !confirmPasswordError.value);

  return nicknameValid && passwordValid;
});

// 닉네임 변경 감지 - 디바운싱 추가
const onNicknameChange = (newNickname) => {
  editForm.value.nickname = newNickname;
  nicknameChecked.value = false;
  nicknameError.value = '';

  // 기존 닉네임과 같으면 즉시 처리
  if (newNickname === userInfo.value.nickname) {
    nicknameError.value = '현재 닉네임과 동일합니다.';
  }
};

// 알림 설정 업데이트
const updateNotificationSetting = (value) => {
  editForm.value.receivePushNotification = value;
};

// 비밀번호 관련 변경 처리 - 개선된 타입 안정성
const onPasswordChange = (value, type) => {
  if (typeof value === 'boolean') {
    // 체크박스 토글
    changePassword.value = value;
    if (!value) {
      resetPasswordFields();
    }
  } else if (typeof value === 'string') {
    // 비밀번호 입력값 변경
    if (type === 'newPassword') {
      editForm.value.newPassword = value;
    } else if (type === 'confirmPassword') {
      editForm.value.confirmPassword = value;
    }
  }
};

// 비밀번호 필드 초기화
const resetPasswordFields = () => {
  editForm.value.newPassword = '';
  editForm.value.confirmPassword = '';
  passwordError.value = '';
  confirmPasswordError.value = '';
  showNewPassword.value = false;
};

// 닉네임 중복확인 - 개선된 에러 처리
const checkNicknameAvailability = async () => {
  const nickname = editForm.value.nickname?.trim();
  if (!nickname) return;

  checkingNickname.value = true;
  nicknameError.value = '';
  nicknameChecked.value = false;

  try {
    // 프론트엔드 유효성 검사
    const validationError = validateNickname(nickname);
    if (validationError) {
      nicknameError.value = validationError;
      return;
    }

    // 기존 닉네임과 같은지 확인
    if (nickname === userInfo.value.nickname) {
      nicknameError.value = '현재 닉네임과 동일합니다.';
      return;
    }

    // 서버 중복확인
    const response = await memberAPI.checkNickname(nickname);
    if (response.success) {
      nicknameChecked.value = true;
    } else {
      nicknameError.value = response.message || '이미 사용 중인 닉네임입니다.';
    }
  } catch (error) {
    console.error('Nickname check error:', error);
    nicknameError.value = '중복확인 중 오류가 발생했습니다. 다시 시도해주세요.';
  } finally {
    checkingNickname.value = false;
  }
};

// 닉네임 유효성 검사 함수
const validateNickname = (nickname) => {
  const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,30}$/;

  if (!nickname) {
    return '닉네임을 입력해주세요.';
  }

  if (!nicknameRegex.test(nickname)) {
    return '2-30자의 한글, 영문, 숫자만 사용 가능합니다.';
  }

  return null;
};

// 비밀번호 유효성 검사 - 개선된 실시간 검증
const validatePassword = () => {
  if (!changePassword.value) return;

  const password = editForm.value.newPassword;
  const confirmPassword = editForm.value.confirmPassword;

  passwordError.value = '';
  confirmPasswordError.value = '';

  // 새 비밀번호 검증
  if (password) {
    const passwordValidation = validatePasswordStrength(password);
    if (passwordValidation) {
      passwordError.value = passwordValidation;
    }
  }

  // 비밀번호 확인 검증
  if (confirmPassword && password !== confirmPassword) {
    confirmPasswordError.value = '비밀번호가 일치하지 않습니다.';
  }
};

// 비밀번호 강도 검증 함수
const validatePasswordStrength = (password) => {
  if (!password) {
    return '비밀번호를 입력해주세요.';
  }

  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  if (!hasLetter || !hasNumber || !hasSpecial) {
    return '영문, 숫자, 특수문자를 모두 포함해야 합니다.';
  }

  return null;
};

// 개별 업데이트 함수들
const updateUserProfile = async () => {
  const profileData = {
    memberId: userInfo.value.memberId,
    nickname: editForm.value.nickname || userInfo.value.nickname,
    receivePushNotification: editForm.value.receivePushNotification,
  };

  const response = await memberAPI.updateProfile(profileData);

  if (!response.success) {
    throw new Error(response.message || '프로필 업데이트에 실패했습니다.');
  }

  return '회원정보가 성공적으로 수정되었습니다.';
};

const changeUserPassword = async () => {
  const username = userInfo.value.username || userInfo.value.email;
  if (!username) {
    throw new Error('사용자 정보가 올바르지 않습니다.');
  }

  const response = await authAPI.resetPassword(
    editForm.value.newPassword,
    editForm.value.confirmPassword,
    username
  );

  if (!response.success) {
    throw new Error(response.message || '비밀번호 변경에 실패했습니다.');
  }

  return '비밀번호가 성공적으로 변경되었습니다.';
};

// 업데이트 결과 처리
const handleUpdateResults = (results) => {
  const successResults = results.filter((r) => r.success);
  const failureResults = results.filter((r) => !r.success);

  if (successResults.length === results.length) {
    // 모든 작업 성공
    const message =
      results.length > 1
        ? '회원정보 및 비밀번호가 성공적으로 변경되었습니다.'
        : successResults[0].message;
    showToast(message, 'success');

    // 성공 시 폼 리셋 및 사용자 정보 새로고침
    authStore.refreshUser();
    resetForm();
  } else if (successResults.length > 0) {
    // 부분 성공
    showToast('일부 정보만 수정되었습니다. 실패한 항목을 다시 시도해주세요.', 'warning');
  } else {
    // 모든 작업 실패
    throw new Error(failureResults[0].message);
  }
};

// 메인 프로필 업데이트 함수 - 리팩토링
const updateProfile = async () => {
  validatePassword();

  if (!isFormValid.value) {
    showToast('입력 정보를 다시 확인해주세요.', 'error');
    return;
  }

  loading.value = true;

  try {
    const results = [];

    // 프로필 정보 업데이트
    const hasProfileChanges =
      (editForm.value.nickname && editForm.value.nickname !== userInfo.value.nickname) ||
      editForm.value.receivePushNotification !== userInfo.value.receivePushNotification;

    if (hasProfileChanges) {
      try {
        const message = await updateUserProfile();
        results.push({ success: true, message });
      } catch (error) {
        results.push({ success: false, message: error.message });
      }
    }

    // 비밀번호 변경
    if (changePassword.value && editForm.value.newPassword) {
      try {
        const message = await changeUserPassword();
        results.push({ success: true, message });
      } catch (error) {
        results.push({ success: false, message: error.message });
      }
    }

    // 결과 처리
    handleUpdateResults(results);
  } catch (error) {
    console.error('Profile update error:', error);
    showToast(error.message || '회원정보 수정 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

// 폼 리셋
const resetForm = () => {
  editForm.value.nickname = '';
  resetPasswordFields();
  changePassword.value = false;
  nicknameChecked.value = false;
  nicknameError.value = '';
  // 알림 설정은 원래 값으로 복원
  editForm.value.receivePushNotification = userInfo.value.receivePushNotification;
};

// 비밀번호 입력값 변경 시 실시간 검증
watch(
  () => editForm.value.newPassword,
  () => {
    if (changePassword.value && editForm.value.newPassword) {
      validatePassword();
    }
  }
);

watch(
  () => editForm.value.confirmPassword,
  () => {
    if (changePassword.value && editForm.value.confirmPassword) {
      validatePassword();
    }
  }
);

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  // 1. 비밀번호 인증 확인
  const verified = localStorage.getItem('passwordVerified');
  if (!verified) {
    showToast('비밀번호 확인이 필요합니다.', 'error');
    router.push('/mypage/verify-password');
    return;
  }

  // 2. 사용자 정보 조회
  try {
    const response = await memberAPI.getMyInfo();
    if (response.success && response.data) {
      userInfo.value = { ...response.data };

      // 3. 폼 초기값 설정
      editForm.value.receivePushNotification = response.data.receivePushNotification;
    } else {
      showToast('사용자 정보를 불러올 수 없습니다.', 'error');
      router.push('/mypage');
    }
  } catch (error) {
    console.error('Failed to load user info:', error);
    showToast('사용자 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    router.push('/mypage');
  }
});
</script>

<style scoped>
.edit-profile {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  background: var(--color-white);
  min-height: 100vh;
}

.edit-container {
  width: 100%;
}

/* 모바일 최적화 - 작은 화면에서 패딩 조정 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .edit-profile {
    padding: 0.75rem;
  }
}
</style>
