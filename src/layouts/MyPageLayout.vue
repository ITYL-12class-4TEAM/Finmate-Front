<template>
  <div class="mypage-container">
    <div class="main-layout">
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
import { ref, onMounted, onUnmounted } from 'vue';

const showMobileMenu = ref(false);
const headerTranslateY = ref(0);

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  document.body.style.overflow = '';
};

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  const headerHeight = 56;
  headerTranslateY.value = Math.min(currentScrollY, headerHeight) * -1;

  if (headerTranslateY.value <= -headerHeight * 0.7 && showMobileMenu.value) {
    closeMobileMenu();
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<style scoped>
.mypage-container {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.main-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.content {
  flex: 1;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .content.menu-active {
    filter: blur(2px);
  }
}
</style>
