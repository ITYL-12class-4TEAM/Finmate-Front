<template>
  <div class="toast" :class="type">
    <p>🔥 {{ message || '메시지가 없습니다' }}</p>
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
    default: 'info',
  },
});

console.log('✅ Toast 렌더링:', props.message, props.type);
</script>

<style scoped>
.toast {
  padding: 0.75rem 1.2rem;
  border-radius: 6px;
  margin-top: 0.5rem;
  color: white;
  font-weight: 500;
  background-color: #4a4a4a;
  animation: fadeInOut 3s forwards;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background-color: #28a745;
}

.toast.error {
  background-color: #dc3545;
}

.toast.warning {
  background-color: #dcc335;
}

.toast.info {
  background-color: #17a2b8;
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
