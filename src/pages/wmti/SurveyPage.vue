<template>
  <div class="survey-page">
    <!-- 🔥 고정된 뒤로가기 버튼 -->
    <div class="fixed-back-button">
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

      <!-- 🔥 고정된 임시 저장 버튼 -->
      <Transition name="fade-in">
        <div v-if="answeredCount > 0" class="fixed-save-section">
          <button
            type="button"
            class="fixed-save-btn"
            :disabled="isSaving"
            :title="isSaving ? '저장 중...' : '임시 저장'"
            @click="saveDraft"
          >
            <i :class="isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-save'"></i>
            <span class="save-text">{{ isSaving ? '저장 중' : '임시 저장' }}</span>
          </button>
        </div>
      </Transition>

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

    <!-- 🔥 스크롤 상단 이동 버튼 -->
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
const isSaving = ref(false); // 임시 저장 상태
const showScrollTop = ref(false); // 스크롤 탑 버튼 표시

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

// 🔥 스크롤 이벤트 리스너
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

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

// 🔥 개선된 에러 처리 함수들
const handleError = (message, duration = 3000) => {
  showToast(message, 'error', duration);
};

const handleSuccess = (message, duration = 2000) => {
  showToast(message, 'success', duration);
};

const handleWarning = (message, duration = 2500) => {
  showToast(message, 'warning', duration);
};

// 🔥 스크롤 관련 함수들
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

// 🔥 기존 함수들 (개선됨)
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

  const submitSection = document.querySelector('.fixed-submit-section');
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

// 🔥 백업 데이터 복원 체크 (개선됨)
const checkAndRestoreBackup = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const restoredFlag = urlParams.get('restored');

    if (restoredFlag === 'true') {
      const restored = restoreFormData();

      if (restored) {
        showDataRestoredModal();
        await applySurveyBackupData();
      } else {
        handleSuccess('로그인이 완료되었어요! 설문을 계속해주세요.');
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
  } catch (error) {
    handleWarning('이전 답변 복원 중 문제가 발생했습니다. 새로 시작해주세요.');
  }
};

// 🔥 백업 데이터를 실제 설문 상태에 적용 (개선됨)
const applySurveyBackupData = async () => {
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
      handleSuccess(`이전 답변 ${restoredCount}개가 복원되었어요! ✨`);

      // 🔥 복원 후 첫 번째 미답변 문항으로 스크롤
      await nextTick();

      // DOM이 완전히 업데이트될 때까지 잠시 대기
      setTimeout(async () => {
        await scrollToFirstUnansweredAfterRestore();
      }, 500);
    }
  } catch (error) {
    handleError('이전 답변 복원 중 문제가 발생했습니다.');
  }
};

// 🔥 복원 후 전용 스크롤 함수 (개선됨)
const scrollToFirstUnansweredAfterRestore = async () => {
  const firstUnansweredIndex = answers.value.findIndex((answer) => answer === null);

  if (firstUnansweredIndex === -1) {
    scrollToSubmitButton();
    return;
  }

  // 추가 대기 시간 (Vue 컴포넌트 렌더링 완료 대기)
  await new Promise((resolve) => setTimeout(resolve, 200));

  // survey-question 클래스로 찾기
  const allQuestions = document.querySelectorAll('.survey-question');

  let targetElement = null;

  if (allQuestions.length > firstUnansweredIndex) {
    targetElement = allQuestions[firstUnansweredIndex];
  }

  // 대안: questions-container 내부 자식 요소로 찾기
  if (!targetElement) {
    const container = document.querySelector('.questions-container');
    if (container) {
      const children = container.children;
      if (children.length > firstUnansweredIndex) {
        targetElement = children[firstUnansweredIndex];
      }
    }
  }

  if (targetElement) {
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
    // 대안: questions-container로 스크롤
    const container = document.querySelector('.questions-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

// 🔥 백업 복원 래퍼 함수
const restoreAndApplyBackup = async () => {
  try {
    const restored = restoreFormData();
    if (restored) {
      await applySurveyBackupData();
      return true;
    }
    return false;
  } catch (error) {
    handleError('이전 답변 복원에 실패했습니다.');
    return false;
  }
};

// 🔥 개선된 수동 임시 저장 함수
const saveDraft = async () => {
  if (isSaving.value) return;

  isSaving.value = true;

  try {
    const saved = forceBackupFormData();
    if (saved) {
      handleSuccess('설문 답변이 임시 저장되었어요! 📝');
    } else {
      handleWarning('임시 저장에 실패했습니다. 다시 시도해주세요.');
    }
  } catch (error) {
    handleError('임시 저장 중 오류가 발생했습니다.');
  } finally {
    setTimeout(() => {
      isSaving.value = false;
    }, 1000);
  }
};

// 🔥 개선된 제출 처리
const handleSubmit = async (isRetry = false) => {
  if (!isAllAnswered.value) {
    const unansweredCount = questions.value.length - answeredCount.value;
    handleWarning(`아직 ${unansweredCount}개 문항이 남았습니다. 모든 문항에 답변해주세요.`);

    // 첫 번째 미답변 문항으로 스크롤
    const firstUnansweredIndex = answers.value.findIndex((answer) => answer === null);
    if (firstUnansweredIndex !== -1) {
      setTimeout(() => {
        scrollToNextQuestion(firstUnansweredIndex - 1);
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
/* 🔥 고정된 뒤로가기 버튼 */
.fixed-back-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 200;
  background: transparent;
  border-radius: 0.75rem;
  padding: 0.5rem;
  border: 1px solid transparent;
}

/* 🔥 고정된 임시 저장 버튼 */
.fixed-save-section {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 200;
}

.fixed-save-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #6b73ff, #9c88ff);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.fixed-save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 115, 255, 0.4);
}

.fixed-save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.save-text {
  font-size: 0.85rem;
  white-space: nowrap;
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

/* 🔥 개선된 임시 저장 섹션 */
.save-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.save-draft-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6b73ff, #9c88ff);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 120px;
}

.save-draft-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 115, 255, 0.3);
}

.save-draft-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.save-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
  font-style: italic;
}

.save-info i {
  color: #3b82f6;
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
  backdrop-filter: blur(10px);
  border-radius: 1rem 1rem 0 0;
  padding: 1.25rem;
  box-shadow: 0 -4px 20px rgba(45, 51, 107, 0.15);
  border-top: 1px solid rgba(185, 187, 204, 0.2);
  z-index: 100;
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
  box-shadow: 0 4px 15px rgba(45, 51, 107, 0.3);
}

.submit-button.ready:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(45, 51, 107, 0.4);
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

/* 🔥 스크롤 탑 버튼 */
.scroll-to-top-btn {
  position: fixed;
  bottom: 6rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(45, 51, 107, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  z-index: 150;
  backdrop-filter: blur(10px);
}

.scroll-to-top-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 51, 107, 0.4);
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
.fade-in-enter-active,
.fade-in-leave-active {
  transition: all 0.3s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.scroll-to-top-enter-active,
.scroll-to-top-leave-active {
  transition: all 0.3s ease;
}

.scroll-to-top-enter-from,
.scroll-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* 반응형 디자인 개선 */
@media (max-width: 768px) {
  .survey-page {
    padding: 0.75rem;
  }

  .fixed-back-button {
    top: 0.75rem;
    left: 0.75rem;
    padding: 0.4rem;
  }

  .fixed-save-section {
    top: 0.75rem;
    right: 0.75rem;
  }

  .fixed-save-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.8rem;
  }

  .save-text {
    display: none; /* 모바일에서는 텍스트 숨김 */
  }

  .fixed-submit-section {
    padding: 1rem;
  }

  .scroll-to-top-btn {
    bottom: 5rem;
    right: 0.75rem;
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .instruction-card {
    margin-bottom: 1rem;
  }

  .instruction-content {
    padding: 1rem;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
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

  .fixed-back-button {
    top: 0.5rem;
    left: 0.5rem;
  }

  .fixed-save-section {
    top: 0.5rem;
    right: 0.5rem;
  }

  .fixed-save-btn {
    padding: 0.5rem;
    min-width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
  }
}

/* 접근성 개선 */
@media (prefers-reduced-motion: reduce) {
  .progress-fill,
  .submit-button,
  .save-draft-btn,
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

  .save-section {
    background: linear-gradient(135deg, #334155, #475569);
    border-color: #475569;
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
