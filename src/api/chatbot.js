import api from './index.js';

/**
 * 챗봇 세션 관리 API
 */
export const sessionAPI = {
  /**
   * 챗봇 세션 생성
   * @param {string} sessionId - 세션 ID
   * @returns {Promise<Object>} 세션 생성 결과
   */
  async createSession(sessionId) {
    const response = await api.post('/api/chatbot/session', null, {
      params: { sessionId },
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });
    return response;
  },

  /**
   * 챗봇 세션 종료
   * @param {string} sessionId - 종료할 세션 ID
   * @returns {Promise<Object>} 세션 종료 결과
   */
  async endSession(sessionId) {
    const response = await api.delete('/api/chatbot/session', {
      params: { sessionId },
      timeout: 5000,
      validateStatus: (status) => status < 500,
    });
    return response;
  },
};

/**
 * 챗봇 메시지 API
 */
export const messageAPI = {
  /**
   * ChatGPT에 메시지 전송
   * @param {string} sessionId - 세션 ID
   * @param {string} userMessage - 사용자 메시지
   * @returns {Promise<Object>} ChatGPT 응답
   */
  async sendMessage(sessionId, userMessage) {
    const response = await api.post('/api/chatbot/message', null, {
      params: {
        sessionId,
        userMessage,
      },
      timeout: 30000,
      validateStatus: (status) => status < 500,
    });
    return response;
  },
};

/**
 * 사용자 데이터 API
 */
export const userDataAPI = {
  /**
   * 내가 좋아요 한 글 조회
   * @returns {Promise<Array>} 좋아요 한 글 목록
   */
  async getMyLikedPosts() {
    const response = await api.get('/api/post-like/me', {
      timeout: 15000,
    });
    return this.extractData(response);
  },

  /**
   * 내가 스크랩한 글 조회
   * @returns {Promise<Array>} 스크랩한 글 목록
   */
  async getMyScrapPosts() {
    const response = await api.get('/api/scraps/my', {
      timeout: 15000,
    });
    return this.extractData(response);
  },

  /**
   * 내가 쓴 글 조회
   * @returns {Promise<Array>} 내가 쓴 글 목록
   */
  async getMyPosts() {
    const response = await api.get('/api/posts/my', {
      timeout: 15000,
    });
    return this.extractData(response);
  },

  /**
   * 내가 쓴 댓글 조회
   * @returns {Promise<Array>} 내가 쓴 댓글 목록
   */
  async getMyComments() {
    const response = await api.get('/api/comments/my', {
      timeout: 15000,
    });
    return this.extractData(response);
  },

  /**
   * API 응답에서 데이터 추출
   * @param {Object} response - Axios 응답 객체
   * @returns {Array} 추출된 데이터 배열
   */
  extractData(response) {
    if (!response || !response.data) {
      return [];
    }

    let data = response.data;

    // 일반적인 API 응답 구조 처리
    if (response.data.header && response.data.body) {
      data = response.data.body.data || response.data.body;
    } else if (data.data) {
      data = data.data;
    } else if (data.content) {
      data = data.content;
    } else if (data.result) {
      data = data.result;
    } else if (data.items) {
      data = data.items;
    }

    // 페이지네이션 응답 처리
    if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
      if (data.content && Array.isArray(data.content)) {
        data = data.content;
      } else if (data.items && Array.isArray(data.items)) {
        data = data.items;
      } else {
        data = [data];
      }
    }

    return data || [];
  },
};

/**
 * 공개 데이터 API (인증 불필요)
 */
export const publicDataAPI = {
  /**
   * 어제 핫했던 게시물 조회
   * @returns {Promise<Array>} 핫 게시물 목록
   */
  async getHotPosts() {
    const response = await api.get('/api/posts/hot', {
      timeout: 15000,
    });
    return userDataAPI.extractData(response);
  },
};

/**
 * API 오류 처리 유틸리티
 */
export const apiErrorHandler = {
  /**
   * API 오류를 사용자 친화적 메시지로 변환
   * @param {Error} error - 에러 객체
   * @returns {string} 오류 타입 또는 메시지
   */
  handleError(error) {
    if (!error.response) {
      if (error.request) {
        return 'NETWORK_ERROR';
      }
      return 'UNKNOWN_ERROR';
    }

    const status = error.response.status;
    switch (status) {
      case 401:
      case 403:
        return 'LOGIN_REQUIRED';
      case 404:
        return 'NOT_FOUND';
      case 500:
        return 'SERVER_ERROR';
      default:
        return 'API_ERROR';
    }
  },

  /**
   * 오류 타입에 따른 사용자 메시지 반환
   * @param {string} errorType - 오류 타입
   * @returns {string} 사용자에게 표시할 메시지
   */
  getErrorMessage(errorType) {
    const errorMessages = {
      LOGIN_REQUIRED: '🔐 로그인이 필요한 기능입니다. 로그인 후 이용해주세요!',
      PERMISSION_DENIED: '🚫 해당 기능에 접근할 권한이 없습니다. 관리자에게 문의해주세요.',
      NOT_FOUND: '❓ 요청하신 데이터를 찾을 수 없습니다.',
      SERVER_ERROR: '🔧 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      NETWORK_ERROR: '🌐 네트워크 연결을 확인해주세요.',
      API_ERROR: '⚠️ 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      UNKNOWN_ERROR: '⚠️ 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };

    return errorMessages[errorType] || errorMessages.UNKNOWN_ERROR;
  },
};

/**
 * 통합 챗봇 API 서비스 객체
 */
export const chatbotAPI = {
  session: sessionAPI,
  message: messageAPI,
  userData: userDataAPI,
  publicData: publicDataAPI,
  errorHandler: apiErrorHandler,
};
