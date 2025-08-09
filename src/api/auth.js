import api from './index';

export const authAPI = {
  // 로그인
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const result = response.data;

      if (result.header?.status === 'OK' || result.accessToken) {
        return {
          success: true,
          message: '로그인 성공',
          data: result,
        };
      } else {
        return {
          success: false,
          message: result.header?.message || '로그인에 실패했습니다.',
          data: null,
        };
      }
    } catch (error) {
      console.error('로그인 API 오류:', error);

      let errorMessage = '로그인에 실패했습니다.';

      if (error.response?.data?.header?.message) {
        errorMessage = error.response.data.header.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout');
      return {
        success: true,
        message: '로그아웃 되었습니다.',
        data: response.data,
      };
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return {
        success: true,
        message: '로그아웃 되었습니다.',
        data: null,
      };
    }
  },

  // 아이디 찾기
  findId: async (name, phoneNumber) => {
    try {
      const response = await api.post('/api/auth/find-id', {
        name,
        phoneNumber,
      });

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
      console.error('아이디 찾기 API 오류:', error);

      let errorMessage = '입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.';

      if (error.response?.data?.header?.message) {
        errorMessage = error.response.data.header.message;
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // 비밀번호 찾기
  findPassword: async (name, phoneNumber) => {
    try {
      const response = await api.post('/api/auth/find-password', {
        name,
        phoneNumber,
      });

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
      console.error('비밀번호 찾기 API 오류:', error);

      let errorMessage = '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.';

      if (error.response?.data?.header?.message) {
        errorMessage = error.response.data.header.message;
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // 비밀번호 확인
  checkPassword: async (password) => {
    try {
      const response = await api.post('/api/auth/check-password', { password });
      return {
        success: true,
        message: '비밀번호 확인 성공',
        data: response.data,
      };
    } catch (error) {
      console.error('비밀번호 확인 API 오류:', error);
      return {
        success: false,
        message: '비밀번호 확인에 실패했습니다.',
        data: null,
      };
    }
  },

  // 비밀번호 재설정
  resetPassword: async (newPassword, newPasswordCheck, username) => {
    try {
      const response = await api.post('/api/auth/reset-password', {
        newPassword,
        newPasswordCheck,
        username,
      });

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
      console.error('비밀번호 재설정 API 오류:', error);

      let errorMessage = '비밀번호 변경에 실패했습니다.';

      if (error.response?.data?.header?.message) {
        errorMessage = error.response.data.header.message;
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // 회원가입
  signup: async (signupData) => {
    try {
      const response = await api.post('/api/signup', signupData);

      const result = response.data;
      if (result.header?.status === 'CREATED') {
        return {
          success: true,
          message: result.header.message || '회원가입이 완료되었습니다.',
          data: result.body?.data || null,
        };
      } else {
        return {
          success: false,
          message: result.header?.message || '회원가입에 실패했습니다.',
          data: null,
        };
      }
    } catch (error) {
      console.error('회원가입 API 오류:', error);

      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (error.response?.data?.header?.message) {
        errorMessage = error.response.data.header.message;
      } else if (error.response?.status === 409) {
        errorMessage = '이미 가입된 이메일입니다.';
      } else if (error.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  //소셜 회원가입
  socialSignup: async (signupData) => {
    try {
      const response = await api.post('/api/signup/social', signupData);

      const result = response.data;
      if (result.header?.status === 'CREATED') {
        return {
          success: true,
          message: result.header.message || '소셜 회원가입이 완료되었습니다.',
          data: result.body?.data || null,
        };
      } else {
        return {
          success: false,
          message: result.header?.message || '소셜 회원가입에 실패했습니다.',
          data: null,
        };
      }
    } catch (error) {
      console.error('소셜 회원가입 API 오류:', error);

      let errorMessage = '소셜 회원가입 중 오류가 발생했습니다.';
      if (error.response?.data?.header?.message) {
        errorMessage = error.response.data.header.message;
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // OAuth토큰 교환
  exchangeOAuth2Token: async (code) => {
    try {
      const response = await api.post('/api/auth/oauth2/token', null, {
        params: { code },
      });

      const result = response.data;
      if (result.header?.status === 'OK') {
        return {
          success: true,
          message: result.header.message || 'OAuth2 토큰 교환 성공',
          data: result.body?.data || result.data || null,
        };
      } else {
        return {
          success: false,
          message: result.header?.message || 'OAuth2 토큰 교환에 실패했습니다.',
          data: null,
        };
      }
    } catch (error) {
      console.error('OAuth2 토큰 교환 API 오류:', error);

      let errorMessage = 'OAuth2 토큰 교환 중 오류가 발생했습니다.';

      if (error.response?.data?.header?.message) {
        errorMessage = error.response.data.header.message;
      } else if (error.response?.status === 401) {
        errorMessage = '인증 코드가 유효하지 않습니다.';
      } else if (error.response?.status === 400) {
        errorMessage = '잘못된 요청입니다. 다시 로그인해주세요.';
      } else if (error.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },

  // 회원 탈퇴
  withdraw: async (withdrawData) => {
    try {
      const response = await api.delete('/api/auth/withdraw', {
        data: withdrawData,
      });

      const result = response.data;
      if (result.header?.status === 'OK') {
        return {
          success: true,
          message: result.header.message || '회원탈퇴가 완료되었습니다.',
          data: result.body?.data || null,
        };
      } else {
        return {
          success: false,
          message: result.header?.message || '회원탈퇴에 실패했습니다.',
          data: null,
        };
      }
    } catch (error) {
      console.error('회원탈퇴 API 오류:', error);

      let errorMessage = '회원탈퇴 중 오류가 발생했습니다.';

      if (error.response?.data?.header?.message) {
        errorMessage = error.response.data.header.message;
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (error.response?.status === 403) {
        errorMessage = '비밀번호가 일치하지 않습니다.';
      } else if (error.response?.status === 404) {
        errorMessage = '사용자를 찾을 수 없습니다.';
      } else if (error.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  },
};
