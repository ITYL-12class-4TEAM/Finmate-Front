import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  /* 라우팅 테이블 */
  routes: [
    // 홈
    {
      path: "/",
      name: "Home",
      component: () => import("../pages/Home/Home.vue"),
    }, // 메인 홈 페이지

    // 인증/로그인 관련 라우트
    {
      path: "/login",
      component: () => import("../pages/login/LoginLayout.vue"), // // 로그인/회원가입/아이디/비번 찾기 공통 레이아웃

      // 로그인 화면에 컴포넌트만 변경해서 사용할거면 알아서 수정해도 됨.
      children: [
        {
          path: "",
          name: "login",
          component: () => import("../pages/login/LoginForm.vue"),
        }, // 로그인
        //{ path: 'signup', name: 'signup', component: Signup }, // 회원가입
        //{ path: 'find-id', name: 'forgot', component: FindId }, // 아이디 찾기
        //{ path: 'find-password', name: 'reset', component: FindPassword }, // 비밀번호 찾기
      ],
    },

    // 마이페이지
    {
      path: "/mypage",
      name: "MyPage",
      component: () => import("../pages/mypage/MyPage.vue"), // 마이페이지 공통 레이아웃

      children: [
        // 마이페이지 화면에 컴포넌트만 변경해서 사용할거면 알아서 수정해도 됨.
        {
          path: "",
          name: "Favorites",
          component: () => import("../pages/mypage/Favorites.vue"),
        }, // 즐겨찾기
        /*
        { path: 'recent-view', name: 'RecentView', component: () => import('../pages/mypage/RecentView.vue') }, // 최근 본 상품
        { path: 'portfolio', name: 'Portfolio', component: () => import('../pages/mypage/Portfolio.vue') }, // 포트폴리오
        
        // 금융 성향 검사 결과
        { path: 'wmti-result', name: 'WMTIResult', component: () => import('../pages/mypage/WMTIResult.vue') }, // WMTI 결과
        { path: 'wmti-history', name: 'WMTIHistory', component: () => import('../pages/mypage/WMTIHistory.vue') }, // WMTI 히스토리
        
        // 커뮤니티 활동
        { path: 'my-posts', name: 'MyPosts', component: () => import('../pages/mypage/MyPosts.vue') }, // 내 게시글
        { path: 'my-comments', name: 'MyComments', component: () => import('../pages/mypage/MyComments.vue') }, // 내 댓글
        { path: 'my-scrap', name: 'MyScrap', component: () => import('../pages/mypage/MyScrap.vue') }, // 내 스크랩
        { path: 'my-favorites', name: 'MyFavorites', component: () => import('../pages/mypage/MyFavorites.vue') }, // 내 즐겨찾기
        
        // 계정 관리
        { path: 'settings', name: 'settings', component: () => import('../pages/mypage/Account.vue') }, // 계정 설정
        { path: 'settings/edit', name: 'settings', component: () => import('../pages/mypage/AccountEdit.vue') }, // 계정 설정 수정
        { path: 'account/verify', name: 'AccountVerify', component: () => import('../pages/mypage/AccountVerify.vue') }, // 계정 인증
        { path: 'account/delete', name: 'AccountDelete', component: () => import('../pages/mypage/AccountDelete.vue') }, // 계정 삭제
      */
      ],
    },

    // 상품 목록
    {
      path: "/products",
      name: "Products",
      component: () => import("../pages/products/ProductsLayout.vue"), // 공통 레이아웃
      children: [
        {
          path: "deposit",
          name: "ProductDeposit",
          component: () => import("../pages/products/ProductDeposit.vue"),
        }, // 예금
        {
          path: "pension",
          name: "ProductPension",
          component: () => import("../pages/products/ProductPension.vue"),
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
      path: "/wmti",
      name: "WMTI",
      component: () => import("../layouts/WMTILayout.vue"), // 선택
      children: [
        {
          path: "basic",
          name: "BasicSurvey",
          component: () => import("../pages/wmti/BasicSurvey.vue"),
        },
        {
          path: "preinfo",
          name: "PreInfoForm",
          component: () => import("../pages/wmti/PreInfoForm.vue"),
        }, 
        // 기본 성향 검사
        { path: 'survey', name: 'SurveyPage', component: () => import('../pages/wmti/SurveyPage.vue')}, // WMTI 성향 검사
        //{ path: 'result', name: 'WMTIResult', component: () => import('../pages/Wmti/WMTIResult.vue')}, // WMTI 결과
        //{ path: 'collection', name: 'WMTICollection', component: () => import('../pages/Wmti/WMTICollection.vue')}, // WMTI 컬렉션
      ],
    },

    // 커뮤니티
    {
      path: "/community",
      name: "Community",
      component: () => import("../pages/community/CommunityLayout.vue"),
      children: [
        /*
        {
          path: 'new',
          name: 'CommunityNewPost',
          component: () => import('../pages/community/CommunityNewPost.vue'),
        }, // 새 게시글
        {
          path: ':id',
          name: 'CommunityPost',
          component: () => import('../pages/community/CommunityPost.vue'),
        }, // 게시글
        {
          path: ':id/edit',
          name: 'CommunityEdit',
          component: () => import('../pages/community/CommunityEdit.vue'),
        }, // 게시글 수정
        */
      ],
    },
    // { path: '/missions', name: 'Missions', component: () => import('../pages/Missions.vue') }, // 미션
    // { path: '/chatbot', name: 'Chatbot', component: () => import('../pages/Chatbot.vue') }, // 챗봇
    // { path: '/terms', name: 'Terms', component: () => import('../pages/Terms.vue') }, // 이용약관
    // { path: '/privacy', name: 'Privacy', component: () => import('../pages/Privacy.vue') }, // 개인정보 처리방침

    /* 404 not found 페이지 */
    {
      path: "/:paths(.*)*",
      name: "notFound",
      component: () => import("../pages/NotFound/NotFound.vue"), // NotFound 컴포넌트
    },
  ],
});

export default router;
