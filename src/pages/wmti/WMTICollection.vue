<template>
  <div class="wmti-collection">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">WMTI 데이터를 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h3 class="error-title">데이터 로드 실패</h3>
      <p class="error-message">{{ error }}</p>
      <button class="retry-btn" @click="retryLoadData">다시 시도</button>
    </div>

    <!-- 메인 콘텐츠 -->
    <template v-else>
      <!-- 검색 및 필터 -->
      <section class="search-section">
        <div class="search-container">
          <div class="search-input-wrapper">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="예시): ABWC, 리더형 등"
              class="search-input"
            />
          </div>
          <div class="filter-buttons">
            <button
              v-for="category in categories"
              :key="category"
              :class="['filter-btn', { active: selectedCategory === category }]"
              @click="selectCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </section>

      <!-- WMTI 카드 리스트 -->
      <section class="wmti-grid">
        <div
          v-for="wmti in filteredWMTIList"
          :key="wmti.code"
          class="wmti-card"
          @click="selectWMTI(wmti)"
        >
          <div class="card-image">
            <img
              :src="`/src/assets/images/wmti-characters/${wmti.code}.png`"
              :alt="wmti.aka"
              class="character-image"
              @error="handleImageError"
            />
          </div>
          <div class="card-header">
            <div class="wmti-code" :style="getWMTICodeStyle(wmti.code)">
              {{ wmti.code }}
            </div>
            <div class="wmti-badge" :class="wmti.category?.toLowerCase()">
              {{ wmti.category }}
            </div>
          </div>
          <h3 class="wmti-name">{{ wmti.aka }}</h3>
          <p class="wmti-description">{{ wmti.shortDescription }}</p>
          <div class="characteristics">
            <span v-for="trait in (wmti.tag || []).slice(0, 3)" :key="trait" class="trait-tag">
              {{ trait }}
            </span>
          </div>
        </div>
      </section>

      <!-- 상세 모달 -->
      <div v-if="selectedWMTI" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <button class="close-btn" @click="closeModal">&times;</button>
            <div class="modal-character">
              <img
                :src="`/src/assets/images/wmti-characters/${selectedWMTI.code}.png`"
                :alt="selectedWMTI.aka"
                class="modal-character-image"
                @error="handleImageError"
              />
            </div>
            <div class="modal-wmti-info">
              <div class="modal-code" :style="getWMTICodeStyle(selectedWMTI.code)">
                {{ selectedWMTI.code }}
              </div>
              <h2 class="modal-name">{{ selectedWMTI.aka }}</h2>
              <div class="modal-badge" :class="selectedWMTI.category?.toLowerCase()">
                {{ selectedWMTI.category }}
              </div>
            </div>
          </div>

          <div class="modal-body">
            <div class="detail-section">
              <h3>특성 분석</h3>
              <p class="full-description">
                {{ selectedWMTI.fullDescription || selectedWMTI.description }}
              </p>
            </div>

            <div v-if="selectedWMTI.keyTraits || selectedWMTI.tag" class="detail-section">
              <h3>주요 특징</h3>
              <div class="traits-grid scrollabe-content">
                <span
                  v-for="trait in selectedWMTI.keyTraits || selectedWMTI.tag || []"
                  :key="trait"
                  class="trait-item"
                >
                  {{ trait }}
                </span>
              </div>
            </div>

            <div v-if="selectedWMTI.strengths" class="detail-section">
              <h3>강점</h3>
              <div class="scrollable-content">
                <ul class="strength-list">
                  <li v-for="strength in selectedWMTI.strengths" :key="strength">
                    {{ strength }}
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="selectedWMTI.improvements" class="detail-section">
              <h3>개선 포인트</h3>
              <div class="scrollable-content">
                <ul class="improvement-list">
                  <li v-for="point in selectedWMTI.improvements" :key="point">
                    {{ point }}
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="selectedWMTI.investmentStrategy" class="detail-section">
              <h3>추천 투자 전략</h3>
              <div class="scrollable-content">
                <p class="investment-strategy">{{ selectedWMTI.investmentStrategy }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getWMTICodesAPI } from '@/api/wmti.js';

// 반응형 데이터
const searchQuery = ref('');
const selectedCategory = ref('전체');
const selectedWMTI = ref(null);
const wmtiList = ref([]);
const categories = ref(['전체']);
const isLoading = ref(true);
const error = ref(null);

// WMTI 데이터 로드 함수
const loadWMTIData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // API에서 데이터 가져오기
    const response = await getWMTICodesAPI();

    // API 응답 구조: { header: {...}, body: { data: [...] } }
    const data = response.body?.data || response.data || response;

    // 배열인지 확인
    if (!Array.isArray(data)) {
      throw new Error('API 응답에서 배열 데이터를 찾을 수 없습니다.');
    }

    wmtiList.value = data;

    // tag 배열에서 카테고리 추출 (aka 필드 기반)
    const extractedData = data.map((item) => {
      const category = getCategoryFromTag(item.aka);

      return {
        ...item,
        category: category,
        shortDescription: item.tag?.[0] || '투자 성향을 나타내는 유형',
      };
    });

    wmtiList.value = extractedData;

    // 카테고리 목록 생성
    const uniqueCategories = [
      ...new Set(extractedData.map((item) => item.category).filter(Boolean)),
    ];
    categories.value = ['전체', ...uniqueCategories];
  } catch (err) {
    error.value = err.message || 'WMTI 데이터를 불러오는데 실패했습니다.';
    console.error('WMTI 데이터 로드 실패:', err);
  } finally {
    isLoading.value = false;
  }
};

// 태그에서 카테고리 추출 함수
const getCategoryFromTag = (firstTag) => {
  if (!firstTag) return '기타';

  const categoryMappings = {
    리더형: ['리더', '선도', '지도자'],
    전문가형: ['달인', '전문가', '박학다식'],
    트렌디형: ['트렌디', '예술인', '탐정가'],
    전략가형: ['전략', '연구가', '트렌디세터'],
    자신감형: ['자신감', '당당', '유능한'],
    현실주의형: ['현실', '아이콘', '노련한'],
    관찰가형: ['관찰가', '호기심', '새싹'],
    탐험가형: ['탐험가', '탐색가', '샛별'],
  };

  for (const [category, keywords] of Object.entries(categoryMappings)) {
    if (keywords.some((keyword) => firstTag.includes(keyword))) {
      return category;
    }
  }

  return '기타';
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadWMTIData();
});

// 계산된 속성
const filteredWMTIList = computed(() => {
  let filtered = wmtiList.value;

  // 카테고리 필터
  if (selectedCategory.value !== '전체') {
    filtered = filtered.filter((wmti) => wmti.category === selectedCategory.value);
  }

  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (wmti) =>
        wmti.code?.toLowerCase().includes(query) ||
        wmti.aka?.toLowerCase().includes(query) ||
        wmti.shortDescription?.toLowerCase().includes(query) ||
        wmti.tag?.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// 메서드
const selectCategory = (category) => {
  selectedCategory.value = category;
};

const selectWMTI = (wmti) => {
  selectedWMTI.value = wmti;
};

const closeModal = () => {
  selectedWMTI.value = null;
};

const retryLoadData = () => {
  loadWMTIData();
};

// WMTI 코드별 색상 매핑
const getWMTICodeStyle = (wmtiCode) => {
  const colorMap = {
    ABWC: ['#E74C3C', '#C0392B'], // 클래식 레드
    ABWL: ['#E67E22', '#D35400'], // 오렌지 레드
    ABMC: ['#DC7633', '#BA4A00'], // 번트 오렌지
    ABML: ['#CB4335', '#A93226'], // 딥 레드
    APWC: ['#FF6B6B', '#EE5A52'], // 코랄 레드
    APWL: ['#FF7675', '#FD79A8'], // 로즈 핑크
    APMC: ['#FD79A8', '#E84393'], // 핫 핑크
    APML: ['#E84393', '#D63031'], // 매젠타
    IBWC: ['#3498DB', '#2980B9'], // 스카이 블루
    IBWL: ['#5DADE2', '#3498DB'], // 라이트 블루
    IBMC: ['#2E86C1', '#2471A3'], // 오션 블루
    IBML: ['#21618C', '#1B4F72'], // 네이비 블루
    IPWC: ['#74B9FF', '#0984E3'], // 브라이트 블루
    IPWL: ['#81ECEC', '#00B894'], // 아쿠아
    IPMC: ['#00B894', '#00A085'], // 틸
    IPML: ['#00A085', '#006266'], // 다크 틸
  };

  const colors = colorMap[wmtiCode] || ['#6b7280', '#4b5563']; // 기본 회색
  return {
    background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
    color: '#ffffff',
  };
};

// 이미지 에러 핸들링
const handleImageError = (event) => {
  // 이미지 로드 실패시 기본 이미지로 대체
  event.target.src = '/src/assets/images/wmti-characters/default.png';
};
</script>

<style scoped>
.wmti-collection {
  max-width: 26.875rem;
  margin: 0 auto;
  min-height: 100vh;
}

/* 로딩 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.1875rem solid var(--color-bg-light);
  border-top: 0.1875rem solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--color-sub);
  font-size: 0.875rem;
}

/* 에러 스타일 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  color: var(--color-main);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-message {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.retry-btn {
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: var(--color-sub);
}

/* 검색 섹션 */
.search-section {
  background: var(--color-white);
  padding: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
}

.search-input-wrapper {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.5rem;
  font-size: 1rem;
  background: var(--color-bg-light);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-main);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem; /* 스크롤바 공간을 위해 패딩 증가 */
}

.filter-btn {
  padding: 0.5rem 1rem;
  border-radius: 1.25rem;
  background: var(--color-bg-light);
  color: var(--color-sub);
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--color-main);
  color: var(--color-white);
}

/* WMTI 그리드 */
.wmti-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.wmti-card {
  background: var(--color-white);
  padding: 1.25rem;
  border-radius: 0.75rem;
  box-shadow: 0 1.25rem 8rem rgba(45, 51, 107, 0.15);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.wmti-card:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
}

.card-image {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.character-image {
  width: 15rem;
  height: 15rem;
  object-fit: cover;
  border-radius: 50%;
  border: 0.1875rem solid var(--color-bg-light);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.wmti-code {
  font-size: 1rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  /* 동적 스타일은 JavaScript에서 적용 */
}

.wmti-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-white);
}

.wmti-badge.리더형 {
  background: #dc2626;
}
.wmti-badge.전문가형 {
  background: #2563eb;
}
.wmti-badge.트렌디형 {
  background: #059669;
}
.wmti-badge.전략가형 {
  background: #ea580c;
}
.wmti-badge.자신감형 {
  background: #7c3aed;
}
.wmti-badge.현실주의형 {
  background: #0891b2;
}
.wmti-badge.관찰가형 {
  background: #65a30d;
}
.wmti-badge.탐험가형 {
  background: #be185d;
}
.wmti-badge.기타 {
  background: #6b7280;
}

.wmti-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.wmti-description {
  color: var(--color-sub);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.characteristics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.trait-tag {
  background: var(--color-bg-light);
  color: var(--color-sub);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.modal-content {
  background: var(--color-white);
  border-radius: 1rem;
  width: 100%;
  max-width: 25rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  /* 모달 전체 스크롤 제거 */
  overflow: hidden;
}

.modal-header {
  background: var(--color-main);
  color: var(--color-white);
  padding: 1.5rem;
  border-radius: 1rem 1rem 0 0;
  position: relative;
  /* 헤더는 고정 */
  flex-shrink: 0;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  color: var(--color-white);
  font-size: 1.5rem;
  padding: 0.25rem;
  cursor: pointer;
}

.modal-character {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.modal-character-image {
  width: 6rem;
  height: 6rem;
  object-fit: cover;
  border-radius: 50%;
  border: 0.25rem solid rgba(255, 255, 255, 0.3);
}

.modal-wmti-info {
  text-align: center;
}

.modal-code {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  padding: 0.375rem 1rem;
  border-radius: 0.5rem;
  display: inline-block;
  /* 동적 스타일은 JavaScript에서 적용 */
}

.modal-name {
  font-size: 0.95rem; /* 크기 축소 */
  font-weight: 600;
  margin-bottom: 0.75rem;
  margin-left: 0.75rem;
  line-height: 1.2; /* 줄간격 조정 */
}

.modal-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem;
  /* 바디 부분에 스크롤 적용 */
  overflow-y: auto;
  flex: 1;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h3 {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  border-bottom: 0.125rem solid var(--color-bg-light);
  padding-bottom: 0.5rem;
}

/* 스크롤 가능한 콘텐츠 컨테이너 */
.scrollable-content {
  max-height: 12rem; /* 최대 높이 제한 */
  overflow-y: auto;
  padding-right: 0.25rem; /* 스크롤바 공간 */
}

.full-description {
  color: var(--color-sub);
  line-height: 1.6;
  font-size: 0.875rem;
}

.traits-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.trait-item {
  background: var(--color-bg-light);
  color: var(--color-main);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.strength-list,
.improvement-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.strength-list li,
.improvement-list li {
  padding: 0.5rem 0;
  border-bottom: 0.0625rem solid var(--color-bg-light);
  color: var(--color-sub);
  font-size: 0.875rem;
  line-height: 1.5;
  position: relative;
  padding-left: 1.25rem;
}

.strength-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: 600;
}

.improvement-list li::before {
  content: '!';
  position: absolute;
  left: 0;
  color: #f59e0b;
  font-weight: 600;
}

.strength-list li:last-child,
.improvement-list li:last-child {
  border-bottom: none;
}

.investment-strategy {
  background: var(--color-bg-light);
  padding: 1rem;
  border-radius: 0.5rem;
  color: var(--color-main);
  font-size: 0.875rem;
  line-height: 1.6;
  font-weight: 500;
  margin: 0;
}

/* 반응형 */
@media (max-width: 48rem) {
  .collection-header {
    padding: 1.5rem 1rem 1rem;
  }

  .title {
    font-size: 1.25rem;
  }

  .search-section {
    padding: 1rem;
  }

  .wmti-grid {
    padding: 1rem;
  }

  .wmti-card {
    padding: 1rem;
  }

  .modal-content {
    margin: 0.5rem;
    max-width: none;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }
}

/* 스크롤바 스타일링 - 모달 바디 */
.modal-body::-webkit-scrollbar {
  width: 0.375rem; /* 스크롤바 너비 증가 */
}

.modal-body::-webkit-scrollbar-track {
  background: var(--color-bg-light);
  border-radius: 0.25rem;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 0.25rem;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub);
}

/* 스크롤바 스타일링 - 개별 섹션 */
.scrollable-content::-webkit-scrollbar {
  width: 0.25rem;
}

.scrollable-content::-webkit-scrollbar-track {
  background: var(--color-bg-light);
  border-radius: 0.125rem;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 0.125rem;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub);
}

/* 스크롤바 스타일링 - 필터 버튼 */
.filter-buttons::-webkit-scrollbar {
  height: 0.5rem; /* 높이 크게 증가 */
}

.filter-buttons::-webkit-scrollbar-track {
  background: var(--color-bg-light);
  border-radius: 0.25rem;
}

.filter-buttons::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 0.25rem;
  min-width: 2rem; /* 최소 너비 설정 */
}

.filter-buttons::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub);
}
</style>
