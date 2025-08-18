<template>
  <div class="conditions-card">
    <h3 class="section-title">우대 조건</h3>
    <div v-if="Array.isArray(conditions) && conditions.length > 0" class="conditions-list">
      <div v-for="(text, i) in conditions" :key="i" class="condition-item">
        <span class="condition-number">{{ i + 1 }}</span>
        <span class="condition-text">{{ text }}</span>
      </div>
    </div>
    <div v-else class="no-conditions">우대 조건 정보가 없습니다.</div>
  </div>
</template>

<script setup>
defineProps({
  conditions: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.conditions-card {
  padding: 1.25rem 1rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  max-width: 430px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-main);
  font-weight: 700;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.condition-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.condition-number {
  min-width: 1.5rem;
  min-height: 1.5rem;
  background: var(--color-main);
  color: #fff;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.condition-text {
  flex: 1;
  line-height: 1.6;
  font-size: 0.93rem;
  color: var(--color-text);
}

.no-conditions {
  color: var(--color-sub);
  font-size: 0.93rem;
  font-style: italic;
  padding: 0.6rem 0;
  text-align: left;
}
</style>
