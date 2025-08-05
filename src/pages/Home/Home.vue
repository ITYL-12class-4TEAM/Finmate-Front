<template>
  <div class="home">
    <SurveyBanner />
    <ProductList />
    <HotPostList />
  </div>
</template>

<script setup>
import SurveyBanner from '@/components/home/SurveyBanner.vue';
import ProductList from '@/components/home/ProductList.vue';
import HotPostList from '@/components/home/HotPostList.vue';
</script>

<style scoped>
.home {
  max-width: 430px;
  margin: 0 auto;
}
</style>
