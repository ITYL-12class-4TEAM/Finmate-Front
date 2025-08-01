<!-- WMTI설문지 -->
<template>
  <div class="survey-page">
    <h1 class="title">나의 투자 성향 검사</h1>

    <form
      v-if="answers.length === questions.length"
      @submit.prevent="handleSubmit"
    >
      <WMTIQuestion
        v-for="(q, i) in questions"
        :key="q.id"
        :question="q"
        :index="i"
        v-model:value="answers[i]"
      />

      <button class="submit-button" :disabled="!isAllAnswered" type="submit">
        제출하기
      </button>
    </form>
  </div>
</template>

<script>
import WMTIQuestion from '@/components/wmti/WMTIQuestion.vue';
import { getWMTIQuestionsAPI, postwmtiAPI } from '@/api/wmti';
//import axios from 'axios'; // 공통 api 아님

export default {
  name: 'SurveyPage',
  components: { WMTIQuestion },
  data() {
    return {
      questions: [], // JSON API로부터 받아올 것
      answers: Array(20).fill(null), // 응답값
    };
  },
  created() {
  getWMTIQuestionsAPI()
    .then((res) => {
      const list = res.body.data;
      this.questions = list;
      this.answers = Array(list.length).fill(null);
      console.log('✅ 질문 수:', list.length);
    })
    .catch((err) => {
      console.error('설문 문항 로딩 실패:', err);
    });
},
//   created() {
//     axios
//       .get('/api/wmti/questions')
//       .then((res) => {
//         const list = res.data.body.data;
//         this.questions = list;
//         this.answers = Array(list.length).fill(null);
//         console.log('✅ 질문 수:', list.length);
//       })
//       .catch((err) => {
//         console.error('설문 문항 로딩 실패:', err);
//       });
//   },
  computed: {
    isAllAnswered() {
      return this.answers.every((a) => a !== null);
    },
  },
  methods: {
    async handleSubmit() {
      if (!this.isAllAnswered) {
        alert('모든 문항에 응답해주세요.');
        return;
      }

      try {
        const payload = { answers: this.answers };
        console.log('📤 제출 payload:', payload); // ✅ 이 위치가 핵심
        //const res = await this.$axios.post('/api/wmti/submit', payload);
        //const wmtiCode = res.data.body.wmtiCode;
        const res = await postwmtiAPI(payload);  // ✅ 공통 API 사용
        const wmtiCode = res.body.wmtiCode;

        this.$router.push({
          path: '/wmti/result',
          query: { code: wmtiCode },
        });
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
