<template>
  <div class="service-menu-toggle">
    <button
      class="service-menu-btn"
      type="button"
      :class="{ active: showServiceMenu }"
      :aria-expanded="showServiceMenu"
      aria-label="서비스 메뉴 토글"
      @click="$emit('toggle')"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        :class="{ rotated: showServiceMenu }"
      >
        <path
          d="M4 6h16M4 12h16M4 18h16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <span>{{ showServiceMenu ? '메뉴 닫기' : '서비스 메뉴' }}</span>
    </button>
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
.service-menu-toggle {
  padding: 0 1rem;
  margin-bottom: 0.5rem;
}

.service-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem; /* 더 얇게 */
  background: linear-gradient(135deg, #f7f9fc, #eef1f8);
  border: 1.5px solid var(--color-light);
  border-radius: 9999px; /* 완전 pill 형태 */
  cursor: pointer;
  font-size: 0.8rem; /* 얇은 스타일에 맞는 크기 */
  font-weight: 500;
  color: var(--color-main);
  transition: all 0.3s ease;
  width: 100%;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
}

.service-menu-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -80%;
  width: 40%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  transform: skewX(-20deg);
  transition: left 0.5s ease-in-out;
}

.service-menu-btn:hover::before {
  left: 120%;
}

.service-menu-btn:hover,
.service-menu-btn.active {
  background: linear-gradient(135deg, var(--color-main), #7d8ef6);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(90, 106, 207, 0.3);
  transform: translateY(-1px);
}

.service-menu-btn svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
  color: inherit;
}

.service-menu-btn svg.rotated {
  transform: rotate(180deg);
}

.service-menu-btn:focus {
  outline: 2px solid rgba(90, 106, 207, 0.4);
  outline-offset: 3px;
}

@media (max-width: 768px) {
  .service-menu-toggle {
    padding: 0 0.75rem;
    margin-bottom: 0.4rem;
  }

  .service-menu-btn {
    font-size: 0.85rem;
    padding: 0.75rem 1rem;
    width: 100%;
  }
}
</style>
