<!-- WMTI설문지 -->
<template>
    <div class="survey-page">
      <h1 class="title">나의 투자 성향 검사</h1>
  
      <form @submit.prevent="handleSubmit">
        <div v-for="(question, index) in questions" :key="index" class="question-block">
          <p class="question-text">{{ index + 1 }}. {{ question }}</p>
  
          <div class="scale-options">
            <label v-for="score in 5" :key="score">
              <input
                type="radio"
                :name="'question-' + index"
                :value="score"
                v-model="answers[index]"
              />
              {{ score }}
            </label>
          </div>
        </div>
  
        <button class="submit-button" :disabled="!isAllAnswered" type="submit">제출하기</button>
      </form>
    </div>
  </template>

<script>
export default {
  name: 'SurveyPage',
  data() {
    return {
      questions: [
        "나는 계획적인 소비를 선호한다.",
        "위험이 있더라도 높은 수익을 추구한다.",
        // ... 총 20문항 삽입
      ],
      answers: Array(20).fill(null),
    };
  },
  computed: {
    isAllAnswered() {
      return this.answers.every(a => a !== null);
    },
  },
  methods: {
    async handleSubmit() {
      try {
        const payload = {
          answers: this.answers,
        };

        const res = await this.$axios.post('/api/survey/submit', payload);
        const wmtiCode = res.data.body.wmtiCode;

        this.$router.push({ path: '/survey/result', query: { code: wmtiCode } });
      } catch (err) {
        console.error('제출 실패:', err);
        alert('제출 중 오류가 발생했습니다.');
      }
    },
  },
};
</script>

<style scoped>
.survey-page {
  max-width: 430px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Inter', sans-serif;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}

.question-block {
  margin-bottom: 1.5rem;
}

.question-text {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.scale-options {
  display: flex;
  justify-content: space-between;
}

.submit-button {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  background-color: var(--color-main);
  color: white;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  margin-top: 2rem;
}
.submit-button:disabled {
  background-color: #ccc;
}
</style>
