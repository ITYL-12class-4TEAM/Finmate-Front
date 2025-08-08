<template>
  <div class="container-fluid px-0">
    <div class="survey-container">
      <!-- 메인 카드 -->
      <div class="survey-card">
        <div class="row g-0 align-items-center">
          <!-- 아이콘과 타이틀 섹션 -->
          <div class="col-12 text-center mb-3">
            <div class="icon-wrapper mb-2">
              <span class="main-icon">✨</span>
            </div>
            <h5 class="main-title mb-1">WMTI Check</h5>
            <small class="sub-title">나만의 투자 성향 찾기</small>
          </div>

          <!-- 설명 텍스트 -->
          <div class="col-12 mb-4">
            <p class="description-text text-center mb-0">{{ message.text }}</p>
          </div>

          <!-- CTA 버튼 -->
          <div class="col-12 text-center">
            <button class="cta-button" @click="$emit('navigate-to-survey')">
              <span class="button-text">테스트 시작하기</span>
              <svg class="button-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
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

.main-title {
  font-size: 1.25rem !important;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.sub-title {
  font-size: 0.875rem !important;
  color: #6b7280;
  font-weight: 500;
}

.description-text {
  font-size: 0.875rem !important;
  color: #4b5563;
  line-height: 1.5;
  font-weight: 400;
  max-width: 400px;
  margin: 0 auto;
}

.cta-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  padding: 0.75rem 2rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap; /* ✅ 추가 */
}

.cta-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.button-text {
  color: #374151;
}

.button-arrow {
  transition: transform 0.3s ease;
}

.cta-button:hover .button-arrow {
  transform: translateX(2px);
}

/* 애니메이션 */
@keyframes gentle-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
@media (max-width: 360px) {
  .cta-button {
    padding: 0.5rem 1.5rem;
    font-size: 0.8rem;
    gap: 0.3rem;
  }

  .button-arrow {
    width: 14px;
    height: 14px;
  }
}
</style>
