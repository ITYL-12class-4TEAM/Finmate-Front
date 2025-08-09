<template>
  <div class="survey-page">
    <!-- 뒤로가기 버튼 -->
    <BackButton title="돌아가기" to="/wmti/basic" />

    <!-- 헤더 섹션 -->
    <div class="survey-header">
      <h1 class="main-title">나의 투자 성향 검사</h1>
      <h2 class="sub-title">WMTI 설문지</h2>

      <!-- 진행률 표시 -->
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="progress-text">
          {{ answeredCount }} / {{ questions.length }} 완료 ({{ Math.round(progressPercentage) }}%)
        </div>
      </div>
    </div>

    <!-- 안내 메시지 -->
    <div class="instruction-card">
      <div class="instruction-content">
        <div class="instruction-icon">💡</div>
        <div class="instruction-text">
          <p>
            <strong>총 {{ questions.length }}개의 문항</strong>으로 구성되어 있습니다.
          </p>
          <p>
            질문을 자세히 읽으시고, <strong>5개의 선택지 중</strong><br />
            고객님과 가장 가깝다고 생각하는 답변을 선택해주세요.
          </p>
        </div>
      </div>
    </div>

    <!-- 설문 문항들 -->
    <form v-if="questions.length > 0" class="survey-form" @submit.prevent="handleSubmit">
      <div class="questions-container">
        <WMTIQuestion
          v-for="(question, index) in questions"
          :key="question.id"
          :ref="(el) => setQuestionRef(el, index)"
          v-model:value="answers[index]"
          :question="question"
          :index="index"
          :data-question-index="index"
          class="survey-question"
          @update:value="handleAnswerChange(index, $event)"
        />
      </div>

      <!-- 제출 버튼 -->
      <div class="submit-section">
        <div v-if="!isAllAnswered" class="completion-status">
          <i class="fa-solid fa-exclamation-circle"></i>
          아직 {{ questions.length - answeredCount }}개 문항이 남았습니다
        </div>
        <div v-else class="completion-status completed">
          <i class="fa-solid fa-check-circle"></i>
          모든 문항이 완료되었습니다!
        </div>

        <button
          class="submit-button"
          :class="{ ready: isAllAnswered }"
          :disabled="!isAllAnswered"
          type="submit"
        >
          <i class="fa-solid fa-paper-plane"></i>
          {{ isAllAnswered ? '결과 확인하기' : '모든 문항을 완료해주세요' }}
        </button>
      </div>
    </form>

    <!-- 로딩 상태 -->
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>설문 문항을 불러오는 중...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import WMTIQuestion from '@/components/wmti/WMTIQuestion.vue';
import BackButton from '@/components/common/BackButton.vue';
import { getWMTIQuestionsAPI, postwmtiAPI } from '@/api/wmti';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const handleError = (message) => {
  showToast(message, 'error');
};
const handleSuccess = (message) => {
  showToast(message, 'success');
};
const handleWarning = (message) => {
  showToast(message, 'warning');
};
const router = useRouter();

const questions = ref([]);
const answers = ref([]);
const questionRefs = ref(new Map()); // 각 질문 컴포넌트의 ref를 저장
const hasAnswered = ref(new Set()); // 이미 답변한 문항 추적

// ✅ 진행률 계산
const answeredCount = computed(() => answers.value.filter((a) => a !== null).length);
const isAllAnswered = computed(
  () => answers.value.length > 0 && answeredCount.value === questions.value.length
);
const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0;
  return (answeredCount.value / questions.value.length) * 100;
});

// ✅ 질문 컴포넌트 ref 설정
const setQuestionRef = (el, index) => {
  if (el) {
    questionRefs.value.set(index, el);
  } else {
    questionRefs.value.delete(index);
  }
};

// ✅ 답변 변경 처리 및 오토스크롤
const handleAnswerChange = async (questionIndex, newValue) => {
  const oldValue = answers.value[questionIndex];
  answers.value[questionIndex] = newValue;

  // 이전에 답변하지 않은 문항에 처음 답변하는 경우에만 오토스크롤 실행
  const isFirstAnswer = !hasAnswered.value.has(questionIndex);

  if (isFirstAnswer && newValue !== null) {
    hasAnswered.value.add(questionIndex);
    await scrollToNextQuestion(questionIndex);
  }
};

// ✅ 다음 문항으로 스크롤하는 함수
const scrollToNextQuestion = async (currentIndex) => {
  const nextIndex = currentIndex + 1;

  // 다음 문항이 있는지 확인
  if (nextIndex >= questions.value.length) {
    await scrollToSubmitButton();
    return;
  }

  // DOM 업데이트 대기
  await nextTick();

  // 여러 방법으로 다음 문항 엘리먼트 찾기
  const nextQuestionRef = questionRefs.value.get(nextIndex);
  let targetElement = null;

  if (nextQuestionRef && nextQuestionRef.$el) {
    targetElement = nextQuestionRef.$el;
  } else {
    targetElement = document.querySelector(`[data-question-index="${nextIndex}"]`);
  }

  if (!targetElement) {
    const allQuestions = document.querySelectorAll('.survey-question');
    targetElement = allQuestions[nextIndex];
  }

  if (targetElement) {
    const headerHeight = 140;
    const elementRect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const offsetTop = elementRect.top + scrollTop - headerHeight;

    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });

    // 스크롤 후 해당 문항 하이라이트
    setTimeout(() => {
      highlightQuestion(nextIndex);
    }, 500);
  }
};

// ✅ 제출 버튼으로 스크롤
const scrollToSubmitButton = async () => {
  await nextTick();

  const submitSection = document.querySelector('.submit-section');
  if (submitSection) {
    const headerHeight = 100;
    const elementRect = submitSection.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const offsetTop = elementRect.top + scrollTop - headerHeight;

    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    });
  }
};

// ✅ 문항 하이라이트 효과
const highlightQuestion = (questionIndex) => {
  let element = null;

  const questionRef = questionRefs.value.get(questionIndex);
  if (questionRef && questionRef.$el) {
    element = questionRef.$el;
  } else {
    element = document.querySelector(`[data-question-index="${questionIndex}"]`);
  }

  if (!element) {
    const allQuestions = document.querySelectorAll('.survey-question');
    element = allQuestions[questionIndex];
  }

  if (element) {
    element.classList.add('highlight-question');

    setTimeout(() => {
      element.classList.remove('highlight-question');
    }, 1500);
  }
};

// ✅ 문항 불러오기
const loadQuestions = async () => {
  try {
    const res = await getWMTIQuestionsAPI();
    const list = res.body.data;
    questions.value = list;
    answers.value = Array(list.length).fill(null);
    hasAnswered.value.clear();
  } catch (err) {
    console.error('설문 문항 로딩 실패:', err);
    handleError('설문 문항을 불러오는데 실패했습니다.', 'error');
  }
};

// ✅ 제출
const handleSubmit = async () => {
  if (!isAllAnswered.value) {
    handleWarning('모든 문항에 응답해주세요.', 'warning');
    return;
  }

  try {
    const payload = { answers: answers.value };
    handleSuccess('제출합니다');
    const res = await postwmtiAPI(payload);
    const wmtiCode = res.body.wmtiCode;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      router.push({
        path: '/wmti/result',
        query: { code: wmtiCode },
      });
    }, 300);
  } catch (err) {
    console.error('제출 실패:', err);
    handleError('제출 중 오류가 발생했습니다.', 'error');
  }
};

onMounted(() => {
  loadQuestions();
});
</script>

<style scoped>
/* 기존 스타일 유지 */
.survey-page {
  max-width: 26.875rem;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

.survey-header {
  text-align: center;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(248, 249, 252, 0.8) 100%);
  border-radius: 1rem;
  padding: 1.5rem 1rem;
  box-shadow: 0 0.25rem 1.25rem rgba(45, 51, 107, 0.08);
}

.main-title {
  font-size: 1.375rem;
  font-weight: 800;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.sub-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-sub);
  margin-bottom: 1.25rem;
}

.progress-section {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: rgba(185, 187, 204, 0.2);
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-main), #4a5299);
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-sub);
  font-weight: 600;
}

.instruction-card {
  background: linear-gradient(135deg, rgba(230, 126, 34, 0.1), rgba(230, 126, 34, 0.05));
  border: 0.0625rem solid rgba(230, 126, 34, 0.2);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.instruction-content {
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.instruction-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.instruction-text {
  flex: 1;
}

.instruction-text p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-sub);
}

.instruction-text p:last-child {
  margin-bottom: 0;
}

.survey-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submit-section {
  position: sticky;
  bottom: 1rem;
  background: var(--color-white);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 0.5rem 2rem rgba(45, 51, 107, 0.15);
  border: 0.0625rem solid rgba(185, 187, 204, 0.2);
}

.completion-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e67e22;
}

.completion-status.completed {
  color: #27ae60;
}

.completion-status i {
  font-size: 1rem;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  background: linear-gradient(135deg, #95a5a6, #bdc3c7);
  color: var(--color-white);
}

.submit-button.ready {
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  box-shadow: 0 0.25rem 0.9375rem rgba(45, 51, 107, 0.3);
}

.submit-button.ready:hover {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.375rem 1.5625rem rgba(45, 51, 107, 0.4);
}

.submit-button:disabled {
  cursor: not-allowed;
  transform: none;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 0.1875rem solid rgba(45, 51, 107, 0.1);
  border-top: 0.1875rem solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: var(--color-sub);
  font-weight: 500;
}

/* ✅ 문항 하이라이트 효과 */
:deep(.highlight-question) {
  transform: translateY(-0.25rem);
  box-shadow: 0 0.75rem 2rem rgba(45, 51, 107, 0.2) !important;
  border-color: rgba(45, 51, 107, 0.4) !important;
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.05),
    rgba(248, 249, 252, 0.95)
  ) !important;
  animation: questionPulse 1.5s ease-out;
}

@keyframes questionPulse {
  0% {
    box-shadow: 0 0.75rem 2rem rgba(45, 51, 107, 0.2);
  }
  50% {
    box-shadow: 0 1rem 3rem rgba(45, 51, 107, 0.3);
  }
  100% {
    box-shadow: 0 0.75rem 2rem rgba(45, 51, 107, 0.2);
  }
}
</style>
