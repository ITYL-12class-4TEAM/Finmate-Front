import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { notificationAPI } from '@/api/notification';
import { useAuthStore } from '@/stores/useAuthStore';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([]);
  const isLoading = ref(false);
  const unreadCount = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const eventSource = ref(null);
  const isConnected = ref(false);
  // 알림 목록 조회
  const fetchNotifications = async (page = 1, size = 20, type = null, isRead = null) => {
    try {
      isLoading.value = true;
      const result = await notificationAPI.getNotifications(page, size, type, isRead);
      if (result.success) {
        notifications.value = result.data.notifications || [];
        unreadCount.value = result.data.unreadCount || 0;
        totalPages.value = result.data.totalPages || 0;
        currentPage.value = page;
      }
      return result;
    } catch (error) {
      console.error('알림 조회 실패:', error);
      return { success: false, message: '알림 조회에 실패했습니다.' };
    } finally {
      isLoading.value = false;
    }
  };
  // 읽지 않은 알림 수만 조회
  const fetchUnreadCount = async () => {
    try {
      const result = await notificationAPI.getUnreadCount();
      if (result.success) {
        unreadCount.value = result.data;
      }
      return result;
    } catch (error) {
      console.error('읽지 않은 알림 수 조회 실패:', error);
      return { success: false, message: '읽지 않은 알림 수 조회에 실패했습니다.' };
    }
  };
  // 특정 알림 읽음 처리
  const markAsRead = async (notificationId) => {
    try {
      const result = await notificationAPI.markAsRead(notificationId);
      if (result.success) {
        // 로컬 상태 업데이트
        const notification = notifications.value.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
      return result;
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      return { success: false, message: '알림 읽음 처리에 실패했습니다.' };
    }
  };
  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const result = await notificationAPI.markAllAsRead();
      if (result.success) {
        // 로컬 상태 업데이트
        notifications.value.forEach((n) => (n.isRead = true));
        unreadCount.value = 0;
      }
      return result;
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      return { success: false, message: '모든 알림 읽음 처리에 실패했습니다.' };
    }
  };
  // 알림 설정 조회
  const getNotificationSettings = async () => {
    try {
      const result = await notificationAPI.getNotificationSettings();
      return result;
    } catch (error) {
      console.error('알림 설정 조회 실패:', error);
      return { success: false, message: '알림 설정 조회에 실패했습니다.' };
    }
  };
  // 알림 설정 업데이트
  const updateNotificationSettings = async (settings) => {
    try {
      const result = await notificationAPI.updateNotificationSettings(settings);
      return result;
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      return { success: false, message: '알림 설정 업데이트에 실패했습니다.' };
    }
  };
  // 새 알림 추가 (실시간 알림용)
  const addNotification = (notification) => {
    notifications.value.unshift(notification);
    if (!notification.isRead) {
      unreadCount.value += 1;
    }
  };

  // SSE 연결 설정
  const connectSSE = () => {
    const authStore = useAuthStore();
    
    if (eventSource.value) {
      eventSource.value.close();
    }

    // 토큰이 없으면 연결하지 않음
    if (!authStore.accessToken) {
      console.warn('인증 토큰이 없어 SSE 연결을 시도하지 않습니다.');
      return;
    }

    // URL에 토큰을 쿼리 파라미터로 추가
    const sseUrl = `/api/notifications/stream?token=${encodeURIComponent(authStore.accessToken)}`;
    
    eventSource.value = new EventSource(sseUrl, {
      withCredentials: true
    });

    eventSource.value.onopen = () => {
      console.log('SSE 연결 성공');
      isConnected.value = true;
    };

    eventSource.value.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        addNotification(notification);
        
        // 브라우저 알림 표시
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id
          });
        }
      } catch (error) {
        console.error('SSE 메시지 파싱 오류:', error);
      }
    };

    eventSource.value.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
      isConnected.value = false;
      
      // 401 Unauthorized인 경우 재연결하지 않음
      if (error.target.readyState === EventSource.CLOSED) {
        console.log('SSE 연결이 서버에 의해 종료되었습니다.');
        return;
      }
      
      // 토큰이 유효한 경우에만 재연결 시도 (5초 후)
      setTimeout(() => {
        if (!isConnected.value && authStore.accessToken) {
          console.log('SSE 재연결 시도...');
          connectSSE();
        }
      }, 5000);
    };
  };

  // SSE 연결 해제
  const disconnectSSE = () => {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
      isConnected.value = false;
      console.log('SSE 연결 해제');
    }
  };

  return {
    notifications,
    isLoading,
    unreadCount,
    totalPages,
    currentPage,
    eventSource,
    isConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationSettings,
    updateNotificationSettings,
    addNotification,
    connectSSE,
    disconnectSSE,
  };
});
