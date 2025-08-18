<!-- ProductItemInfo.vue (FavoriteItemInfo.vue) -->
<template>
  <div class="favorite-item-info">
    <!-- 상품명과 즐겨찾기 수 -->
    <div class="product-header">
      <h6 class="product-name">{{ favorite.productName || '상품명 없음' }}</h6>
      <div class="favorite-count">
        <i class="fa-solid fa-star"></i>
        <span>{{ formatCount(favorite.wishlistCount) }}명</span>
      </div>
    </div>

    <!-- 은행명 -->
    <p class="company-name">{{ favorite.korCoNm || '금융기관' }}</p>

    <!-- 금리 정보 -->
    <div v-if="hasRateInfo(favorite)" class="rate-section">
      <div v-if="hasBaseRate(favorite)" class="rate-item">
        <span class="rate-label">기본</span>
        <span class="rate-value">{{ formatRate(favorite.baseRate) }}%</span>
      </div>
      <div v-if="hasMaxRate(favorite)" class="rate-item">
        <span class="rate-label">{{ getMaxRateLabel(favorite) }}</span>
        <span class="rate-value highlight">{{ formatRate(favorite.maxRate) }}%</span>
      </div>
      <div v-if="!hasBaseRate(favorite) && !hasMaxRate(favorite)" class="rate-item">
        <span class="rate-label">금리</span>
        <span class="rate-value no-rate">문의</span>
      </div>
    </div>

    <!-- 상품 세부 정보 -->
    <div v-if="hasDetailInfo(favorite)" class="details-section">
      <div class="detail-tags">
        <span v-if="favorite.saveTrm" class="detail-tag">
          <i class="fa-regular fa-calendar"></i>
          {{ favorite.saveTrm }}개월
        </span>
        <span v-if="favorite.rstvValue" class="detail-tag">
          <i class="fa-solid fa-won-sign"></i>
          {{ formatAmount(getRstvValue(favorite.rstvValue)) }}
        </span>
        <span v-if="favorite.intrRateType" class="detail-tag">
          <i class="fa-solid fa-chart-line"></i>
          {{ getIntrRateType(favorite.intrRateType) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  favorite: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: true, // 즐겨찾기 목록이므로 기본값 true
  },
});

//s냐 m이냐
const getRstvValue = (rstvValue) => {
  if (rstvValue === 'S') return '정액적립식';
  if (rstvValue === 'F') return '자유적립식';
  return rstvValue;
};

const getIntrRateType = (intrRateType) => {
  if (intrRateType === 'S') return '단리';
  if (intrRateType === 'M') return '복리';
  return intrRateType;
};

const emit = defineEmits(['toggle-favorite']);

// 금리 관련 헬퍼 함수들
const hasBaseRate = (favorite) => {
  return favorite.baseRate !== null && favorite.baseRate !== undefined && favorite.baseRate > 0;
};

const hasMaxRate = (favorite) => {
  return favorite.maxRate !== null && favorite.maxRate !== undefined && favorite.maxRate > 0;
};

const hasRateInfo = (favorite) => {
  return hasBaseRate(favorite) || hasMaxRate(favorite);
};

const getMaxRateLabel = (favorite) => {
  return hasBaseRate(favorite) ? '우대' : '최고';
};

const hasDetailInfo = (favorite) => {
  return favorite.saveTrm || favorite.rstvValue || favorite.intrRateType;
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

const formatCount = (count) => {
  if (!count || count === 0) return '0';
  if (count >= 10000) {
    const man = Math.floor(count / 10000);
    return `${man}만`;
  }
  if (count >= 1000) {
    const thousand = Math.floor(count / 1000);
    return `${thousand}천`;
  }
  return new Intl.NumberFormat('ko-KR').format(count);
};

const toggleFavorite = () => {
  emit('toggle-favorite', props.favorite.productId);
};
</script>

<style scoped>
.favorite-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 상품명과 즐겨찾기 수 */
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

.favorite-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--color-light);
  white-space: nowrap;
  flex-shrink: 0;
}

.favorite-count i {
  font-size: 0.625rem;
  color: #fbbf24;
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
  border-color: #fbbf24;
  color: #fbbf24;
}

.favorite-btn.active {
  background: #fbbf24;
  border-color: #fbbf24;
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
  .favorite-item-info {
    gap: 0.375rem;
  }

  .product-header {
    gap: 0.5rem;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .favorite-count {
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

  .favorite-count {
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
