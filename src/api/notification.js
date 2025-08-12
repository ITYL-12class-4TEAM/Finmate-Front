import api from './index';

// 공통 응답 처리 함수
const handleResponse = (response, defaultErrorMessage) => {
  if (response.data.header?.status === 'OK') {
    return {
      success: true,
      data: response.data.body,
      message: response.data.header.message,
    };
  } else {
    return {
      success: false,
      message: response.data.header?.message || defaultErrorMessage,
    };
  }
};

// 공통 에러 처리 함수
const handleError = (error, defaultErrorMessage) => {
  console.error('API 오류:', error);
  return {
    success: false,
    message: error.response?.data?.header?.message || defaultErrorMessage,
  };
};

export const notificationAPI = {
  // 알림 목록 조회
  getNotifications: async () => {
    try {
      const response = await api.get('/api/notifications');

      if (response.data.header?.status === 'OK') {
        return {
          success: true,
          data: {
            notifications: response.data.body.notifications || [],
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
      return handleError(error, '알림 조회 중 오류가 발생했습니다.');
    }
  },

  // 읽지 않은 알림 수 조회
  getUnreadCount: async () => {
    try {
      const response = await api.get('/api/notifications/unread-count');
      return handleResponse(response, '읽지 않은 알림 수 조회에 실패했습니다.');
    } catch (error) {
      return handleError(error, '읽지 않은 알림 수 조회 중 오류가 발생했습니다.');
    }
  },

  // 특정 알림 읽음 처리
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return handleResponse(response, '알림 읽음 처리에 실패했습니다.');
    } catch (error) {
      return handleError(error, '알림 읽음 처리 중 오류가 발생했습니다.');
    }
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    try {
      const response = await api.put('/api/notifications/read-all');
      return handleResponse(response, '모든 알림 읽음 처리에 실패했습니다.');
    } catch (error) {
      return handleError(error, '모든 알림 읽음 처리 중 오류가 발생했습니다.');
    }
  },

  // 알림 설정 조회
  getNotificationSettings: async () => {
    try {
      const response = await api.get('/api/notifications/settings');
      return handleResponse(response, '알림 설정 조회에 실패했습니다.');
    } catch (error) {
      return handleError(error, '알림 설정 조회 중 오류가 발생했습니다.');
    }
  },

  // 알림 설정 업데이트
  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.put('/api/notifications/settings', settings);
      return handleResponse(response, '알림 설정 업데이트에 실패했습니다.');
    } catch (error) {
      return handleError(error, '알림 설정 업데이트 중 오류가 발생했습니다.');
    }
  },
};
