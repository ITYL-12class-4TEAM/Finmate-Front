<template>
  <Modal />
  <slot />
</template>

<script setup>
import { reactive, provide } from 'vue';
import Modal from './Modal.vue';

const modalState = reactive({
  isOpen: false,
  message: '',
});

const modalHandlers = {
  resolve: null,
};

provide('modalState', modalState);
provide('modalHandlers', modalHandlers);
</script>
