<template>
  <div>
    <!-- 게시글 리스트 -->
    <div class="posts-list">
      <PostItem
        v-for="post in posts"
        :key="post.postId"
        :post="post"
        @view="$emit('view-post', $event)"
        @like="(postId) => refreshPost(postId)"
        @comment="(postId) => refreshPost(postId)"
      />
    </div>
  </div>
</template>

<script setup>
import PostItem from './PostItem.vue';

const props = defineProps({
  posts: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['view-post']);
</script>

<style scoped>
.posts-list {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
