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
  const isNewMember = computed(() => user.value?.isNewMember === true);
  const needsAdditionalInfo = computed(() => isAuthenticated.value && isNewMember.value);

  // 사용자 정보 설정
  const setUser = (userInfo) => {
    user.value = userInfo;
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  };

  // 소셜 회원가입 완료 처리
  const completeSignup = () => {
    if (user.value) {
      user.value.isNewMember = false;
      localStorage.setItem('userInfo', JSON.stringify(user.value));
    }
  };

  // 추가정보 입력 페이지로 리다이렉트 필요 여부 체크
  const shouldRedirectToSignup = (to) => {
    if (!needsAdditionalInfo.value) return false;

    const allowedPaths = ['/login/signup', '/signup', '/auth/oauth2/redirect'];
    return !allowedPaths.includes(to.path);
  };

  // 로그인 액션
  const login = async (email, password) => {
    isLoading.value = true;

    try {
      const result = await authAPI.login(email, password);

      if (result.success) {
        const loginData = result.data;
        setTokens(loginData.accessToken, loginData.refreshToken);

        if (loginData.userInfo) {
          setUser(loginData.userInfo);
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
        if (result.success) {
          clearAuthData();
          return { success: true, message: result.message };
        } else {
          return { success: false, message: result.message };
        }
      }
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
        setUser(result.data);
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

    localStorage.clear();
  };

  const initialize = async () => {
    const savedUserInfo = localStorage.getItem('userInfo');
    const savedAccessToken = localStorage.getItem('accessToken');
    const savedRefreshToken = localStorage.getItem('refreshToken');

    try {
      if (savedUserInfo) {
        user.value = JSON.parse(savedUserInfo);
      }
      accessToken.value = savedAccessToken;
      refreshToken.value = savedRefreshToken;

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
    isNewMember,
    needsAdditionalInfo,

    // 액션
    login,
    logout,
    withdraw,
    refreshUser,
    setTokens,
    setUser,
    completeSignup,
    shouldRedirectToSignup,
    clearAuthData,
    initialize,
    hasValidTokens,
    shouldValidateTokenOnInit,
  };
});
