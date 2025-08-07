<template>
  <tr>
    <td class="feature-cell">{{ label }}</td>
    <td v-for="(item, idx) in items" :key="idx" class="product-cell">
      <slot :item="item"></slot>
    </td>
  </tr>
</template>

<script setup>
defineProps({
  label: String,
  items: Array,
});
</script>

<style scoped>
.feature-cell {
  background-color: var(--color-bg-light);
  font-weight: 500;
  color: var(--color-main);
  text-align: left;
  min-width: 5rem;
  position: sticky;
  left: 0;
  z-index: 1;
}
.product-cell {
  min-width: 8rem;
}
.highlight {
  font-weight: 500;
  font-size: 1rem;
  color: var(--color-main);
}
.highlight.special {
  color: #e91e63;
}
</style>
