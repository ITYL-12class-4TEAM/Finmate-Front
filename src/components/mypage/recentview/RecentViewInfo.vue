<!-- RecentViewInfo.vue -->
<template>
  <div class="recent-view-info">
    <!-- 상품명과 시간 -->
    <div class="product-header">
      <h6 class="product-name">{{ product.productName || '상품명 없음' }}</h6>
      <div class="viewed-time">
        <i class="fa-regular fa-clock"></i>
        <span>{{ formatViewedTime(product.viewedAt) }}</span>
      </div>
    </div>

    <!-- 은행명 -->
    <p class="company-name">{{ product.korCoNm || '금융기관' }}</p>

    <!-- 금리 정보 -->
    <div v-if="hasRateInfo(product)" class="rate-section">
      <div v-if="hasBaseRate(product)" class="rate-item">
        <span class="rate-label">기본</span>
        <span class="rate-value">{{ formatRate(product.baseRate) }}%</span>
      </div>
      <div v-if="hasMaxRate(product)" class="rate-item">
        <span class="rate-label">{{ getMaxRateLabel(product) }}</span>
        <span class="rate-value highlight">{{ formatRate(product.maxRate) }}%</span>
      </div>
      <div v-if="!hasBaseRate(product) && !hasMaxRate(product)" class="rate-item">
        <span class="rate-label">금리</span>
        <span class="rate-value no-rate">문의</span>
      </div>
    </div>

    <!-- 상품 세부 정보 -->
    <div v-if="hasDetailInfo(product)" class="details-section">
      <div class="detail-tags">
        <span v-if="product.saveTrm" class="detail-tag">
          <i class="fa-regular fa-calendar"></i>
          {{ product.saveTrm }}개월
        </span>
        <span v-if="product.rstvValue" class="detail-tag">
          <i class="fa-solid fa-won-sign"></i>
          {{ formatAmount(getRstvValue(product.rstvValue)) }}
        </span>
        <span v-if="product.intrRateType" class="detail-tag">
          <i class="fa-solid fa-chart-line"></i>
          {{ getIntrRateType(product.intrRateType) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
});

const getIntrRateType = (intrRateType) => {
  if (intrRateType === 'S') return '단리';
  if (intrRateType === 'M') return '복리';
  return intrRateType;
};

const getRstvValue = (rstvValue) => {
  if (rstvValue === 'S') return '정액적립식';
  if (rstvValue === 'F') return '자유적립식';
  return rstvValue;
};

defineEmits(['toggle-favorite']);

// 금리 관련 헬퍼 함수들
const hasBaseRate = (product) => {
  return product.baseRate !== null && product.baseRate !== undefined && product.baseRate > 0;
};

const hasMaxRate = (product) => {
  return product.maxRate !== null && product.maxRate !== undefined && product.maxRate > 0;
};

const hasRateInfo = (product) => {
  return hasBaseRate(product) || hasMaxRate(product);
};

const getMaxRateLabel = (product) => {
  return hasBaseRate(product) ? '우대' : '최고';
};

const hasDetailInfo = (product) => {
  return product.saveTrm || product.rstvValue || product.intrRateType;
};

// 포맷팅 함수들
const formatRate = (rate) => {
  if (rate === null || rate === undefined || rate === 0) return '0.00';
  return typeof rate === 'number' ? rate.toFixed(2) : parseFloat(rate || 0).toFixed(2);
};

const formatAmount = (amount) => {
  if (!amount) return amount;
  // 숫자인 경우 천단위 콤마 추가
  if (typeof amount === 'number') {
    return amount.toLocaleString();
  }
  return amount;
};

const formatViewedTime = (viewedAt) => {
  if (!viewedAt) return '';

  try {
    const viewedDate = new Date(viewedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - viewedDate) / (1000 * 60));

    if (diffInMinutes < 1) return '방금';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;

    return viewedDate.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return '';
  }
};
</script>

<style scoped>
.recent-view-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 상품명과 시간 */
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.product-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.viewed-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--color-light);
  white-space: nowrap;
  flex-shrink: 0;
}

.viewed-time i {
  font-size: 0.625rem;
}

/* 은행명 */
.company-name {
  font-size: 0.8125rem;
  color: var(--color-sub);
  margin: 0;
  font-weight: 500;
}

/* 금리 섹션 */
.rate-section {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #f1f5f9;
}

.rate-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  align-items: center;
}

.rate-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-sub);
}

.rate-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
}

.rate-value.highlight {
  color: #059669;
  font-weight: 700;
}

.rate-value.no-rate {
  color: var(--color-light);
  font-size: 0.75rem;
  font-style: italic;
}

/* 상세 정보 */
.details-section {
  margin-top: 0.25rem;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.detail-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--color-sub);
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #f1f5f9;
}

.detail-tag i {
  font-size: 0.625rem;
}

/* 액션 섹션 */
.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.left-actions,
.right-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 즐겨찾기 버튼 */
.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #e2e8f0;
  background: var(--color-white);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #cbd5e1;
}

.favorite-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.favorite-btn.active {
  background: #ef4444;
  border-color: #ef4444;
  color: var(--color-white);
}

.favorite-btn i {
  font-size: 0.8125rem;
}

/* 상세보기 링크 */
.detail-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--color-main);
  color: var(--color-white);
  text-decoration: none;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.detail-link:hover {
  background: var(--color-sub);
  color: var(--color-white);
  text-decoration: none;
}

.detail-link i {
  font-size: 0.6875rem;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .recent-view-info {
    gap: 0.375rem;
  }

  .product-header {
    gap: 0.5rem;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .viewed-time {
    font-size: 0.625rem;
  }

  .company-name {
    font-size: 0.75rem;
  }

  .rate-section {
    padding: 0.375rem 0.625rem;
    gap: 0.75rem;
  }

  .rate-label {
    font-size: 0.625rem;
  }

  .rate-value {
    font-size: 0.8125rem;
  }

  .detail-tag {
    font-size: 0.625rem;
    padding: 0.1875rem 0.375rem;
  }

  .detail-tag i {
    font-size: 0.5625rem;
  }

  .favorite-btn {
    width: 1.75rem;
    height: 1.75rem;
  }

  .favorite-btn i {
    font-size: 0.75rem;
  }

  .detail-link {
    padding: 0.3125rem 0.625rem;
    font-size: 0.6875rem;
  }

  .detail-link i {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .product-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .viewed-time {
    align-self: flex-end;
  }

  .rate-section {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .rate-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .action-section {
    flex-direction: row-reverse;
    justify-content: space-between;
  }
}
</style>
