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

      <!-- 🔥 임시 저장 버튼 추가 -->
      <div v-if="answeredCount > 0" class="save-section">
        <button type="button" class="save-draft-btn" @click="saveDraft">
          <i class="fa-solid fa-save"></i>
          임시 저장
        </button>
        <span class="save-info">작성 중인 답변이 자동으로 저장됩니다</span>
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
          :disabled="!isAllAnswered || isSubmitting"
          type="submit"
        >
          <i v-if="!isSubmitting" class="fa-solid fa-paper-plane"></i>
          <i v-else class="fa-solid fa-spinner fa-spin"></i>
          {{
            isSubmitting
              ? '제출 중...'
              : isAllAnswered
                ? '결과 확인하기'
                : '모든 문항을 완료해주세요'
          }}
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import WMTIQuestion from '@/components/wmti/WMTIQuestion.vue';
import BackButton from '@/components/common/BackButton.vue';
import { getWMTIQuestionsAPI, postwmtiAPI } from '@/api/wmti';

// 🔥 Composables import
import { useToast } from '@/composables/useToast';
import { useFormBackup } from '@/composables/useFormBackup';
import { useAuthError } from '@/composables/useAuthError';
import { useModalMessages } from '@/composables/useModalMessages';

const { showToast } = useToast();
const router = useRouter();

// 🔥 기존 상태들
const questions = ref([]);
const answers = ref([]);
const questionRefs = ref(new Map());
const hasAnswered = ref(new Set());
const isSubmitting = ref(false);

// 🔥 백업할 폼 데이터 구조 생성
const surveyFormData = ref({
  answers: [],
  questionsLength: 0,
  hasAnswered: [],
  lastSavedAt: null,
});

// 🔥 answers와 surveyFormData 동기화
watch(
  answers,
  (newAnswers) => {
    surveyFormData.value.answers = [...newAnswers];
    surveyFormData.value.questionsLength = questions.value.length;
    surveyFormData.value.hasAnswered = Array.from(hasAnswered.value);
    surveyFormData.value.lastSavedAt = Date.now();
  },
  { deep: true }
);

// 🔥 Composable 사용
const { restoreFormData, hasValidBackup, clearBackup, forceBackupFormData } = useFormBackup({
  pageKey: 'survey',
  expiryHours: 2,
  formRef: surveyFormData,
  autoBackup: true,
  submittedKey: 'surveySubmitted',
  forceBackup: true,
});

const { processSubmissionError, resetRetryCount } = useAuthError({
  maxRetryCount: 3,
  retryDelay: 1000,
  serverErrorDelay: 3000,
  refreshOptionDelay: 3000,
});

const { showBackupRestoreModal, showDataRestoredModal, showModal, showConfirmModal } =
  useModalMessages();

// 🔥 기존 computed들
const answeredCount = computed(() => answers.value.filter((a) => a !== null).length);
const isAllAnswered = computed(
  () => answers.value.length > 0 && answeredCount.value === questions.value.length
);
const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0;
  return (answeredCount.value / questions.value.length) * 100;
});

// 🔥 에러 처리 함수들
const handleError = (message) => {
  showToast(message, 'error');
};
const handleSuccess = (message) => {
  showToast(message, 'success');
};
const handleWarning = (message) => {
  showToast(message, 'warning');
};

// 🔥 기존 함수들
const setQuestionRef = (el, index) => {
  if (el) {
    questionRefs.value.set(index, el);
  } else {
    questionRefs.value.delete(index);
  }
};

const handleAnswerChange = async (questionIndex, newValue) => {
  answers.value[questionIndex] = newValue;

  const isFirstAnswer = !hasAnswered.value.has(questionIndex);

  if (isFirstAnswer && newValue !== null) {
    hasAnswered.value.add(questionIndex);
    await scrollToNextQuestion(questionIndex);
  }
};

const scrollToNextQuestion = async (currentIndex) => {
  const nextIndex = currentIndex + 1;

  if (nextIndex >= questions.value.length) {
    await scrollToSubmitButton();
    return;
  }

  await nextTick();

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

    setTimeout(() => {
      highlightQuestion(nextIndex);
    }, 500);
  }
};

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

const highlightQuestion = (questionIndex) => {
  const allQuestions = document.querySelectorAll('.survey-question');
  const element = allQuestions[questionIndex];

  if (element) {
    element.classList.add('highlight-question');
    setTimeout(() => {
      element.classList.remove('highlight-question');
    }, 1500);
  }
};

// 🔥 설문 문항 로딩 (백업 복원 기능 추가)
const loadQuestions = async () => {
  try {
    const res = await getWMTIQuestionsAPI();
    const list = res.body.data;
    questions.value = list;
    answers.value = Array(list.length).fill(null);
    hasAnswered.value.clear();

    // 🔥 백업 데이터 복원 체크
    await checkAndRestoreBackup();
  } catch (err) {
    console.error('설문 문항 로딩 실패:', err);
    handleError('설문 문항을 불러오는데 실패했습니다.');
  }
};

// 🔥 백업 데이터 복원 체크
const checkAndRestoreBackup = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const restoredFlag = urlParams.get('restored');

  if (restoredFlag === 'true') {
    console.log('복원 플래그 감지 - 설문 데이터 복원 시도');

    const restored = restoreFormData();

    if (restored) {
      showDataRestoredModal();
      await applySurveyBackupData();
    } else {
      showToast('로그인이 완료되었어요! 설문을 계속해주세요.', 'success');
    }

    // URL 정리
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  } else {
    // 기존 백업 데이터 확인
    if (hasValidBackup()) {
      showBackupRestoreModal(restoreAndApplyBackup, clearBackup);
    }
  }
};

// 🔥 백업 데이터를 실제 설문 상태에 적용 (스크롤 추가)
const applySurveyBackupData = async () => {
  const backupData = surveyFormData.value;

  if (backupData.answers && backupData.answers.length > 0) {
    // 답변 복원
    answers.value = [...backupData.answers];

    // 답변했던 문항들 복원
    if (backupData.hasAnswered) {
      hasAnswered.value = new Set(backupData.hasAnswered);
    }

    const restoredCount = backupData.answers.filter((a) => a !== null).length;
    console.log(`✅ 설문 답변 ${restoredCount}개 복원됨`);
    showToast(`이전 답변 ${restoredCount}개가 복원되었어요! ✨`, 'success');

    // 🔥 복원 후 첫 번째 미답변 문항으로 스크롤
    await nextTick();

    // DOM이 완전히 업데이트될 때까지 잠시 대기
    setTimeout(async () => {
      await scrollToFirstUnansweredAfterRestore();
    }, 500);
  }
};

// 🔥 복원 후 전용 스크롤 함수
const scrollToFirstUnansweredAfterRestore = async () => {
  console.log('🔄 백업 복원 후 스크롤 시작');

  const firstUnansweredIndex = answers.value.findIndex((answer) => answer === null);
  console.log('🔍 첫 번째 미답변 문항 인덱스:', firstUnansweredIndex);

  if (firstUnansweredIndex === -1) {
    console.log('✅ 모든 문항이 답변됨 - 제출 버튼으로 스크롤');
    scrollToSubmitButton();
    return;
  }

  // 추가 대기 시간 (Vue 컴포넌트 렌더링 완료 대기)
  await new Promise((resolve) => setTimeout(resolve, 200));

  // survey-question 클래스로 찾기
  const allQuestions = document.querySelectorAll('.survey-question');
  console.log('🔍 전체 survey-question 요소:', allQuestions.length);

  let targetElement = null;

  if (allQuestions.length > firstUnansweredIndex) {
    targetElement = allQuestions[firstUnansweredIndex];
    console.log('✅ survey-question으로 찾음:', targetElement);
  }

  // 대안: questions-container 내부 자식 요소로 찾기
  if (!targetElement) {
    const container = document.querySelector('.questions-container');
    if (container) {
      const children = container.children;
      if (children.length > firstUnansweredIndex) {
        targetElement = children[firstUnansweredIndex];
        console.log('✅ container children으로 찾음:', targetElement);
      }
    }
  }

  if (targetElement) {
    console.log('✅ 타겟 요소 찾음 - 스크롤 실행');

    // 헤더 높이 고려해서 스크롤
    const headerHeight = 160;
    const elementRect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetScrollTop = elementRect.top + scrollTop - headerHeight;

    // 부드러운 스크롤
    window.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    });

    // 🔥 스크롤 완료 후 하이라이트 효과
    setTimeout(() => {
      targetElement.style.outline = '3px solid #3b82f6';
      targetElement.style.outlineOffset = '4px';
      targetElement.style.borderRadius = '12px';
      targetElement.style.transition = 'all 0.3s ease';

      // 2초 후 하이라이트 제거
      setTimeout(() => {
        targetElement.style.outline = '';
        targetElement.style.outlineOffset = '';
        targetElement.style.transition = '';
      }, 2000);
    }, 800);
  } else {
    console.error('❌ 타겟 요소를 찾을 수 없음');

    // 대안: questions-container로 스크롤
    const container = document.querySelector('.questions-container');
    if (container) {
      console.log('🔄 대안: questions-container로 스크롤');
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

// 🔥 백업 복원 래퍼 함수
const restoreAndApplyBackup = async () => {
  const restored = restoreFormData();
  if (restored) {
    await applySurveyBackupData();
    return true;
  }
  return false;
};

// 🔥 수동 임시 저장 함수
const saveDraft = () => {
  const saved = forceBackupFormData();
  if (saved) {
    showToast('설문 답변이 임시 저장되었어요! 📝', 'success');
  }
};

// 🔥 정리된 제출 처리
const handleSubmit = async (isRetry = false) => {
  if (!isAllAnswered.value) {
    const unansweredCount = questions.value.length - answeredCount.value;
    handleWarning(`아직 ${unansweredCount}개 문항이 남았습니다. 모든 문항에 답변해주세요.`);
    return;
  }

  // 제출 확인 모달
  if (!isRetry) {
    const confirmed = await showConfirmModal(
      '설문을 제출하시겠어요?',
      '제출 후에는 답변을 수정할 수 없습니다.',
      '제출하기',
      '다시 확인'
    );

    if (!confirmed) return;
    resetRetryCount();
  }

  isSubmitting.value = true;

  try {
    const payload = { answers: answers.value };

    // API 호출
    const res = await postwmtiAPI(payload);
    const wmtiCode = res.body.wmtiCode;

    // 제출 완료 표시
    localStorage.setItem('surveySubmitted', 'true');
    handleSuccess('설문이 성공적으로 제출되었습니다!');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      router.push({
        path: '/wmti/result',
        query: { code: wmtiCode },
      });
    }, 1000);
  } catch (error) {
    // Composable을 사용한 에러 처리
    const result = await processSubmissionError(error, {
      showModalFn: showModal,
      backupFormData: forceBackupFormData,
      scrollToFirstError: () => {}, // 빈 함수로 처리
      handleSubmitFn: handleSubmit,
    });

    if (result?.shouldRetry) {
      await handleSubmit(true);
    }
  } finally {
    isSubmitting.value = false;
  }
};

// 마운트 시 초기화
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
.save-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.save-draft-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 115, 255, 0.3);
}

.save-info {
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
}

.submit-button {
  transition: all 0.3s ease;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.submit-button.ready {
  background: linear-gradient(135deg, #10b981, #059669);
  transform: scale(1.02);
}

.highlight-question {
  animation: questionHighlight 1.5s ease;
}

@keyframes questionHighlight {
  0% {
    background-color: transparent;
    transform: scale(1);
  }
  20% {
    background-color: rgba(59, 130, 246, 0.1);
    transform: scale(1.01);
  }
  80% {
    background-color: rgba(59, 130, 246, 0.05);
    transform: scale(1.005);
  }
  100% {
    background-color: transparent;
    transform: scale(1);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .save-section {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .save-draft-btn {
    width: 100%;
    justify-content: center;
  }
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
