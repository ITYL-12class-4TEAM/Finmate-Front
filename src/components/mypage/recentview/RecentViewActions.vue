<template>
  <div class="item-actions">
    <button
      @click="$emit('view-detail', product)"
      class="btn btn-outline-primary btn-sm"
      :disabled="!product.externalLink"
    >
      <i class="bi bi-eye me-1"></i>상세보기
    </button>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
});

defineEmits(['view-detail']);
</script>

<style scoped>
.item-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  flex: 1;
  min-width: 0;
}

@media (min-width: 576px) {
  .btn-sm {
    flex: none;
    min-width: auto;
  }
}
</style>
