<template>
  <div class="item-actions">
    <button class="detail-btn" :disabled="!product.externalLink" @click="handleViewDetail">
      <i class="fa-regular fa-eye"></i>
      상세보기
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, required: true },
});

const emit = defineEmits(['view-detail']);

const handleViewDetail = () => {
  if (props.product.externalLink) {
    emit('view-detail', props.product);
  }
};
</script>

<style scoped>
.item-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: var(--color-white);
  border: 1px solid #e2e8f0;
  color: var(--color-sub);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-btn:hover:not(:disabled) {
  background: var(--color-main);
  border-color: var(--color-main);
  color: var(--color-white);
}

.detail-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.detail-btn i {
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .item-actions {
    margin-top: 0.625rem;
    padding-top: 0.625rem;
  }

  .detail-btn {
    padding: 0.4375rem 0.875rem;
    font-size: 0.75rem;
  }

  .detail-btn i {
    font-size: 0.75rem;
  }
}
</style>
