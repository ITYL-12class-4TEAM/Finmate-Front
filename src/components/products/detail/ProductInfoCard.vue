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
/* ==========================================================================
   1. 카드 기본 레이아웃
   - 상세 페이지의 다른 카드들과 일관된 디자인 적용
   ========================================================================== */
.product-card {
  background: #ffffff;
  border-radius: 0.75rem; /* 12px, 다른 컴포넌트와 통일 */
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: flex-start;
  padding: 0.5rem 0.75rem; /* 20px 16px, 다른 카드와 여백 통일 */
  gap: 1rem; /* 16px */
}

/* ==========================================================================
   2. 은행 로고 및 이니셜
   ========================================================================== */
.bank-logo {
  width: 3rem; /* 48px */
  height: 3rem; /* 48px */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 0.0625rem solid var(--color-bg-light);
  border-radius: 50%;
  overflow: hidden;
}

.bank-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 로고가 꽉 차도록 contain에서 cover로 변경 */
}

.bank-initial {
  width: 100%;
  height: 100%;
  background: var(--color-bg-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem; /* 20px */
  font-weight: 700;
  color: var(--color-main);
}

/* ==========================================================================
   3. 상품 정보 (은행명, 상품명, 태그)
   ========================================================================== */
.product-info {
  flex: 1;
  min-width: 0;
}

.bank-name {
  font-size: 0.875rem; /* 14px */
  color: var(--color-sub);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.product-name {
  font-size: 1.25rem; /* 20px, 상품명 강조 */
  margin: 0 0 0.75rem 0;
  color: var(--color-main);
  font-weight: 700;
  line-height: 1.4;
  word-break: keep-all;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem; /* 8px */
}

.tag {
  display: inline-block;
  font-size: 0.75rem; /* 12px */
  padding: 0.25rem 0.625rem; /* 4px 10px */
  border-radius: 0.875rem; /* 14px, 알약 형태 */
  font-weight: 500;
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
  border: 0.0625rem solid #e0e0e0;
}
</style>
