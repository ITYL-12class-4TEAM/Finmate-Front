<template>
  <div>
    <!-- 게시글 리스트 -->
    <div class="posts-list">
      <CommentedPostItem
        v-for="post in posts"
        :key="`${post.postId}-${post.myCommentId}`"
        :post="post"
        @view-post="$emit('view-post', $event)"
        @view-comment="$emit('view-comment', $event)"
        @like="(postId) => refreshPost(postId)"
        @comment="(postId) => refreshPost(postId)"
      />
    </div>
  </div>
</template>

<script setup>
import CommentedPostItem from './CommentPostItem.vue';

defineProps({
  posts: {
    type: Array,
    required: true,
  },
});

defineEmits(['view-post', 'view-comment']);
</script>

<style scoped>
.posts-list {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
}
</style>
