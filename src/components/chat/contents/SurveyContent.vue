<template>
  <div class="survey-content">
    <p class="survey-title">📝 WMTI 투자 성향 테스트</p>
    <p class="survey-description">{{ message.text }}</p>
    <button
      @click="$emit('navigate-to-survey')"
      class="survey-btn"
      type="button"
    >
      <span class="survey-btn-icon">🧭</span>
      <span class="survey-btn-text">설문조사 시작하기</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        class="arrow-icon"
      >
        <path
          d="M5 12h14M12 5l7 7-7 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: Object,
});

defineEmits(['navigate-to-survey']);
</script>

<style scoped>
.survey-content {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(90, 106, 207, 0.1) 0%,
    rgba(154, 165, 208, 0.1) 100%
  );
  border-radius: 0.75rem; /* 12px */
  border: 0.0625rem solid rgba(90, 106, 207, 0.2); /* 1px */
  margin-bottom: 0.5rem;
}

.survey-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.survey-description {
  font-size: 0.6rem;
  color: var(--color-sub);
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.survey-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  color: var(--color-white);
  border: none;
  border-radius: 0.625rem; /* 10px */
  cursor: pointer;
  font-size: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 0.25rem 0.9375rem rgba(90, 106, 207, 0.3); /* 4px 15px */
  position: relative;
  overflow: hidden;
}

.survey-btn:hover {
  transform: translateY(-0.125rem); /* -2px */
  box-shadow: 0 0.375rem 1.25rem rgba(90, 106, 207, 0.4); /* 6px 20px */
}

.survey-btn-icon {
  font-size: 0.7rem;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.survey-btn-text {
  flex: 1;
  text-align: center;
  font-size: 0.7rem;
}

.arrow-icon {
  width: 0.75rem; /* 16px */
  height: 0.75rem;
  transition: transform 0.3s ease;
}

.survey-btn:hover .arrow-icon {
  transform: translateX(0.25rem); /* 4px */
}
</style>
