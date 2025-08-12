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

// 인증 상태 변화 감지 (중복 호출 방지)
let sseInitialized = false;

watch(
  () => authStore.isAuthenticated,
  (isAuth, wasAuth) => {
    console.log('🔄 인증 상태 변화:', { from: wasAuth, to: isAuth });

    if (isAuth && !sseInitialized) {
      console.log('🎯 SSE 연결 시작 (watch)');

      // 브라우저 알림 권한 요청
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // 약간의 지연 후 SSE 연결
      setTimeout(() => {
        notificationStore.connectSSE();
        notificationStore.fetchNotifications();
        sseInitialized = true;
      }, 1000);
    } else if (!isAuth && sseInitialized) {
      console.log('🔌 SSE 연결 해제 (watch)');
      notificationStore.clearNotifications();
      sseInitialized = false;
    }
  }
);

onMounted(async () => {
  console.log('🚀 App 마운트 시작');

  // 1. 인증 상태 초기화 (가장 중요!)
  await authStore.initialize();

  console.log('🔐 인증 초기화 완료:', {
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.accessToken,
  });

  // 2. 인증된 사용자라면 알림 서비스 초기화
  if (authStore.isAuthenticated && !sseInitialized) {
    console.log('🎯 SSE 연결 시작 (mounted)');

    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 인증 상태가 안정화된 후 SSE 연결
    setTimeout(() => {
      notificationStore.connectSSE();
      notificationStore.fetchNotifications();
      sseInitialized = true;
    }, 1500);
  }
});

// 컴포넌트 언마운트 시 정리
onUnmounted(() => {
  console.log('🧹 App 언마운트');
  notificationStore.disconnectSSE();
  sseInitialized = false;
});
</script>
