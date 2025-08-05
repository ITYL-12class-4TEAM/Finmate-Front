<template>
  <div class="question-container" :class="{ answered: value !== null }">
    <!-- 질문 헤더 -->
    <div class="question-header">
      <div class="question-number">
        <span class="q-label">Q</span>
        <span class="q-index">{{ index + 1 }}</span>
      </div>
      <div v-if="value !== null" class="completion-badge">
        <i class="fa-solid fa-check"></i>
      </div>
    </div>

    <!-- 질문 텍스트 -->
    <div class="question-text">
      {{ question.question }}
    </div>

    <!-- 선택지 영역 -->
    <div class="options-section">
      <!-- 좌우 라벨 -->
      <div class="scale-labels">
        <span class="scale-label left">
          <i class="fa-solid fa-arrow-left"></i>
          {{ question.left_ans }}
        </span>
        <span class="scale-label right">
          {{ question.right_ans }}
          <i class="fa-solid fa-arrow-right"></i>
        </span>
      </div>

      <!-- 5점 척도 선택지 -->
      <div class="radio-group">
        <label
          v-for="score in 5"
          :key="score"
          class="radio-option"
          :class="{
            selected: score === value,
            'hover-effect': score !== value,
          }"
        >
          <input
            type="radio"
            :name="'question-' + index"
            :value="score"
            :checked="score === value"
            class="radio-input"
            @change="$emit('update:value', Number(score))"
          />
          <div class="option-circle">
            <div v-if="score === value" class="option-inner">
              <i class="fa-solid fa-check"></i>
            </div>
            <div v-else class="option-number">{{ score }}</div>
          </div>
          <div class="option-label">{{ score }}</div>
        </label>
      </div>
    </div>

    <!-- 진행 표시선 -->
    <div v-if="value !== null" class="progress-indicator">
      <div class="progress-line"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WMTIQuestion',
  props: {
    question: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    value: {
      required: true,
    },
  },
  emits: ['update:value'],
  mounted() {
    console.log(`question ${this.index}:`, this.value);
  },
};
</script>

<style scoped>
/* 메인 컨테이너 */
.question-container {
  background: linear-gradient(135deg, var(--color-white) 0%, rgba(248, 249, 252, 0.9) 100%);
  border: 2px solid rgba(185, 187, 204, 0.15);
  border-radius: 1.25rem;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(45, 51, 107, 0.06);
  position: relative;
  overflow: hidden;
}

.question-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(45, 51, 107, 0.1), transparent);
  transition: all 0.4s ease;
}

.question-container.answered {
  border-color: rgba(45, 51, 107, 0.3);
  box-shadow: 0 6px 24px rgba(45, 51, 107, 0.12);
  transform: translateY(-2px);
}

.question-container.answered::before {
  background: linear-gradient(90deg, var(--color-main), #4a5299, var(--color-main));
}

/* 질문 헤더 */
.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.question-number {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  color: var(--color-white);
  padding: 0.5rem 0.875rem;
  border-radius: 1.25rem;
  font-weight: 700;
  box-shadow: 0 3px 12px rgba(45, 51, 107, 0.25);
}

.q-label {
  font-size: 0.8rem;
  opacity: 0.9;
}

.q-index {
  font-size: 1rem;
}

.completion-badge {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: var(--color-white);
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
  animation: checkBounce 0.5s ease-out;
}

/* 질문 텍스트 */
.question-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
  padding: 0 0.5rem;
}

/* 선택지 섹션 */
.options-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 스케일 라벨 */
.scale-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
}

.scale-label {
  font-size: 0.8rem;
  color: var(--color-sub);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  max-width: 45%;
  text-align: center;
}

.scale-label.left {
  text-align: left;
}

.scale-label.right {
  text-align: right;
  flex-direction: row-reverse;
}

.scale-label i {
  font-size: 0.7rem;
  opacity: 0.7;
}

/* 라디오 그룹 */
.radio-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.25rem;
}

.radio-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  padding: 0.5rem 0.25rem;
  border-radius: 0.75rem;
  position: relative;
}

.radio-option.hover-effect:hover {
  background: rgba(45, 51, 107, 0.05);
  transform: translateY(-2px);
}

.radio-option.selected {
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.08), rgba(45, 51, 107, 0.04));
  transform: translateY(-2px);
}

.radio-input {
  display: none;
}

/* 옵션 원형 - 크기 차등 적용 */
.option-circle {
  border: 2.5px solid rgba(185, 187, 204, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-white);
  position: relative;
  overflow: hidden;
}

/* 크기 차등 적용 */
.radio-option:nth-child(1) .option-circle,  /* 1점 */
.radio-option:nth-child(5) .option-circle {
  /* 5점 */
  width: 3.25rem;
  height: 3.25rem;
}

.radio-option:nth-child(2) .option-circle,  /* 2점 */
.radio-option:nth-child(4) .option-circle {
  /* 4점 */
  width: 2.875rem;
  height: 2.875rem;
}

.radio-option:nth-child(3) .option-circle {
  /* 3점 (중간) */
  width: 2.5rem;
  height: 2.5rem;
}

.radio-option:hover .option-circle {
  border-color: rgba(45, 51, 107, 0.4);
  box-shadow: 0 4px 16px rgba(45, 51, 107, 0.15);
  transform: scale(1.05);
}

.radio-option.selected .option-circle {
  border-color: var(--color-main);
  background: linear-gradient(135deg, var(--color-main), #4a5299);
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(45, 51, 107, 0.3);
}

.option-inner {
  color: var(--color-white);
  font-size: 1rem;
  font-weight: 700;
  animation: checkPop 0.3s ease-out;
}

.option-number {
  font-weight: 700;
  color: var(--color-sub);
  transition: all 0.3s ease;
}

/* 숫자 크기도 원형에 맞춰 차등 적용 */
.radio-option:nth-child(1) .option-number,  /* 1점 */
.radio-option:nth-child(5) .option-number {
  /* 5점 */
  font-size: 1.25rem;
}

.radio-option:nth-child(2) .option-number,  /* 2점 */
.radio-option:nth-child(4) .option-number {
  /* 4점 */
  font-size: 1.125rem;
}

.radio-option:nth-child(3) .option-number {
  /* 3점 (중간) */
  font-size: 1rem;
}

.radio-option:hover .option-number {
  color: var(--color-main);
  transform: scale(1.1);
}

/* 옵션 라벨 */
.option-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-light);
  transition: all 0.3s ease;
  text-align: center;
}

.radio-option:hover .option-label {
  color: var(--color-sub);
  transform: scale(1.05);
}

.radio-option.selected .option-label {
  color: var(--color-main);
  font-weight: 700;
  transform: scale(1.1);
}

/* 진행 표시선 */
.progress-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  overflow: hidden;
}

.progress-line {
  height: 100%;
  background: linear-gradient(90deg, var(--color-main), #4a5299);
  animation: progressSlide 0.6s ease-out;
}

/* 애니메이션 */
@keyframes checkBounce {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes checkPop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.3) rotate(-90deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes progressSlide {
  0% {
    width: 0;
    opacity: 0;
  }
  100% {
    width: 100%;
    opacity: 1;
  }
}

/* 반응형 - 모바일에서도 크기 차등 유지 */
@media (max-width: 375px) {
  .question-container {
    padding: 1.25rem;
  }

  .question-text {
    font-size: 1rem;
  }

  /* 모바일에서 크기 조정 */
  .radio-option:nth-child(1) .option-circle,  /* 1점 */
  .radio-option:nth-child(5) .option-circle {
    /* 5점 */
    width: 3rem;
    height: 3rem;
  }

  .radio-option:nth-child(2) .option-circle,  /* 2점 */
  .radio-option:nth-child(4) .option-circle {
    /* 4점 */
    width: 2.75rem;
    height: 2.75rem;
  }

  .radio-option:nth-child(3) .option-circle {
    /* 3점 (중간) */
    width: 2.25rem;
    height: 2.25rem;
  }

  /* 모바일에서 숫자 크기 조정 */
  .radio-option:nth-child(1) .option-number,  /* 1점 */
  .radio-option:nth-child(5) .option-number {
    /* 5점 */
    font-size: 1.125rem;
  }

  .radio-option:nth-child(2) .option-number,  /* 2점 */
  .radio-option:nth-child(4) .option-number {
    /* 4점 */
    font-size: 1rem;
  }

  .radio-option:nth-child(3) .option-number {
    /* 3점 (중간) */
    font-size: 0.875rem;
  }

  .radio-group {
    gap: 0.25rem;
  }
}
</style>
