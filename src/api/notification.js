import api from './index';

export const notificationAPI = {
  // 알림 목록 조회
  getNotifications: async (page = 1, size = 20, type = null, isRead = null) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);

      if (type) params.append('type', type);
      if (isRead !== null) params.append('isRead', isRead);

      const response = await api.get(`/api/notifications?${params.toString()}`);

      if (response.data.header?.status === 'SUCCESS') {
        return {
          success: true,
          data: {
            notifications: response.data.body.notifications || [],
            totalPages: response.data.body.pagination?.totalPages || 0,
            unreadCount: response.data.body.pagination?.unreadCount || 0,
          },
          message: response.data.header.message,
        };
      } else {
        return {
          success: false,
          message: response.data.header?.message || '알림 조회에 실패했습니다.',
        };
      }
    } catch (error) {
      console.error('알림 조회 API 오류:', error);
      return {
        success: false,
        message: error.response?.data?.header?.message || '알림 조회 중 오류가 발생했습니다.',
      };
    }
  },

  // 읽지 않은 알림 수 조회
  getUnreadCount: async () => {
    try {
      const response = await api.get('/api/notifications/unread-count');

      if (response.data.header?.status === 'SUCCESS') {
        return {
          success: true,
          data: response.data.body || 0,
        };
      } else {
        return {
          success: false,
          message: response.data.header?.message || '읽지 않은 알림 수 조회에 실패했습니다.',
        };
      }
    } catch (error) {
      console.error('읽지 않은 알림 수 조회 API 오류:', error);
      return {
        success: false,
        message:
          error.response?.data?.header?.message || '읽지 않은 알림 수 조회 중 오류가 발생했습니다.',
      };
    }
  },

  // 특정 알림 읽음 처리
  markAsRead: async (notificationId) => {
    try {
      console.log('📡 API 호출: 알림 읽음 처리', notificationId);

      const response = await api.put(`/api/notifications/${notificationId}/read`);

      console.log('📡 API 응답:', response.data);

      if (response.data.header?.status === 'SUCCESS') {
        return {
          success: true,
          data: response.data.body,
          message: response.data.header.message,
        };
      } else {
        return {
          success: false,
          message: response.data.header?.message || '알림 읽음 처리에 실패했습니다.',
        };
      }
    } catch (error) {
      console.error('알림 읽음 처리 API 오류:', error);
      return {
        success: false,
        message: error.response?.data?.header?.message || '알림 읽음 처리 중 오류가 발생했습니다.',
      };
    }
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    try {
      console.log('📡 API 호출: 모든 알림 읽음 처리');

      const response = await api.put('/api/notifications/read-all');

      console.log('📡 API 응답:', response.data);

      if (response.data.header?.status === 'SUCCESS') {
        return {
          success: true,
          message: response.data.header.message,
        };
      } else {
        return {
          success: false,
          message: response.data.header?.message || '모든 알림 읽음 처리에 실패했습니다.',
        };
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 API 오류:', error);
      return {
        success: false,
        message:
          error.response?.data?.header?.message || '모든 알림 읽음 처리 중 오류가 발생했습니다.',
      };
    }
  },

  // 알림 설정 조회
  getNotificationSettings: async () => {
    try {
      const response = await api.get('/api/notifications/settings');

      if (response.data.header?.status === 'SUCCESS') {
        return {
          success: true,
          data: response.data.body,
        };
      } else {
        return {
          success: false,
          message: response.data.header?.message || '알림 설정 조회에 실패했습니다.',
        };
      }
    } catch (error) {
      console.error('알림 설정 조회 API 오류:', error);
      return {
        success: false,
        message: error.response?.data?.header?.message || '알림 설정 조회 중 오류가 발생했습니다.',
      };
    }
  },

  // 알림 설정 업데이트
  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.put('/api/notifications/settings', settings);

      if (response.data.header?.status === 'SUCCESS') {
        return {
          success: true,
          message: response.data.header.message,
        };
      } else {
        return {
          success: false,
          message: response.data.header?.message || '알림 설정 업데이트에 실패했습니다.',
        };
      }
    } catch (error) {
      console.error('알림 설정 업데이트 API 오류:', error);
      return {
        success: false,
        message:
          error.response?.data?.header?.message || '알림 설정 업데이트 중 오류가 발생했습니다.',
      };
    }
  },
};
