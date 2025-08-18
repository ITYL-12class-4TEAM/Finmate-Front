<template>
  <div class="mobile-compare-container" :style="{ '--item-count': items.length }">
    <div class="products-header-grid">
      <div v-for="item in items" :key="item.productId + item.saveTrm" class="product-header-card">
        <div class="bank-name" :title="item.korCoNm">{{ item.korCoNm }}</div>
        <div class="product-name" :title="item.productName">{{ item.productName }}</div>

        <div class="header-extra-info">
          <div class="header-pills-row">
            <span class="header-tag">{{ item.saveTrm }}개월</span>
            <span
              class="header-tag interest-type-pill"
              :class="
                getInterestTypeClass(
                  getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType || 'S')
                )
              "
            >
              {{
                getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType || 'S')
              }}
            </span>
          </div>
          <div class="header-pills-row">
            <span
              v-if="isProductSavings(item) && item.rsrvType"
              class="header-tag deposit-method-pill"
              :class="getDepositMethodClass(item)"
            >
              {{ getDepositMethodLabel(item) }}
            </span>
          </div>
        </div>

        <button
          class="remove-btn"
          @click="$emit('remove', item.productId, item.saveTrm, item.intrRateType || 'S')"
        >
          ×
        </button>
      </div>
    </div>

    <div class="compare-info-section">
      <!-- 공통 비교 정보 행 -->
      <div
        v-for="row in commonComparisonRows"
        :key="row.label"
        class="info-row"
        :class="{ tall: row.tall }"
      >
        <div class="info-label">{{ row.label }}</div>
        <div class="info-values">
          <div
            v-for="(value, index) in row.values"
            :key="`${items[index].productId}_${row.label}`"
            class="info-value"
            :class="row.valueClasses"
          >
            <template v-if="row.type === 'rate'">
              {{ value }}
            </template>
            <template v-else-if="row.type === 'tags'">
              <div class="tags-container">
                <span v-for="(tag, tagIndex) in value" :key="tagIndex" class="tag-pill">
                  #{{ tag.trim() }}
                </span>
                <span v-if="!value.length" class="no-tags">태그 없음</span>
              </div>
            </template>
            <template v-else>
              {{ value }}
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="action-section">
      <div class="action-buttons-row">
        <div v-for="item in items" :key="item.productId + '_actions'" class="action-button-group">
          <button
            class="detail-btn"
            @click="$emit('viewDetail', item.productId, item.productType, item.saveTrm)"
          >
            상세 보기
          </button>
          <button class="join-btn" @click="$emit('joinProduct', item)">홈페이지 이동</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  compareData: { type: Object, default: null },
  getMinDepositForProduct: { type: Function, required: true },
  getMaxDepositForProduct: { type: Function, required: true },
  getInterestTypeForProduct: { type: Function, required: true },
});

defineEmits(['remove', 'viewDetail', 'joinProduct']);

// 적금 상품 여부 확인 (rsrvType 또는 productType으로 판별)
const isProductSavings = (item) => {
  return item.productType === 'savings' || item.rsrvType || item.rsrv_type;
};

const getInterestTypeClass = (value) => {
  if (value === '단리') return 'simple';
  if (value === '복리') return 'compound';
  return '';
};

const getDepositMethodClass = (item) => {
  const rsrvType = item.rsrvType || item.rsrv_type;
  if (rsrvType === 'F') return 'free-deposit';
  if (rsrvType === 'S') return 'fixed-deposit';
  return '';
};

const getDepositMethodLabel = (item) => {
  const rsrvType = item.rsrvType || item.rsrv_type;
  if (rsrvType === 'F') return '자유적립식';
  if (rsrvType === 'S') return '정액적립식';
  return item.rsrvTypeNm || item.rsrv_type_nm || '정보 없음';
};

const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

/**
 * 통화 단위 포맷팅 함수 (만원, 천만원, 억원 단위로 변환)
 * 0원도 제대로 표시하도록 개선된 버전
 */
const formatKoreanCurrency = (amount, isMinDeposit = false) => {
  // 입력값이 '0', '0원', '0,000' 등의 문자열인 경우 처리
  if (typeof amount === 'string') {
    // 콤마와 '원' 제거 후 숫자만 추출
    const cleanAmount = amount.replace(/,|원/g, '');
    if (cleanAmount === '0') {
      return '0원';
    }

    // 숫자로 변환
    amount = parseInt(cleanAmount, 10);
  }

  // 명시적으로 0인 경우 체크
  if (amount === 0) {
    return '0원';
  }

  // null, undefined 처리
  if (amount === null || amount === undefined) {
    // 최소 가입금액일 경우 0원으로, 그 외에는 홈페이지 참고로 표시
    return isMinDeposit ? '0원' : '홈페이지 참고';
  }

  // 숫자가 아닌 경우 처리
  if (isNaN(amount)) {
    // 최소 가입금액일 경우 0원으로, 그 외에는 홈페이지 참고로 표시
    return isMinDeposit ? '0원' : '홈페이지 참고';
  }

  // 1억 이상인 경우 (1억 = 100,000,000)
  if (amount >= 100000000) {
    const billion = Math.floor(amount / 100000000);
    // 1억 이상일 경우 만원 단위는 생략
    return `${billion}억원`;
  }

  // 1천만 이상인 경우 (1천만 = 10,000,000)
  if (amount >= 10000000) {
    const tenMillion = Math.floor(amount / 10000000);
    return `${tenMillion}천만원`;
  }

  // 만원 단위로 표시 (1만원 = 10,000)
  if (amount >= 10000) {
    const tenThousand = Math.floor(amount / 10000);
    return `${tenThousand}만원`;
  }

  // 천원 단위로 표시 (1천원 = 1,000)
  if (amount >= 1000) {
    const thousand = Math.floor(amount / 1000);
    return `${thousand}천원`;
  }

  // 그 외의 경우
  return `${amount}원`;
};

// 공통 비교 정보 행 (예금, 적금 모두 표시)
const commonComparisonRows = computed(() => {
  if (!props.items || !props.items.length) return [];

  const createRow = (config) => {
    const { label, type, tall, valueClasses, valueMapFn } = config;
    return {
      label,
      type,
      tall: tall || false,
      valueClasses: valueClasses || [],
      values: props.items.map(valueMapFn),
    };
  };

  return [
    createRow({
      label: '기본 금리',
      type: 'rate',
      valueClasses: ['highlight'],
      valueMapFn: (item) => formatRate(item.intrRate),
    }),
    createRow({
      label: '우대 금리',
      type: 'rate',
      valueClasses: ['highlight', 'special'],
      valueMapFn: (item) => formatRate(item.intrRate2),
    }),
    createRow({
      label: '우대 조건',
      type: 'tags',
      tall: true,
      valueClasses: ['tags-cell'],
      valueMapFn: (item) =>
        (item.preferential_tags || item.preferentialTags || '').split(',').filter((t) => t.trim()),
    }),
    createRow({
      label: '최소 금액',
      type: 'text',
      valueMapFn: (item) =>
        formatKoreanCurrency(props.getMinDepositForProduct(item.productId), true),
    }),
    createRow({
      label: '최대 금액',
      type: 'text',
      valueMapFn: (item) =>
        formatKoreanCurrency(props.getMaxDepositForProduct(item.productId), false),
    }),
    createRow({
      label: '가입 대상',
      type: 'text',
      valueMapFn: (item) => item.join_member || item.joinMember || '제한 없음',
    }),
  ];
});
</script>

<style scoped>
/* 기본 스타일 */
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
  --color-white: #ffffff;
  --color-accent: #e91e63;
}

.mobile-compare-container {
  width: 100%;
  max-width: 23.4375rem;
  background-color: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 0 auto;
}

/* ==========================================================================
   상품 헤더 영역
   ========================================================================== */
.products-header-grid {
  display: grid;
  grid-template-columns: repeat(var(--item-count, 3), minmax(0, 1fr));
  background-color: var(--color-bg-light);
  padding: 0.25rem;
  gap: 0;
}

.product-header-card {
  background-color: var(--color-white);
  border-radius: 0.5rem;
  margin: 0.25rem;
  padding: 0.75rem 0.5rem;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 6.5rem;
  padding-bottom: 3.25rem;
  box-sizing: border-box;
}

.bank-name {
  font-size: 0.6875rem;
  color: var(--color-sub);
  margin-bottom: 0.25rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.product-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
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
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.header-extra-info {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
}

.header-pills-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
}

.header-tag {
  font-size: 0.65rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  background-color: var(--color-bg-light);
  color: var(--color-sub);
  border: 1px solid transparent; /* 테두리 공간 확보 */
}

.header-tag.interest-type-pill.simple {
  background-color: #eef2ff;
  color: #4338ca;
}

.header-tag.interest-type-pill.compound {
  background-color: #e0f2f1;
  color: #00796b;
}

.header-tag.deposit-pill {
  background-color: #e0e7ff;
  color: #3730a3;
  font-weight: 600;
}

.header-tag.savings-pill {
  background-color: #d1fae5;
  color: #047857;
  font-weight: 600;
}

/* ✨ [수정] 자유적립식 스타일 */
.header-tag.deposit-method-pill.free-deposit {
  background-color: #f3e8ff; /* 연한 보라색 */
  color: #8e24aa; /* 진한 보라색 */
  border: 1px solid #e9d5ff;
  font-size: 0.6rem;
}

/* ✨ [수정] 정액적립식 스타일 */
.header-tag.deposit-method-pill.fixed-deposit {
  background-color: #fefce8; /* 연한 노란색 */
  color: #ca8a04; /* 진한 노란색 */
  border: 1px solid #fde68a;
  font-size: 0.6rem;
}

/* ==========================================================================
   비교 정보 섹션
   ========================================================================== */
.compare-info-section {
  padding: 0.25rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--color-bg-light);
  background-color: #fcfdff;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: auto;
  display: inline-block;
  margin: 0.15rem auto 0.2rem auto;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4338ca;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background-color: #eef2ff;
}

.info-values {
  display: grid;
  grid-template-columns: repeat(var(--item-count, 3), minmax(0, 1fr));
  width: 100%;
  gap: 0;
}

.info-value {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--color-main);
  text-align: center;
  padding: 0.1rem 0.1rem;
  border-right: none;
  word-break: keep-all;
  min-height: 2.25rem;
  box-sizing: border-box;
}

.info-value:not(:last-child) {
  border-right: 1px solid var(--color-bg-light);
}

.info-value.highlight {
  font-size: 0.825rem;
  font-weight: 650;
}

.info-value.highlight.special {
  color: #d32f2f;
}

.info-value.tags-cell {
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.25rem;
  height: 100%;
}

.deposit-method-info {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.deposit-method-info.free-deposit {
  background-color: #fefce8;
  color: #ca8a04;
}

.deposit-method-info.fixed-deposit {
  background-color: #f3e8ff;
  color: #8e24aa;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  justify-content: center;
  align-items: center;
}

.tag-pill {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  font-size: 0.7rem;
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
  padding: 0.5rem 0.25rem;
  background-color: #fcfdff;
  border-top: 1px solid var(--color-bg-light);
}

.action-buttons-row {
  display: grid;
  grid-template-columns: repeat(var(--item-count, 3), minmax(0, 1fr));
  gap: 0;
  width: 100%;
}

.action-button-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 0.2rem;
  box-sizing: border-box;
}

.detail-btn,
.join-btn {
  width: 100%;
  height: 2.25rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-btn {
  background-color: var(--color-white);
  color: var(--color-main);
  border-color: var(--color-light);
}

.join-btn {
  background-color: var(--color-main);
  color: white;
  border-color: var(--color-main);
  box-shadow: 0 2px 4px rgba(45, 51, 107, 0.15);
}

.detail-btn:hover {
  background-color: var(--color-bg-light);
}

.join-btn:hover {
  filter: brightness(1.05);
}
</style>
