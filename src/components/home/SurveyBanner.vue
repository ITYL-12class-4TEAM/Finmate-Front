<template>
  <section class="survey-banner">
    <p class="title">내 투자 성향 확인하러 가기</p>
    <p class="description">나에게 맞는 금융 상품을 쉽게 비교하고 추천받으세요.</p>
    <button class="survey-button" @click="goToSurvey">검사하기</button>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToSurvey = () => {
  router.push('/wmti/basic');
};
</script>

<style scoped>
.survey-banner {
  background-color: var(--color-bg-light);
  text-align: center;
  padding: 2rem 1rem;
  border-radius: 0.5rem;
  margin: 1rem;
}

.title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.description {
  font-size: 0.85rem;
  color: var(--color-sub);
  margin-bottom: 1rem;
}

.survey-button {
  background-color: var(--color-main);
  color: #fff;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>
