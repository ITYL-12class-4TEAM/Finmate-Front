<template>
  <div class="main">
    <h1>Welcome to Finmate!</h1>
    <p>This is the main page.</p>
    <router-link to="/this-page-does-not-exist">Go to not found</router-link>
  </div>
</template>

<script setup>
// 필요한 경우 script 코드 작성 가능
</script>

<style scoped>
.main {
  padding: 2rem;
  text-align: center;
}
</style>
