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
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
  --color-white: #ffffff;
}

.survey-container {
  width: 100%;
  padding: 0.2rem;
  margin-bottom: 0.5rem;
}

.survey-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1rem 1rem;
  color: #374151;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.survey-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
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
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.main-icon {
  font-size: 1.8rem;
  animation: gentle-float 3s ease-in-out infinite;
}

.survey-card:hover .main-icon {
  animation: sparkle-glow 1s ease-in-out infinite alternate;
}

.main-title {
  font-size: 1.25rem !important;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub-title {
  font-size: 0.875rem !important;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.description-text {
  font-size: 0.875rem !important;
  color: #4b5563;
  line-height: 1.5;
  font-weight: 400;
  max-width: 400px;
  margin: 0 auto;
}

/* Font Awesome 아이콘이 포함된 텍스트 스타일 */
.description-text :deep(.fas) {
  margin-right: 0.25rem;
  font-size: 0.8rem;
}

.cta-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(45, 51, 107, 0.1);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  color: var(--color-main);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  width: 100%;
  justify-content: center;
}

.cta-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: var(--color-sub);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(45, 51, 107, 0.2);
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
}

.cta-button:hover .button-arrow {
  transform: translateX(3px);
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
    transform: translateY(-3px);
  }
}

@keyframes sparkle-glow {
  0% {
    transform: translateY(-3px) scale(1);
    filter: brightness(1);
  }
  100% {
    transform: translateY(-6px) scale(1.1);
    filter: brightness(1.3);
  }
}

@keyframes arrow-pulse {
  0%,
  100% {
    transform: translateX(3px) scale(1);
  }
  50% {
    transform: translateX(6px) scale(1.1);
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
    transform: rotate(10deg) scale(1.1);
  }
}

@keyframes chart-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.1);
  }
}

@media (max-width: 360px) {
  .cta-button {
    padding: 0.5rem 1.5rem;
    font-size: 0.8rem;
    gap: 0.3rem;
  }

  .button-arrow {
    font-size: 0.75rem;
  }

  .main-title {
    font-size: 1.1rem !important;
  }

  .sub-title {
    font-size: 0.8rem !important;
  }
}
</style>
