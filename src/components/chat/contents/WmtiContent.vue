<template>
  <div class="wmti-content">
    <div class="content-header" role="banner">
      <span class="header-icon" aria-hidden="true">🧭</span>
      <p class="content-title">WMTI 투자 성향 유형</p>
    </div>

    <div class="wmti-types" role="list">
      <div
        v-for="type in wmtiTypes"
        :key="type.code"
        :ref="(el) => (typeRefs[type.code] = el)"
        class="wmti-type"
        role="listitem"
        :aria-expanded="expandedTypes.includes(type.code)"
        tabindex="0"
        @click="handleClick(type.code)"
        @keydown.enter.prevent="handleClick(type.code)"
      >
        <div class="type-summary">
          <span class="type-code">{{ type.code }}</span>
          <span class="type-aka">{{ type.aka }}</span>
        </div>

        <transition name="fade">
          <div v-if="expandedTypes.includes(type.code)" class="type-detail">
            <p class="type-description">{{ type.description }}</p>
            <div class="type-features">
              <span v-for="feature in type.tag" :key="feature" class="feature-tag">
                {{ feature }}
              </span>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="wmti-footer">
      <button class="survey-btn" @click="goToSurvey">설문조사 하러가기 →</button>
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
  // 스크롤 이동
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
.wmti-content {
  max-width: 22.5rem; /* 원하는 최대 너비 유지 */
  margin-left: auto;
  margin-right: auto;
  padding-left: 0; /* 좌우 여백 제거 */
  padding-right: 0;
}
.content-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.header-icon {
  font-size: 1rem;
  font-weight: 900;
  color: #2d336b;
  user-select: none;
}

.content-title {
  font-weight: 900;
  font-size: 0.9rem;
  color: #2d336b;
  margin: 0;
  user-select: none;
}

.wmti-types {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  max-width: 100%;
  padding-left: 0;
  padding-right: 0;
  width: 100%;
  margin: 0;
}

.wmti-type {
  padding: 0.5rem 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #2d336b;
  border-radius: 14px;
  background: #f7f8fc;
  box-shadow: 0 2px 4px rgb(45 51 107 / 0.1);
  transition:
    box-shadow 0.3s ease,
    background-color 0.3s ease,
    transform 0.2s ease;
  user-select: none;
}

.wmti-type:hover,
.wmti-type:focus {
  box-shadow: 0 6px 15px rgb(45 51 107 / 0.3);
  background-color: #e6e9f7;
  transform: translateY(-2px);
  outline: none;
}
.wmti-types > .wmti-type:last-child {
  margin-bottom: 0;
}

.wmti-footer {
  margin-top: 0; /* 버튼 위 여백 제거 */
}

.type-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.type-code {
  display: inline-block;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 3px;
  font-size: 0.6rem;
  color: #fff;
  background-color: #2d336b;
  user-select: none;
  min-width: 48px;
  text-align: center;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 6px rgba(45, 51, 107, 0.6);
}

.type-aka {
  font-size: 0.7rem;
  color: #2d336b;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  max-width: 100%;
}

.type-detail {
  margin-top: 0.6rem;
  font-size: 0.55rem;
  color: #555a85;
  line-height: 1.4;
  font-weight: 500;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.type-description {
  margin-bottom: 0.6rem;
  white-space: pre-line;
  letter-spacing: 0.02em;
}

.type-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.feature-tag {
  font-size: 0.45rem;
  font-weight: 600;
  color: #2d336b;
  background-color: #c3c9e9;
  border-radius: 12px;
  padding: 0.15rem 0.6rem;
  user-select: none;
  cursor: default;
  white-space: nowrap;
  border: 1.5px solid transparent;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    color 0.25s ease;
  position: relative;
}

.feature-tag::before {
  content: '#';
  color: #364a96;
  margin-right: 0.15rem;
  font-weight: 700;
  position: relative;
  top: 1px;
}

.feature-tag:hover {
  background-color: #2d336b;
  color: #f0f0f5;
  border-color: #1a1f4a;
  box-shadow: 0 3px 8px rgba(45, 51, 107, 0.4);
}

.wmti-footer {
  margin-top: 0.5rem;
  text-align: center;
}

.survey-btn {
  margin-top: 0;
  margin-bottom: 0.2rem;
  padding: 0.4rem 1rem;
  background: #2d336b;
  color: white;
  border: none;
  border-radius: 9px;
  font-weight: 800;
  font-size: 0.6rem;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.survey-btn:hover {
  background: #23285a;
  transform: scale(1.05);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
