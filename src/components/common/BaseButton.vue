<template>
  <button class="base-button" :disabled="disabled">
    <slot>{{ text }}</slot>
  </button>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.base-button {
  background-color: var(--color-sub);
  color: white;
  border-radius: 10px;
  padding: 0.75rem 2rem;
  font-size: 16px;
  font-weight: 600;
  min-width: 240px;
  height: 48px;
  text-align: center;
  white-space: nowrap;
}

.base-button:hover {
  background-color: var(--color-light);
}

.base-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .base-button {
    width: 50%;
  }
}
</style>
