<template>
  <div class="survey-page">
    <!-- 🔥 변경: 뒤로가기 버튼을 헤더 위쪽으로 이동 -->
    <div class="back-button-section">
      <BackButton to="/wmti/basic" />
    </div>

    <!-- 헤더 섹션 -->
    <div class="survey-header">
      <h1 class="main-title">나의 투자 성향 검사</h1>
      <h2 class="sub-title">WMTI 설문지</h2>

      <!-- 진행률 표시 -->
      <div class="progress-section">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
            role="progressbar"
            :aria-valuenow="progressPercentage"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        <div class="progress-text">
          {{ answeredCount }} / {{ questions.length }} 완료 ({{ Math.round(progressPercentage) }}%)
        </div>
      </div>
    </div>

    <!-- 안내 메시지 -->
    <div class="instruction-card">
      <div class="instruction-content">
        <div class="instruction-icon"><i class="fa-regular fa-lightbulb"></i></div>
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

      <!-- 🔥 개선된 고정 제출 섹션 -->
      <div class="fixed-submit-section">
        <div class="completion-status" :class="{ completed: isAllAnswered }">
          <div class="status-content">
            <i
              :class="isAllAnswered ? 'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-circle'"
            ></i>
            <span class="status-text">
              {{
                isAllAnswered
                  ? '모든 문항 완료!'
                  : `${questions.length - answeredCount}개 문항 남음`
              }}
            </span>
          </div>
          <div v-if="!isAllAnswered" class="status-detail">답변하지 않은 문항을 완료해주세요</div>
        </div>

        <button
          class="submit-button"
          :class="{
            ready: isAllAnswered,
            loading: isSubmitting,
          }"
          :disabled="!isAllAnswered || isSubmitting"
          type="submit"
        >
          <i v-if="!isSubmitting" class="fa-solid fa-paper-plane"></i>
          <i v-else class="fa-solid fa-spinner fa-spin"></i>
          <span>
            {{ isSubmitting ? '제출 중...' : isAllAnswered ? '결과 확인하기' : '답변 완료 필요' }}
          </span>
        </button>
      </div>
    </form>

    <!-- 🔥 개선된 로딩 상태 -->
    <div v-else class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3>설문 문항을 불러오는 중...</h3>
        <p>잠시만 기다려주세요</p>
      </div>
    </div>

    <!-- 🔥 변경: 스크롤 탑 버튼을 화면 고정, 제출 섹션보다 위쪽에 배치 -->
    <Transition name="scroll-to-top">
      <button
        v-if="showScrollTop"
        class="scroll-to-top-btn"
        aria-label="맨 위로 이동"
        @click="scrollToTop"
      >
        <i class="fa-solid fa-chevron-up"></i>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import WMTIQuestion from '@/components/wmti/WMTIQuestion.vue';
import BackButton from '@/components/common/BackButton.vue';
import { getWMTIQuestionsAPI, postwmtiAPI } from '@/api/wmti';

// Composables import
import { useToast } from '@/composables/useToast';
import { useFormBackup } from '@/composables/useFormBackup';
import { useAuthError } from '@/composables/useAuthError';
import { useModalMessages } from '@/composables/useModalMessages';

const { showToast } = useToast();
const router = useRouter();

// 상태 변수들
const questions = ref([]);
const answers = ref([]);
const questionRefs = ref(new Map());
const hasAnswered = ref(new Set());
const isSubmitting = ref(false);
const showScrollTop = ref(false); // 스크롤 탑 버튼 표시

// 백업할 폼 데이터 구조 생성
const surveyFormData = ref({
  answers: [],
  questionsLength: 0,
  hasAnswered: [],
  lastSavedAt: null,
});

// answers와 surveyFormData 동기화
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

// 스크롤 이벤트 리스너
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

// Composable 사용
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

const { showBackupRestoreModal, showDataRestoredModal, showConfirmModal } = useModalMessages();

// 기존 computed들
const answeredCount = computed(() => answers.value.filter((a) => a !== null).length);
const isAllAnswered = computed(
  () => answers.value.length > 0 && answeredCount.value === questions.value.length
);
const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0;
  return (answeredCount.value / questions.value.length) * 100;
});

// 에러 처리 함수들
const handleError = (message, duration = 3000) => {
  showToast(message, 'error', duration);
};

const handleSuccess = (message, duration = 2000) => {
  showToast(message, 'success', duration);
};

const handleWarning = (message, duration = 2500) => {
  showToast(message, 'warning', duration);
};

// 스크롤 관련 함수들
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const debouncedHandleScroll = debounce(handleScroll, 100);

// 🔥 통합된 스크롤 함수
const scrollToQuestion = async (targetIndex, options = {}) => {
  const {
    highlight = false,
    headerOffset = 140,
    behavior = 'smooth',
    highlightDuration = 1500,
  } = options;

  await nextTick();

  // 제출 버튼으로 스크롤하는 경우
  if (targetIndex >= questions.value.length) {
    const submitSection = document.querySelector('.fixed-submit-section');
    if (submitSection) {
      const elementRect = submitSection.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const offsetTop = elementRect.top + scrollTop - 100;

      window.scrollTo({
        top: offsetTop,
        behavior,
      });
    }
    return;
  }

  // 특정 문항으로 스크롤
  let targetElement = null;

  // 1. questionRefs에서 찾기
  const questionRef = questionRefs.value.get(targetIndex);
  if (questionRef && questionRef.$el) {
    targetElement = questionRef.$el;
  }

  // 2. data 속성으로 찾기
  if (!targetElement) {
    targetElement = document.querySelector(`[data-question-index="${targetIndex}"]`);
  }

  // 3. questions-container 내부 자식으로 찾기
  if (!targetElement) {
    const allQuestions = document.querySelectorAll('.survey-question');
    targetElement = allQuestions[targetIndex];
  }

  // 4. container 기준으로 찾기
  if (!targetElement) {
    const container = document.querySelector('.questions-container');
    if (container && container.children[targetIndex]) {
      targetElement = container.children[targetIndex];
    }
  }

  if (targetElement) {
    const elementRect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetScrollTop = elementRect.top + scrollTop - headerOffset;

    window.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior,
    });

    // 하이라이트 효과
    if (highlight) {
      setTimeout(() => {
        targetElement.style.outline = '0.188rem solid #3b82f6';
        targetElement.style.outlineOffset = '0.25rem';
        targetElement.style.borderRadius = '0.75rem';
        targetElement.style.transition = 'all 0.3s ease';

        setTimeout(() => {
          targetElement.style.outline = '';
          targetElement.style.outlineOffset = '';
          targetElement.style.transition = '';
        }, highlightDuration);
      }, 300);
    }
  }
};

// 🔥 기존 함수들
const setQuestionRef = (el, index) => {
  if (el) {
    questionRefs.value.set(index, el);
  } else {
    questionRefs.value.delete(index);
  }
};

// 🔥 답변 변경 처리 (스크롤 통합)
const handleAnswerChange = async (questionIndex, newValue) => {
  answers.value[questionIndex] = newValue;

  const isFirstAnswer = !hasAnswered.value.has(questionIndex);

  if (isFirstAnswer && newValue !== null) {
    hasAnswered.value.add(questionIndex);

    // 다음 문항으로 스크롤
    const nextIndex = questionIndex + 1;
    await scrollToQuestion(nextIndex, { highlight: true });
  }
};

// 🔥 설문 문항 로딩 (에러 처리 개선)
const loadQuestions = async () => {
  try {
    const res = await getWMTIQuestionsAPI();

    if (!res?.body?.data || !Array.isArray(res.body.data)) {
      throw new Error('잘못된 응답 형식입니다.');
    }

    const list = res.body.data;

    if (list.length === 0) {
      throw new Error('설문 문항이 없습니다.');
    }

    questions.value = list;
    answers.value = Array(list.length).fill(null);
    hasAnswered.value.clear();

    // 🔥 백업 데이터 복원 체크
    await checkAndRestoreBackup();
  } catch (err) {
    handleError('설문 문항을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
  }
};

// 🔥 백업 데이터 복원 체크 (모든 토스트 메시지를 호출부에서 처리)
const checkAndRestoreBackup = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const restoredFlag = urlParams.get('restored');

    if (restoredFlag === 'true') {
      const result = await showBackupRestoreModal(restoreFormData, clearBackup);

      if (result.action === 'restore' && result.data) {
        showDataRestoredModal();
        await applySurveyBackupData(true); // silent 모드로 호출
        handleSuccess('로그인 후 이전 답변이 복원되었어요! ✨');
      } else if (result.action === 'clear') {
        handleSuccess('새로 시작합니다! 로그인이 완료되었어요.');
      } else {
        handleSuccess('로그인이 완료되었어요! 설문을 계속해주세요.');
      }

      // URL 정리
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else {
      // 기존 백업 데이터 확인
      if (hasValidBackup()) {
        const result = await showBackupRestoreModal(restoreFormData, clearBackup);

        if (result.action === 'restore' && result.data) {
          await applySurveyBackupData(false); // 일반 모드
        } else if (result.action === 'clear') {
          handleSuccess('새로 시작합니다!');
        }
      }
    }
  } catch (error) {
    handleWarning('이전 답변 복원 중 문제가 발생했습니다. 새로 시작해주세요.');
  }
};

// 🔥 백업 데이터 적용 (토스트 메시지 제어)
const applySurveyBackupData = async (silent = false) => {
  try {
    const backupData = surveyFormData.value;

    if (backupData.answers && backupData.answers.length > 0) {
      // 답변 복원
      answers.value = [...backupData.answers];

      // 답변했던 문항들 복원
      if (backupData.hasAnswered) {
        hasAnswered.value = new Set(backupData.hasAnswered);
      }

      const restoredCount = backupData.answers.filter((a) => a !== null).length;

      // silent 모드가 아닐 때만 토스트 표시
      if (!silent) {
        handleSuccess(`이전 답변 ${restoredCount}개가 복원되었어요! ✨`);
      }

      // 첫 번째 미답변 문항으로 스크롤
      await nextTick();
      setTimeout(async () => {
        const firstUnansweredIndex = answers.value.findIndex((answer) => answer === null);
        const targetIndex =
          firstUnansweredIndex === -1 ? questions.value.length : firstUnansweredIndex;

        await scrollToQuestion(targetIndex, {
          highlight: true,
          headerOffset: 160,
          highlightDuration: 2000,
        });
      }, 500);
    }
  } catch (error) {
    handleError('이전 답변 복원 중 문제가 발생했습니다.');
  }
};

// 🔥 제출 처리 (미답변 문항 스크롤 통합)
const handleSubmit = async (isRetry = false) => {
  if (!isAllAnswered.value) {
    const unansweredCount = questions.value.length - answeredCount.value;
    handleWarning(`아직 ${unansweredCount}개 문항이 남았습니다. 모든 문항에 답변해주세요.`);

    // 첫 번째 미답변 문항으로 스크롤
    const firstUnansweredIndex = answers.value.findIndex((answer) => answer === null);
    if (firstUnansweredIndex !== -1) {
      setTimeout(() => {
        scrollToQuestion(firstUnansweredIndex, { highlight: true });
      }, 500);
    }
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

    const wmtiCode = res.body.data?.wmtiCode || res.body.wmtiCode;
    if (!wmtiCode) {
      throw new Error('서버 응답에 문제가 있습니다.');
    }

    // 제출 완료 표시
    localStorage.setItem('surveySubmitted', 'true');
    clearBackup(); // 백업 데이터 삭제
    handleSuccess('설문이 성공적으로 제출되었습니다! 🎉');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      router.push({
        path: '/wmti/result',
        query: { code: wmtiCode },
      });
    }, 1000);
  } catch (error) {
    // 🔥 간소화됨: showModalFn 파라미터 제거
    const result = await processSubmissionError(error, {
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

// 🔥 생명주기 훅
onMounted(() => {
  loadQuestions();
  window.addEventListener('scroll', debouncedHandleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', debouncedHandleScroll);
});
</script>

<style scoped>
/* 🔥 변경: 뒤로가기 버튼을 헤더 위쪽으로 이동 */
.back-button-section {
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

/* 기존 스타일 유지 */
.survey-page {
  max-width: 26.875rem;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  position: relative;
}

/* 헤더 스타일 */
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

/* 진행률 바 개선 */
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
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-main), #4a5299);
  border-radius: 0.25rem;
  transition: width 0.5s ease-in-out;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  font-size: 0.8rem;
  color: var(--color-sub);
  font-weight: 600;
}

/* 안내 카드 */
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

/* 설문 폼 */
.survey-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 8rem; /* 고정 버튼을 위한 여백 */
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 🔥 개선된 고정 제출 섹션 */
.fixed-submit-section {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 26.875rem;
  background: linear-gradient(to top, var(--color-white), rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(0.625rem);
  border-radius: 1rem 1rem 0 0;
  padding: 1.25rem;
  box-shadow: 0 0.25rem 1.25rem rgba(45, 51, 107, 0.15);
  border-top: 0.063rem solid rgba(185, 187, 204, 0.2);
  z-index: 100;
}

/* 🔥 변경: 스크롤 탑 버튼을 화면 고정, 제출 섹션보다 위쪽에 배치 */
.scroll-to-top-btn {
  position: fixed;
  bottom: 9rem; /* 제출 섹션(약 6rem) 위쪽에 배치 */
  left: 50%;
  transform: translateX(-50%);
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0.25rem 0.938rem rgba(45, 51, 107, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  z-index: 150;
  backdrop-filter: blur(0.625rem);
}

.scroll-to-top-btn:hover {
  transform: translateX(-50%) translateY(0.125rem);
  box-shadow: 0 0.375rem 1.25rem rgba(45, 51, 107, 0.4);
}

.completion-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e67e22;
}

.completion-status.completed .status-content {
  color: #27ae60;
}

.status-content i {
  font-size: 1rem;
}

.status-detail {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
  text-align: center;
}

.completion-status.completed .status-detail {
  display: none;
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
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.submit-button.ready {
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  box-shadow: 0 0.25rem 0.938rem rgba(45, 51, 107, 0.3);
}

.submit-button.ready:hover:not(:disabled) {
  transform: translateY(-0.125rem);
  box-shadow: 0 0.375rem 1.563rem rgba(45, 51, 107, 0.4);
}

.submit-button.ready:hover::before {
  left: 100%;
}

.submit-button.loading {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.submit-button:disabled {
  cursor: not-allowed;
  transform: none;
}

.submit-button span {
  transition: all 0.3s ease;
}

.submit-button.loading span {
  opacity: 0.8;
}

/* 🔥 개선된 로딩 컨테이너 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
  min-height: 60vh;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25rem solid rgba(45, 51, 107, 0.1);
  border-top: 0.25rem solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
}

.loading-content p {
  color: var(--color-sub);
  font-weight: 500;
  margin: 0;
  font-size: 0.9rem;
}

/* 하이라이트 효과 개선 */
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

/* 🔥 트랜지션 효과 */
.scroll-to-top-enter-active,
.scroll-to-top-leave-active {
  transition: all 0.3s ease;
}

.scroll-to-top-enter-from,
.scroll-to-top-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1.25rem) scale(0.8);
}

/* 반응형 디자인 개선 */
@media (max-width: 48rem) {
  /* 768px 이하 */
  .survey-page {
    padding: 0.75rem;
  }

  .back-button-section {
    margin-bottom: 0.75rem;
    padding-left: 0.25rem;
  }

  .fixed-submit-section {
    padding: 1rem;
  }

  .scroll-to-top-btn {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
    bottom: 8rem; /* 모바일에서 제출 섹션 위쪽 조정 */
  }

  .instruction-card {
    margin-bottom: 1rem;
  }

  .instruction-content {
    padding: 1rem;
    gap: 0.75rem;
  }
}

@media (max-width: 30rem) {
  /* 480px 이하 */
  .main-title {
    font-size: 1.2rem;
  }

  .sub-title {
    font-size: 0.9rem;
  }

  .survey-header {
    padding: 1.25rem 0.75rem;
  }

  .instruction-text p {
    font-size: 0.8rem;
  }

  .back-button-section {
    margin-bottom: 0.5rem;
    padding-left: 0;
  }

  .scroll-to-top-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 0.9rem;
    bottom: 8rem; /* 작은 모바일에서 제출 섹션 위쪽 조정 */
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .progress-fill,
  .submit-button,
  .scroll-to-top-btn {
    transition: none;
  }

  .progress-fill::after {
    animation: none;
  }

  .loading-spinner {
    animation: none;
  }

  .highlight-question {
    animation: none;
  }
}

/* 다크모드 지원 (선택사항) */
@media (prefers-color-scheme: dark) {
  .survey-header {
    background: linear-gradient(135deg, #1e293b 0%, rgba(30, 41, 59, 0.8) 100%);
  }

  .instruction-card {
    background: linear-gradient(135deg, rgba(230, 126, 34, 0.15), rgba(230, 126, 34, 0.1));
    border-color: rgba(230, 126, 34, 0.3);
  }

  .fixed-submit-section {
    background: linear-gradient(to top, #1e293b, rgba(30, 41, 59, 0.95));
    border-color: #475569;
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

/* 문항 하이라이트 효과 개선 */
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
