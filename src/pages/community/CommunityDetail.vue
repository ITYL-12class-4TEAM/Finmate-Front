<template>
  <div class="community-detail">
    <h1>게시물 상세</h1>
    <button @click="goToEditPage">수정</button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';

const cr = useRoute();
const router = useRouter();

const id = cr.params.id;

const goToEditPage = () => {
  router.push({ name: 'CommunityEdit', params: { id: id } });
};
</script>

<style scoped></style>
