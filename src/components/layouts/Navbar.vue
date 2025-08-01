<template>
  <header class="navbar">
    <!-- 로고 -->
    <router-link to="/" class="navbar__logo">
      <img src="@/assets/images/logo.png" alt="FinMate 로고" />
    </router-link>

    <DesktopNavbar v-if="!isMobile" />
    <MobileMenu v-if="isMobile" :is-open="mobileOpen" @close="mobileOpen = false" />

    <div class="navbar__right">
      <!-- 알림/사용자 -->
      <div class="navbar__icons">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        <div class="user-menu" @click="toggleDropdown()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            width="24"
            height="24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>

          <!-- 사용자 메뉴 드롭다운 -->
          <div class="user-dropdown" :class="{ open: dropdownOpen }">
            <p>홍길동님</p>
            <router-link to="/mypage">마이페이지 이동</router-link>
            <button @click="logout">로그아웃</button>
          </div>
        </div>
      </div>
      <!-- 모바일용 햄버거 버튼 -->
      <button v-if="isMobile" class="hamburger" @click="mobileOpen = true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DesktopNavbar from './DesktopNavbar.vue';
import MobileMenu from './MobileMenu.vue';

const isMobile = ref(false);
const mobileOpen = ref(false);
const dropdownOpen = ref(false);

const checkViewport = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkViewport();
  window.addEventListener('resize', checkViewport);
});

function logout() {
  alert('로그아웃 처리 예정');
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  background-color: white;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-main);
}

.navbar__logo img {
  height: 40px;
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hamburger {
  background: none;
  color: var(--color-main);
}

.navbar__icons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon-button img {
  width: 24px;
  height: 24px;
}

.user-menu {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.user-menu img {
  width: 24px;
  height: 24px;
}

.user-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 12px;
  border-radius: 8px;
  min-width: 160px;
  flex-direction: column;
  gap: 8px;
  font-weight: 400;
  font-size: 13px;
  z-index: 20;
  pointer-events: auto;
}

.user-dropdown.open {
  display: flex;
}
</style>
