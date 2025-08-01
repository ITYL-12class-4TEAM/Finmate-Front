<template>
  <div class="main">
    <h1>Welcome to Finmate!</h1>
    <p>This is the main page.</p>
    <button @click="handleDelete">삭제하기</button>

    <button @click="handleSave">저장 완료</button>
    <button @click="handleError">에러 발생</button>
    <button @click="handleWarning">경고 발생</button>
    <router-link to="/this-page-does-not-exist">Go to not found</router-link>
  </div>
</template>

<script setup>
// 필요한 경우 script 코드 작성 가능
import { useModal } from '@/composables/useModal';
import { useToast } from '@/composables/useToast';

const { showModal } = useModal();
const { showToast } = useToast();

const handleDelete = async () => {
  const confirm = await showModal('정말 삭제하시겠습니까?');
  if (confirm) {
    // 확인 시 처리
    console.log('삭제 실행');
  } else {
    // 취소 시 처리
    console.log('삭제 취소');
  }
};

const handleSave = () => {
  showToast('저장되었습니다!', 'success');
};

const handleError = () => {
  showToast('저장에 실패했습니다.', 'error');
};

const handleWarning = () => {
  showToast('입력값을 확인해주세요.', 'warning');
};
</script>

<style scoped>
.main {
  padding: 2rem;
  text-align: center;
}
</style>
