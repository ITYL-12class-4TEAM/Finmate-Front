<template>
  <div class="wmti-history">
    <!-- Header -->
    <div class="header">
      <h1>검사 히스토리</h1>
      <p v-if="historyList.length > 0">
        총 {{ historyList.length }}건의 검사 기록
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>{{ loadingMessage }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="historyList.length === 0" class="empty">
      <i class="fas fa-clipboard-check"></i>
      <h3>아직 검사 기록이 없습니다</h3>
      <p>금융 성향 검사를 받아보세요</p>
      <button @click="goToWMTI" class="btn-primary">검사 받기</button>
    </div>

    <!-- History List -->
    <div v-else class="history-list">
      <div
        v-for="history in historyList"
        :key="history.id"
        class="history-card"
      >
        <!-- Card Header -->
        <div class="card-header" @click="toggleDetails(history.id)">
          <div class="card-title">
            <span class="badge" :class="getBadgeClass(history.type)">
              {{ history.wmtiCode }}
            </span>
            <span class="type-name">{{ history.typeName }}</span>
          </div>
          <div class="card-meta">
            <span class="date">{{ formatDate(history.createdAt) }}</span>
            <i
              class="fas expand-icon"
              :class="
                expandedItems.includes(history.id)
                  ? 'fa-chevron-up'
                  : 'fa-chevron-down'
              "
            ></i>
          </div>
        </div>

        <!-- Card Content -->
        <div class="card-content">
          <p class="description">{{ history.description }}</p>
        </div>

        <!-- Details (Expandable) -->
        <div
          class="card-details"
          :class="{ expanded: expandedItems.includes(history.id) }"
        >
          <!-- Score Grid -->
          <div class="score-grid">
            <div
              v-for="(scoreData, key) in getDetailedScoresWithInfo(
                history.originalData
              )"
              :key="key"
              class="score-item"
            >
              <div class="score-letter">{{ key }}</div>
              <div class="score-name">{{ scoreData.name }}</div>
              <div class="score-value">{{ scoreData.score }}</div>
              <div class="score-bar">
                <div
                  class="score-fill"
                  :style="{
                    width: scoreData.score + '%',
                    backgroundColor: getScoreColor(scoreData.score),
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button @click="viewResult(history)" class="btn-outline">
              <i class="fas fa-eye"></i>
              상세보기
            </button>
            <button @click="downloadResult(history)" class="btn-outline">
              <i class="fas fa-download"></i>
              다운로드
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button class="fab" @click="goToWMTI">
      <i class="fas fa-plus"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// State
const loading = ref(false);
const historyList = ref([]);
const loadingMessage = ref('데이터를 불러오는 중...');
const expandedItems = ref([]);

// Mock Data
const mockHistoryData = [
  {
    historyId: 1,
    answersJson: '{}',
    ascore: 85,
    bscore: 25,
    createdAt: '2025-07-15T14:30:00.000Z',
    cscore: 70,
    iscore: 60,
    lscore: 20,
    memberId: 1,
    mscore: 75,
    pscore: 90,
    resultType: 'AGGRESSIVE',
    riskPreference: 'GROWTH',
    userName: '김투자',
    wmtiCode: 'AILP',
    wscore: 80,
  },
  {
    historyId: 2,
    answersJson: '{}',
    ascore: 65,
    bscore: 45,
    createdAt: '2025-06-20T09:15:00.000Z',
    cscore: 85,
    iscore: 75,
    lscore: 70,
    memberId: 1,
    mscore: 80,
    pscore: 55,
    resultType: 'MODERATE',
    riskPreference: 'BALANCE',
    userName: '김투자',
    wmtiCode: 'MILC',
    wscore: 60,
  },
  {
    historyId: 3,
    answersJson: '{}',
    ascore: 30,
    bscore: 80,
    createdAt: '2025-05-10T16:45:00.000Z',
    cscore: 95,
    iscore: 90,
    lscore: 85,
    memberId: 1,
    mscore: 40,
    pscore: 25,
    resultType: 'CONSERVATIVE',
    riskPreference: 'STABILITY',
    userName: '김투자',
    wmtiCode: 'CIWB',
    wscore: 35,
  },
  {
    historyId: 4,
    answersJson: '{}',
    ascore: 75,
    bscore: 35,
    createdAt: '2025-04-05T11:20:00.000Z',
    cscore: 60,
    iscore: 80,
    lscore: 40,
    memberId: 1,
    mscore: 85,
    pscore: 70,
    resultType: 'AGGRESSIVE',
    riskPreference: 'GROWTH',
    userName: '김투자',
    wmtiCode: 'AMLP',
    wscore: 75,
  },
  {
    historyId: 5,
    answersJson: '{}',
    ascore: 50,
    bscore: 60,
    createdAt: '2025-03-12T15:45:00.000Z',
    cscore: 75,
    iscore: 85,
    lscore: 65,
    memberId: 1,
    mscore: 70,
    pscore: 45,
    resultType: 'MODERATE',
    riskPreference: 'BALANCE',
    userName: '김투자',
    wmtiCode: 'MILC',
    wscore: 55,
  },
];

// Methods
const loadMockData = async () => {
  loading.value = true;
  loadingMessage.value = '히스토리 데이터를 불러오는 중...';

  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    historyList.value = mockHistoryData.map((item) => ({
      id: item.historyId,
      type: item.resultType,
      typeName: getResultTypeName(item.resultType),
      description: getRiskPreferenceDescription(item.riskPreference),
      riskLevel: calculateRiskLevel(item),
      returnExpectation: calculateReturnExpectation(item),
      score: calculateTotalScore(item),
      createdAt: item.createdAt,
      wmtiCode: item.wmtiCode,
      originalData: item,
    }));

    historyList.value.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (err) {
    console.error('❌ Mock 데이터 로드 실패:', err);
  } finally {
    loading.value = false;
  }
};

const toggleDetails = (historyId) => {
  const index = expandedItems.value.indexOf(historyId);
  if (index > -1) {
    expandedItems.value.splice(index, 1);
  } else {
    expandedItems.value.push(historyId);
  }
};

// Utility Functions
const getResultTypeName = (resultType) => {
  const types = {
    AGGRESSIVE: '공격투자형',
    MODERATE: '중립투자형',
    CONSERVATIVE: '안정추구형',
  };
  return types[resultType] || resultType;
};

const getRiskPreferenceDescription = (riskPreference) => {
  const descriptions = {
    GROWTH: '높은 수익을 위해 위험을 감수하는 성향',
    BALANCE: '적절한 수익과 안정성을 추구하는 성향',
    STABILITY: '안정적인 투자를 선호하는 성향',
  };
  return descriptions[riskPreference] || riskPreference;
};

const calculateRiskLevel = (item) => {
  const aggressiveScore = (item.ascore + item.pscore) / 2;
  const conservativeScore = (item.bscore + item.cscore) / 2;
  const riskLevel = (aggressiveScore - conservativeScore + 100) / 20;
  return Math.max(1, Math.min(10, Math.round(riskLevel)));
};

const calculateReturnExpectation = (item) => {
  const riskLevel = calculateRiskLevel(item);
  return Math.round(riskLevel * 1.2 + 2);
};

const calculateTotalScore = (item) => {
  return (
    item.ascore +
    item.lscore +
    item.mscore +
    item.pscore +
    item.iscore +
    item.wscore +
    item.bscore +
    item.cscore
  );
};

const getDetailedScoresWithInfo = (originalData) => {
  return {
    A: { score: originalData.ascore, name: 'Aggressive' },
    L: { score: originalData.lscore, name: 'Liquidity' },
    M: { score: originalData.mscore, name: 'Market' },
    P: { score: originalData.pscore, name: 'Profit' },
    I: { score: originalData.iscore, name: 'Investment' },
    W: { score: originalData.wscore, name: 'Wealth' },
    B: { score: originalData.bscore, name: 'Balance' },
    C: { score: originalData.cscore, name: 'Conservative' },
  };
};

const getScoreColor = (score) => {
  if (score >= 80) return '#198754';
  if (score >= 60) return '#ffc107';
  if (score >= 40) return '#fd7e14';
  return '#dc3545';
};

const getBadgeClass = (type) => {
  return `badge-${type.toLowerCase()}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Actions
const viewResult = (history) => {
  alert(
    `🔍 ${history.wmtiCode} 결과 상세보기\n\n투자성향: ${history.typeName}\n위험도: ${history.riskLevel}/10\n기대수익: ${history.returnExpectation}%`
  );
};

const downloadResult = (history) => {
  alert(
    `📄 ${history.wmtiCode} 결과 다운로드\n\n실제 구현에서는 PDF 파일을 다운로드합니다.`
  );
};

const goToWMTI = () => {
  alert('🧭 WMTI 검사 페이지로 이동합니다!');
};

// Lifecycle
onMounted(() => {
  loadMockData();
});
</script>

<style scoped>
.wmti-history {
  max-width: 26.875rem;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--color-bg);
}

/* Header */
.header {
  background: var(--color-white);
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  text-align: center;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.25rem;
}

.header p {
  color: var(--color-sub);
  font-size: 0.9rem;
}

/* Loading */
.loading {
  background: var(--color-white);
  padding: 2.5rem 1.25rem;
  border-radius: 0.75rem;
  text-align: center;
}

.loading i {
  font-size: 2rem;
  color: var(--color-main);
  margin-bottom: 0.75rem;
}

.loading p {
  color: var(--color-sub);
}

/* Empty State */
.empty {
  background: var(--color-white);
  padding: 3.75rem 1.25rem;
  border-radius: 0.75rem;
  text-align: center;
}

.empty i {
  font-size: 3rem;
  color: var(--color-light);
  margin-bottom: 1rem;
}

.empty h3 {
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.empty p {
  color: var(--color-sub);
  margin-bottom: 1.5rem;
}

/* History Cards */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-card {
  background: var(--color-white);
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(185, 187, 204, 0.2);
  box-shadow: 0 0.125rem 0.25rem rgba(45, 51, 107, 0.04);
}

.card-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-bg);
  background: var(--color-white);
}

.card-header:hover {
  background: rgba(45, 51, 107, 0.02);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-aggressive {
  background: #dc3545;
  color: white;
}
.badge-moderate {
  background: #ffc107;
  color: #000;
}
.badge-conservative {
  background: #198754;
  color: white;
}

.type-name {
  font-weight: 600;
  color: var(--color-main);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date {
  font-size: 0.8rem;
  color: var(--color-sub);
}

.expand-icon {
  color: var(--color-sub);
  font-size: 0.8rem;
}

/* Card Content */
.card-content {
  padding: 0.75rem;
  background: rgba(238, 238, 243, 0.3);
}

.description {
  color: var(--color-sub);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.card-details {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: var(--color-white);
  border-top: 1px solid var(--color-bg);
}

.card-details.expanded {
  max-height: 31.25rem;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0.75rem;
}

.score-item {
  text-align: center;
  padding: 0.75rem;
  background: var(--color-bg);
  border-radius: 0.5rem;
}

.score-letter {
  font-weight: 700;
  color: var(--color-main);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.score-name {
  font-size: 0.7rem;
  color: var(--color-sub);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.score-value {
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.score-bar {
  height: 0.25rem;
  background: rgba(185, 187, 204, 0.3);
  border-radius: 0.125rem;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 0.125rem;
  transition: width 0.3s ease;
}

/* Actions */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 1rem;
}

/* Buttons */
.btn-primary {
  background: var(--color-main);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--color-sub);
}

.btn-outline {
  background: transparent;
  color: var(--color-main);
  border: 1px solid var(--color-main);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.btn-outline:hover {
  background: var(--color-main);
  color: white;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 1.5rem;
  right: calc(50% - 13.4375rem + 1.5rem);
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--color-main);
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.3);
}

.fab:hover {
  background: var(--color-sub);
  transform: scale(1.05);
}
</style>
