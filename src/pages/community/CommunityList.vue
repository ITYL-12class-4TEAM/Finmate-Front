<template>
  <div>
    <BaseButton text="게시글 작성" @click="goToWritePage" />
    <h1>커뮤니티 목록</h1>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();

const goToWritePage = () => {
  router.push({ name: 'CommunityWrite' });
};
</script>
