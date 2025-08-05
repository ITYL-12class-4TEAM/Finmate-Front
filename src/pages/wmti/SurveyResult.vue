<template>
  <div class="result-page">
    <!-- 뒤로가기 버튼 -->
    <BackButton title="투자 성향 결과" to="/wmti/basic" />

    <!-- 헤더 섹션 -->
    <div class="result-header">
      <div class="user-greeting">
        <span class="username-highlight">{{ userName }}</span
        >님의 투자 성향은
      </div>
      <div class="wmti-code-display">
        <span class="code-text">{{ wmtiCode }}</span>
        <span class="code-suffix">입니다</span>
      </div>
      <div class="type-summary">
        <div class="type-item">
          <span class="type-label">투자자 유형</span>
          <span class="type-value" :class="getResultTypeClass(resultType)">{{
            resultType
          }}</span>
          <span
            class="type-description"
            :class="getResultTypeTextClass(resultType)"
            >{{ getResultTypeLabel(resultType) }}</span
          >
        </div>
        <div class="type-item">
          <span class="type-label">리스크 수용도</span>
          <span
            class="type-value"
            :class="getRiskPreferenceClass(riskPreference)"
            >{{ riskPreference }}</span
          >
          <span
            class="type-description"
            :class="getRiskPreferenceTextClass(riskPreference)"
            >{{ getRiskPreferenceLabel(riskPreference) }}</span
          >
        </div>
      </div>
    </div>

    <!-- 성향 분석 카드 -->
    <div class="analysis-card">
      <h3 class="section-title analysis-title">💡 투자 성향 분석</h3>
      <div class="card-header">
        <h4 class="card-title">{{ analysis.aka }}</h4>
      </div>

      <!-- 태그 섹션 - 전광판 효과 -->
      <div class="tags-section">
        <h4 class="subsection-title">🏷️ 성향 키워드</h4>
        <div class="tags-marquee">
          <div
            class="tags-track"
            v-if="analysis.tag && analysis.tag.length > 0"
          >
            <!-- 첫 번째 세트 -->
            <div
              class="tag-item"
              v-for="(tag, index) in analysis.tag"
              :key="'first-' + index"
            >
              #{{ tag }}
            </div>
            <!-- 두 번째 세트 (무한 반복용) -->
            <div
              class="tag-item"
              v-for="(tag, index) in analysis.tag"
              :key="'second-' + index"
            >
              #{{ tag }}
            </div>
          </div>
        </div>
      </div>

      <!-- 설명 섹션 -->
      <div class="description-section">
        <h4 class="subsection-title">📋 상세 분석</h4>
        <p class="description-text">{{ analysis.description }}</p>
      </div>
    </div>

    <!-- 점수 차트 카드 -->
    <div class="score-card">
      <h3 class="section-title score-title">📊 성향 분석 결과</h3>
      <div class="score-grid">
        <div class="score-item">
          <div class="dimension-header">
            <span class="dimension-label">A vs I</span>
          </div>
          <div class="bidirectional-bar">
            <div class="bar-left">
              <span class="bar-info" :class="{ dominant: a === 'A' }"
                >A {{ Math.round(ascore) }}%</span
              >
              <div
                v-if="a === 'A'"
                class="bar-progress left bar-a"
                :style="{ width: ascore + '%' }"
              ></div>
            </div>
            <div class="bar-center">50</div>
            <div class="bar-right">
              <div
                v-if="a === 'I'"
                class="bar-progress right bar-i"
                :style="{ width: iscore + '%' }"
              ></div>
              <span class="bar-info" :class="{ dominant: a === 'I' }"
                >I {{ Math.round(iscore) }}%</span
              >
            </div>
          </div>
        </div>

        <div class="score-item">
          <div class="dimension-header">
            <span class="dimension-label">P vs B</span>
          </div>
          <div class="bidirectional-bar">
            <div class="bar-left">
              <span class="bar-info" :class="{ dominant: p === 'P' }"
                >P {{ Math.round(pscore) }}%</span
              >
              <div
                v-if="p === 'P'"
                class="bar-progress left bar-p"
                :style="{ width: pscore + '%' }"
              ></div>
            </div>
            <div class="bar-center">50</div>
            <div class="bar-right">
              <div
                v-if="p === 'B'"
                class="bar-progress right bar-b"
                :style="{ width: bscore + '%' }"
              ></div>
              <span class="bar-info" :class="{ dominant: p === 'B' }"
                >B {{ Math.round(bscore) }}%</span
              >
            </div>
          </div>
        </div>

        <div class="score-item">
          <div class="dimension-header">
            <span class="dimension-label">M vs W</span>
          </div>
          <div class="bidirectional-bar">
            <div class="bar-left">
              <span class="bar-info" :class="{ dominant: m === 'M' }"
                >M {{ Math.round(mscore) }}%</span
              >
              <div
                v-if="m === 'M'"
                class="bar-progress left bar-m"
                :style="{ width: mscore + '%' }"
              ></div>
            </div>
            <div class="bar-center">50</div>
            <div class="bar-right">
              <div
                v-if="m === 'W'"
                class="bar-progress right bar-w"
                :style="{ width: wscore + '%' }"
              ></div>
              <span class="bar-info" :class="{ dominant: m === 'W' }"
                >W {{ Math.round(wscore) }}%</span
              >
            </div>
          </div>
        </div>

        <div class="score-item">
          <div class="dimension-header">
            <span class="dimension-label">L vs C</span>
          </div>
          <div class="bidirectional-bar">
            <div class="bar-left">
              <span class="bar-info" :class="{ dominant: l === 'L' }"
                >L {{ Math.round(lscore) }}%</span
              >
              <div
                v-if="l === 'L'"
                class="bar-progress left bar-l"
                :style="{ width: lscore + '%' }"
              ></div>
            </div>
            <div class="bar-center">50</div>
            <div class="bar-right">
              <div
                v-if="l === 'C'"
                class="bar-progress right bar-c"
                :style="{ width: cscore + '%' }"
              ></div>
              <span class="bar-info" :class="{ dominant: l === 'C' }"
                >C {{ Math.round(cscore) }}%</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 테마 포트폴리오 섹션 (미래 구현) -->
    <ThemePortfolio
      :wmtiCode="wmtiCode"
      :resultType="resultType"
      :riskPreference="riskPreference"
      :userName="userName"
    />

    <!-- 액션 버튼 -->
    <div class="action-section">
      <h3 class="section-title action-title">🚀 다음 단계</h3>
      <div class="action-buttons">
        <button class="action-button primary" @click="goToRecommend">
          <i class="fa-solid fa-chart-line"></i>
          상품 추천받기
        </button>
        <button class="action-button secondary" @click="goToWMTIList">
          <i class="fa-solid fa-users"></i>
          16가지 투자성향 보기
        </button>
        <button class="action-button tertiary" @click="goToHistory">
          <i class="fa-solid fa-clock-rotate-left"></i>
          내 검사 이력 보기
        </button>
      </div>
    </div>

    <!-- 페이지 하단 제출 시각 -->
    <div class="footer-date">검사 완료 시각: {{ formattedDate }}</div>
  </div>
</template>

<script>
import { getWMTIResultAPI } from '@/api/wmti';
import { decodeJwt } from '@/utils/jwt';
import { getWMTIAnalysisAPI } from '@/api/wmti';
import BackButton from '@/components/common/BackButton.vue';
import ThemePortfolio from '@/components/wmti/ThemePortfolio.vue';

export default {
  name: 'SurveyResult',
  components: {
    BackButton, ThemePortfolio,
  },
  data() {
    return {
      userName: '',
      wmtiCode: '',
      a: '',
      p: '',
      m: '',
      l: '',
      ascore: 0,
      iscore: 0,
      pscore: 0,
      bscore: 0,
      mscore: 0,
      wscore: 0,
      lscore: 0,
      cscore: 0,
      resultType: '',
      riskPreference: '',
      analysis: {
        aka: '',
        tag: [],
        description: '',
      },
      createdAt: [],
    };
  },
  computed: {
    aOrIScore() {
      return this.a === 'A' ? this.ascore : this.iscore;
    },
    pOrBScore() {
      return this.p === 'P' ? this.pscore : this.bscore;
    },
    mOrWScore() {
      return this.m === 'M' ? this.mscore : this.wscore;
    },
    lOrCScore() {
      return this.l === 'L' ? this.lscore : this.cscore;
    },
    formattedDate() {
      if (!this.createdAt || this.createdAt.length !== 6) {
        return '제출 시각 없음';
      }
      const date = new Date(...this.createdAt);
      return date.toLocaleString('ko-KR');
    },
  },
  mounted() {
    this.fetchResult();
  },
  methods: {
    async fetchResult() {
      const res = await getWMTIResultAPI(this.getMemberIdFromToken());
      console.log('✅ 응답 전체:', res);

      const data = res.body?.data;
      console.log('✅ data 내용:', data);

      this.userName = data.userName;
      this.wmtiCode = data.wmtiCode;
      this.a = data.a;
      this.p = data.p;
      this.m = data.m;
      this.l = data.l;
      this.ascore = data.ascore;
      this.iscore = data.iscore;
      this.pscore = data.pscore;
      this.bscore = data.bscore;
      this.mscore = data.mscore;
      this.wscore = data.wscore;
      this.lscore = data.lscore;
      this.cscore = data.cscore;
      this.resultType = data.resultType;
      this.riskPreference = data.riskPreference;

      //this.analysis = data.analysis?.[data.wmtiCode] || {};
      this.createdAt = [...data.createdAt] || [];
      
      await this.fetchAnalysis(this.wmtiCode);
    },
    async fetchAnalysis(wmtiCode) {
      try {
        const res = await getWMTIAnalysisAPI(wmtiCode);
        console.log('🔍 analysis 응답:', res);
        const data = res.body?.data;
        this.analysis = data;
      } catch (e) {
        console.error('⚠️ 분석 정보 불러오기 실패', e);
      }
    },
    getMemberIdFromToken() {
      const token = localStorage.getItem('accessToken');
      return decodeJwt(token)?.memberId;
    },
    goToRecommend() {
      this.$router.push('/recommend');
    },
    goToWMTIList() {
      this.$router.push('/wmti/list');
    },
    goToHistory() {
      this.$router.push('/mypage/history');
    },
    getResultTypeLabel(resultType) {
      const labels = {
        AGGRESSIVE: '고수익 지향형',
        ACTIVE: '적극적 설계형',
        BALANCED: '균형잡힌 실속형',
        PASSIVE: '소극적 관리형',
      };
      return labels[resultType] || '투자형';
    },
    getRiskPreferenceLabel(riskPreference) {
      const labels = {
        STABILITY: '안정형',
        STABILITY_ORIENTED: '안정추구형',
        RISK_NEUTRAL: '위험중립형',
        ACTIVELY: '적극투자형',
        AGGRESSIVE: '공격투자형',
      };
      return labels[riskPreference] || '위험 수용';
    },
    getResultTypeClass(resultType) {
      const classes = {
        AGGRESSIVE: 'type-aggressive',
        ACTIVE: 'type-active',
        BALANCED: 'type-balanced',
        PASSIVE: 'type-passive',
      };
      return classes[resultType] || '';
    },
    getResultTypeTextClass(resultType) {
      const classes = {
        AGGRESSIVE: 'text-aggressive',
        ACTIVE: 'text-active',
        BALANCED: 'text-balanced',
        PASSIVE: 'text-passive',
      };
      return classes[resultType] || '';
    },
    getRiskPreferenceClass(riskPreference) {
      const classes = {
        STABILITY: 'risk-stability',
        STABILITY_ORIENTED: 'risk-stability-oriented',
        RISK_NEUTRAL: 'risk-neutral',
        ACTIVELY: 'risk-actively',
        AGGRESSIVE: 'risk-aggressive',
      };
      return classes[riskPreference] || '';
    },
    getRiskPreferenceTextClass(riskPreference) {
      const classes = {
        STABILITY: 'text-stability',
        STABILITY_ORIENTED: 'text-stability-oriented',
        RISK_NEUTRAL: 'text-neutral',
        ACTIVELY: 'text-actively',
        AGGRESSIVE: 'text-risk-aggressive',
      };
      return classes[riskPreference] || '';
    },
  },
};
</script>

<style scoped>
/* 컨테이너 설정 */
.result-page {
  max-width: 23.438rem; /* 375px */
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(
    135deg,
    var(--color-bg-light) 0%,
    rgba(238, 238, 243, 0.5) 100%
  );
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 헤더 섹션 */
.result-header {
  text-align: center;
  padding: 1.5rem 0;
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    rgba(248, 249, 252, 0.8) 100%
  );
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.08);
}

.user-greeting {
  font-size: 1rem;
  color: var(--color-sub);
  margin-bottom: 0.625rem;
  font-weight: 500;
}

.username-highlight {
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: var(--color-white);
  padding: 0.3rem 0.75rem;
  border-radius: 1rem;
  font-weight: 700;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.3);
}

.wmti-code-display {
  margin: 1.25rem 0;
}

.code-text {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-main), #4a5299);
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
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
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
  padding: 0.2rem 0.625rem;
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
  background: #483b8a !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(72, 59, 138, 0.3);
}

.type-active {
  background: #5b4bad !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(91, 75, 173, 0.3);
}

.type-balanced {
  background: #6d59cf !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(109, 89, 207, 0.3);
}

.type-passive {
  background: #836cfa !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(131, 108, 250, 0.3);
}

/* RiskPreference별 색상 클래스 */
.risk-stability {
  background: #27ae60 !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.risk-stability-oriented {
  background: #2ecc71 !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
}

.risk-neutral {
  background: #f39c12 !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
}

.risk-actively {
  background: #e67e22 !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(230, 126, 34, 0.3);
}

.risk-aggressive {
  background: #e74c3c !important;
  color: var(--color-white);
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

/* 텍스트 색상 클래스 - ResultType */
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

/* 텍스트 색상 클래스 - RiskPreference */
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

/* 분석 카드 */
.analysis-card {
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    rgba(248, 249, 252, 0.8) 100%
  );
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.08);
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  line-height: 1.4;
  flex: 1;
  min-width: 180px;
  margin: 0;
}

.tags-section {
  margin-bottom: 1.25rem;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.02),
    rgba(125, 129, 162, 0.01)
  );
  border-radius: 0.875rem;
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
  background: linear-gradient(to right, rgba(248, 249, 252, 0.9), transparent);
}

.tags-marquee::after {
  right: 0;
  background: linear-gradient(to left, rgba(248, 249, 252, 0.9), transparent);
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
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.08),
    rgba(125, 129, 162, 0.05)
  );
  color: var(--color-main);
  padding: 0.4rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(45, 51, 107, 0.1);
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
}

.tag-item:hover {
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.12),
    rgba(125, 129, 162, 0.08)
  );
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.15);
}

.description-section {
  border-left: 3px solid var(--color-main);
  padding-left: 0.875rem;
  background: rgba(45, 51, 107, 0.02);
  padding: 0.875rem 0.875rem 0.875rem 1.25rem;
  border-radius: 0.625rem;
}

.description-text {
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-sub);
  margin: 0;
  font-weight: 500;
}

/* 섹션 타이틀 공통 스타일 */
.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.analysis-title {
  color: #e67e22;
  background: linear-gradient(
    135deg,
    rgba(230, 126, 34, 0.1),
    rgba(230, 126, 34, 0.05)
  );
  padding: 0.4rem 0.625rem;
  border-radius: 0.625rem;
  border-left: 3px solid #e67e22;
}

.score-title {
  color: #27ae60;
  background: linear-gradient(
    135deg,
    rgba(39, 174, 96, 0.1),
    rgba(39, 174, 96, 0.05)
  );
  padding: 0.4rem 0.625rem;
  border-radius: 0.625rem;
  border-left: 3px solid #27ae60;
}

.action-title {
  color: #8e44ad;
  background: linear-gradient(
    135deg,
    rgba(142, 68, 173, 0.1),
    rgba(142, 68, 173, 0.05)
  );
  padding: 0.4rem 0.625rem;
  border-radius: 0.625rem;
  border-left: 3px solid #8e44ad;
  text-align: center;
  justify-content: center;
}

.portfolio-title {
  color: #2c3e50;
  background: linear-gradient(
    135deg,
    rgba(44, 62, 80, 0.1),
    rgba(44, 62, 80, 0.05)
  );
  padding: 0.4rem 0.625rem;
  border-radius: 0.625rem;
  border-left: 3px solid #2c3e50;
}

/* 서브섹션 타이틀 */
.subsection-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-sub);
  margin: 0 0 0.625rem 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* 점수 카드 */
.score-card {
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    rgba(248, 249, 252, 0.8) 100%
  );
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.08);
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.score-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dimension-header {
  text-align: center;
}

.dimension-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-main);
  background: rgba(45, 51, 107, 0.1);
  padding: 0.375rem 0.875rem;
  border-radius: 0.875rem;
  display: inline-block;
}

/* 양방향 막대그래프 */
.bidirectional-bar {
  display: flex;
  align-items: center;
  height: 2.25rem;
  background: rgba(185, 187, 204, 0.1);
  border-radius: 1.125rem;
  padding: 0.2rem;
  position: relative;
}

.bar-left,
.bar-right {
  flex: 1;
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
}

.bar-left {
  justify-content: flex-start;
  padding-left: 0.75rem;
}

.bar-right {
  justify-content: flex-end;
  padding-right: 0.75rem;
}

.bar-center {
  width: 1.75rem;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-sub);
  background: var(--color-white);
  border-radius: 0.625rem;
  padding: 0.2rem 0;
  z-index: 2;
  border: 2px solid rgba(185, 187, 204, 0.3);
}

.bar-progress {
  height: 1.375rem;
  border-radius: 0.625rem;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  animation: progressLoad 1.2s ease-out 0.6s both;
}

.bar-progress.left {
  right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.bar-progress.right {
  left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.bar-info {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-sub);
  z-index: 3;
  position: relative;
  transition: all 0.3s ease;
}

.bar-info.dominant {
  font-weight: 800;
  color: var(--color-main);
  text-shadow: 0 1px 2px rgba(45, 51, 107, 0.2);
  transform: scale(1.05);
}

/* 각 차원별 색상 */
.bar-a,
.bar-i {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

.bar-p,
.bar-b {
  background: linear-gradient(90deg, #e67e22, #f8c471);
}

.bar-m,
.bar-w {
  background: linear-gradient(90deg, #27ae60, #58d68d);
}

/* 각 차원별 색상 */
.bar-a,
.bar-i {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

.bar-p,
.bar-b {
  background: linear-gradient(90deg, #e67e22, #f8c471);
}

.bar-m,
.bar-w {
  background: linear-gradient(90deg, #27ae60, #58d68d);
}

.bar-l,
.bar-c {
  background: linear-gradient(90deg, #8e44ad, #bb8fce);
}

/* 테마 포트폴리오 섹션 */
.thema-portfolio-section {
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    rgba(248, 249, 252, 0.8) 100%
  );
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.08);
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.portfolio-placeholder {
  background: linear-gradient(
    135deg,
    rgba(44, 62, 80, 0.05),
    rgba(44, 62, 80, 0.02)
  );
  border: 2px dashed rgba(44, 62, 80, 0.2);
  border-radius: 0.875rem;
  padding: 2rem 1rem;
  text-align: center;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.placeholder-content i {
  font-size: 2rem;
  color: #2c3e50;
  opacity: 0.6;
}

.placeholder-content p {
  font-size: 0.875rem;
  color: var(--color-sub);
  margin: 0;
  font-weight: 500;
}

.coming-soon {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: var(--color-white);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 액션 섹션 */
.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 0;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.action-button {
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  font-family: inherit;
  width: 100%;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: var(--color-white);
  box-shadow: 0 4px 15px rgba(45, 51, 107, 0.3);
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(45, 51, 107, 0.4);
  background: linear-gradient(135deg, #1e2347, var(--color-main));
}

.action-button.secondary {
  background: linear-gradient(135deg, #3498db, #5dade2);
  color: var(--color-white);
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.action-button.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(52, 152, 219, 0.4);
  background: linear-gradient(135deg, #2980b9, #3498db);
}

.action-button.tertiary {
  background: linear-gradient(135deg, #95a5a6, #bdc3c7);
  color: var(--color-white);
  box-shadow: 0 4px 15px rgba(149, 165, 166, 0.3);
}

.action-button.tertiary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(149, 165, 166, 0.4);
  background: linear-gradient(135deg, #7f8c8d, #95a5a6);
}

.action-button:active {
  transform: translateY(0);
}

.action-button i {
  font-size: 1rem;
}

/* 페이지 하단 제출 시각 */
.footer-date {
  text-align: right;
  font-size: 0.7rem;
  color: var(--color-light);
  margin-top: 0.875rem;
  padding: 0.4rem 0;
  font-weight: 500;
  opacity: 0.8;
}

/* 전광판 애니메이션 */
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progressLoad {
  from {
    width: 0;
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
}

/* 반응형 */
@media (max-width: 375px) {
  .result-page {
    padding: 0.875rem;
    gap: 1rem;
  }

  .code-text {
    font-size: 2.25rem;
  }

  .type-summary {
    gap: 1.25rem;
  }

  .analysis-card,
  .score-card {
    padding: 1rem;
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