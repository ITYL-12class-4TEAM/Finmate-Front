<template>
  <header class="navbar">
    <!-- 로고 -->
    <router-link to="/" class="navbar__logo">
      <img src="@/assets/images/logo.png" alt="FinMate 로고" />
    </router-link>

    <DesktopNavbar v-if="!isMobile" />
    <MobileMenu v-if="isMobile" :is-open="mobileOpen" @close="mobileOpen = false" />

    <div class="navbar__right">
      <template v-if="authStore.isAuthenticated">
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
              <p>
                {{
                  authStore.userNickname ||
                  authStore.userInfo?.username ||
                  '사용자'
                }}님
              </p>
              <router-link to="/mypage">마이페이지 이동</router-link>
              <button @click="handleLogout">로그아웃</button>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <router-link to="/login" class="login-btn">로그인</router-link>
      </template>

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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import DesktopNavbar from './DesktopNavbar.vue';
import MobileMenu from './MobileMenu.vue';

const router = useRouter();
const authStore = useAuthStore();

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

// 로그아웃 처리 함수
const handleLogout = async () => {
  try {
    console.log('로그아웃 시작...');

    // Auth Store의 로그아웃 함수 호출
    await authStore.logout();

    console.log('로그아웃 완료');
    alert('로그아웃되었습니다.');

    // 드롭다운 닫기
    dropdownOpen.value = false;

    // 로그인 페이지로 이동
    router.push('/login');
  } catch (error) {
    console.error('로그아웃 처리 중 오류:', error);
    alert('로그아웃 처리 중 오류가 발생했습니다.');
  }
};

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
  z-index: 1000;
}

.navbar__logo img {
  height: 40px;
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-btn {
  color: var(--color-sub);
  background-color: var(--color-bg-light);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid var(--color-light);
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(125, 129, 162, 0.1);
}

.login-btn:active {
  background-color: var(--color-light);
  color: var(--color-main);
  border-color: var(--color-sub);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.15);
}

.hamburger {
  background: none;
  color: var(--color-main);
  border: none;
  cursor: pointer;
  padding: 4px;
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

.user-dropdown button {
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  padding: 4px 0;
  color: var(--color-main);
}

.user-dropdown button:hover {
  color: var(--color-accent);
}
</style>
