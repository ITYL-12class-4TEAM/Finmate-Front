<template>
  <div class="preinfo-form">
    <h1 class="title">사전 정보 입력</h1>

    <form @submit.prevent="handleSubmit">
      <!-- 이름 -->
      <div class="form-group">
        <label>이름</label>
        <input v-model="form.username" type="text" required />
      </div>

      <!-- 나이 -->
      <div class="form-group">
        <label>나이</label>
        <input v-model.number="form.age" type="number" min="0" required />
      </div>

      <!-- 기혼 여부 -->
      <div class="form-group">
        <label>기혼 여부</label>
        <div class="radio-group">
          <label><input v-model="form.married" type="radio" value="true" /> 기혼</label>
          <label><input v-model="form.married" type="radio" value="false" /> 미혼</label>
        </div>
      </div>

      <!-- 월소득 -->
      <div class="form-group">
        <label>월소득 (원)</label>
        <input v-model.number="form.monthlyIncome" type="number" required />
      </div>

      <!-- 고정지출 -->
      <div class="form-group">
        <label>월 고정지출 (원)</label>
        <input v-model.number="form.fixedCost" type="number" required />
      </div>

      <!-- 투자기간 -->
      <div class="form-group">
        <label>투자 기간</label>
        <div class="radio-group">
          <label v-for="item in InvestmentPeriod" :key="item.value">
            <input v-model="form.period" type="radio" :value="item.value" />
            {{ item.label }}
          </label>
        </div>
      </div>

      <!-- 투자 목적 -->
      <div class="form-group">
        <label>투자 목적</label>
        <div class="radio-group column">
          <label v-for="item in PurposeCategory" :key="item.value">
            <input v-model="form.purposeCategory" type="radio" :value="item.value" />
            {{ item.label }}
          </label>
        </div>
      </div>

      <button type="submit" class="submit-button">제출하기</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { postPreinfoAPI } from '@/api/wmti';
import { InvestmentPeriodEnum, PurposeCategoryEnum } from '../../constants/wmtienums';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const handleWarning = (message) => {
  showToast(message, 'warning');
};
const handleError = (message) => {
  showToast(message, 'error');
};

// ✅ router 사용
const router = useRouter();

// ✅ form 상태
const form = ref({
  username: '',
  age: null,
  married: null,
  monthlyIncome: null,
  fixedCost: null,
  period: '',
  purposeCategory: '',
});

// ✅ enum 리스트
const InvestmentPeriod = InvestmentPeriodEnum;
const PurposeCategory = PurposeCategoryEnum;

// ✅ 제출 처리 함수
const handleSubmit = async () => {
  const { username, age, married, monthlyIncome, fixedCost, period, purposeCategory } = form.value;

  // 유효성 검사
  if (!username || username.length < 2) {
    handleWarning('이름을 2자 이상 입력해주세요.');
    return;
  }

  if (!age || age < 0 || age > 120) {
    handleWarning('나이를 0~120 사이로 입력해주세요.');
    return;
  }

  if (married !== 'true' && married !== 'false') {
    handleWarning('기혼 여부를 선택해주세요.');
    return;
  }

  if (!monthlyIncome || monthlyIncome < 0) {
    handleWarning('월소득을 0원 이상으로 입력해주세요.');
    return;
  }

  if (!fixedCost || fixedCost < 0 || fixedCost > monthlyIncome) {
    handleWarning('고정지출은 0원 이상이며, 월소득을 초과할 수 없습니다.');
    return;
  }

  const validPeriods = InvestmentPeriod.map((item) => item.value);
  if (!validPeriods.includes(period)) {
    handleWarning('투자 기간을 선택해주세요.');
    return;
  }

  const validPurposes = PurposeCategory.map((item) => item.value);
  if (!validPurposes.includes(purposeCategory)) {
    handleWarning('투자 목적을 선택해주세요.');
    return;
  }

  // 최종 데이터 구성
  const finalData = {
    ...form.value,
    married: form.value.married === 'true',
    platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'web',
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  };

  try {
    const res = await postPreinfoAPI(finalData);
    console.log('✅ 응답 데이터:', res);

    localStorage.setItem('preinfoSubmitted', 'true');
    router.push('/wmti/basic');
  } catch (error) {
    console.error('❌ 제출 실패:', error);
    handleError('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};

// 디버그 로그
console.log('📌 PreInfoForm mounted!');
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
  border: 0.063rem solid var(--color-light);
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
