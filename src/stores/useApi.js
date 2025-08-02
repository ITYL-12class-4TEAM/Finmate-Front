// composables/useApi.js
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

export function useApi() {
  const authStore = useAuthStore();

  // ChatGPT API 호출
  const sendMessageToGPT = async (message, sessionId) => {
    try {
      console.log('🤖 ChatGPT API 요청 시작:', message);

      const requestParams = {
        sessionId: sessionId,
        userMessage: message,
      };

      const requestConfig = {
        timeout: 30000,
        params: requestParams,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // 인증된 사용자인 경우에만 토큰 추가
      if (authStore.isAuthenticated) {
        const validToken = await authStore.getValidAccessToken();
        if (validToken) {
          requestConfig.headers.Authorization = `Bearer ${validToken}`;
        }
      }

      const response = await axios.post(
        '/api/chatbot/message',
        null,
        requestConfig
      );

      let botResponse = '';
      if (response.data?.header?.status === 'OK') {
        const responseData = response.data.body?.data || response.data.body;
        if (typeof responseData === 'string') {
          try {
            const parsed = JSON.parse(responseData);
            botResponse = typeof parsed === 'string' ? parsed : responseData;
          } catch {
            botResponse = responseData;
          }
        } else {
          botResponse = responseData || '응답을 받았지만 내용이 없습니다.';
        }
      } else {
        const errorMessage =
          response.data?.header?.message || '알 수 없는 오류가 발생했습니다.';
        botResponse = `죄송합니다. ${errorMessage}`;
      }

      return botResponse;
    } catch (error) {
      console.error('❌ ChatGPT API 호출 실패:', error);

      if (error.response) {
        const status = error.response.status;
        const errorMessages = {
          400: '요청 형식이 올바르지 않습니다. 다시 시도해주세요.',
          401: '일시적인 인증 문제가 발생했습니다. 다시 시도해주세요.',
          403: '접근 권한이 없습니다.',
          429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          500: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        };

        return errorMessages[status] || '서버 오류가 발생했습니다.';
      } else if (error.request) {
        return '네트워크 연결을 확인해주세요.';
      } else {
        return '요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
      }
    }
  };

  // 상품 비교 API
  const requestProductCompare = async (products) => {
    try {
      const response = await axios.post('/api/chat/compare', {
        products: products,
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('상품 비교 API 호출 실패:', error);
      return '상품 비교 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  };

  // 상품 요약 API
  const requestProductSummary = async (productName) => {
    try {
      const response = await axios.post('/api/chat/summary', {
        productName: productName,
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('상품 요약 API 호출 실패:', error);
      return '상품 요약 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  };

  // 일반 API 데이터 가져오기
  const fetchApiData = async (apiUrl) => {
    try {
      console.log('🚀 API 호출 시작:', apiUrl);

      const isAuthRequiredEndpoint =
        !apiUrl.includes('/api/posts/hot') && !apiUrl.includes('/api/chat/');

      if (isAuthRequiredEndpoint) {
        if (!authStore.isAuthenticated) {
          console.log('❌ 인증이 필요한 API, 로그인 필요');
          return 'LOGIN_REQUIRED';
        }

        const validToken = await authStore.getValidAccessToken();
        if (!validToken) {
          console.log('❌ 토큰 갱신 실패');
          return 'LOGIN_REQUIRED';
        }
      }

      const 요청설정 = {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };

      if (isAuthRequiredEndpoint && authStore.isAuthenticated) {
        const validToken = await authStore.getValidAccessToken();
        if (validToken) {
          요청설정.headers.Authorization = `Bearer ${validToken}`;
        }
      }

      let response;
      try {
        response = await axios.get(apiUrl, 요청설정);
        console.log('✅ API 응답 성공:', response.status);
      } catch (error) {
        console.error('❌ API 요청 실패:', error.response?.status);
        return handleApiError(error, isAuthRequiredEndpoint, apiUrl, 요청설정);
      }

      return processApiResponse(response);
    } catch (error) {
      console.error('❌ fetchApiData 전체 에러:', error);
      return 'UNKNOWN_ERROR';
    }
  };

  // API 에러 처리
  const handleApiError = async (error, isAuthRequired, apiUrl, config) => {
    if (error.response) {
      const 상태코드 = error.response.status;

      switch (상태코드) {
        case 401:
          if (isAuthRequired && authStore.isAuthenticated) {
            console.log('🔄 401 에러 - 토큰 재갱신 시도');
            const newToken = await authStore.getValidAccessToken();
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
              try {
                const response = await axios.get(apiUrl, config);
                console.log('✅ 토큰 재갱신 후 API 성공');
                return processApiResponse(response);
              } catch (retryError) {
                console.error('❌ 토큰 재갱신 후에도 실패');
                return 'LOGIN_REQUIRED';
              }
            } else {
              return 'LOGIN_REQUIRED';
            }
          } else {
            return 'LOGIN_REQUIRED';
          }
        case 403:
          return 'PERMISSION_DENIED';
        case 404:
          return 'NOT_FOUND';
        case 500:
          return 'SERVER_ERROR';
        default:
          return 'API_ERROR';
      }
    } else if (error.request) {
      return 'NETWORK_ERROR';
    } else {
      return 'UNKNOWN_ERROR';
    }
  };

  // API 응답 처리
  const processApiResponse = (response) => {
    if (response && response.data) {
      let 데이터 = response.data;

      if (response.data.header && response.data.body) {
        데이터 = response.data.body.data || response.data.body;
      } else if (데이터.data) {
        데이터 = 데이터.data;
      } else if (데이터.content) {
        데이터 = 데이터.content;
      } else if (데이터.result) {
        데이터 = 데이터.result;
      } else if (데이터.items) {
        데이터 = 데이터.items;
      }

      if (
        !Array.isArray(데이터) &&
        typeof 데이터 === 'object' &&
        데이터 !== null
      ) {
        if (데이터.content && Array.isArray(데이터.content)) {
          데이터 = 데이터.content;
        } else if (데이터.items && Array.isArray(데이터.items)) {
          데이터 = 데이터.items;
        } else {
          데이터 = [데이터];
        }
      }

      return 데이터 || [];
    }

    return [];
  };

  return {
    sendMessageToGPT,
    requestProductCompare,
    requestProductSummary,
    fetchApiData,
  };
}
