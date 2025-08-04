<template>
  <div class="toast" :class="type">
    {{ message }}
  </div>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "info",
  },
});
</script>

<style scoped>
.toast {
  position: relative;
  display: block;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  z-index: 999;
  pointer-events: auto;
  animation: fadeInOut 3s forwards;
}

.toast.success {
  background-color: #b2e5bf;
  color: #1e5631;
}

.toast.error {
  background-color: #f8c9c9;
  color: #912222;
}

.toast.warning {
  background-color: #fff3b0;
  color: #8a6d00;
}

.toast.info {
  background-color: #cce5ff;
  color: #004085;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  10%,
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
