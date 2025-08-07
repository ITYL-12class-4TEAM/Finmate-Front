<template>
  <div class="product-card">
    <div class="card-header">
      <div class="bank-logo">
        <img
          v-if="bankLogo"
          :src="bankLogo"
          :alt="product.kor_co_nm || product.korCoNm"
          loading="lazy"
        />
        <div v-else class="bank-initial" aria-label="은행 이니셜">
          {{ bankInitial }}
        </div>
      </div>
      <div class="product-info">
        <div class="bank-name">
          {{ product.kor_co_nm || product.korCoNm }}
        </div>
        <h2 class="product-name">
          {{ product.product_name || product.finPrdtNm }}
        </h2>
        <div class="product-tags">
          <span v-if="product.is_digital_only" class="tag digital">디지털 전용</span>
          <span v-if="categoryName" class="tag category">{{ categoryName }}</span>
          <span v-if="interestTypeName" class="tag interest-type">{{ interestTypeName }}</span>
        </div>
      </div>
      <WishButton />
    </div>
  </div>
</template>

<script setup>
import WishButton from '@/components/products/wishlist/WishlistButton.vue';

const props = defineProps({
  product: { type: Object, required: true },
  bankLogo: { type: String, default: null },
  bankInitial: { type: String, default: '' },
  categoryName: { type: String, default: '금융상품' },
  interestTypeName: { type: String, default: '' },
});
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(45, 51, 107, 0.06);
  margin-bottom: 1.25rem;
  overflow: hidden;
  max-width: 430px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  padding: 1.1rem 1rem 1.1rem 1.1rem;
  border-bottom: 1px solid var(--color-bg-light);
  gap: 0.9rem;
}

.bank-logo {
  width: 3.2rem;
  height: 3.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bank-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bank-initial {
  width: 100%;
  height: 100%;
  background: var(--color-bg-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-main);
}

.product-info {
  flex: 1;
  min-width: 0;
}

.bank-name {
  font-size: 0.82rem;
  color: var(--color-sub);
  margin-bottom: 0.22rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-name {
  font-size: 1.08rem;
  margin: 0 0 0.65rem 0;
  color: var(--color-main);
  font-weight: 700;
  line-height: 1.3;
  word-break: keep-all;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tag {
  display: inline-block;
  font-size: 0.71rem;
  padding: 0.18rem 0.56rem;
  border-radius: 0.25rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.tag.digital {
  background: var(--color-main);
  color: #fff;
}

.tag.category {
  background: var(--color-sub);
  color: #fff;
}

.tag.interest-type {
  background: var(--color-bg-light);
  color: var(--color-main);
}

@media (max-width: 430px) {
  .product-card {
    margin-bottom: 0.8rem;
  }
  .card-header {
    padding: 1rem 0.8rem 1rem 1rem;
    gap: 0.65rem;
  }
  .bank-logo,
  .bank-initial {
    width: 2.6rem;
    height: 2.6rem;
    font-size: 1.05rem;
  }
  .product-name {
    font-size: 0.97rem;
    margin-bottom: 0.45rem;
  }
}
</style>
