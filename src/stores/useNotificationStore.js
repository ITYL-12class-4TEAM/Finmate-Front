import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notificationAPI } from '@/api/notification';
import { useAuthStore } from '@/stores/useAuthStore';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([]);
  const isLoading = ref(false);
  const unreadCount = ref(0);
  const eventSource = ref(null);
  const isConnected = ref(false);

  function toDate(arr) {
    if (!Array.isArray(arr)) return arr;
    const [y, m, d, hh, mm, ss, ns] = arr;
    const ms = ns ? Math.floor(ns / 1e6) : 0; // 나노초 → 밀리초
    return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0, ms);
  }

  // 알림 목록 조회
  const fetchNotifications = async () => {
    isLoading.value = true;

    const result = await notificationAPI.getNotifications();
    notifications.value = result.data.notifications.data;
    console.log('알림 조회 결과:', notifications.value);

    isLoading.value = false;
    return notifications.value;
  };

  // 읽지 않은 알림 수만 조회
  const fetchUnreadCount = async () => {
    const result = await notificationAPI.getUnreadCount();
    if (result.success) {
      unreadCount.value = result.data.data;
    }
    return result;
  };

  // 특정 알림 읽음 처리
  const markAsRead = async (notificationId) => {
    const result = await notificationAPI.markAsRead(notificationId);

    if (result.success) {
      if (result.data) {
        // 서버에서 업데이트된 알림 정보로 동기화
        const updatedNotification = result.data.data;

        const index = notifications.value.findIndex(
          (n) => n.notificationId === updatedNotification.notificationId
        );

        if (index !== -1) {
          const wasUnread = !notifications.value[index].isRead;
          notifications.value[index] = { ...updatedNotification };

          if (wasUnread && updatedNotification.isRead) {
            unreadCount.value = Math.max(0, unreadCount.value - 1);
          }
        }
      } else {
        // 폴백: 기존 로직 유지
        const notification = notifications.value.find((n) => n.notificationId === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    }

    return result;
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    const result = await notificationAPI.markAllAsRead();
    if (result.success) {
      notifications.value.forEach((n) => (n.isRead = true));
      unreadCount.value = 0;
    }
    return result;
  };

  // 알림 설정 조회/업데이트 (간소화)
  const getNotificationSettings = () => notificationAPI.getNotificationSettings();
  const updateNotificationSettings = (settings) =>
    notificationAPI.updateNotificationSettings(settings);

  // 새 알림 추가 (실시간 알림용)
  const addNotification = (notification) => {
    notifications.value.unshift(notification);
    if (!notification.isRead) {
      unreadCount.value += 1;
    }
  };

  // 브라우저 알림 표시
  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        tag: `notification_${notification.notificationId}`,
      });
    }
  };

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // SSE 연결 설정
  const connectSSE = () => {
    const authStore = useAuthStore();

    if (isConnected.value && eventSource.value) return;
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
      isConnected.value = false;
    }

    // 인증 확인
    if (!authStore.isAuthenticated || !authStore.accessToken) return;

    try {
      const sseUrl = `/api/notifications/stream?token=${encodeURIComponent(authStore.accessToken)}`;
      eventSource.value = new EventSource(sseUrl, { withCredentials: true });

      // 연결 성공
      eventSource.value.onopen = () => {
        isConnected.value = true;
      };

      // 연결 확인 이벤트
      eventSource.value.addEventListener('connected', (event) => {
        console.log('SSE 연결 확인:', event.data);
      });

      // 하트비트 이벤트
      eventSource.value.addEventListener('heartbeat', (event) => {
        console.log('하트비트 수신:', event.data);
      });

      // 알림 이벤트 처리
      eventSource.value.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data);
          addNotification(notification);
          showBrowserNotification(notification);
        } catch (error) {
          console.error('알림 파싱 오류:', error);
        }
      });

      // 브로드캐스트 이벤트 처리
      eventSource.value.addEventListener('broadcast', (event) => {
        try {
          const notification = JSON.parse(event.data);
          addNotification(notification);
          showBrowserNotification(notification);
        } catch (error) {
          console.error('브로드캐스트 파싱 오류:', error);
        }
      });

      // 기본 메시지 처리 (백업용)
      eventSource.value.onmessage = (event) => {
        // 연결 유지 메시지는 무시
        const connectionMessages = [
          'SSE 연결이 성공했습니다.',
          '연결이 성공적으로 설정되었습니다.',
          'ping',
        ];

        if (connectionMessages.includes(event.data)) {
          return;
        }

        try {
          const notification = JSON.parse(event.data);
          addNotification(notification);
          showBrowserNotification(notification);
        } catch (error) {
          // 파싱 불가능한 메시지는 무시
        }
      };

      // 연결 오류 처리
      eventSource.value.onerror = (error) => {
        isConnected.value = false;

        if (error.target.readyState === EventSource.CLOSED) {
          // 인증된 상태라면 재연결 시도
          if (authStore.isAuthenticated && authStore.accessToken) {
            setTimeout(() => {
              if (!isConnected.value) connectSSE();
            }, 5000);
          }
        }
      };
    } catch (error) {
      console.error('SSE 연결 생성 오류:', error);
    }
  };

  // SSE 연결 해제
  const disconnectSSE = () => {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
      isConnected.value = false;
    }
  };

  // 상태 초기화
  const clearNotifications = () => {
    notifications.value = [];
    unreadCount.value = 0;
    disconnectSSE();
  };

  return {
    // 상태
    notifications,
    isLoading,
    unreadCount,
    eventSource,
    isConnected,

    // 액션
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    getNotificationSettings,
    updateNotificationSettings,
    addNotification,
    requestNotificationPermission,
    connectSSE,
    disconnectSSE,
    clearNotifications,
  };
});
