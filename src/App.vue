<template>
  <ToastProvider>
    <LayoutDefault />
    <Modal />
  </ToastProvider>
</template>

<script setup>
import { watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import Modal from '@/components/common/Modal.vue';
import LayoutDefault from './layouts/LayoutDefault.vue';
import ToastProvider from '@/components/common/ToastProvider.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const route = useRoute();

let sseInitialized = false;

// 추가정보 미입력 사용자 지속적 체크
watch(
  () => authStore.needsAdditionalInfo,
  (needsInfo) => {
    if (needsInfo) {
      // 추가정보가 필요한 상태가 되면 즉시 체크
      nextTick(() => {
        authStore.checkAuthStatus();
      });
    }
  },
  { immediate: true }
);

// 라우트 변경 감지하여 추가정보 체크
watch(
  () => route.path,
  (newPath) => {
    if (authStore.needsAdditionalInfo) {
      const allowedPaths = ['/login/signup', '/signup', '/auth/oauth2/redirect'];
      if (!allowedPaths.includes(newPath)) {
        // 허용되지 않은 페이지로 이동하려 할 때 리다이렉트
        nextTick(() => {
          authStore.checkAuthStatus();
        });
      }
    }
  }
);

// 인증 상태 변경 감지
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth && !sseInitialized) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      setTimeout(() => {
        notificationStore.connectSSE();
        notificationStore.fetchNotifications();
        sseInitialized = true;
      }, 1000);

      // 로그인 후 추가정보 체크
      nextTick(() => {
        authStore.checkAuthStatus();
      });
    } else if (!isAuth && sseInitialized) {
      notificationStore.clearNotifications();
      sseInitialized = false;
    }
  }
);

// 페이지 포커스 시 추가정보 체크 (사용자가 탭을 다시 활성화했을 때)
const handlePageFocus = () => {
  if (authStore.needsAdditionalInfo) {
    authStore.checkAuthStatus();
  }
};

// 페이지 가시성 변경 감지 (탭 전환 등)
const handleVisibilityChange = () => {
  if (!document.hidden && authStore.needsAdditionalInfo) {
    // 페이지가 다시 보이게 되었을 때 체크
    setTimeout(() => {
      authStore.checkAuthStatus();
    }, 100);
  }
};

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

  // 추가정보 미입력 사용자 체크를 위한 이벤트 리스너 등록
  window.addEventListener('focus', handlePageFocus);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 초기 로드 시 추가정보 체크
  if (authStore.needsAdditionalInfo) {
    nextTick(() => {
      authStore.checkAuthStatus();
    });
  }
});

onUnmounted(() => {
  notificationStore.disconnectSSE();
  sseInitialized = false;

  // 이벤트 리스너 정리
  window.removeEventListener('focus', handlePageFocus);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>
