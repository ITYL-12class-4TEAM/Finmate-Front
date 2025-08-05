<template>
  <div class="wishlist-products">
    <!-- 제목은 박스 바깥에 위치 -->
    <div class="header-section">
      <h4 class="section-title">{{ title }}</h4>
    </div>

    <div class="product-box">
      <div class="products-container">
        <div
          v-for="product in displayProducts"
          :key="product.productId || product.productName"
          class="product-card"
          @click="handleProductClick(product)"
        >
          <!-- 상품 상단 정보 -->
          <div class="product-header">
            <div class="product-badge">
              <span class="category-badge">{{
                product.categoryName || '금융상품'
              }}</span>
              <span v-if="product.subcategoryName" class="subcategory-badge">
                {{ product.subcategoryName }}
              </span>
            </div>
            <div class="wishlist-count">
              <span class="star-icon-wrapper">
                <i class="bi bi-star-fill star-icon"></i>
              </span>
              <span class="count">{{
                formatCount(product.wishlistCount)
              }}</span>
            </div>
          </div>

          <!-- 상품명 및 금융회사 -->
          <div class="product-info">
            <h5 class="product-name">
              {{ product.productName || '상품명 없음' }}
            </h5>
            <p class="company-name">{{ product.korCoNm || '금융기관' }}</p>
          </div>

          <!-- 금리 정보 -->
          <div class="rate-info">
            <div v-if="hasBaseRate(product)" class="rate-section">
              <span class="rate-label">기본금리</span>
              <span class="rate-value base-rate">
                {{ formatRate(product.baseRate) }}%
              </span>
            </div>
            <div v-if="hasMaxRate(product)" class="rate-section">
              <span class="rate-label">{{ getMaxRateLabel(product) }}</span>
              <span class="rate-value max-rate">
                {{ formatRate(product.maxRate) }}%
              </span>
            </div>
            <!-- 금리 정보가 없는 경우 -->
            <div
              v-if="!hasBaseRate(product) && !hasMaxRate(product)"
              class="rate-section"
            >
              <span class="rate-label">금리정보</span>
              <span class="rate-value no-rate"> 상세 문의 </span>
            </div>
          </div>

          <!-- 상품 세부 정보 -->
          <div v-if="hasDetailInfo(product)" class="product-details">
            <div v-if="product.saveTrm" class="detail-item">
              <span class="detail-label">예치기간</span>
              <span class="detail-value">{{ product.saveTrm }}개월</span>
            </div>
            <div v-if="product.rstvValue" class="detail-item">
              <span class="detail-label">적립방식</span>
              <span class="detail-value">{{ product.rstvValue }}</span>
            </div>
            <div v-if="product.rstvTypeName" class="detail-item">
              <span class="detail-label">유형</span>
              <span class="detail-value">{{ product.rstvTypeName }}</span>
            </div>
          </div>

          <!-- 상품 유형 및 외부 링크 -->
          <div class="product-footer">
            <div v-if="product.prdtTypeName" class="product-type">
              <span class="type-badge">{{ product.prdtTypeName }}</span>
            </div>
            <div
              v-if="product.externalLink && product.externalLink.trim()"
              class="external-link"
            >
              <a
                :href="product.externalLink"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop="handleExternalLink(product.externalLink)"
                class="link-btn"
              >
                상세보기 →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div
        v-if="!displayProducts || displayProducts.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">⭐</div>
        <p class="empty-text">관심상품이 없습니다</p>
        <p class="empty-subtext">마음에 드는 상품을 찜해보세요!</p>
      </div>
      <button
        v-if="moreUrl && displayProducts.length > 0"
        @click="navigateToMore"
        class="more-btn"
      >
        더보기 →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// Props 정의
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '⭐ 관심상품',
  },
  moreUrl: {
    type: String,
    default: '',
  },
  maxDisplay: {
    type: Number,
    default: 5,
  },
});

// Emits 정의
const emit = defineEmits(['navigate-to-more', 'product-click']);

// 표시할 상품 목록 (최대 개수 제한)
const displayProducts = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return [];
  return props.data.slice(0, props.maxDisplay);
});

// 금리 관련 헬퍼 함수들 (수정됨 - null 체크 강화)
const hasBaseRate = (product) => {
  return (
    product.baseRate !== null &&
    product.baseRate !== undefined &&
    product.baseRate > 0
  );
};

const hasMaxRate = (product) => {
  return (
    product.maxRate !== null &&
    product.maxRate !== undefined &&
    product.maxRate > 0
  );
};

const getMaxRateLabel = (product) => {
  if (hasBaseRate(product)) {
    return '우대금리';
  } else {
    return '최고금리';
  }
};

const hasDetailInfo = (product) => {
  return product.saveTrm || product.rstvValue || product.rstvTypeName;
};

// 금리 포맷팅 (수정됨)
const formatRate = (rate) => {
  if (rate === null || rate === undefined || rate === 0) return '0.00';
  return typeof rate === 'number'
    ? rate.toFixed(2)
    : parseFloat(rate || 0).toFixed(2);
};

// 숫자 포맷팅 (찜 개수 등) (수정됨)
const formatCount = (count) => {
  if (count === null || count === undefined || count === 0) return '0';
  return count.toLocaleString();
};

// 이벤트 핸들러
const navigateToMore = () => {
  emit('navigate-to-more', props.moreUrl);
};
const handleProductClick = (product) => {
  if (!product || !product.productId) return;

  const { productId, subcategoryName, saveTrm, intrRateType, rsrvType } =
    product;

  let path = '';
  let query = {};

  if (subcategoryName === '정기예금') {
    path = `/products/deposit/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
  } else if (subcategoryName === '자유적금') {
    path = `/products/savings/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
    if (rsrvType) query.rsrvType = rsrvType;
  } else if (subcategoryName === '연금저축') {
    path = `/products/pension/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
  } else {
    path = `/products/unknown/${productId}`;
  }

  router.push({ path, query });
};

const handleExternalLink = (link) => {
  console.log('외부 링크 클릭:', link);
  // 외부 링크 클릭 시 별도 처리가 필요한 경우 여기에 추가
};
</script>

<style scoped>
.wishlist-products {
  padding: 0;
  background: transparent;
  border: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c2c2c;
  font-size: 0.875rem;
  width: 100%;
  max-width: 14rem;
  margin: 0 auto;
  overflow-x: hidden;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem; /* 10px */
  padding: 0 0.3125rem; /* 5px */
}

.product-box {
  width: 100%;
  max-width: 20rem;
  max-width: 20rem;
  overflow-x: hidden;
  padding: 0.75rem 0.75rem 0.8rem 0.75rem; /* 12px 12px 13px 12px */
  background: #fff;
  border-radius: 1rem; /* 16px */
  border: 0.0625rem solid #d9d9d9; /* 1px */
  box-shadow: 0 0.1875rem 0.625rem rgba(0, 0, 0, 0.05); /* 3px 10px */
  transition: box-shadow 0.25s ease;
}
.product-box:hover {
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1); /* 8px 24px */
}

.section-title {
  font-size: 1rem; /* 16px */
  font-weight: 700;
  color: #222;
  letter-spacing: 0.02em;
  margin: 0;
  text-shadow: 0 0.0625rem 0.0625rem rgba(0, 0, 0, 0.05); /* 1px */
}

.more-btn {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  color: var(--color-white);
  border: none;
  padding: 0.40625rem 0.625rem; /* 6.5px 10px */
  border-radius: 0.3125rem; /* 5px */
  cursor: pointer;
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
  overflow: hidden;
  margin-top: 0.625rem; /* 10px */
}

.more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.more-btn:hover::before {
  left: 100%;
}

.more-btn:hover {
  transform: translateY(-0.078125rem); /* 1.25px */
  box-shadow: 0 0.234375rem 0.78125rem rgba(90, 106, 207, 0.4); /* 3.75px 12.5px */
}

.products-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 0.625rem;
  padding-bottom: 0.5rem;
  width: 100%;
}

.product-card {
  flex: 0 0 100%;
  min-width: 100%;
  max-width: 100%;
  scroll-snap-align: center;
}
.product-card:last-child {
  margin-right: 0;
}
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.375rem; /* 6px */
}

.product-badge {
  display: flex;
  gap: 0.25rem; /* 4px */
  flex-wrap: nowrap;
}

.category-badge {
  background: linear-gradient(135deg, #4a6cf7 0%, #6b82ff 100%);
  color: white;
  font-size: 0.46875rem; /* 7.5px */
  padding: 0.15625rem 0.4375rem; /* 2.5px 7px */
  border-radius: 1.25rem; /* 20px */
  font-weight: 600;
  box-shadow: 0 0.0625rem 0.3125rem rgba(74, 108, 247, 0.3); /* 1px 5px */
  white-space: nowrap;
}

.subcategory-badge {
  background: #dbe4ff;
  color: #4a6cf7;
  font-size: 0.45rem; /* 7.2px */
  padding: 0.15625rem 0.375rem; /* 2.5px 6px */
  border-radius: 1.125rem; /* 18px */
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 0.0625rem 0.1875rem rgba(74, 108, 247, 0.1); /* 1px 3px */
}

.wishlist-count {
  display: flex;
  align-items: center;
  gap: 0.1875rem; /* 3px */
  font-size: 0.5rem; /* 8px */
  color: #6b7280;
  user-select: none;
  font-weight: 500;
}

.star-icon-wrapper {
  display: inline-flex;
  align-items: center;
  margin-left: 0.3125rem; /* 5px */
}

.star-icon {
  font-size: 0.6875rem; /* 11px */
  color: #f5b301;
  text-shadow: 0 0 0.25rem rgba(245, 179, 1, 0.6); /* 4px */
  user-select: none;
}

.product-info {
  margin-bottom: 0.375rem; /* 6px */
  flex-grow: 1;
}

.product-name {
  font-size: 0.59375rem; /* 9.5px */
  font-weight: 700;
  color: #222222;
  margin: 0 0 0.1875rem 0; /* 0 0 3px 0 */
  line-height: 1.4;
}

.company-name {
  font-size: 0.5rem; /* 8px */
  color: #8a8a8a;
  margin: 0;
  letter-spacing: 0.01em;
}

.rate-info {
  display: flex;
  gap: 0.75rem; /* 12px */
  margin-bottom: 0.375rem; /* 6px */
  font-family: 'Courier New', Courier, monospace;
}

.rate-section {
  display: flex;
  flex-direction: column;
  gap: 0.09375rem; /* 1.5px */
}

.rate-label {
  font-size: 0.45rem; /* 7.2px */
  color: #a0a0a0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rate-value {
  font-size: 0.5625rem; /* 9px */
  font-weight: 700;
}

.base-rate {
  color: #333333;
}

.max-rate {
  color: #4a6cf7;
  text-shadow: 0 0 0.1875rem rgba(74, 108, 247, 0.5); /* 3px */
}

.no-rate {
  color: #999999;
  font-size: 0.5rem; /* 8px */
  font-weight: 600;
  font-style: italic;
}

.product-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem; /* 10px */
  margin-bottom: 0.375rem; /* 6px */
  padding: 0.3125rem 0.5rem; /* 5px 8px */
  background: #f0f4ff;
  border-radius: 0.75rem; /* 12px */
  box-shadow: inset 0 0 0.5rem rgba(74, 108, 247, 0.1); /* 8px */
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.09375rem; /* 1.5px */
  min-width: 6.25rem; /* 100px */
}

.detail-label {
  font-size: 0.45rem; /* 7.2px */
  color: #7a7a7a;
  font-weight: 600;
}

.detail-value {
  font-size: 0.5rem; /* 8px */
  font-weight: 700;
  color: #2c2c2c;
  white-space: nowrap;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.1875rem; /* 3px */
  gap: 0.625rem; /* 10px */
  flex-wrap: wrap;
}

.product-type {
  flex: 1;
}

.type-badge {
  background: #e2e8f9;
  color: #4a6cf7;
  font-size: 0.46875rem; /* 7.5px */
  padding: 0.1875rem 0.46875rem; /* 3px 7.5px */
  border-radius: 1rem; /* 16px */
  font-weight: 600;
  box-shadow: 0 0.125rem 0.375rem rgba(74, 108, 247, 0.15); /* 2px 6px */
  user-select: none;
}

.external-link {
  flex-shrink: 0;
}

.link-btn {
  background: linear-gradient(90deg, #4a6cf7, #6b82ff);
  color: white;
  text-decoration: none;
  font-size: 0.5rem; /* 8px */
  padding: 0.25rem 0.5625rem; /* 4px 9px */
  border-radius: 1.125rem; /* 18px */
  font-weight: 700;
  box-shadow: 0 0.1875rem 0.5rem rgba(74, 108, 247, 0.4); /* 3px 8px */
  transition: all 0.3s ease;
  user-select: none;
}

.link-btn:hover {
  background: linear-gradient(90deg, #3a52d6, #4a6cf7);
  transform: translateX(0.25rem); /* 4px */
  box-shadow: 0 0.3125rem 0.9375rem rgba(58, 82, 214, 0.6); /* 5px 15px */
}

.empty-state {
  text-align: center;
  padding: 1.875rem 0.625rem; /* 30px 10px */
  color: #a0a0a0;
  user-select: none;
}

.empty-icon {
  font-size: 1.875rem; /* 30px */
  margin-bottom: 0.375rem; /* 6px */
  color: #c5c5c5;
  text-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05); /* 1px 3px */
}

.empty-text {
  font-size: 0.6875rem; /* 11px */
  font-weight: 600;
  margin: 0 0 0.25rem 0; /* 0 0 4px 0 */
  color: #444444;
}

.empty-subtext {
  font-size: 0.5625rem; /* 9px */
  margin: 0;
  color: #7a7a7a;
}

@media (max-width: 26.875rem) {
  /* 430px */
  .wishlist-products {
    padding: 0.4rem;
  }

  .product-card {
    min-width: 8.25rem; /* 180px */
  }

  .rate-info {
    gap: 0.5625rem; /* 9px */
  }

  .product-details {
    gap: 0.4375rem; /* 7px */
  }

  .product-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem; /* 4px */
  }

  .section-title {
    font-size: 1rem; /* 16px */
  }

  .more-btn {
    font-size: 0.75rem; /* 12px */
    padding: 0.3125rem 0.75rem; /* 5px 12px */
  }

  .link-btn {
    font-size: 0.75rem; /* 12px */
    padding: 0.1875rem 0.4375rem; /* 3px 7px */
  }
}
</style>
