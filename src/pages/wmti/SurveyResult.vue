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
