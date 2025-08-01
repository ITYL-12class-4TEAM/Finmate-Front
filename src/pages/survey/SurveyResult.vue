<template>
  <div class="result-container">
    <back-button title="투자 성향 분석 결과" />

    <div class="result-card">
      <div class="result-header">
        <h2 class="result-title title-bg">{{ memberName }}</h2>님의 투자 성향은
        <h1 class="result-type">{{ resultData.wmtiType }}</h1>
        <p class="result-description">{{ resultData.description }}</p>
      </div>

      <div class="info-section">
        <div class="info-item">
          <span class="info-label">투자 기간</span>
          <span class="info-value">{{
            getEnumLabel(InvestmentPeriodEnum, resultData.investmentPeriod)
          }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">위험 선호도</span>
          <span class="info-value">{{
            getEnumLabel(RiskPreferenceEnum, resultData.riskPreference)
          }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">투자 목적</span>
          <span class="info-value">{{
            getEnumLabel(PurposeCategoryEnum, resultData.purposeCategory)
          }}</span>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <button class="primary-button" @click="goToDetail">
        상세 분석 결과 보기
      </button>
      <button class="secondary-button" @click="goToPortfolio">
        맞춤 포트폴리오 보기
      </button>
    </div>
  </div>
</template>

<script setup>
// ...existing code...
</script>

<style scoped>
.result-container {
  padding: 24px;
  min-height: 100vh;
  background-color: var(--color-bg-light);
}

.result-card {
  background: var(--color-white);
  border-radius: 16px;
  padding: 32px 24px;
  margin: 24px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.title-bg {
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0);
  padding: 8px 16px;
  border-radius: 8px;
  color: var(--color-main);
}

.result-title {
  color: var(--color-sub);
  font-size: 18px;
  margin-bottom: 12px;
}



.result-type {
  color: var(--color-main);
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
}

.result-description {
  color: var(--color-sub);
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-line;
}

.info-section {
  border-top: 1px solid var(--color-bg-light);
  padding-top: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.info-label {
  color: var(--color-sub);
  font-size: 16px;
}

.info-value {
  color: var(--color-main);
  font-weight: 600;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-button,
.secondary-button {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary-button {
  background-color: var(--color-main);
  color: var(--color-white);
}

.primary-button:hover {
  background-color: #232857;
}

.secondary-button {
  background-color: var(--color-white);
  color: var(--color-main);
  border: 2px solid var(--color-main);
}

.secondary-button:hover {
  background-color: var(--color-bg-light);
}

@media (max-width: 768px) {
  .result-container {
    padding: 16px;
  }

  .result-card {
    padding: 24px 16px;
  }

  .result-type {
    font-size: 28px;
  }
}
</style>








<template>
    <div class="result-container">
      <h1 class="code">
        당신의 투자 성향은 <span>{{ wmtiCode }}</span
        >입니다
      </h1>
      <p class="summary">{{ resultType }} / {{ riskPreference }}</p>
      <p class="username">이름: {{ userName }}</p>
  
      <div class="score-chart">
        <p>A vs I: {{ aOrIScore }}%</p>
        <p>P vs B: {{ pOrBScore }}%</p>
        <p>M vs W: {{ mOrWScore }}%</p>
        <p>L vs C: {{ lOrCScore }}%</p>
      </div>
  
      <div class="detail">
        <p>코드 구성: {{ a }}{{ p }}{{ m }}{{ l }}</p>
        <p class="aka">{{ analysis.aka }}</p>
        <ul class="tags">
          <li v-for="(t, index) in analysis.tag" :key="index">#{{ t }}</li>
        </ul>
        <div class="description">{{ analysis.description }}</div>
        <p>제출 시각: {{ formattedDate }}</p>
      </div>
  
      <button @click="goToRecommend">상품 추천받기</button>
    </div>
  </template>
  
  <script>
  import { getWMTIResultAPI } from '@/api/wmti';
  import { decodeJwt } from '@/utils/jwt';
  import { getWMTIAnalysisAPI } from '@/api/wmti';
  
  export default {
    name: 'SurveyResult',
    components: {},
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
  
        //const data = res.data.body.data;
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
  
        this.analysis = data.analysis?.[data.wmtiCode] || {};
        this.createdAt = [...data.createdAt] || [];
        await this.fetchAnalysis(this.wmtiCode);
      },
      async fetchAnalysis(wmtiCode) {
        try {
          const res = await getWMTIAnalysisAPI(wmtiCode);
          console.log('🔍 analysis 응답:', res);
          const data = res.body?.data;
          this.analysis = data; // aka, tag[], description 포함됨
        } catch (e) {
          console.error('⚠️ 분석 정보 불러오기 실패', e);
        }
      },
      getMemberIdFromToken() {
        const token = localStorage.getItem('accessToken');
        // JWT decode 로직 필요 시 별도 추가
        return decodeJwt(token)?.memberId;
      },
      goToRecommend() {
        this.$router.push('/recommend');
      },
    },
  };
  </script>
  
  <style scoped>
  .result-container {
    padding: 2rem;
  }
  .code {
    font-size: 2rem;
    font-weight: bold;
  }
  </style>