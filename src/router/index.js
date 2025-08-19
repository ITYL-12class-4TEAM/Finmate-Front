import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@/util/guard';
import { useAuthStore } from '@/stores/useAuthStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  /* 라우팅 테이블 */
  routes: [
    // 홈
    {
      path: '/',
      name: 'Home',
      component: () => import('../pages/Home/Home.vue'),
    },

    // 인증/로그인 관련 라우트
    {
      path: '/login',
      component: () => import('../pages/login/LoginLayout.vue'),
      meta: { guestOnly: true },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('../pages/login/LoginForm.vue'),
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('../pages/login/SignUpForm.vue'),
          alias: '/signup',
        },
        {
          path: 'find-id',
          name: 'findId',
          component: () => import('../pages/login/FindIdForm.vue'),
        },
        {
          path: 'find-password',
          name: 'findPassword',
          component: () => import('../pages/login/FindPasswordForm.vue'),
        },
      ],
    },

    // OAuth2 리다이렉트 처리
    {
      path: '/auth/oauth2/redirect',
      name: 'OAuth2Redirect',
      component: () => import('../pages/auth/OAuth2Redirect.vue'),
    },

    // 마이페이지
    {
      path: '/mypage',
      name: 'MyPage',
      component: () => import('../layouts/MyPageLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'ShowMyPage',
          component: () => import('../pages/mypage/MyPage.vue'),
        },
        {
          path: 'favorites',
          name: 'Favorites',
          component: () => import('../pages/mypage/Favorites.vue'),
        },
        {
          path: 'recent-view',
          name: 'RecentView',
          component: () => import('../pages/mypage/RecentView.vue'),
        },
        {
          path: 'portfolio',
          name: 'Portfolio',
          component: () => import('../pages/mypage/Portfolio.vue'),
        },
        {
          path: 'wmti-history',
          name: 'WMTIHistory',
          component: () => import('../pages/mypage/WMTIHistory.vue'),
        },
        {
          path: 'my-posts',
          name: 'MyPosts',
          component: () => import('../pages/mypage/MyPosts.vue'),
        },
        {
          path: 'my-comments',
          name: 'MyComments',
          component: () => import('../pages/mypage/MyComments.vue'),
        },
        {
          path: 'my-scrap',
          name: 'MyScrap',
          component: () => import('../pages/mypage/MyScrap.vue'),
        },
        {
          path: 'my-likes',
          name: 'MyLikes',
          component: () => import('../pages/mypage/MyLikes.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../pages/mypage/Account.vue'),
        },
        {
          path: 'settings/edit',
          name: 'settingsEdit',
          component: () => import('../pages/mypage/AccountEdit.vue'),
        },
        {
          path: 'settings/delete',
          name: 'settingsDelete',
          component: () => import('../pages/mypage/AccountDelete.vue'),
        },
      ],
    },

    // 상품 목록
    {
      path: '/products',
      name: 'Products',
      component: () => import('../layouts/ProductsLayout.vue'),
      children: [
        {
          path: 'deposit',
          name: 'ProductDeposit',
          component: () => import('../pages/products/ProductDeposit.vue'),
        },
        {
          path: 'savings',
          name: 'ProductSavings',
          component: () => import('../pages/products/ProductSavings.vue'),
        },
        {
          path: 'pension',
          name: 'ProductPension',
          component: () => import('../pages/products/ProductPension.vue'),
        },
        {
          path: ':category/:id',
          name: 'ProductDetail',
          component: () => import('../pages/products/ProductDetail.vue'),
        },
        {
          path: 'compare',
          name: 'ProductCompare',
          component: () => import('../pages/products/ProductCompare.vue'),
        },
      ],
    },

    // 금융 성향 검사
    {
      path: '/wmti',
      name: 'WMTI',
      component: () => import('../layouts/WMTILayout.vue'),
      children: [
        {
          path: 'basic',
          name: 'BasicSurvey',
          component: () => import('../pages/wmti/BasicSurvey.vue'),
        },
        {
          path: 'preinfo',
          name: 'PreInfoForm',
          component: () => import('../pages/wmti/PreInfoForm.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'survey',
          name: 'SurveyPage',
          component: () => import('../pages/wmti/SurveyPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'result',
          name: 'SurveyResult',
          component: () => import('../pages/wmti/SurveyResult.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'collection',
          name: 'WMTICollection',
          component: () => import('../pages/wmti/WMTICollection.vue'),
        },
      ],
    },

    // 커뮤니티
    {
      path: '/community',
      component: () => import('../layouts/CommunityLayout.vue'),
      children: [
        {
          path: '',
          name: 'CommunityList',
          component: () => import('../pages/community/CommunityList.vue'),
        },
        {
          path: 'write',
          name: 'CommunityWrite',
          component: () => import('../pages/community/CommunityWrite.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: ':id',
          name: 'CommunityDetail',
          component: () => import('../pages/community/CommunityDetail.vue'),
        },
        {
          path: ':id/edit',
          name: 'CommunityEdit',
          component: () => import('../pages/community/CommunityEdit.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },

    /* 404 not found 페이지 */
    {
      path: '/:paths(.*)*',
      name: 'notFound',
      component: () => import('../pages/NotFound/NotFound.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { left: 0, top: 0 };
  },
});

// 기존 인증 가드 적용
router.beforeEach(authGuard);

// 추가정보 미입력 사용자 리다이렉트 가드 (강화된 버전)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 추가정보 미입력 회원 체크 및 리다이렉트
  if (authStore.shouldRedirectToSignup(to)) {
    next({
      path: '/login/signup',
      query: {
        socialSignup: 'true',
        name: authStore.user?.username,
        email: authStore.user?.email,
        required: 'true',
        from: to.path, // 원래 가려던 페이지 정보 저장
      },
      replace: true, // 브라우저 히스토리에 남지 않도록 설정
    });
    return;
  }

  next();
});

// 추가: 라우터 변경 후에도 체크 (혹시 놓친 케이스 대응)
router.afterEach((to) => {
  const authStore = useAuthStore();

  // 페이지 이동 후 추가정보 체크
  if (
    authStore.needsAdditionalInfo &&
    !['/login/signup', '/signup', '/auth/oauth2/redirect'].includes(to.path)
  ) {
    // 약간의 지연을 두고 리다이렉트 (컴포넌트 렌더링 완료 후)
    setTimeout(() => {
      authStore.checkAuthStatus();
    }, 100);
  }
});

export default router;
