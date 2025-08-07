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

// 서비스 기능 데이터 (업데이트됨)
const serviceFeatures = reactive([
  // 비회원도 접근 가능한 기능들
  {
    id: 4,
    text: '어제 핫했던 게시물',
    icon: '🔥',
    action: 'hotPosts',
    apiMethod: 'getHotPosts',
    requireAuth: false,
  },
  {
    id: 5,
    text: 'WMTI 성향 보기',
    icon: '🧭',
    action: 'wmtiTypes',
    apiMethod: null,
    requireAuth: false,
  },
  {
    id: 8,
    text: '설문조사 하러가기',
    icon: '📝',
    action: 'survey',
    apiMethod: null,
    requireAuth: false,
  },
  // 회원만 접근 가능한 기능들
  {
    id: 1,
    text: '내가 좋아요 한 글',
    icon: '❤️',
    action: 'myLikedPosts',
    apiMethod: 'getMyLikedPosts',
    requireAuth: true,
  },
  {
    id: 2,
    text: '내가 스크랩한 글',
    icon: '📌',
    action: 'myScrapPosts',
    apiMethod: 'getMyScrapPosts',
    requireAuth: true,
  },
  {
    id: 3,
    text: '내가 쓴 글',
    icon: '✍️',
    action: 'myPosts',
    apiMethod: 'getMyPosts',
    requireAuth: true,
  },
  {
    id: 12,
    text: '내가 쓴 댓글',
    icon: '💬',
    action: 'myComments',
    apiMethod: 'getMyComments',
    requireAuth: true,
  },
  {
    id: 6,
    text: '관심상품',
    icon: '⭐',
    action: 'interestProducts',
    apiMethod: 'getWishlistProducts',
    requireAuth: true,
  },
  {
    id: 7,
    text: '최근 본 상품',
    icon: '👀',
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

// ✅ 챗봇 세션 생성 (API 모듈 사용)
const createChatSession = async () => {
  if (sessionStatus.value === 'creating' || sessionStatus.value === 'active') {
    console.log('🔄 세션이 이미 생성 중이거나 활성 상태');
    return sessionId.value;
  }

  sessionStatus.value = 'creating';
  console.log('🚀 챗봇 세션 생성 시도 시작');

  try {
    // 기본 세션 ID 생성
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('📝 새 세션 ID 생성:', newSessionId);

    const response = await chatbotAPI.session.createSession(newSessionId);

    console.log('📨 서버 세션 생성 응답:', {
      status: response.status,
      data: response.data,
    });

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

        console.log('✅ 서버 세션 생성 성공:', sessionId.value);
        return sessionId.value;
      } else {
        const errorMessage =
          responseData?.header?.message || responseData?.message || '서버 세션 생성 실패';
        console.warn('⚠️ 서버 세션 생성 실패, 로컬 세션으로 폴백:', errorMessage);
        return await createLocalSession(newSessionId);
      }
    } else if (response.status === 401 || response.status === 403) {
      console.warn('🔓 인증 실패 - 로컬 세션으로 전환');
      return await createLocalSession(newSessionId);
    } else {
      console.warn('⚠️ 서버 응답 오류, 로컬 세션으로 폴백:', response.status);
      return await createLocalSession(newSessionId);
    }
  } catch (error) {
    console.error('❌ 세션 생성 실패:', error);
    sessionStatus.value = 'error';

    if (sessionRetryCount.value < maxRetries) {
      sessionRetryCount.value++;
      console.log(`🔄 세션 생성 재시도 (${sessionRetryCount.value}/${maxRetries})`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await createChatSession();
    } else {
      console.warn('⚠️ 최대 재시도 횟수 초과 - 폴백 세션 생성');
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

    console.log('✅ 로컬 세션 생성 완료:', sessionId.value);
    return sessionId.value;
  } catch (error) {
    console.error('❌ 로컬 세션 생성 실패:', error);
    sessionStatus.value = 'error';
    throw error;
  }
};

// ✅ 챗봇 세션 종료 (API 모듈 사용)
const endChatSession = async () => {
  if (!sessionId.value || sessionStatus.value === 'ending') {
    console.log('🔍 종료할 세션이 없거나 이미 종료 중');
    return;
  }

  const currentSessionId = sessionId.value;
  sessionStatus.value = 'ending';

  console.log('🔚 챗봇 세션 종료 시작:', currentSessionId);

  try {
    const isServerSession =
      isAuthenticated() &&
      !currentSessionId.startsWith('local_') &&
      !currentSessionId.startsWith('fallback_') &&
      !currentSessionId.startsWith('guest_');

    if (isServerSession) {
      console.log('🔐 서버 세션 종료 요청');

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
    console.log('🧹 세션 상태 정리 완료');
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
  console.log('🔒 챗봇 수동 닫기');
  await endChatSession();
  removeRouterGuard();
  emit('close');
};

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

// ✅ API 데이터 호출 (API 모듈 사용)
const fetchServiceData = async (service) => {
  try {
    console.log('🚀 서비스 데이터 호출 시작:', service.action);

    if (service.requireAuth && !isAuthenticated()) {
      console.log('❌ 인증 필요한 서비스인데 토큰 없음');
      return 'LOGIN_REQUIRED';
    }

    if (!service.apiMethod) {
      console.log('⚠️ API 메서드가 정의되지 않은 서비스:', service.action);
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
      case 'interestProducts':
        data = await chatbotAPI.userData.getWishlistProducts();
        break;
      case 'recentProducts':
        data = await chatbotAPI.userData.getRecentViewedProducts();
        break;
      default:
        console.warn('⚠️ 정의되지 않은 서비스 액션:', service.action);
        return null;
    }

    console.log('✅ 서비스 데이터 호출 성공:', service.action, data);
    return data || [];
  } catch (error) {
    console.error('❌ 서비스 데이터 호출 실패:', error);
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
        '당신의 투자 성향을 알아보세요! 간단한 질문을 통해 맞춤형 투자 가이드를 제공해드립니다.',
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
          let 제목, 더보기URL, 컨텐츠타입;

          switch (service.action) {
            case 'hotPosts':
              제목 = '🔥 어제 핫했던 게시물';
              더보기URL = '/posts?filter=hot';
              컨텐츠타입 = 'posts';
              break;
            case 'myLikedPosts':
              제목 = '❤️ 내가 좋아요 한 글';
              더보기URL = '/mypage/my-liked';
              컨텐츠타입 = 'posts';
              break;
            case 'myScrapPosts':
              제목 = '📌 내가 스크랩한 글';
              더보기URL = '/mypage/my-scrap';
              컨텐츠타입 = 'posts';
              break;
            case 'myPosts':
              제목 = '✍️ 내가 쓴 글';
              더보기URL = '/mypage/my-posts';
              컨텐츠타입 = 'posts';
              break;
            case 'myComments':
              제목 = '💬 내가 쓴 댓글';
              더보기URL = '/mypage/my-comments';
              컨텐츠타입 = 'comments';
              break;
            case 'interestProducts':
              제목 = '⭐ 관심상품';
              더보기URL = '/mypage';
              컨텐츠타입 = 'wishlist';
              break;
            case 'recentProducts':
              제목 = '👀 최근 본 상품';
              더보기URL = '/mypage/recent-view';
              컨텐츠타입 = 'recent';
              break;
          }

          addMessage('', 'bot', 컨텐츠타입, 데이터, 제목, 더보기URL);
        } else {
          // 빈 데이터 처리
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
            case 'interestProducts':
              빈데이터메시지 = '⭐ 아직 관심상품이 없습니다.';
              break;
            case 'recentProducts':
              빈데이터메시지 = '👀 아직 최근 본 상품이 없습니다.';
              break;
            default:
              빈데이터메시지 = '📝 해당하는 데이터가 없습니다.';
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
    console.log('🤖 ChatGPT API 요청 시작:', message);

    if (!isSessionReady()) {
      console.log('📝 세션이 준비되지 않음 - 세션 생성 시작');
      await createChatSession();
      await waitForSession();
    }

    const currentSessionId = sessionId.value;
    console.log('📤 사용 중인 세션 ID:', currentSessionId);

    // ✅ API 모듈을 사용한 메시지 전송
    const response = await chatbotAPI.message.sendMessage(currentSessionId, message);

    console.log('📨 ChatGPT API 응답:', {
      status: response.status,
      sessionId: currentSessionId,
    });

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
        addMessage('💰 금융상품 비교 기능은 준비 중입니다.', 'bot');
        return;
      }

      if (message.includes('요약')) {
        // 금융상품 요약 기능 (추후 구현)
        isTyping.value = false;
        addMessage('📊 금융상품 요약 기능은 준비 중입니다.', 'bot');
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
  console.log('🚀 ChatWindow 마운트됨');
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
</style>
