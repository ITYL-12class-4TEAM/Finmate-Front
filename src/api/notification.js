import api from './index';

export const notificationAPI = {
  // 알림 목록 조회
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return {
      success: response.data.header?.status === 'OK',
      data: {
        notifications: response.data.body || [],
      },
      message: response.data.header?.message || '알림 조회',
    };
  },

  // 읽지 않은 알림 수 조회
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return {
      success: response.data.header?.status === 'OK',
      data: response.data.body,
      message: response.data.header?.message || '읽지 않은 알림 수 조회',
    };
  },

  // 특정 알림 읽음 처리
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return {
      success: response.data.header?.status === 'OK',
      data: response.data.body,
      message: response.data.header?.message || '알림 읽음 처리',
    };
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return {
      success: response.data.header?.status === 'OK',
      data: response.data.body,
      message: response.data.header?.message || '모든 알림 읽음 처리',
    };
  },

  // 알림 설정 조회
  getNotificationSettings: async () => {
    const response = await api.get('/notifications/settings');
    return {
      success: response.data.header?.status === 'OK',
      data: response.data.body,
      message: response.data.header?.message || '알림 설정 조회',
    };
  },

  // 알림 설정 업데이트
  updateNotificationSettings: async (settings) => {
    const response = await api.put('/notifications/settings', settings);
    return {
      success: response.data.header?.status === 'OK',
      data: response.data.body,
      message: response.data.header?.message || '알림 설정 업데이트',
    };
  },
};
