import { createRouter, createWebHistory } from 'vue-router';

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

      // 로그인 화면에 컴포넌트만 변경해서 사용할거면 알아서 수정해도 됨.
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('../pages/login/LoginForm.vue'),
        }, // 로그인
        //{ path: 'signup', name: 'signup', component: Signup }, // 회원가입
        //{ path: 'find-id', name: 'forgot', component: FindId }, // 아이디 찾기
        //{ path: 'find-password', name: 'reset', component: FindPassword }, // 비밀번호 찾기
      ],
    },

    // 마이페이지
    {
      path: '/mypage',
      name: 'MyPage',
      component: () => import('../pages/mypage/MypageLayout.vue'), // 마이페이지 공통 레이아웃

      children: [
        {
          path: '',
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

        // 금융 성향 검사 결과
        {
          path: 'wmti-result',
          name: 'WMTIResult',
          component: () => import('../pages/mypage/WMTIResult.vue'),
        }, // WMTI 결과
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
      component: () => import('../pages/products/ProductsLayout.vue'), // 공통 레이아웃
      children: [
        {
          path: 'deposit',
          name: 'ProductDeposit',
          component: () => import('../pages/products/ProductDeposit.vue'),
        }, // 예금
        {
          path: 'pension',
          name: 'ProductPension',
          component: () => import('../pages/products/ProductPension.vue'),
        }, // 연금
        //{ path: 'fund', name: 'ProductFund', component: () => import('../pages/products/ProductFund.vue')}, // 펀드
        //{ path: 'loan', name: 'ProductLoan', component: () => import('../pages/products/ProductLoan.vue')}, // 대출
        //{ path: 'insurance', name: 'ProductInsurance', component: () => import('../pages/products/ProductInsurance.vue')}, // 보험
        {
          path: ":category/:id",
          name: "ProductDetail",
          component: () => import("../pages/products/ProductDetail.vue"),
        }, // 상세보기
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
        },
        // 기본 성향 검사
        {
          path: 'survey',
          name: 'SurveyPage',
          component: () => import('../pages/wmti/SurveyPage.vue'),
        }, // WMTI 성향 검사
        //{ path: 'result', name: 'WMTIResult', component: () => import('../pages/Wmti/WMTIResult.vue')}, // WMTI 결과
        //{ path: 'collection', name: 'WMTICollection', component: () => import('../pages/Wmti/WMTICollection.vue')}, // WMTI 컬렉션
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
        },
        {
          path: 'write',
          name: 'CommunityWrite',
          component: () => import('../pages/community/CommunityWrite.vue'),
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
        },
      ],
    },
    // { path: '/missions', name: 'Missions', component: () => import('../pages/Missions.vue') }, // 미션
    // { path: '/chatbot', name: 'Chatbot', component: () => import('../pages/Chatbot.vue') }, // 챗봇
    // { path: '/terms', name: 'Terms', component: () => import('../pages/Terms.vue') }, // 이용약관
    // { path: '/privacy', name: 'Privacy', component: () => import('../pages/Privacy.vue') }, // 개인정보 처리방침

    /* 404 not found 페이지 */
    {
      path: '/:paths(.*)*',
      name: 'notFound',
      component: () => import('../pages/NotFound/NotFound.vue'), // NotFound 컴포넌트
    },
  ],
});

export default router;
