<template>
  <div class="edit-profile">
    <div class="edit-container">
      <!-- 수정 불가능한 정보 -->
      <ProfileReadOnlySection :userInfo="userInfo" />

      <!-- 수정 가능한 정보 -->
      <ProfileEditSection
        :editForm="editForm"
        :userInfo="userInfo"
        :changePassword="changePassword"
        :showNewPassword="showNewPassword"
        :checkingNickname="checkingNickname"
        :nicknameChecked="nicknameChecked"
        :nicknameError="nicknameError"
        :passwordError="passwordError"
        :confirmPasswordError="confirmPasswordError"
        :loading="loading"
        :isFormValid="isFormValid"
        @nickname-change="onNicknameChange"
        @check-nickname="checkNicknameAvailability"
        @password-change="changePassword = $event"
        @show-password="showNewPassword = $event"
        @validate-password="validatePassword"
        @submit="updateProfile"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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
  nickname: '',
  email: '',
  profileImage: '',
  phoneNumber: '',
  birthDate: '',
  gender: '',
  receivePushNotification: '',
  createdAt: '',
  updatedAt: '',
});

// 수정 폼 데이터
const editForm = ref({
  nickname: '',
  newPassword: '',
  confirmPassword: '',
  receivePushNotification: true,
});

// 폼 유효성 검사
const isFormValid = computed(() => {
  let valid = true;

  // 닉네임이 변경되었다면 중복확인 필요
  if (editForm.value.nickname && editForm.value.nickname !== userInfo.value.nickname) {
    valid = valid && nicknameChecked.value && !nicknameError.value;
  }

  // 비밀번호 변경을 선택했다면 비밀번호 검증 필요
  if (changePassword.value) {
    valid =
      valid && editForm.value.newPassword && !passwordError.value && !confirmPasswordError.value;
  }

  return valid;
});

// 닉네임 변경 감지
const onNicknameChange = () => {
  nicknameChecked.value = false;
  nicknameError.value = '';
};

// 닉네임 중복확인
const checkNicknameAvailability = async () => {
  if (!editForm.value.nickname) return;

  checkingNickname.value = true;
  nicknameError.value = '';
  nicknameChecked.value = false;

  try {
    // 닉네임 유효성 검사
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,30}$/;
    if (!nicknameRegex.test(editForm.value.nickname)) {
      nicknameError.value = '2-30자의 한글, 영문, 숫자만 사용 가능합니다.';
      return;
    }

    // 기존 닉네임과 같은지 확인
    if (editForm.value.nickname === userInfo.value.nickname) {
      nicknameError.value = '현재 닉네임과 동일합니다.';
      return;
    }

    // 서버 요청 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await memberAPI.checkNickname(editForm.value.nickname);
    if (response.success) {
      nicknameChecked.value = true;
    } else {
      nicknameError.value = response.message;
    }
  } catch (err) {
    nicknameError.value = '중복확인 중 오류가 발생했습니다.';
  } finally {
    checkingNickname.value = false;
  }
};

// 비밀번호 유효성 검사
const validatePassword = () => {
  if (!changePassword.value) return;

  const password = editForm.value.newPassword;
  const confirmPassword = editForm.value.confirmPassword;

  passwordError.value = '';
  confirmPasswordError.value = '';

  if (password) {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      passwordError.value = '8자 이상의 영문, 숫자, 특수문자 조합이어야 합니다.';
    }
  }

  if (confirmPassword && password !== confirmPassword) {
    confirmPasswordError.value = '비밀번호가 일치하지 않습니다.';
  }
};

// 프로필 업데이트
const updateProfile = async () => {
  validatePassword();

  if (!isFormValid.value) {
    alert('입력 정보를 다시 확인해주세요.');
    return;
  }

  loading.value = true;

  try {
    // 1. 전송할 데이터 확인
    const profileData = {
      memberId: userInfo.value.memberId,
      nickname: editForm.value.nickname || userInfo.value.nickname,
      receivePushNotification: editForm.value.receivePushNotification,
    };

    // 2. 프로필 업데이트 API 호출
    const profileResponse = await memberAPI.updateProfile(profileData);

    if (!profileResponse.success) {
      throw new Error(`프로필 업데이트 실패: ${profileResponse.message}`);
    }

    // 3. 비밀번호 변경 (선택적)
    if (changePassword.value && editForm.value.newPassword) {
      const passwordResponse = await authAPI.resetPassword(
        editForm.value.newPassword,
        editForm.value.confirmPassword,
        userInfo.value.email
      );

      if (!passwordResponse.success) {
        throw new Error(`비밀번호 변경 실패: ${passwordResponse.message}`);
      }
    }

    // 4. 성공 처리
    showToast('회원정보가 성공적으로 수정되었습니다.', 'success');
    router.push('/');
    authStore.refreshUser();
    resetForm();
  } catch (error) {
    showToast(`회원정보 수정 중 오류가 발생했습니다: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

// 폼 리셋
const resetForm = () => {
  editForm.value.nickname = '';
  editForm.value.newPassword = '';
  editForm.value.confirmPassword = '';
  changePassword.value = false;
  showNewPassword.value = false;
  nicknameChecked.value = false;
  nicknameError.value = '';
  passwordError.value = '';
  confirmPasswordError.value = '';
};

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

    if (response.success) {
      userInfo.value = response.data;

      // 3. 폼 초기값 설정
      editForm.value.receivePushNotification = response.data.receivePushNotification;
      router.push('');
    } else {
      showToast('사용자 정보를 불러올 수 없습니다.', 'error');
    }
  } catch (error) {
    showToast('사용자 정보를 불러오는 중 오류가 발생했습니다.', 'error');
  }
});
</script>

<style scoped>
.edit-profile {
  min-height: 100vh;
  background: var(--color-white);
  padding: 2rem 1rem;
}

.edit-container {
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .edit-profile {
    padding: 1rem 0.5rem;
  }
}
</style>
