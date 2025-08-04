<template>
  <div class="card">
    <img :src="product.bankImage" alt="은행 이미지" class="bank-img" />
    <p class="category">{{ product.category }}</p>
    <p class="name">{{ product.name }}</p>
    <p class="rate">
      금리: <strong>{{ product.rate }}</strong>
    </p>
  </div>
</template>

<script setup>
defineProps({ product: Object });
</script>

<style scoped>
.card {
  min-width: 160px;
  max-width: 160px;
  background: #fff;
  border: 1px solid var(--color-light);
  border-radius: 0.6rem;
  padding: 1rem;
  margin-right: 0.8rem;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.bank-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.category {
  font-size: 0.75rem;
  color: #888;
}

.name {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0.2rem 0;
}

.rate {
  font-size: 0.85rem;
  color: #333;
}
</style>
