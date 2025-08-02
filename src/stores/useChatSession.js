// composables/useChatSession.js
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

export function useChatSession(router, emit) {
  const authStore = useAuthStore();

  const sessionId = ref(null);
  let routerGuardRemover = null;

  // 라우터 가드 설정 - 페이지 이동 시 챗봇 자동 닫기
  const setupRouterGuard = () => {
    routerGuardRemover = router.beforeEach((to, from, next) => {
      console.log('🔄 페이지 이동 감지:', from.path, '->', to.path);

      endChatSession().finally(() => {
        emit('close');
        next();
      });
    });
  };

  const removeRouterGuard = () => {
    if (routerGuardRemover) {
      routerGuardRemover();
      routerGuardRemover = null;
      console.log('🗑️ 라우터 가드 제거됨');
    }
  };

  // 세션 생성
  const createChatSession = async () => {
    try {
      sessionId.value = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log('🚀 챗봇 세션 생성 시도:', sessionId.value);

      if (authStore.isAuthenticated) {
        const validToken = await authStore.getValidAccessToken();

        if (validToken) {
          await axios.post('/api/chatbot/session', null, {
            params: { sessionId: sessionId.value },
            headers: {
              Authorization: `Bearer ${validToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          });

          console.log('✅ 인증된 사용자 세션 생성 완료:', sessionId.value);
        } else {
          console.log('⚠️ 토큰 갱신 실패, 비회원 모드로 전환');
          sessionId.value = `guest_session_${Date.now()}`;
        }
      } else {
        console.log('✅ 비회원 로컬 세션 생성됨:', sessionId.value);
      }
    } catch (error) {
      console.error('❌ 세션 생성 실패:', error);
      sessionId.value = `fallback_session_${Date.now()}`;
      console.log('🔄 폴백 세션 생성됨:', sessionId.value);
    }
  };

  // 세션 종료
  const endChatSession = async () => {
    if (!sessionId.value) return;

    try {
      console.log('🔚 챗봇 세션 종료 시도:', sessionId.value);

      if (
        authStore.isAuthenticated &&
        !sessionId.value.startsWith('guest_') &&
        !sessionId.value.startsWith('fallback_')
      ) {
        const validToken = await authStore.getValidAccessToken();

        if (validToken) {
          await axios.delete('/api/chatbot/session', {
            params: { sessionId: sessionId.value },
            headers: {
              Authorization: `Bearer ${validToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          });

          console.log('✅ 서버 세션 종료 완료:', sessionId.value);
        }
      } else {
        console.log('✅ 로컬 세션 종료됨:', sessionId.value);
      }
    } catch (error) {
      console.error('❌ 세션 종료 실패:', error);
    } finally {
      sessionId.value = null;
    }
  };

  return {
    sessionId,
    createChatSession,
    endChatSession,
    setupRouterGuard,
    removeRouterGuard,
  };
}
