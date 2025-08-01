<template>
  <div class="login-layout">
    <div class="login-container">
      <router-view />
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.login-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: white;
  padding: 5rem 1.25rem 1.25rem 1.25rem; /* 80px 20px 20px 20px */
}

.login-container {
  background: white;
  padding: 2.5rem; /* 40px */
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.1); /* 0 4px 6px */
  width: 100%;
  max-width: 26.875rem; /* 430px */
}

/* 모바일 최적화 (375px 기준) */
@media (max-width: 30rem) {
  /* 480px */
  .login-layout {
    padding: 1.25rem 0.625rem; /* 20px 10px */
  }

  .login-container {
    padding: 1.875rem 1.25rem; /* 30px 20px */
    box-shadow: none; /* 모바일에서는 그림자 제거 */
  }
}

/* 작은 모바일 화면 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .login-layout {
    padding: 0.9375rem 0.5rem; /* 15px 8px */
  }

  .login-container {
    padding: 1.5rem 1rem; /* 24px 16px */
  }
}
</style>
