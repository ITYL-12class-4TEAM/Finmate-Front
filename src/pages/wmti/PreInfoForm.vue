<template>
  <div class="preinfo-form">
    <h1 class="title">사전 정보 입력</h1>

    <form @submit.prevent="handleSubmit">
      <!-- 이름 -->
      <div class="form-group">
        <label>이름</label>
        <input type="text" v-model="form.username" required />
      </div>

      <!-- 나이 -->
      <div class="form-group">
        <label>나이</label>
        <input type="number" v-model.number="form.age" min="0" required />
      </div>

      <!-- 기혼 여부 -->
      <div class="form-group">
        <label>기혼 여부</label>
        <div class="radio-group">
          <label
            ><input type="radio" value="true" v-model="form.married" />
            기혼</label
          >
          <label
            ><input type="radio" value="false" v-model="form.married" />
            미혼</label
          >
        </div>
      </div>

      <!-- 월소득 -->
      <div class="form-group">
        <label>월소득 (원)</label>
        <input type="number" v-model.number="form.monthlyIncome" required />
      </div>

      <!-- 고정지출 -->
      <div class="form-group">
        <label>월 고정지출 (원)</label>
        <input type="number" v-model.number="form.fixedCost" required />
      </div>

      <!-- 투자기간 -->
      <div class="form-group">
        <label>투자 기간</label>
        <div class="radio-group">
          <label
            ><input type="radio" value="단기" v-model="form.period" />
            단기</label
          >
          <label
            ><input type="radio" value="중기" v-model="form.period" />
            중기</label
          >
          <label
            ><input type="radio" value="장기" v-model="form.period" />
            장기</label
          >
        </div>
      </div>

      <!-- 투자 목적 -->
      <div class="form-group">
        <label>투자 목적</label>
        <div class="radio-group column">
          <label
            ><input
              type="radio"
              value="비상자금 마련"
              v-model="form.purposeCategory"
            />
            비상자금 마련</label
          >
          <label
            ><input
              type="radio"
              value="여행자금"
              v-model="form.purposeCategory"
            />
            여행자금</label
          >
          <label
            ><input
              type="radio"
              value="결혼자금"
              v-model="form.purposeCategory"
            />
            결혼자금</label
          >
          <label
            ><input
              type="radio"
              value="주택구입"
              v-model="form.purposeCategory"
            />
            주택구입</label
          >
          <label
            ><input
              type="radio"
              value="노후준비"
              v-model="form.purposeCategory"
            />
            노후준비</label
          >
          <label
            ><input
              type="radio"
              value="자녀교육비"
              v-model="form.purposeCategory"
            />
            자녀교육비</label
          >
          <label
            ><input
              type="radio"
              value="자산증식"
              v-model="form.purposeCategory"
            />
            자산증식</label
          >
          <label
            ><input type="radio" value="기타" v-model="form.purposeCategory" />
            기타</label
          >
        </div>
      </div>

      <button type="submit" class="submit-button">제출하기</button>
    </form>
  </div>
</template>

<script>
import { postPreinfoAPI } from '@/api/wmti';

export default {
  name: 'PreInfoForm',
  data() {
    return {
      mounted() {
        console.log('📌 PreInfoForm mounted!');
      },
      form: {
        username: '',
        age: null,
        married: null,
        monthlyIncome: null,
        fixedCost: null,
        period: '',
        purposeCategory: '',
      },
    };
  },
  methods: {
    async handleSubmit() {
      const {
        username,
        age,
        married,
        monthlyIncome,
        fixedCost,
        period,
        purposeCategory,
      } = this.form;

      // 이름 검사
      if (!username || username.length < 2) {
        alert('이름을 2자 이상 입력해주세요.');
        return;
      }

      // 나이 검사
      if (!age || age < 0 || age > 120) {
        alert('나이를 0~120 사이로 입력해주세요.');
        return;
      }

      // 기혼 여부 검사
      if (married !== 'true' && married !== 'false') {
        alert('기혼 여부를 선택해주세요.');
        return;
      }

      // 월소득 검사
      if (!monthlyIncome || monthlyIncome < 0) {
        alert('월소득을 0원 이상으로 입력해주세요.');
        return;
      }

      // 고정지출 검사
      if (!fixedCost || fixedCost < 0 || fixedCost > monthlyIncome) {
        alert('고정지출은 0원 이상이며, 월소득을 초과할 수 없습니다.');
        return;
      }

      // 투자기간 검사
      if (!['단기', '중기', '장기'].includes(period)) {
        alert('투자 기간을 선택해주세요.');
        return;
      }

      // 투자목적 검사
      const validPurposes = [
        '비상자금 마련',
        '여행자금',
        '결혼자금',
        '주택구입',
        '노후준비',
        '자녀교육비',
        '자산증식',
        '기타',
      ];
      if (!validPurposes.includes(purposeCategory)) {
        alert('투자 목적을 선택해주세요.');
        return;
      }
      const finalData = {
        ...this.form,
        married: this.form.married === 'true',
      };

      // 모든 유효성 통과 → 제출
      try {
        // ✅ POST 요청 보내기 (토큰 등 헤더 필요시 설정 가능)
        // const response = await axios.post('/api/preinfo/submit', finalData);

        // console.log('✅ 응답 데이터:', response.data);

        const res = await postPreinfoAPI(finalData);
        console.log('✅ 응답 데이터:', res);

        // 응답 성공 시
        localStorage.setItem('preinfoSubmitted', 'true');
        this.$router.push('/wmti/basic');
      } catch (error) {
        console.error('❌ 제출 실패:', error);
        alert('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    },
  },
};
</script>

<style scoped>
.preinfo-form {
  max-width: 26.875rem;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Inter', sans-serif;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

input[type='text'],
input[type='number'] {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--color-light);
  border-radius: 0.5rem;
  font-size: 1rem;
}

.radio-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.radio-group.column {
  flex-direction: column;
}

.radio-group label {
  font-size: 0.95rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-main);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
}
</style>
