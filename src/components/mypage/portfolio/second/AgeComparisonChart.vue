<template>
  <div class="stats-card">
    <div class="stats-header">
      <h5 class="stats-title">
        <i class="bi bi-bar-chart me-2"></i>
        {{ userAgeGroup }} 평균과 비교
      </h5>
      <small class="stats-subtitle">
        동일 연령대 투자자들과의 자산 배분 비교
      </small>
    </div>

    <div class="stats-content">
      <!-- 비교 데이터가 있을 때 -->
      <div v-if="ageComparisonChart.length > 0" class="comparison-chart">
        <!-- 데스크톱/태블릿용 전체 목록 -->
        <div class="comparison-list desktop-list">
          <div
            v-for="category in ageComparisonChart"
            :key="category.name"
            class="comparison-item"
          >
            <div class="comparison-header">
              <span class="category-name">{{ category.name }}</span>
              <span class="difference-indicator">
                <small
                  :class="[
                    'difference-text',
                    category.difference >= 0 ? 'positive' : 'negative',
                  ]"
                >
                  <i
                    :class="
                      category.difference >= 0
                        ? 'bi bi-arrow-up'
                        : 'bi bi-arrow-down'
                    "
                    class="me-1"
                  ></i>
                  {{ Math.abs(category.difference).toFixed(1) }}%
                  {{ category.difference >= 0 ? '높음' : '낮음' }}
                </small>
              </span>
            </div>

            <div class="progress-comparison">
              <!-- 내 비율 -->
              <div class="progress-wrapper">
                <div class="progress my-progress">
                  <div
                    class="progress-bar my-bar"
                    :style="{ width: Math.min(category.my, 100) + '%' }"
                    :title="`나의 비율: ${category.my}%`"
                  ></div>
                </div>
                <span class="progress-label">
                  <span class="badge my-value"
                    >나: {{ category.my.toFixed(1) }}%</span
                  >
                </span>
              </div>

              <!-- 평균 비율 -->
              <div class="progress-wrapper">
                <div class="progress avg-progress">
                  <div
                    class="progress-bar avg-bar"
                    :style="{ width: Math.min(category.average, 100) + '%' }"
                    :title="`평균 비율: ${category.average}%`"
                  ></div>
                </div>
                <span class="progress-label">
                  <span class="badge avg-value">
                    평균: {{ category.average.toFixed(1) }}%
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 모바일용 탭 형태 -->
        <div class="comparison-tabs mobile-only">
          <div class="tab-buttons">
            <button
              v-for="(category, index) in ageComparisonChart"
              :key="category.name"
              :class="['tab-button', { active: activeTab === index }]"
              @click="activeTab = index"
            >
              <span class="tab-name">{{ category.name }}</span>
              <span
                :class="[
                  'tab-difference',
                  category.difference >= 0 ? 'positive' : 'negative',
                ]"
              >
                {{ category.difference >= 0 ? '+' : ''
                }}{{ category.difference.toFixed(1) }}%
              </span>
            </button>
          </div>

          <div class="tab-content">
            <div
              v-for="(category, index) in ageComparisonChart"
              :key="category.name"
              v-show="activeTab === index"
              class="tab-panel"
            >
              <div class="mobile-comparison-item">
                <h6 class="mobile-category-title">{{ category.name }}</h6>

                <div class="mobile-stats-grid">
                  <div class="mobile-stat">
                    <span class="mobile-stat-label">내 비율</span>
                    <span class="mobile-stat-value my-color"
                      >{{ category.my.toFixed(1) }}%</span
                    >
                  </div>
                  <div class="mobile-stat">
                    <span class="mobile-stat-label">또래 평균</span>
                    <span class="mobile-stat-value avg-color"
                      >{{ category.average.toFixed(1) }}%</span
                    >
                  </div>
                  <div class="mobile-stat difference-stat">
                    <span class="mobile-stat-label">차이</span>
                    <span
                      :class="[
                        'mobile-stat-value',
                        'difference-value',
                        category.difference >= 0 ? 'positive' : 'negative',
                      ]"
                    >
                      {{ category.difference >= 0 ? '+' : ''
                      }}{{ category.difference.toFixed(1) }}%
                    </span>
                  </div>
                </div>

                <div class="mobile-progress-comparison">
                  <div class="mobile-progress-item">
                    <span class="mobile-progress-label">나</span>
                    <div class="progress mobile-progress">
                      <div
                        class="progress-bar my-bar"
                        :style="{ width: Math.min(category.my, 100) + '%' }"
                      ></div>
                    </div>
                    <span class="mobile-progress-value"
                      >{{ category.my.toFixed(1) }}%</span
                    >
                  </div>
                  <div class="mobile-progress-item">
                    <span class="mobile-progress-label">평균</span>
                    <div class="progress mobile-progress">
                      <div
                        class="progress-bar avg-bar"
                        :style="{
                          width: Math.min(category.average, 100) + '%',
                        }"
                      ></div>
                    </div>
                    <span class="mobile-progress-value"
                      >{{ category.average.toFixed(1) }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 비교 데이터가 없을 때 -->
      <div v-else class="empty-comparison">
        <div class="empty-icon">
          <i class="bi bi-graph-up"></i>
        </div>
        <h6 class="empty-title">비교 데이터 없음</h6>
        <p class="empty-text">
          {{ userAgeGroup }} 또래의 비교 데이터를 준비 중입니다.
        </p>
        <small class="empty-subtitle">
          더 많은 사용자 데이터가 축적되면 정확한 비교 분석을 제공할 예정입니다.
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  // 사용자 나이대
  userAgeGroup: {
    type: String,
    required: true,
    default: '20대',
  },

  // 나이대별 비교 차트 데이터
  ageComparisonChart: {
    type: Array,
    required: true,
    default: () => [],
  },

  // 총 자산 규모 (추가)
  totalAmount: {
    type: Number,
    default: 0,
  },
});

// 모바일 탭 상태
const activeTab = ref(0);
</script>

<style scoped>
.stats-card {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 4px 6px -1px rgba(45, 51, 107, 0.1),
    0 2px 4px -1px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(45, 51, 107, 0.15);
}

.stats-header {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
}

.stats-title {
  color: var(--color-main);
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
}

.stats-title i {
  color: var(--color-sub);
}

.stats-subtitle {
  color: var(--color-sub);
  font-weight: 500;
  font-size: 0.85rem;
}

.stats-content {
  padding: 0;
}

/* 데스크톱 버전 */
.desktop-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comparison-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.comparison-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.4);
  transform: translateY(-1px);
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.category-name {
  font-weight: 600;
  color: var(--color-main);
  font-size: 0.95rem;
}

.progress-comparison {
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.progress-wrapper:last-child {
  margin-bottom: 0;
}

.progress {
  flex: 1;
  height: 10px;
  background-color: rgba(185, 187, 204, 0.2);
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}

.badge {
  padding: 0.35rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  white-space: nowrap;
}

.my-value {
  background: var(--color-main);
  color: white;
}

.avg-value {
  background: var(--color-sub);
  color: white;
}

.my-bar {
  background: linear-gradient(
    90deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  border-radius: 1rem;
  transition: width 1s ease-out;
  height: 100%;
}

.avg-bar {
  background: linear-gradient(90deg, var(--color-light) 0%, #9ca0b8 100%);
  border-radius: 1rem;
  transition: width 1s ease-out 0.2s;
  height: 100%;
}

.difference-text {
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.difference-text.positive {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
}

.difference-text.negative {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

/* 모바일 탭 버전 */
.mobile-only {
  display: none;
}

.tab-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(185, 187, 204, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.4);
}

.tab-button.active {
  background: var(--color-main);
  border-color: var(--color-main);
  color: white;
}

.tab-name {
  font-size: 0.8rem;
  font-weight: 600;
}

.tab-difference {
  font-size: 0.7rem;
  font-weight: 500;
}

.tab-button:not(.active) .tab-difference.positive {
  color: #059669;
}

.tab-button:not(.active) .tab-difference.negative {
  color: #dc2626;
}

.tab-button.active .tab-difference {
  color: rgba(255, 255, 255, 0.9);
}

.tab-content {
  min-height: 200px;
}

.mobile-comparison-item {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.mobile-category-title {
  color: var(--color-main);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
}

.mobile-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.mobile-stat {
  text-align: center;
  padding: 0.75rem 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.mobile-stat-label {
  display: block;
  font-size: 0.7rem;
  color: var(--color-sub);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.mobile-stat-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
}

.mobile-stat-value.my-color {
  color: var(--color-main);
}

.mobile-stat-value.avg-color {
  color: var(--color-sub);
}

.mobile-stat-value.difference-value.positive {
  color: #059669;
}

.mobile-stat-value.difference-value.negative {
  color: #dc2626;
}

.mobile-progress-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-progress-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-progress-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-main);
  min-width: 30px;
}

.mobile-progress {
  flex: 1;
  height: 8px;
}

.mobile-progress-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-sub);
  min-width: 40px;
  text-align: right;
}

/* 공통 스타일 */
.comparison-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(185, 187, 204, 0.1) 0%,
    rgba(125, 129, 162, 0.1) 100%
  );
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.message-icon {
  color: var(--color-sub);
  font-size: 1.1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-text {
  color: var(--color-main);
  font-weight: 500;
  line-height: 1.4;
  font-size: 0.9rem;
}

.empty-comparison {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    rgba(185, 187, 204, 0.1) 0%,
    rgba(125, 129, 162, 0.1) 100%
  );
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-light) 0%,
    var(--color-sub) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.empty-icon i {
  font-size: 1.25rem;
  color: white;
}

.empty-title {
  color: var(--color-main);
  font-weight: 600;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: var(--color-sub);
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.empty-subtitle {
  color: var(--color-sub);
  font-size: 0.8rem;
  opacity: 0.8;
}

.additional-stats {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: var(--color-sub);
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  color: var(--color-main);
  font-size: 0.85rem;
  font-weight: 600;
}

/* 반응형 처리 */
@media (max-width: 768px) {
  .desktop-list {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  .stats-card {
    padding: 1rem;
  }

  .additional-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .empty-comparison {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .tab-buttons {
    grid-template-columns: repeat(2, 1fr);
  }

  .mobile-stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .tab-button {
    padding: 0.6rem 0.4rem;
  }

  .tab-name {
    font-size: 0.75rem;
  }

  .tab-difference {
    font-size: 0.65rem;
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .my-bar,
  .avg-bar,
  .comparison-item,
  .tab-button {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .difference-text.positive,
  .tab-difference.positive {
    background: #059669;
    color: white;
  }

  .difference-text.negative,
  .tab-difference.negative {
    background: #dc2626;
    color: white;
  }
}
</style>
