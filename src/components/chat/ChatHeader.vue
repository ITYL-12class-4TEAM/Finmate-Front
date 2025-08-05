<template>
  <div class="chat-header">
    <div class="chat-title">
      <div class="status-dot"></div>
      <div class="title-content">
        <span class="main-title">FinMate 고객지원 챗봇</span>
        <span class="sub-title">💬 챗봇을 통해 궁금한 것을 물어보세요!</span>
      </div>
    </div>
    <button class="close-btn" type="button" @click="$emit('close')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineEmits(['close']);
</script>

<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-main);
  color: var(--color-white);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.main-title {
  font-size: 1rem;
  font-weight: 600;
}

.sub-title {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.9;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}
</style>
