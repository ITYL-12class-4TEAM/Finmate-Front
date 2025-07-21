<template>
  <LayoutDefault />
  <ModalProvider />
</template>

<script setup>
import { reactive, provide } from 'vue';
import LayoutDefault from './layouts/LayoutDefault.vue';
import ModalProvider from '@/components/common/ModalProvider.vue';

// Modal
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
