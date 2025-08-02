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
      <div class="comparison-chart">
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
                {{ Math.abs(category.difference) }}%
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

      <div class="comparison-message" v-if="comparisonMessage">
        <div class="message-icon">
          <i class="bi bi-lightbulb"></i>
        </div>
        <div class="message-content">
          <small class="message-text">{{ comparisonMessage }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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

  // 비교 분석 메시지
  comparisonMessage: {
    type: String,
    required: true,
    default: '',
  },
});
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

.comparison-chart {
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

.difference-indicator {
  text-align: right;
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

/* 빈 상태 처리 */
.comparison-chart:empty::after {
  content: '비교할 데이터가 없습니다.';
  display: block;
  text-align: center;
  color: var(--color-sub);
  font-style: italic;
  padding: 2rem;
}

/* 반응형 처리 */
@media (max-width: 480px) {
  .stats-card {
    padding: 1rem;
  }

  .comparison-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .progress-wrapper {
    gap: 0.5rem;
  }

  .progress-label {
    min-width: 70px;
    font-size: 0.7rem;
  }
}
</style>
