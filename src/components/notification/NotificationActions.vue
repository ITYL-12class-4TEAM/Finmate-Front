<template>
  <div class="notification-actions">
    <div class="actions-summary">
      <span class="summary-text">총 {{ filteredCount }}개의 알림</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  filteredCount: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
.notification-actions {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.notification-actions:hover {
  border-color: rgba(185, 187, 204, 0.4);
  box-shadow: 0 4px 12px -2px rgba(45, 51, 107, 0.15);
}

.actions-summary {
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(248, 249, 252, 0.5) 100%);
}

.summary-text {
  font-size: 1rem;
  color: var(--color-main);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-text::before {
  content: '📋';
  font-size: 1.1rem;
}
</style>
