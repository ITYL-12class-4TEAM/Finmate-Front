<template>
  <div class="chat-window-inner" @click.stop>
    <ChatHeader @close="handleClose" />

    <MessagesContainer
      ref="messagesContainer"
      :messages="messages"
      :is-typing="isTyping"
      :is-authenticated="isAuthenticated()"
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
      :input-message="inputMessage"
      :is-typing="isTyping"
      :show-service-menu="showServiceMenu"
      :available-services="getAvailableServices()"
      :member-only-features="memberOnlyFeatures"
      :is-authenticated="isAuthenticated()"
      class="chat-input-fixed"
      @update:input-message="inputMessage = $event"
      @send-message="sendMessage"
      @toggle-service-menu="toggleServiceMenu"
      @service-action="handleServiceAction"
      @navigate-to-login="navigateToLogin"
    />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';

import ChatHeader from './ChatHeader.vue';
import MessagesContainer from './MessagesContainer.vue';
import ServiceButtons from './ServiceButtons.vue';
import ChatInput from './ChatInput.vue';

// ✅ API 모듈 import
import { chatbotAPI } from '@/api/chatbot.js';

// Router 설정
const router = useRouter();

// Emits 정의
const emit = defineEmits(['close']);

let routerGuardRemover = null;

const setupRouterGuard = () => {
  if (routerGuardRemover) return; // 이미 등록되어 있으면 중복 등록 방지

  routerGuardRemover = router.beforeEach((to, from, next) => {
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

// 상태 관리
const messages = ref([]);
const inputMessage = ref('');
const isTyping = ref(false);
const messagesContainer = ref(null);
const showQuickReplies = ref(true);
const showServiceButtons = ref(true);
const sessionId = ref(null);
const sessionStatus = ref('idle');
const sessionRetryCount = ref(0);
const maxRetries = 3;
const showServiceMenu = ref(false);

const toggleServiceMenu = () => {
  showServiceMenu.value = !showServiceMenu.value;
  showQuickReplies.value = false;
};

// 서비스 기능 데이터 (Font Awesome 아이콘으로 업데이트됨)
const serviceFeatures = reactive([
  // 비회원도 접근 가능한 기능들
  {
    id: 4,
    text: '어제 핫했던 게시물',
    icon: '<i class="fas fa-fire" style="color: #ff6b35;"></i>',
    action: 'hotPosts',
    apiMethod: 'getHotPosts',
    requireAuth: false,
  },
  {
    id: 5,
    text: 'WMTI 성향 보기',
    icon: '<i class="fas fa-compass" style="color: #4a90e2;"></i>',
    action: 'wmtiTypes',
    apiMethod: null,
    requireAuth: false,
  },
  {
    id: 8,
    text: '설문조사 하러가기',
    icon: '<i class="fas fa-clipboard-list" style="color: #28a745;"></i>',
    action: 'survey',
    apiMethod: null,
    requireAuth: false,
  },
  // 회원만 접근 가능한 기능들
  {
    id: 1,
    text: '내가 좋아요 한 글',
    icon: '<i class="fas fa-heart" style="color: #e91e63;"></i>',
    action: 'myLikedPosts',
    apiMethod: 'getMyLikedPosts',
    requireAuth: true,
  },
  {
    id: 2,
    text: '내가 스크랩한 글',
    icon: '<i class="fas fa-bookmark" style="color: #9c27b0;"></i>',
    action: 'myScrapPosts',
    apiMethod: 'getMyScrapPosts',
    requireAuth: true,
  },
  {
    id: 3,
    text: '내가 쓴 글',
    icon: '<i class="fas fa-pen-fancy" style="color: #ff9800;"></i>',
    action: 'myPosts',
    apiMethod: 'getMyPosts',
    requireAuth: true,
  },
  {
    id: 12,
    text: '내가 쓴 댓글',
    icon: '<i class="fas fa-comments" style="color: #00bcd4;"></i>',
    action: 'myComments',
    apiMethod: 'getMyComments',
    requireAuth: true,
  },
  {
    id: 6,
    text: '관심상품',
    icon: '<i class="fas fa-star" style="color: #ffc107;"></i>',
    action: 'wishlistProducts',
    apiMethod: 'getWishlistProducts',
    requireAuth: true,
  },
  {
    id: 7,
    text: '최근 본 상품',
    icon: '<i class="fas fa-eye" style="color: #607d8b;"></i>',
    action: 'recentProducts',
    apiMethod: 'getRecentViewedProducts',
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
  subtitle = '',
  moreUrl = ''
) => {
  const newMessage = {
    id: generateMessageId(),
    text,
    type,
    contentType,
    data,
    title,
    subtitle,
    moreUrl,
    timestamp: Date.now(),
  };

  messages.value.push(newMessage);

  nextTick(() => {
    scrollToBottom();
  });
};

// ✅ 챗봇 세션 생성 (API 모듈 사용)
const createChatSession = async () => {
  if (sessionStatus.value === 'creating' || sessionStatus.value === 'active') {
    return sessionId.value;
  }

  sessionStatus.value = 'creating';

  try {
    // 기본 세션 ID 생성
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const response = await chatbotAPI.session.createSession(newSessionId);
    if (response.status === 200 || response.status === 201) {
      const responseData = response.data;

      if (
        responseData?.header?.status === 'OK' ||
        responseData?.status === 'success' ||
        responseData?.success === true
      ) {
        sessionId.value = newSessionId;
        sessionStatus.value = 'active';
        sessionRetryCount.value = 0;
        return sessionId.value;
      } else {
        const errorMessage =
          responseData?.header?.message || responseData?.message || '서버 세션 생성 실패';
        return await createLocalSession(newSessionId);
      }
    } else if (response.status === 401 || response.status === 403) {
      return await createLocalSession(newSessionId);
    } else {
      return await createLocalSession(newSessionId);
    }
  } catch (error) {
    sessionStatus.value = 'error';

    if (sessionRetryCount.value < maxRetries) {
      sessionRetryCount.value++;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await createChatSession();
    } else {
      const fallbackSessionId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      return await createLocalSession(fallbackSessionId);
    }
  }
};

const createLocalSession = async (sessionIdToUse) => {
  try {
    const localSessionId =
      sessionIdToUse || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    sessionId.value = localSessionId;
    sessionStatus.value = 'active';
    sessionRetryCount.value = 0;

    return sessionId.value;
  } catch (error) {
    sessionStatus.value = 'error';
    throw error;
  }
};

// ✅ 챗봇 세션 종료 (API 모듈 사용)
const endChatSession = async () => {
  if (!sessionId.value || sessionStatus.value === 'ending') {
    return;
  }

  const currentSessionId = sessionId.value;
  sessionStatus.value = 'ending';

  try {
    const isServerSession =
      isAuthenticated() &&
      !currentSessionId.startsWith('local_') &&
      !currentSessionId.startsWith('fallback_') &&
      !currentSessionId.startsWith('guest_');

    if (isServerSession) {
      try {
        const response = await chatbotAPI.session.endSession(currentSessionId);

        if (response.status === 200 || response.status === 204) {
          console.log('✅ 서버 세션 종료 성공');
        } else {
          console.warn(`⚠️ 서버 세션 종료 응답: ${response.status}`);
        }
      } catch (deleteError) {
        console.warn('⚠️ 서버 세션 종료 요청 실패 (무시):', deleteError.message);
        // 세션 종료 실패는 치명적이지 않으므로 무시
      }
    } else {
      console.log('✅ 로컬 세션 종료');
    }
  } catch (error) {
    console.warn('⚠️ 세션 종료 중 오류 (무시):', error);
  } finally {
    sessionId.value = null;
    sessionStatus.value = 'idle';
    sessionRetryCount.value = 0;
  }
};

const isSessionReady = () => {
  return sessionStatus.value === 'active' && sessionId.value !== null;
};

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

// 핸들러들
const handleClose = async () => {
  await endChatSession();
  removeRouterGuard();
  emit('close');
};

const scrollToBottom = () => {
  const container = messagesContainer.value?.messagesContainer;
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

// 네비게이션 함수들
const navigateToLogin = () => {
  removeRouterGuard();
  emit('close');
  router.push('/login').then(() => {
    window.location.reload();
  });
};

const navigateToPost = async (postId) => {
  await endChatSession();
  removeRouterGuard();
  emit('close');
  router.push(`/community/${postId}`).then(() => {
    window.location.reload();
  });
};

const navigateToMore = (url) => {
  if (!url || typeof url !== 'string') {
    console.warn(
      '유효하지 않은 URL:',
      url
    );
    return;
  }

  removeRouterGuard();
  emit('close');
  router
    .push(url)
    .then(() => {
      window.location.reload();
    })
    .catch((err) => {
      console.error(
        'router.push 에러:',
        err
      );
    });
};

const navigateToSurvey = () => {
  removeRouterGuard();
  emit('close');
  router.push('/wmti/basic').then(() => {
    window.location.reload();
  });
};

// ✅ API 데이터 호출 (API 모듈 사용)
const fetchServiceData = async (service) => {
  try {
    if (service.requireAuth && !isAuthenticated()) {
      return 'LOGIN_REQUIRED';
    }

    if (!service.apiMethod) {
      return null;
    }

    let data;

    switch (service.action) {
      case 'hotPosts':
        data = await chatbotAPI.publicData.getHotPosts();
        break;
      case 'myLikedPosts':
        data = await chatbotAPI.userData.getMyLikedPosts();
        break;
      case 'myScrapPosts':
        data = await chatbotAPI.userData.getMyScrapPosts();
        break;
      case 'myPosts':
        data = await chatbotAPI.userData.getMyPosts();
        break;
      case 'myComments':
        data = await chatbotAPI.userData.getMyComments();
        break;
      case 'wishlistProducts':
        data = await chatbotAPI.userData.getWishlistProducts();
        break;
      case 'recentProducts':
        data = await chatbotAPI.userData.getRecentViewedProducts();
        break;
      default:
        console.warn(
          '<i class="fas fa-question-circle" style="color: #6c757d;"></i> 정의되지 않은 서비스 액션:',
          service.action
        );
        return null;
    }
    return data || [];
  } catch (error) {
    console.error(
      '<i class="fas fa-times-circle" style="color: #dc3545;"></i> 서비스 데이터 호출 실패:',
      error
    );
    const errorType = chatbotAPI.errorHandler.handleError(error);
    return errorType;
  }
};

// WMTI 성향 데이터
const wmtiTypes = [];

// ✅ 서비스 액션 핸들러 (업데이트됨)
const handleServiceAction = async (service) => {
  showServiceButtons.value = false;
  showQuickReplies.value = false;
  showServiceMenu.value = false;

  addMessage(service.text, 'user');
  isTyping.value = true;

  try {
    if (service.requireAuth && !isAuthenticated()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      const loginMessage = chatbotAPI.errorHandler.getErrorMessage('LOGIN_REQUIRED');
      addMessage(loginMessage, 'bot');
      return;
    }

    // 특별 케이스 처리
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
        '<i class="fas fa-poll" style="color: #28a745;"></i> 당신의 투자 성향을 알아보세요! 간단한 질문을 통해 맞춤형 투자 가이드를 제공해드립니다.',
        'bot',
        'survey'
      );
      return;
    }

    // API 메서드가 있는 서비스들 처리
    if (service.apiMethod) {
      try {
        const 데이터 = await fetchServiceData(service);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isTyping.value = false;

        // 에러 타입별 처리
        if (typeof 데이터 === 'string') {
          const errorMessage = chatbotAPI.errorHandler.getErrorMessage(데이터);
          addMessage(errorMessage, 'bot');
          return;
        }

        // 정상 데이터 처리
        if (Array.isArray(데이터) && 데이터.length > 0) {
          let 제목, 부제목, 더보기URL, 컨텐츠타입;

          switch (service.action) {
            case 'hotPosts':
              제목 = '<i class="fas fa-fire" style="color: #ff6b35;"></i> 어제 핫했던 게시물';
              부제목 =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 최신 인기 게시물 확인하기';
              더보기URL = '/posts?filter=hot';
              컨텐츠타입 = 'posts';
              break;
            case 'myLikedPosts':
              제목 = '<i class="fas fa-heart" style="color: #e91e63;"></i> 내가 좋아요 한 글';
              부제목 =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 내 취향을 담은 게시물 모아보기';
              더보기URL = '/mypage/my-liked';
              컨텐츠타입 = 'posts';
              break;
            case 'myScrapPosts':
              제목 = '<i class="fas fa-bookmark" style="color: #9c27b0;"></i> 내가 스크랩한 글';
              부제목 =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 나중에 다시 보고 싶은 글들';
              더보기URL = '/mypage/my-scrap';
              컨텐츠타입 = 'posts';
              break;
            case 'myPosts':
              제목 = '<i class="fas fa-pen-fancy" style="color: #ff9800;"></i> 내가 쓴 글';
              부제목 =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 내가 남긴 이야기 한눈에 보기';
              더보기URL = '/mypage/my-posts';
              컨텐츠타입 = 'posts';
              break;
            case 'myComments':
              제목 = '<i class="fas fa-comments" style="color: #00bcd4;"></i> 내가 쓴 댓글';
              부제목 =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 어디에 어떤 말을 남겼을까?';
              더보기URL = '/mypage/my-comments';
              컨텐츠타입 = 'comments';
              break;
            case 'wishlistProducts':
              제목 = '<i class="fas fa-star" style="color: #ffc107;"></i> 관심상품';
              부제목 =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 찜해둔 상품 다시 확인해보기';
              더보기URL = '/mypage';
              컨텐츠타입 = 'wishlist';
              break;
            case 'recentProducts':
              제목 = '<i class="fas fa-eye" style="color: #607d8b;"></i> 최근 본 상품';
              부제목 =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 최근에 둘러본 상품 한눈에 보기';
              더보기URL = '/mypage/recent-view';
              컨텐츠타입 = 'recent';
              break;
          }

          addMessage('', 'bot', 컨텐츠타입, 데이터, 제목, 부제목, 더보기URL);
        } else {
          // 빈 데이터 처리
          let 빈데이터메시지;
          switch (service.action) {
            case 'hotPosts':
              빈데이터메시지 =
                '<i class="fas fa-fire" style="color: #ff6b35;"></i> 아직 인기 게시물이 없습니다.';
              break;
            case 'myLikedPosts':
              빈데이터메시지 =
                '<i class="fas fa-heart" style="color: #e91e63;"></i> 아직 좋아요 한 글이 없습니다.';
              break;
            case 'myScrapPosts':
              빈데이터메시지 =
                '<i class="fas fa-bookmark" style="color: #9c27b0;"></i> 아직 스크랩한 글이 없습니다.';
              break;
            case 'myPosts':
              빈데이터메시지 =
                '<i class="fas fa-pen-fancy" style="color: #ff9800;"></i> 아직 작성한 글이 없습니다.';
              break;
            case 'myComments':
              빈데이터메시지 =
                '<i class="fas fa-comments" style="color: #00bcd4;"></i> 아직 작성한 댓글이 없습니다.';
              break;
            case 'interestProducts':
              빈데이터메시지 =
                '<i class="fas fa-star" style="color: #ffc107;"></i> 아직 관심상품이 없습니다.';
              break;
            case 'recentProducts':
              빈데이터메시지 =
                '<i class="fas fa-eye" style="color: #607d8b;"></i> 아직 최근 본 상품이 없습니다.';
              break;
            default:
              빈데이터메시지 =
                '<i class="fas fa-exclamation-circle" style="color: #6c757d;"></i> 해당하는 데이터가 없습니다.';
          }
          addMessage(빈데이터메시지, 'bot');
        }
      } catch (apiError) {
        isTyping.value = false;
        console.error('API 호출 중 에러:', apiError);
        const errorMessage = chatbotAPI.errorHandler.getErrorMessage('API_ERROR');
        addMessage(errorMessage, 'bot');
      }
    }
  } catch (error) {
    isTyping.value = false;
    console.error('서비스 액션 처리 중 오류:', error);
    const errorMessage = chatbotAPI.errorHandler.getErrorMessage('UNKNOWN_ERROR');
    addMessage(errorMessage, 'bot');
  }
};

// ✅ ChatGPT 메시지 전송 (API 모듈 사용)
const sendMessageToGPT = async (message) => {
  try {
    if (!isSessionReady()) {
      await createChatSession();
      await waitForSession();
    }

    const currentSessionId = sessionId.value;

    // ✅ API 모듈을 사용한 메시지 전송
    const response = await chatbotAPI.message.sendMessage(currentSessionId, message);

    if (response.status === 200) {
      const responseData = response.data;

      if (responseData?.header?.status === 'OK') {
        let botResponse = responseData.body?.data || responseData.body;

        if (typeof botResponse === 'string') {
          try {
            const parsed = JSON.parse(botResponse);
            botResponse = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
          } catch {
            // JSON 파싱 실패시 원본 사용
          }
        } else if (typeof botResponse === 'object') {
          botResponse = botResponse.message || botResponse.content || JSON.stringify(botResponse);
        }

        return botResponse || '응답을 받았지만 내용이 없습니다.';
      } else {
        const errorMessage = responseData?.header?.message || '알 수 없는 오류가 발생했습니다.';
        return `죄송합니다. ${errorMessage}`;
      }
    } else {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ ChatGPT API 호출 실패:', error);

    // 세션 관련 오류인 경우 세션 재생성 시도
    if (error.response?.status === 401 || error.response?.status === 403) {
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

    const errorType = chatbotAPI.errorHandler.handleError(error);
    const errorMessage = chatbotAPI.errorHandler.getErrorMessage(errorType);
    return errorMessage;
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
    const isFinanceQuery = financeKeywords.some((keyword) => message.includes(keyword));

    if (isFinanceQuery) {
      if (message.includes('비교')) {
        // 금융상품 비교 기능 (추후 구현)
        isTyping.value = false;
        addMessage(
          '<i class="fas fa-chart-line" style="color: #17a2b8;"></i> 금융상품 비교 기능은 준비 중입니다.',
          'bot'
        );
        return;
      }

      if (message.includes('요약')) {
        // 금융상품 요약 기능 (추후 구현)
        isTyping.value = false;
        addMessage(
          '<i class="fas fa-file-alt" style="color: #6f42c1;"></i> 금융상품 요약 기능은 준비 중입니다.',
          'bot'
        );
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
      addMessage('죄송합니다. 응답을 생성하지 못했습니다. 다시 시도해주세요.', 'bot');
    } else {
      addMessage(botResponse, 'bot');
    }
  } catch (error) {
    console.error('❌ 메시지 전송 실패:', error);
    isTyping.value = false;
    const errorMessage = chatbotAPI.errorHandler.getErrorMessage('UNKNOWN_ERROR');
    addMessage(errorMessage, 'bot');
  }
};

// 컴포넌트 마운트 및 언마운트
onMounted(async () => {
  setupRouterGuard();

  try {
    await createChatSession();
    const id = await waitForSession();
  } catch (error) {
    console.error(
      '초기 세션 생성 실패:',
      error
    );
  }
});

onUnmounted(async () => {
  await endChatSession();
  removeRouterGuard();
});

// 컴포넌트 expose
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

/* Font Awesome 아이콘 애니메이션 효과 */
.fas {
  transition: all 0.3s ease;
  margin-right: 8px;
}

.fas:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
}

/* 각 서비스별 호버 효과 */
.service-item:hover .fa-fire {
  animation: flicker 0.5s ease-in-out infinite alternate;
}

.service-item:hover .fa-heart {
  animation: heartbeat 1s ease-in-out infinite;
}

.service-item:hover .fa-star {
  animation: twinkle 0.8s ease-in-out infinite;
}

.service-item:hover .fa-compass {
  animation: spin 2s linear infinite;
}

@keyframes flicker {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
