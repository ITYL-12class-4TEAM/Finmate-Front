<template>
  <div class="container-fluid px-0">
    <div class="survey-container">
      <!-- 메인 카드 -->
      <div class="survey-card">
        <div class="row g-0 align-items-center">
          <!-- 아이콘과 타이틀 섹션 -->
          <div class="col-12 text-center mb-3">
            <div class="icon-wrapper mb-2">
              <i class="fas fa-sparkles main-icon" style="color: #ffc107"></i>
            </div>
            <h5 class="main-title mb-1">
              <i
                class="fas fa-poll"
                style="color: #4a90e2; margin-right: 0.5rem; font-size: 1.1rem"
              ></i>
              WMTI Check
            </h5>
            <small class="sub-title">
              <i
                class="fas fa-chart-line"
                style="color: #6b7280; font-size: 0.75rem; margin-right: 0.25rem"
              ></i>
              나만의 투자 성향 찾기
            </small>
          </div>

          <!-- 설명 텍스트 -->
          <div class="col-12 mb-4">
            <p class="description-text text-center mb-0" v-html="message.text"></p>
          </div>

          <!-- CTA 버튼 -->
          <div class="col-12 d-flex justify-content-center">
            <button class="cta-button" @click="$emit('navigate-to-survey')">
              <span class="button-text">
                <i class="fas fa-play" style="margin-right: 0.5rem; font-size: 0.75rem"></i>
                테스트 시작하기
              </span>
              <i class="fas fa-arrow-right button-arrow" style="font-size: 0.875rem"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: Object,
});

defineEmits(['navigate-to-survey']);
</script>
<style scoped>
.survey-container {
  width: 100%;
  max-width: 26.875rem; /* 430px / 16 */
  padding: 0.125rem; /* 2px / 16 */
  margin: 0 auto 0.375rem; /* 6px / 16 */
}

.survey-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(1.25rem); /* 20px / 16 */
  border: 0.0625rem solid rgba(255, 255, 255, 0.2); /* 1px / 16 */
  border-radius: 1rem; /* 16px / 16 */
  padding: 1rem; /* 16px / 16 */
  color: var(--color-main);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.1); /* 8px 32px / 16 */
  transition: all 0.3s ease;
}

.survey-card:hover {
  transform: translateY(-0.125rem); /* 2px / 16 */
  box-shadow: 0 0.75rem 2.5rem rgba(0, 0, 0, 0.15); /* 12px 40px / 16 */
  background: rgba(255, 255, 255, 0.15);
}

.survey-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  pointer-events: none;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem; /* 48px / 16 */
  height: 3rem; /* 48px / 16 */
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(0.625rem); /* 10px / 16 */
  border: 0.0625rem solid rgba(255, 255, 255, 0.3); /* 1px / 16 */
  margin-bottom: 0.75rem; /* 12px / 16 */
}

.main-icon {
  font-size: 1.5rem; /* 24px / 16 */
  animation: gentle-float 3s ease-in-out infinite;
}

.survey-card:hover .main-icon {
  animation: sparkle-glow 1s ease-in-out infinite alternate;
}

.main-title {
  font-size: 1.125rem !important; /* 18px / 16 */
  font-weight: 700;
  color: var(--color-main);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 0.25rem; /* 4px / 16 */
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.sub-title {
  font-size: 0.75rem !important; /* 12px / 16 */
  color: var(--color-sub);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  margin-bottom: 0.75rem; /* 12px / 16 */
}

.description-text {
  font-size: 0.75rem !important; /* 12px / 16 */
  color: var(--color-sub);
  line-height: 1.4;
  font-weight: 400;
  margin: 0 auto 1rem; /* 16px / 16 */
  text-align: center;
  max-width: 90%;
}

/* Font Awesome 아이콘이 포함된 텍스트 스타일 */
.description-text :deep(.fas) {
  margin-right: 0.25rem; /* 4px / 16 */
  font-size: 0.625rem; /* 10px / 16 */
}

.cta-button {
  background: rgba(255, 255, 255, 0.2);
  border: 0.125rem solid rgba(45, 51, 107, 0.1); /* 2px / 16 */
  border-radius: 2rem; /* 32px / 16 */
  padding: 0.75rem 1.25rem; /* 12px 20px / 16 */
  color: var(--color-main);
  font-size: 0.75rem; /* 12px / 16 */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(0.625rem); /* 10px / 16 */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem; /* 8px / 16 */
  white-space: nowrap;
  width: 100%;
  justify-content: center;
  max-width: 12rem; /* 192px / 16 */
}

.cta-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: var(--color-sub);
  transform: translateY(-0.0625rem); /* 1px / 16 */
  box-shadow: 0 0.25rem 0.9375rem rgba(45, 51, 107, 0.2); /* 4px 15px / 16 */
}

.button-text {
  color: var(--color-main);
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-arrow {
  transition: transform 0.3s ease;
  color: var(--color-main);
  font-size: 0.75rem; /* 12px / 16 */
}

.cta-button:hover .button-arrow {
  transform: translateX(0.1875rem); /* 3px / 16 */
  animation: arrow-pulse 0.6s ease-in-out;
}

.cta-button:hover .button-text .fas {
  animation: play-pulse 0.6s ease-in-out;
}

.d-flex {
  display: flex !important;
}

.justify-content-center {
  justify-content: center !important;
}

/* Font Awesome 아이콘 애니메이션 */
@keyframes gentle-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.1875rem); /* 3px / 16 */
  }
}

@keyframes sparkle-glow {
  0% {
    transform: translateY(-0.1875rem) scale(1); /* 3px / 16 */
    filter: brightness(1);
  }
  100% {
    transform: translateY(-0.375rem) scale(1.1); /* 6px / 16 */
    filter: brightness(1.3);
  }
}

@keyframes arrow-pulse {
  0%,
  100% {
    transform: translateX(0.1875rem) scale(1); /* 3px / 16 */
  }
  50% {
    transform: translateX(0.375rem) scale(1.1); /* 6px / 16 */
  }
}

@keyframes play-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 제목 아이콘 호버 효과 */
.survey-card:hover .main-title .fas {
  animation: poll-spin 1s ease-in-out;
}

.survey-card:hover .sub-title .fas {
  animation: chart-bounce 0.8s ease-in-out;
}

@keyframes poll-spin {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(0.625rem) scale(1.1); /* 10deg approximation */
  }
}

@keyframes chart-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-0.125rem) scale(1.1); /* 2px / 16 */
  }
}

/* 웹 환경 최적화 */
@media (min-width: 48rem) {
  /* 768px / 16 */
  .survey-container {
    max-width: 18.75rem; /* 300px / 16 */
  }

  .survey-card {
    padding: 0.875rem; /* 14px / 16 */
  }

  .icon-wrapper {
    width: 2.5rem; /* 40px / 16 */
    height: 2.5rem; /* 40px / 16 */
    margin-bottom: 0.625rem; /* 10px / 16 */
  }

  .main-icon {
    font-size: 1.25rem; /* 20px / 16 */
  }

  .main-title {
    font-size: 1rem !important; /* 16px / 16 */
    margin-bottom: 0.1875rem; /* 3px / 16 */
  }

  .sub-title {
    font-size: 0.6875rem !important; /* 11px / 16 */
    margin-bottom: 0.625rem; /* 10px / 16 */
  }

  .description-text {
    font-size: 0.6875rem !important; /* 11px / 16 */
    margin-bottom: 0.75rem; /* 12px / 16 */
  }

  .cta-button {
    font-size: 0.6875rem; /* 11px / 16 */
    padding: 0.625rem 1rem; /* 10px 16px / 16 */
    max-width: 10rem; /* 160px / 16 */
  }
}

/* 모바일 최적화 */
@media (max-width: 26.875rem) {
  /* 430px / 16 */
  .survey-container {
    max-width: 100%;
    padding: 0.25rem; /* 4px / 16 */
  }
}

@media (max-width: 22.5rem) {
  /* 360px / 16 */
  .survey-card {
    padding: 0.75rem; /* 12px / 16 */
  }

  .cta-button {
    padding: 0.625rem 1rem; /* 10px 16px / 16 */
    font-size: 0.6875rem; /* 11px / 16 */
    gap: 0.375rem; /* 6px / 16 */
    max-width: 10rem; /* 160px / 16 */
  }

  .button-arrow {
    font-size: 0.625rem; /* 10px / 16 */
  }

  .main-title {
    font-size: 1rem !important; /* 16px / 16 */
  }

  .sub-title {
    font-size: 0.6875rem !important; /* 11px / 16 */
  }
}
</style>
