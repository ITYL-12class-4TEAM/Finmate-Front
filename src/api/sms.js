import api from './index';

export const smsAPI = {
  sendVerification: async (phoneNumber) => {
    try {
      const response = await api.get(
        `/sms/send-verification?phoneNumber=${encodeURIComponent(phoneNumber)}`
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
        message: error.response?.data?.header?.message || '인증번호 발송에 실패했습니다.',
        data: null,
      };
    }
  },

  verifyCode: async (phoneNumber, code) => {
    try {
      const response = await api.post(
        `/sms/verify-code?phoneNumber=${encodeURIComponent(
          phoneNumber
        )}&code=${encodeURIComponent(code)}`
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
        message: error.response?.data?.header?.message || '인증번호가 일치하지 않습니다.',
        data: null,
      };
    }
  },
};
