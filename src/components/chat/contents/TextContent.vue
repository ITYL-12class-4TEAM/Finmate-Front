<template>
  <p>{{ message.text }}</p>
</template>

<script setup>
defineProps({
  message: Object,
});
</script>
