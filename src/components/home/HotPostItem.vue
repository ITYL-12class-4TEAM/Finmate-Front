<template>
  <div class="post-card">
    <h3 class="title">{{ post.title }}</h3>
    <p class="content">{{ post.content }}</p>
    <div class="footer">
      <span class="nickname">{{ post.nickname }}</span>
      <div class="stats">
        <span class="icon">❤️ {{ post.likeCount }}</span>
        <span class="icon">💬 {{ post.commentCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ post: Object });
</script>

<style scoped>
.post-card {
  background: #fff;
  border: 1.5px solid var(--color-main);
  border-radius: 0.6rem;
  padding: 1rem;
  margin-bottom: 0.8rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
}

.content {
  font-size: 0.85rem;
  color: var(--color-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.6rem;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--color-light);
}

.stats .icon {
  margin-left: 0.5rem;
}
</style>
