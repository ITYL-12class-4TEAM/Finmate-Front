<template>
  <div class="readonly-container">
    <div class="readonly-section">
      <div class="section-header">
        <h3 class="section-title">
          <i class="fas fa-lock"></i>
          기본 정보 (수정 불가)
        </h3>
      </div>

      <div v-if="userInfo" class="readonly-grid">
        <div class="readonly-item">
          <div class="readonly-icon">
            <i class="fas fa-user"></i>
          </div>
          <div class="readonly-content">
            <label class="readonly-label">닉네임</label>
            <div class="readonly-value">{{ userInfo.nickname || '-' }}</div>
          </div>
        </div>

        <div class="readonly-item">
          <div class="readonly-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="readonly-content">
            <label class="readonly-label">이메일</label>
            <div class="readonly-value">{{ userInfo.email || '-' }}</div>
          </div>
        </div>

        <div v-if="userInfo.phoneNumber" class="readonly-item">
          <div class="readonly-icon">
            <i class="fas fa-phone"></i>
          </div>
          <div class="readonly-content">
            <label class="readonly-label">휴대폰 번호</label>
            <div class="readonly-value">{{ userInfo.phoneNumber || '-' }}</div>
          </div>
        </div>

        <div class="readonly-item">
          <div class="readonly-icon">
            <i class="fas fa-birthday-cake"></i>
          </div>
          <div class="readonly-content">
            <label class="readonly-label">생년월일</label>
            <div class="readonly-value">
              {{ formatBirthDate(userInfo.birthDate) }}
            </div>
          </div>
        </div>

        <div class="readonly-item">
          <div class="readonly-icon">
            <i class="fas fa-venus-mars"></i>
          </div>
          <div class="readonly-content">
            <label class="readonly-label">성별</label>
            <div class="readonly-value">{{ userInfo.gender || '-' }}</div>
          </div>
        </div>
      </div>

      <div v-else class="loading-state">
        <div class="loading-spinner"></div>
        <span>사용자 정보를 불러오는 중...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  userInfo: {
    type: Object,
    default: () => ({}),
  },
});

// 생년월일 포맷팅
const formatBirthDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  } catch (error) {
    return '-';
  }
};
</script>

<style scoped>
.readonly-container {
  width: 100%;
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1rem;
  background-color: var(--color-white);
}

.readonly-section {
  padding: 1.5rem 0 2rem;
  margin-bottom: 1.5rem;
  border-bottom: 0.0625rem solid var(--color-bg-light); /* 1px → 0.0625rem */
}

.section-header {
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.02em;
}

.section-title i {
  font-size: 0.9rem;
  color: var(--color-sub);
}

.readonly-grid {
  display: grid;
  grid-template-columns: 1fr; /* 모바일에서는 1열로 표시 */
  gap: 0.75rem;
}

.readonly-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg-light);
  border-radius: 0.625rem; /* 10px → 0.625rem */
  transition: all 0.2s ease;
}

.readonly-item:hover {
  background: #f1f5f9;
}

.readonly-icon {
  width: 2.25rem; /* 36px → 2.25rem */
  height: 2.25rem;
  border-radius: 0.5rem; /* 8px → 0.5rem */
  background: var(--color-main);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 0.9rem;
  flex-shrink: 0;
}

.readonly-content {
  flex: 1;
}

.readonly-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 600;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.03125rem; /* 0.5px → 0.03125rem */
}

.readonly-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-main);
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.loading-state .loading-spinner {
  width: 1.5rem; /* 24px → 1.5rem */
  height: 1.5rem;
  border: 0.125rem solid var(--color-bg-light); /* 2px → 0.125rem */
  border-top: 0.125rem solid var(--color-main);
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

/* 모바일 최적화 - 작은 화면에서 패딩 조정 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .readonly-container {
    padding: 0.75rem;
  }

  .readonly-section {
    padding: 1rem 0 1.5rem;
    margin-bottom: 1rem;
  }

  .readonly-item {
    padding: 0.875rem;
  }

  .readonly-icon {
    width: 2.375rem; /* 38px → 2.375rem */
    height: 2.375rem;
    font-size: 0.9rem;
  }

  .readonly-value {
    font-size: 0.9rem;
  }
}
</style>
