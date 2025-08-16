<template>
  <div class="wmti-hero-card" :style="heroCardStyle">
    <div class="hero-decorations">
      <div class="decoration"></div>
      <div class="decoration"></div>
      <div class="decoration"></div>
    </div>

    <div class="hero-content">
      <h2 class="hero-title">{{ nickname }}</h2>

      <div class="hero-code">{{ wmtiCode }}</div>

      <!-- 캐릭터 이미지 섹션 -->
      <div class="character-section">
        <div class="character-container">
          <!-- 이미지가 있을 때 -->
          <img
            v-if="!imageError && characterImage"
            :src="characterImage"
            :alt="`${wmtiCode} 캐릭터`"
            class="character-image"
            @error="handleImageError"
          />
          <!-- 이미지가 없을 때 fallback -->
          <div v-else class="character-placeholder" :class="placeholderClass">
            <div class="placeholder-icon">
              {{ wmtiCode.charAt(0) }}
            </div>
            <div class="placeholder-text">{{ wmtiCode }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

// Props 정의
const props = defineProps({
  wmtiCode: {
    type: String,
    required: true,
    validator: (value) => value && value.length === 4,
  },
  nickname: {
    type: String,
    required: true,
  },
  characterImage: {
    type: String,
    default: '',
  },
});

// 이미지 에러 처리
const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
  console.warn(`캐릭터 이미지 로드 실패: ${props.wmtiCode}`);
};

// 플레이스홀더 스타일 클래스
const placeholderClass = computed(() => {
  // WMTI 코드 첫 글자에 따른 플레이스홀더 색상
  const firstChar = props.wmtiCode.charAt(0);
  const classMap = {
    A: 'placeholder-aggressive',
    I: 'placeholder-introverted',
  };
  return classMap[firstChar] || 'placeholder-default';
});

// 16개 WMTI 코드별 고유 그라데이션 색상
const gradientColors = computed(() => {
  const wmtiColorMap = {
    // A 시리즈 (적극적) - 빨강~주황 계열
    APML: ['#e74c3c', '#c0392b'], // 클래식 레드
    APMC: ['#e67e22', '#d35400'], // 오렌지 레드
    APWL: ['#dc7633', '#ba4a00'], // 번트 오렌지
    APWC: ['#cb4335', '#a93226'], // 딥 레드
    ABML: ['#ff6b6b', '#ee5a52'], // 코랄 레드
    ABMC: ['#ff7675', '#fd79a8'], // 로즈 핑크
    ABWL: ['#fd79a8', '#e84393'], // 핫 핑크
    ABWC: ['#e84393', '#d63031'], // 매젠타

    // I 시리즈 (내향적) - 파랑~청록 계열
    IPML: ['#3498db', '#2980b9'], // 스카이 블루
    IPMC: ['#5dade2', '#3498db'], // 라이트 블루
    IPWL: ['#2e86c1', '#2471a3'], // 오션 블루
    IPWC: ['#21618c', '#1b4f72'], // 네이비 블루
    IBML: ['#74b9ff', '#0984e3'], // 브라이트 블루
    IBMC: ['#81ecec', '#00b894'], // 아쿠아
    IBWL: ['#00b894', '#00a085'], // 틸
    IBWC: ['#00a085', '#006266'], // 다크 틸
  };

  const colors = wmtiColorMap[props.wmtiCode];

  if (colors) {
    return {
      primary: colors[0],
      secondary: colors[1],
      accent: colors[0],
    };
  }

  // 정의되지 않은 조합의 경우 WMTI 코드 기반으로 색상 생성
  const hashCode = props.wmtiCode.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const hue = Math.abs(hashCode) % 360;
  const saturation = 60 + (Math.abs(hashCode) % 40); // 60-100%
  const lightness1 = 45 + (Math.abs(hashCode) % 15); // 45-60%
  const lightness2 = 30 + (Math.abs(hashCode) % 15); // 30-45%

  return {
    primary: `hsl(${hue}, ${saturation}%, ${lightness1}%)`,
    secondary: `hsl(${hue}, ${saturation}%, ${lightness2}%)`,
    accent: `hsl(${hue}, ${saturation}%, ${lightness1}%)`,
  };
});

// 동적 스타일
const heroCardStyle = computed(() => ({
  background: `linear-gradient(135deg, ${gradientColors.value.primary} 0%, ${gradientColors.value.secondary} 100%)`,
}));
</script>

<style scoped>
.wmti-hero-card {
  border-radius: 1.5rem;
  padding: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.wmti-hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
    repeat;
  pointer-events: none;
}

/* 히어로 콘텐츠 */
.hero-content {
  position: relative;
  z-index: 2;
  padding: 1.5rem;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
}

.hero-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
  margin: 0;
  line-height: 1.1;
  text-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
}

.hero-code {
  font-size: 1.5rem;
  font-weight: 900;
  color: white;
  margin: 0;
  letter-spacing: 0.125rem;
  text-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.2);
  animation: glow 2s ease-in-out infinite alternate;
}

/* 캐릭터 섹션 */
.character-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.character-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-image {
  width: 7rem;
  height: rem;
  object-fit: cover;
  border-radius: 1rem;
  filter: drop-shadow(0 0.25rem 0.75rem rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(0.3125rem);
  border: 0.1875rem solid rgba(255, 255, 255, 0.2);
}

.character-image:hover {
  transform: scale(1.05);
}

/* 캐릭터 플레이스홀더 스타일 */
.character-placeholder {
  width: 9.5rem;
  height: 9.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  border: 0.1875rem solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(0.625rem);
}

.character-placeholder:hover {
  transform: scale(1.05);
}

.placeholder-icon {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.3);
  margin-bottom: 0.25rem;
}

.placeholder-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.0625rem;
}

/* 플레이스홀더 타입별 색상 */
.placeholder-aggressive {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.3), rgba(192, 57, 43, 0.3));
}

.placeholder-introverted {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.3), rgba(41, 128, 185, 0.3));
}

.placeholder-default {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
}

/* 장식 요소 */
.hero-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.decoration {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.decoration:nth-child(1) {
  width: 5rem;
  height: 5rem;
  top: -2.5rem;
  right: -2.5rem;
  animation-delay: 0s;
}

.decoration:nth-child(2) {
  width: 7.5rem;
  height: 7.5rem;
  bottom: -3.75rem;
  left: -3.75rem;
  animation-delay: 2s;
}

.decoration:nth-child(3) {
  width: 3.75rem;
  height: 3.75rem;
  top: 50%;
  right: -1.875rem;
  animation-delay: 4s;
}

/* 애니메이션 */
@keyframes glow {
  from {
    text-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.2);
  }
  to {
    text-shadow:
      0 0.25rem 0.5rem rgba(0, 0, 0, 0.2),
      0 0 1.25rem rgba(255, 255, 255, 0.3);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0rem) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-1.25rem) rotate(180deg);
    opacity: 1;
  }
}

/* 반응형 */
@media (max-width: 30rem) {
  .hero-title {
    font-size: 1.25rem;
  }

  .hero-code {
    font-size: 2rem;
    letter-spacing: 0.0625rem;
  }

  .hero-content {
    padding: 1.25rem;
    gap: 0.5rem;
  }

  .character-image,
  .character-placeholder {
    width: 7.5rem;
    height: 7.5rem;
  }

  .placeholder-icon {
    font-size: 2rem;
  }
}
</style>
