<template>
  <div class="tab-pane active">
    <!-- 나이대별 비교 -->
    <div class="row">
      <div class="col-12">
        <AgeComparisonChart
          :user-age-group="userAgeGroup"
          :age-comparison-chart="ageComparisonChart"
          :total-amount="totalAmount"
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

  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
});
</script>

<style scoped>
.row {
  margin: 0;
}

.col-12 {
  padding: 0;
}
</style>
