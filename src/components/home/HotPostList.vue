<template>
  <section class="hot-posts">
    <h2 class="title">HOT 게시글</h2>
    <HotPostItem v-for="post in posts" :key="post.postId" :post="post" />
  </section>
</template>

<script setup>
import HotPostItem from './HotPostItem.vue';

import { ref, onMounted } from 'vue';
import { getHotPostsAPI } from '@/api/posts';

const posts = ref([]);

const fetchHotPosts = async () => {
  try {
    const response = await getHotPostsAPI();
    posts.value = response;
  } catch (error) {
    console.error('Error fetching hot posts:', error);
  }
};

onMounted(fetchHotPosts);
</script>

<style scoped>
.hot-posts {
  padding: 1rem;
}

.title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
