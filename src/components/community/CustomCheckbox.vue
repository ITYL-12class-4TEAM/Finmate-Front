<template>
  <label :for="id" class="checkbox-wrapper">
    <input
      type="checkbox"
      :id="id"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="custom-checkbox"
    />
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
  gap: 0.4rem;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--color-sub);
  border-radius: 4px;
  position: relative;
  background-color: white;
}

.custom-checkbox:checked {
  background-color: var(--color-sub);
  border-color: var(--color-sub);
}

.custom-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.label-text {
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
