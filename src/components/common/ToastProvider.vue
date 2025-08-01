<template>
  <teleport to="body">
    <div class="toast-container">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
      />
    </div>
  </teleport>
  <slot />
</template>

<script setup>
import { reactive, provide, Teleport } from 'vue';
import Toast from './Toast.vue';

const toasts = reactive([]);

function showToast(message, type = 'info') {
  const id = Date.now() + Math.random();
  console.log('🔥 toasts push:', { id, message, type });

  toasts.push({ id, message, type });

  setTimeout(() => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
  }, 3000);
}

provide('showToast', showToast);
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>
