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

// 로그인 상태 감지하여 SSE 연결/해제
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // SSE 연결
    notificationStore.connectSSE();
    
    // 기존 알림 데이터 로드
    notificationStore.fetchNotifications();
  } else {
    // 로그아웃 시 SSE 연결 해제
    notificationStore.disconnectSSE();
  }
});

onMounted(() => {
  // 로그인된 사용자라면 알림 정보 불러오기 및 SSE 연결
  if (authStore.isAuthenticated) {
    // 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // SSE 연결
    notificationStore.connectSSE();
    
    // 기존 알림 데이터 로드
    notificationStore.fetchNotifications();
  }
});

// 컴포넌트 언마운트 시 SSE 연결 해제
onUnmounted(() => {
  notificationStore.disconnectSSE();
});
</script>
