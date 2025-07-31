<template>
  <div class="chat-window-inner" @click.stop>
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
                      {{ post.nickname || post.author || '작성자 없음' }} ·
                      {{
                        formatDate(
                          post.createdAt || post.created_at || post.date
                        )
                      }}
                      <span
                        v-if="post.likeCount || post.like_count"
                        class="like-count"
                        >❤️ {{ post.likeCount || post.like_count }}</span
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

            <!-- 댓글 목록 -->
            <div
              v-else-if="message.contentType === 'comments'"
              class="comments-content"
            >
              <p class="content-title">{{ message.title }}</p>
              <div class="comments-list">
                <div
                  v-for="comment in message.data.slice(0, 5)"
                  :key="comment.id || comment.commentId"
                  class="comment-item"
                  @click="navigateToPost(comment.postId)"
                >
                  <div class="comment-info">
                    <h4 class="comment-title">
                      {{ comment.content || comment.text }}
                    </h4>
                    <p class="comment-meta">
                      게시글 #{{ comment.postId }} ·
                      {{
                        formatDate(
                          comment.createdAt ||
                            comment.created_at ||
                            comment.date
                        )
                      }}
                      <span
                        v-if="comment.likeCount || comment.like_count"
                        class="like-count"
                      >
                        ❤️ {{ comment.likeCount || comment.like_count }}
                      </span>
                      <span v-if="comment.anonymous" class="anonymous-badge"
                        >익명</span
                      >
                      <span v-if="comment.parentComment" class="reply-badge"
                        >↳ 답글</span
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
    <!-- ChatWindow.vue의 input-area 부분을 다음과 같이 수정하세요 -->

    <!-- 입력 영역 -->
    <div class="input-area">
      <!-- 서비스 메뉴 버튼 (메시지가 있을 때만 표시) -->
      <div class="service-menu-toggle" v-if="messages.length > 0">
        <button
          @click="toggleServiceMenu"
          class="service-menu-btn"
          type="button"
          :class="{ active: showServiceMenu }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span>서비스 메뉴</span>
        </button>
      </div>

      <!-- 서비스 버튼들 (토글 상태일 때 표시) -->
      <div
        class="compact-service-buttons"
        v-if="showServiceMenu && messages.length > 0"
      >
        <div class="compact-button-grid">
          <button
            v-for="service in getAvailableServices()"
            :key="service.id"
            @click="handleServiceAction(service)"
            class="compact-service-btn"
            type="button"
          >
            <span class="compact-service-icon">{{ service.icon }}</span>
            <span class="compact-service-text">{{ service.text }}</span>
          </button>
        </div>

        <!-- 로그인 안내 (비회원일 때) -->
        <div v-if="!isAuthenticated()" class="compact-login-guide">
          <p>🔐 <strong>로그인하면 더 많은 기능을 이용할 수 있어요!</strong></p>
          <button @click="navigateToLogin" class="compact-login-btn">
            로그인하러 가기
          </button>
        </div>
      </div>

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

// 라우터 가드 설정 - 페이지 이동 시 챗봇 자동 닫기
let routerGuardRemover = null;

const setupRouterGuard = () => {
  // 라우터 가드 등록 - 페이지 이동 감지
  routerGuardRemover = router.beforeEach((to, from, next) => {
    console.log('🔄 페이지 이동 감지:', from.path, '->', to.path);

    // 챗봇 세션 종료 후 페이지 이동
    endChatSession().finally(() => {
      // 챗봇 창 닫기
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

// 토큰 관리
const getAuthToken = () => {
  const tokenSources = [
    localStorage.getItem('accessToken'),
    localStorage.getItem('token'),
    sessionStorage.getItem('accessToken'),
    sessionStorage.getItem('token'),
  ];

  const token = tokenSources.find(
    (t) => t && t !== 'null' && t !== 'undefined'
  );

  if (token) {
    try {
      // JWT 토큰 만료 확인
      const payload = JSON.parse(atob(token.split('.')[1]));
      const 현재시간 = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < 현재시간) {
        console.log('🔴 토큰 만료됨');
        토큰전체삭제();
        return null;
      }

      console.log('✅ 유효한 토큰 확인됨');
      return token;
    } catch (error) {
      console.error('토큰 파싱 에러:', error);
      토큰전체삭제();
      return null;
    }
  }

  return null;
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
      console.log('🔍 토큰 확인:', token ? '토큰 있음' : '토큰 없음');
      console.log('🔍 토큰 값:', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization 헤더 추가됨');
      } else {
        console.log('❌ 토큰이 없어서 헤더 추가 안됨');
      }

      console.log('🔍 최종 헤더:', config.headers);
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

const clearAllTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('token');
  console.log('🗑️ 모든 토큰 삭제 완료');
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
const showServiceMenu = ref(false);

const toggleServiceMenu = () => {
  showServiceMenu.value = !showServiceMenu.value;
  showQuickReplies.value = false; // 서비스 메뉴를 열면 빠른 답변은 숨김
};

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
  console.log('🔒 챗봇 수동 닫기');
  await endChatSession();
  removeRouterGuard(); // 라우터 가드 제거
  emit('close');
};

// 로그인 페이지로 이동 - 챗봇 닫기 없이 이동
const navigateToLogin = () => {
  console.log('🔑 로그인 페이지로 이동');
  // 라우터 가드를 일시적으로 제거하고 이동
  removeRouterGuard();
  router.push('/login');

  // 이동 후 챗봇 닫기
  setTimeout(() => {
    emit('close');
  }, 100);
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
  // 날짜 값이 없거나 유효하지 않은 경우 처리
  if (!dateString || dateString === 'null' || dateString === 'undefined') {
    return '날짜 없음';
  }

  try {
    let date;

    // 배열 형태의 날짜 처리 [year, month, day, hour, minute, second]
    if (Array.isArray(dateString) && dateString.length >= 3) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
      // JavaScript Date는 월이 0부터 시작하므로 1을 빼야 함
      date = new Date(year, month - 1, day, hour, minute, second);
    }
    // 이미 Date 객체인 경우
    else if (dateString instanceof Date) {
      date = dateString;
    }
    // ISO 문자열이나 타임스탬프인 경우
    else if (typeof dateString === 'string' || typeof dateString === 'number') {
      date = new Date(dateString);
    }
    // 객체 형태인 경우 (예: { $date: "2024-01-01" })
    else if (typeof dateString === 'object' && dateString.$date) {
      date = new Date(dateString.$date);
    } else {
      console.warn('알 수 없는 날짜 형식:', dateString);
      return '날짜 형식 오류';
    }

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('유효하지 않은 날짜:', dateString);
      return '유효하지 않은 날짜';
    }

    // 한국어 형식으로 포맷팅
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('날짜 포맷팅 에러:', error, '원본 데이터:', dateString);
    return '날짜 오류';
  }
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

// 페이지 이동 함수들 - 챗봇 닫기 포함
const navigateToPost = (postId) => {
  console.log('📝 게시물로 이동:', postId);
  removeRouterGuard();
  router.push(`/posts/${postId}`);
  setTimeout(() => {
    emit('close');
  }, 100);
};

const navigateToMore = (url) => {
  if (url) {
    console.log('➡️ 더보기 페이지로 이동:', url);
    removeRouterGuard();
    router.push(url);
    setTimeout(() => {
      emit('close');
    }, 100);
  }
};

const navigateToBoard = (boardId) => {
  console.log('📋 게시판으로 이동:', boardId);
  removeRouterGuard();
  router.push(`/board/${boardId}`);
  setTimeout(() => {
    emit('close');
  }, 100);
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
    console.log('🚀 API 호출 시작:', apiUrl);

    // 먼저 로그인 상태 확인
    if (!isAuthenticated()) {
      console.log('❌ 비로그인 상태');
      return 'LOGIN_REQUIRED';
    }

    let token = getAuthToken();
    if (!token) {
      console.log('❌ 유효한 토큰 없음');
      return 'LOGIN_REQUIRED';
    }

    // 요청 설정
    const 요청설정 = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15000, // 15초 타임아웃
    };

    console.log('📡 요청 헤더 설정 완료');

    let response;
    try {
      response = await axios.get(apiUrl, 요청설정);
      console.log('✅ API 응답 성공:', response.status);
    } catch (error) {
      console.error('❌ API 요청 실패:', error.response?.status);

      if (error.response) {
        const 상태코드 = error.response.status;
        const 에러데이터 = error.response.data;

        console.log('🔍 에러 상세:', 상태코드, 에러데이터);

        switch (상태코드) {
          case 401:
            console.log('🔄 401 에러 - 토큰 갱신 시도');
            const 갱신성공 = await refreshAccessToken();

            if (갱신성공) {
              console.log('🔄 새 토큰으로 재시도');
              token = getAuthToken();
              요청설정.headers.Authorization = `Bearer ${token}`;

              try {
                response = await axios.get(apiUrl, 요청설정);
                console.log('✅ 재시도 성공');
              } catch (재시도에러) {
                console.error('❌ 재시도 실패:', 재시도에러);
                return 'LOGIN_REQUIRED';
              }
            } else {
              console.log('❌ 토큰 갱신 실패');
              return 'LOGIN_REQUIRED';
            }
            break;

          case 403:
            console.log('❌ 403 에러 - 접근 권한 없음');
            // HTML 에러 페이지 확인
            if (
              typeof 에러데이터 === 'string' &&
              에러데이터.includes('Access Denied')
            ) {
              console.log('🚫 서버에서 접근 거부됨');
              return 'PERMISSION_DENIED';
            }
            return 'PERMISSION_DENIED';

          case 404:
            console.log('❌ 404 에러 - 페이지 없음');
            return 'NOT_FOUND';

          case 500:
            console.log('❌ 500 에러 - 서버 오류');
            return 'SERVER_ERROR';

          default:
            console.log(`❌ ${상태코드} 에러`);
            return 'API_ERROR';
        }
      } else if (error.request) {
        console.error('❌ 네트워크 연결 오류');
        return 'NETWORK_ERROR';
      } else {
        console.error('❌ 알 수 없는 오류:', error.message);
        return 'UNKNOWN_ERROR';
      }
    }

    // 응답 데이터 처리
    if (response && response.data) {
      console.log('📊 응답 데이터 구조 분석 중...');

      let 데이터 = response.data;

      // 응답 데이터가 header.body 구조인지 확인
      if (response.data.header && response.data.body) {
        console.log('📊 Header-Body 구조 감지됨');
        데이터 = response.data.body.data || response.data.body;
      }
      // 다양한 응답 구조 처리
      else if (데이터.data) {
        데이터 = 데이터.data;
      } else if (데이터.content) {
        데이터 = 데이터.content;
      } else if (데이터.result) {
        데이터 = 데이터.result;
      } else if (데이터.items) {
        데이터 = 데이터.items;
      }

      // 배열이 아닌 경우 배열로 변환
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

      console.log(
        '✅ 데이터 처리 완료:',
        Array.isArray(데이터) ? `${데이터.length}개 항목` : '단일 객체'
      );
      return 데이터 || [];
    }

    console.log('⚠️ 응답 데이터가 비어있음');
    return [];
  } catch (error) {
    console.error('❌ fetchApiData 전체 에러:', error);
    return 'UNKNOWN_ERROR';
  }
};

// 토큰 갱신 함수
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken || refreshToken === 'null') {
    console.log('❌ 리프레시 토큰 없음');
    clearAllTokens();
    return false;
  }

  try {
    console.log('🔄 토큰 갱신 요청 중...');

    const response = await axios.post(
      '/api/auth/refresh',
      {
        refreshToken: refreshToken,
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200 && response.data?.accessToken) {
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);

      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      console.log('✅ 토큰 갱신 성공');
      return true;
    }

    console.log('❌ 유효하지 않은 갱신 응답');
    clearAllTokens();
    return false;
  } catch (error) {
    console.error('❌ 토큰 갱신 실패:', error.response?.status);

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('❌ 리프레시 토큰도 만료됨');
      clearAllTokens();
    }

    return false;
  }
};

const handleServiceAction = async (service) => {
  showServiceButtons.value = false;
  showQuickReplies.value = false;
  showServiceMenu.value = false;

  addMessage(service.text, 'user');
  isTyping.value = true;

  try {
    // 로그인 필요 서비스 체크
    if (service.requireAuth && !isAuthenticated()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '🔐 로그인이 필요한 기능입니다. 로그인 후 이용해주세요!',
        'bot'
      );
      return;
    }

    // API 없는 서비스들 처리
    if (service.action === 'wmtiTypes') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      isTyping.value = false;
      addMessage('', 'bot', 'wmti', wmtiTypes, 'WMTI 투자 성향 유형');
      return;
    }

    // 기타 서비스들...
    if (service.action === 'survey') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '📝 설문조사 기능은 준비 중입니다. 곧 이용 가능할 예정이에요!',
        'bot'
      );
      return;
    }

    if (service.action === 'productCompare') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '⚖️ 비교하고 싶은 금융상품들을 입력해주세요.\n예: "ISA 계좌와 IRP 비교"',
        'bot'
      );
      return;
    }

    if (service.action === 'productSummary') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      isTyping.value = false;
      addMessage(
        '📊 요약을 원하는 금융상품 이름을 입력해주세요.\n예: "청년희망적금 요약"',
        'bot'
      );
      return;
    }

    // API 호출이 필요한 서비스들
    if (service.apiUrl) {
      try {
        const 데이터 = await fetchApiData(service.apiUrl);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        isTyping.value = false;

        // 에러 케이스별 메시지 처리
        switch (데이터) {
          case 'LOGIN_REQUIRED':
            addMessage('🔐 토큰이 만료되었습니다. 다시 로그인해주세요.', 'bot');
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

        // 정상 데이터 처리
        if (Array.isArray(데이터) && 데이터.length > 0) {
          // 데이터 구조 로깅 (디버깅용)
          console.log('📊 받은 데이터 샘플:', 데이터[0]);

          let 제목, 더보기URL;

          // 액션별 제목과 URL 설정
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
              // 댓글은 다른 contentType 사용
              addMessage('', 'bot', 'comments', 데이터, 제목, 더보기URL);
              return;
          }

          // 댓글이 아닌 경우에만 posts contentType 사용
          if (service.action !== 'myComments') {
            addMessage('', 'bot', 'posts', 데이터, 제목, 더보기URL);
          }
        } else {
          // 데이터가 없을 때
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

// GPT 메시지 전송 (이 함수는 원본에 없었지만 sendMessage에서 사용되므로 추가)
const sendMessageToGPT = async (message) => {
  // 여기에 실제 GPT API 호출 로직을 구현하거나
  // 임시로 간단한 응답을 반환
  return `"${message}"에 대한 답변입니다. 더 자세한 정보가 필요하시면 말씀해주세요!`;
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
  console.log('🚀 ChatWindow 마운트됨');
  console.log('🔧 axios 인터셉터 설정 시작');
  setupAxiosInterceptors();
  console.log('✅ axios 인터셉터 설정 완료');

  // 라우터 가드 설정
  console.log('🛡️ 라우터 가드 설정 시작');
  setupRouterGuard();
  console.log('✅ 라우터 가드 설정 완료');

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
  console.log('🔄 ChatWindow 언마운트됨');
  await endChatSession();
  removeRouterGuard(); // 라우터 가드 제거
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

/* 콘텐츠 공통 스타일 */
.content-title {
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: var(--color-main);
  font-size: 0.9rem;
}

.posts-content,
.comments-content,
.wmti-content,
.boards-content,
.finance-content {
  width: 100%;
}

.posts-list,
.comments-list,
.boards-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

/* 공통 아이템 스타일 */
.post-item,
.comment-item,
.board-item {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-light);
}

.post-item:hover,
.comment-item:hover,
.board-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 게시글과 댓글 공통 스타일 */
.post-info,
.comment-info {
  display: flex;
  flex-direction: column;
}

.post-info h4,
.comment-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;
}

.post-meta,
.comment-meta {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-sub);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.like-count {
  color: #e91e63;
  font-weight: 500;
}

/* 배지 스타일 */
.anonymous-badge {
  background: rgba(156, 163, 175, 0.2);
  color: #6b7280;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 500;
}

.reply-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 500;
}

/* 게시판 스타일 */
.board-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.board-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
}

.board-desc {
  margin: 0 0 0.25rem 0;
  font-size: 0.8rem;
  color: var(--color-sub);
  line-height: 1.3;
}

.board-meta {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-main);
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

.service-menu-toggle {
  padding: 0 1rem;
  margin-bottom: 0.5rem;
}

.service-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-bg-light);
  border: 2px solid var(--color-light);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-main);
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.service-menu-btn:hover,
.service-menu-btn.active {
  background: var(--color-main);
  color: var(--color-white);
  border-color: var(--color-main);
}

.service-menu-btn svg {
  flex-shrink: 0;
}

/* 컴팩트 서비스 버튼들 */
.compact-service-buttons {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid var(--color-bg-light);
  background: rgba(45, 51, 107, 0.02);
  margin-bottom: 0.5rem;
}

.compact-button-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-top: 1rem;
}

.compact-service-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 0.4rem;
  background: var(--color-white);
  border: 2px solid var(--color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
}

.compact-service-btn:hover {
  background: var(--color-main);
  color: var(--color-white);
  border-color: var(--color-main);
  transform: translateY(-1px);
}

.compact-service-icon {
  font-size: 1.1rem;
}

.compact-service-text {
  text-align: center;
  line-height: 1.2;
  font-weight: 500;
}

/* 컴팩트 로그인 안내 */
.compact-login-guide {
  background: rgba(45, 51, 107, 0.05);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(45, 51, 107, 0.1);
  text-align: center;
}

.compact-login-guide p {
  margin: 0 0 0.75rem 0;
  font-size: 0.8rem;
  color: var(--color-text);
}

.compact-login-btn {
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
}

.compact-login-btn:hover {
  background: var(--color-sub);
  transform: translateY(-1px);
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
  .comments-list,
  .boards-list {
    gap: 0.75rem;
  }

  .post-item,
  .comment-item,
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

  .compact-button-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }

  .compact-service-btn {
    padding: 0.5rem 0.3rem;
    font-size: 0.7rem;
  }

  .compact-service-icon {
    font-size: 1rem;
  }

  .service-menu-btn {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
  }
}
</style>
