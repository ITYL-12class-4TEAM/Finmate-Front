<template>
  <div class="compare-container">
    <!-- 좌측 고정된 '구분' 컬럼 -->
    <div class="feature-column">
      <div class="feature-header">구분</div>
      <div class="feature-item compact-row">기본 금리</div>
      <div class="feature-item compact-row">우대 금리</div>
      <div class="feature-item">우대 조건</div>
      <div class="feature-item compact-row">가입 기간</div>
      <div class="feature-item">최소 가입금액</div>
      <div class="feature-item">최대 가입금액</div>
      <div class="feature-item">가입 대상</div>
      <div class="feature-item compact-row">금리 유형</div>
      <div class="feature-item-action">상세 보기</div>
    </div>

    <!-- 우측 스크롤되는 '상품' 카드 영역 -->
    <div class="products-scroll-area">
      <div class="product-column" v-for="item in items" :key="item.productId + item.saveTrm">
        <div class="product-header">
          <div class="bank-name">{{ item.korCoNm }}</div>
          <div class="product-name">{{ item.productName }}</div>
          <button
            class="remove-btn"
            @click="$emit('remove', item.productId, item.saveTrm, item.intrRateType || 'S')"
          >
            ×
          </button>
        </div>
        <div class="product-content">
          <div class="highlight compact-row">{{ formatRate(item.intrRate) }}</div>
          <div class="highlight special compact-row">{{ formatRate(item.intrRate2) }}</div>
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
          <div class="compact-row">{{ item.saveTrm }}개월</div>
          <div>{{ getMinDepositForProduct(item.productId) }}</div>
          <div>{{ getMaxDepositForProduct(item.productId) }}</div>
          <div class="join-member">{{ item.join_member || item.joinMember || '제한 없음' }}</div>
          <div class="compact-row">
            {{ getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType || 'S') }}
          </div>
        </div>
        <div class="action-buttons">
          <button
            class="detail-btn"
            @click="$emit('viewDetail', item.productId, item.productType, item.saveTrm)"
          >
            상세 보기
          </button>
          <button class="join-btn" @click="$emit('joinProduct', item)">가입하기</button>
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
/* ==========================================================================
   1. 전체 컨테이너 (Flex Layout)
   ========================================================================== */
.compare-container {
  display: flex;
  width: 100%;
  background-color: #f7f8fa;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* ==========================================================================
   2. 좌측 '구분' 컬럼 (고정)
   ========================================================================== */
.feature-column {
  flex: 0 0 4rem; /* 80px 고정 너비 */
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  z-index: 2;
  border-right: 1px solid var(--color-bg-light);
}

.feature-header,
.feature-item,
.feature-item-action {
  height: 6rem; /* 96px, 각 항목의 높이 통일 */
  display: flex;
  align-items: center;
  /* padding: 0 0.75rem; */
  font-size: 0.8125rem; /* 13px */
  font-weight: 500;
  color: var(--color-sub);
  border-bottom: 1px solid var(--color-bg-light);
}
.feature-header {
  height: 7rem; /* 112px, 상품 헤더와 높이 맞춤 */
  font-weight: 600;
  color: var(--color-main);
  background-color: #fcfdff;
}
.feature-item-action {
  flex-grow: 1; /* 남은 공간 모두 차지 */
}
.feature-column > div:last-child {
  border-bottom: none;
}

.feature-item.compact-row {
  height: 4rem; /* 64px */
}
.feature-item:not(.compact-row) {
  height: 6rem; /* 96px, 긴 텍스트를 위한 기본 높이 */
}

/* ==========================================================================
   3. 우측 '상품' 스크롤 영역
   ========================================================================== */
.products-scroll-area {
  display: flex;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.products-scroll-area::-webkit-scrollbar {
  display: none;
}

/* ==========================================================================
   4. 개별 상품 카드 (Column)
   ========================================================================== */
.product-column {
  flex: 0 0 8rem; /* 160px 고정 너비 */
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-bg-light);
  transition: all 0.2s ease-in-out;
}
.product-column:hover {
  background-color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}
.product-column:last-child {
  border-right: none;
}

.product-header {
  height: 7rem; /* 112px, 고정 높이 */
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  position: relative;
  border-bottom: 1px solid var(--color-bg-light);
}

.bank-name {
  font-size: 0.8125rem;
  color: var(--color-sub);
  margin-bottom: 0.25rem;
}

.product-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
  white-space: normal;
  word-break: keep-all;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: var(--color-light);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.remove-btn:hover {
  color: var(--color-main);
  transform: scale(1.1);
}

.product-content > div {
  height: 6rem; /* 96px, feature-item과 높이 통일 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-bg-light);
  font-size: 0.9375rem;
  color: var(--color-text);
  text-align: center;
}

.product-content > .compact-row {
  height: 4rem; /* 64px */
}
.product-content > div:not(.compact-row) {
  height: 6rem; /* 96px */
}

.highlight {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-main);
}
.highlight.special {
  color: var(--color-accent, #e91e63);
}

.tags-container,
.join-member {
  white-space: normal;
  word-break: keep-all;
  flex-direction: column;
  gap: 0.25rem;
}
.tag-pill {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
}
.no-tags {
  color: var(--color-light);
}

/* ==========================================================================
   5. 액션 버튼
   ========================================================================== */
.action-buttons {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  justify-content: center;
}

.detail-btn,
.join-btn {
  height: 2.25rem; /* 36px */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-light);
}

.detail-btn {
  background-color: #fff;
  color: var(--color-main);
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
</style>
