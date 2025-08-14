<template>
  <span class="notification-badge" :class="badgeClass">
    {{ displayText }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

const displayText = computed(() => {
  if (props.type === 'type') {
    const typeMap = {
      success: '성공',
      warning: '경고',
      info: '정보',
      error: '오류',
    };
    return typeMap[props.value] || '알림';
  }
  return props.value;
});

const badgeClass = computed(() => {
  if (props.type === 'type') {
    return `type-${props.value}`;
  }
  return '';
});
</script>

<style scoped>
.notification-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all 0.2s ease;
}

.type-success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.type-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fde68a;
}

.type-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fecaca;
}

.type-info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.notification-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
