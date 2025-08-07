<template>
  <div class="summary-cards">
    <ResultCard v-for="card in cards" :key="card.title" v-bind="card" />
  </div>
</template>

<script setup>
import ResultCard from './ResultCard.vue';

defineProps({
  cards: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.summary-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
  width: 100%;
  max-width: 20rem;
}
</style>
