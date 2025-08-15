<template>
  <div class="password-verify">
    <div class="verify-container">
      <BackButton class="mb-3" />
      <!-- 사용자 정보 -->
      <!-- <VerifyUserCard :userInfo="userInfo" /> -->

      <!-- 비밀번호 입력 폼 -->
      <VerifyPasswordForm
        :current-password="currentPassword"
        :show-password="showPassword"
        :loading="loading"
        :has-error="hasError"
        :error-message="errorMessage"
        @update:password="currentPassword = $event"
        @toggle-visibility="togglePasswordVisibility"
        @clear-error="clearError"
        @submit="verifyPassword"
      />

      <!-- 보안 안내 -->
      <VerifySecurityNotice />

      <!-- 하단 링크 -->
      <VerifyBottomLinks :loading="loading" />
    </div>

    <!-- 성공 모달 -->
    <VerifySuccessModal
      v-if="showSuccessModal"
      @close="closeSuccessModal"
      @proceed="proceedToEdit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { memberAPI } from '../../api/member';
import { authAPI } from '../../api/auth';
import VerifyPasswordForm from '@/components/mypage/verify/VerifyPasswordForm.vue';
import VerifySecurityNotice from '@/components/mypage/verify/VerifySecurityNotice.vue';
import VerifyBottomLinks from '@/components/mypage/verify/VerifyBottomLinks.vue';
import VerifySuccessModal from '@/components/mypage/verify/VerifySuccessModal.vue';
import { useToast } from '@/composables/useToast';
import BackButton from '@/components/common/BackButton.vue';

const router = useRouter();

// 반응형 데이터
const loading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const currentPassword = ref('');
const showPassword = ref(false);
const showSuccessModal = ref(false);
const { showToast } = useToast();

// 사용자 정보
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

onMounted(async () => {
  const response = await memberAPI.getMyInfo();

  if (response.success) {
    userInfo.value = response.data;

    if (response.data.socialType != 'none') {
      // 소셜 로그인 사용자 제외
      localStorage.setItem('passwordVerified', 'true');
      localStorage.setItem('verificationTime', Date.now().toString());

      router.push('/mypage/settings/edit');
      return;
    }
  } else {
    showToast('사용자 정보를 불러올 수 없습니다.', 'error');
  }
});

// 비밀번호 표시/숨김 토글
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// 에러 메시지 클리어
const clearError = () => {
  if (hasError.value) {
    hasError.value = false;
    errorMessage.value = '';
  }
};

// 비밀번호 확인
const verifyPassword = async () => {
  if (!currentPassword.value.trim()) {
    hasError.value = true;
    errorMessage.value = '비밀번호를 입력해주세요.';
    return;
  }

  loading.value = true;
  hasError.value = false;
  errorMessage.value = '';

  try {
    // 서버 요청 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const response = await authAPI.checkPassword(currentPassword.value);
    if (response.success) {
      localStorage.setItem('passwordVerified', 'true');
      localStorage.setItem('verificationTime', Date.now().toString());

      // 성공 모달 표시
      showSuccessModal.value = true;
    } else {
      hasError.value = true;
      errorMessage.value = '비밀번호가 일치하지 않습니다. 다시 확인해주세요.';
    }
  } catch (err) {
    hasError.value = true;
    errorMessage.value = '비밀번호 확인 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

// 성공 모달 닫기
const closeSuccessModal = () => {
  showSuccessModal.value = false;
  proceedToEdit();
};

// 수정 페이지로 이동
const proceedToEdit = () => {
  showSuccessModal.value = false;
  router.push('/mypage/settings/edit');
};
</script>

<style scoped>
.password-verify {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  background: var(--color-white);
  display: flex;
  align-items: center;
}

.verify-container {
  width: 100%;
}
</style>
