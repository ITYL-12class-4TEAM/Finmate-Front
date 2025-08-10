import api from './index';
export const notificationAPI = {
  // 알림 목록 조회
  getNotifications: async (page = 1, size = 20, type = null, isRead = null) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      if (type) params.append('type', type);
      if (isRead !== null) params.append('isRead', isRead.toString());
      const response = await api.get(`/api/notifications?${params.toString()}`);
      return {
        success: true,
        data: response.data.body.data || { notifications: [], unreadCount: 0 },
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '알림 조회에 실패했습니다.',
      };
    }
  },
  // 읽지 않은 알림 수 조회
  getUnreadCount: async () => {
    try {
      const response = await api.get('/api/notifications/unread-count');
      return {
        success: true,
        data: response.data.body.data || 0,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '읽지 않은 알림 수 조회에 실패했습니다.',
      };
    }
  },
  // 특정 알림 읽음 처리
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.body.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '알림 읽음 처리에 실패했습니다.',
      };
    }
  },
  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    try {
      const response = await api.put('/api/notifications/read-all');
      return {
        success: true,
        data: response.data.body.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '모든 알림 읽음 처리에 실패했습니다.',
      };
    }
  },
  // 알림 설정 조회
  getNotificationSettings: async () => {
    try {
      const response = await api.get('/api/notifications/settings');
      return {
        success: true,
        data: response.data.body.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '알림 설정 조회에 실패했습니다.',
      };
    }
  },
  // 알림 설정 업데이트
  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.put('/api/notifications/settings', settings);
      return {
        success: true,
        data: response.data.body.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '알림 설정 업데이트에 실패했습니다.',
      };
    }
  },
};
