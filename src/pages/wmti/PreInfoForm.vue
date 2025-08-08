<template>
  <div class="preinfo-container">
    <div class="preinfo-form">
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { postPreinfoAPI } from '@/api/wmti';
import { InvestmentPeriodEnum, PurposeCategoryEnum } from '../../constants/wmtienums';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();
const router = useRouter();

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

const isSubmitting = ref(false);

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
  if (form.value.username && form.value.username.length >= 2) count++;
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
    form.value.username.length >= 2 &&
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
  }, 300);
};

// 유효성 검사 함수
const validateForm = () => {
  const { username, age, married, monthlyIncome, fixedCost, period, purposeCategory } = form.value;

  if (!username || username.length < 2) {
    showToast('이름을 2자 이상 입력해주세요.', 'warning');
    return false;
  }

  if (!age || age < 0 || age > 120) {
    showToast('나이를 0~120 사이로 입력해주세요.', 'warning');
    return false;
  }

  if (married !== 'true' && married !== 'false') {
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

// 제출 처리
const handleSubmit = async () => {
  if (!validateForm() || isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    const finalData = {
      ...form.value,
      married: form.value.married === 'true',
      platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'web',
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    };

    await postPreinfoAPI(finalData);
    localStorage.setItem('preinfoSubmitted', 'true');
    router.push('/wmti/basic');
  } catch (error) {
    console.error('제출 실패:', error);
    showToast('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
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
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

.input-field::-webkit-outer-spin-button,
.input-field::-webkit-inner-spin-button {
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

/* 반응형 */
@media (max-width: 30rem) {
  .preinfo-container {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .preinfo-form {
    padding: 1.25rem;
    max-width: 100%;
  }

  .input-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .title {
    font-size: 1.375rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .chip span {
    padding: 0.45rem 0.75rem;
    font-size: 0.75rem;
  }

  .form-body {
    gap: 1rem;
  }

  .form-section {
    gap: 0.875rem;
  }

  .progress-container {
    flex-direction: column;
    gap: 0.5rem;
  }
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
