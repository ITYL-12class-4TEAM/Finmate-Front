<template>
  <div class="survey-main">
    <header class="header">
      <img class="logo" :src="logo" alt="로고" />
    </header>

    <section class="intro">
      <h1>투자 성향 분석 서비스</h1>
      <p class="note">*본 서비스는 고객님의 기본적인 정보를 입력받습니다.*</p>
      <p class="description">
        이는 고객님의 투자스타일, 투자성향, 투자여건을 정확하게 파악하기 위한 것으로,<br />
        <strong>‘사용자 특화 금융상품 추천’</strong> 및
        <strong>‘나의 WMTI 투자스타일은?’</strong> 등의 기능을 위해 설문에 응해주세요.
      </p>
    </section>

    <section class="step-card">
      <div class="step-header">
        <div class="step-icon">1</div>
        <span>기본정보 / 투자목적</span>
      </div>
      <button class="step-button" @click="goToPreInfo">시작하기</button>
    </section>

    <section class="step-card" :class="{ disabled: !step2Enabled }">
      <div class="step-header">
        <div class="step-icon">2</div>
        <span>나의 WMTI 검사하기</span>
      </div>
      <button class="step-button" :disabled="!step2Enabled" @click="goToSurvey">검사하기</button>
    </section>
  </div>
</template>

<script>
import logo from '../../assets/images/logo.png';

export default {
  name: 'BasicSurvey',
  data() {
    return {
      step2Enabled: false,
      logo,
    };
  },
  created() {
    // 로컬스토리지 또는 글로벌 상태에서 사전정보 입력 여부 확인
    const preinfoDone = localStorage.getItem('preinfoSubmitted');
    this.step2Enabled = preinfoDone === 'true';
    console.log('🔍 BasicSurvey mounted!');
  },
  methods: {
    goToPreInfo() {
      this.$router.push('/wmti/preinfo');
    },
    goToSurvey() {
      this.$router.push('/wmti/survey'); // 또는 '/wmti/start'
    },
  },
};
</script>

<style scoped>
.survey-main {
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  padding: 1.5rem 1rem;
  font-family: 'Inter', sans-serif;
}

.header {
  text-align: left;
  margin-bottom: 2rem;
}

.logo {
  height: 2.5rem;
}

.intro h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.note {
  font-size: 0.875rem;
  color: #7d81a2;
}

.description {
  font-size: 0.875rem;
  line-height: 1.5;
  margin-top: 0.5rem;
  color: #333;
}

.step-card {
  background-color: #ffffff;
  border: 2px solid #eeeef3;
  border-radius: 1rem;
  box-shadow: 0 4px 12px #0000001a;
  padding: 1.25rem;
  margin-top: 1.5rem;
}

.step-card.disabled {
  opacity: 0.5;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1rem;
}

.step-icon {
  width: 1.75rem;
  height: 1.75rem;
  background-color: #7d81a2;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 1.75rem;
  font-size: 1rem;
  font-weight: bold;
}

.step-button {
  width: 100%;
  background-color: #7d81a2;
  color: white;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.step-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
