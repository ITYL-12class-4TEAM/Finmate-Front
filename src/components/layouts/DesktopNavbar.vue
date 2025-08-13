<template>
  <!-- 메뉴 영역 -->
  <nav class="navbar__menu">
    <ul>
      <li class="menu-item has-dropdown">
        금융 상품
        <ul class="dropdown">
          <li><router-link to="/products/deposit">예금</router-link></li>
          <li><router-link to="/products/savings">적금</router-link></li>
          <!-- <li><router-link to="/products/pension">연금 저축</router-link></li> -->
        </ul>
      </li>
      <li class="menu-item has-dropdown">
        금융 성향
        <ul class="dropdown">
          <li><router-link to="/wmti/basic">투자 성향 진단</router-link></li>
          <li>
            <router-link to="/wmti/result">투자 성향 결과</router-link>
          </li>
          <li>
            <router-link to="/wmti/collection">16가지 투자성향</router-link>
          </li>
        </ul>
      </li>
      <li class="menu-item">
        <router-link to="/community">커뮤니티</router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup></script>

<style scoped>
.navbar__menu ul {
  display: flex;
  list-style: none;
  gap: 100px;
  margin: 0;
  padding: 0;
}

.menu-item {
  position: relative;
  cursor: pointer;
}

.menu-item .dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  padding: 10px 0;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  flex-direction: column;
}

.menu-item:hover .dropdown {
  display: block;
}

.dropdown li {
  padding: 8px 20px;
  white-space: nowrap;
}
</style>
