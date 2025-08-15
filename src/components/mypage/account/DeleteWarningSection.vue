<template>
  <div class="warning-section">
    <div class="warning-header">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>회원탈퇴</h2>
    </div>
    <p class="warning-text">
      계정 탈퇴는 <strong>되돌릴 수 없는</strong> 작업입니다. 아래 내용을 신중히 검토한 후
      진행해주세요.
    </p>
  </div>
</template>

<script setup>
// 컴포넌트 로직 없음
</script>

<style scoped>
.warning-section {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-bg-light);
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.warning-header i {
  color: #dc2626;
  font-size: 1.2rem;
}

.warning-header h2 {
  color: var(--color-main);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.warning-text {
  color: var(--color-sub);
  font-size: 0.8rem;
  line-height: 1.6;
  margin: 0;
}

.warning-text strong {
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 768px) {
  .warning-section {
    padding: 1.5rem;
  }

  .warning-header i {
    font-size: 1.25rem;
  }

  .warning-header h2 {
    font-size: 1.25rem;
  }

  .warning-text {
    font-size: 0.9rem;
  }
}
</style>
