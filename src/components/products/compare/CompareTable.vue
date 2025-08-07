<template>
  <div class="compare-table-container">
    <table class="compare-table">
      <thead>
        <tr>
          <th class="feature-cell">구분</th>
          <th v-for="item in items" :key="item.productId + item.saveTrm" class="product-cell">
            <div class="product-header">
              <div class="bank-name">{{ item.korCoNm }}</div>
              <div class="product-name">
                {{ item.productName }}
              </div>
              <button
                class="remove-btn"
                @click="$emit('remove', item.productId, item.saveTrm, item.intrRateType || 'S')"
              >
                ×
              </button>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="feature-cell">기본 금리</td>
          <td
            v-for="item in items"
            :key="`rate-${item.productId}-${item.saveTrm}`"
            class="product-cell"
          >
            <div class="highlight">{{ formatRate(item.intrRate) }}</div>
          </td>
        </tr>
        <tr>
          <td class="feature-cell">우대 금리</td>
          <td
            v-for="item in items"
            :key="`rate2-${item.productId}-${item.saveTrm}`"
            class="product-cell"
          >
            <div class="highlight special">
              {{ formatRate(item.intrRate2) }}
            </div>
          </td>
        </tr>

        <!-- 우대 조건 태그 행 -->
        <tr>
          <td class="feature-cell">우대 조건 태그</td>
          <td v-for="(item, index) in items" :key="`tags-${index}`" class="product-cell">
            <div class="tags-container">
              <template v-if="item && item.preferential_tags">
                <span
                  v-for="(tag, tagIndex) in item.preferential_tags.split(',')"
                  :key="tagIndex"
                  class="tag-pill"
                >
                  #{{ tag.trim() }}
                </span>
              </template>
              <span v-else class="no-tags">태그 없음</span>
            </div>
          </td>
        </tr>

        <tr>
          <td class="feature-cell">가입 기간</td>
          <td
            v-for="item in items"
            :key="`term-${item.productId}-${item.saveTrm}`"
            class="product-cell"
          >
            {{ item.saveTrm }}개월
          </td>
        </tr>

        <!-- 최소 가입금액 행 -->
        <tr v-if="compareData && (compareData.products || compareData.data?.body?.data?.products)">
          <td class="feature-cell">최소 가입금액</td>
          <td v-for="(item, index) in items" :key="`min-${index}`" class="product-cell">
            {{ getMinDepositForProduct(item.productId) }}
          </td>
        </tr>

        <!-- 최대 가입금액 행 -->
        <tr v-if="compareData && (compareData.products || compareData.data?.body?.data?.products)">
          <td class="feature-cell">최대 가입금액</td>
          <td v-for="(item, index) in items" :key="`max-${index}`" class="product-cell">
            {{ getMaxDepositForProduct(item.productId) }}
          </td>
        </tr>

        <tr>
          <td class="feature-cell">가입 대상</td>
          <td v-for="(item, index) in items" :key="`member-${index}`" class="product-cell">
            {{ item.join_member || '제한 없음' }}
          </td>
        </tr>

        <tr>
          <td class="feature-cell">금리 유형</td>
          <td
            v-for="item in items"
            :key="`int-type-${item.productId}-${item.saveTrm}`"
            class="product-cell"
          >
            {{ getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType || 'S') }}
          </td>
        </tr>

        <tr>
          <td class="feature-cell">상세 보기</td>
          <td
            v-for="item in items"
            :key="`action-${item.productId}-${item.saveTrm}`"
            class="product-cell"
          >
            <div class="action-buttons">
              <button
                class="detail-btn"
                @click="$emit('viewDetail', item.productId, item.productType, item.saveTrm)"
              >
                상세 보기
              </button>
              <button class="join-btn" @click="$emit('joinProduct', item)">가입하기</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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
   1. 기본 컨테이너 및 테이블 레이아웃 (수정됨)
   - 테이블의 최소 너비(min-width)를 제거하여 컬럼 크기에 유연하게 반응하도록 변경
   ========================================================================== */
.compare-table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
  background-color: #ffffff;
  border-radius: 0.75rem; /* 12px */
  box-shadow: 0 0.25rem 1.5rem rgba(45, 51, 107, 0.05);
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.compare-table-container::-webkit-scrollbar {
  display: none;
}

.compare-table {
  width: 100%;
  /* min-width를 제거하여 컬럼 너비에 따라 테이블 전체 크기가 결정되도록 함 */
  border-collapse: collapse;
  border-spacing: 0;
}

.compare-table th,
.compare-table td {
  padding: 1rem 0.5rem; /* 좌우 여백을 줄여 전체적인 폭 감소에 기여 */
  text-align: center;
  border-bottom: 0.0625rem solid var(--color-bg-light); /* 1px */
  vertical-align: middle;
}

.compare-table tr:last-child td {
  border-bottom: none;
}

/* ==========================================================================
   2. 테이블 셀 스타일 (수정됨)
   - '구분' 컬럼과 '상품' 컬럼의 폭과 여백을 대폭 축소
   ========================================================================== */
.feature-cell {
  background-color: var(--color-bg-light);
  font-weight: 500;
  color: var(--color-sub);
  text-align: left;
  min-width: 3.5rem; /* 56px, 폭을 최소한으로 줄임 */
  padding: 1rem 0.625rem; /* 10px */
  font-size: 0.875rem;
  position: sticky;
  left: 0;
  z-index: 1;
}

.product-cell {
  min-width: 6.5rem; /* 104px, 3개 상품이 보이도록 폭을 대폭 줄임 */
  white-space: nowrap;
}

/* ==========================================================================
   3. 상품 정보 헤더 (상단)
   - 좁아진 공간에 맞춰 폰트 크기 조정
   ========================================================================== */
.product-header {
  position: relative;
  padding: 0 1rem 0.5rem 0;
  min-height: 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bank-name {
  font-size: 0.75rem; /* 12px */
  color: var(--color-sub);
  margin-bottom: 0.25rem;
}

.product-name {
  font-size: 0.875rem; /* 14px, 좁은 공간을 위해 폰트 크기 조정 */
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
  white-space: normal;
}

.remove-btn {
  position: absolute;
  top: -0.25rem;
  right: -0.375rem;
  background: transparent;
  border: none;
  color: var(--color-light);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease-in-out;
}

.remove-btn:hover {
  color: var(--color-main);
}

/* ==========================================================================
   4. 콘텐츠 하이라이트 및 태그
   ========================================================================== */
.highlight {
  font-size: 1.0625rem; /* 17px, 공간 확보를 위해 약간 줄임 */
  font-weight: 700;
  color: var(--color-main);
}

.highlight.special {
  color: var(--color-accent, #e91e63);
}

.tags-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  white-space: normal;
}

.tag-pill {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  font-size: 0.75rem; /* 12px */
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
}

.no-tags {
  font-size: 0.875rem;
  color: var(--color-light);
}

/* ==========================================================================
   5. 액션 버튼 (수정됨)
   - 버튼 폭을 줄이기 위해 부모 컨테이너에 max-width 설정 및 중앙 정렬
   ========================================================================== */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
  max-width: 6.25rem; /* 100px, 버튼 최대 폭을 더 줄임 */
  margin: 0 auto;
}

.detail-btn,
.join-btn {
  padding: 0.625rem 0.5rem;
  border-radius: 0.5rem; /* 8px */
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease-in-out;
}

.detail-btn {
  background-color: #fff;
  color: var(--color-main);
  border: 0.0625rem solid var(--color-light);
}

.detail-btn:hover {
  background-color: var(--color-bg-light);
  border-color: var(--color-sub);
}

.join-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
}

.join-btn:hover {
  filter: brightness(110%);
}
</style>
