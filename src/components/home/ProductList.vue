<template>
  <section class="product-list">
    <h2 class="title">인기 관심상품</h2>
    <div class="scroll-wrapper">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>

<script setup>
import ProductCard from "@/components/home/ProductCard.vue";
import { popularProducts } from "../../pages/Home/popularProducts";

const products = popularProducts;
</script>

<style scoped>
.product-list {
  padding: 1rem;
}

.title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  text-align: center;
}

.scroll-wrapper {
  display: flex;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
</style>
