import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@/util/guard';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  /* 라우팅 테이블 */
  routes: [
    // 홈
    {
      path: '/',
      name: 'Home',
      component: () => import('../pages/Home/Home.vue'),
    }, // 메인 홈 페이지

    // 인증/로그인 관련 라우트
    {
      path: '/login',
      component: () => import('../pages/login/LoginLayout.vue'), // // 로그인/회원가입/아이디/비번 찾기 공통 레이아웃
      meta: { guestOnly: true },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('../pages/login/LoginForm.vue'),
        }, // 로그인
        {
          path: 'signup',
          name: 'signup',
          component: () => import('../pages/login/SignUpForm.vue'),
        }, // 회원가입
        {
          path: 'find-id',
          name: 'findId',
          component: () => import('../pages/login/FindIdForm.vue'),
        }, // 아이디 찾기
        {
          path: 'find-password',
          name: 'findPassword',
          component: () => import('../pages/login/FindPasswordForm.vue'),
        }, // 비밀번호 찾기
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
      // component: () => import('../pages/mypage/MypageLayout.vue'), // 마이페이지 공통 레이아웃
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
        }, // 즐겨찾기

        {
          path: 'recent-view',
          name: 'RecentView',
          component: () => import('../pages/mypage/RecentView.vue'),
        }, // 최근 본 상품
        {
          path: 'portfolio',
          name: 'Portfolio',
          component: () => import('../pages/mypage/Portfolio.vue'),
        }, // 포트폴리오
        {
          path: 'wmti-history',
          name: 'WMTIHistory',
          component: () => import('../pages/mypage/WMTIHistory.vue'),
        }, // WMTI 히스토리

        // 커뮤니티 활동
        {
          path: 'my-posts',
          name: 'MyPosts',
          component: () => import('../pages/mypage/MyPosts.vue'),
        }, // 내 게시글
        {
          path: 'my-comments',
          name: 'MyComments',
          component: () => import('../pages/mypage/MyComments.vue'),
        }, // 내 댓글
        {
          path: 'my-scrap',
          name: 'MyScrap',
          component: () => import('../pages/mypage/MyScrap.vue'),
        }, // 내 스크랩
        {
          path: 'my-likes',
          name: 'MyLikes',
          component: () => import('../pages/mypage/MyLikes.vue'),
        }, // 내 좋아요

        // 계정 관리
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
        //회원탈퇴
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
      component: () => import('../layouts/ProductsLayout.vue'), // 공통 레이아웃
      children: [
        {
          path: 'deposit',
          name: 'ProductDeposit',
          component: () => import('../pages/products/ProductDeposit.vue'),
        }, // 예금
        {
          path: 'savings',
          name: 'ProductSavings',
          component: () => import('../pages/products/ProductSavings.vue'),
        }, // 적금
        {
          path: 'pension',
          name: 'ProductPension',
          component: () => import('../pages/products/ProductPension.vue'),
        }, // 연금
        //{ path: 'fund', name: 'ProductFund', component: () => import('../pages/products/ProductFund.vue')}, // 펀드q
        //{ path: 'loan', name: 'ProductLoan', component: () => import('../pages/products/ProductLoan.vue')}, // 대출
        //{ path: 'insurance', name: 'ProductInsurance', component: () => import('../pages/products/ProductInsurance.vue')}, // 보험
        {
          path: ':category/:id',
          name: 'ProductDetail',
          component: () => import('../pages/products/ProductDetail.vue'),
        }, // 상세보기
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
      component: () => import('../layouts/WMTILayout.vue'), // 선택
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
        // 기본 성향 검사
        {
          path: 'survey',
          name: 'SurveyPage',
          component: () => import('../pages/wmti/SurveyPage.vue'),
          meta: { requiresAuth: true },
        }, // WMTI 성향 검사지
        {
          path: 'result',
          name: 'SurveyResult',
          component: () => import('../pages/wmti/SurveyResult.vue'),
          meta: { requiresAuth: true },
        }, // WMTI 성향 결과지
        {
          path: 'collection',
          name: 'WMTICollection',
          component: () => import('../pages/wmti/WMTICollection.vue'),
        }, // WMTI 컬렉션(16종 코드모아보기)
      ],
    },

    // 커뮤니티
    {
      path: '/community',
      component: () => import('../layouts/CommunityLayout.vue'), // 레이아웃 컴포넌트
      children: [
        {
          path: '',
          name: 'CommunityList',
          component: () => import('../pages/community/CommunityList.vue'),
        }, // 게시글 목록
        {
          path: 'write',
          name: 'CommunityWrite',
          component: () => import('../pages/community/CommunityWrite.vue'),
          meta: { requiresAuth: true },
        }, // 게시글 작성
        {
          path: ':id',
          name: 'CommunityDetail',
          component: () => import('../pages/community/CommunityDetail.vue'),
        }, // 게시글 상세
        {
          path: ':id/edit',
          name: 'CommunityEdit',
          component: () => import('../pages/community/CommunityEdit.vue'),
          meta: { requiresAuth: true },
        }, // 게시글 수정
      ],
    },

    /* 404 not found 페이지 */
    {
      path: '/:paths(.*)*',
      name: 'notFound',
      component: () => import('../pages/NotFound/NotFound.vue'), // NotFound 컴포넌트
    },
  ],
});

// 인증 가드 적용
router.beforeEach(authGuard);

export default router;
