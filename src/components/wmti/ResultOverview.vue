<!-- 성향코드, 이름, 전체요약 출력 -->
<template>
  <div class="overview">
    <h2>
      {{ profile.userName }}님의 투자 성향은 <strong>{{ profile.wmtiCode }}</strong
      >입니다
    </h2>
    <p>{{ profile.description }}</p>
  </div>
</template>

<script>
export default {
  props: ['profile'],
};
</script>
