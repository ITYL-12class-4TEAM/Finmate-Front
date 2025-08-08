<template>
  <div v-if="showServiceButtons" class="container-fluid px-0">
    <div class="service-container">
      <!-- 헤더 섹션 -->
      <div class="header-section mb-2">
        <div class="d-flex align-items-center justify-content-center gap-2">
          <div class="text-center">
            <h5 class="header-title mb-0">
              {{ isAuthenticated ? 'Service Hub' : 'Quick Access' }}
            </h5>
            <small class="header-subtitle">
              {{ isAuthenticated ? '모든 기능을 자유롭게' : '비회원 기능' }}
            </small>
          </div>
        </div>
      </div>

      <!-- 서비스 버튼 그리드 -->
      <div class="services-grid mb-2">
        <div
          v-for="(service, index) in availableServices"
          :key="`service-${service.id}`"
          class="service-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="handleServiceAction(service)"
        >
          <!-- 카드 컨텐츠 -->
          <div class="card-content position-relative text-center">
            <div class="service-icon-wrapper mb-2">
              <span class="service-icon">{{ service.icon }}</span>
            </div>
            <div class="service-text">{{ service.text }}</div>
          </div>
        </div>
      </div>

      <!-- 로그인 안내 카드 -->
      <div v-if="!isAuthenticated" class="login-guide-card">
        <!-- 카드 컨텐츠 -->
        <div class="guide-content position-relative">
          <!-- 헤더 -->
          <div class="guide-header text-center mb-2">
            <div class="guide-icon-wrapper mb-2">
              <span class="guide-icon">🔐</span>
            </div>
            <h6 class="guide-title mb-1">Premium Features</h6>
            <p class="guide-subtitle mb-0">로그인하면 더 많은 기능을 이용할 수 있어요!</p>
          </div>

          <!-- 프리미엄 기능 태그들 -->
          <div class="features-container mb-2">
            <div class="features-grid">
              <span v-for="feature in memberOnlyFeatures" :key="feature.id" class="feature-tag">
                {{ feature.icon }} {{ feature.text }}
              </span>
            </div>
          </div>

          <!-- 로그인 버튼 -->
          <button class="login-button w-100" @click="navigateToLogin">
            <div class="button-content d-flex align-items-center justify-content-center gap-2">
              <span class="button-text">로그인하고 시작하기</span>
              <div class="button-arrow">
                <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props 정의
const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  availableServices: {
    type: Array,
    default: () => [],
  },
  memberOnlyFeatures: {
    type: Array,
    default: () => [],
  },
});

// Emits 정의
const emit = defineEmits(['service-action', 'navigate-to-login']);

// 로컬 상태
const showServiceButtons = ref(true);

// 이벤트 핸들러
const handleServiceAction = (service) => {
  emit('service-action', service);
};

const navigateToLogin = () => {
  emit('navigate-to-login');
};
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
}

.service-container {
  max-width: 25rem;
  margin: 0 auto;
  padding: 0.5rem;
}

/* 헤더 섹션 */
.header-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.1);
}

.header-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.header-icon {
  font-size: 1.25rem;
  animation: gentle-float 3s ease-in-out infinite;
}

.header-title {
  font-size: 0.95rem !important;
  font-weight: 700;
  color: var(--color-main);
  line-height: 1.3;
}

.header-subtitle {
  font-size: 0.7rem !important;
  color: var(--color-sub);
  font-weight: 500;
}

/* 서비스 그리드 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.service-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  /* aspect-ratio: 1; 제거 */
  height: 4rem; /* 원하는 높이로 지정 */
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-3px) scale(1.02);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 30px rgba(45, 51, 107, 0.15);
}

.card-content {
  padding: 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.service-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.service-card:hover .service-icon-wrapper {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

.service-icon {
  font-size: 1rem;
  transition: all 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1);
}

.service-text {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.2;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 로그인 안내 카드 */
.login-guide-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.1);
}

.guide-content {
  padding: 1rem;
}

.guide-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.6);
  margin: 0 auto;
  animation: gentle-float 3s ease-in-out infinite;
}

.guide-icon {
  font-size: 1.5rem;
}

.guide-title {
  font-size: 0.9rem !important;
  font-weight: 700;
  color: var(--color-main);
  line-height: 1.3;
}

.guide-subtitle {
  font-size: 0.7rem;
  color: var(--color-sub);
  line-height: 1.4;
}

/* 기능 태그들 */
.features-container {
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  padding: 0.5rem;
}

.features-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  justify-content: center;
}

.feature-tag {
  background: var(--color-main);
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

/* 로그인 버튼 */
.login-button {
  background: var(--color-main);
  border: none;
  border-radius: 50px;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.2);
}

.login-button:hover {
  background: var(--color-sub);
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(45, 51, 107, 0.25);
}

.button-text {
  font-size: 0.7rem;
  letter-spacing: 0.02em;
}

.button-arrow {
  transition: transform 0.3s ease;
}

.login-button:hover .button-arrow {
  transform: translateX(3px);
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

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
