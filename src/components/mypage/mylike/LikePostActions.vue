<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <span class="text-muted">총 {{ filteredCount }}개의 좋아요</span>
    <div class="d-flex align-items-center gap-3"></div>
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

<style scoped>
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
