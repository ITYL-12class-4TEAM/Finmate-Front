<template>
  <div class="mypage-container">
    <!-- 상단 헤더 메뉴바 -->
    <div
      class="header-bar"
      :style="{
        transform: `translateX(-50%) translateY(${headerTranslateY}px)`,
      }"
      @click="toggleMobileMenu"
    >
      <i class="fa-solid" :class="showMobileMenu ? 'fa-times' : 'fa-bars'"></i>
      <span class="header-title">{{ headerTitle }}</span>
    </div>

    <!-- 오버레이 -->
    <div
      class="mobile-overlay"
      v-show="showMobileMenu"
      @click="closeMobileMenu"
    ></div>

    <div class="main-layout">
      <!-- 드롭다운 사이드바 메뉴 -->
      <aside
        class="sidebar"
        :class="{ 'mobile-open': showMobileMenu }"
        :style="{ top: `${96 + headerTranslateY}px` }"
      >
        <nav class="nav-menu">
          <!-- 개인 정보 -->
          <div class="menu-section">
            <h3 class="section-title">개인 정보</h3>
            <ul class="menu-list">
              <li class="menu-item">
                <router-link
                  to="/mypage"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-star"></i>
                  <span>즐겨찾기</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/recent-view"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-clock-rotate-left"></i>
                  <span>최근 본 상품</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/portfolio"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-briefcase"></i>
                  <span>포트폴리오</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- 금융 성향 검사 -->
          <div class="menu-section">
            <h3 class="section-title">
              <i class="fa-solid fa-chart-line"></i>
              금융 성향 검사
            </h3>
            <ul class="menu-list">
              <li class="menu-item">
                <router-link
                  to="/wmti/result"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-chart-bar"></i>
                  <span>WMTI 결과</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/wmti-history"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-list"></i>
                  <span>검사 히스토리</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- 커뮤니티 활동 -->
          <div class="menu-section">
            <h3 class="section-title">
              <i class="fa-solid fa-users"></i>
              커뮤니티 활동
            </h3>
            <ul class="menu-list">
              <li class="menu-item">
                <router-link
                  to="/mypage/my-posts"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-file-text"></i>
                  <span>내 게시글</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/my-comments"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-comments"></i>
                  <span>내 댓글</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/my-scrap"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-bookmark"></i>
                  <span>내 스크랩</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/my-likes"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-heart"></i>
                  <span>내 좋아요</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- 계정 관리 -->
          <div class="menu-section">
            <h3 class="section-title">
              <i class="fa-solid fa-gear"></i>
              계정 관리
            </h3>
            <ul class="menu-list">
              <li class="menu-item">
                <router-link
                  to="/mypage/settings"
                  class="menu-link"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-cog"></i>
                  <span>계정 설정</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/settings/delete"
                  class="menu-link danger"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-trash"></i>
                  <span>회원탈퇴</span>
                  <i class="fa-solid fa-chevron-right"></i>
                </router-link>
              </li>
              <li class="menu-item">
                <a
                  href="https://forms.gle/oSzxFfE3kkFzrXw86"
                  target="_blank"
                  class="menu-link external"
                  exact-active-class="active"
                  @click="closeMobileMenu"
                >
                  <i class="fa-solid fa-headset"></i>
                  <span>고객의 소리</span>
                  <i class="fa-solid fa-external-link"></i>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- 콘텐츠 영역 -->
      <main class="content" :class="{ 'menu-active': showMobileMenu }">
        <router-view />
      </main>

      <!-- 스크롤 탑 버튼 -->
      <button
        v-show="showScrollTop"
        class="scroll-top-btn"
        @click="scrollToTop"
      >
        <i class="fa-solid fa-chevron-up"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
const showScrollTop = ref(false);
const showMobileMenu = ref(false);
const headerTranslateY = ref(0); // 헤더의 실시간 위치
const lastScrollY = ref(0);

const route = useRoute();
const headerTitle = computed(() => {
  const path = route.path;

  const map = {
    '/mypage': '즐겨찾기',
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

  return map[path] || '마이페이지 메뉴';
});

const handleScroll = () => {
  const currentScrollY = window.scrollY;

  // 스크롤 탑 버튼 표시/숨김
  showScrollTop.value = currentScrollY > 50;

  // 헤더 자연스러운 움직임 로직
  const startHideAt = 0; // 숨기기 시작하는 스크롤 위치
  const headerHeight = 56; // 헤더바 높이 (2.5rem = 40px)

  if (currentScrollY <= startHideAt) {
    // 상단에서는 완전히 표시
    headerTranslateY.value = 0;
  } else {
    // 스크롤 위치에 따라 자연스럽게 위로 이동
    const scrollBeyondStart = currentScrollY - startHideAt;
    const translateValue = Math.min(scrollBeyondStart * 0.8, headerHeight);
    headerTranslateY.value = -translateValue;

    // 70% 이상 숨겨졌을 때 메뉴 닫기
    if (translateValue >= headerHeight * 0.7 && showMobileMenu.value) {
      closeMobileMenu();
    }
  }

  lastScrollY.value = currentScrollY;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  // 메뉴 열릴 때 body 스크롤 방지
  document.body.style.overflow = showMobileMenu.value ? 'hidden' : '';
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  document.body.style.overflow = '';
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  lastScrollY.value = window.scrollY;
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.mypage-container {
  max-width: 430px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
}

/* 상단 헤더바 */
.header-bar {
  position: fixed;
  top: 3.5rem; /* 네비게이션 바 높이만큼 */
  left: 50%;
  /* transform은 Vue에서 동적으로 제어 */
  width: 100%;
  max-width: 26.875rem;
  height: 3rem;
  background: var(--color-sub);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  z-index: 999; /* 드롭다운보다 높게 */
  cursor: pointer;
  transition: box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-bar:hover {
  background: var(--color-sub);
}

.header-bar i:first-child {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.header-bar:hover i:first-child {
  transform: scale(1.1);
}

.header-title {
  flex: 1;
  font-weight: 700;
}

.main-layout {
  display: flex;
  flex-direction: column;
  padding-top: 2rem; /* 네비게이션 바(3.5rem) + 헤더바(2.5rem) */
}

/* 오버레이 */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 800; /* 드롭다운보다 낮게 */
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 드롭다운 사이드바 */
.sidebar {
  position: fixed;
  /* top은 Vue에서 동적으로 제어 (96px = 3.5rem + 2.5rem) */
  left: 50%;
  transform: translateX(-50%) translateY(-100%); /* 완전히 위로 숨김 */
  width: 100%;
  max-width: 26.875rem;
  max-height: calc(100vh - 6rem);
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    var(--color-bg-light) 100%
  );
  padding: 1.5rem 1.25rem 2rem;
  overflow-y: auto;
  transition: transform 0.3s;
  z-index: 950; /* 네비게이션 바보다 낮게 */
  border-radius: 0 0 1rem 1rem;
  box-shadow: 0 8px 25px -5px rgba(45, 51, 107, 0.15);
  backdrop-filter: blur(20px);
}

.sidebar.mobile-open {
  transform: translateX(-50%) translateY(0); /* 헤더바 바로 아래까지만 내려옴 */
}

.nav-menu {
  width: 100%;
}

.menu-section {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(45, 51, 107, 0.05);
  border-radius: 0.5rem;
}

.section-title i {
  font-size: 0.75rem;
  color: var(--color-sub);
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.375rem;
}

.menu-item {
  border-radius: 0.75rem;
  overflow: hidden;
}

.menu-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--color-main);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(185, 187, 204, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.menu-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradiet(transparent, rgba(45, 51, 107, 0.05), transparent);
  transition: left 0.5s ease;
}

.menu-link:hover::before {
  left: 100%;
}

.menu-link:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.4);
  transform: translateY(-1px);
  color: var(--color-main);
}

.menu-link.active {
  background: var(--color-sub);
  color: white;
  border-color: var(--color-main);
}

.menu-link.active:hover {
  background: var(--color-sub);
}

.menu-link.danger {
  color: #dc3545;
}

.menu-link.danger:hover {
  background: rgba(220, 53, 69, 0.05);
  border-color: rgba(220, 53, 69, 0.2);
}

.menu-link.external i:last-child {
  font-size: 0.75rem;
  opacity: 0.7;
}

.menu-link i:first-child {
  width: 1.25rem;
  font-size: 1rem;
  margin-right: 0.75rem;
}

.menu-link i:last-child {
  font-size: 0.875rem;
  color: var(--color-light);
  transition: transform 0.2s ease;
}

.menu-link:hover i:last-child {
  transform: translateX(2px);
  color: var(--color-sub);
}

.menu-link.active i:last-child {
  color: rgba(255, 255, 255, 0.8);
}

.menu-link span {
  flex: 1;
}

/* 콘텐츠 영역 */
.content {
  width: 100%;
  padding: 1rem 0.1rem;
  background: transparent;
  min-height: calc(100vh - 8rem); /* 네비게이션 + 헤더 + 여유 공간 */
  transition: all 0.3s ease;
}

.content.menu-active {
  filter: blur(1px) brightness(0.8);
  transform: scale(0.98);
  pointer-events: none;
}

/* 스크롤 탑 버튼 */
.scroll-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 1.25rem;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.2);
  z-index: 950;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-top-btn:hover {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 51, 107, 0.3);
}

.scroll-top-btn i {
  font-size: 1rem;
}

/* 스크롤바 스타일링 */
.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(185, 187, 204, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(185, 187, 204, 0.3);
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(185, 187, 204, 0.5);
}
</style>
