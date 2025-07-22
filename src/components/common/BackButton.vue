<template>
  <div class="back-button" @click="goBack">
    <button class="icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3.0"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5 8.25 12l7.5-7.5"
        />
      </svg>
    </button>
    <span class="title">{{ title }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

defineProps({
  title: {
    type: String,
    required: false,
  },
});

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.back-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 10%;
}

.icon {
  background-color: var(--color-sub);
  width: 80px;
  height: 30px;
  color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon svg {
  width: 16px;
  height: 16px;
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-main);
}

@media (max-width: 768px) {
  .back-button {
    margin-left: 1rem;
  }
}
</style>
