<template>
  <div class="mobile-compare-container" :style="{ '--item-count': items.length }">
    <div class="products-header-grid">
      <div v-for="item in items" :key="item.productId + item.saveTrm" class="product-header-card">
        <div class="bank-name" :title="item.korCoNm">{{ item.korCoNm }}</div>
        <div class="product-name" :title="item.productName">{{ item.productName }}</div>
        <div class="header-extra-info">
          <span class="header-tag">{{ item.saveTrm }}개월</span>
          <span
            class="header-tag interest-type-pill"
            :class="
              getInterestTypeClass(
                getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType || 'S')
              )
            "
            >{{
              getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType || 'S')
            }}</span
          >
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
      <div
        v-for="row in comparisonRows"
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
            상세
          </button>
          <button class="join-btn" @click="$emit('joinProduct', item)">가입</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 스크립트 부분은 변경사항 없습니다.
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  compareData: { type: Object, default: null },
  getMinDepositForProduct: { type: Function, required: true },
  getMaxDepositForProduct: { type: Function, required: true },
  getInterestTypeForProduct: { type: Function, required: true },
});

defineEmits(['remove', 'viewDetail', 'joinProduct']);

const getInterestTypeClass = (value) => {
  if (value === '단리') return 'simple';
  if (value === '복리') return 'compound';
  return '';
};

const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

const formatCurrencyKorean = (value) => {
  const num = parseInt(String(value).replace(/,/g, ''), 10);
  if (isNaN(num)) {
    return typeof value === 'string' ? value : '정보 없음';
  }
  if (num === 0) return '0원';
  const hundredMillion = Math.floor(num / 100000000);
  if (hundredMillion > 0) return `${hundredMillion.toLocaleString()}억원`;
  const tenThousand = Math.floor(num / 10000);
  if (tenThousand > 0) return `${tenThousand.toLocaleString()}만원`;
  if (num >= 1000) return `${(num / 1000).toLocaleString()}천원`;
  return `${num.toLocaleString()}원`;
};

const comparisonRows = computed(() => {
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

  const allRows = [
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
      valueMapFn: (item) => formatCurrencyKorean(props.getMinDepositForProduct(item.productId)),
    }),
    createRow({
      label: '최대 금액',
      type: 'text',
      valueMapFn: (item) => formatCurrencyKorean(props.getMaxDepositForProduct(item.productId)),
    }),
    createRow({
      label: '가입 대상',
      type: 'text',
      valueMapFn: (item) => item.join_member || item.joinMember || '제한 없음',
    }),
  ];
  return allRows;
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
  background-color: var(--color-white);
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
  min-height: 4.5rem;
  padding-bottom: 2.25rem; /* 알약 공간 확보 */
  box-sizing: border-box; /* 패딩을 너비에 포함 */
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
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}

.header-tag {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  background-color: var(--color-bg-light);
  color: var(--color-sub);
}

.header-tag.interest-type-pill.simple {
  background-color: #eef2ff;
  color: #4338ca;
}

.header-tag.interest-type-pill.compound {
  background-color: #e0f2f1;
  color: #00796b;
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
  /* 행 배경색은 통일하여 깔끔하게 처리 */
  background-color: #fcfdff;
}

.info-row:last-child {
  border-bottom: none;
}

/* ✨ CHANGED: info-label 스타일 변경 */
.info-label {
  width: auto; /* 너비 자동 조정 */
  display: inline-block; /* 인라인 블록으로 변경 */
  margin: 0.15rem auto 0.2rem auto; /* 상하좌우 여백 조정 */
  text-align: center;
  font-size: 0.75rem; /* 폰트 크기 살짝 조정 */
  font-weight: 600;
  color: #4338ca; /* 텍스트 색상 변경 */
  padding: 0.25rem 0.75rem; /* 내부 여백 증가 */
  border-radius: 1rem; /* 더 둥글게 */
  background-color: #eef2ff; /* 하이라이트 배경색 추가 */
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
