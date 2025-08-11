<template>
  <div class="start-deletion">
    <div class="start-warning">
      <p>모든 내용을 확인하셨다면, 아래 버튼을 클릭하여 탈퇴 절차를 시작하세요.</p>
    </div>
    <div class="start-actions">
      <button type="button" class="start-button" @click="$emit('start')">
        <i class="fas fa-exclamation-triangle"></i>
        탈퇴 절차 시작
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start']);
</script>

<style scoped>
.start-deletion {
  padding: 2rem;
  text-align: center;
}

.start-warning {
  margin-bottom: 1.5rem;
}

.start-warning p {
  color: var(--color-sub);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.start-actions {
  display: flex;
  justify-content: center;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-button:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .start-deletion {
    padding: 1.5rem;
  }

  .start-button {
    width: 100%;
    justify-content: center;
  }
}
</style>