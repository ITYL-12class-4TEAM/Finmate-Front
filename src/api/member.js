import api from './index';

export const memberAPI = {
  // 사용자 정보 조회
  getMyInfo: async () => {
    try {
      const response = await api.get('/api/member/me');
      const result = response.data;

      return {
        success: result.header?.status === 'OK',
        message: result.header?.message || '처리 완료',
        data: result.body?.data || null,
      };
    } catch (error) {
      const statusMessages = {
        401: '로그인이 필요합니다.',
        403: '접근 권한이 없습니다.',
        404: '사용자 정보를 찾을 수 없습니다.',
        500: '서버 오류가 발생했습니다.',
      };

      return {
        success: false,
        message: statusMessages[error.response?.status] || '네트워크 오류가 발생했습니다.',
        data: null,
      };
    }
  },

  // 프로필 수정 API (수정된 버전)
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    const result = response.data;

    return {
      success: result.header?.status === 'OK',
      message: result.header?.message || '처리 완료',
      data: result.body?.data || null,
    };
  },

  // 닉네임 중복 확인
  checkNickname: async (nickname) => {
    const response = await api.get(`/validation/check/nickname`, {
      params: { nickname },
    });
    const result = response.data;

    return {
      success: result.header?.status === 'OK',
      message: result.header?.message || '처리 완료',
      data: result.body?.data || null,
    };
  },
};
