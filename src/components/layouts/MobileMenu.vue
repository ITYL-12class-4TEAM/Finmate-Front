<template>
  <div v-if="isOpen" class="mobile-menu">
    <!-- 상단 닫기 버튼 -->
    <div class="mobile-menu__header">
      <button class="close-btn" @click="$emit('close')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- 메뉴 리스트 -->
    <ul class="mobile-menu__list">
      <li>
        <router-link to="/" @click="$emit('close')">홈</router-link>
      </li>

      <li @click="toggleDropdown(0)">
        <div class="menu-title">
          금융 상품
          <span class="arrow" :class="{ open: openIndex === 0 }">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              width="24"
              height="24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </div>
        <ul v-show="openIndex === 0" class="submenu">
          <li>
            <router-link to="/products/deposit" @click="$emit('close')">예금</router-link>
          </li>
          <li>
            <router-link to="/products/savings" @click="$emit('close')">적금</router-link>
          </li>
          <li>
            <router-link to="/products/pension" @click="$emit('close')">연금 저축</router-link>
          </li>
        </ul>
      </li>

      <li @click="toggleDropdown(1)">
        <div class="menu-title">
          금융 성향
          <span class="arrow" :class="{ open: openIndex === 1 }">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              width="24"
              height="24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </div>
        <ul v-show="openIndex === 1" class="submenu">
          <li>
            <router-link to="/wmti/basic" @click="$emit('close')">투자 성향 진단</router-link>
          </li>
          <li>
            <router-link to="/wmti/result" @click="$emit('close')"
              >진단 결과 보기 및 재검사</router-link
            >
          </li>
          <!-- <li>
            <router-link to="/wmti/types" @click="$emit('close')">다른 WMTI 유형 보기</router-link>
          </li> -->
        </ul>
      </li>

      <li>
        <router-link to="/community" @click="$emit('close')">소통</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const openIndex = ref(null);

function toggleDropdown(index) {
  openIndex.value = openIndex.value === index ? null : index;
}
</script>

<style scoped>
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 300px;
  height: 100vh;
  background: white;
  padding: 20px;
  z-index: 1000;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.mobile-menu__header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  font-size: 24px;
  border: none;
  cursor: pointer;
  color: var(--color-main);
}

.mobile-menu__list {
  list-style: none;
  padding: 0;
}

.mobile-menu__list > li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.menu-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
}

.submenu {
  padding-left: 12px;
  margin-top: 8px;
  list-style: none;
}

.submenu li {
  padding: 6px 0;
}

.arrow.open {
  transform: rotate(180deg);
}
</style>
