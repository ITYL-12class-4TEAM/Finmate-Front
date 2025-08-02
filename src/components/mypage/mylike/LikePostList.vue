<template>
  <div>
    <!-- 좋아요 리스트 -->
    <div class="likes-list">
      <LikedPostItem
        v-for="post in posts"
        :key="`like-${post.postId}`"
        :post="post"
        @view-post="$emit('view-post', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import LikedPostItem from './LikePostItem.vue';

const props = defineProps({
  posts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['view-post']);
</script>

<style scoped>
.likes-list {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
