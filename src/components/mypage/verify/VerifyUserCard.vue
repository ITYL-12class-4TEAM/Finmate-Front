<template>
  <div class="user-info-section">
    <div v-if="userInfo" class="user-header">
      <div class="user-avatar">
        <img
          v-if="userInfo.profileImage"
          :src="userInfo.profileImage"
          :alt="userInfo.nickname || '사용자'"
        />
        <div v-else class="avatar-placeholder">
          {{ getInitials(userInfo.nickname) }}
        </div>
      </div>
      <div class="user-details">
        <div class="user-name">{{ userInfo.nickname || '사용자' }}</div>
        <div class="user-email">{{ userInfo.email || '' }}</div>
        <div class="verification-badge">
          <i class="fas fa-shield-alt"></i>
          <span>본인 확인 필요</span>
        </div>
      </div>
    </div>
    <div v-else class="loading-state">
      <div class="loading-spinner"></div>
      <span>사용자 정보를 불러오는 중...</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
});

const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};
</script>

<style scoped>
.user-info-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-start;
}

.user-avatar {
  position: relative;
  flex-shrink: 0;
}

.user-avatar img,
.avatar-placeholder {
  width: 4rem;
  height: 4rem;
  border-radius: 16px;
  object-fit: cover;
}

.avatar-placeholder {
  background: var(--color-main);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.user-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
  word-break: break-word;
  line-height: 1.2;
}

.user-email {
  font-size: 0.9rem;
  color: var(--color-sub);
  font-weight: 500;
  margin-bottom: 0.75rem;
  word-break: break-all;
  line-height: 1.2;
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3cd;
  color: #b45309;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.verification-badge i {
  font-size: 0.75rem;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
}

.loading-state .loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f1f5f9;
  border-top: 2px solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-state span {
  font-size: 0.85rem;
  color: var(--color-sub);
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .user-info-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .user-header {
    gap: 0.75rem;
    flex-direction: row;
    align-items: center;
  }

  .user-avatar img,
  .avatar-placeholder {
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 12px;
  }

  .user-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .user-name {
    font-size: 1.125rem;
    line-height: 1.2;
  }

  .user-email {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }

  .verification-badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
