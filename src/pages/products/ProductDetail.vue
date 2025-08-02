<template>
  <div>
    <h1>ProductDetail</h1>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
// import { getProductsDetailAPI } from '@/api/product';

const products = ref(null);

// 상품 상세 정보 조회
const fetchProductsDetail = async () => {
  console.log('fetchProductsDetail 시작');
  try {
    const data = await getProductsDetailAPI();
    console.log('상품 상세보기 성공');
    console.log(data);
  } catch (e) {
    console.error('상품 상세보기 실패:', e);
  }
};

onMounted(() => {
  fetchProductsDetail();
});
</script>
