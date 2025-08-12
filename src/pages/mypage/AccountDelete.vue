<template>
  <div class="delete-account">
    <!-- 경고 메시지 -->
    <DeleteWarningSection />

    <!-- 삭제될 데이터 목록 -->
    <DeleteDataSection />

    <!-- 탈퇴 확인 폼 -->
    <DeleteConfirmSection
      v-if="showConfirmation"
      :userInfo="userInfo"
      :confirmEmail="confirmEmail"
      :deleteReason="deleteReason"
      :additionalFeedback="additionalFeedback"
      :finalConfirm="finalConfirm"
      :emailError="emailError"
      :processing="processing"
      @update:confirmEmail="confirmEmail = $event"
      @update:deleteReason="deleteReason = $event"
      @update:additionalFeedback="additionalFeedback = $event"
      @update:finalConfirm="finalConfirm = $event"
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

  if (confirmEmail.value.toLowerCase().trim() !== userInfo.value.email.toLowerCase().trim()) {
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

// 최종 삭제 확인
const confirmFinalDeletion = async () => {
  processing.value = true;

  try {
    // 실제 API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));
    closeFinalModal();
    localStorage.clear();
    router.push('/');
    showToast('계정 탈퇴가 완료되었습니다.\n메인 페이지로 이동합니다.', 'success');
  } catch (error) {
    console.error('회원탈퇴 처리 오류:', error);
    showToast('회원탈퇴 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', 'error');
  } finally {
    processing.value = false;
  }
};

onMounted(() => {
  console.log('AccountDelete mounted');
  if (!authStore.isAuthenticated) {
    showToast('로그인이 필요합니다.', 'error');
    router.push('/login');
    return;
  }
});
</script>

<style scoped>
.delete-account {
  min-height: 100vh;
  background-color: var(--color-white);
  padding: 2rem 0;
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .delete-account {
    padding: 1rem 0;
  }
}
</style>
