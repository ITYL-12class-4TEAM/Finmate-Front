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
          <!-- 알림 아이콘 -->
          <NotificationButton />
          <div class="user-menu" @click="toggleDropdown()">
            <div class="user-avatar">
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
            </div>
            <!-- 사용자 메뉴 드롭다운 -->
            <div class="user-dropdown" :class="{ open: dropdownOpen }">
              <div class="user-info">
                <p class="user-name">{{ authStore.userInfo?.nickname || '사용자' }}님</p>
              </div>
              <router-link to="/mypage" class="dropdown-item">
                <span>마이페이지</span>
              </router-link>
              <button class="dropdown-item logout-btn" @click="handleLogout">
                <span>로그아웃</span>
              </button>
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
import { useToast } from '@/composables/useToast';
import { useModal } from '@/composables/useModal';
import NotificationButton from '@/components/notification/NotificationButton.vue';

const { showToast } = useToast();
const { showModal } = useModal();
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
    const confirmed = await showModal('정말 로그아웃하시겠습니까?');
    if (!confirmed) {
      return; // 취소한 경우 함수 종료
    }

    await authStore.logout();
    showToast('로그아웃되었습니다.');
    dropdownOpen.value = false;
    router.push('/login');
  } catch (error) {
    showToast('로그아웃 처리 중 오류가 발생했습니다.', 'error');
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
  gap: 8px;
  align-items: center;
}

.user-menu {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.user-avatar {
  padding: 10px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  color: var(--color-main);
}

.user-avatar:hover {
  background-color: #f5f5f5;
}

.user-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  min-width: 180px;
  flex-direction: column;
  font-weight: 400;
  font-size: 14px;
  z-index: 20;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.user-dropdown.open {
  display: flex;
}

.user-info {
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.user-name {
  margin: 0;
  font-weight: 500;
  color: var(--color-main);
  font-size: 14px;
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  text-decoration: none;
  color: var(--color-main);
  transition: background-color 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.logout-btn {
  color: #ef4444;
  border-top: 1px solid #e5e7eb;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #dc2626;
}
</style>
