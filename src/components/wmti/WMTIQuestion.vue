<template>
  <div class="question-container">
    <div class="question-title">{{ index + 1 }}. {{ question.question }}</div>

    <div class="answers-wrapper">
      <span class="answer-label">{{ question.left_ans }}</span>

      <div class="radio-group">
        <label v-for="score in 5" :key="score" class="radio-option">
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
  padding: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.question-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
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
  color: #666;
  white-space: nowrap;
}

.radio-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-grow: 1;
}

.radio-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
}
</style>
