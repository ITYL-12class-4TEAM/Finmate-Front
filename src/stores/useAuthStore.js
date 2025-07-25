import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(null);
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 성공 시 토큰과 사용자 정보 저장
        accessToken.value = data.accessToken;
        refreshToken.value = data.refreshToken;
        user.value = data.userInfo;

        // localStorage에 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.userInfo));

        return { success: true, message: '로그인 성공' };
      } else {
        return { success: false, message: data.message || '로그인 실패' };
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      return { success: false, message: '네트워크 오류가 발생했습니다.' };
    } finally {
      isLoading.value = false;
    }
  };

  // 로그아웃 액션
  const logout = async () => {
    try {
      // 백엔드에 로그아웃 요청 (선택사항)
      if (accessToken.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('로그아웃 에러:', error);
    } finally {
      // 상태 초기화
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;

      // localStorage에서 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  // 토큰 새로고침
  const refreshAccessToken = async () => {
    if (!refreshToken.value) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken.value,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        accessToken.value = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      } else {
        // refresh token도 만료된 경우
        await logout();
        return false;
      }
    } catch (error) {
      console.error('토큰 새로고침 에러:', error);
      await logout();
      return false;
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    if (!accessToken.value) return false;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else if (response.status === 401) {
        // 토큰 만료 시 새로고침 시도
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return await refreshUser(); // 재귀 호출
        }
        return false;
      } else {
        return false;
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 에러:', error);
      return false;
    }
  };

  // 초기화 (앱 시작 시 실행)
  const initialize = async () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && accessToken.value) {
      try {
        user.value = JSON.parse(savedUser);
        // 토큰 유효성 검증
        await refreshUser();
      } catch (error) {
        console.error('초기화 에러:', error);
        await logout();
      }
    }
  };

  // 디버깅용 - localStorage 상태 확인
  const debugStorage = () => {
    console.log('=== localStorage 상태 ===');
    console.log('accessToken:', accessToken.value);
    console.log('refreshToken:', refreshToken.value);
    console.log('user:', user.value);
    console.log('isAuthenticated:', isAuthenticated.value);
    console.log('========================');
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
    refreshAccessToken,
    refreshUser,
    initialize,
    // 디버깅
    debugStorage,
  };
});
