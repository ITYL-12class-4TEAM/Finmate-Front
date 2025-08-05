<template>
  <div class="post-card" @click="goToDetail">
    <h3 class="title">{{ post.title }}</h3>
    <p class="content">{{ post.content }}</p>
    <div class="footer">
      <span class="nickname">{{ post.nickname }}</span>
      <div class="stats">
        <span class="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
          {{ post.likeCount }}</span
        >
        <span class="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            />
          </svg>
          {{ post.commentCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const props = defineProps({
  post: Object,
});

const goToDetail = () => {
  router.push(`/community/${props.post.postId}`);
};
</script>

<style scoped>
.post-card {
  background: #fff;
  border: 1.5px solid var(--color-main);
  border-radius: 0.6rem;
  padding: 1rem;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
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

.stats svg {
  width: 1.2rem;
  height: 1.2rem;
  vertical-align: middle;
}
</style>
