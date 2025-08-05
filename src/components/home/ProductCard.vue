<template>
  <div class="card" @click="goToProductDetail">
    <p class="bank">{{ product.korCoNm }}</p>
    <p class="name">{{ product.productName }}</p>
    <p class="rate">
      최대 금리:
      <strong>
        {{ `${product.maxRate}%` }}
      </strong>
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const props = defineProps({
  product: Object,
});

const goToProductDetail = () => {
  const { subcategoryName, productId, saveTrm, intrRateType, rstvValue } = props.product;
  let routePath = '';

  if (subcategoryName === '예금') {
    routePath = `/products/deposit/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}`;
  } else if (subcategoryName === '적금') {
    routePath = `/products/savings/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}&rsrvType=${rstvValue}`;
  } else if (subcategoryName === '연금') {
    routePath = `/products/pension/${productId}?saveTrm=${saveTrm}&intrRateType=${intrRateType}`;
  } else {
    routePath = `/products/unknown/${productId}`;
  }

  router.push(routePath);
};
</script>

<style scoped>
.card {
  width: 10rem;
  height: 9rem;
  background: var(--color-white);
  border: 1px solid var(--color-light);
  border-radius: 0.6rem;
  padding: 1rem;
  margin-right: 0.8rem;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.bank {
  font-size: 0.8rem;
  color: gray;
  margin-bottom: 0.2rem;
}

.name {
  height: 3rem;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0.4rem 0;
}

.rate {
  font-size: 0.85rem;
  color: var(--color-sub);
  margin-top: 0.2rem;
}
</style>
