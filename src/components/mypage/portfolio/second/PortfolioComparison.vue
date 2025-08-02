<template>
  <div class="tab-pane active">
    <!-- 나이대별 비교 -->
    <div class="row">
      <div class="col-12">
        <AgeComparisonChart
          :userAgeGroup="userAgeGroup"
          :ageComparisonChart="ageComparisonChart"
          :comparisonMessage="comparisonMessage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import AgeComparisonChart from './AgeComparisonChart.vue';

const props = defineProps({
  // 사용자 기본 정보
  userAgeGroup: {
    type: String,
    required: true,
    default: '20대',
  },

  // 나이대별 비교 데이터
  ageComparisonChart: {
    type: Array,
    required: true,
    default: () => [],
  },

  // 비교 분석 메시지
  comparisonMessage: {
    type: String,
    required: true,
    default: '',
  },
});
</script>

<style scoped>
.tab-pane {
  min-height: 20rem;
}

.row {
  margin: 0;
}

.col-12 {
  padding: 0;
}
</style>
