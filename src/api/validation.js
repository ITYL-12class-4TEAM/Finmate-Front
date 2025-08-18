import api from './index';

export const validationAPI = {
  checkEmail: async (email) => {
    try {
      const response = await api.get(`/validation/check/email?email=${encodeURIComponent(email)}`);

      const result = response.data;
      if (result.header.status === 'OK') {
        return {
          success: true,
          message: result.header.message,
          data: result.body?.data || null,
        };
      } else {
        return {
          success: false,
          message: result.header.message,
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.header?.message || '이메일 중복 확인 중 오류가 발생했습니다.',
        data: null,
      };
    }
  },

  checkNickname: async (nickname) => {
    try {
      const response = await api.get(
        `/validation/check/nickname?nickname=${encodeURIComponent(nickname)}`
      );

      const result = response.data;
      if (result.header.status === 'OK') {
        return {
          success: true,
          message: result.header.message,
          data: result.body?.data || null,
        };
      } else {
        return {
          success: false,
          message: result.header.message,
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.header?.message || '닉네임 중복 확인 중 오류가 발생했습니다.',
        data: null,
      };
    }
  },
};
