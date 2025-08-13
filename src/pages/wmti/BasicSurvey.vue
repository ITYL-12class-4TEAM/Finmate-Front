<template>
  <div class="survey-main">
    <header class="header"></header>

    <!-- 소개 섹션 -->
    <section class="intro">
      <h1>투자 성향 진단</h1>
      <p class="note">*본 서비스는 고객님의 기본적인 정보를 입력받습니다.*</p>
      <p class="description">
        이는 고객님의 투자스타일, 투자성향, 투자여건을 <br />
        정확하게 파악하기 위한 것으로, <br />
        <strong>'사용자 특화 금융상품 추천'</strong> 및
        <strong>'나의 WMTI 투자스타일은?'</strong> 등의 기능을 위해 설문에 응해주세요.
      </p>
    </section>

    <!-- Step 1: 사전정보 입력 -->
    <section class="step-card">
      <div class="step-header">
        <div v-if="step1Completed" class="step-icon completed">
          <i class="fa-solid fa-check"></i>
        </div>
        <div v-else class="step-icon">1</div>
        <span>개인정보 / 투자목적</span>
        <div v-if="step1Completed" class="status-badge completed">완료</div>
      </div>
      <button class="step-button" @click="goToPreInfo">
        {{ step1Completed ? '다시 입력하기' : '시작하기' }}
      </button>
    </section>

    <!-- 화살표 안내 -->
    <div class="arrow-container">
      <div class="arrow-down" :class="{ active: step1Completed }">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      <div v-if="!step1Completed" class="arrow-text">먼저 사전정보를 입력해주세요</div>
    </div>

    <!-- Step 2: WMTI 검사 -->
    <section class="step-card" :class="{ disabled: !step2Enabled }">
      <div class="step-header">
        <div class="step-icon" :class="{ disabled: !step2Enabled }">2</div>
        <span>나의 WMTI 검사하기</span>
        <div v-if="!step2Enabled" class="status-badge disabled">대기중</div>
      </div>
      <button
        class="step-button"
        :disabled="!step2Enabled"
        :class="{ disabled: !step2Enabled }"
        @click="goToSurvey"
      >
        {{ step2Enabled ? '검사하기' : '기본정보 입력 후 이용 가능' }}
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';

// ✅ Toast 기능 불러오기
const { showToast } = useToast();

// ✅ 라우터 사용
const router = useRouter();

// ✅ 상태 변수들
const step1Completed = ref(false);
const step2Enabled = ref(false);

// ✅ 사전정보 입력 여부 체크
const checkPreinfoStatus = () => {
  const preinfoDone = localStorage.getItem('preinfoSubmitted');
  step1Completed.value = preinfoDone === 'true';
  step2Enabled.value = preinfoDone === 'true';
};

// ✅ 라우팅 함수
const goToPreInfo = () => {
  router.push('/wmti/preinfo');
};

const goToSurvey = () => {
  if (step2Enabled.value) {
    router.push('/wmti/survey');
  } else {
    showToast('먼저 기본정보를 입력해주세요!', 'error');
  }
};

// ✅ 컴포넌트 마운트 시 상태 확인
onMounted(() => {
  checkPreinfoStatus();
});
</script>

<style scoped>
.survey-main {
  max-width: 26.875rem; /* 430px iPhone 기준으로 변경 */
  margin: 0 auto;
  padding: 1.5rem 1rem;
  font-family: 'Inter', sans-serif;
}

.header {
  text-align: left;
  margin-bottom: 2rem;
}

.intro h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--color-main);
}

.note {
  font-size: 0.875rem;
  color: var(--color-light);
}

.description {
  font-size: 0.875rem;
  line-height: 1.5;
  margin-top: 0.5rem;
  color: var(--color-sub);
}

.step-card {
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(248, 249, 252, 0.8) 100%);
  border: 0.125rem solid rgba(45, 51, 107, 0.1);
  border-radius: 1rem;
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.08);
  padding: 1.25rem;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
}

.step-card.disabled {
  opacity: 0.5;
  background: rgba(238, 238, 243, 0.5);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1rem;
  position: relative;
}

.step-icon {
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step-icon.completed {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.step-icon.disabled {
  background: linear-gradient(135deg, #95a5a6, #bdc3c7);
}

.status-badge {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.completed {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.status-badge.disabled {
  background: rgba(149, 165, 166, 0.1);
  color: #95a5a6;
}

.step-button {
  width: 100%;
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: white;
  padding: 0.875rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.step-button:hover:not(:disabled) {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.9375rem rgba(45, 51, 107, 0.3);
}

.step-button:disabled,
.step-button.disabled {
  background: linear-gradient(135deg, #95a5a6, #bdc3c7);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 화살표 스타일 */
.arrow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
  position: relative;
}

.arrow-down {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(149, 165, 166, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

.arrow-down.active {
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: white;
  animation: bounce 2s infinite;
}

.arrow-down svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #95a5a6;
}

.arrow-down.active svg {
  color: white;
}

.arrow-text {
  font-size: 0.8rem;
  color: var(--color-light);
  text-align: center;
  font-style: italic;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-0.25rem);
  }
  60% {
    transform: translateY(-0.125rem);
  }
}
</style>
