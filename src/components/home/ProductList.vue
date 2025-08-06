<template>
  <section class="product-list">
    <h2 class="title">인기 금융상품</h2>

    <div v-for="category in products" :key="category.subcategoryId" class="category-block">
      <h3 class="category-title">{{ category.subcategoryName }}</h3>
      <div class="scroll-wrapper">
        <ProductCard
          v-for="product in category.products"
          :key="product.productId"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import ProductCard from '@/components/home/ProductCard.vue';
import { onMounted, ref } from 'vue';
import { getWishListPopularyAPI } from '@/api/wishProduct';

const products = ref([]);

const fetchPopularProducts = async () => {
  try {
    const response = await getWishListPopularyAPI();
    products.value = response;
  } catch (e) {
    console.error('게시물 불러오기 실패:', e);
  }
};

onMounted(fetchPopularProducts);
</script>

<style scoped>
.product-list {
  padding: 1rem;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.category-block {
  margin-bottom: 1.5rem;
}

.category-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0.5rem 0;
}

.scroll-wrapper {
  display: flex;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
</style>
