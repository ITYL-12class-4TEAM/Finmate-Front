<template>
    <div class="products-layout">
      <div class="layout-container">
        <router-view />
      </div>
    </div>
  </template>
  
  <script setup></script>
  
  <style scoped>
  .layout-container {
    max-width: 430px;
    margin: 0 auto;
  }
  </style>