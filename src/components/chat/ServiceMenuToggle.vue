<template>
  <div class="container-fluid px-0">
    <div class="menu-toggle-container">
      <button
        class="menu-toggle-btn"
        type="button"
        :class="{ active: showServiceMenu }"
        :aria-expanded="showServiceMenu"
        aria-label="서비스 메뉴 토글"
        @click="$emit('toggle')"
      >
        <!-- 버튼 컨텐츠 -->
        <div
          class="btn-content d-flex align-items-center justify-content-center gap-2 position-relative"
        >
          <!-- 아이콘 래퍼 -->
          <div class="icon-wrapper">
            <svg
              width="1.25rem"
              height="1.25rem"
              viewBox="0 0 24 24"
              fill="none"
              class="menu-icon"
              :class="{ rotated: showServiceMenu }"
            >
              <path
                v-if="!showServiceMenu"
                d="M3 12h18m-9-9v18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                v-else
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- 텍스트 -->
          <span class="btn-text">
            {{ showServiceMenu ? '서비스 닫기' : '서비스 열기' }}
          </span>

          <!-- 상태 인디케이터 -->
          <div class="status-indicator" :class="{ active: showServiceMenu }"></div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showServiceMenu: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['toggle']);
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
}

.menu-toggle-container {
  max-width: 25rem;
  margin: 0 auto;
  padding: 0.5rem;
}

.menu-toggle-btn {
  position: relative;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
  padding: 0.625rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.1);
  color: var(--color-main);
}

.menu-toggle-btn.active {
  background: var(--color-main);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.25);
  color: white;
}

/* 아이콘 래퍼 */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s ease;
}

.menu-toggle-btn.active .icon-wrapper {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.menu-icon {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-main);
}

.menu-toggle-btn.active .menu-icon {
  color: white;
  transform: scale(1.05);
}

.menu-icon.rotated {
  transform: rotate(180deg) scale(1.05);
}

/* 텍스트 */
.btn-text {
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  font-weight: 600;
}

/* 상태 인디케이터 */
.status-indicator {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
  background: var(--color-light);
  transition: all 0.4s ease;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.status-indicator.active {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  animation: pulse-dot 2s ease-in-out infinite;
}

/* 호버 효과 */
.menu-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(45, 51, 107, 0.15);
}

.menu-toggle-btn:hover .icon-wrapper {
  transform: scale(1.02);
}

/* 포커스 효과 */
.menu-toggle-btn:focus {
  outline: none;
  box-shadow:
    0 6px 25px rgba(45, 51, 107, 0.2),
    0 0 0 3px rgba(45, 51, 107, 0.3);
}

/* 액티브 상태 호버 */
.menu-toggle-btn.active:hover {
  background: var(--color-sub);
  box-shadow: 0 6px 25px rgba(45, 51, 107, 0.3);
}

/* 애니메이션 */
@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  }
  50% {
    transform: scale(1.2);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
  }
}

/* 반응형 */
@media (max-width: 576px) {
  .menu-toggle-container {
    max-width: 100%;
    padding: 0.375rem;
  }

  .menu-toggle-btn {
    padding: 0.5rem 0.875rem;
  }

  .btn-text {
    font-size: 0.65rem;
  }
}
</style>
