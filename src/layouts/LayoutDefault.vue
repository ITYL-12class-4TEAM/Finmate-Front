<template>
  <div class="layout-wrapper">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>

    <FloatingMenu />
  </div>
</template>

<script setup>
import Navbar from '@/components/layouts/Navbar.vue';
import FloatingMenu from '@/components/common/FloatingMenu.vue';
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  padding: 2rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
