<template>
  <div class="wmti-history">
    <BackButton class="mb-3" />
    <!-- Header -->
    <div class="header">
      <h1>검사 히스토리</h1>
      <p v-if="historyList.length > 0">총 {{ historyList.length }}건의 검사 기록</p>
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
      <button class="btn-primary" @click="goToWMTI">검사 받기</button>
    </div>

    <!-- History List -->
    <div v-else class="history-list">
      <div v-for="history in historyList" :key="history.id" class="history-card">
        <!-- Card Header -->
        <div class="card-header" @click="toggleDetails(history.id)">
          <div class="card-title">
            <!-- WMTI 코드는 기존 방식으로 + 새로운 색상 -->
            <span
              class="badge"
              :class="getWMTIBadgeClass(history.type)"
              :style="getWMTICodeStyle(history.wmtiCode)"
            >
              {{ history.wmtiCode }}
            </span>
            <!-- 위험성향은 한국어로 + 색상 적용 -->
            <span class="type-name" :class="getBadgeClass(history.originalData.riskPreference)">
              {{ getRiskPreferenceName(history.originalData.riskPreference) }}
            </span>
          </div>
          <div class="card-meta">
            <span class="date">{{ formatDate(history.createdAt) }}</span>
            <i
              class="fas expand-icon"
              :class="expandedItems.includes(history.id) ? 'fa-chevron-up' : 'fa-chevron-down'"
            ></i>
          </div>
        </div>

        <!-- Card Content -->
        <div class="card-content">
          <p class="description">{{ history.description }}</p>
        </div>

        <!-- Details (Expandable) -->
        <div class="card-details" :class="{ expanded: expandedItems.includes(history.id) }">
          <!-- WMTI Code Breakdown -->
          <div class="wmti-breakdown">
            <h4 class="breakdown-title">WMTI 코드 분석</h4>
            <div class="wmti-code-display">
              <div
                v-for="(letter, index) in history.wmtiCode.split('')"
                :key="index"
                class="wmti-letter-card"
              >
                <div class="letter-header">
                  <span class="letter">{{ letter }}</span>
                </div>
                <div class="score-section">
                  <div class="score-value">
                    {{ getScoreByLetter(history.originalData, letter) }}
                  </div>
                  <div class="score-bar">
                    <div
                      class="score-fill"
                      :style="{
                        width: getScoreByLetter(history.originalData, letter) + '%',
                        backgroundColor: getScoreColor(
                          getScoreByLetter(history.originalData, letter)
                        ),
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getWMTIHistoryAPI } from '@/api/wmti';
import router from '@/router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/composables/useToast';
import BackButton from '@/components/common/BackButton.vue';

const { showToast } = useToast();

// State
const loading = ref(false);
const historyList = ref([]);
const loadingMessage = ref('데이터를 불러오는 중...');
const expandedItems = ref([]);

// 로그인 유저 ID
const authStore = useAuthStore();
const memberId = authStore.userInfo.memberId;

// API 호출 함수
const fetchHistoryData = async () => {
  loading.value = true;
  try {
    historyList.value = await getWMTIHistoryAPI(memberId);
    historyList.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    showToast('히스토리 불러오기 실패:', 'error');
  } finally {
    loading.value = false;
  }
};

const getRiskPreferenceName = (riskPreference) => {
  const nameMap = {
    STABILITY: '안정형',
    STABILITY_ORIENTED: '안정추구형',
    RISK_NEUTRAL: '위험중립형',
    ACTIVELY: '적극투자형',
    AGGRESSIVE: '공격투자형',
  };
  return nameMap[riskPreference] || riskPreference;
};

const toggleDetails = (historyId) => {
  const index = expandedItems.value.indexOf(historyId);
  if (index > -1) {
    expandedItems.value.splice(index, 1);
  } else {
    expandedItems.value.push(historyId);
  }
};

const getScoreByLetter = (originalData, letter) => {
  const scoreMap = {
    A: originalData.ascore,
    B: originalData.bscore,
    C: originalData.cscore,
    I: originalData.iscore,
    L: originalData.lscore,
    M: originalData.mscore,
    P: originalData.pscore,
    W: originalData.wscore,
  };
  return scoreMap[letter] || 0;
};

const getScoreColor = (score) => {
  if (score >= 80) return 'var(--color-main)';
  if (score >= 60) return 'var(--color-sub)';
  if (score >= 40) return 'var(--color-light)';
  return 'var(--color-)';
};

// 위험성향에 따른 CSS 클래스 (색상 적용)
const getBadgeClass = (riskPreference) => {
  const classMap = {
    STABILITY: 'risk-stability',
    STABILITY_ORIENTED: 'risk-stability-oriented',
    RISK_NEUTRAL: 'risk-neutral',
    ACTIVELY: 'risk-actively',
    AGGRESSIVE: 'risk-aggressive',
  };
  return classMap[riskPreference] || 'risk-default';
};

// WMTI 코드 배지 클래스 (기존 방식)
const getWMTIBadgeClass = (type) => {
  return `badge-${type.toLowerCase()}`;
};

// WMTI 코드별 색상 매핑
const getWMTICodeStyle = (wmtiCode) => {
  const colorMap = {
    ABWC: ['#E74C3C', '#C0392B'], // 클래식 레드
    ABWL: ['#E67E22', '#D35400'], // 오렌지 레드
    ABMC: ['#DC7633', '#BA4A00'], // 번트 오렌지
    ABML: ['#CB4335', '#A93226'], // 딥 레드
    APMW: ['#FF6B6B', '#EE5A52'], // 코랄 레드
    APLW: ['#FF7675', '#FD79A8'], // 로즈 핑크
    APMC: ['#FD79A8', '#E84393'], // 핫 핑크
    APML: ['#E84393', '#D63031'], // 매젠타
    IBWC: ['#3498DB', '#2980B9'], // 스카이 블루
    IBWL: ['#5DADE2', '#3498DB'], // 라이트 블루
    IBMC: ['#2E86C1', '#2471A3'], // 오션 블루
    IBML: ['#21618C', '#1B4F72'], // 네이비 블루
    IPMW: ['#74B9FF', '#0984E3'], // 브라이트 블루
    IPLW: ['#81ECEC', '#00B894'], // 아쿠아
    IPMC: ['#00B894', '#00A085'], // 틸
    IPML: ['#00A085', '#006266'], // 다크 틸
  };

  const colors = colorMap[wmtiCode] || ['#95A5A6', '#7F8C8D']; // 기본 그레이
  return {
    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
    boxShadow: `0 0.125rem 0.5rem ${colors[0]}33`, // 33은 투명도 20%
  };
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const goToWMTI = () => {
  router.push('/wmti/basic');
};

// Lifecycle
onMounted(() => {
  fetchHistoryData();
});
</script>

<style scoped>
.wmti-history {
  width: 100%;
  max-width: 26.875rem;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--color-bg);
  padding: 0.5rem;
  box-sizing: border-box;
}

/* Header */
.header {
  background: var(--color-white);
  padding: 1rem;
  border-radius: 0.75rem;
  text-align: center;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
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
  background-color: var(--color-main);
}

.badge-aggressive {
  color: rgb(255, 255, 255);
}
.badge-active {
  color: rgb(255, 255, 255);
}
.badge-moderate {
  color: rgb(255, 255, 255);
}
.badge-passive {
  color: rgb(255, 255, 255);
}
.badge-conservative {
  color: rgb(255, 255, 255);
}

.risk-stability {
  background: linear-gradient(135deg, #27ae60, #2ecc71) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(39, 174, 96, 0.3);
}
.risk-stability-oriented {
  background: linear-gradient(135deg, #2ecc71, #58d68d) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(46, 204, 113, 0.3);
}
.risk-neutral {
  background: linear-gradient(135deg, #f39c12, #f8c471) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(243, 156, 18, 0.3);
}
.risk-actively {
  background: linear-gradient(135deg, #e67e22, #f8c471) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(230, 126, 34, 0.3);
}
.risk-aggressive {
  background: linear-gradient(135deg, #e74c3c, #ec7063) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(231, 76, 60, 0.3);
}

.type-name {
  padding: 0.1rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(255, 255, 255);
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
  max-height: 50rem;
}

/* WMTI Breakdown */
.wmti-breakdown {
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-bg);
}

.breakdown-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 1rem;
  text-align: center;
}

.wmti-code-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.wmti-letter-card {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border: 1px solid var(--color-main);
  border-radius: 0.75rem;
  padding: 0.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.wmti-letter-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-main);
}

.letter-header {
  margin-bottom: 0.5rem;
}

.letter {
  display: block;
  font-size: 1rem;
  text-align: center;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.25rem;
}

.score-section .score-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.score-section .score-bar {
  height: 0.3rem;
  background: rgba(185, 187, 204, 0.3);
  border-radius: 0.15rem;
  overflow: hidden;
}

.score-section .score-fill {
  height: 100%;
  border-radius: 0.15rem;
  transition: width 0.5s ease;
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

/* FAB */
.fab {
  position: fixed;
  bottom: 1.5rem;
  right: 50%;
  transform: translateX(50%);
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: var(--color-main);
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.3);
  z-index: 1000;
}
</style>
