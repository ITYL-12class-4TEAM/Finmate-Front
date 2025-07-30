<template>
  <div class="chat-window-inner">
    <!-- 채팅 헤더 -->
    <div class="chat-header">
      <div class="chat-title">
        <div class="status-dot"></div>
        <div class="title-content">
          <span class="main-title">FinMate 고객지원 챗봇</span>
          <span class="sub-title">💬 챗봇을 통해 궁금한 것을 물어보세요!</span>
        </div>
      </div>
      <button class="close-btn" @click="handleClose" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M6 6L18 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <!-- 메시지 영역 -->
    <div class="messages-container" ref="messagesContainer">
      <div class="welcome-message" v-if="messages.length === 0">
        <div class="bot-avatar">
          <img :src="botAvatarImage" alt="해결사" />
        </div>
        <div class="welcome-content">
          <p>안녕하세요! FinMate 챗봇입니다.</p>
          <p>금융 관련 질문이나 서비스 문의사항을 도와드릴게요!</p>
          <p v-if="!isAuthenticated()" class="login-notice">
            🔐 로그인하시면 더 많은 개인화 서비스를 이용하실 수 있습니다.
          </p>
        </div>
      </div>

      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.type]"
      >
        <div class="message-content">
          <div v-if="message.type === 'bot'" class="bot-avatar">
            <img :src="botAvatarImage" alt="해결사" />
          </div>
          <div class="message-bubble">
            <!-- 일반 텍스트 메시지 -->
            <div v-if="message.contentType === 'text'">
              <p>{{ message.text }}</p>
            </div>

            <!-- 게시글 목록 -->
            <div
              v-else-if="message.contentType === 'posts'"
              class="posts-content"
            >
              <p class="content-title">{{ message.title }}</p>
              <div class="posts-list">
                <div
                  v-for="post in message.data.slice(0, 5)"
                  :key="post.id"
                  class="post-item"
                  @click="navigateToPost(post.id)"
                >
                  <div class="post-info">
                    <h4>{{ post.title }}</h4>
                    <p class="post-meta">
                      {{ post.nickname }} · {{ formatDate(post.createdAt) }}
                      <span v-if="post.likeCount" class="like-count"
                        >❤️ {{ post.likeCount }}</span
                      >
                    </p>
                  </div>
                </div>
              </div>
              <button
                v-if="message.data.length > 5"
                @click="navigateToMore(message.moreUrl)"
                class="more-btn"
              >
                더보기 ({{ message.data.length - 5 }}개 더)
              </button>
            </div>

            <!-- WMTI 성향 정보 -->
            <div
              v-else-if="message.contentType === 'wmti'"
              class="wmti-content"
            >
              <p class="content-title">WMTI 투자 성향 유형</p>
              <div class="wmti-types">
                <div
                  v-for="type in wmtiTypes"
                  :key="type.code"
                  class="wmti-type"
                >
                  <div class="type-header">
                    <span class="type-code">{{ type.code }}</span>
                    <span class="type-name">{{ type.name }}</span>
                  </div>
                  <p class="type-description">{{ type.description }}</p>
                </div>
              </div>
            </div>

            <!-- 게시판 목록 -->
            <div
              v-else-if="message.contentType === 'boards'"
              class="boards-content"
            >
              <p class="content-title">{{ message.title }}</p>
              <div class="boards-list">
                <div
                  v-for="board in message.data"
                  :key="board.id"
                  class="board-item"
                  @click="navigateToBoard(board.id)"
                >
                  <div class="board-info">
                    <h4>{{ board.name }}</h4>
                    <p class="board-desc">{{ board.description }}</p>
                    <p class="board-meta">게시글 {{ board.postCount }}개</p>
                  </div>
                  <div class="board-arrow">→</div>
                </div>
              </div>
            </div>

            <!-- 금융상품 요약/비교 결과 -->
            <div
              v-else-if="message.contentType === 'finance'"
              class="finance-content"
            >
              <p class="content-title">{{ message.title }}</p>
              <div class="finance-result">
                <p>{{ message.text }}</p>
              </div>
            </div>

            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- 타이핑 인디케이터 -->
      <div v-if="isTyping" class="message bot">
        <div class="message-content">
          <div class="bot-avatar">
            <img :src="botAvatarImage" alt="해결사" />
          </div>
          <div class="message-bubble typing">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 서비스 기능 버튼들 -->
    <div class="service-buttons" v-if="showServiceButtons">
      <h3>
        {{ isAuthenticated() ? '서비스 기능' : '비회원도 이용 가능한 기능' }}
      </h3>
      <div class="button-grid">
        <button
          v-for="service in getAvailableServices()"
          :key="service.id"
          @click="handleServiceAction(service)"
          class="service-btn"
          type="button"
        >
          <span class="service-icon">{{ service.icon }}</span>
          <span class="service-text">{{ service.text }}</span>
        </button>
      </div>

      <!-- 로그인 안내 -->
      <div v-if="!isAuthenticated()" class="login-guide">
        <p>🔐 <strong>로그인하면 추가로 이용할 수 있는 기능:</strong></p>
        <div class="member-features">
          <span
            v-for="feature in memberOnlyFeatures"
            :key="feature.id"
            class="feature-tag"
          >
            {{ feature.icon }} {{ feature.text }}
          </span>
        </div>
        <button @click="navigateToLogin" class="login-btn">
          로그인하러 가기
        </button>
      </div>
    </div>

    <!-- 빠른 답변 버튼들 -->
    <div
      class="quick-replies"
      v-if="showQuickReplies && quickReplies.length > 0"
    >
      <button
        v-for="reply in quickReplies"
        :key="reply.id"
        @click="sendQuickReply(reply)"
        class="quick-reply-btn"
        type="button"
      >
        {{ reply.text }}
      </button>
    </div>

    <!-- 입력 영역 -->
    <div class="input-area">
      <div class="input-container">
        <input
          v-model="inputMessage"
          @keypress.enter="sendMessage"
          placeholder="메시지를 입력하세요..."
          :disabled="isTyping"
          class="message-input"
          ref="messageInput"
        />
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isTyping"
          class="send-btn"
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import botAvatarImage from '@/assets/images/해결사.png';

// Router 설정
const router = useRouter();

// Emits 정의
const emit = defineEmits(['close']);

// 토큰 관리
const getAuthToken = () => {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token')
  );
};

// 사용자 인증 상태 확인
const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// axios 인터셉터 설정
const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('인증 토큰이 만료되었거나 유효하지 않습니다.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('token');
      }
      return Promise.reject(error);
    }
  );
};

// 상태 관리
const messages = reactive([]);
const inputMessage = ref('');
const isTyping = ref(false);
const messagesContainer = ref(null);
const messageInput = ref(null);
const showQuickReplies = ref(true);
const showServiceButtons = ref(true);
const sessionId = ref(null);

// 서비스 기능 버튼들 (비회원/회원 구분)
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
    id: 9,
    text: '게시판 목록 보기',
    icon: '📋',
    action: 'boardList',
    apiUrl: '/api/board',
    requireAuth: false,
  },
  {
    id: 10,
    text: '금융상품 비교하기',
    icon: '⚖️',
    action: 'productCompare',
    apiUrl: null,
    requireAuth: false,
  },
  {
    id: 11,
    text: '금융상품 요약보기',
    icon: '📊',
    action: 'productSummary',
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

// 비회원에게 보여줄 서비스 기능 필터링 (회원 전용 기능 제외)
const getAvailableServices = () => {
  if (isAuthenticated()) {
    // 회원이면 모든 기능 다 보여주기
    return serviceFeatures;
  } else {
    // 비회원이면 비회원용만
    return serviceFeatures.filter((service) => !service.requireAuth);
  }
};

// 회원 전용 기능들 (로그인 안내용)
const memberOnlyFeatures = computed(() => {
  return serviceFeatures.filter((service) => service.requireAuth);
});

// WMTI 성향 데이터
const wmtiTypes = [
  {
    code: 'ISTJ',
    name: '안전추구형',
    description: '안정성을 중시하며 위험을 최소화하는 보수적 투자 성향',
  },
  {
    code: 'ISFJ',
    name: '신중분석형',
    description: '충분한 분석 후 신중하게 투자 결정을 내리는 성향',
  },
  {
    code: 'INFJ',
    name: '장기비전형',
    description: '장기적 관점에서 미래 가치를 중시하는 투자 성향',
  },
  {
    code: 'INTJ',
    name: '전략계획형',
    description: '체계적인 계획과 전략을 바탕으로 투자하는 성향',
  },
];

// 빠른 답변 옵션들
const quickReplies = reactive([
  {
    id: 1,
    text: '금융 용어 설명',
    response:
      '어떤 금융 용어에 대해 궁금하신가요? 예를 들어 "ISA 계좌", "ETF", "배당금" 등을 물어보세요.',
  },
  {
    id: 2,
    text: '투자 상품 문의',
    response:
      '투자 상품에 대해 궁금한 점이 있으시군요. 구체적으로 어떤 상품에 대해 알고 싶으신가요?',
  },
  {
    id: 3,
    text: '서비스 이용 문의',
    response:
      'FinMate 서비스 이용과 관련해서 도움을 드리겠습니다. 어떤 기능에 대해 궁금하신가요?',
  },
]);

// 메시지 ID 생성
let messageIdCounter = 0;
const generateMessageId = () => ++messageIdCounter;

// 세션 생성
const createChatSession = async () => {
  try {
    sessionId.value = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    if (isAuthenticated()) {
      await axios.post('/api/chatbot/session', null, {
        params: { sessionId: sessionId.value },
      });
      console.log('챗봇 세션 생성됨:', sessionId.value);
    } else {
      console.log('비회원 세션 생성됨:', sessionId.value);
    }
  } catch (error) {
    console.error('세션 생성 실패:', error);
    sessionId.value = `fallback_session_${Date.now()}`;
  }
};

// 세션 종료
const endChatSession = async () => {
  if (sessionId.value && isAuthenticated()) {
    try {
      await axios.delete('/api/chatbot/session', {
        params: { sessionId: sessionId.value },
      });
      console.log('챗봇 세션 종료됨:', sessionId.value);
    } catch (error) {
      console.error('세션 종료 실패:', error);
    }
  }
};

// 닫기 핸들러
const handleClose = async () => {
  await endChatSession();
  emit('close');
};

// 로그인 페이지로 이동
const navigateToLogin = () => {
  router.push('/login');
};

// 시간 포맷팅
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};

// 메시지 추가
const addMessage = (
  text,
  type = 'user',
  contentType = 'text',
  data = null,
  title = '',
  moreUrl = ''
) => {
  messages.push({
    id: generateMessageId(),
    text,
    type,
    contentType,
    data,
    title,
    moreUrl,
    timestamp: Date.now(),
  });

  nextTick(() => {
    scrollToBottom();
  });
};

// 스크롤을 하단으로
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 페이지 이동 함수들
const navigateToPost = (postId) => {
  router.push(`/posts/${postId}`);
};

const navigateToMore = (url) => {
  if (url) {
    router.push(url);
  }
};

const navigateToBoard = (boardId) => {
  router.push(`/board/${boardId}`);
};

// 금융상품 API 호출 함수들
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
const fetchApiData = async (apiUrl) => {
  try {
    console.log('API 호출 시도:', apiUrl);
    const response = await axios.get(apiUrl);
    console.log('전체 API 응답:', response);

    // 다양한 응답 구조 처리 (수정됨)
    let rawData = null;

    // 실제 API 응답 구조에 맞게 수정
    if (response.data?.body?.data) {
      rawData = response.data.body.data; // ✅ 올바른 경로
    } else if (response.data?.data) {
      rawData = response.data.data;
    } else if (response.data?.content) {
      rawData = response.data.content;
    } else if (Array.isArray(response.data)) {
      rawData = response.data;
    } else {
      console.warn('예상과 다른 응답 구조:', response.data);
      rawData = [];
    }

    // 백엔드 응답을 프론트엔드 형식으로 변환
    const processedData = Array.isArray(rawData)
      ? rawData.map((post) => {
          // createdAt 배열을 Date 객체로 변환
          let createdAtString = '';
          if (Array.isArray(post.createdAt)) {
            const [year, month, day, hour, minute, second] = post.createdAt;
            createdAtString = new Date(
              year,
              month - 1,
              day,
              hour,
              minute,
              second
            ).toISOString();
          } else {
            createdAtString = post.createdAt;
          }

          return {
            id: post.postId, // postId -> id 매핑
            title: post.title,
            nickname: post.nickname || '익명', // nickname이 없으면 익명 처리
            createdAt: createdAtString,
            likeCount: post.likeCount || 0,
            commentCount: post.commentCount || 0,
            isAnonymous: post.anonymous,
            boardId: post.boardId,
            status: post.status,
            productTag: post.productTag,
          };
        })
      : [];

    console.log('변환된 데이터:', processedData);
    return processedData;
  } catch (error) {
    console.error('API 호출 실패:', error);
    return [];
  }
};
const handleServiceAction = async (service) => {
  showServiceButtons.value = false;
  showQuickReplies.value = false;

  addMessage(service.text, 'user');
  isTyping.value = true;

  try {
    if (service.action === 'wmtiTypes') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      isTyping.value = false;
      addMessage('', 'bot', 'wmti', wmtiTypes, 'WMTI 투자 성향 유형');
    } else if (service.action === 'survey') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '설문조사 기능은 준비중입니다. 곧 이용 가능할 예정이에요!',
        'bot'
      );
    } else if (service.action === 'boardList') {
      try {
        const data = await fetchApiData(service.apiUrl);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isTyping.value = false;

        if (data && data.length > 0) {
          addMessage('', 'bot', 'boards', data, '게시판 목록');
        } else {
          addMessage('아직 등록된 게시판이 없습니다.', 'bot');
        }
      } catch (error) {
        isTyping.value = false;
        addMessage('게시판 목록을 불러오는 중 오류가 발생했습니다.', 'bot');
      }
    } else if (service.action === 'productCompare') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '비교하고 싶은 금융상품들의 이름을 입력해주세요. 예: "ISA 계좌와 IRP 비교"',
        'bot'
      );
    } else if (service.action === 'productSummary') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '요약을 원하는 금융상품의 이름을 입력해주세요. 예: "청년희망적금 요약"',
        'bot'
      );
    } else if (service.apiUrl) {
      // 공개 API 호출
      try {
        const data = await fetchApiData(service.apiUrl);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isTyping.value = false;

        if (data && data.length > 0) {
          let title, moreUrl;
          if (service.action === 'hotPosts') {
            title = '어제 핫했던 게시물';
            moreUrl = '/posts?filter=hot';
          }

          addMessage('', 'bot', 'posts', data, title, moreUrl);
        } else {
          // 데이터가 없을 때 메시지
          let noDataMessage = '아직 해당하는 글이 없습니다.';
          if (service.action === 'hotPosts') {
            noDataMessage = '아직 인기 게시물이 없습니다.';
          }
          addMessage(noDataMessage, 'bot');
        }
      } catch (apiError) {
        isTyping.value = false;
        let errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.';

        if (apiError.response) {
          switch (apiError.response.status) {
            case 404:
              errorMessage = '요청하신 데이터를 찾을 수 없습니다.';
              break;
            case 500:
              errorMessage =
                '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
              break;
          }
        } else if (apiError.request) {
          errorMessage =
            '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
        }

        addMessage(errorMessage, 'bot');
      }
    }
  } catch (error) {
    isTyping.value = false;
    console.error('서비스 액션 처리 중 오류:', error);
    addMessage(
      '요청을 처리하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      'bot'
    );
  }
};

// GPT API로 메시지 전송
const sendMessageToGPT = async (message) => {
  // 금융상품 비교 요청 감지
  if (
    message.includes('비교') &&
    (message.includes('상품') ||
      message.includes('계좌') ||
      message.includes('적금') ||
      message.includes('펀드'))
  ) {
    try {
      const result = await requestProductCompare(message);
      return result;
    } catch (error) {
      console.error('상품 비교 실패:', error);
    }
  }

  // 금융상품 요약 요청 감지
  if (
    message.includes('요약') &&
    (message.includes('상품') ||
      message.includes('계좌') ||
      message.includes('적금') ||
      message.includes('펀드'))
  ) {
    try {
      const result = await requestProductSummary(message);
      return result;
    } catch (error) {
      console.error('상품 요약 실패:', error);
    }
  }

  // 비회원이거나 토큰이 없는 경우 시뮬레이션
  if (!isAuthenticated()) {
    console.log('비회원: GPT API 시뮬레이션');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responses = {
      isa: 'ISA 계좌는 Individual Savings Account의 줄임말로, 개인종합자산관리계좌입니다. 연간 2,000만원까지 투자할 수 있으며, 5년간 운용익에 대해 비과세 혜택을 받을 수 있습니다.',
      etf: 'ETF는 Exchange Traded Fund의 줄임말로, 상장지수펀드입니다. 특정 지수를 추종하며 주식처럼 거래소에서 실시간으로 매매할 수 있습니다.',
      주식: '주식투자는 기업의 지분을 구매하는 것입니다. 기업의 성장과 함께 수익을 얻을 수 있지만, 손실의 위험도 있으니 충분한 공부와 분산투자가 중요합니다.',
      안녕: '안녕하세요! 금융과 투자에 관한 궁금한 점이 있으시면 언제든 물어보세요. 😊',
      로그인: '로그인하시면 개인화된 서비스를 더 많이 이용하실 수 있습니다!',
      비교: '금융상품 비교를 원하시는군요! 구체적으로 어떤 상품들을 비교하고 싶으신지 알려주세요.',
      요약: '금융상품 요약을 원하시는군요! 어떤 상품에 대한 요약을 원하시는지 구체적으로 말씀해주세요.',
      댓글: '댓글 기능은 각 게시글에서 이용하실 수 있습니다. 게시글을 클릭하시면 댓글을 보고 작성할 수 있어요.',
      게시판:
        '다양한 주제의 게시판이 있습니다. "게시판 목록 보기" 버튼을 눌러 확인해보세요!',
    };

    const lowerMessage = message.toLowerCase();
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    return `"${message}"에 대해 궁금하시군요! 구체적인 금융 관련 질문을 해주시면 더 자세한 답변을 드릴 수 있습니다. 예를 들어 ISA 계좌, ETF, 주식 투자 등에 대해 물어보세요.`;
  }

  try {
    const response = await axios.post('/api/chatbot/message', null, {
      params: {
        sessionId: sessionId.value,
        userMessage: message,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('GPT API 호출 실패:', error);

    if (error.response?.status === 401) {
      return '인증이 만료되었습니다. 다시 로그인해주세요. 🔐';
    }

    return '죄송합니다. 현재 AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 🙏';
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
  const botResponse = await sendMessageToGPT(message);

  await new Promise((resolve) => setTimeout(resolve, 500));
  isTyping.value = false;
  addMessage(botResponse, 'bot');
};

// 빠른 답변 전송
const sendQuickReply = async (reply) => {
  addMessage(reply.text, 'user');
  showQuickReplies.value = false;
  showServiceButtons.value = false;

  isTyping.value = true;
  await new Promise((resolve) => setTimeout(resolve, 800));
  isTyping.value = false;
  addMessage(reply.response, 'bot');
};

// 컴포넌트 마운트 시
onMounted(async () => {
  setupAxiosInterceptors();
  await createChatSession();
  if (messageInput.value) {
    messageInput.value.focus();
  }

  const token = getAuthToken();
  console.log('토큰 상태:', token ? '있음' : '없음');
  console.log('인증 상태:', isAuthenticated());
});

// 컴포넌트 언마운트 시
onUnmounted(async () => {
  await endChatSession();
});
</script>

<style scoped>
.chat-window-inner {
  display: flex;
  flex-direction: column;
  height: 700px;
  width: 420px;
  background: var(--color-white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(45, 51, 107, 0.15);
}

/* 헤더 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-main);
  color: var(--color-white);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.main-title {
  font-size: 1rem;
  font-weight: 600;
}

.sub-title {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.9;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  position: relative;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

/* 메시지 영역 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.welcome-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg-light);
  border-radius: 12px;
  color: var(--color-sub);
  font-size: 0.875rem;
}

.welcome-content p {
  margin: 0 0 0.5rem 0;
}

.welcome-content p:last-child {
  margin-bottom: 0;
}

.login-notice {
  font-size: 0.8rem;
  color: var(--color-main) !important;
  font-weight: 500;
  background: rgba(45, 51, 107, 0.1);
  padding: 0.5rem;
  border-radius: 6px;
  margin-top: 0.5rem !important;
}

.message {
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message.bot {
  align-items: flex-start;
}

.message-content {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 85%;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.bot-avatar {
  width: 32px;
  height: 32px;
  background: var(--color-white);
  border: 2px solid var(--color-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  overflow: hidden;
}

.bot-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-bubble {
  background: var(--color-bg-light);
  padding: 0.75rem 1rem;
  border-radius: 18px;
  position: relative;
}

.message.user .message-bubble {
  background: var(--color-main);
  color: var(--color-white);
}

.message-bubble p {
  margin: 0;
  line-height: 1.4;
}

.timestamp {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 0.5rem;
  display: block;
}

/* 콘텐츠 스타일 */
.content-title {
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--color-main);
  font-size: 0.9rem;
}

.posts-content,
.wmti-content,
.boards-content,
.finance-content {
  width: 100%;
}

.posts-list,
.boards-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.post-item,
.board-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-light);
}

.post-item:hover,
.board-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.board-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-info h4,
.board-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;
}

.board-info h4 {
  font-size: 0.9rem;
  font-weight: 600;
}

.post-meta,
.board-desc,
.board-meta {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-sub);
}

.board-desc {
  font-size: 0.8rem;
  line-height: 1.3;
  margin-bottom: 0.25rem;
}

.board-meta {
  color: var(--color-main);
  font-weight: 500;
}

.like-count {
  color: #e91e63;
  font-weight: 500;
}

.board-arrow {
  font-size: 1.2rem;
  color: var(--color-main);
  font-weight: bold;
}

.more-btn {
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  width: 100%;
}

.more-btn:hover {
  background: var(--color-sub);
}

/* WMTI 스타일 */
.wmti-types {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wmti-type {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid var(--color-light);
}

.type-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.type-code {
  background: var(--color-main);
  color: var(--color-white);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-name {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.85rem;
}

.type-description {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-sub);
  line-height: 1.4;
}

/* 금융상품 스타일 */
.finance-result {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid var(--color-light);
  margin-bottom: 0.75rem;
}

.finance-result p {
  margin: 0;
  line-height: 1.5;
  color: var(--color-text);
}

/* 서비스 버튼들 */
.service-buttons {
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
  border-bottom: 1px solid var(--color-bg-light);
}

.service-buttons h3 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 600;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.service-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.3rem 0.2rem;
  background: var(--color-bg-light);
  border: 2px solid var(--color-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.6rem;
}

.service-btn:hover {
  background: var(--color-main);
  color: var(--color-white);
  border-color: var(--color-main);
  transform: translateY(-1px);
}

.service-icon {
  font-size: 0.85rem;
}

.service-text {
  text-align: center;
  line-height: 1.2;
  font-weight: 500;
}

/* 로그인 안내 */
.login-guide {
  background: rgba(45, 51, 107, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(45, 51, 107, 0.1);
}

.login-guide p {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: var(--color-text);
}

.member-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature-tag {
  background: rgba(45, 51, 107, 0.1);
  color: var(--color-main);
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.login-btn {
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
}

.login-btn:hover {
  background: var(--color-sub);
  transform: translateY(-1px);
}

/* 타이핑 인디케이터 */
.typing {
  padding: 1rem !important;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--color-sub);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: 0s;
}
.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

/* 빠른 답변 */
.quick-replies {
  padding: 0 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-top: 1px solid var(--color-bg-light);
  padding-top: 1rem;
}

.quick-reply-btn {
  background: var(--color-bg-light);
  border: 2px solid var(--color-light);
  color: var(--color-main);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.quick-reply-btn:hover {
  background: var(--color-main);
  color: var(--color-white);
  border-color: var(--color-main);
}

/* 입력 영역 */
.input-area {
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
  background: var(--color-white);
}

.input-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-light);
  border-radius: 25px;
  outline: none;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: var(--color-main);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 44px;
  height: 44px;
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: var(--color-sub);
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 스크롤바 스타일링 */
.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: var(--color-bg-light);
}

.messages-container::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-window-inner {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .button-grid {
    grid-template-columns: 1fr;
  }

  .message-content {
    max-width: 90%;
  }

  .posts-list,
  .boards-list {
    gap: 0.75rem;
  }

  .post-item,
  .board-item {
    padding: 1rem;
  }

  .service-btn {
    padding: 1rem;
    font-size: 0.9rem;
  }

  .service-icon {
    font-size: 1.5rem;
  }

  .member-features {
    flex-direction: column;
  }
}
</style>
