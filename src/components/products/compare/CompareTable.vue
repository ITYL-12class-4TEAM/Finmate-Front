<template>
  <div class="mobile-compare-container">
    <!-- 상품 헤더 영역 (가로 스크롤) -->
    <div class="products-header-scroll">
      <div v-for="item in items" :key="item.productId + item.saveTrm" class="product-header-card">
        <div class="bank-name">{{ item.korCoNm }}</div>
        <div class="product-name">{{ item.productName }}</div>
        <button
          class="remove-btn"
          @click="$emit('remove', item.productId, item.saveTrm, item.intrRateType || 'S')"
        >
          ×
        </button>
      </div>
    </div>

    <!-- 비교 정보 영역 -->
    <div class="compare-info-section">
      <!-- 기본 금리 -->
      <div class="info-row">
        <div class="info-label">기본 금리</div>
        <div class="info-values">
          <div v-for="item in items" :key="item.productId + '_basic'" class="info-value highlight">
            {{ formatRate(item.intrRate) }}
          </div>
        </div>
      </div>

      <!-- 우대 금리 -->
      <div class="info-row">
        <div class="info-label">우대 금리</div>
        <div class="info-values">
          <div
            v-for="item in items"
            :key="item.productId + '_special'"
            class="info-value highlight special"
          >
            {{ formatRate(item.intrRate2) }}
          </div>
        </div>
      </div>

      <!-- 우대 조건 -->
      <div class="info-row tall">
        <div class="info-label">우대 조건</div>
        <div class="info-values">
          <div v-for="item in items" :key="item.productId + '_tags'" class="info-value tags-cell">
            <div class="tags-container">
              <template v-if="item && (item.preferential_tags || item.preferentialTags)">
                <span
                  v-for="(tag, tagIndex) in (
                    item.preferential_tags ||
                    item.preferentialTags ||
                    ''
                  ).split(',')"
                  :key="tagIndex"
                  class="tag-pill"
                >
                  #{{ tag.trim() }}
                </span>
              </template>
              <span v-else class="no-tags">태그 없음</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 가입 기간 -->
      <div class="info-row">
        <div class="info-label">가입 기간</div>
        <div class="info-values">
          <div v-for="item in items" :key="item.productId + '_term'" class="info-value">
            {{ item.saveTrm }}개월
          </div>
        </div>
      </div>

      <!-- 최소 가입금액 -->
      <div class="info-row">
        <div class="info-label">최소 금액</div>
        <div class="info-values">
          <div v-for="item in items" :key="item.productId + '_min'" class="info-value">
            {{ getMinDepositForProduct(item.productId) }}
          </div>
        </div>
      </div>

      <!-- 최대 가입금액 -->
      <div class="info-row">
        <div class="info-label">최대 금액</div>
        <div class="info-values">
          <div v-for="item in items" :key="item.productId + '_max'" class="info-value">
            {{ getMaxDepositForProduct(item.productId) }}
          </div>
        </div>
      </div>

      <!-- 가입 대상 -->
      <div class="info-row">
        <div class="info-label">가입 대상</div>
        <div class="info-values">
          <div v-for="item in items" :key="item.productId + '_member'" class="info-value">
            {{ item.join_member || item.joinMember || '제한 없음' }}
          </div>
        </div>
      </div>

      <!-- 금리 유형 -->
      <div class="info-row">
        <div class="info-label">금리 유형</div>
        <div class="info-values">
          <div v-for="item in items" :key="item.productId + '_type'" class="info-value">
            {{ getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType || 'S') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 액션 버튼 영역 -->
    <div class="action-section">
      <div class="action-buttons-row">
        <div v-for="item in items" :key="item.productId + '_actions'" class="action-button-group">
          <button
            class="detail-btn"
            @click="$emit('viewDetail', item.productId, item.productType, item.saveTrm)"
          >
            상세
          </button>
          <button class="join-btn" @click="$emit('joinProduct', item)">가입</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
  compareData: {
    type: Object,
    default: null,
  },
  getMinDepositForProduct: {
    type: Function,
    required: true,
  },
  getMaxDepositForProduct: {
    type: Function,
    required: true,
  },
  getInterestTypeForProduct: {
    type: Function,
    required: true,
  },
});

defineEmits(['remove', 'viewDetail', 'joinProduct']);

// 금리 포맷팅
const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};
</script>

<style scoped>
/* FinMate Color */
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
  --color-white: #ffffff;
  --color-accent: #e91e63;
}

/* ==========================================================================
   모바일 컨테이너 (앱 화면 기준 375px)
   ========================================================================== */
.mobile-compare-container {
  width: 100%;
  max-width: 23.4375rem; /* 375px */
  background-color: var(--color-white);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 0 auto;
}

/* ==========================================================================
   상품 헤더 영역 (가로 스크롤)
   ========================================================================== */
.products-header-scroll {
  display: flex;
  overflow-x: auto;
  background-color: var(--color-bg-light);
  padding: 0.75rem 0;
  gap: 0.5rem;
  padding-left: 0.75rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.products-header-scroll::-webkit-scrollbar {
  display: none;
}

.product-header-card {
  flex: 0 0 6.25rem; /* 100px 고정 너비 */
  background-color: var(--color-white);
  border-radius: 0.5rem;
  padding: 0.75rem 0.5rem;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-right: 0.5rem;
}

.product-header-card:last-child {
  margin-right: 0.75rem;
}

.bank-name {
  font-size: 0.6875rem; /* 11px */
  color: var(--color-sub);
  margin-bottom: 0.25rem;
  text-align: center;
}

.product-name {
  font-size: 0.75rem; /* 12px */
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.3;
  text-align: center;
  word-break: keep-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.remove-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: transparent;
  border: none;
  color: var(--color-light);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: var(--color-main);
  transform: scale(1.1);
}

/* ==========================================================================
   비교 정보 섹션
   ========================================================================== */
.compare-info-section {
  padding: 0;
}

.info-row {
  display: flex;
  min-height: 3rem; /* 48px */
  border-bottom: 1px solid var(--color-bg-light);
}

.info-row.tall {
  min-height: 4rem; /* 64px, 우대조건용 */
}

.info-label {
  flex: 0 0 4.5rem; /* 72px 고정 너비 */
  background-color: #fcfdff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* 12px */
  font-weight: 600;
  color: var(--color-sub);
  border-right: 1px solid var(--color-bg-light);
  text-align: center;
  padding: 0.5rem 0.25rem;
}

.info-values {
  flex: 1;
  display: flex;
}

.info-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem; /* 13px */
  color: var(--color-main);
  text-align: center;
  padding: 0.5rem 0.25rem;
  border-right: 1px solid var(--color-bg-light);
  word-break: keep-all;
}

.info-value:last-child {
  border-right: none;
}

.info-value.highlight {
  font-size: 0.9375rem; /* 15px */
  font-weight: 700;
  color: var(--color-main);
}

.info-value.highlight.special {
  color: var(--color-accent);
}

/* 태그 셀 */
.info-value.tags-cell {
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0.25rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.125rem;
  justify-content: center;
  align-items: center;
}

.tag-pill {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  font-size: 0.625rem; /* 10px */
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  white-space: nowrap;
}

.no-tags {
  color: var(--color-light);
  font-size: 0.75rem;
}

/* ==========================================================================
   액션 버튼 섹션
   ========================================================================== */
.action-section {
  padding: 0.75rem;
  background-color: #fcfdff;
}

.action-buttons-row {
  display: flex;
  gap: 0.5rem;
}

.action-button-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-btn,
.join-btn {
  height: 2rem; /* 32px */
  border-radius: 0.375rem;
  font-size: 0.75rem; /* 12px */
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
}

.detail-btn {
  background-color: var(--color-white);
  color: var(--color-main);
  border-color: var(--color-light);
}

.detail-btn:hover {
  background-color: var(--color-bg-light);
  border-color: var(--color-sub);
}

.join-btn {
  background-color: var(--color-main);
  color: white;
  border-color: var(--color-main);
}

.join-btn:hover {
  filter: brightness(110%);
}

/* ==========================================================================
   3개 상품일 때 최적화
   ========================================================================== */
@media (max-width: 23.4375rem) {
  /* 375px */
  .product-header-card {
    flex: 0 0 5.5rem; /* 88px로 줄임 */
  }

  .product-name {
    font-size: 0.6875rem; /* 11px로 줄임 */
  }

  .info-label {
    flex: 0 0 4rem; /* 64px로 줄임 */
    font-size: 0.6875rem; /* 11px */
  }

  .info-value {
    font-size: 0.75rem; /* 12px */
  }

  .info-value.highlight {
    font-size: 0.875rem; /* 14px */
  }

  .tag-pill {
    font-size: 0.5625rem; /* 9px */
    padding: 0.0625rem 0.25rem;
  }
}
</style>
