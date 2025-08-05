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
import { reactive, provide, Teleport } from "vue";
import Toast from "./Toast.vue";

const toasts = reactive([]);

function showToast(message, type = "info") {
  const id = Date.now() + Math.random();

  toasts.push({ id, message, type });

  setTimeout(() => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
  }, 2000);
}

provide("showToast", showToast);
</script>

<style scoped>
.toast-container {
  position: fixed;
  width: 100%;
  top: 5rem;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}
</style>
