<template>
  <div class="stats-card">
    <div class="stats-header">
      <h5 class="stats-title">
        <i class="bi bi-stack me-2"></i>
        세부 카테고리 분포
      </h5>
      <small class="stats-subtitle"> 카테고리별 상세 구성 현황 </small>
    </div>

    <div class="stats-content">
      <div v-if="processedSummary.length > 0" class="subcategory-breakdown">
        <div
          v-for="category in processedSummary"
          :key="category.categoryName"
          class="category-group"
          :class="{ expanded: expandedCategories.has(category.categoryName) }"
        >
          <!-- 카테고리 헤더 -->
          <div
            class="category-header"
            @click="toggleCategory(category.categoryName)"
          >
            <div class="category-info">
              <div class="category-badge">
                <div
                  class="badge-color"
                  :style="{
                    backgroundColor: getCategoryColor(category.categoryName),
                  }"
                ></div>
                <span class="category-name">{{ category.categoryName }}</span>
                <span class="subcategory-count">
                  {{ category.subcategories.length }}개
                </span>
              </div>

              <div class="category-stats">
                <div class="category-total">
                  {{ formatCurrency(category.totalAmount) }}
                </div>
                <div class="category-ratio">
                  {{ category.ratio.toFixed(1) }}%
                </div>
              </div>
            </div>

            <div class="expand-indicator">
              <i
                :class="[
                  'bi',
                  expandedCategories.has(category.categoryName)
                    ? 'bi-chevron-up'
                    : 'bi-chevron-down',
                ]"
              ></i>
            </div>
          </div>

          <!-- 카테고리 진행률 바 -->
          <div class="category-progress">
            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{
                  width: category.ratio + '%',
                  backgroundColor: getCategoryColor(category.categoryName),
                }"
              ></div>
            </div>
          </div>

          <!-- 서브카테고리 리스트 (확장 가능) -->
          <div
            class="subcategory-list"
            :class="{
              collapsed: !expandedCategories.has(category.categoryName),
            }"
          >
            <div
              v-for="(sub, index) in category.subcategories"
              :key="sub.subcategoryName"
              class="subcategory-item"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="subcategory-info">
                <div
                  class="subcategory-indicator"
                  :style="{
                    backgroundColor: adjustColorOpacity(
                      getCategoryColor(category.categoryName),
                      0.6
                    ),
                  }"
                ></div>
                <span class="subcategory-name">{{ sub.subcategoryName }}</span>

                <!-- 서브카테고리 내 비율 표시 -->
                <div class="subcategory-ratio-bar">
                  <div
                    class="ratio-fill"
                    :style="{
                      width: sub.ratio + '%',
                      backgroundColor: adjustColorOpacity(
                        getCategoryColor(category.categoryName),
                        0.4
                      ),
                    }"
                  ></div>
                </div>
              </div>

              <div class="subcategory-values">
                <div class="subcategory-amount">
                  {{ formatCurrency(sub.totalAmount) }}
                </div>
                <div class="subcategory-percentage">
                  카테고리 내 {{ sub.ratio.toFixed(1) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="bi bi-stack"></i>
        </div>
        <p class="empty-text">분석할 카테고리가 없습니다.</p>
        <small class="empty-subtitle">투자 상품을 추가해주세요</small>
      </div>

      <!-- 요약 정보 -->
      <div v-if="processedSummary.length > 0" class="breakdown-summary">
        <div class="summary-item">
          <span class="summary-label">총 카테고리</span>
          <span class="summary-value">{{ processedSummary.length }}개</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">총 서브카테고리</span>
          <span class="summary-value">{{ getTotalSubcategories() }}개</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">가장 높은 비중</span>
          <span class="summary-value">{{ getHighestCategory() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  processedSummary: {
    type: Array,
    required: true,
    default: () => [],
  },
});

// 반응형 데이터
const expandedCategories = ref(new Set());

// FinMate 브랜드 색상 팔레트
const CATEGORY_COLORS = {
  예금: '#2d336b',
  적금: '#7d81a2',
  펀드: '#b9bbcc',
  대출: '#9ca0b8',
  보험: '#6b7394',
  연금: '#5a6085',
  투자: '#4a5578',
  기타: '#8a8ea6',
};

// 색상 가져오기
const getCategoryColor = (categoryName) => {
  return CATEGORY_COLORS[categoryName] || CATEGORY_COLORS['기타'];
};

// 색상 투명도 조절
const adjustColorOpacity = (color, opacity) => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// 통화 포맷팅
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '0원';

  // 1억 이상은 억 단위로 표시
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remainder = amount % 100000000;
    if (remainder === 0) {
      return `${eok}억원`;
    } else {
      const man = Math.floor(remainder / 10000);
      return `${eok}억 ${man}만원`;
    }
  }

  // 1만 이상은 만 단위로 표시
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    } else {
      return `${man}만 ${remainder.toLocaleString()}원`;
    }
  }

  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

// 카테고리 확장/축소 토글
const toggleCategory = (categoryName) => {
  if (expandedCategories.value.has(categoryName)) {
    expandedCategories.value.delete(categoryName);
  } else {
    expandedCategories.value.add(categoryName);
  }
};

// 총 서브카테고리 수 계산
const getTotalSubcategories = () => {
  return props.processedSummary.reduce(
    (total, category) => total + category.subcategories.length,
    0
  );
};

// 가장 높은 비중 카테고리
const getHighestCategory = () => {
  if (!props.processedSummary.length) return '-';

  const highest = props.processedSummary.reduce((max, current) =>
    current.ratio > max.ratio ? current : max
  );

  return `${highest.categoryName} (${highest.ratio.toFixed(1)}%)`;
};

// 초기 확장 상태 설정 (첫 번째 카테고리만 확장)
if (props.processedSummary.length > 0) {
  expandedCategories.value.add(props.processedSummary[0].categoryName);
}
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
  height: fit-content;
}

.stats-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
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

.subcategory-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 카테고리 그룹 */
.category-group {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.category-group:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.4);
}

/* 카테고리 헤더 */
.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.5);
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-right: 1rem;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge-color {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.category-header:hover .badge-color {
  transform: scale(1.1);
}

.category-name {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Pretendard', sans-serif;
}

.subcategory-count {
  color: var(--color-sub);
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(125, 129, 162, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.category-stats {
  text-align: right;
}

.category-total {
  color: var(--color-main);
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.category-ratio {
  color: var(--color-sub);
  font-size: 0.8rem;
  font-weight: 500;
}

.expand-indicator {
  color: var(--color-sub);
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.category-group.expanded .expand-indicator {
  transform: rotate(180deg);
}

/* 카테고리 진행률 바 */
.category-progress {
  padding: 0 1rem 1rem;
}

.progress-track {
  width: 100%;
  height: 6px;
  background: rgba(185, 187, 204, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease-out;
}

/* 서브카테고리 리스트 */
.subcategory-list {
  max-height: 500px;
  overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  opacity: 1;
}

.subcategory-list.collapsed {
  max-height: 0;
  opacity: 0;
}

.subcategory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  border-top: 1px solid rgba(185, 187, 204, 0.1);
  transition: all 0.3s ease;
  animation: slideInUp 0.4s ease-out;
}

.subcategory-item:hover {
  background: rgba(255, 255, 255, 0.7);
}

.subcategory-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.subcategory-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.subcategory-name {
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 500;
}

.subcategory-ratio-bar {
  flex: 1;
  height: 4px;
  background: rgba(185, 187, 204, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-left: 1rem;
}

.ratio-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s ease-out;
}

.subcategory-values {
  text-align: right;
}

.subcategory-amount {
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.subcategory-percentage {
  color: var(--color-sub);
  font-size: 0.75rem;
  font-weight: 500;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(185, 187, 204, 0.1) 0%,
    rgba(125, 129, 162, 0.1) 100%
  );
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-light) 0%,
    var(--color-sub) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-icon i {
  font-size: 1.5rem;
  color: white;
}

.empty-text {
  color: var(--color-main);
  font-weight: 600;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  color: var(--color-sub);
  font-size: 0.85rem;
  margin: 0;
}

/* 요약 정보 */
.breakdown-summary {
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
  flex-direction: column;
  gap: 0.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  color: var(--color-sub);
  font-size: 0.85rem;
  font-weight: 500;
}

.summary-value {
  color: var(--color-main);
  font-size: 0.85rem;
  font-weight: 600;
}

/* 애니메이션 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .stats-card {
    padding: 1rem;
  }

  .category-header {
    padding: 0.75rem;
  }

  .subcategory-item {
    padding: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .subcategory-info {
    width: 100%;
  }

  .subcategory-values {
    width: 100%;
    text-align: left;
  }

  .breakdown-summary {
    padding: 0.75rem;
  }
}
</style>
