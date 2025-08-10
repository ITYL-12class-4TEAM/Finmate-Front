<template>
  <label :for="id" class="checkbox-wrapper">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      class="custom-checkbox"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="checkmark">
      <i class="fas fa-check"></i>
    </span>
    <span class="label-text"><slot /></span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    required: true,
  },
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.custom-checkbox {
  appearance: none;
  width: 0.875rem;
  height: 0.875rem;
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.1875rem;
  position: relative;
  background-color: white;
  transition: all 0.2s ease;
  margin: 0;
}

.custom-checkbox:hover {
  border-color: var(--color-sub);
  box-shadow: 0 0 0 0.125rem rgba(125, 129, 162, 0.1);
}

.custom-checkbox:checked {
  background-color: var(--color-main);
  border-color: var(--color-main);
}

.custom-checkbox:checked:hover {
  background-color: var(--color-sub);
  border-color: var(--color-sub);
}

.checkmark {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0.875rem;
  height: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.checkmark i {
  font-size: 0.625rem;
  font-weight: 900;
}

.custom-checkbox:checked + .checkmark {
  opacity: 1;
}

.label-text {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-sub);
  transition: color 0.2s ease;
}

.checkbox-wrapper:hover .label-text {
  color: var(--color-main);
}

/* 반응형 */
@media (max-width: 768px) {
  .custom-checkbox {
    width: 0.8125rem;
    height: 0.8125rem;
  }

  .checkmark {
    width: 0.8125rem;
    height: 0.8125rem;
  }

  .checkmark i {
    font-size: 0.5625rem;
  }

  .label-text {
    font-size: 0.65rem;
  }
}
</style>