<template>
  <div class="chat-window-inner" @click.stop>
    <ChatHeader @close="handleClose" />

    <MessagesContainer
      ref="messagesContainer"
      :messages="messages"
      :isTyping="isTyping"
      :isAuthenticated="isAuthenticated()"
      @navigate-to-post="navigateToPost"
      @navigate-to-more="navigateToMore"
      @navigate-to-survey="navigateToSurvey"
    />

    <ServiceButtons
      v-if="showServiceButtons"
      class="service-buttons-overlay"
      :is-authenticated="isAuthenticated()"
      :available-services="getAvailableServices()"
      :member-only-features="memberOnlyFeatures"
      @service-action="handleServiceAction"
      @navigate-to-login="navigateToLogin"
    />

    <ChatInput
      :messages="messages"
      :inputMessage="inputMessage"
      :isTyping="isTyping"
      :showServiceMenu="showServiceMenu"
      :availableServices="getAvailableServices()"
      :memberOnlyFeatures="memberOnlyFeatures"
      :isAuthenticated="isAuthenticated()"
      @update:inputMessage="inputMessage = $event"
      @send-message="sendMessage"
      @toggle-service-menu="toggleServiceMenu"
      @service-action="handleServiceAction"
      @navigate-to-login="navigateToLogin"
      class="chat-input-fixed"
    />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

import ChatHeader from './ChatHeader.vue';
import MessagesContainer from './MessagesContainer.vue';
import ServiceButtons from './ServiceButtons.vue';
import ChatInput from './ChatInput.vue';

// Router 설정
const router = useRouter();

// Emits 정의
const emit = defineEmits(['close']);

// 라우터 가드 설정 - 페이지 이동 시 챗봇 자동 닫기
let routerGuardRemover = null;

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

// 토큰 관리 함수
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// 사용자 인증 상태 확인
const isAuthenticated = () => {
  return !!getAccessToken();
};

// axios 인터셉터 설정
const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      console.log('🔍 API 요청:', config.url);

      // 비회원 접근 가능한 API 목록
      const publicEndpoints = [
        '/api/posts/hot',
        '/api/chat/',
        '/api/chatbot/message',
        '/api/chatbot/session',
        '/api/auth/',
      ];

      const isPublicAPI = publicEndpoints.some((endpoint) =>
        config.url?.includes(endpoint)
      );

      if (!isPublicAPI) {
        // 인증이 필요한 API
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Authorization 헤더 추가됨');
        } else {
          console.log('❌ 토큰 없음 - 인증 필요한 API');
        }
      } else {
        console.log('💡 비회원 접근 가능한 API, 토큰 없이 요청');
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// 상태 관리
const messages = ref([]);
const inputMessage = ref('');
const isTyping = ref(false);
const messagesContainer = ref(null);
const showQuickReplies = ref(true);
const showServiceButtons = ref(true);
const sessionId = ref(null);
const sessionStatus = ref('idle'); // idle, creating, active, ending, error
const sessionRetryCount = ref(0);
const maxRetries = 3;
const showServiceMenu = ref(false);

const toggleServiceMenu = () => {
  showServiceMenu.value = !showServiceMenu.value;
  showQuickReplies.value = false;
};

// 서비스 기능 데이터
const serviceFeatures = reactive([
  // 비회원도 접근 가능한 기능들
  {
    id: 4,
    text: '어제 핫했던 게시물',
    icon: '🔥',
    action: 'hotPosts',
    apiUrl: '/api/posts/hot',
    requireAuth: false,
  },
  {
    id: 5,
    text: 'WMTI 성향 보기',
    icon: '🧭',
    action: 'wmtiTypes',
    apiUrl: null,
    requireAuth: false,
  },
  {
    id: 8,
    text: '설문조사 하러가기',
    icon: '📝',
    action: 'survey',
    apiUrl: null,
    requireAuth: false,
  },
  // 회원만 접근 가능한 기능들
  {
    id: 1,
    text: '내가 좋아요 한 글',
    icon: '❤️',
    action: 'myLikedPosts',
    apiUrl: '/api/post-like/me',
    requireAuth: true,
  },
  {
    id: 2,
    text: '내가 스크랩한 글',
    icon: '📌',
    action: 'myScrapPosts',
    apiUrl: '/api/scraps/my',
    requireAuth: true,
  },
  {
    id: 3,
    text: '내가 쓴 글',
    icon: '✍️',
    action: 'myPosts',
    apiUrl: '/api/posts/my',
    requireAuth: true,
  },
  {
    id: 12,
    text: '내가 쓴 댓글',
    icon: '💬',
    action: 'myComments',
    apiUrl: '/api/comments/my',
    requireAuth: true,
  },
  {
    id: 6,
    text: '관심상품',
    icon: '⭐',
    action: 'interestProducts',
    apiUrl: null,
    requireAuth: true,
  },
  {
    id: 7,
    text: '최근 본 상품',
    icon: '👀',
    action: 'recentProducts',
    apiUrl: null,
    requireAuth: true,
  },
]);

// 비회원에게 보여줄 서비스 기능 필터링
const getAvailableServices = () => {
  if (isAuthenticated()) {
    return serviceFeatures;
  } else {
    return serviceFeatures.filter((service) => !service.requireAuth);
  }
};

// 회원 전용 기능들 (로그인 안내용)
const memberOnlyFeatures = computed(() => {
  return serviceFeatures.filter((service) => service.requireAuth);
});

// 메시지 ID 생성
let messageIdCounter = 0;
const generateMessageId = () => ++messageIdCounter;

// 메시지 추가
const addMessage = (
  text,
  type = 'user',
  contentType = 'text',
  data = null,
  title = '',
  moreUrl = ''
) => {
  const newMessage = {
    id: generateMessageId(),
    text,
    type,
    contentType,
    data,
    title,
    moreUrl,
    timestamp: Date.now(),
  };

  messages.value.push(newMessage);

  nextTick(() => {
    scrollToBottom();
  });
};

const createChatSession = async () => {
  if (sessionStatus.value === 'creating' || sessionStatus.value === 'active') {
    console.log('🔄 세션이 이미 생성 중이거나 활성 상태');
    return sessionId.value;
  }

  sessionStatus.value = 'creating';
  console.log('🚀 챗봇 세션 생성 시도 시작');

  try {
    // 기본 세션 ID 생성
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log('📝 새 세션 ID 생성:', newSessionId);

    // 서버에 세션 등록 시도 (인증 여부와 상관없이)
    console.log('🔐 서버 세션 생성 요청 (비회원/회원 공통)');

    const requestConfig = {
      method: 'POST',
      url: '/api/chatbot/session',
      params: {
        sessionId: newSessionId,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // 500 이상의 상태코드만 에러로 처리
      },
    };

    // 인증된 사용자인 경우에만 토큰 추가
    if (isAuthenticated()) {
      const token = getAccessToken();
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
        console.log('✅ 인증된 사용자 - Authorization 헤더 추가');
      }
    } else {
      console.log('👤 비인증 사용자 - 토큰 없이 세션 생성 요청');
    }

    const response = await axios(requestConfig);

    console.log('📨 서버 세션 생성 응답:', {
      status: response.status,
      data: response.data,
    });

    // 응답 상태 확인
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;

      // 응답 데이터 구조 확인
      if (
        responseData?.header?.status === 'OK' ||
        responseData?.status === 'success' ||
        responseData?.success === true
      ) {
        sessionId.value = newSessionId;
        sessionStatus.value = 'active';
        sessionRetryCount.value = 0;

        console.log('✅ 서버 세션 생성 성공:', sessionId.value);
        return sessionId.value;
      } else {
        // 서버에서 실패 응답을 받은 경우 로컬 세션으로 폴백
        const errorMessage =
          responseData?.header?.message ||
          responseData?.message ||
          '서버 세션 생성 실패';
        console.warn(
          '⚠️ 서버 세션 생성 실패, 로컬 세션으로 폴백:',
          errorMessage
        );
        return await createLocalSession(newSessionId);
      }
    } else if (response.status === 401 || response.status === 403) {
      // 인증 실패 - 로컬 세션으로 폴백
      console.warn('🔓 인증 실패 - 로컬 세션으로 전환');
      return await createLocalSession(newSessionId);
    } else {
      console.warn('⚠️ 서버 응답 오류, 로컬 세션으로 폴백:', response.status);
      return await createLocalSession(newSessionId);
    }
  } catch (error) {
    console.error('❌ 세션 생성 실패:', error);
    sessionStatus.value = 'error';

    // 재시도 로직
    if (sessionRetryCount.value < maxRetries) {
      sessionRetryCount.value++;
      console.log(
        `🔄 세션 생성 재시도 (${sessionRetryCount.value}/${maxRetries})`
      );

      // 1초 대기 후 재시도
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await createChatSession();
    } else {
      // 최대 재시도 횟수 초과 - 폴백 세션 생성
      console.warn('⚠️ 최대 재시도 횟수 초과 - 폴백 세션 생성');
      const fallbackSessionId = `fallback_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 6)}`;
      return await createLocalSession(fallbackSessionId);
    }
  }
};

const createLocalSession = async (sessionIdToUse) => {
  try {
    const localSessionId =
      sessionIdToUse ||
      `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    sessionId.value = localSessionId;
    sessionStatus.value = 'active';
    sessionRetryCount.value = 0;

    console.log('✅ 로컬 세션 생성 완료:', sessionId.value);
    return sessionId.value;
  } catch (error) {
    console.error('❌ 로컬 세션 생성 실패:', error);
    sessionStatus.value = 'error';
    throw error;
  }
};
const endChatSession = async () => {
  if (!sessionId.value || sessionStatus.value === 'ending') {
    console.log('🔍 종료할 세션이 없거나 이미 종료 중');
    return;
  }

  const currentSessionId = sessionId.value;
  sessionStatus.value = 'ending';

  console.log('🔚 챗봇 세션 종료 시작:', currentSessionId);

  try {
    // 서버 세션인 경우에만 서버에 종료 요청
    const isServerSession =
      isAuthenticated() &&
      !currentSessionId.startsWith('local_') &&
      !currentSessionId.startsWith('fallback_') &&
      !currentSessionId.startsWith('guest_');

    if (isServerSession) {
      const token = getAccessToken();

      if (token) {
        console.log('🔐 서버 세션 종료 요청');

        const requestConfig = {
          method: 'DELETE',
          url: '/api/chatbot/session',
          params: {
            sessionId: currentSessionId,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
          validateStatus: function (status) {
            return status < 500; // 500 이상만 에러로 처리
          },
        };

        try {
          const response = await axios(requestConfig);

          if (response.status === 200 || response.status === 204) {
            console.log('✅ 서버 세션 종료 성공');
          } else {
            console.warn(`⚠️ 서버 세션 종료 응답: ${response.status}`);
          }
        } catch (deleteError) {
          console.warn(
            '⚠️ 서버 세션 종료 요청 실패 (무시):',
            deleteError.message
          );
          // 세션 종료 실패는 치명적이지 않으므로 무시
        }
      }
    } else {
      console.log('✅ 로컬 세션 종료');
    }
  } catch (error) {
    console.warn('⚠️ 세션 종료 중 오류 (무시):', error);
  } finally {
    // 항상 로컬 상태 정리
    sessionId.value = null;
    sessionStatus.value = 'idle';
    sessionRetryCount.value = 0;
    console.log('🧹 세션 상태 정리 완료');
  }
};

const isSessionReady = () => {
  return sessionStatus.value === 'active' && sessionId.value !== null;
};

// 세션 대기 함수
const waitForSession = async (maxWaitTime = 10000) => {
  const startTime = Date.now();

  while (!isSessionReady() && Date.now() - startTime < maxWaitTime) {
    if (sessionStatus.value === 'error') {
      throw new Error('세션 생성 실패');
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (!isSessionReady()) {
    throw new Error('세션 생성 시간 초과');
  }

  return sessionId.value;
};

// 닫기 핸들러
const handleClose = async () => {
  console.log('🔒 챗봇 수동 닫기');
  await endChatSession();
  removeRouterGuard();
  emit('close');
};

// 유틸리티 함수들
const scrollToBottom = () => {
  const container = messagesContainer.value?.messagesContainer;
  if (container) {
    container.scrollTop = container.scrollHeight;
    console.log('스크롤 아래로 이동함');
  }
};

// 네비게이션 함수들
const navigateToLogin = () => {
  console.log('🔑 로그인 페이지로 이동');
  removeRouterGuard();
  emit('close');
  router.push('/login').then(() => {
    window.location.reload();
  });
};

const navigateToPost = (postId) => {
  console.log('📝 게시물로 이동:', postId);
  removeRouterGuard();
  emit('close');
  router.push(`/community/${postId}`).then(() => {
    window.location.reload();
  });
};

const navigateToMore = (url) => {
  if (url) {
    console.log('➡️ 더보기 페이지로 이동:', url);
    removeRouterGuard();
    emit('close');
    router.push(url).then(() => {
      window.location.reload();
    });
  }
};

const navigateToSurvey = () => {
  console.log('📝 설문조사 페이지로 이동');
  removeRouterGuard();
  emit('close');
  router.push('/wmti/basic').then(() => {
    window.location.reload();
  });
};

// API 관련 함수들
const fetchApiData = async (apiUrl) => {
  try {
    console.log('🚀 API 호출 시작:', apiUrl);

    // 비회원 접근 가능한 API 목록
    const publicEndpoints = [
      '/api/posts/hot',
      '/api/chat/',
      '/api/chatbot/message',
      '/api/chatbot/session',
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      apiUrl.includes(endpoint)
    );

    // 비회원 접근 불가능한 API인데 인증되지 않은 경우
    if (!isPublicEndpoint && !isAuthenticated()) {
      console.log('❌ 인증 필요한 API인데 토큰 없음');
      return 'LOGIN_REQUIRED';
    }

    const 요청설정 = {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    // 인증이 필요한 API인 경우에만 토큰 추가
    if (!isPublicEndpoint && isAuthenticated()) {
      const token = getAccessToken();
      if (token) {
        요청설정.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization 헤더 추가됨 (인증 필요 API)');
      }
    } else if (isPublicEndpoint) {
      console.log('💡 비회원 접근 가능한 API, 토큰 없이 요청');
    }

    const response = await axios.get(apiUrl, 요청설정);
    console.log('✅ API 응답 성공:', response.status);

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
  } catch (error) {
    console.error('❌ API 요청 실패:', error.response?.status);

    if (error.response) {
      const 상태코드 = error.response.status;
      switch (상태코드) {
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
    } else if (error.request) {
      return 'NETWORK_ERROR';
    } else {
      return 'UNKNOWN_ERROR';
    }
  }
};

// WMTI 성향 데이터 (필요시 실제 데이터로 교체)
const wmtiTypes = [];

// 서비스 액션 핸들러
const handleServiceAction = async (service) => {
  showServiceButtons.value = false;
  showQuickReplies.value = false;
  showServiceMenu.value = false;

  addMessage(service.text, 'user');
  isTyping.value = true;

  try {
    // 회원 전용 기능 체크
    if (service.requireAuth && !isAuthenticated()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '🔐 로그인이 필요한 기능입니다. 로그인 후 이용해주세요!',
        'bot'
      );
      return;
    }

    if (service.action === 'wmtiTypes') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      isTyping.value = false;
      addMessage('', 'bot', 'wmti', wmtiTypes, 'WMTI 투자 성향 유형');
      return;
    }

    if (service.action === 'survey') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '당신의 투자 성향을 알아보세요! 간단한 질문을 통해 맞춤형 투자 가이드를 제공해드립니다.',
        'bot',
        'survey'
      );
      return;
    }

    if (service.apiUrl) {
      try {
        const 데이터 = await fetchApiData(service.apiUrl);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isTyping.value = false;

        switch (데이터) {
          case 'LOGIN_REQUIRED':
            addMessage(
              '🔐 로그인이 필요한 기능입니다. 로그인 후 이용해주세요!',
              'bot'
            );
            return;
          case 'PERMISSION_DENIED':
            addMessage(
              '🚫 해당 기능에 접근할 권한이 없습니다. 관리자에게 문의해주세요.',
              'bot'
            );
            return;
          case 'NOT_FOUND':
            addMessage('❓ 요청하신 데이터를 찾을 수 없습니다.', 'bot');
            return;
          case 'SERVER_ERROR':
            addMessage(
              '🔧 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
              'bot'
            );
            return;
          case 'NETWORK_ERROR':
            addMessage('🌐 네트워크 연결을 확인해주세요.', 'bot');
            return;
          case 'UNKNOWN_ERROR':
          case 'API_ERROR':
            addMessage(
              '⚠️ 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
              'bot'
            );
            return;
        }

        if (Array.isArray(데이터) && 데이터.length > 0) {
          let 제목, 더보기URL;

          switch (service.action) {
            case 'hotPosts':
              제목 = '🔥 어제 핫했던 게시물';
              더보기URL = '/posts?filter=hot';
              break;
            case 'myLikedPosts':
              제목 = '❤️ 내가 좋아요 한 글';
              더보기URL = '/mypage/liked';
              break;
            case 'myScrapPosts':
              제목 = '📌 내가 스크랩한 글';
              더보기URL = '/mypage/scraps';
              break;
            case 'myPosts':
              제목 = '✍️ 내가 쓴 글';
              더보기URL = '/mypage/posts';
              break;
            case 'myComments':
              제목 = '💬 내가 쓴 댓글';
              더보기URL = '/mypage/comments';
              addMessage('', 'bot', 'comments', 데이터, 제목, 더보기URL);
              return;
          }

          if (service.action !== 'myComments') {
            addMessage('', 'bot', 'posts', 데이터, 제목, 더보기URL);
          }
        } else {
          let 빈데이터메시지;
          switch (service.action) {
            case 'hotPosts':
              빈데이터메시지 = '🔥 아직 인기 게시물이 없습니다.';
              break;
            case 'myLikedPosts':
              빈데이터메시지 = '❤️ 아직 좋아요 한 글이 없습니다.';
              break;
            case 'myScrapPosts':
              빈데이터메시지 = '📌 아직 스크랩한 글이 없습니다.';
              break;
            case 'myPosts':
              빈데이터메시지 = '✍️ 아직 작성한 글이 없습니다.';
              break;
            case 'myComments':
              빈데이터메시지 = '💬 아직 작성한 댓글이 없습니다.';
              break;
            default:
              빈데이터메시지 = '📝 해당하는 데이터가 없습니다.';
          }
          addMessage(빈데이터메시지, 'bot');
        }
      } catch (apiError) {
        isTyping.value = false;
        console.error('API 호출 중 에러:', apiError);
        addMessage(
          '⚠️ 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          'bot'
        );
      }
    }
  } catch (error) {
    isTyping.value = false;
    console.error('서비스 액션 처리 중 오류:', error);
    addMessage(
      '⚠️ 요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      'bot'
    );
  }
};

// ChatGPT 메시지 전송
const sendMessageToGPT = async (message) => {
  try {
    console.log('🤖 ChatGPT API 요청 시작:', message);

    // 세션이 준비되지 않았으면 생성하고 대기
    if (!isSessionReady()) {
      console.log('📝 세션이 준비되지 않음 - 세션 생성 시작');
      await createChatSession();
      await waitForSession(); // 세션이 준비될 때까지 대기
    }

    const currentSessionId = sessionId.value;
    console.log('📤 사용 중인 세션 ID:', currentSessionId);

    const requestParams = {
      sessionId: currentSessionId,
      userMessage: message,
    };

    const requestConfig = {
      method: 'POST',
      url: '/api/chatbot/message',
      params: requestParams,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500;
      },
    };

    // 인증된 사용자인 경우에만 토큰 추가 (비회원은 토큰 없이 요청)
    if (isAuthenticated()) {
      const token = getAccessToken();
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
        console.log('✅ 인증된 사용자 - Authorization 헤더 추가');
      }
    } else {
      console.log('👤 비인증 사용자 - 토큰 없이 ChatGPT API 요청');
    }

    const response = await axios(requestConfig);

    console.log('📨 ChatGPT API 응답:', {
      status: response.status,
      sessionId: currentSessionId,
    });

    // 응답 처리
    if (response.status === 200) {
      const responseData = response.data;

      if (responseData?.header?.status === 'OK') {
        let botResponse = responseData.body?.data || responseData.body;

        // 문자열 응답 처리
        if (typeof botResponse === 'string') {
          try {
            const parsed = JSON.parse(botResponse);
            botResponse =
              typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
          } catch {
            // JSON 파싱 실패시 원본 사용
          }
        } else if (typeof botResponse === 'object') {
          botResponse =
            botResponse.message ||
            botResponse.content ||
            JSON.stringify(botResponse);
        }

        return botResponse || '응답을 받았지만 내용이 없습니다.';
      } else {
        const errorMessage =
          responseData?.header?.message || '알 수 없는 오류가 발생했습니다.';
        return `죄송합니다. ${errorMessage}`;
      }
    } else {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ ChatGPT API 호출 실패:', error);

    // 세션 관련 오류인 경우 세션 재생성 시도
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔄 인증 오류 - 세션 재생성 시도');
      sessionId.value = null;
      sessionStatus.value = 'idle';

      try {
        await createChatSession();
        // 재귀 호출로 메시지 재전송 (최대 1회)
        if (sessionRetryCount.value === 0) {
          sessionRetryCount.value = 1;
          return await sendMessageToGPT(message);
        }
      } catch (retryError) {
        console.error('세션 재생성 실패:', retryError);
      }
    }

    // 에러 메시지 반환
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          return '요청 형식이 올바르지 않습니다. 다시 시도해주세요.';
        case 401:
          return '인증에 문제가 있습니다. 일부 기능은 로그인이 필요할 수 있습니다.';
        case 403:
          return '접근 권한이 없습니다. 일부 기능은 로그인이 필요할 수 있습니다.';
        case 429:
          return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        case 500:
          return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return `서버 오류가 발생했습니다. (${status})`;
      }
    } else if (error.request) {
      return '네트워크 연결을 확인해주세요.';
    } else {
      return '요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  }
};

// API 요청 함수들
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

// 메시지 전송
const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message || isTyping.value) return;

  addMessage(message, 'user');
  inputMessage.value = '';
  showQuickReplies.value = false;
  showServiceButtons.value = false;

  isTyping.value = true;

  try {
    // 금융 키워드 체크
    const financeKeywords = [
      '비교',
      '요약',
      '상품',
      '계좌',
      'ISA',
      'IRP',
      '적금',
      '예금',
      'ETF',
      '펀드',
    ];
    const isFinanceQuery = financeKeywords.some((keyword) =>
      message.includes(keyword)
    );

    if (isFinanceQuery) {
      if (message.includes('비교')) {
        const result = await requestProductCompare([message]);
        isTyping.value = false;
        addMessage('', 'bot', 'finance', null, '💰 금융상품 비교 결과', '');
        addMessage(result, 'bot');
        return;
      }

      if (message.includes('요약')) {
        const result = await requestProductSummary(message);
        isTyping.value = false;
        addMessage('', 'bot', 'finance', null, '📊 금융상품 요약', '');
        addMessage(result, 'bot');
        return;
      }
    }

    // ChatGPT 메시지 전송
    const botResponse = await sendMessageToGPT(message);

    // 응답 대기 시간 추가
    await new Promise((resolve) => setTimeout(resolve, 500));

    isTyping.value = false;

    // 빈 응답 체크
    if (!botResponse || botResponse.trim() === '') {
      addMessage(
        '죄송합니다. 응답을 생성하지 못했습니다. 다시 시도해주세요.',
        'bot'
      );
    } else {
      addMessage(botResponse, 'bot');
    }
  } catch (error) {
    console.error('❌ 메시지 전송 실패:', error);
    isTyping.value = false;
    addMessage(
      '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
      'bot'
    );
  }
};

// ChatGPT 연결 확인
const checkChatGPTConnection = async () => {
  try {
    console.log('🔍 ChatGPT 연결 확인 중...');

    // 간단한 테스트 메시지로 연결 확인
    const testResponse = await sendMessageToGPT('연결 테스트');

    if (testResponse && testResponse.trim() !== '') {
      console.log('✅ ChatGPT 연결 확인됨');
      return true;
    } else {
      console.warn('⚠️ ChatGPT 응답이 비어있음');
      return false;
    }
  } catch (error) {
    console.error('❌ ChatGPT 연결 실패:', error);
    return false;
  }
};

onMounted(async () => {
  console.log('🚀 ChatWindow 마운트됨');
  setupAxiosInterceptors();
  setupRouterGuard();

  try {
    await createChatSession();
    const id = await waitForSession();
    console.log('✅ 초기 세션 생성 완료:', id);
  } catch (error) {
    console.error('❌ 초기 세션 생성 실패:', error);
  }
});

onUnmounted(async () => {
  console.log('🔄 ChatWindow 언마운트됨');
  await endChatSession();
  removeRouterGuard();
});

defineExpose({
  sessionId,
  sessionStatus,
  isSessionReady,
  createChatSession,
  endChatSession,
  sendMessageToGPT,
});
</script>

<style scoped>
.chat-window-inner {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  max-width: 30rem;
  overflow: hidden;
}

.service-buttons-overlay {
  position: relative;
  z-index: 10;
}

.chat-input-fixed {
  position: sticky;
  bottom: 0;
  z-index: 20;
}
</style>
