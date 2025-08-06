<template>
  <span class="badge" :class="badgeClass">
    {{ displayText }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['board'].includes(value),
  },
  value: {
    type: String,
    required: true,
  },
});

const badgeClass = computed(() => {
  if (props.type === 'board') {
    const badges = {
      FREE: 'bg-free text-black', // 커스텀 클래스 사용
      HOT: 'bg-free text-black',
      NOTICE: 'bg-free text-black',
    };

    return badges[props.value] || 'bg-secondary text-white';
  }
  return 'bg-secondary text-white';
});

const displayText = computed(() => {
  if (props.type === 'board') {
    const names = {
      FREE: '자유게시판',
      HOT: 'HOT게시판',
      NOTICE: '공지사항',
    };
    return names[props.value] || props.value;
  }
  return props.value;
});
</script>

<style scoped>
.badge {
  font-size: 0.75rem;
  font-weight: 500;
}
.bg-free {
  background-color: var(--color-bg-light) !important;
}
</style>
