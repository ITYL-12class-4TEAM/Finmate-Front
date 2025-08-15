<template>
  <div class="bottom-links">
    <router-link to="/mypage" class="link-btn primary" :class="{ disabled: loading }">
      <i class="fas fa-arrow-left"></i>
      <span>마이페이지로 돌아가기</span>
    </router-link>
    <!-- <router-link to="/forgot-password" class="link-btn secondary" :class="{ disabled: loading }">
      <span>비밀번호 찾기</span>
    </router-link> -->
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
.bottom-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  letter-spacing: -0.01em;
}

.link-btn.primary {
  flex: 2;
  background: var(--color-main);
  color: white;
  border: none;
}

.link-btn.secondary {
  flex: 1;
  background: var(--color-white);
  color: var(--color-sub);
  border: 1px solid #e2e8f0;
}

.link-btn.primary:hover:not(.disabled) {
  background: #252968;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.25);
}

.link-btn.secondary:hover:not(.disabled) {
  background: #f8fafc;
  color: var(--color-main);
  border-color: var(--color-main);
}

.link-btn:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(45, 51, 107, 0.08);
}

.link-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.link-btn i {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.link-btn:hover:not(.disabled) i {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .bottom-links {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .link-btn {
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 0.8rem;
    border-radius: 8px;
  }

  .link-btn.primary {
    flex: none;
    order: 1;
  }

  .link-btn.secondary {
    flex: none;
    order: 2;
  }

  .link-btn i {
    font-size: 0.75rem;
  }
}
</style>
