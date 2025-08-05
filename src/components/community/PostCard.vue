<template>
  <div class="post-card" @click="$emit('click')">
    <div class="post-card-inner">
      <h4 class="post-title">{{ post.title }}</h4>
      <p class="post-content">{{ post.content }}</p>
      <div class="post-meta">
        <div class="post-stats">
          <span>
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
            {{ post.likes }}
          </span>
          <span>
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
            {{ post.comments }}
          </span>
        </div>
        <span class="post-date">{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

// 날짜 배열 포맷: [2024, 7, 25, 13, 45] → "07/25 13:45"
const formattedDate = computed(() => {
  const arr = props.post.createdAt;
  if (!arr || arr.length < 5) return '';
  const [_, month, day, hour, minute] = arr;
  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0'
  )} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});
</script>

<style scoped>
.post-card {
  border: 2px solid var(--color-light);
  border-radius: 16px;
  padding: 1rem;
  height: 8.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: white;
  transition: box-shadow 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.post-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.post-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.post-content {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.post-stats span {
  display: flex;
  gap: 0.2rem;
  align-items: center;
}

.post-stats svg {
  width: 1.2rem;
  height: 1.2rem;
  vertical-align: middle;
}
</style>
