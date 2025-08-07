<template>
  <span class="term-wrapper" @mouseenter="show = true" @mouseleave="show = false">
    {{ term }}
    <div class="tooltip" :class="{ visible: show }">
      <p class="term">{{ term }}</p>
      <p>{{ termDescription }}</p>
    </div>
  </span>
</template>

<script setup>
import { ref, computed } from 'vue';
import { financialTerms } from '@/constants/financialTerms';

const props = defineProps({ term: String });
const show = ref(false);

const termDescription = computed(() => financialTerms[props.term] || '설명 없음');
</script>

<style scoped>
.term-wrapper {
  position: relative;
  display: inline-block;
  cursor: help;
  border-bottom: 2px dotted var(--color-sub);
  font-weight: 500;
}

.tooltip {
  position: absolute;
  top: 140%;
  left: 50%;
  transform: translateX(-50%);
  background: #fdf4d0;
  color: #333;
  padding: 0.5rem 0.7rem;
  font-size: 0.7rem;
  line-height: 1.5;
  z-index: 100;
  border: 1.2px solid #ffce7f;
  border-radius: 0.75rem;
  white-space: normal;
  word-break: keep-all;
  min-width: 8rem;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition:
    opacity 0.2s ease-in-out,
    visibility 0.2s ease-in-out;
  visibility: hidden;
  pointer-events: none;
}

.tooltip.visible {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent #fff8dc transparent;
}

.tooltip p {
  margin: 0;
  text-align: center;
}

.term {
  font-weight: 600;
  padding-bottom: 0.2rem;
}
</style>
