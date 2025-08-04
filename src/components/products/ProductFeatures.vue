<template>
  <div class="key-features">
    <h3 class="section-title">상품 주요 정보</h3>
    <div class="feature-grid">
      <div class="feature-item">
        <div class="feature-icon">💰</div>
        <div class="feature-content">
          <div class="feature-label">최소 가입금액</div>
          <div class="feature-value">
            {{ formatCurrency(product.productDetail?.minDepositAmount) }}
          </div>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">📈</div>
        <div class="feature-content">
          <div class="feature-label">최대 가입금액</div>
          <div class="feature-value">
            {{ formatCurrency(product.productDetail?.maxDepositAmount) }}
          </div>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon">⏰</div>
        <div class="feature-content">
          <div class="feature-label">가입 기간</div>
          <div class="feature-value">
            {{ selectedOption?.save_trm || selectedOption?.saveTrm || "-" }}개월
          </div>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon">📅</div>
        <div class="feature-content">
          <div class="feature-label">공시 시작일</div>
          <div class="feature-value">
            {{ formatDate(product.productDetail?.dcls_strt_day) }}
          </div>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon">💼</div>
        <div class="feature-content">
          <div class="feature-label">금리 유형</div>
          <div class="feature-value">
            {{ selectedOption?.intr_rate_type_nm || "정보 없음" }}
          </div>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon">🔄</div>
        <div class="feature-content">
          <div class="feature-label">가입 방법</div>
          <div class="feature-value">{{ product.productDetail?.join_way || "제한 없음" }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "ProductFeatures",
  props: {
    product: {
      type: Object,
      required: true,
    },
    selectedOption: {
      type: Object,
      default: null,
    },
    formatCurrency: {
      type: Function,
      required: true,
    },
    formatDate: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
.key-features {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  margin: 0 0 1rem 0;
  color: var(--color-main);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.feature-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-light);
  border-radius: 50%;
  font-size: 1rem;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
  min-width: 0; /* 텍스트 줄바꿈을 위해 필요 */
}

.feature-label {
  font-size: 0.8125rem;
  color: var(--color-sub);
  margin-bottom: 0.125rem;
}

.feature-value {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
