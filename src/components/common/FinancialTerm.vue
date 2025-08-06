<template>
  <span class="term-wrapper" @mouseenter="show = true" @mouseleave="show = false">
    {{ term }}
    <div v-if="show" class="tooltip">{{ termDescription }}</div>
  </span>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue';
import { financialTerms } from '@/constants/financialTerms';

const props = defineProps({ term: String });
const show = ref(false);

const termDescription = computed(() => financialTerms[props.term] || '설명 없음');

watchEffect(() => {
  console.log('툴팁 show 상태:', show.value);
});
</script>

<style scoped>
.term-wrapper {
  position: relative;
  display: inline-block;
  cursor: help;
  border-bottom: 1px dotted #999;
}

.tooltip {
  position: absolute;
  top: 120%;
  left: 0;
  background: yellow;
  color: black;
  border: 2px solid red;
  padding: 0.5rem;
  font-size: 0.75rem;
  white-space: normal;
  z-index: 9999;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
