<template>
  <ToastProvider>
    <LayoutDefault />
    <Modal />
  </ToastProvider>
</template>

<script setup>
import Modal from '@/components/common/Modal.vue';
import LayoutDefault from './layouts/LayoutDefault.vue';
import ToastProvider from '@/components/common/ToastProvider.vue';
</script>
