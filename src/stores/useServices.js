// composables/useServices.js
import { reactive, computed } from 'vue';

export function useServices(isAuthenticated) {
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
      return serviceFeatures.filter(service => !service.requireAuth);
    }
  };

  // 회원 전용 기능들 (로그인 안내용)
  const memberOnlyFeatures = computed(() => {
    return serviceFeatures.filter(service => service.requireAuth);
  });

  // 서비스별 표시 정보 반환
  const getServiceDisplayInfo = (action) => {
    const serviceInfo = {
      hotPosts: { 
        제목: '🔥 어제 핫했던 게시물', 
        더보기URL: '/posts?filter=hot', 
        contentType: 'posts' 
      },
      myLikedPosts: { 
        제목: '❤️ 내가 좋아요 한 글', 
        더보기URL: '/mypage/liked', 
        contentType: 'posts' 
      },
      myScrapPosts: { 
        제목: '📌 내가 스크랩한 글', 
        더보기URL: '/mypage/scraps', 
        contentType: 'posts' 
      },
      myPosts: { 
        제목: '✍️ 내가 쓴 글', 
        더보기URL: '/mypage/posts', 
        contentType: 'posts' 
      },
      myComments: { 
        제목: '💬 내가 쓴 댓글', 
        더보기URL: '/mypage/comments', 
        contentType: 'comments' 
      },
    };
    
    return serviceInfo[action] || { 제목: '', 더보기URL: '', contentType: 'posts' };
  };

  // 빈 데이터 메시지 반환
  const getEmptyDataMessage = (action) => {
    const emptyMessages = {
      hotPosts: '🔥 아직 인기 게시물이 없습니다.',
      myLikedPosts: '❤️ 아직 좋아요 한 글이 없습니다.',
      myScrapPosts: '📌 아직 스크랩한 글이 없습니다.',
      myPosts: '✍️ 아직 작성한 글이 없습니다.',
      myComments: '💬 아직 작성한 댓글이 없습니다.',
    };
    
    return emptyMessages[action] || '📝 해당하는 데이터가 없습니다.';
  };

  return {
    serviceFeatures,
    getAvailableServices,
    memberOnlyFeatures,
    getServiceDisplayInfo,
    getEmptyDataMessage
  };
}