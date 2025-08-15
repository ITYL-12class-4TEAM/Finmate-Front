<template>
  <ToastProvider>
    <LayoutDefault />
    <Modal />
  </ToastProvider>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import Modal from '@/components/common/Modal.vue';
import LayoutDefault from './layouts/LayoutDefault.vue';
import ToastProvider from '@/components/common/ToastProvider.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

let sseInitialized = false;

watch(
  () => authStore.isAuthenticated,
  (isAuth, wasAuth) => {
    if (isAuth && !sseInitialized) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      setTimeout(() => {
        notificationStore.connectSSE();
        notificationStore.fetchNotifications();
        sseInitialized = true;
      }, 1000);
    } else if (!isAuth && sseInitialized) {
      notificationStore.clearNotifications();
      sseInitialized = false;
    }
  }
);

onMounted(async () => {
  await authStore.initialize();

  if (authStore.isAuthenticated && !sseInitialized) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    setTimeout(() => {
      notificationStore.connectSSE();
      notificationStore.fetchNotifications();
      sseInitialized = true;
    }, 1500);
  }
});

onUnmounted(() => {
  notificationStore.disconnectSSE();
  sseInitialized = false;
});
</script>
