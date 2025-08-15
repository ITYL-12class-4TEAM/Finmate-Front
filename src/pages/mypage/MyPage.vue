<template>
  <div class="mypage-container">
    <!-- 콘텐츠 영역 -->
    <main class="content" role="main">
      <!-- 프로필 섹션 -->
      <section class="profile-section">
        <div class="profile-info">
          <div class="profile-avatar">
            <img
              v-if="userData && userData.profileImage"
              :src="userData.profileImage"
              alt="프로필"
              class="avatar-image"
            />
            <img v-else :src="defaultProfileImage" alt="프로필" class="avatar-image" />
          </div>
          <div class="profile-details">
            <div class="profile-name">{{ userData?.nickname || '로딩중...' }}</div>
            <div class="profile-meta">
              <div class="profile-item">
                <i class="fas fa-envelope"></i>
                <span>{{ maskEmail(userData?.email) }}</span>
              </div>
              <div class="profile-item">
                <i class="fas fa-mobile-alt"></i>
                <span>{{ maskPhoneNumber(userData?.phoneNumber) }}</span>
              </div>
              <div class="profile-item">
                <i class="fas fa-bell"></i>
                <span :class="getNotificationBadgeClass()">
                  {{ userData?.receivePushNotification ? '푸시 허용' : '푸시 차단' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <router-link
          to="/mypage/settings"
          class="settings-btn"
          :aria-current="$route.path === '/mypage/settings' ? 'page' : null"
        >
          <i class="fas fa-cog"></i>
        </router-link>
      </section>

      <!-- 개인 정보 섹션 -->
      <section class="menu-section">
        <h2 class="section-title">개인 활동</h2>
        <div class="menu-list">
          <router-link
            to="/mypage/favorites"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/favorites' ? 'page' : null"
            @click="handleMenuClick"
          >
            <div class="menu-icon">
              <i class="fas fa-star"></i>
            </div>
            <span class="menu-text">즐겨찾기</span>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>

          <router-link
            to="/mypage/recent-view"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/recent-view' ? 'page' : null"
            @click="handleMenuClick"
          >
            <div class="menu-icon">
              <i class="fas fa-clock-rotate-left"></i>
            </div>
            <span class="menu-text">최근 본 상품</span>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>

          <router-link
            to="/mypage/portfolio"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/portfolio' ? 'page' : null"
            @click="handleMenuClick"
          >
            <div class="menu-icon">
              <i class="fas fa-briefcase"></i>
            </div>
            <span class="menu-text">포트폴리오</span>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>
        </div>
      </section>

      <!-- 금융 성향 검사 섹션 -->
      <section class="menu-section">
        <h2 class="section-title">금융 성향 검사</h2>
        <div class="menu-list">
          <router-link
            to="/wmti/result"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/wmti/result' ? 'page' : null"
            @click="handleMenuClick"
          >
            <div class="menu-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="menu-content">
              <span class="menu-text">WMTI 결과</span>
              <span class="menu-desc">나의 투자 성향 확인</span>
            </div>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>

          <router-link
            to="/mypage/wmti-history"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/wmti-history' ? 'page' : null"
          >
            <div class="menu-icon">
              <i class="fas fa-list"></i>
            </div>
            <div class="menu-content">
              <span class="menu-text">검사 히스토리</span>
              <span class="menu-desc">과거 검사 결과 보기</span>
            </div>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>
        </div>
      </section>

      <!-- 커뮤니티 활동 섹션 -->
      <section class="menu-section">
        <h2 class="section-title">커뮤니티 활동</h2>
        <div class="menu-list">
          <router-link
            to="/mypage/my-posts"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/my-posts' ? 'page' : null"
          >
            <div class="menu-icon">
              <i class="fas fa-file-text"></i>
            </div>
            <span class="menu-text">내 게시글</span>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>

          <router-link
            to="/mypage/my-comments"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/my-comments' ? 'page' : null"
          >
            <div class="menu-icon">
              <i class="fas fa-comments"></i>
            </div>
            <span class="menu-text">내 댓글</span>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>

          <router-link
            to="/mypage/my-scrap"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/my-scrap' ? 'page' : null"
          >
            <div class="menu-icon">
              <i class="fas fa-bookmark"></i>
            </div>
            <span class="menu-text">내 스크랩</span>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>

          <router-link
            to="/mypage/my-likes"
            class="menu-item"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/my-likes' ? 'page' : null"
          >
            <div class="menu-icon">
              <i class="fas fa-heart"></i>
            </div>
            <span class="menu-text">내 좋아요</span>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>
        </div>
      </section>

      <!-- 계정 관리 섹션 -->
      <section class="menu-section">
        <h2 class="section-title">계정 관리</h2>
        <div class="menu-list">
          <router-link
            to="/mypage/settings/delete"
            class="menu-item danger"
            exact-active-class="active"
            :aria-current="$route.path === '/mypage/settings/delete' ? 'page' : null"
          >
            <div class="menu-icon">
              <i class="fas fa-trash"></i>
            </div>
            <span class="menu-text">회원탈퇴</span>
            <i class="fas fa-chevron-right menu-arrow"></i>
          </router-link>

          <a
            href="https://forms.gle/oSzxFfE3kkFzrXw86"
            target="_blank"
            rel="noopener noreferrer"
            class="menu-item external"
            @click="handleExternalLink"
          >
            <div class="menu-icon">
              <i class="fas fa-headset"></i>
            </div>
            <span class="menu-text">고객의 소리</span>
            <i class="fas fa-external-link menu-arrow"></i>
          </a>
        </div>
      </section>

      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { memberAPI } from '../../api/member';
import defaultProfileImg from '../../assets/images/DefaultProfileImg.png';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

// 반응성 데이터
const showMobileMenu = ref(false);
const headerTranslateY = ref(0);
const lastScrollY = ref(0);
const isScrolled = ref(false);
const userData = ref(null);
const defaultProfileImage = ref(defaultProfileImg);

const maskPhoneNumber = (phone) => {
  if (!phone) return '-';
  return phone;
};

const maskEmail = (email) => {
  if (!email) return '-';
  return email;
};

const getNotificationBadgeClass = () => {
  if (!userData.value) return 'notification-status off';
  return userData.value.receivePushNotification
    ? 'notification-status on'
    : 'notification-status off';
};

// 메뉴 닫기 함수
const closeMobileMenu = async () => {
  showMobileMenu.value = false;
  document.body.style.overflow = '';
  updateHeaderPosition();
};

// 헤더 위치 업데이트
const updateHeaderPosition = () => {
  const currentScrollY = window.scrollY;
  const navBarHeight = 56; // 3.5rem = 56px

  if (currentScrollY <= navBarHeight) {
    headerTranslateY.value = 0;
  } else {
    headerTranslateY.value = -navBarHeight;
  }
};

// 메뉴 클릭 핸들러
const handleMenuClick = () => {
  if (window.innerWidth <= 768) {
    // 모바일에서만
    closeMobileMenu();
  }
};

// 외부 링크 클릭 핸들러
const handleExternalLink = () => {
  if (window.innerWidth <= 768) {
    closeMobileMenu();
  }
};

// 스크롤 핸들러 (성능 최적화)
let ticking = false;
const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;

      // 스크롤 상태 업데이트
      isScrolled.value = currentScrollY > 10;

      // 메뉴가 열려있지 않을 때만 헤더 위치 조정
      if (!showMobileMenu.value) {
        const startHideAt = 0;
        const headerHeight = 56;

        if (currentScrollY <= startHideAt) {
          headerTranslateY.value = 0;
        } else {
          const scrollBeyondStart = currentScrollY - startHideAt;
          const translateValue = Math.min(scrollBeyondStart * 0.8, headerHeight);
          headerTranslateY.value = -translateValue;

          // 70% 이상 숨겨졌을 때 메뉴 닫기
          if (translateValue >= headerHeight * 0.7 && showMobileMenu.value) {
            closeMobileMenu();
          }
        }
      }

      lastScrollY.value = currentScrollY;
      ticking = false;
    });
    ticking = true;
  }
};

// 라이프사이클 훅
onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  lastScrollY.value = window.scrollY;

  // 사용자 정보 로드
  try {
    const response = await memberAPI.getMyInfo();
    if (response.success) {
      userData.value = response.data;
    } else {
      showToast('사용자 정보 조회 실패:', response.message, 'error');
    }
  } catch (error) {
    showToast('사용자 정보 조회 실패:', error, 'error');
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* 기본 설정 */
* {
  box-sizing: border-box;
}
.mypage-container {
  width: 100%;
  max-width: 26.875rem;
  min-height: 100vh;
  margin: 0 auto;
  background: var(--color-white);
  position: relative;
}

/* 콘텐츠 영역 */
.content {
  width: 100%;
  padding: 1rem 1rem;
  background: var(--color-white);
  min-height: 100vh;
}

/* 프로필 섹션 */
.profile-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 0;
  margin-bottom: 1.5rem;
}

.profile-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.profile-avatar {
  width: 4rem;
  height: 4rem;
  background: var(--color-bg-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-main);
  line-height: 1.4;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-sub);
  line-height: 1.3;
}

.profile-item i {
  width: 1rem;
  color: var(--color-light);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.profile-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-btn {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-bg-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--color-sub);
  transition: all 0.2s ease;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.settings-btn:hover {
  background: var(--color-sub);
  color: var(--color-white);
}

.settings-btn i {
  font-size: 1.125rem;
}

/* 알림 상태 */
.notification-status {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.75rem;
  white-space: nowrap;
}

.notification-status.on {
  background: #f0fdf4;
  color: #16a34a;
}

.notification-status.off {
  background: var(--color-bg-light);
  color: var(--color-light);
}

/* 섹션 공통 */
.menu-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 0.125rem solid var(--color-main);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -0.125rem;
  left: 0;
  width: 2rem;
  height: 0.125rem;
  background: var(--color-sub);
}

/* 메뉴 리스트 */
.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  text-decoration: none;
  color: var(--color-main);
  transition: all 0.2s ease;
  border-bottom: 0.0625rem solid var(--color-bg-light);
  -webkit-tap-highlight-color: transparent;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  color: var(--color-sub);
  transform: translateX(0.25rem);
}

.menu-item:active {
  transform: translateX(0.125rem);
}

.menu-item.active {
  color: var(--color-sub);
  background: rgba(125, 129, 162, 0.05);
  margin: 0 -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 0.5rem;
}

.menu-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--color-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.menu-item:hover .menu-icon,
.menu-item.active .menu-icon {
  background: var(--color-sub);
}

.menu-icon i {
  font-size: 1rem;
  color: var(--color-sub);
  transition: color 0.2s ease;
}

.menu-item:hover .menu-icon i,
.menu-item.active .menu-icon i {
  color: var(--color-white);
}

.menu-text {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.menu-desc {
  font-size: 0.75rem;
  color: var(--color-light);
  font-weight: 400;
  line-height: 1.3;
}

.menu-arrow {
  font-size: 0.875rem;
  color: var(--color-light);
  transition: all 0.2s ease;
}

.menu-item:hover .menu-arrow,
.menu-item.active .menu-arrow {
  color: var(--color-sub);
  transform: translateX(0.25rem);
}

/* 위험한 액션 */
.menu-item.danger {
  color: #ef4444;
}

.menu-item.danger:hover {
  color: #dc2626;
}

.menu-item.danger .menu-icon {
  background: rgba(239, 68, 68, 0.1);
}

.menu-item.danger .menu-icon i {
  color: #ef4444;
}

.menu-item.danger:hover .menu-icon {
  background: #ef4444;
}

.menu-item.danger:hover .menu-icon i {
  color: var(--color-white);
}

.menu-item.danger:hover .menu-arrow {
  color: #ef4444;
}

/* 외부 링크 */
.menu-item.external .menu-arrow {
  font-size: 0.75rem;
}

/* 접근성 개선 */
.menu-item:focus-visible,
.settings-btn:focus-visible {
  outline: 0.125rem solid var(--color-sub);
  outline-offset: 0.125rem;
  border-radius: 0.25rem;
}

/* 터치 디바이스 최적화 */
@media (hover: none) and (pointer: coarse) {
  .menu-item:hover {
    color: var(--color-main);
    transform: none;
  }

  .menu-item:hover .menu-icon {
    background: var(--color-bg-light);
  }

  .menu-item:hover .menu-icon i {
    color: var(--color-sub);
  }

  .menu-item:hover .menu-arrow {
    color: var(--color-light);
    transform: none;
  }

  .menu-item.danger:hover {
    color: #ef4444;
  }

  .menu-item.danger:hover .menu-icon {
    background: rgba(239, 68, 68, 0.1);
  }

  .menu-item.danger:hover .menu-icon i {
    color: #ef4444;
  }

  .menu-item.danger:hover .menu-arrow {
    color: var(--color-light);
  }

  .settings-btn:hover {
    background: var(--color-bg-light);
    color: var(--color-sub);
  }
}

/* 작은 화면 최적화 */
@media (max-width: 23.4375rem) {
  /* 375px */
  .content {
    padding: 0.75rem 0.75rem;
  }

  .profile-section {
    padding: 1rem 0;
    margin-bottom: 1rem;
  }

  .profile-avatar {
    width: 3.5rem;
    height: 3.5rem;
  }

  .profile-name {
    font-size: 1.125rem;
  }

  .profile-item {
    font-size: 0.75rem;
  }

  .profile-item i {
    font-size: 0.6875rem;
  }

  .settings-btn {
    width: 2.25rem;
    height: 2.25rem;
  }

  .settings-btn i {
    font-size: 1rem;
  }

  .menu-section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }

  .menu-item {
    padding: 0.875rem 0;
  }

  .menu-icon {
    width: 2.25rem;
    height: 2.25rem;
  }

  .menu-icon i {
    font-size: 0.875rem;
  }

  .menu-text {
    font-size: 0.875rem;
  }

  .menu-desc {
    font-size: 0.6875rem;
  }

  .notification-status {
    font-size: 0.625rem;
    padding: 0.1875rem 0.375rem;
  }
}

/* 프린트 스타일 */
@media print {
  .mypage-container {
    max-width: none;
    box-shadow: none;
  }

  .content {
    background: var(--color-white);
    padding: 0;
  }

  .menu-item {
    border: 0.0625rem solid var(--color-bg-light);
  }
}
</style>
