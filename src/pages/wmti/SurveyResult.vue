<template>
  <div class="result-page">
    <!-- 로딩 스피너 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>결과를 불러오는 중...</p>
    </div>

    <!-- 메인 콘텐츠 -->
    <div v-else>
      <!-- 헤더 섹션 -->
      <div class="result-header card-header">
        <!-- 뒤로가기 버튼 -->
        <BackButton to="/wmti/basic" />
        <div class="user-greeting">
          <span class="username-highlight">{{ userName }}</span
          >님의 투자 성향은
        </div>
        <div class="wmti-code-display">
          <span class="code-text">{{ analysisObject.wmtiCode }}</span>
          <span class="code-suffix">입니다</span>
        </div>
        <div class="type-summary">
          <div class="type-item">
            <span class="type-label">투자자 유형</span>
            <span class="type-value" :class="getResultTypeClass(analysisObject.resultType)">
              {{ analysisObject.resultType }}
            </span>
            <span
              class="type-description"
              :class="getResultTypeTextClass(analysisObject.resultType)"
            >
              {{ getResultTypeLabel(analysisObject.resultType) }}
            </span>
          </div>
          <div class="type-item">
            <span class="type-label">리스크 수용도</span>
            <span class="type-value" :class="getRiskPreferenceClass(analysisObject.riskPreference)">
              {{ analysisObject.riskPreference }}
            </span>
            <span
              class="type-description"
              :class="getRiskPreferenceTextClass(analysisObject.riskPreference)"
            >
              {{ getRiskPreferenceLabel(analysisObject.riskPreference) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 성향 분석 카드 -->
      <div class="analysis-card card-header">
        <div class="section-header">
          <div class="section-icon analysis-icon"></div>
          <h3 class="section-title">투자 성향 분석</h3>
        </div>

        <WMTIHeroCard
          v-if="analysisObject.wmtiCode && analysis.aka"
          :wmti-code="analysisObject.wmtiCode"
          :nickname="analysis.aka"
          :character-image="characterImageUrl"
        />

        <!-- 태그 섹션 -->
        <div class="tags-section">
          <h4 class="subsection-title">
            <span class="subsection-icon"></span>
            성향 키워드
          </h4>
          <div class="tags-marquee">
            <div v-if="analysis.tag && analysis.tag.length > 0" class="tags-track">
              <div v-for="(tag, index) in analysis.tag" :key="'first-' + index" class="tag-item">
                #{{ tag }}
              </div>
              <div v-for="(tag, index) in analysis.tag" :key="'second-' + index" class="tag-item">
                #{{ tag }}
              </div>
            </div>
          </div>
        </div>

        <!-- 설명 섹션 -->
        <div class="description-section">
          <h4 class="subsection-title">
            <span class="subsection-icon description-icon"></span>
            상세 분석
          </h4>
          <p class="description-text multiline-text">{{ analysis.description }}</p>
        </div>
      </div>

      <!-- 점수 차트 카드 -->
      <div class="score-card card-header">
        <div class="section-header">
          <div class="section-icon score-icon"></div>
          <h3 class="section-title">성향 분석 결과</h3>
        </div>

        <ScoreChart
          :a-score="analysisObject.ascore || 0"
          :i-score="analysisObject.iscore || 0"
          :p-score="analysisObject.pscore || 0"
          :b-score="analysisObject.bscore || 0"
          :m-score="analysisObject.mscore || 0"
          :w-score="analysisObject.wscore || 0"
          :l-score="analysisObject.lscore || 0"
          :c-score="analysisObject.cscore || 0"
          :a-letter="analysisObject.a || 'A'"
          :p-letter="analysisObject.p || 'P'"
          :m-letter="analysisObject.m || 'M'"
          :l-letter="analysisObject.l || 'L'"
        />
      </div>

      <!-- 맞춤형 포트폴리오 -->
      <div class="CustomedPortfolio-card card-header">
        <div class="section-header">
          <div class="section-icon customed-icon"></div>
          <h3 class="section-title">맞춤형 포트폴리오</h3>
        </div>
        <CustomedPortfolio
          v-if="analysisObject && analysisObject.wmtiCode && preInfoData"
          :wmti-code="analysisObject.wmtiCode"
          :result-type="analysisObject.resultType"
          :risk-preference="analysisObject.riskPreference"
          :user-name="userName"
          :a-score="analysisObject.ascore"
          :i-score="analysisObject.iscore"
          :p-score="analysisObject.pscore"
          :b-score="analysisObject.bscore"
          :m-score="analysisObject.mscore"
          :w-score="analysisObject.wscore"
          :l-score="analysisObject.lscore"
          :c-score="analysisObject.cscore"
          :investment-capacity="preInfoData.investmentCapacity"
          :investment-period="preInfoData.investmentPeriod"
          :purpose-category="preInfoData.purposeCategory"
          :age="preInfoData.age"
          :monthly-income="preInfoData.monthlyIncome"
          :savings-rate="preInfoData.savingsRate"
          :financial-health-score="preInfoData.financialHealthScore"
        />
      </div>

      <!-- 액션 버튼 -->
      <div class="action-section">
        <div class="section-header">
          <div class="section-icon action-icon"></div>
          <h3 class="section-title">더 둘러보기</h3>
        </div>

        <div class="action-buttons">
          <button class="action-button secondary" @click="goToWMTIList">
            <div class="button-icon users-icon"></div>
            16가지 WMTI 투자성향 보기
          </button>
          <button class="action-button tertiary" @click="goToHistory">
            <div class="button-icon history-icon"></div>
            내 검사 이력 보기
          </button>
        </div>
      </div>

      <!-- 제출 시각 -->
      <div class="footer-date">검사 완료 시각: {{ formattedDate }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getWMTIResultAPI, getWMTIAnalysisAPI, getPreInfoCalcAPI } from '@/api/wmti';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/stores/useAuthStore';
import ScoreChart from '@/components/wmti/ScoreChart.vue';
import BackButton from '@/components/common/BackButton.vue';
import CustomedPortfolio from '@/components/wmti/CustomedPortfolio.vue';
import WMTIHeroCard from '@/components/wmti/WMTIHeroCard.vue';

// ===== WMTI 캐릭터 이미지 정적 import =====
import apmlImage from '@/assets/images/wmti-characters/apml.png';
import apmcImage from '@/assets/images/wmti-characters/apmc.png';
import apwlImage from '@/assets/images/wmti-characters/apwl.png';
import apwcImage from '@/assets/images/wmti-characters/apwc.png';
import abmlImage from '@/assets/images/wmti-characters/abml.png';
import abmcImage from '@/assets/images/wmti-characters/abmc.png';
import abwlImage from '@/assets/images/wmti-characters/abwl.png';
import abwcImage from '@/assets/images/wmti-characters/abwc.png';
import ipmlImage from '@/assets/images/wmti-characters/ipml.png';
import ipmcImage from '@/assets/images/wmti-characters/ipmc.png';
import ipwlImage from '@/assets/images/wmti-characters/ipwl.png';
import ipwcImage from '@/assets/images/wmti-characters/ipwc.png';
import ibmlImage from '@/assets/images/wmti-characters/ibml.png';
import ibmcImage from '@/assets/images/wmti-characters/ibmc.png';
import ibwlImage from '@/assets/images/wmti-characters/ibwl.png';
import ibwcImage from '@/assets/images/wmti-characters/ibwc.png';

// 이미지 맵 생성
const wmtiImageMap = {
  APML: apmlImage,
  APMC: apmcImage,
  APWL: apwlImage,
  APWC: apwcImage,
  ABML: abmlImage,
  ABMC: abmcImage,
  ABWL: abwlImage,
  ABWC: abwcImage,
  IPML: ipmlImage,
  IPMC: ipmcImage,
  IPWL: ipwlImage,
  IPWC: ipwcImage,
  IBML: ibmlImage,
  IBMC: ibmcImage,
  IBWL: ibwlImage,
  IBWC: ibwcImage,
};

const router = useRouter();
const { showToast } = useToast();
const authStore = useAuthStore();

// 반응형 상태
const analysisObject = ref({});
const preInfoData = ref({});
const analysis = ref({});
const createdAt = ref([]);
const characterImageUrl = ref(''); // ref로 변경
const isLoading = ref(true); // 로딩 상태 추가

// userInfo에서 userName을 가져오는 computed 속성
const userName = computed(() => {
  return authStore.userInfo?.nickname || '사용자';
});

const formattedDate = computed(() => {
  if (!createdAt.value || createdAt.value.length !== 6) {
    return '제출 시각 없음';
  }
  const date = new Date(...createdAt.value);
  return date.toLocaleString('ko-KR');
});

// ===== 수정된 WMTI 이미지 URL 계산 함수 =====
const getWMTIImageUrl = (wmtiCode) => {
  if (!wmtiCode) {
    return '';
  }

  const upperCode = wmtiCode.toUpperCase();
  const imageUrl = wmtiImageMap[upperCode];

  if (!imageUrl) {
    return '';
  }

  return imageUrl;
};

// 결과 및 분석 데이터 불러오기 (병렬 처리로 최적화)
const fetchResult = async () => {
  const memberId = authStore.userInfo?.memberId;
  if (!memberId) {
    isLoading.value = false;
    return;
  }

  try {
    // 병렬로 API 호출
    const [resultRes, preInfoRes] = await Promise.all([
      getWMTIResultAPI(memberId),
      getPreInfoCalcAPI(),
    ]);

    const data = resultRes.body?.data;
    if (!data) {
      showToast('결과 데이터를 찾을 수 없습니다.', 'warning');
      isLoading.value = false;
      return;
    }

    // 기본 데이터 먼저 설정 (UI 즉시 렌더링)
    analysisObject.value = data;
    createdAt.value = [...data.createdAt] || [];
    preInfoData.value = preInfoRes.body?.data || {};

    // 분석 데이터와 이미지를 병렬로 로드
    const [analysisData, imageUrl] = await Promise.all([
      fetchAnalysis(data.wmtiCode),
      getWMTIImageUrl(data.wmtiCode),
    ]);

    characterImageUrl.value = imageUrl;
  } catch (err) {
    console.error('결과 불러오기 실패:', err);
    showToast('결과를 불러오지 못했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

const fetchAnalysis = async (wmtiCode) => {
  try {
    const res = await getWMTIAnalysisAPI(wmtiCode);
    analysis.value = res.body?.data;
    return res.body?.data;
  } catch (err) {
    showToast('분석 정보 불러오기 실패', 'error');
    return null;
  }
};

// 라우팅 함수
const goToWMTIList = () => router.push('/wmti/collection');
const goToHistory = () => router.push('/mypage/wmti-history');

// 스타일 클래스 및 라벨 유틸 함수
const getResultTypeLabel = (type) =>
  ({
    AGGRESSIVE: '고수익 지향형',
    ACTIVE: '적극적 설계형',
    BALANCED: '균형잡힌 실속형',
    PASSIVE: '소극적 관리형',
  })[type] || '투자형';

const getRiskPreferenceLabel = (risk) =>
  ({
    STABILITY: '안정형',
    STABILITY_ORIENTED: '안정추구형',
    RISK_NEUTRAL: '위험중립형',
    ACTIVELY: '적극투자형',
    AGGRESSIVE: '공격투자형',
  })[risk] || '위험 수용';

const getResultTypeClass = (type) =>
  ({
    AGGRESSIVE: 'type-aggressive',
    ACTIVE: 'type-active',
    BALANCED: 'type-balanced',
    PASSIVE: 'type-passive',
  })[type] || '';

const getResultTypeTextClass = (type) =>
  ({
    AGGRESSIVE: 'text-aggressive',
    ACTIVE: 'text-active',
    BALANCED: 'text-balanced',
    PASSIVE: 'text-passive',
  })[type] || '';

const getRiskPreferenceClass = (risk) =>
  ({
    STABILITY: 'risk-stability',
    STABILITY_ORIENTED: 'risk-stability-oriented',
    RISK_NEUTRAL: 'risk-neutral',
    ACTIVELY: 'risk-actively',
    AGGRESSIVE: 'risk-aggressive',
  })[risk] || '';

const getRiskPreferenceTextClass = (risk) =>
  ({
    STABILITY: 'text-stability',
    STABILITY_ORIENTED: 'text-stability-oriented',
    RISK_NEUTRAL: 'text-neutral',
    ACTIVELY: 'text-actively',
    AGGRESSIVE: 'text-risk-aggressive',
  })[risk] || '';

onMounted(async () => {
  // 페이지 로드 시 즉시 스크롤을 맨 위로 이동
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (authStore.userInfo?.memberId) {
    fetchResult();
  }
});
</script>

<style scoped>
/* 기존 스타일 유지 - 여기서는 생략 */

/* 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid rgba(45, 51, 107, 0.1);
  border-top: 0.25rem solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-overlay p {
  color: var(--color-sub);
  font-weight: 600;
  font-size: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 컨테이너 설정 */
.result-page {
  max-width: 26.875rem;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 헤더 섹션 */
.result-header {
  text-align: center;
  padding: 1.5rem;
  background: var(--color-white);
  border-radius: 1.25rem;
  box-shadow: 0 1.25rem 8rem rgba(45, 51, 107, 0.15);
}

.user-greeting {
  font-size: 1rem;
  color: var(--color-sub);
  margin-bottom: 0.625rem;
  font-weight: 500;
}

.username-highlight {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: var(--color-white);
  padding: 0.3rem 0.75rem;
  margin-top: 2rem;
  border-radius: 1rem;
  font-weight: 700;
  display: inline-block;
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.3);
}

.wmti-code-display {
  margin: 1.25rem 0;
}

.code-text {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.1rem;
  display: inline-block;
  animation: slideUp 0.8s ease-out;
}

.code-suffix {
  font-size: 1.125rem;
  color: var(--color-sub);
  font-weight: 600;
  margin-left: 0.375rem;
}

.type-summary {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.type-label {
  font-size: 0.8rem;
  color: var(--color-light);
  font-weight: 500;
}

.type-value {
  font-size: 0.9rem;
  color: var(--color-white);
  font-weight: 700;
  padding: 0.375rem 0.75rem;
  background: rgba(45, 51, 107, 0.1);
  border-radius: 0.625rem;
  transition: all 0.3s ease;
}

.type-description {
  font-size: 0.675rem;
  color: var(--color-sub);
  font-weight: 500;
  text-align: center;
}

/* ResultType별 색상 클래스 */
.type-aggressive {
  background: linear-gradient(135deg, #483b8a, #5b4bad) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(72, 59, 138, 0.3);
}

.type-active {
  background: linear-gradient(135deg, #5b4bad, #6d59cf) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(91, 75, 173, 0.3);
}

.type-balanced {
  background: linear-gradient(135deg, #6d59cf, #836cfa) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(109, 89, 207, 0.3);
}

.type-passive {
  background: linear-gradient(135deg, #836cfa, #9b8dff) !important;
  box-shadow: 0 0.125rem 0.5rem rgba(131, 108, 250, 0.3);
}

/* RiskPreference별 색상 클래스 */
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

/* 텍스트 색상 클래스 */
.text-aggressive {
  color: #483b8a !important;
  font-weight: 600;
}
.text-active {
  color: #5b4bad !important;
  font-weight: 600;
}
.text-balanced {
  color: #6d59cf !important;
  font-weight: 600;
}
.text-passive {
  color: #836cfa !important;
  font-weight: 600;
}
.text-stability {
  color: #27ae60 !important;
  font-weight: 600;
}
.text-stability-oriented {
  color: #2ecc71 !important;
  font-weight: 600;
}
.text-neutral {
  color: #f39c12 !important;
  font-weight: 600;
}
.text-actively {
  color: #e67e22 !important;
  font-weight: 600;
}
.text-risk-aggressive {
  color: #e74c3c !important;
  font-weight: 600;
}

/* 카드 공통 스타일 */
.analysis-card,
.score-card,
.CustomedPortfolio-card {
  background: var(--color-white);
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 1.25rem 2.5rem rgba(45, 51, 107, 0.15);
  animation: fadeInUp 0.6s ease-out both;
}

.score-card {
  animation-delay: 0.2s;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.section-icon {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.analysis-icon {
  background: linear-gradient(135deg, #e67e22, #f39c12);
}

.score-icon {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.customed-icon {
  background: linear-gradient(135deg, #3498db, #5dade2);
}

.action-icon {
  background: linear-gradient(135deg, #8e44ad, #9b59b6);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
}

/* 카드 헤더 */
.card-header {
  margin-bottom: 1.25rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
  line-height: 1.4;
}

/* 서브섹션 */
.subsection-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-sub);
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subsection-icon {
  width: 0.5rem;
  height: 0.5rem;
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  border-radius: 0.125rem;
  flex-shrink: 0;
}

.description-icon {
  background: linear-gradient(135deg, #3498db, #5dade2);
}

/* 태그 섹션 */
.tags-section {
  margin-bottom: 1.25rem;
  overflow: hidden;
  background: rgba(45, 51, 107, 0.02);
  border-radius: 0.75rem;
  padding: 0.875rem 0;
  position: relative;
}

.tags-marquee {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.tags-marquee::before,
.tags-marquee::after {
  content: '';
  position: absolute;
  top: 0;
  width: 1.5rem;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.tags-marquee::before {
  left: 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.9), transparent);
}

.tags-marquee::after {
  right: 0;
  background: linear-gradient(to left, rgba(255, 255, 255, 0.9), transparent);
}

.tags-track {
  display: flex;
  gap: 0.625rem;
  animation: marquee 50s linear infinite;
  width: fit-content;
}

.tags-track:hover {
  animation-play-state: paused;
}

.tag-item {
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.08), rgba(125, 129, 162, 0.05));
  color: var(--color-main);
  padding: 0.4rem 0.75rem;
  border-radius: 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 0.0625rem solid rgba(45, 51, 107, 0.1);
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
}

.tag-item:hover {
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.12), rgba(125, 129, 162, 0.08));
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.15);
}

/* 설명 섹션 */
.description-section {
  border-left: 0.1875rem solid var(--color-main);
  padding: 0.875rem 0.875rem 0.875rem 1.25rem;
  background: rgba(45, 51, 107, 0.02);
  border-radius: 0.75rem;
}

.description-text {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-sub);
  margin: 0;
  font-weight: 500;
}

/* 줄바꿈 처리 */
.multiline-text {
  white-space: pre-line; /* \n을 줄바꿈으로 처리 */
}

/* 액션 섹션 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-white);
  border-radius: 1.25rem;
  box-shadow: 0 1.25rem 2.5rem rgba(45, 51, 107, 0.15);
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-family: inherit;
  width: 100%;
}

.action-button.secondary {
  background: linear-gradient(135deg, #3498db, #5dade2);
  color: var(--color-white);
  box-shadow: 0 0.25rem 0.75rem rgba(52, 152, 219, 0.3);
}

.action-button.secondary:hover {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.5rem 1.25rem rgba(52, 152, 219, 0.4);
  background: linear-gradient(135deg, #2980b9, #3498db);
}

.action-button.tertiary {
  background: linear-gradient(135deg, #95a5a6, #bdc3c7);
  color: var(--color-white);
  box-shadow: 0 0.25rem 0.75rem rgba(149, 165, 166, 0.3);
}

.action-button.tertiary:hover {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.5rem 1.25rem rgba(149, 165, 166, 0.4);
  background: linear-gradient(135deg, #7f8c8d, #95a5a6);
}

.action-button:active {
  transform: translateY(0);
}

/* 버튼 아이콘 */
.button-icon {
  width: 1rem;
  height: 1rem;
  border-radius: 0.125rem;
  flex-shrink: 0;
}

.users-icon {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

.history-icon {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6));
  mask: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24'%3e%3cpath d='M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z'/%3e%3c/svg%3e")
    center/contain no-repeat;
}

/* 페이지 하단 */
.footer-date {
  text-align: right;
  font-size: 0.7rem;
  color: var(--color-light);
  margin-top: 0.875rem;
  padding: 0.5rem 0;
  font-weight: 500;
  opacity: 0.8;
}

/* 애니메이션 */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(1.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(1.875rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 */
@media (max-width: 30rem) {
  .result-page {
    padding: 0.875rem;
    gap: 1rem;
  }

  .code-text {
    font-size: 2.25rem;
  }

  .type-summary {
    gap: 0.75rem;
  }

  .type-value {
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }

  .type-description {
    font-size: 0.55rem;
  }

  .analysis-card,
  .score-card,
  .action-section {
    padding: 1.25rem;
  }

  .bidirectional-bar {
    height: 2rem;
  }

  .bar-progress {
    height: 1.25rem;
  }

  .bar-center {
    width: 1.5rem;
    font-size: 0.65rem;
  }

  .bar-info {
    font-size: 0.75rem;
  }
}
</style>
