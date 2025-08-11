<template>
  <div class="mypage-container">
    <!-- 모바일 헤더 -->
    <div class="mobile-header" :class="{ scrolled: isScrolled, 'menu-open': showMobileMenu }">
      <i class="fas" :class="showMobileMenu ? 'fa-times' : 'fa-bars'" @click="toggleMobileMenu"></i>
      <span class="header-title">{{ headerTitle }}</span>
    </div>

    <!-- 모바일 오버레이 -->
    <div v-show="showMobileMenu" class="mobile-overlay" @click="closeMobileMenu"></div>

    <div class="main-layout">
      <!-- 사이드바 -->
      <aside class="sidebar" :class="{ 'mobile-open': showMobileMenu }">
        <nav class="nav-menu">
          <!-- 개인 정보 -->
          <div class="menu-section">
            <h3 class="section-title">개인 정보</h3>
            <div class="menu-items">
              <router-link
                to="/mypage/favorites"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-star"></i>
                </div>
                <span class="menu-text">즐겨찾기</span>
              </router-link>

              <router-link
                to="/mypage/recent-view"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-clock-rotate-left"></i>
                </div>
                <span class="menu-text">최근 본 상품</span>
              </router-link>

              <router-link
                to="/mypage/portfolio"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-briefcase"></i>
                </div>
                <span class="menu-text">포트폴리오</span>
              </router-link>
            </div>
          </div>

          <!-- 금융 성향 검사 -->
          <div class="menu-section">
            <h3 class="section-title">금융 성향 검사</h3>
            <div class="menu-items">
              <router-link
                to="/wmti/result"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-chart-bar"></i>
                </div>
                <div class="menu-content">
                  <span class="menu-text">WMTI 결과</span>
                  <span class="menu-desc">나의 투자 성향 확인</span>
                </div>
              </router-link>

              <router-link
                to="/mypage/wmti-history"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-list"></i>
                </div>
                <div class="menu-content">
                  <span class="menu-text">검사 히스토리</span>
                  <span class="menu-desc">과거 검사 결과 보기</span>
                </div>
              </router-link>
            </div>
          </div>

          <!-- 커뮤니티 활동 -->
          <div class="menu-section">
            <h3 class="section-title">커뮤니티 활동</h3>
            <div class="menu-items">
              <router-link
                to="/mypage/my-posts"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-file-text"></i>
                </div>
                <span class="menu-text">내 게시글</span>
              </router-link>

              <router-link
                to="/mypage/my-comments"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-comments"></i>
                </div>
                <span class="menu-text">내 댓글</span>
              </router-link>

              <router-link
                to="/mypage/my-scrap"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-bookmark"></i>
                </div>
                <span class="menu-text">내 스크랩</span>
              </router-link>

              <router-link
                to="/mypage/my-likes"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-heart"></i>
                </div>
                <span class="menu-text">내 좋아요</span>
              </router-link>
            </div>
          </div>

          <!-- 계정 관리 -->
          <div class="menu-section">
            <h3 class="section-title">계정 관리</h3>
            <div class="menu-items">
              <router-link
                to="/mypage/settings"
                class="menu-item"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-cog"></i>
                </div>
                <span class="menu-text">계정 설정</span>
              </router-link>

              <router-link
                to="/mypage/settings/delete"
                class="menu-item danger"
                exact-active-class="active"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-trash"></i>
                </div>
                <span class="menu-text">회원탈퇴</span>
              </router-link>

              <a
                href="https://forms.gle/oSzxFfE3kkFzrXw86"
                target="_blank"
                class="menu-item external"
                @click="closeMobileMenu"
              >
                <div class="menu-icon">
                  <i class="fas fa-headset"></i>
                </div>
                <span class="menu-text">고객의 소리</span>
                <i class="fas fa-external-link"></i>
              </a>
            </div>
          </div>
        </nav>
      </aside>

      <!-- 콘텐츠 영역 -->
      <main
        class="content"
        :class="{ 'menu-active': showMobileMenu, 'menu-closed': !showMobileMenu }"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const showMobileMenu = ref(false);
const isScrolled = ref(false);

const route = useRoute();
const headerTitle = computed(() => {
  const path = route.path;
  const map = {
    '/mypage/favorites': '즐겨찾기',
    '/mypage/recent-view': '최근 본 상품',
    '/mypage/portfolio': '포트폴리오',
    '/mypage/wmti-result': 'WMTI 결과',
    '/mypage/wmti-history': '검사 히스토리',
    '/mypage/my-posts': '내 게시글',
    '/mypage/my-comments': '내 댓글',
    '/mypage/my-scrap': '내 스크랩',
    '/mypage/my-likes': '내 좋아요',
    '/mypage/settings': '계정 설정',
    '/mypage/settings/delete': '회원탈퇴',
  };
  return map[path] || '마이페이지';
});

let scrollPosition = 0;

const toggleMobileMenu = () => {
  if (!showMobileMenu.value) {
    // 열 때
    scrollPosition = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
  } else {
    // 닫을 때
    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, scrollPosition);
  }
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, scrollPosition);
  showMobileMenu.value = false;
};

// 스크롤 감지
const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* 기본 가로스크롤 방지 */
* {
  box-sizing: border-box;
}

/* 전체 컨테이너 */
.mypage-container {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* 모바일 헤더 - sticky로 자연스러운 동작 */
.mobile-header {
  position: fixed;
  top: 3.5rem; /* 스크롤시 상단에 고정 */
  left: 0;
  width: 100%;
  max-width: 100vw;
  height: 3.5rem;
  background: var(--color-white);
  color: #191f28;
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  z-index: 1000;
  border-bottom: 1px solid #e5e8eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin-top: 0; /* 네비바와 붙어있게 */
  transition: top 0.3s ease;
}
.mobile-header.scrolled {
  top: 0; /* 스크롤 시 화면 맨 위 고정 */
}
.mobile-header i:first-child {
  font-size: 1.125rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.mobile-header i:first-child:hover {
  background: #f9fafb;
  color: var(--color-sub);
}
.mobile-header.menu-open {
  top: 0 !important; /* 사이드바 열렸을 때 최우선으로 상단 고정 */
  z-index: 1100; /* 사이드바(850)보다 위 */
  background: var(--color-white);
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-weight: 700;
  color: #191f28;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

/* 모바일 오버레이 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 800;
  display: none;
}

/* 메인 레이아웃 */
.main-layout {
  display: flex;
  min-height: 100vh;
  padding-top: 0rem;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* 사이드바 - 웹 버전 */
.sidebar {
  width: 280px;
  background: var(--color-white);
  border-right: 1px solid #e5e8eb;
  padding: 2rem 0;
  position: fixed;
  left: 0;
  top: 4rem;
  height: calc(100vh - 4rem);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  box-sizing: border-box;
}

.nav-menu {
  padding: 0 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.menu-section {
  margin-bottom: 2rem;
  width: 100%;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 메뉴 아이템들 */
.menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  text-decoration: none;
  color: #374151;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.8125rem;
  font-weight: 500;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
}

.menu-item:hover {
  background: #f3f4f6;
  color: var(--color-sub);
}

.menu-item.active {
  background: var(--color-sub);
  color: white;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--color-sub);
  border-radius: 0 2px 2px 0;
}

.menu-icon {
  width: 1.125rem;
  height: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon i {
  font-size: 0.875rem;
  color: inherit;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.menu-text {
  font-size: 0.8125rem;
  font-weight: 500;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-desc {
  font-size: 0.6875rem;
  color: #9ca3af;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-item.active .menu-desc {
  color: rgba(255, 255, 255, 0.8);
}

.menu-item > i:last-child {
  font-size: 0.6875rem;
  color: #9ca3af;
  margin-left: auto;
  flex-shrink: 0;
}

.menu-item.active > i:last-child {
  color: rgba(255, 255, 255, 0.8);
}

/* 위험한 액션 */
.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.menu-item.danger.active {
  background: #ef4444;
  color: white;
}

/* 콘텐츠 영역 */
.content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  /* background: #fafafa; */
  min-height: calc(100vh - 4rem);
  width: calc(100% - 280px);
  box-sizing: border-box;
  overflow-x: hidden;
}

/* 태블릿 */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .content {
    margin-left: 240px;
    width: calc(100% - 240px);
    padding: 1.5rem;
  }

  .nav-menu {
    padding: 0 1rem;
  }

  .menu-item {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .menu-icon {
    width: 1rem;
    height: 1rem;
  }

  .menu-icon i {
    font-size: 0.75rem;
  }

  .menu-text {
    font-size: 0.75rem;
  }

  .menu-desc {
    font-size: 0.625rem;
  }
}

/* 모바일 */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
    padding: 0 1rem;
  }

  .mobile-header i:first-child {
    font-size: 1.25rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0.75rem;
    margin: -0.75rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
  }

  .header-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-weight: 700;
    color: #191f28;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60%;
  }

  .mobile-overlay {
    display: block;
  }

  .main-layout {
    padding-top: 0rem; /* 네비바만큼만 */
    width: 100%;
    max-width: 100vw;
  }

  .sidebar {
    position: fixed;
    top: 3.5rem; /* 네비바 + 모바일 헤더 아래에 위치 */
    left: 0;
    width: 100%;
    max-width: 100vw;
    height: calc(100vh - 3.5rem);
    background: var(--color-white);
    padding: 2rem 0 1.5rem 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 850;
    border-right: none;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .nav-menu {
    padding: 0 1.5rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .menu-section {
    margin-bottom: 2.5rem;
    width: 100%;
    overflow-x: hidden;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .menu-items {
    gap: 0.5rem;
    width: 100%;
    overflow-x: hidden;
  }

  .nav-menu {
    padding: 0 1rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .menu-section {
    margin-bottom: 2.5rem;
    width: 100%;
    overflow-x: hidden;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
  }

  .menu-items {
    gap: 0.75rem;
    width: 100%;
    overflow-x: hidden;
  }

  .menu-item {
    padding: 1.25rem 1rem;
    font-size: 1rem;
    background: #f8f9fa;
    border-radius: 0.75rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .menu-item:hover {
    background: #f1f3f4;
    transform: none;
  }

  .menu-item.active {
    background: var(--color-sub);
    box-shadow: 0 2px 8px rgba(var(--color-sub-rgb), 0.3);
  }

  .menu-item.active::before {
    display: none;
  }

  .menu-icon {
    width: 1.75rem;
    height: 1.75rem;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-icon i {
    font-size: 1.25rem;
  }

  .menu-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    width: 100%;
  }

  .menu-text {
    font-size: 1.125rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .menu-desc {
    font-size: 0.9375rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  /* 단일 텍스트만 있는 메뉴 아이템의 경우 */
  .menu-item > .menu-text {
    flex: 1;
    font-size: 1.125rem;
    font-weight: 600;
    width: 100%;
  }

  .menu-item > i:last-child {
    font-size: 0.875rem;
    color: #9ca3af;
    margin-left: 0.5rem;
    flex-shrink: 0;
  }

  .menu-item.active > i:last-child {
    color: rgba(255, 255, 255, 0.8);
  }

  .content {
    margin-left: 0;
    width: 100%;
    max-width: 100vw;
    padding: 1rem;
    padding-top: 1rem;
    background: var(--color-white);
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .content.menu-active {
    filter: blur(2px);
    pointer-events: none;
  }
}

/* 작은 모바일 */
@media (max-width: 430px) {
  .nav-menu {
    padding: 0 0.75rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  .menu-item {
    padding: 1.125rem 0.875rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
    font-size: 1rem;
  }

  .menu-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .menu-icon i {
    font-size: 1.125rem;
  }

  .menu-text {
    font-size: 1rem;
    font-weight: 600;
  }

  .menu-desc {
    font-size: 0.875rem;
  }

  .content {
    padding: 0.75rem;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .header-title {
    max-width: 50%;
  }
  /* 기본: 사이드바 닫힘 상태 */
  .content.menu-closed {
    margin-left: 0;
    width: 100%;
  }

  /* 사이드바 열림 상태 (데스크탑 기준) */
  @media (min-width: 1025px) {
    .content.menu-active {
      margin-left: 280px;
      width: calc(100% - 280px);
    }
  }

  /* 태블릿 사이즈에서 열림 상태 */
  @media (max-width: 1024px) and (min-width: 769px) {
    .content.menu-active {
      margin-left: 240px;
      width: calc(100% - 240px);
    }
  }

  /* 모바일은 기존대로 오버레이 + blur 처리 */
  @media (max-width: 768px) {
    .content.menu-active {
      filter: blur(2px);
      pointer-events: none;
    }
  }
}
</style>
