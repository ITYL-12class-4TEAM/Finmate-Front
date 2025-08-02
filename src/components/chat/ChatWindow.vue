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

// 세션 관리
const createChatSession = async () => {
  try {
    sessionId.value = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log('🚀 챗봇 세션 생성 시도:', sessionId.value);

    if (isAuthenticated()) {
      const token = getAccessToken();
      if (token) {
        await axios.post('/api/chatbot/session', null, {
          params: { sessionId: sessionId.value },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });
        console.log('✅ 인증된 사용자 세션 생성 완료:', sessionId.value);
      } else {
        console.log('⚠️ 토큰 없음, 비회원 모드로 전환');
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

const endChatSession = async () => {
  if (!sessionId.value) return;

  try {
    console.log('🔚 챗봇 세션 종료 시도:', sessionId.value);

    if (
      isAuthenticated() &&
      !sessionId.value.startsWith('guest_') &&
      !sessionId.value.startsWith('fallback_')
    ) {
      const token = getAccessToken();
      if (token) {
        await axios.delete('/api/chatbot/session', {
          params: { sessionId: sessionId.value },
          headers: {
            Authorization: `Bearer ${token}`,
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

    if (!sessionId.value) {
      await createChatSession();
    }

    const requestParams = {
      sessionId: sessionId.value,
      userMessage: message,
    };

    const requestConfig = {
      timeout: 30000,
      params: requestParams,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (isAuthenticated()) {
      const token = getAccessToken();
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
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
      switch (status) {
        case 400:
          return '요청 형식이 올바르지 않습니다. 다시 시도해주세요.';
        case 401:
          return '일시적인 인증 문제가 발생했습니다. 다시 시도해주세요.';
        case 403:
          return '접근 권한이 없습니다.';
        case 429:
          return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        case 500:
          return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        default:
          return '서버 오류가 발생했습니다.';
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

    const botResponse = await sendMessageToGPT(message);
    await new Promise((resolve) => setTimeout(resolve, 500));
    isTyping.value = false;
    addMessage(botResponse, 'bot');
  } catch (error) {
    console.error('❌ 메시지 전송 실패:', error);
    isTyping.value = false;
    addMessage(
      '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
      'bot'
    );
  }
};

// 빠른 답변 전송
const sendQuickReply = async (reply) => {
  addMessage(reply.text, 'user');
  showQuickReplies.value = false;
  showServiceButtons.value = false;

  isTyping.value = true;

  try {
    const botResponse = await sendMessageToGPT(reply.text);
    await new Promise((resolve) => setTimeout(resolve, 800));
    isTyping.value = false;
    addMessage(botResponse, 'bot');
  } catch (error) {
    console.error('❌ 빠른 답변 처리 실패:', error);
    isTyping.value = false;
    addMessage(reply.response, 'bot');
  }
};

// ChatGPT 연결 확인
const checkChatGPTConnection = async () => {
  try {
    await sendMessageToGPT('안녕하세요');
    console.log('✅ ChatGPT 연결 확인됨');
    return true;
  } catch (error) {
    console.error('❌ ChatGPT 연결 실패:', error);
    return false;
  }
};

// 컴포넌트 라이프사이클
onMounted(async () => {
  console.log('🚀 ChatWindow 마운트됨');
  setupAxiosInterceptors();
  setupRouterGuard();
  await createChatSession();

  const isConnected = await checkChatGPTConnection();
  if (!isConnected) {
    console.warn('⚠️ ChatGPT 연결 실패 - 기본 응답으로 동작');
  }
});

onUnmounted(async () => {
  console.log('🔄 ChatWindow 언마운트됨');
  await endChatSession();
  removeRouterGuard();
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
