<template>
  <div class="start-section">
    <p class="start-text">모든 내용을 확인하셨다면, 아래 버튼을 클릭하여 탈퇴 절차를 시작하세요.</p>
    <button type="button" class="btn-danger" @click="$emit('start')">
      <i class="fas fa-exclamation-triangle"></i>
      탈퇴 절차 시작
    </button>
  </div>
</template>

<script setup>
defineEmits(['start']);
</script>

<style scoped>
.start-section {
  padding: 2rem;
  text-align: center;
}

.start-text {
  color: var(--color-sub);
  font-size: 0.8rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.btn-danger i {
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .start-section {
    padding: 1.5rem;
  }

  .btn-danger {
    width: 100%;
    justify-content: center;
    padding: 1rem 2rem;
  }

  .start-text {
    font-size: 0.9rem;
  }
}
</style>
