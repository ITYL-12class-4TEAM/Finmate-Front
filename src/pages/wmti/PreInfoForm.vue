<template>
  <div class="preinfo-container">
    <div class="preinfo-form">
      <!-- 뒤로가기 버튼 -->
      <BackButton title="돌아가기" to="/wmti/basic" />
      <!-- 헤더 -->
      <div class="form-header">
        <div class="header-accent"></div>
        <h1 class="title">사전 정보 입력</h1>
        <p class="subtitle">맞춤형 투자 분석을 위한 기본 정보를 입력해주세요</p>

        <!-- 진행률 바 -->
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
          <span class="progress-text">{{ completedFields }}/7 완료</span>
        </div>
      </div>

      <form class="form-body" @submit.prevent="handleSubmit">
        <!-- 기본 정보 -->
        <div class="form-section" :class="{ completed: isBasicInfoCompleted }">
          <h3 class="section-title">
            <span class="title-number">01</span>
            기본 정보
            <div v-if="isBasicInfoCompleted" class="check-icon">✓</div>
          </h3>

          <div class="input-groups">
            <label class="input-label">이름</label>
            <input
              v-model="form.username"
              type="text"
              required
              placeholder="이름을 입력하세요"
              class="input-field"
            />
          </div>

          <div class="input-row">
            <div class="input-groups">
              <label class="input-label">나이</label>
              <input
                v-model.number="form.age"
                type="number"
                min="0"
                max="120"
                required
                placeholder="예) 30"
                class="input-field"
              />
            </div>

            <div class="input-groups">
              <label class="input-label">기혼 여부</label>
              <div class="toggle-group">
                <div
                  v-if="form.married !== null"
                  class="toggle-slider"
                  :class="{ 'slide-right': form.married === 'true' }"
                ></div>
                <label class="toggle-option" :class="{ active: form.married === 'false' }">
                  <input v-model="form.married" type="radio" value="false" />
                  <span>미혼</span>
                </label>
                <label class="toggle-option" :class="{ active: form.married === 'true' }">
                  <input v-model="form.married" type="radio" value="true" />
                  <span>기혼</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 재정 정보 -->
        <div class="form-section" :class="{ completed: isFinancialInfoCompleted }">
          <h3 class="section-title">
            <span class="title-number">02</span>
            재정 정보
            <div v-if="isFinancialInfoCompleted" class="check-icon">✓</div>
          </h3>

          <div class="input-groups">
            <label class="input-label">월 소득</label>
            <div class="currency-input">
              <input
                v-model.number="form.monthlyIncome"
                type="number"
                required
                placeholder="예) 3,500,000"
                class="input-field"
              />
              <span class="currency-unit">원</span>
            </div>
          </div>

          <div class="input-groups">
            <label class="input-label">월 고정 지출</label>
            <div class="currency-input">
              <input
                v-model.number="form.fixedCost"
                type="number"
                required
                placeholder="예) 1,500,000"
                class="input-field"
              />
              <span class="currency-unit">원</span>
            </div>
            <div
              v-if="availableAmount !== null"
              class="help-text"
              :class="{ warning: availableAmount < 0 }"
            >
              <span v-if="availableAmount >= 0">
                💡 투자 가능 금액: {{ availableAmount.toLocaleString() }}원
              </span>
              <span v-else>
                ⚠️ 고정지출이 소득을 초과합니다: {{ Math.abs(availableAmount).toLocaleString() }}원
                부족
              </span>
            </div>
          </div>
        </div>

        <!-- 투자 정보 -->
        <div class="form-section" :class="{ completed: isInvestmentInfoCompleted }">
          <h3 class="section-title">
            <span class="title-number">03</span>
            투자 정보
            <div v-if="isInvestmentInfoCompleted" class="check-icon">✓</div>
          </h3>

          <div class="input-groups">
            <label class="input-label">투자 기간</label>
            <div class="chip-group">
              <label
                v-for="item in InvestmentPeriod"
                :key="item.value"
                class="chip"
                :class="{ active: form.period === item.value }"
                @click="selectWithBounce"
              >
                <input v-model="form.period" type="radio" :value="item.value" />
                <span>{{ item.label }}</span>
              </label>
            </div>
          </div>

          <div class="input-groups">
            <label class="input-label">투자 목적</label>
            <div class="chip-group">
              <label
                v-for="item in PurposeCategory"
                :key="item.value"
                class="chip"
                :class="{ active: form.purposeCategory === item.value }"
                @click="selectWithBounce"
              >
                <input v-model="form.purposeCategory" type="radio" :value="item.value" />
                <span>{{ item.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          <span v-if="!isSubmitting">다음 단계로 →</span>
          <span v-else>처리중...</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { postPreinfoAPI } from '@/api/wmti';
import { InvestmentPeriodEnum, PurposeCategoryEnum } from '../../constants/wmtienums';
import { useModalStore } from '@/stores/useModalStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from '@/composables/useToast';
import BackButton from '@/components/common/BackButton.vue';

const modalStore = useModalStore();
const authStore = useAuthStore();
const { showToast } = useToast();
const router = useRouter();

// 상수 정의
const CONSTANTS = {
  MIN_NAME_LENGTH: 2,
  MAX_AGE: 120,
  MAX_RETRY_COUNT: 3,
  BACKUP_EXPIRY_HOURS: 1,
  BOUNCE_ANIMATION_DURATION: 300,
  RETRY_DELAY: 1000,
  SERVER_ERROR_DELAY: 3000,
  REFRESH_OPTION_DELAY: 3000,
};

// 상태
const form = ref({
  username: '',
  age: null,
  married: null,
  monthlyIncome: null,
  fixedCost: null,
  period: '',
  purposeCategory: '',
});

// 상태 변수들
const isSubmitting = ref(false);
const isRetrying = ref(false);
const retryCount = ref(0);

// 상수
const InvestmentPeriod = InvestmentPeriodEnum;
const PurposeCategory = PurposeCategoryEnum;

// 계산된 값
const availableAmount = computed(() => {
  if (form.value.monthlyIncome !== null && form.value.fixedCost !== null) {
    return form.value.monthlyIncome - form.value.fixedCost;
  }
  return null;
});

// 진행률 계산
const completedFields = computed(() => {
  let count = 0;
  if (form.value.username && form.value.username.length >= CONSTANTS.MIN_NAME_LENGTH) count++;
  if (form.value.age && form.value.age > 0) count++;
  if (form.value.married !== null) count++;
  if (form.value.monthlyIncome && form.value.monthlyIncome > 0) count++;
  if (form.value.fixedCost !== null && form.value.fixedCost >= 0) count++;
  if (form.value.period) count++;
  if (form.value.purposeCategory) count++;
  return count;
});

const progressPercentage = computed(() => (completedFields.value / 7) * 100);

// 섹션 완료 상태
const isBasicInfoCompleted = computed(() => {
  return (
    form.value.username &&
    form.value.username.length >= CONSTANTS.MIN_NAME_LENGTH &&
    form.value.age &&
    form.value.age > 0 &&
    form.value.married !== null
  );
});

const isFinancialInfoCompleted = computed(() => {
  return (
    form.value.monthlyIncome &&
    form.value.monthlyIncome > 0 &&
    form.value.fixedCost !== null &&
    form.value.fixedCost >= 0
  );
});

const isInvestmentInfoCompleted = computed(() => {
  return form.value.period && form.value.purposeCategory;
});

// 바운스 애니메이션
const selectWithBounce = (event) => {
  const chip = event.currentTarget;
  chip.classList.add('bounce');
  setTimeout(() => {
    chip.classList.remove('bounce');
  }, CONSTANTS.BOUNCE_ANIMATION_DURATION);
};

// localStorage 지원 확인
const checkLocalStorageSupport = () => {
  try {
    const testKey = 'localStorage-test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error('localStorage 지원되지 않음:', error);
    showToast('브라우저에서 데이터 저장이 지원되지 않습니다.', 'warning');
    return false;
  }
};
// 모달메시지에 줄바꿈 강제 적용하는 함수
const fixModalLineBreaks = () => {
  nextTick(() => {
    const message = document.querySelector('.modal-message');
    if (message) {
      message.style.whiteSpace = 'pre-line';
      message.style.lineHeight = '1.6';
    }
  });
};

// 모달이 열릴 때마다 줄바꿈 적용
watch(
  () => modalStore.isOpen,
  (isOpen) => {
    if (isOpen) {
      setTimeout(fixModalLineBreaks, 50);
    }
  }
);

// 유효성 검사 함수
const validateForm = () => {
  const { username, age, married, monthlyIncome, fixedCost, period, purposeCategory } = form.value;

  if (!username || username.length < CONSTANTS.MIN_NAME_LENGTH) {
    showToast(`이름을 ${CONSTANTS.MIN_NAME_LENGTH}자 이상 입력해주세요.`, 'warning');
    return false;
  }

  if (!age || age < 0 || age > CONSTANTS.MAX_AGE) {
    showToast(`나이를 0~${CONSTANTS.MAX_AGE} 사이로 입력해주세요.`, 'warning');
    return false;
  }

  if (married === null) {
    showToast('기혼 여부를 선택해주세요.', 'warning');
    return false;
  }

  if (!monthlyIncome || monthlyIncome < 0) {
    showToast('월소득을 0원 이상으로 입력해주세요.', 'warning');
    return false;
  }

  if (fixedCost === null || fixedCost < 0 || fixedCost > monthlyIncome) {
    showToast('고정지출은 0원 이상이며, 월소득을 초과할 수 없습니다.', 'warning');
    return false;
  }

  if (!period) {
    showToast('투자 기간을 선택해주세요.', 'warning');
    return false;
  }

  if (!purposeCategory) {
    showToast('투자 목적을 선택해주세요.', 'warning');
    return false;
  }

  return true;
};

// 제출 데이터 준비
const prepareSubmissionData = () => {
  return {
    ...form.value,
    married: form.value.married === 'true',
    platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'web',
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  };
};

// 에러 처리 함수
const processSubmissionError = async (error) => {
  console.error('제출 실패:', error);

  // 에러 타입별 처리
  if (error.response?.status === 401) {
    await handleTokenExpired();
  } else if (error.response?.status === 400) {
    await showInputErrorModal();
  } else if (error.response?.status >= 500) {
    await showServerErrorModal();
  } else if (error.code === 'NETWORK_ERROR' || !error.response) {
    await showNetworkErrorModal();
  } else {
    await showGenericErrorModal();
  }
};

// 제출 처리 - 수정된 버전
const handleSubmit = async (isRetry = false) => {
  if (!validateForm() || isSubmitting.value) return;

  // 재시도가 아닌 경우 카운트 초기화
  if (!isRetry) {
    retryCount.value = 0;
  }

  isSubmitting.value = true;

  try {
    const finalData = prepareSubmissionData();
    await postPreinfoAPI(finalData);
    localStorage.setItem('preinfoSubmitted', 'true');

    showToast('사전정보가 성공적으로 저장되었습니다!', 'success');

    setTimeout(() => {
      router.push('/wmti/basic');
    }, CONSTANTS.RETRY_DELAY);
  } catch (error) {
    await processSubmissionError(error);
  } finally {
    isSubmitting.value = false;
  }
};

// 토큰 만료 처리 - 수정된 버전
const handleTokenExpired = async () => {
  console.log('토큰 만료 감지 - 사용자 정보 재검증 시도');

  // 폼 데이터 먼저 백업
  backupFormData();
  showToast('로그인 상태를 확인하고 있어요...', 'info');

  try {
    const isValid = await authStore.refreshUser();

    if (isValid) {
      showToast('로그인 상태가 확인되었어요! 다시 제출하고 있어요...', 'success');

      isRetrying.value = true;
      await new Promise((resolve) => setTimeout(resolve, CONSTANTS.RETRY_DELAY));

      // 수정: retryCount.value 사용
      if (retryCount.value < CONSTANTS.MAX_RETRY_COUNT) {
        retryCount.value++;
        await handleSubmit(true); // isRetry = true로 호출
      } else {
        await showLoginExpiredModal();
      }
    } else {
      await showLoginExpiredModal();
    }
  } catch (refreshError) {
    console.error('사용자 정보 재검증 실패:', refreshError);
    await showLoginExpiredModal();
  } finally {
    isRetrying.value = false;
  }
};

// 모달 표시 함수들
const showLoginExpiredModal = async () => {
  console.log('로그인 만료 모달 표시');

  const message = `로그인이 만료되었어요.

입력하신 정보는 안전하게 임시 저장되었으니 걱정하지 마세요!
로그인 후 이 페이지로 돌아오면 자동으로 복원됩니다.

확인: 로그인하러 가기
취소: 페이지 새로고침`;

  const result = await modalStore.showModal(message);

  console.log('모달 결과:', result);

  if (result) {
    console.log('로그인 페이지로 이동 시도');
    backupFormData();

    const returnUrl = encodeURIComponent(window.location.pathname);
    const targetUrl = `/login?returnUrl=${returnUrl}&restored=true`;

    console.log('이동할 URL:', targetUrl);
    router.push(targetUrl);
  } else {
    console.log('페이지 새로고침 옵션 선택');
    showRefreshPageOption();
  }
};

const showInputErrorModal = async () => {
  const message = `입력하신 정보에 문제가 있어요.

각 항목을 다시 한번 확인해주시고,
특히 숫자 입력 부분을 점검해보세요.

확인을 누르시면 문제가 있는 항목으로 이동합니다.`;

  const result = await modalStore.showModal(message);

  if (result) {
    scrollToFirstError();
  }
};

const showServerErrorModal = async () => {
  const message = `서버에 일시적인 문제가 발생했어요.

보통 금방 해결되니까 조금만 기다리신 후 다시 시도해주세요!

확인: 잠시 후 다시 시도
취소: 나중에 하기`;

  const result = await modalStore.showModal(message);

  if (result) {
    setTimeout(async () => {
      await showRetryModal();
    }, CONSTANTS.SERVER_ERROR_DELAY);
  }
};

const showNetworkErrorModal = async () => {
  const message = `인터넷 연결에 문제가 있는 것 같아요.

Wi-Fi나 데이터 연결을 확인하시고 다시 시도해주세요.

확인: 다시 시도하기
취소: 나중에 하기`;

  const result = await modalStore.showModal(message);

  if (result) {
    await checkNetworkAndRetry();
  }
};

const showGenericErrorModal = async () => {
  const message = `예상치 못한 문제가 발생했어요.

입력하신 정보는 임시 저장되었으니 안심하시고 잠시 후 다시 시도해주세요.

확인: 다시 시도하기
취소: 페이지 새로고침`;

  const result = await modalStore.showModal(message);

  if (result) {
    // 재시도 횟수 체크 후 재시도
    if (retryCount.value < CONSTANTS.MAX_RETRY_COUNT) {
      retryCount.value++;
      await handleSubmit(true);
    } else {
      showToast('재시도 횟수가 초과되었습니다. 페이지를 새로고침해주세요.', 'warning');
      showRefreshPageOption();
    }
  } else {
    showRefreshPageOption();
  }
};

const showRetryModal = async () => {
  const message = `다시 시도할 준비가 되었나요?

입력하신 정보는 그대로 유지됩니다.

확인: 지금 시도하기
취소: 나중에 하기`;

  const result = await modalStore.showModal(message);

  if (result) {
    if (retryCount.value < CONSTANTS.MAX_RETRY_COUNT) {
      retryCount.value++;
      await handleSubmit(true);
    } else {
      showToast('재시도 횟수가 초과되었습니다.', 'warning');
    }
  }
};

const showBackupRestoreModal = async () => {
  const message = `이전에 작성하던 정보가 있어요! 🔄

계속해서 작성하시겠어요?

확인: 이어서 작성하기
취소: 새로 시작하기`;

  const result = await modalStore.showModal(message);

  if (result) {
    console.log('백업 데이터 복원 선택');
    const restored = restoreFormData();

    if (restored) {
      showToast('이전 작성 내용이 복원되었어요! ✨', 'success');
    } else {
      showToast('복원할 수 있는 데이터가 없어요. 새로 시작해주세요.', 'info');
    }
  } else {
    console.log('새로 시작하기 선택 - 백업 데이터 삭제');
    localStorage.removeItem('formBackup');
    showToast('새로 시작합니다! 📝', 'info');
  }
};

const showDataRestoredModal = async () => {
  const message = `이전에 입력하신 정보가 복원되었어요! ✨

계속해서 작성해주세요.`;

  await modalStore.showModal(message);
};

const showRefreshPageOption = () => {
  showToast('페이지를 새로고침하시면 문제가 해결될 수 있어요.', 'info');

  setTimeout(async () => {
    const message = `페이지를 새로고침하시겠어요?

입력하신 정보는 자동으로 백업됩니다.

확인: 새로고침 하기
취소: 계속 작업하기`;

    const result = await modalStore.showModal(message);

    if (result) {
      backupFormData();
      window.location.reload();
    }
  }, CONSTANTS.REFRESH_OPTION_DELAY);
};

// 헬퍼 함수들
const backupFormData = () => {
  if (!checkLocalStorageSupport()) {
    return;
  }

  try {
    const formBackup = {
      ...form.value,
      timestamp: Date.now(),
      page: 'preinfo',
    };

    console.log('백업할 데이터:', formBackup);

    localStorage.setItem('formBackup', JSON.stringify(formBackup));

    // 백업 검증
    const verification = localStorage.getItem('formBackup');
    if (verification) {
      const parsed = JSON.parse(verification);
      console.log('백업 검증 성공:', Object.keys(parsed).length, '개 필드');
      showToast('입력 정보가 임시 저장되었어요 📝', 'info');
    } else {
      throw new Error('백업 검증 실패');
    }
  } catch (error) {
    console.error('폼 데이터 백업 실패:', error);
    showToast('임시 저장 실패. 중요한 정보는 별도로 메모해주세요.', 'warning');
  }
};

const scrollToFirstError = () => {
  const requiredFields = [
    'username',
    'age',
    'married',
    'monthlyIncome',
    'fixedCost',
    'period',
    'purposeCategory',
  ];

  for (const field of requiredFields) {
    if (!form.value[field] || form.value[field] === null) {
      const selectors = [
        `[name="${field}"]`,
        `#${field}`,
        `input[type="radio"][value="${form.value[field]}"]`,
        `.input-field`,
        `input[type="number"]`,
        `input[type="text"]`,
      ];

      let element = null;
      for (const selector of selectors) {
        element = document.querySelector(selector);
        if (element) break;
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (element.tagName === 'INPUT') {
          setTimeout(() => element.focus(), 300);
        }
        break;
      }
    }
  }
};

const checkNetworkAndRetry = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(window.location.origin, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status < 500) {
      showToast('네트워크가 복구되었어요! 다시 시도하고 있어요...', 'success');

      if (retryCount.value < CONSTANTS.MAX_RETRY_COUNT) {
        retryCount.value++;
        await handleSubmit(true);
      } else {
        showToast('재시도 횟수가 초과되었습니다.', 'warning');
      }
    } else {
      throw new Error('Network still unstable');
    }
  } catch (networkError) {
    console.log('네트워크 여전히 불안정:', networkError);
    showToast('아직 네트워크에 문제가 있어요. 조금 더 기다려주세요.', 'warning');
  }
};

// 폼 데이터 복원
const restoreFormData = () => {
  console.log('폼 데이터 복원 시도');

  const backup = localStorage.getItem('formBackup');
  if (!backup) {
    console.log('백업 데이터가 없음');
    return false;
  }

  try {
    const formBackup = JSON.parse(backup);
    console.log('백업 데이터 파싱 성공:', formBackup);

    const oneHour = CONSTANTS.BACKUP_EXPIRY_HOURS * 60 * 60 * 1000;
    const isRecent = Date.now() - formBackup.timestamp < oneHour;
    const isCorrectPage = formBackup.page === 'preinfo';

    console.log('복원 조건 체크:', { isRecent, isCorrectPage });

    if (isRecent && isCorrectPage) {
      // 폼 데이터 복원
      let restoredCount = 0;
      Object.keys(formBackup).forEach((key) => {
        if (key !== 'timestamp' && key !== 'page' && key in form.value) {
          form.value[key] = formBackup[key];
          restoredCount++;
        }
      });

      console.log(`${restoredCount}개 필드 복원 완료`);

      // URL 파라미터가 있는 경우에만 모달 표시 (로그인 후 복원)
      const urlParams = new URLSearchParams(window.location.search);
      const restoredFlag = urlParams.get('restored');

      if (restoredFlag === 'true') {
        showDataRestoredModal();
      }

      localStorage.removeItem('formBackup');
      return true;
    } else {
      console.log('백업 데이터가 오래되었거나 다른 페이지 데이터');
      localStorage.removeItem('formBackup');
      return false;
    }
  } catch (error) {
    console.error('폼 데이터 복원 실패:', error);
    localStorage.removeItem('formBackup');
    return false;
  }
};

// 컴포넌트 마운트 시 복원 확인
onMounted(() => {
  console.log('PreInfoForm 마운트됨');

  const urlParams = new URLSearchParams(window.location.search);
  const restoredFlag = urlParams.get('restored');

  console.log('URL 파라미터 restored:', restoredFlag);

  // URL 파라미터 기반 복원 시도
  if (restoredFlag === 'true') {
    console.log('복원 플래그 감지 - 데이터 복원 시도');

    const restored = restoreFormData();

    if (!restored) {
      console.log('복원할 데이터 없음 - 일반 로그인 메시지');
      showToast('로그인이 완료되었어요! 사전 정보를 입력해주세요.', 'success');
    }

    // URL 정리
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    console.log('URL 정리 완료:', cleanUrl);
  } else {
    // 백업 데이터가 있는지 확인하고 자동 복원 제안
    const currentBackup = localStorage.getItem('formBackup');
    console.log('현재 localStorage 백업 상태:', currentBackup ? '있음' : '없음');

    if (currentBackup) {
      try {
        const backupData = JSON.parse(currentBackup);
        const oneHour = CONSTANTS.BACKUP_EXPIRY_HOURS * 60 * 60 * 1000;
        const isRecent = Date.now() - backupData.timestamp < oneHour;
        const isCorrectPage = backupData.page === 'preinfo';

        if (isRecent && isCorrectPage) {
          console.log('유효한 백업 데이터 발견 - 복원 제안');
          showBackupRestoreModal();
        } else {
          console.log('오래된 백업 데이터 - 정리');
          localStorage.removeItem('formBackup');
        }
      } catch (error) {
        console.error('백업 데이터 파싱 오류:', error);
        localStorage.removeItem('formBackup');
      }
    }
  }
});

// 페이지 이탈 시 자동 백업
onBeforeUnmount(() => {
  const hasFormData = Object.values(form.value).some(
    (value) => value !== null && value !== '' && value !== undefined
  );

  const isSubmitted = localStorage.getItem('preinfoSubmitted');

  if (hasFormData && !isSubmitted) {
    backupFormData();
  }
});
</script>

<style scoped>
/* 컨테이너 */
.preinfo-container {
  min-height: 100vh;
  /* background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%); */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.preinfo-form {
  width: 100%;
  max-width: 26.875rem;
  background: var(--color-white);
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 1.25rem 2.5rem rgba(45, 51, 107, 0.15);
  position: relative;
  overflow: hidden;
}

/* 헤더 */
.form-header {
  text-align: center;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.header-accent {
  width: 3.75rem;
  height: 0.25rem;
  background: linear-gradient(90deg, var(--color-main), var(--color-sub));
  border-radius: 0.125rem;
  margin: 0 auto 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-sub);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 1.5rem;
}

/* 진행률 바 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 0.375rem;
  background: #f0f0f0;
  border-radius: 0.1875rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-main), var(--color-sub));
  transition: width 0.5s ease;
  border-radius: 0.1875rem;
}

.progress-text {
  font-weight: 600;
  color: var(--color-main);
  font-size: 0.8rem;
  white-space: nowrap;
}

/* 폼 바디 */
.form-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 섹션 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
}

.form-section.completed {
  background: rgba(40, 167, 69, 0.05);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 0.0625rem solid rgba(40, 167, 69, 0.2);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
  padding: 1rem 0 0.75rem;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title::after {
  content: '';
  flex: 1;
  height: 0.0625rem;
  background: linear-gradient(90deg, var(--color-main), transparent);
}

.title-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: var(--color-white);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: #28a745;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  animation: checkBounce 0.5s ease;
}

@keyframes checkBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 입력 그룹 */
.input-groups {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
}

.input-field {
  padding: 0.75rem;
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.625rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: var(--color-white);
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.input-field::-webkit-outer-spin-button,
.input-field::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 0.1875rem rgba(45, 51, 107, 0.1);
}

.input-field::placeholder {
  color: #adb5bd;
}

/* 통화 입력 */
.currency-input {
  display: flex;
  align-items: center;
  position: relative;
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.625rem;
  background: var(--color-white);
  transition: all 0.2s ease;
}

.currency-input:focus-within {
  border-color: var(--color-main);
  box-shadow: 0 0 0 0.1875rem rgba(45, 51, 107, 0.1);
}

.currency-input .input-field {
  flex: 1;
  border: none;
  box-shadow: none;
  background: transparent;
  padding-right: 0.5rem;
}

.currency-input .input-field:focus {
  border: none;
  box-shadow: none;
}

.currency-unit {
  background: linear-gradient(135deg, var(--color-sub), var(--color-main));
  color: var(--color-white);
  padding: 0.5rem 0.75rem;
  border-radius: 50%;
  font-weight: 600;
  font-size: 1rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
  box-shadow: 0 0.125rem 0.25rem rgba(45, 51, 107, 0.2);
}

/* 토글 그룹 (기혼여부) - 슬라이딩 애니메이션 */
.toggle-group {
  display: flex;
  background: var(--color-bg-light);
  border-radius: 0.625rem;
  padding: 0.25rem;
  gap: 0.25rem;
  border: 0.09375rem solid var(--color-sub);
  position: relative;
}

.toggle-slider {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: calc(50% - 0.4rem);
  height: calc(100% - 0.5rem);
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  border-radius: 0.5rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0.125rem 0.25rem rgba(45, 51, 107, 0.2);
  opacity: 1;
  animation: sliderAppear 0.3s ease;
}

@keyframes sliderAppear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.toggle-slider.slide-right {
  transform: translateX(calc(100% + 0.25rem));
}

.toggle-option {
  flex: 1;
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.toggle-option span {
  display: block;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
  transition: all 0.2s ease;
}

.toggle-option.active span {
  color: var(--color-white);
}

.toggle-option input {
  display: none;
}

/* 칩 그룹 - 바운스 애니메이션 */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 0.09375rem solid var(--color-sub);
  background: var(--color-white);
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06);
}

.chip.bounce {
  animation: chipBounce 0.3s ease;
}

@keyframes chipBounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.chip span {
  display: block;
  padding: 0.5rem 0.875rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-main);
  white-space: nowrap;
  transition: all 0.2s ease;
}

.chip:hover {
  border-color: var(--color-main);
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.5rem rgba(45, 51, 107, 0.15);
}

.chip:hover span {
  background: rgba(45, 51, 107, 0.05);
}

.chip.active {
  border-color: var(--color-main);
  background: var(--color-main);
  transform: scale(1.02);
  box-shadow: 0 0.25rem 0.75rem rgba(45, 51, 107, 0.25);
}

.chip.active span {
  color: var(--color-white);
}

.chip input {
  display: none;
}

/* 도움말 텍스트 */
.help-text {
  font-size: 0.8rem;
  color: var(--color-main);
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  background: rgba(45, 51, 107, 0.05);
  border-radius: 0.5rem;
  border-left: 0.1875rem solid var(--color-main);
  transition: all 0.3s ease;
}

.help-text.warning {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
  border-left-color: #dc3545;
  animation: warningPulse 2s infinite;
}

@keyframes warningPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 제출 버튼 */
.submit-btn {
  margin-top: 0.5rem;
  padding: 0.875rem;
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: var(--color-white);
  border: none;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.5rem 1.25rem rgba(45, 51, 107, 0.25);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 22.5rem) {
  .chip-group {
    gap: 0.375rem;
  }

  .chip span {
    padding: 0.4rem 0.625rem;
    font-size: 0.7rem;
  }
}
</style>
