<template>
    <div class="product-card">
      <div class="card-header">
        <div class="bank-logo">
          <img v-if="bankLogo" :src="bankLogo" :alt="product.kor_co_nm || product.korCoNm" />
          <div v-else class="bank-initial">{{ bankInitial }}</div>
        </div>
        <div class="product-info">
          <div class="bank-name">{{ product.kor_co_nm || product.korCoNm }}</div>
          <h2 class="product-name">{{ product.product_name || product.finPrdtNm }}</h2>
          <div class="product-tags">
            <span v-if="product.is_digital_only" class="tag digital">디지털 전용</span>
            <span class="tag category">{{ categoryName }}</span>
            <span class="tag interest-type">{{ interestTypeName }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script>
  export default {
    name: 'ProductInfoCard',
    props: {
      product: {
        type: Object,
        required: true
      },
      bankLogo: {
        type: String,
        default: null
      },
      bankInitial: {
        type: String,
        default: ''
      },
      categoryName: {
        type: String,
        default: '금융상품'
      },
      interestTypeName: {
        type: String,
        default: ''
      }
    }
  }
  </script>
  <style scoped>
  .product-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
    overflow: hidden;
  }
  
  .card-header {
    display: flex;
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-bg-light);
  }
  
  .bank-logo {
    width: 3.75rem;
    height: 3.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    flex-shrink: 0;
  }
  
  .bank-logo img {
    max-width: 100%;
    max-height: 100%;
  }
  
  .bank-initial {
    width: 100%;
    height: 100%;
    background-color: var(--color-bg-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--color-main);
  }
  
  .product-info {
    flex: 1;
  }
  
  .bank-name {
    font-size: 0.875rem;
    color: var(--color-sub);
    margin-bottom: 0.25rem;
  }
  
  .product-name {
    font-size: 1.25rem;
    margin: 0 0 0.75rem 0;
    color: var(--color-main);
  }
  
  .product-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .tag {
    display: inline-block;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  
  .tag.digital {
    background-color: var(--color-main);
    color: white;
  }
  
  .tag.category {
    background-color: var(--color-sub);
    color: white;
  }
  
  .tag.interest-type {
    background-color: var(--color-bg-light);
    color: var(--color-sub);
  }
  </style>
