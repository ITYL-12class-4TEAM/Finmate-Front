<template>
  <div id="app">
    <Navbar />
    <!-- 라우터에 의해 매칭되는 컴포넌트 표시 -->
    <router-view />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
</script>
