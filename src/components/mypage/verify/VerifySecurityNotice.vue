<template>
  <div class="security-notice">
    <div class="notice-header">
      <div class="header-icon">
        <i class="fas fa-info-circle"></i>
      </div>
      <span class="header-text">보안 안내</span>
    </div>
    <div class="notice-content">
      <div class="notice-item">
        <div class="item-icon">
          <i class="fas fa-lock"></i>
        </div>
        <span>비밀번호는 암호화되어 안전하게 처리됩니다</span>
      </div>
      <div class="notice-item">
        <div class="item-icon">
          <i class="fas fa-user-shield"></i>
        </div>
        <span>본인 확인 후 회원정보를 안전하게 변경할 수 있습니다</span>
      </div>
      <div class="notice-item">
        <div class="item-icon">
          <i class="fas fa-key"></i>
        </div>
        <span>비밀번호를 잊으셨다면 비밀번호 찾기를 이용해주세요</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// 컴포넌트 로직 없음
</script>

<style scoped>
.security-notice {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.header-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
}

.header-text {
  color: var(--color-main);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}

.notice-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--color-sub);
  line-height: 1.5;
  font-weight: 500;
}

.item-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 0.7rem;
  flex-shrink: 0;
  margin-top: 1px;
}

@media (max-width: 768px) {
  .security-notice {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .notice-header {
    gap: 0.5rem;
    margin-bottom: 0.875rem;
  }

  .header-icon {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }

  .header-text {
    font-size: 0.85rem;
  }

  .notice-content {
    gap: 0.75rem;
  }

  .notice-item {
    font-size: 0.75rem;
    gap: 0.5rem;
  }

  .item-icon {
    width: 16px;
    height: 16px;
    font-size: 0.6rem;
  }
}
</style>
