<template>
  <div class="conditions-card">
    <h3 class="section-title">우대 조건</h3>
    <div v-if="conditions.length > 0" class="conditions-list">
      <div
        v-for="(condition, index) in conditions"
        :key="index"
        class="condition-item"
      >
        <div class="condition-number">{{ index + 1 }}</div>
        <div class="condition-text">{{ condition }}</div>
      </div>
    </div>
    <div v-else class="no-conditions">우대 조건 정보가 없습니다.</div>
  </div>
</template>
<script>
export default {
  name: "PreferentialConditions",
  props: {
    conditions: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
<style scoped>
.conditions-card {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  margin: 0 0 1rem 0;
  color: var(--color-main);
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.condition-item {
  display: flex;
  gap: 0.75rem;
}

.condition-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background-color: var(--color-main);
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.condition-text {
  flex: 1;
  line-height: 1.5;
  font-size: 0.875rem;
  color: var(--color-text);
}

.no-conditions {
  color: var(--color-sub);
  font-style: italic;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}
</style>
