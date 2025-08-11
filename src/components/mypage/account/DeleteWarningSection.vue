<template>
  <div class="warning-section">
    <div class="warning-icon">
      <i class="fas fa-exclamation-triangle"></i>
    </div>
    <div class="warning-content">
      <h3 class="warning-title">중요한 안내사항</h3>
      <p class="warning-desc">
        계정 탈퇴는 <strong>되돌릴 수 없는</strong> 작업입니다. 
        아래 내용을 신중히 검토한 후 진행해주세요.
      </p>
    </div>
  </div>
</template>

<script setup>
// 컴포넌트 로직 없음
</script>

<style scoped>
.warning-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, #fef3cd 0%, #fde68a 100%);
  border-bottom: 1px solid var(--color-bg-light);
}

.warning-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-title {
  color: var(--color-main);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.warning-desc {
  color: var(--color-sub);
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.warning-desc strong {
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 768px) {
  .warning-section {
    padding: 1.5rem;
  }

  .warning-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .warning-title {
    font-size: 1.1rem;
  }

  .warning-desc {
    font-size: 0.9rem;
  }
}
</style>