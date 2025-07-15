<template>
  <nav class="navbar">
    <RouterLink to="/">홈</RouterLink>
    <RouterLink to="/login">로그인</RouterLink>
    <RouterLink to="/login/signup">회원가입</RouterLink>
    <RouterLink to="/login/find-id">아이디 찾기</RouterLink>
    <RouterLink to="/login/find-password">비밀번호 찾기</RouterLink>
    <RouterLink to="/mypage">마이페이지</RouterLink>
    <RouterLink to="/products/deposit">예적금</RouterLink>
    <RouterLink to="/products/pension">연금</RouterLink>
    <RouterLink to="/wmti/basic">금융성향(기본)</RouterLink>
    <RouterLink to="/community">커뮤니티</RouterLink>
  </nav>
</template>

<script setup>
// Nothing needed here unless you want to add logic later
</script>

<style scoped>
.navbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background-color: #f3f3f3;
  border-bottom: 1px solid #ddd;
}

a.router-link-active {
  font-weight: bold;
  color: #007bff;
}
</style>
