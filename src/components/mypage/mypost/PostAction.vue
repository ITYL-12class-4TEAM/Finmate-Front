<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <span class="text-muted">총 {{ filteredCount }}건의 게시글</span>
  </div>
</template>

<script setup>
defineProps({
  filteredCount: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped></style>
