<template>
  <div class="delete-account">
    <!-- 경고 메시지 -->
    <DeleteWarningSection />

    <!-- 삭제될 데이터 목록 -->
    <DeleteDataSection />

    <!-- 탈퇴 확인 폼 -->
    <DeleteConfirmSection
      v-if="showConfirmation"
      :user-info="userInfo"
      :confirm-email="confirmEmail"
      :delete-reason="deleteReason"
      :additional-feedback="additionalFeedback"
      :final-confirm="finalConfirm"
      :email-error="emailError"
      :processing="processing"
      @update:confirm-email="confirmEmail = $event"
      @update:delete-reason="deleteReason = $event"
      @update:additional-feedback="additionalFeedback = $event"
      @update:final-confirm="finalConfirm = $event"
      @clear-email-error="clearEmailError"
      @proceed="proceedToDelete"
      @cancel="cancelDeletion"
    />

    <!-- 탈퇴 시작 버튼 -->
    <DeleteStartSection v-if="!showConfirmation" @start="startDeletion" />

    <!-- 최종 확인 모달 -->
    <DeleteFinalModal
      v-if="showFinalModal"
      :processing="processing"
      @close="closeFinalModal"
      @confirm="confirmFinalDeletion"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/stores/useAuthStore';
import DeleteWarningSection from '@/components/mypage/account/DeleteWarningSection.vue';
import DeleteDataSection from '@/components/mypage/account/DeleteDataSection.vue';
import DeleteConfirmSection from '@/components/mypage/account/DeleteConfirmSection.vue';
import DeleteStartSection from '@/components/mypage/account/DeleteStartSection.vue';
import DeleteFinalModal from '@/components/mypage/account/DeleteFinalModal.vue';

const { showToast } = useToast();
const authStore = useAuthStore();
const router = useRouter();

// 반응형 데이터
const showConfirmation = ref(false);
const showFinalModal = ref(false);
const processing = ref(false);

// 폼 데이터
const confirmEmail = ref('');
const deleteReason = ref('');
const additionalFeedback = ref('');
const finalConfirm = ref(false);

// 에러 상태
const emailError = ref('');

// 사용자 정보
const userInfo = ref({
  email: authStore.user?.email || 'test@example.com',
  nickname: authStore.user?.nickname || '사용자',
});

// 에러 클리어 함수
const clearEmailError = () => {
  emailError.value = '';
};

// 탈퇴 절차 시작
const startDeletion = () => {
  showConfirmation.value = true;
  setTimeout(() => {
    document.querySelector('.confirm-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 100);
};

// 탈퇴 취소
const cancelDeletion = () => {
  showConfirmation.value = false;
  resetForm();
};

// 폼 초기화
const resetForm = () => {
  confirmEmail.value = '';
  deleteReason.value = '';
  additionalFeedback.value = '';
  finalConfirm.value = false;
  emailError.value = '';
};

// 탈퇴 진행
const proceedToDelete = () => {
  emailError.value = '';

  if (!confirmEmail.value) {
    emailError.value = '이메일을 입력해주세요.';
    return;
  }

  if (confirmEmail.value.trim() !== userInfo.value.email.trim()) {
    emailError.value = '이메일이 일치하지 않습니다.';
    return;
  }

  if (!finalConfirm.value) {
    showToast('탈퇴 동의 사항을 확인해주세요.');
    return;
  }

  // 즉시 최종 모달 표시
  showFinalModal.value = true;
};

// 최종 모달 닫기
const closeFinalModal = () => {
  showFinalModal.value = false;
};

const confirmFinalDeletion = async () => {
  processing.value = true;

  try {
    const withdrawData = {
      username: userInfo.value.email,
      withdrawReason: deleteReason.value,
      agreeToWithdraw: finalConfirm.value,
    };

    const result = await authStore.withdraw(withdrawData);

    if (result.success) {
      closeFinalModal();
      showToast('계정 탈퇴가 완료되었습니다.\n메인 페이지로 이동합니다.', 'success');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      throw new Error(result.message || '회원탈퇴에 실패했습니다.');
    }
  } catch (error) {
    showToast(
      error.message || '회원탈퇴 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      'error'
    );
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    showToast('로그인이 필요합니다.', 'error');
    router.push('/login');
    return;
  }
  if (authStore.userInfo) {
    userInfo.value = {
      email: authStore.userInfo.email || '',
      nickname: authStore.userInfo.nickname || '',
    };
  }
});
</script>

<style scoped>
.delete-account {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--color-white);
  min-height: 100vh;
}

/* 모바일 최적화 - 작은 화면에서 패딩 조정 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .delete-account {
    padding: 0.75rem;
  }
}
</style>
