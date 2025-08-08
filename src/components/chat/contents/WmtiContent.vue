<template>
  <div class="container-fluid px-0">
    <div class="wmti-container">
      <!-- 헤더 섹션 -->
      <div class="header-card mb-3">
        <div class="row g-0 align-items-center">
          <div class="col">
            <h4 class="header-title mb-0">WMTI</h4>
            <small class="header-subtitle">투자 성향 16가지 타입</small>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
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
                        #{{ feature }}
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
      <!-- CTA 버튼 -->
      <div class="col-12 d-flex justify-content-center">
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

const goToSurvey = () => {
  window.location.href = 'http://localhost:5173/wmti/basic';
};
</script>

<style scoped>
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
}

.header-subtitle {
  font-size: 0.8125rem !important;
  color: #6b7280;
  font-weight: 400;
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

.card-content {
  padding: 0.7rem;
}

.type-badge {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  letter-spacing: 0.01em;
}

.type-name {
  font-size: 0.65rem;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.expand-icon {
  color: #9ca3af;
  transition: transform 0.25s ease;
}

.type-card.expanded .expand-icon {
  transform: rotate(180deg);
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
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  overflow: hidden;
  position: relative;
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
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #6366f1;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e0e7ff;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.hashtag:hover {
  background: #e0e7ff;
  color: #4f46e5;
  transform: scale(1.05);
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
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
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
  width: 100%;
  margin-top: 1rem;
}

.cta-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.button-text {
  color: #374151;
  text-align: center;
  flex: 1;
}

.button-arrow {
  transition: transform 0.3s ease;
}

.cta-button:hover .button-arrow {
  transform: translateX(2px);
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
</style>
