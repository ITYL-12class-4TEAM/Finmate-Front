<template>
  <div class="question-container">
    <div class="question-title">
      Q{{ index + 1 }}. {{ question.question }}
    </div>
    <div class="radio-group">
        <label v-for="score in 5" 
        :key="score" 
        class="radio-option" 
        :class="{ selected: score === value }"
        >
          <input
            type="radio"
            :name="'question-' + index"
            :value="score"
            :checked="score === value"
            @change="$emit('update:value', Number(score))"
          />
          {{ score }}
        </label>
      </div>
    <div class="answers-wrapper">
      <span class="answer-label">{{ question.left_ans }}</span>
      <span class="answer-label">{{ question.right_ans }}</span>
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
      //type: [Number],
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
.question-container {
  background: var(--color-white);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-main);
  line-height: 1.5;
}

.answers-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.answer-label {
  font-size: 14px;
  color: var(--color-sub);
  width: 60px;
  text-align: center;
  flex-shrink: 0;
}

.radio-group {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-grow: 1;
}

.radio-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--color-bg-light);
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  min-width: 42px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  color: var(--color-sub);
}
.radio-option:hover {
  background-color: #e0e0e7;
}
.radio-option.selected{
  background-color: var(--color-main);
  color: var(--color-white);
  border-color: var(--color-main);
  font-weight: 600;
}
.radio-box input {
  display: none;
}
</style>
