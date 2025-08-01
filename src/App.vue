<template>
  <ToastProvider>
    <ModalProvider>
      <LayoutDefault />
    </ModalProvider>
  </ToastProvider>
</template>

<script setup>
import LayoutDefault from './layouts/LayoutDefault.vue';
import ToastProvider from '@/components/common/ToastProvider.vue';
import ModalProvider from '@/components/common/ModalProvider.vue';
</script>
