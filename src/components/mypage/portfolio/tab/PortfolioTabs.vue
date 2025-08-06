<template>
  <div class="tab-navigation mb-4">
    <div class="nav-container">
      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'overview' }"
            type="button"
            role="tab"
            @click="$emit('update:activeTab', 'overview')"
          >
            <span class="nav-text">개요</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'comparison' }"
            type="button"
            role="tab"
            @click="$emit('update:activeTab', 'comparison')"
          >
            <span class="nav-text">비교분석</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'allocation' }"
            type="button"
            role="tab"
            @click="$emit('update:activeTab', 'allocation')"
          >
            <span class="nav-text">자산분배</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            :class="{ active: activeTab === 'wmti' }"
            type="button"
            role="tab"
            @click="$emit('update:activeTab', 'wmti')"
          >
            <span class="nav-text">WMTI</span>
          </button>
        </li>
      </ul>
      <div class="tab-indicator" :style="indicatorStyle"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  activeTab: {
    type: String,
    required: true,
  },
});

defineEmits(['update:activeTab']);

// 활성 탭에 따른 인디케이터 위치 계산
const indicatorStyle = computed(() => {
  const tabs = ['overview', 'comparison', 'allocation', 'wmti'];
  const activeIndex = tabs.indexOf(props.activeTab);
  const translateX = activeIndex * 25; // 25% 간격

  return {
    transform: `translateX(${translateX * 4}%)`, // 100% / 4 = 25%
  };
});
</script>

<style scoped>
.tab-navigation {
  max-width: 26.875rem;
  width: 100%;
}

.nav-container {
  position: relative;
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  padding: 0.375rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow:
    0 2px 4px -1px rgba(45, 51, 107, 0.1),
    0 1px 2px -1px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(10px);
}

.nav-tabs {
  display: flex;
  justify-content: space-between;
  border-bottom: none;
  margin: 0;
  position: relative;
  z-index: 2;
}

.nav-tabs .nav-item {
  flex: 1;
  text-align: center;
}

.nav-tabs .nav-link {
  border: none;
  border-radius: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
  padding: 0.75rem 0.5rem;
  font-size: 0.8rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  background: transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.nav-tabs .nav-link i {
  font-size: 1rem;
  transition: all 0.3s ease;
}

.nav-text {
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-tabs .nav-link:hover {
  color: var(--color-main);
  transform: translateY(-1px);
}

.nav-tabs .nav-link:hover i {
  transform: scale(1.1);
}

.nav-tabs .nav-link.active {
  color: var(--color-main);
  background: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  box-shadow:
    0 2px 4px rgba(45, 51, 107, 0.1),
    0 1px 2px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(5px);
}

.nav-tabs .nav-link.active i {
  color: var(--color-main);
  transform: scale(1.1);
}

.nav-tabs .nav-link.active .nav-text {
  color: var(--color-main);
}

/* 슬라이딩 인디케이터 */
.tab-indicator {
  position: absolute;
  bottom: 0.375rem;
  left: 0.375rem;
  width: calc(25% - 0.1875rem);
  height: calc(100% - 0.75rem);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
  border-radius: 0.75rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow:
    0 2px 4px rgba(45, 51, 107, 0.1),
    0 1px 2px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .nav-tabs .nav-link,
  .tab-indicator {
    transition: none;
  }
}

/* 포커스 스타일 */
.nav-tabs .nav-link:focus-visible {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}
</style>
