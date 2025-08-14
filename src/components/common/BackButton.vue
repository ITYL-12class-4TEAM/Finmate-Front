<template>
  <div class="back-button" @click="goBack">
    <button class="icon" type="button" aria-label="뒤로가기">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3.0"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
    </button>
    <span class="title">{{ title }}</span>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const props = defineProps({
  title: { type: String, required: false },
  to: { type: [String, Object], required: false }, // 히스토리 없을 때 fallback
  preferBack: { type: Boolean, default: true }, // 가능한 경우 진짜 뒤로가기 우선
  mypagePath: { type: String, default: '/mypage' }, // src=mypage일 때 기본 복귀지
});

const safePush = (raw) => {
  if (!raw) return false;
  if (typeof raw === 'string') {
    // 외부로 튀는 것 방지 (간단 검증)
    if (!raw.startsWith('/') || raw.startsWith('//')) return false;
    router.push(raw);
    return true;
  }
  router.push(raw);
  return true;
};

const goBack = () => {
  const q = route.query || {};

  // 1) 특정 복귀지(returnTo)가 있으면 최우선
  if (q.returnTo && safePush(q.returnTo)) return;

  // 2) 마이페이지에서 온 경우
  if (q.src === 'mypage') {
    router.push(props.mypagePath);
    return;
  }

  // 3) 실제 브라우저 히스토리 사용
  const hasHistory =
    typeof window !== 'undefined' &&
    window.history &&
    ((window.history.state && window.history.state.back != null) || window.history.length > 1);

  if (props.preferBack && hasHistory) {
    router.push(window.history.state.back, { scroll: false });
    return;
  }

  // 4) fallback
  if (props.to) router.push(props.to);
  else router.push('/');
};
</script>

<style scoped>
.back-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
</style>
