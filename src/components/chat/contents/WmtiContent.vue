<template>
  <div class="container-fluid px-0">
    <div class="wmti-container">
      <!-- 헤더 섹션 -->
      <div class="header-card mb-3">
        <div class="row g-0 align-items-center">
          <div class="col">
            <h4 class="header-title mb-0">
              <i class="fas fa-compass" style="color: #4a90e2; margin-right: 0.5rem"></i>
              WMTI
            </h4>
            <small class="header-subtitle">
              <i
                class="fas fa-chart-pie"
                style="color: #6b7280; font-size: 0.7rem; margin-right: 0.25rem"
              ></i>
              투자 성향 16가지 타입
            </small>
          </div>
        </div>
      </div>

      <!-- 타입 리스트 -->
      <div class="types-grid">
        <div
          v-for="type in wmtiTypes"
          :key="type.code"
          :ref="(el) => (typeRefs[type.code] = el)"
          class="type-card"
          :class="{ expanded: expandedTypes.includes(type.code) }"
          @click="handleClick(type.code)"
        >
          <!-- 카드 컨텐츠 -->
          <div class="card-content position-relative">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span class="type-badge">{{ type.code }}</span>
                <span class="type-name">{{ type.aka }}</span>
              </div>
              <div class="expand-icon">
                <i class="fas fa-chevron-down" style="color: #9ca3af; font-size: 0.875rem"></i>
              </div>
            </div>

            <!-- 확장 컨텐츠 -->
            <transition name="slide-fade">
              <div v-if="expandedTypes.includes(type.code)" class="expanded-content mt-3">
                <p class="type-description">{{ type.description }}</p>

                <!-- 움직이는 해시태그 섹션 -->
                <div class="hashtag-container">
                  <div class="hashtag-scroll">
                    <div class="hashtag-track">
                      <span
                        v-for="(feature, index) in [...type.tag, ...type.tag]"
                        :key="`${feature}-${index}`"
                        class="hashtag"
                      >
                        <i
                          class="fas fa-hashtag"
                          style="font-size: 0.5rem; margin-right: 0.25rem"
                        ></i
                        >{{ feature }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';

const wmtiTypes = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchWmtiData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await fetch('/api/wmti/analysis/all');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    wmtiTypes.value = json.body.data.map((item) => ({
      code: item.code,
      aka: item.aka,
      tag: item.tag,
      description: item.description,
    }));
  } catch (e) {
    error.value = e.message || '데이터를 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWmtiData();
});

const expandedTypes = ref([]);

// 각 타입 DOM 요소 ref 저장용 객체
const typeRefs = {};

const toggleDetail = (code) => {
  if (expandedTypes.value.includes(code)) {
    expandedTypes.value = expandedTypes.value.filter((c) => c !== code);
  } else {
    expandedTypes.value.push(code);
  }
};

// 클릭 시 스크롤 이동 및 토글
const handleClick = (code) => {
  toggleDetail(code);
  const el = typeRefs[code];
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
  --color-white: #ffffff;
}

.wmti-container {
  max-width: 75vw;
  margin: 0 auto;
  padding: 0.5rem;
}

/* 헤더 카드 */
.header-card {
  /* padding: 1rem 0 0.5rem 0; */
}

.header-title {
  font-size: 1rem !important;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  display: flex;
  align-items: center;
}

.header-subtitle {
  font-size: 0.8125rem !important;
  color: #6b7280;
  font-weight: 400;
  display: flex;
  align-items: center;
}

/* 타입 그리드 */
.types-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-card {
  background: white;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.type-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e5e7eb;
}

.type-card:hover .expand-icon .fas {
  color: var(--color-main) !important;
  transform: scale(1.1);
}

.card-content {
  padding: 0.7rem;
}

.type-badge {
  background: var(--color-bg-light);
  color: var(--color-main);
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  letter-spacing: 0.01em;
  border: 1px solid var(--color-light);
}

.type-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.expand-icon {
  transition: transform 0.25s ease;
}

.expand-icon .fas {
  transition: all 0.25s ease;
}

.type-card.expanded .expand-icon {
  transform: rotate(180deg);
}

.type-card.expanded .expand-icon .fas {
  color: var(--color-main) !important;
}

/* 확장 컨텐츠 */
.expanded-content {
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
  margin-top: 0.75rem !important;
}

.type-description {
  font-size: 0.7rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  white-space: pre-line;
}

/* 움직이는 해시태그 컨테이너 */
.hashtag-container {
  background: var(--color-bg-light);
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(125, 129, 162, 0.2);
}

.hashtag-scroll {
  overflow: hidden;
  width: 100%;
  white-space: nowrap;
}

.hashtag-track {
  display: inline-flex;
  animation: scroll-left 35s linear infinite;
  gap: 1rem;
  align-items: center;
}

.hashtag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-main);
  background: white;
  border-radius: 1rem;
  border: 1px solid var(--color-light);
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.hashtag:hover {
  background: var(--color-light);
  color: var(--color-main);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.15);
}

.hashtag .fas {
  color: var(--color-sub);
}

/* 스크롤 애니메이션 */
@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 호버시 애니메이션 일시정지 */
.hashtag-container:hover .hashtag-track {
  animation-play-state: paused;
}

/* CTA 버튼 */
.cta-section {
  text-align: center;
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
  margin-top: 1rem;
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

/* Font Awesome 아이콘 애니메이션 */
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

/* 트랜지션 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 반응형 */
@media (max-width: 768px) {
  .wmti-container {
    max-width: 90vw;
  }

  .header-title {
    font-size: 0.9rem !important;
  }

  .header-subtitle {
    font-size: 0.75rem !important;
  }
}
</style>
