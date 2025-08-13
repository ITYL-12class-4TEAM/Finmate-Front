<template>
  <div class="chat-window-inner" @click.stop>
    <ChatHeader
      :session-time-remaining="sessionTimeRemaining"
      :is-session-active="isSessionActive"
      @close="handleClose"
      @clear-chat="handleClearChat"
    />

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
      :is-session-active="isSessionActive"
      class="chat-input-fixed"
      @update:input-message="inputMessage = $event"
      @send-message="sendMessage"
      @toggle-service-menu="toggleServiceMenu"
      @service-action="handleServiceAction"
      @navigate-to-login="navigateToLogin"
    />

    <!-- 세션 만료 알림 모달 -->
    <div v-if="showSessionExpiredModal" class="modal-overlay" @click="closeSessionExpiredModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <i class="fas fa-clock text-warning"></i>
          <h3>세션 만료</h3>
        </div>
        <div class="modal-body">
          <p>1시간 세션이 만료되었습니다.</p>
          <p>대화를 계속하시려면 새로운 세션을 시작해주세요.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="startNewSession">
            <i class="fas fa-refresh"></i>
            새 세션 시작
          </button>
          <button class="btn btn-secondary" @click="closeSessionExpiredModal">
            <i class="fas fa-times"></i>
            닫기
          </button>
        </div>
      </div>
    </div>

    <!-- 채팅 초기화 확인 모달 -->
    <div v-if="showClearChatModal" class="modal-overlay" @click="closeClearChatModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <i class="fas fa-trash-alt text-danger"></i>
          <h3>대화 내용 삭제</h3>
        </div>
        <div class="modal-body">
          <p>모든 대화 내용이 삭제됩니다.</p>
          <p>이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" @click="confirmClearChat">
            <i class="fas fa-trash-alt"></i>
            삭제
          </button>
          <button class="btn btn-secondary" @click="closeClearChatModal">
            <i class="fas fa-times"></i>
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';

import ChatHeader from './ChatHeader.vue';
import MessagesContainer from './MessagesContainer.vue';
import ServiceButtons from './ServiceButtons.vue';
import ChatInput from './ChatInput.vue';

// API 모듈 import
import { chatbotAPI } from '@/api/chatbot.js';

// Router 설정
const router = useRouter();

// Emits 정의
const emit = defineEmits(['close']);

let routerGuardRemover = null;

// 세션 타이머 관련 상태
const SESSION_DURATION = 60 * 60 * 1000; // 1시간 (밀리초)
const sessionStartTime = ref(null);
const sessionTimeRemaining = ref(SESSION_DURATION);
const isSessionActive = ref(false);
const sessionTimer = ref(null);
const sessionUpdateInterval = ref(null);
const showSessionExpiredModal = ref(false);
const showClearChatModal = ref(false);

// 세션 타이머 시작
const startSessionTimer = () => {
  sessionStartTime.value = Date.now();
  isSessionActive.value = true;
  sessionTimeRemaining.value = SESSION_DURATION;

  // 1초마다 남은 시간 업데이트
  sessionUpdateInterval.value = setInterval(() => {
    const elapsed = Date.now() - sessionStartTime.value;
    const remaining = SESSION_DURATION - elapsed;

    if (remaining <= 0) {
      sessionTimeRemaining.value = 0;
      handleSessionExpired();
    } else {
      sessionTimeRemaining.value = remaining;
    }
  }, 1000);

  // 1시간 후 세션 종료
  sessionTimer.value = setTimeout(() => {
    handleSessionExpired();
  }, SESSION_DURATION);
};

// 세션 타이머 정지
const stopSessionTimer = () => {
  if (sessionTimer.value) {
    clearTimeout(sessionTimer.value);
    sessionTimer.value = null;
  }

  if (sessionUpdateInterval.value) {
    clearInterval(sessionUpdateInterval.value);
    sessionUpdateInterval.value = null;
  }

  isSessionActive.value = false;
  sessionTimeRemaining.value = SESSION_DURATION;
  sessionStartTime.value = null;
};

// 세션 만료 처리
const handleSessionExpired = async () => {
  stopSessionTimer();
  isSessionActive.value = false;

  // 현재 세션 종료
  await endChatSession();

  // 타이핑 상태 초기화
  isTyping.value = false;

  // 세션 만료 메시지 추가
  addMessage(
    '<i class="fas fa-clock text-warning"></i> 세션이 만료되었습니다. 대화를 계속하시려면 새로운 세션을 시작해주세요.',
    'bot'
  );

  // 세션 만료 모달 표시
  showSessionExpiredModal.value = true;
};

// 새 세션 시작
const startNewSession = async () => {
  try {
    showSessionExpiredModal.value = false;

    // 새 세션 생성
    await createChatSession();
    await waitForSession();

    // 새 세션 타이머 시작
    startSessionTimer();

    // 환영 메시지
    addMessage(
      '<i class="fas fa-refresh text-success"></i> 새로운 세션이 시작되었습니다. 무엇을 도와드릴까요?',
      'bot'
    );
  } catch (error) {
    console.error('새 세션 시작 실패:', error);
    addMessage(
      '<i class="fas fa-exclamation-triangle text-danger"></i> 새 세션 시작에 실패했습니다. 페이지를 새로고침해주세요.',
      'bot'
    );
  }
};

// 세션 만료 모달 닫기
const closeSessionExpiredModal = () => {
  showSessionExpiredModal.value = false;
};

// 채팅 초기화 처리
const handleClearChat = () => {
  showClearChatModal.value = true;
};

// 채팅 초기화 확인
const confirmClearChat = async () => {
  try {
    showClearChatModal.value = false;

    // 현재 세션 종료
    await endChatSession();

    // 타이머 정지
    stopSessionTimer();

    // 메시지 초기화
    messages.value = [];
    inputMessage.value = '';
    isTyping.value = false;
    showServiceButtons.value = true;
    showServiceMenu.value = false;

    // 새 세션 시작
    await createChatSession();
    await waitForSession();
    startSessionTimer();

    // 환영 메시지
    if (!isAuthenticated()) {
      addMessage(
        '안녕하세요! 🤖 금융 상담 챗봇입니다.\n\n기본적인 금융 정보는 누구나 이용 가능하며, 로그인하시면 개인화된 상담과 더 많은 기능을 이용하실 수 있습니다.',
        'bot'
      );
    } else {
      addMessage(
        '안녕하세요! 🤖 금융 상담 챗봇입니다.\n\n개인화된 금융 상담과 다양한 서비스를 이용해보세요!',
        'bot'
      );
    }
  } catch (error) {
    console.error('채팅 초기화 실패:', error);
    addMessage(
      '<i class="fas fa-exclamation-triangle text-danger"></i> 채팅 초기화에 실패했습니다. 페이지를 새로고침해주세요.',
      'bot'
    );
  }
};

// 채팅 초기화 모달 닫기
const closeClearChatModal = () => {
  showClearChatModal.value = false;
};

const setupRouterGuard = () => {
  if (routerGuardRemover) return;

  routerGuardRemover = router.beforeEach((to, from, next) => {
    endChatSession().finally(() => {
      stopSessionTimer();
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
const showServiceButtons = ref(true);
const sessionId = ref(null);
const sessionStatus = ref('idle');
const sessionRetryCount = ref(0);
const showServiceMenu = ref(false);

const toggleServiceMenu = () => {
  showServiceMenu.value = !showServiceMenu.value;
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

// 챗봇 세션 생성
const createChatSession = async () => {
  if (sessionStatus.value === 'creating' || sessionStatus.value === 'active') {
    return sessionId.value;
  }

  sessionStatus.value = 'creating';

  try {
    // 비회원인 경우 바로 로컬 세션 생성
    if (!isAuthenticated()) {
      const guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return await createLocalSession(guestSessionId);
    }

    // 회원인 경우에만 서버 세션 생성 시도
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
        return await createLocalSession(newSessionId);
      }
    } else {
      return await createLocalSession(newSessionId);
    }
  } catch (error) {
    console.warn('세션 생성 중 오류, 로컬 세션으로 대체:', error);

    // 에러 발생시 항상 로컬 세션으로 대체
    const fallbackSessionId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return await createLocalSession(fallbackSessionId);
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

// 챗봇 세션 종료
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
  stopSessionTimer();
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
  stopSessionTimer();
  removeRouterGuard();
  emit('close');
  router.push('/login').then(() => {
    window.location.reload();
  });
};

const navigateToPost = async (postId) => {
  await endChatSession();
  stopSessionTimer();
  removeRouterGuard();
  emit('close');
  router.push(`/community/${postId}`).then(() => {
    window.location.reload();
  });
};

const navigateToMore = (url) => {
  if (!url || typeof url !== 'string') {
    console.warn('유효하지 않은 URL:', url);
    return;
  }

  stopSessionTimer();
  removeRouterGuard();
  emit('close');
  router
    .push(url)
    .then(() => {
      window.location.reload();
    })
    .catch((err) => {
      console.error('router.push 에러:', err);
    });
};

const navigateToSurvey = () => {
  stopSessionTimer();
  removeRouterGuard();
  emit('close');
  router.push('/wmti/basic').then(() => {
    window.location.reload();
  });
};

// API 데이터 호출
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
        console.warn('정의되지 않은 서비스 액션:', service.action);
        return null;
    }
    return data || [];
  } catch (error) {
    console.error('서비스 데이터 호출 실패:', error);
    const errorType = chatbotAPI.errorHandler.handleError(error);
    return errorType;
  }
};

// WMTI 성향 데이터
const wmtiTypes = [];

// 서비스 액션 핸들러
const handleServiceAction = async (service) => {
  // 세션이 만료되었으면 메시지 전송 차단
  if (!isSessionActive.value) {
    addMessage(
      '<i class="fas fa-exclamation-triangle text-warning"></i> 세션이 만료되었습니다. 새로운 세션을 시작해주세요.',
      'bot'
    );
    return;
  }

  showServiceButtons.value = false;
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
        const data = await fetchServiceData(service);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isTyping.value = false;

        // 에러 타입별 처리
        if (typeof data === 'string') {
          const errorMessage = chatbotAPI.errorHandler.getErrorMessage(data);
          addMessage(errorMessage, 'bot');
          return;
        }

        // 정상 데이터 처리
        if (Array.isArray(data) && data.length > 0) {
          let title, subtitle, moreUrl, contentType;

          switch (service.action) {
            case 'hotPosts':
              title = '<i class="fas fa-fire" style="color: #ff6b35;"></i> 어제 핫했던 게시물';
              subtitle =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 최신 인기 게시물 확인하기';
              moreUrl = '/posts?filter=hot';
              contentType = 'posts';
              break;
            case 'myLikedPosts':
              title = '<i class="fas fa-heart" style="color: #e91e63;"></i> 내가 좋아요 한 글';
              subtitle =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 내 취향을 담은 게시물 모아보기';
              moreUrl = '/mypage/my-liked';
              contentType = 'posts';
              break;
            case 'myScrapPosts':
              title = '<i class="fas fa-bookmark" style="color: #9c27b0;"></i> 내가 스크랩한 글';
              subtitle =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 나중에 다시 보고 싶은 글들';
              moreUrl = '/mypage/my-scrap';
              contentType = 'posts';
              break;
            case 'myPosts':
              title = '<i class="fas fa-pen-fancy" style="color: #ff9800;"></i> 내가 쓴 글';
              subtitle =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 내가 남긴 이야기 한눈에 보기';
              moreUrl = '/mypage/my-posts';
              contentType = 'posts';
              break;
            case 'myComments':
              title = '<i class="fas fa-comments" style="color: #00bcd4;"></i> 내가 쓴 댓글';
              subtitle =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 어디에 어떤 말을 남겼을까?';
              moreUrl = '/mypage/my-comments';
              contentType = 'comments';
              break;
            case 'wishlistProducts':
              title = '<i class="fas fa-star" style="color: #ffc107;"></i> 관심상품';
              subtitle =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 찜해둔 상품 다시 확인해보기';
              moreUrl = '/mypage';
              contentType = 'wishlist';
              break;
            case 'recentProducts':
              title = '<i class="fas fa-eye" style="color: #607d8b;"></i> 최근 본 상품';
              subtitle =
                '<i class="fas fa-sparkles" style="color: #ffc107;"></i> 최근에 둘러본 상품 한눈에 보기';
              moreUrl = '/mypage/recent-view';
              contentType = 'recent';
              break;
          }

          addMessage('', 'bot', contentType, data, title, subtitle, moreUrl);
        } else {
          // 빈 데이터 처리
          let emptyDataMessage;
          switch (service.action) {
            case 'hotPosts':
              emptyDataMessage =
                '<i class="fas fa-fire" style="color: #ff6b35;"></i> 아직 인기 게시물이 없습니다.';
              break;
            case 'myLikedPosts':
              emptyDataMessage =
                '<i class="fas fa-heart" style="color: #e91e63;"></i> 아직 좋아요 한 글이 없습니다.';
              break;
            case 'myScrapPosts':
              emptyDataMessage =
                '<i class="fas fa-bookmark" style="color: #9c27b0;"></i> 아직 스크랩한 글이 없습니다.';
              break;
            case 'myPosts':
              emptyDataMessage =
                '<i class="fas fa-pen-fancy" style="color: #ff9800;"></i> 아직 작성한 글이 없습니다.';
              break;
            case 'myComments':
              emptyDataMessage =
                '<i class="fas fa-comments" style="color: #00bcd4;"></i> 아직 작성한 댓글이 없습니다.';
              break;
            case 'wishlistProducts':
              emptyDataMessage =
                '<i class="fas fa-star" style="color: #ffc107;"></i> 아직 관심상품이 없습니다.';
              break;
            case 'recentProducts':
              emptyDataMessage =
                '<i class="fas fa-eye" style="color: #607d8b;"></i> 아직 최근 본 상품이 없습니다.';
              break;
            default:
              emptyDataMessage =
                '<i class="fas fa-exclamation-circle" style="color: #6c757d;"></i> 해당하는 데이터가 없습니다.';
          }
          addMessage(emptyDataMessage, 'bot');
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

// ChatGPT 메시지 전송
const sendMessageToGPT = async (message) => {
  try {
    if (!isSessionReady()) {
      await createChatSession();
      await waitForSession();
    }

    const currentSessionId = sessionId.value;

    // 비회원인 경우 로컬에서 간단한 응답 처리 (또는 제한된 API 사용)
    if (
      !isAuthenticated() &&
      (currentSessionId.startsWith('guest_') ||
        currentSessionId.startsWith('local_') ||
        currentSessionId.startsWith('fallback_'))
    ) {
      // 비회원용 기본 응답 로직
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 응답 대기 시뮬레이션

      // 간단한 키워드 기반 응답 (실제로는 여기에 제한된 API나 로컬 응답 로직을 구현)
      if (message.includes('안녕') || message.includes('hi') || message.includes('hello')) {
        return '안녕하세요! 금융 관련 궁금한 점이 있으시면 언제든 물어보세요. 더 자세한 상담을 원하시면 로그인 후 이용해주세요.';
      } else if (message.includes('도움') || message.includes('help')) {
        return '금융 상품 비교, 투자 정보, 적금 및 예금 상품에 대해 도움을 드릴 수 있습니다. 로그인하시면 개인화된 상담을 받으실 수 있어요!';
      } else {
        return '죄송합니다. 비회원 사용자에게는 기본적인 정보만 제공됩니다. 로그인하시면 AI 챗봇의 모든 기능을 이용하실 수 있습니다.';
      }
    }

    // 회원인 경우 정상적인 API 호출
    try {
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
    } catch (apiError) {
      console.error('❌ ChatGPT API 호출 실패:', apiError);

      // API 호출 실패시 기본 응답
      if (apiError.response?.status === 401 || apiError.response?.status === 403) {
        return '인증이 필요한 기능입니다. 로그인 후 다시 시도해주세요.';
      }

      return '현재 AI 챗봇 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
    }
  } catch (error) {
    console.error('❌ 메시지 전송 전체 실패:', error);
    return '죄송합니다. 서비스 이용 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.';
  }
};

// 메시지 전송
const sendMessage = async () => {
  const message = inputMessage.value.trim();
  if (!message || isTyping.value) return;

  // 세션이 만료되었으면 메시지 전송 차단
  if (!isSessionActive.value) {
    addMessage(
      '<i class="fas fa-exclamation-triangle text-warning"></i> 세션이 만료되었습니다. 새로운 세션을 시작해주세요.',
      'bot'
    );
    return;
  }

  addMessage(message, 'user');
  inputMessage.value = '';
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
    await waitForSession();
    // 세션 타이머 시작
    startSessionTimer();

    // 비회원에게 환영 메시지 표시
    if (!isAuthenticated()) {
      addMessage(
        '안녕하세요! 🤖 금융 상담 챗봇입니다.\n\n기본적인 금융 정보는 누구나 이용 가능하며, 로그인하시면 개인화된 상담과 더 많은 기능을 이용하실 수 있습니다.',
        'bot'
      );
    } else {
      addMessage(
        '안녕하세요! 🤖 금융 상담 챗봇입니다.\n\n개인화된 금융 상담과 다양한 서비스를 이용해보세요!',
        'bot'
      );
    }
  } catch (error) {
    console.error('초기 세션 생성 실패:', error);
    // 세션 생성 실패해도 기본 기능은 동작하도록
    addMessage(
      '안녕하세요! 금융 상담 챗봇입니다. 현재 일부 기능에 제한이 있을 수 있습니다.',
      'bot'
    );
  }
});

onUnmounted(async () => {
  await endChatSession();
  stopSessionTimer();
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
  sessionTimeRemaining,
  isSessionActive,
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

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header i {
  font-size: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-body {
  padding: 20px 24px;
}

.modal-body p {
  margin: 0 0 12px;
  color: #6b7280;
  line-height: 1.5;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn i {
  font-size: 14px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

/* 텍스트 컬러 클래스 */
.text-warning {
  color: #f59e0b !important;
}

.text-danger {
  color: #ef4444 !important;
}

.text-success {
  color: #10b981 !important;
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

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
