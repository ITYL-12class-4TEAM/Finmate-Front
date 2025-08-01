<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <span class="text-muted">총 {{ count }}개의 댓글 작성글</span>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    required: true,
  },
});
</script>
