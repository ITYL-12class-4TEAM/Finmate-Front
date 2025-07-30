<template>
  <div>
    <!-- 스크랩 리스트 -->
    <div class="scraps-list">
      <ScrappedPostItem
        v-for="post in posts"
        :key="`scrap-${post.postId}`"
        :post="post"
        @view-post="$emit('view-post', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import ScrappedPostItem from './ScrapPostItem.vue';

const props = defineProps({
  posts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['view-post']);
</script>

<style scoped>
.scraps-list {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
