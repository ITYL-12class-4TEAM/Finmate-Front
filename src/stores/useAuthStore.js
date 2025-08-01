import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/index';

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('accessToken') || null);
  const refreshToken = ref(localStorage.getItem('refreshToken') || null);
  const memberId = ref(localStorage.getItem('memberId') || null);
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value);
  const userInfo = computed(() => user.value);
  const userLevel = computed(() => user.value?.level || 0);
  const userBadges = computed(() => user.value?.badges || []);
  const userNickname = computed(() => user.value?.nickname || '');

  // 로그인 액션
  const login = async (email, password) => {
    isLoading.value = true;

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const data = response.data;

      // 성공 시 토큰과 사용자 정보 저장
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      memberId.value = data.memberId;

      user.value = data.userInfo;

      // localStorage에 저장
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('memberId', data.memberId);
      localStorage.setItem('user', JSON.stringify(data.userInfo));

      return { success: true, message: '로그인 성공' };
    } catch (error) {
      console.error('로그인 에러:', error);
      const message =
        error.response?.data?.message || '네트워크 오류가 발생했습니다.';
      return { success: false, message };
    } finally {
      isLoading.value = false;
    }
  };

  // 로그아웃 액션
  const logout = async () => {
    try {
      if (accessToken.value) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
    } finally {
      // 상태 초기화
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      memberId.value = null;

      // localStorage에서 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('memberId');
      localStorage.removeItem('user');
    }
  };

  // 토큰 새로고침
  const refreshAccessToken = async () => {
    if (!refreshToken.value) return false;

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value,
      });

      const newAccessToken = response.data.accessToken;
      accessToken.value = newAccessToken;
      localStorage.setItem('accessToken', newAccessToken);
      return true;
    } catch (error) {
      console.error('토큰 새로고침 에러:', error);
      await logout();
      return false;
    }
  };
  const refreshUser = async (retryCount = 0) => {
    if (!accessToken.value) return false;

    try {
      const response = await api.get('/member/me');
      const userData = response.data;
      user.value = userData;
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('사용자 정보 새로고침 에러:', error);

      // 401 에러이고 첫 번째 시도일 때만 refresh 시도
      if (error.response?.status === 401 && retryCount === 0) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return await refreshUser(1); // 한 번만 재시도
        }
      }

      // 실패하면 로그아웃
      await logout();
      return false;
    }
  };

  // 토큰 설정 (OAuth2 로그인용)
  const setTokens = (newAccessToken, newRefreshToken, newMemberId = null) => {
    console.log('=== setTokens 호출됨 ===');
    console.log('newAccessToken:', newAccessToken);
    console.log('newRefreshToken:', newRefreshToken);
    console.log('newMemberId:', newMemberId);

    // 상태 업데이트
    accessToken.value = newAccessToken;
    refreshToken.value = newRefreshToken;

    if (newMemberId) {
      memberId.value = newMemberId;
    }

    // localStorage에 저장
    localStorage.setItem('accessToken', newAccessToken);
    console.log('accessToken 저장됨:', newAccessToken);

    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
      console.log('refreshToken 저장됨:', newRefreshToken);
    }

    if (newMemberId) {
      localStorage.setItem('memberId', newMemberId);
      console.log('memberId 저장됨:', newMemberId);
    }

    console.log('=== localStorage 저장 완료 ===');
    console.log('저장된 데이터 확인:');
    console.log('- accessToken:', localStorage.getItem('accessToken'));
    console.log('- refreshToken:', localStorage.getItem('refreshToken'));
    console.log('- memberId:', localStorage.getItem('memberId'));
  };

  const initialize = async () => {
    const savedUser = localStorage.getItem('user');
    const savedAccessToken = localStorage.getItem('accessToken');

    if (savedUser && savedAccessToken) {
      try {
        user.value = JSON.parse(savedUser);
        accessToken.value = savedAccessToken;
        refreshToken.value = localStorage.getItem('refreshToken');
        memberId.value = localStorage.getItem('memberId');

        const isValid = await refreshUser(0);
        if (!isValid) {
          await logout();
        }
      } catch (error) {
        console.error('초기화 에러:', error);
        await logout();
      }
    } else {
      console.log('저장된 인증 정보 없음 - 로그인 필요');
    }
  };

  // 디버깅용
  const debugStorage = () => {
    console.log('=== Auth Store Debug ===');
    console.log('accessToken:', localStorage.getItem('accessToken'));
    console.log('refreshToken:', localStorage.getItem('refreshToken'));
    console.log('user:', localStorage.getItem('user'));
    console.log('isAuthenticated:', isAuthenticated.value);
    console.log('userInfo:', userInfo.value);
  };

  return {
    // 상태
    user,
    accessToken,
    refreshToken,
    memberId,
    isLoading,
    // Getters
    isAuthenticated,
    userInfo,
    userLevel,
    userBadges,
    userNickname,
    // 액션
    login,
    logout,
    refreshAccessToken,
    refreshUser,
    setTokens,
    initialize,
    debugStorage,
  };
});
