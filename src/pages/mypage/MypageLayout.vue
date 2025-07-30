<template>
  <div class="mypage-container">
    <!-- 모바일 햄버거 메뉴 버튼 -->
    <button class="mobile-menu-toggle" @click="toggleMobileMenu">
      <i class="bi bi-list" v-if="!showMobileMenu"></i>
      <i class="bi bi-x" v-else></i>
    </button>

    <!-- 오버레이 -->
    <div
      class="mobile-overlay"
      v-show="showMobileMenu"
      @click="closeMobileMenu"
    ></div>

    <div class="main-layout">
      <!-- 사이드바 메뉴 -->
      <aside class="sidebar" :class="{ 'mobile-open': showMobileMenu }">
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
                  <i class="bi bi-star-fill"></i><span>즐겨찾기</span>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/recent-view"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-clock-history"></i><span>최근 본 상품</span>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/portfolio"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-briefcase"></i><span>포트폴리오</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- 금융 성향 검사 -->
          <div class="menu-section">
            <h3 class="section-title">금융 성향 검사</h3>
            <ul class="menu-list">
              <li class="menu-item">
                <router-link
                  to="/mypage/wmti-result"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-graph-up"></i><span>WMTI 결과</span>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/wmti-history"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-list-ul"></i><span>검사 히스토리</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- 커뮤니티 활동 -->
          <div class="menu-section">
            <h3 class="section-title">커뮤니티 활동</h3>
            <ul class="menu-list">
              <li class="menu-item">
                <router-link
                  to="/mypage/my-posts"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-file-text"></i><span>내 게시글</span>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/my-comments"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-chat-dots"></i><span>내 댓글</span>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/my-scrap"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-bookmark"></i><span>내 스크랩</span>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/my-likes"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-heart"></i><span>내 좋아요</span>
                </router-link>
              </li>
            </ul>
          </div>

          <!-- 계정 관리 -->
          <div class="menu-section">
            <h3 class="section-title">계정 관리</h3>
            <ul class="menu-list">
              <li class="menu-item">
                <router-link
                  to="/mypage/settings"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-gear"></i><span>계정 설정</span>
                </router-link>
              </li>
              <li class="menu-item">
                <router-link
                  to="/mypage/settings/delete"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-trash"></i><span>회원탈퇴</span>
                </router-link>
              </li>
              <li class="menu-item">
                <a
                  href="https://forms.gle/oSzxFfE3kkFzrXw86"
                  target="_blank"
                  class="menu-link"
                  @click="closeMobileMenu"
                >
                  <i class="bi bi-shield-check"></i><span>고객의 소리</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- 콘텐츠 영역 -->
      <main class="content">
        <router-view />
      </main>

      <button
        v-show="showScrollTop"
        class="scroll-top-btn"
        @click="scrollToTop"
      >
        ↑
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showScrollTop = ref(false);
const showMobileMenu = ref(false);

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 100;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.mypage-container {
  max-width: 26.875rem; /* 430px */
  margin: 0 auto;
  position: relative;
}

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mobile-menu-toggle {
  position: fixed;
  top: 1.25rem;
  left: 1.25rem;
  z-index: 1001;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.mobile-menu-toggle:hover {
  background: #0b5ed7;
  transform: scale(1.05);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 17.5rem; /* 280px */
  background: #fff;
  padding-top: 4.5rem;
  padding: 1.5rem;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  border-top-right-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}

.sidebar.mobile-open {
  transform: translateX(0);
}

.nav-menu {
  width: 100%;
}

.menu-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.03rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 0.125rem solid #e9ecef;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin-bottom: 0.5rem;
}

.menu-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #495057;
  transition: all 0.3s ease;
  font-weight: 500;
}

.menu-link:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
}

.menu-link i {
  width: 1.25rem;
  margin-right: 0.75rem;
  font-size: 1rem;
}

.content {
  width: 100%;
  margin: 0.5rem auto; /* 화면 중앙 정렬 */
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.07);
  padding: 0.5rem;
  max-width: 26.875rem; /* 430px 고정 */
  min-height: 31.25rem; /* 필요한 경우 유지 */
}

.scroll-top-btn {
  position: fixed;
  bottom: 5rem;
  right: 1.25rem;
  padding: 0.7rem 1rem;
  background-color: #e9ecef;
  color: #495057;
  border: none;
  border-radius: 3rem;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, opacity 0.3s ease;
  opacity: 0.8;
  z-index: 1000;
}

.scroll-top-btn:hover {
  background-color: #dee2e6;
  opacity: 1;
}
</style>
