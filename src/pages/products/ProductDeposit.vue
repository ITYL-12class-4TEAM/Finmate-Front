<template>
  <div>
    <h1>ProductDeposit</h1>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getProductsAPI, getProductsCategoriesAPI } from '@/api/product';

const products = ref(null);

// 상품 목록 불러오기
const fetchProducts = async () => {
  try {
    const data = await getProductsAPI();

    // products.value = data;
  } catch (e) {
    console.error('상품 목록 불러오기 실패:', e);
  }
};

const fetchCategories = async () => {
  try {
    const data = await getProductsCategoriesAPI();
    console.log(data);
  } catch (e) {
    console.error('상품 목록 불러오기 실패:', e);
  }
};

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>
