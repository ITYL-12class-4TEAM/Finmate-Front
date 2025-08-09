<template>
  <div class="theme-portfolios-page">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-content">
        <div class="back-button" @click="goBack">
          <div class="back-icon"></div>
        </div>
        <div class="header-text">
          <h1 class="page-title">테마-포트폴리오 모아보기</h1>
          <p class="page-description">다양한 투자 테마와 위험성향에 맞는 포트폴리오를 찾아보세요</p>
        </div>
      </div>
    </div>

    <!-- 필터 섹션 -->
    <div class="filter-section">
      <div class="filter-header">
        <div class="filter-icon"></div>
        <h3 class="filter-title">포트폴리오 필터</h3>
      </div>

      <div class="filter-controls">
        <!-- 위험성향 필터 -->
        <div class="filter-group">
          <label class="filter-label">위험성향</label>
          <div class="filter-options">
            <button
              v-for="risk in riskOptions"
              :key="risk.value"
              class="filter-option"
              :class="{ active: selectedRisk === risk.value }"
              @click="setRiskFilter(risk.value)"
            >
              {{ risk.label }}
            </button>
          </div>
        </div>

        <!-- 테마 카테고리 필터 -->
        <div class="filter-group">
          <label class="filter-label">테마 카테고리</label>
          <div class="filter-options">
            <button
              v-for="category in categoryOptions"
              :key="category.value"
              class="filter-option"
              :class="{ active: selectedCategory === category.value }"
              @click="setCategoryFilter(category.value)"
            >
              {{ category.label }}
            </button>
          </div>
        </div>

        <!-- 초기화 버튼 -->
        <div class="filter-actions">
          <button class="reset-button" @click="resetFilters">
            <div class="reset-icon"></div>
            필터 초기화
          </button>
        </div>
      </div>
    </div>

    <!-- 포트폴리오 결과 섹션 -->
    <div class="results-section">
      <div class="results-header">
        <div class="results-info">
          <span class="results-count">{{ filteredPortfolios.length }}개</span>
          <span class="results-text">의 포트폴리오</span>
        </div>
        <div class="sort-controls">
          <select v-model="sortOption" class="sort-select">
            <option value="name">이름순</option>
            <option value="risk-asc">위험도 낮은순</option>
            <option value="risk-desc">위험도 높은순</option>
            <option value="return">수익률순</option>
          </select>
        </div>
      </div>

      <!-- 포트폴리오 그리드 -->
      <div class="portfolios-grid">
        <div
          v-for="portfolio in sortedPortfolios"
          :key="portfolio.portfolioCode"
          class="portfolio-item"
          @click="selectPortfolio(portfolio)"
        >
          <!-- 포트폴리오 카드 헤더 -->
          <div class="portfolio-card-header">
            <div class="risk-badge" :class="getRiskBadgeClass(portfolio.themeName)">
              {{ getRiskLevel(portfolio.themeName) }}
            </div>
            <div class="portfolio-code-small">{{ portfolio.portfolioCode }}</div>
          </div>

          <!-- 포트폴리오 제목 -->
          <div class="portfolio-title">
            <h4 class="portfolio-name">{{ getPortfolioDisplayName(portfolio.themeName) }}</h4>
            <p class="portfolio-subtitle">{{ getPortfolioTheme(portfolio.themeName) }}</p>
          </div>

          <!-- 미니 차트 -->
          <div class="mini-chart-container">
            <canvas :ref-id="`mini-chart-${portfolio.portfolioCode}`" class="mini-chart"></canvas>
          </div>

          <!-- 포트폴리오 정보 -->
          <div class="portfolio-info">
            <div class="info-row">
              <span class="info-label">주요 자산</span>
              <span class="info-value">{{ getMainAssets(portfolio.composition) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">위험 수준</span>
              <div class="risk-indicator">
                <div
                  class="risk-bar"
                  :style="{ width: getRiskPercentage(portfolio.themeName) + '%' }"
                  :class="getRiskBarClass(portfolio.themeName)"
                ></div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="portfolio-actions">
            <button class="detail-button" @click.stop="viewDetail(portfolio)">
              <div class="detail-icon"></div>
              자세히 보기
            </button>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-if="filteredPortfolios.length === 0" class="empty-state">
        <div class="empty-icon"></div>
        <h3 class="empty-title">조건에 맞는 포트폴리오가 없습니다</h3>
        <p class="empty-description">다른 필터 조건을 시도해보세요</p>
        <button class="empty-action" @click="resetFilters">필터 초기화하기</button>
      </div>
    </div>

    <!-- 포트폴리오 상세 모달 -->
    <div v-if="selectedPortfolio" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedPortfolio.themeName }}</h3>
          <button class="close-button" @click="closeModal">
            <div class="close-icon"></div>
          </button>
        </div>

        <div class="modal-body">
          <!-- 차트 -->
          <div class="modal-chart-container">
            <canvas ref="modalChart" class="modal-chart"></canvas>
            <div class="modal-chart-center">
              <div class="center-text">
                <span class="center-title">자산배분</span>
                <span class="center-subtitle">Portfolio</span>
              </div>
            </div>
          </div>

          <!-- 자산 구성 -->
          <div class="modal-composition">
            <h4 class="composition-title">자산 구성</h4>
            <div class="composition-list">
              <div
                v-for="(asset, idx) in selectedPortfolio.composition"
                :key="idx"
                class="composition-item"
                :class="{ 'zero-percentage': asset.percentage === 0 }"
              >
                <div
                  class="composition-color"
                  :style="{
                    backgroundColor:
                      asset.percentage > 0 ? getAssetColor(asset.category) : '#BDC3C7',
                  }"
                ></div>
                <span class="composition-label">{{ asset.category }}</span>
                <span class="composition-value">{{ asset.percentage }}%</span>
              </div>
            </div>
          </div>

          <!-- 포트폴리오 특징 -->
          <div class="modal-features">
            <h4 class="features-title">포트폴리오 특징</h4>
            <div class="features-list">
              <div class="feature-item">
                <div class="feature-icon risk-icon"></div>
                <div class="feature-content">
                  <span class="feature-label">위험 수준</span>
                  <span class="feature-value">{{ getRiskLevel(selectedPortfolio.themeName) }}</span>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon theme-icon"></div>
                <div class="feature-content">
                  <span class="feature-label">투자 테마</span>
                  <span class="feature-value">{{
                    getPortfolioTheme(selectedPortfolio.themeName)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-action-button" @click="selectThisPortfolio">
            이 포트폴리오 선택하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import themePortfoliosData from '@/constants/themePortfolios.js';

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

// router
const router = useRouter();

// 상태
const portfolios = ref(themePortfoliosData);
const selectedRisk = ref('all');
const selectedCategory = ref('all');
const sortOption = ref('name');
const selectedPortfolio = ref(null);
const charts = ref({});
const modalChart = ref(null);

// 필터 옵션
const riskOptions = [
  { value: 'all', label: '전체' },
  { value: '안정형', label: '안정형' },
  { value: '안정추구형', label: '안정추구형' },
  { value: '위험중립형', label: '위험중립형' },
  { value: '적극투자형', label: '적극투자형' },
  { value: '공격투자형', label: '공격투자형' },
];

const categoryOptions = [
  { value: 'all', label: '전체' },
  { value: '자산배분', label: '자산배분' },
  { value: '배당', label: '배당' },
  { value: '가치투자', label: '가치투자' },
  { value: '글로벌', label: '글로벌' },
  { value: 'ESG', label: 'ESG' },
  { value: '섹터', label: '섹터별' },
  { value: '수퍼세이브', label: '안정투자' },
];

// 자산 색상
const assetColors = {
  국내채권: '#2ECC71',
  해외채권: '#3498DB',
  국내주식: '#E74C3C',
  선진주식: '#9B59B6',
  신흥주식: '#F39C12',
};

// 필터링된 포트폴리오
const filteredPortfolios = computed(() => {
  let filtered = portfolios.value;

  // 위험성향 필터
  if (selectedRisk.value !== 'all') {
    filtered = filtered.filter((portfolio) => portfolio.themeName.includes(selectedRisk.value));
  }

  // 카테고리 필터
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((portfolio) => {
      const themeName = portfolio.themeName;
      switch (selectedCategory.value) {
        case '자산배분':
          return (
            themeName.includes('자산배분') ||
            themeName.includes('영구') ||
            themeName.includes('사계절')
          );
        case '배당':
          return themeName.includes('배당');
        case '가치투자':
          return themeName.includes('가치주') || themeName.includes('바겐세일');
        case '글로벌':
          return (
            themeName.includes('글로벌') || themeName.includes('G2') || themeName.includes('캡틴')
          );
        case 'ESG':
          return themeName.includes('ESG');
        case '섹터':
          return (
            themeName.includes('IT시대') ||
            themeName.includes('대장주') ||
            themeName.includes('실물투자')
          );
        case '수퍼세이브':
          return themeName.includes('수퍼세이브') || themeName.includes('컬렉션');
        default:
          return true;
      }
    });
  }

  return filtered;
});

// 정렬된 포트폴리오
const sortedPortfolios = computed(() => {
  const sorted = [...filteredPortfolios.value];

  switch (sortOption.value) {
    case 'name':
      return sorted.sort((a, b) => a.themeName.localeCompare(b.themeName));
    case 'risk-asc':
      return sorted.sort((a, b) => getRiskScore(a.themeName) - getRiskScore(b.themeName));
    case 'risk-desc':
      return sorted.sort((a, b) => getRiskScore(b.themeName) - getRiskScore(a.themeName));
    case 'return':
      return sorted.sort((a, b) => getRiskScore(b.themeName) - getRiskScore(a.themeName)); // 임시로 위험도 기준
    default:
      return sorted;
  }
});

// 헬퍼 함수들
const getRiskLevel = (themeName) => {
  if (themeName.includes('안정형')) return '안정형';
  if (themeName.includes('안정추구형')) return '안정추구형';
  if (themeName.includes('위험중립형')) return '위험중립형';
  if (themeName.includes('적극투자형')) return '적극투자형';
  if (themeName.includes('공격투자형')) return '공격투자형';
  return '위험중립형';
};

const getRiskScore = (themeName) => {
  const riskLevel = getRiskLevel(themeName);
  const scores = {
    안정형: 1,
    안정추구형: 2,
    위험중립형: 3,
    적극투자형: 4,
    공격투자형: 5,
  };
  return scores[riskLevel] || 3;
};

const getRiskBadgeClass = (themeName) => {
  const riskLevel = getRiskLevel(themeName);
  return `risk-${riskLevel.replace('형', '')}`;
};

const getRiskBarClass = (themeName) => {
  const riskLevel = getRiskLevel(themeName);
  return `risk-bar-${riskLevel.replace('형', '')}`;
};

const getRiskPercentage = (themeName) => {
  return getRiskScore(themeName) * 20;
};

const getPortfolioDisplayName = (themeName) => {
  return themeName.replace(/\([^)]*\)/g, '').trim();
};

const getPortfolioTheme = (themeName) => {
  const displayName = getPortfolioDisplayName(themeName);
  if (displayName.includes('자산배분')) return '자산배분';
  if (displayName.includes('배당')) return '배당투자';
  if (displayName.includes('가치주')) return '가치투자';
  if (displayName.includes('글로벌')) return '글로벌투자';
  if (displayName.includes('ESG')) return 'ESG투자';
  if (displayName.includes('수퍼세이브')) return '안정투자';
  if (displayName.includes('컬렉션')) return '초보자용';
  return '테마투자';
};

const getMainAssets = (composition) => {
  const mainAssets = composition
    .filter((asset) => asset.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2)
    .map((asset) => asset.category);
  return mainAssets.join(', ');
};

const getAssetColor = (category) => {
  return assetColors[category] || '#95A5A6';
};

// 필터 관련 함수
const setRiskFilter = (risk) => {
  selectedRisk.value = risk;
};

const setCategoryFilter = (category) => {
  selectedCategory.value = category;
};

const resetFilters = () => {
  selectedRisk.value = 'all';
  selectedCategory.value = 'all';
};

// 포트폴리오 선택
const selectPortfolio = (portfolio) => {
  selectedPortfolio.value = portfolio;
  nextTick(() => {
    createModalChart();
  });
};

const viewDetail = (portfolio) => {
  selectPortfolio(portfolio);
};

const closeModal = () => {
  selectedPortfolio.value = null;
  if (modalChart.value) {
    modalChart.value.destroy();
    modalChart.value = null;
  }
};

const selectThisPortfolio = () => {
  // 포트폴리오 선택 로직 (예: 결과 페이지로 이동)
  router.push({
    path: '/result',
    query: {
      portfolioCode: selectedPortfolio.value.portfolioCode,
      fromList: true,
    },
  });
};

// 차트 생성
const createMiniChart = (canvas, portfolio) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const data = {
    labels: portfolio.composition.map((a) => a.category),
    datasets: [
      {
        data: portfolio.composition.map((a) => (a.percentage === 0 ? 0.1 : a.percentage)),
        backgroundColor: portfolio.composition.map((a) =>
          a.percentage > 0 ? getAssetColor(a.category) : '#BDC3C7'
        ),
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    cutout: '60%',
    animation: false,
  };

  return new ChartJS(ctx, {
    type: 'doughnut',
    data,
    options,
  });
};

const createModalChart = () => {
  if (!selectedPortfolio.value) return;

  const canvas = document.querySelector('.modal-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const data = {
    labels: selectedPortfolio.value.composition.map((a) => a.category),
    datasets: [
      {
        data: selectedPortfolio.value.composition.map((a) =>
          a.percentage === 0 ? 0.1 : a.percentage
        ),
        backgroundColor: selectedPortfolio.value.composition.map((a) =>
          a.percentage > 0 ? getAssetColor(a.category) : '#BDC3C7'
        ),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(45, 51, 107, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const real = selectedPortfolio.value.composition[context.dataIndex].percentage;
            return `${context.label}: ${real}%`;
          },
        },
      },
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      duration: 1000,
    },
  };

  modalChart.value = new ChartJS(ctx, {
    type: 'doughnut',
    data,
    options,
  });
};

// 네비게이션
const goBack = () => {
  router.go(-1);
};

// 라이프사이클
onMounted(() => {
  // 미니 차트들 렌더링
  nextTick(() => {
    filteredPortfolios.value.forEach((portfolio) => {
      const canvas = document.querySelector(
        `canvas[ref-id="mini-chart-${portfolio.portfolioCode}"]`
      );
      if (canvas && !charts.value[portfolio.portfolioCode]) {
        charts.value[portfolio.portfolioCode] = createMiniChart(canvas, portfolio);
      }
    });
  });
});

onBeforeUnmount(() => {
  // 모든 차트 정리
  Object.values(charts.value).forEach((chart) => chart?.destroy());
  if (modalChart.value) {
    modalChart.value.destroy();
  }
});
</script>

<style scoped>
.theme-portfolios-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fc 0%, #e9ecef 100%);
  padding: 1rem;
}

/* 페이지 헤더 */
.page-header {
  background: var(--color-white);
  border-radius: 1.25rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1.25rem 2.5rem rgba(45, 51, 107, 0.15);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.3);
}

.back-icon {
  width: 1rem;
  height: 1rem;
  background: var(--color-white);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 0.5rem 0;
}

.page-description {
  font-size: 0.875rem;
  color: var(--color-light);
  margin: 0;
}

/* 필터 섹션 */
.filter-section {
  background: var(--color-white);
  border-radius: 1.25rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1.25rem 2.5rem rgba(45, 51, 107, 0.15);
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter-icon {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.filter-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-sub);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-option {
  background: rgba(248, 249, 252, 0.8);
  border: 0.0625rem solid rgba(185, 187, 204, 0.3);
  color: var(--color-sub);
  padding: 0.5rem 1rem;
  border-radius: 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-option:hover {
  border-color: var(--color-main);
  background: rgba(45, 51, 107, 0.05);
}

.filter-option.active {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: var(--color-white);
  border-color: transparent;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
}

.reset-button {
  background: rgba(231, 76, 60, 0.1);
  border: 0.0625rem solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
}

.reset-button:hover {
  background: rgba(231, 76, 60, 0.15);
  border-color: #e74c3c;
}

.reset-icon {
  width: 0.875rem;
  height: 0.875rem;
  background: #e74c3c;
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

/* 결과 섹션 */
.results-section {
  background: var(--color-white);
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 1.25rem 2.5rem rgba(45, 51, 107, 0.15);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 0.0625rem solid rgba(185, 187, 204, 0.2);
}

.results-info {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.results-count {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-main);
}

.results-text {
  font-size: 0.875rem;
  color: var(--color-light);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-select {
  background: rgba(248, 249, 252, 0.8);
  border: 0.0625rem solid rgba(185, 187, 204, 0.3);
  color: var(--color-sub);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

/* 포트폴리오 그리드 */
.portfolios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18.75rem, 1fr));
  gap: 1.5rem;
}

.portfolio-item {
  background: rgba(248, 249, 252, 0.5);
  border: 0.0625rem solid rgba(185, 187, 204, 0.2);
  border-radius: 1rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.portfolio-item:hover {
  transform: translateY(-0.25rem);
  box-shadow: 0 1.25rem 2.5rem rgba(45, 51, 107, 0.2);
  border-color: var(--color-main);
}

.portfolio-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.risk-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-white);
}

.risk-안정 {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.risk-안정추구 {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.risk-위험중립 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.risk-적극투자 {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.risk-공격투자 {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.portfolio-code-small {
  font-size: 0.75rem;
  color: var(--color-light);
  background: rgba(185, 187, 204, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.portfolio-title {
  text-align: center;
}

.portfolio-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.portfolio-subtitle {
  font-size: 0.75rem;
  color: var(--color-light);
  margin: 0;
}

.mini-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 6rem;
}

.mini-chart {
  max-width: 6rem;
  max-height: 6rem;
}

.portfolio-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.75rem;
  color: var(--color-light);
  font-weight: 500;
}

.info-value {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 600;
}

.risk-indicator {
  flex: 1;
  max-width: 5rem;
  height: 0.25rem;
  background: rgba(185, 187, 204, 0.3);
  border-radius: 0.125rem;
  overflow: hidden;
  margin-left: 0.5rem;
}

.risk-bar {
  height: 100%;
  border-radius: 0.125rem;
  transition: width 0.3s ease;
}

.risk-bar-안정 {
  background: linear-gradient(90deg, #2ecc71, #27ae60);
}

.risk-bar-안정추구 {
  background: linear-gradient(90deg, #3498db, #2980b9);
}

.risk-bar-위험중립 {
  background: linear-gradient(90deg, #f39c12, #e67e22);
}

.risk-bar-적극투자 {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.risk-bar-공격투자 {
  background: linear-gradient(90deg, #9b59b6, #8e44ad);
}

.portfolio-actions {
  margin-top: auto;
}

.detail-button {
  width: 100%;
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: var(--color-white);
  border: none;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
}

.detail-button:hover {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.3);
}

.detail-icon {
  width: 0.875rem;
  height: 0.875rem;
  background: var(--color-white);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-light);
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  background: var(--color-light);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z'/%3e%3c/svg%3e")
    center/contain no-repeat;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.8;
}

.empty-action {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: var(--color-white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.empty-action:hover {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.3);
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--color-white);
  border-radius: 1.25rem;
  max-width: 28rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 0.0625rem solid rgba(185, 187, 204, 0.2);
  margin-bottom: 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
  flex: 1;
  padding-right: 1rem;
}

.close-button {
  width: 2rem;
  height: 2rem;
  background: rgba(185, 187, 204, 0.15);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(231, 76, 60, 0.15);
}

.close-icon {
  width: 0.875rem;
  height: 0.875rem;
  background: var(--color-light);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

.close-button:hover .close-icon {
  background: #e74c3c;
}

.modal-body {
  padding: 0 1.5rem;
}

.modal-chart-container {
  position: relative;
  height: 15rem;
  width: 15rem;
  margin: 0 auto 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-chart {
  max-width: 15rem;
  max-height: 15rem;
}

.modal-chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.center-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
}

.center-subtitle {
  font-size: 0.75rem;
  color: var(--color-sub);
}

.modal-composition {
  margin-bottom: 2rem;
}

.composition-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 1rem 0;
}

.composition-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.composition-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(248, 249, 252, 0.5);
  transition: all 0.3s ease;
}

.composition-item.zero-percentage {
  opacity: 0.6;
  background: rgba(189, 195, 199, 0.1);
}

.composition-item.zero-percentage .composition-label {
  color: var(--color-light);
  text-decoration: line-through;
  text-decoration-color: rgba(185, 187, 204, 0.5);
}

.composition-item.zero-percentage .composition-value {
  color: var(--color-light);
  font-style: italic;
}

.composition-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.composition-label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-sub);
}

.composition-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-main);
}

.modal-features {
  margin-bottom: 2rem;
}

.features-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 1rem 0;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: rgba(248, 249, 252, 0.5);
}

.feature-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.risk-icon {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3e%3cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

.theme-icon {
  background: linear-gradient(135deg, #3498db, #2980b9);
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3e%3cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.feature-label {
  font-size: 0.75rem;
  color: var(--color-light);
  font-weight: 500;
}

.feature-value {
  font-size: 0.875rem;
  color: var(--color-main);
  font-weight: 600;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 0.0625rem solid rgba(185, 187, 204, 0.2);
}

.modal-action-button {
  width: 100%;
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: var(--color-white);
  border: none;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.modal-action-button:hover {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.3);
}

/* 애니메이션 */
@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 */
@media (max-width: 48rem) {
  .theme-portfolios-page {
    padding: 0.75rem;
  }

  .page-header,
  .filter-section,
  .results-section {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .portfolios-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .filter-controls {
    gap: 1.25rem;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .modal-content {
    margin: 0.5rem;
    max-height: 95vh;
  }

  .modal-chart-container {
    height: 12.5rem;
    width: 12.5rem;
  }

  .modal-chart {
    max-width: 12.5rem;
    max-height: 12.5rem;
  }
}

@media (max-width: 30rem) {
  .page-title {
    font-size: 1.25rem;
  }

  .filter-options {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-option {
    text-align: center;
  }

  .portfolios-grid {
    gap: 1rem;
  }

  .portfolio-item {
    padding: 1rem;
  }
}
</style>
