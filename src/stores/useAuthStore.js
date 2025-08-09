import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '@/api/auth';
import { memberAPI } from '@/api/member';

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(JSON.parse(localStorage.getItem('userInfo')) || null);
  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value);
  const userInfo = computed(() => user.value);

  // 로그인 액션
  const login = async (email, password) => {
    isLoading.value = true;

    try {
      const result = await authAPI.login(email, password);

      if (result.success) {
        const loginData = result.data;
        setTokens(loginData.accessToken, loginData.refreshToken);

        if (loginData.userInfo) {
          user.value = loginData.userInfo;
          localStorage.setItem('userInfo', JSON.stringify(loginData.userInfo));
        }

        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: '네트워크 연결을 확인해주세요.' };
    } finally {
      isLoading.value = false;
    }
  };

  // 로그아웃 액션
  const logout = async () => {
    try {
      if (accessToken.value) {
        const result = await authAPI.logout();
      }
    } catch (error) {
    } finally {
      clearAuthData();
    }
  };

  // 회원탈퇴 액션
  const withdraw = async (withdrawData) => {
    try {
      isLoading.value = true;

      const result = await authAPI.withdraw(withdrawData);

      if (result.success) {
        clearAuthData();

        return {
          success: true,
          message: result.message,
        };
      } else {
        return {
          success: false,
          message: result.message,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '회원탈퇴 처리 중 오류가 발생했습니다.',
      };
    } finally {
      isLoading.value = false;
    }
  };

  const refreshUser = async () => {
    if (!accessToken.value) {
      return false;
    }
    try {
      const result = await memberAPI.getMyInfo();

      if (result.success) {
        user.value = result.data;
        localStorage.setItem('userInfo', JSON.stringify(result.data));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // 토큰 설정
  const setTokens = (newAccessToken, newRefreshToken) => {
    if (newAccessToken) {
      accessToken.value = newAccessToken;
      localStorage.setItem('accessToken', newAccessToken);
    }

    if (newRefreshToken) {
      refreshToken.value = newRefreshToken;
      localStorage.setItem('refreshToken', newRefreshToken);
    }
  };

  // 인증 데이터 초기화
  const clearAuthData = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
  };

  const initialize = async () => {
    const savedUserInfo = localStorage.getItem('userInfo');
    const savedAccessToken = localStorage.getItem('accessToken');

    if (!savedUserInfo || !savedAccessToken) {
      return;
    }

    try {
      user.value = JSON.parse(savedUserInfo);
      accessToken.value = savedAccessToken;
      refreshToken.value = localStorage.getItem('refreshToken');

      const shouldValidateToken = false;

      if (shouldValidateToken) {
        const isValid = await refreshUser();

        if (!isValid) {
          clearAuthData();
        }
      }
    } catch (error) {
      clearAuthData();
    }
  };

  const hasValidTokens = () => {
    return !!(accessToken.value && refreshToken.value);
  };
  const shouldValidateTokenOnInit = async () => {
    const currentPath = window.location.pathname;

    // 공개 페이지(추가 예정)
    const publicPages = ['/', '/login', '/register', '/about'];

    if (publicPages.includes(currentPath)) {
      return false;
    }

    return true;
  };

  return {
    // 상태
    user,
    accessToken,
    refreshToken,
    isLoading,

    // Getters
    isAuthenticated,
    userInfo,

    // 액션
    login,
    logout,
    withdraw,
    refreshUser,
    setTokens,
    clearAuthData,
    initialize,
    hasValidTokens,
    shouldValidateTokenOnInit,
  };
});
