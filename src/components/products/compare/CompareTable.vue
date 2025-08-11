<template>
  <div class="comparison-container">
    <div class="product-headers">
      <div v-for="item in items" :key="item.productId" class="header-item">
        <button
          class="remove-btn"
          @click="$emit('remove', item.productId, item.saveTrm, item.intrRateType || 'S')"
        >
          ×
        </button>
        <div class="bank-name">{{ item.korCoNm }}</div>
        <div class="product-name">{{ item.productName }}</div>
      </div>
    </div>

    <div class="comparison-body">
      <div v-for="row in comparisonRows" :key="row.label" class="comparison-row">
        <div class="row-label">{{ row.label }}</div>
        <div class="row-values">
          <div
            v-for="(value, index) in row.values"
            :key="index"
            class="value-item"
            :class="{ 'align-left': row.alignLeft }"
          >
            <template v-if="row.type === 'rate'">
              <span class="rate-text" :class="{ special: row.label === '우대 금리' }">{{
                value
              }}</span>
            </template>
            <template v-else-if="row.type === 'tags'">
              <div class="tags-container">
                <span v-for="tag in value" :key="tag" class="tag-pill">#{{ tag }}</span>
                <span v-if="!value.length" class="no-tags">정보 없음</span>
              </div>
            </template>
            <template v-else>
              <span class="text-value">{{ value }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="comparison-footer">
      <div v-for="item in items" :key="item.productId" class="footer-item">
        <button
          class="btn-secondary"
          @click="$emit('viewDetail', item.productId, item.productType, item.saveTrm)"
        >
          상세보기
        </button>
        <button class="btn-primary" @click="$emit('joinProduct', item)">가입하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  getMinDepositForProduct: { type: Function, required: true },
  getMaxDepositForProduct: { type: Function, required: true },
  getInterestTypeForProduct: { type: Function, required: true },
});

// [MODIFIED] 'remove' 이벤트를 defineEmits에 추가
defineEmits(['remove', 'viewDetail', 'joinProduct']);

const formatCurrencyKorean = (value) => {
  const num = parseInt(String(value).replace(/,/g, ''), 10);
  if (isNaN(num)) {
    return typeof value === 'string' ? value : '정보 없음';
  }
  if (num === 0) return '0원';

  const hundredMillion = Math.floor(num / 100000000);
  if (hundredMillion > 0) {
    return `${hundredMillion.toLocaleString()}억원`;
  }

  const tenThousand = Math.floor(num / 10000);
  if (tenThousand > 0) {
    return `${tenThousand.toLocaleString()}만원`;
  }

  if (num >= 1000) {
    return `${(num / 1000).toLocaleString()}천원`;
  }

  return `${num.toLocaleString()}원`;
};

const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

const comparisonRows = computed(() => {
  if (!props.items || props.items.length === 0) return [];
  return [
    {
      label: '기본 금리',
      type: 'rate',
      values: props.items.map((item) => formatRate(item.intrRate)),
    },
    {
      label: '우대 금리',
      type: 'rate',
      values: props.items.map((item) => formatRate(item.intrRate2)),
    },
    {
      label: '우대 조건',
      type: 'tags',
      alignLeft: true,
      values: props.items.map((item) =>
        (item.preferential_tags || item.preferentialTags || '').split(',').filter((t) => t.trim())
      ),
    },
    { label: '가입 기간', type: 'text', values: props.items.map((item) => `${item.saveTrm}개월`) },
    {
      label: '최소 가입금액',
      type: 'text',
      values: props.items.map((item) =>
        formatCurrencyKorean(props.getMinDepositForProduct(item.productId))
      ),
    },
    {
      label: '최대 가입금액',
      type: 'text',
      values: props.items.map((item) =>
        formatCurrencyKorean(props.getMaxDepositForProduct(item.productId))
      ),
    },
    {
      label: '가입 대상',
      type: 'text',
      alignLeft: true,
      values: props.items.map((item) => item.join_member || item.joinMember || '제한 없음'),
    },
    {
      label: '금리 유형',
      type: 'text',
      values: props.items.map((item) =>
        props.getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType || 'S')
      ),
    },
  ];
});
</script>

<style scoped>
/* Finmate 디자인 시스템 적용 (1rem = 16px)
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
*/

.comparison-container {
  max-width: 430px;
  margin: 0 auto;
  /* background-color: var(--color-bg-light); */
  padding: 1rem 0.75rem;
  font-family: 'Pretendard', sans-serif; /* 예시 폰트 */
}

/* --- 헤더 --- */
.product-headers {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.header-item {
  position: relative; /* [MODIFIED] 삭제 버튼의 position: absolute 기준점 */
  background-color: #fff;
  padding: 0.75rem;
  border-radius: 0.625rem; /* 10px */
  border: 1px solid var(--color-bg-light);
  text-align: center;
}
.bank-name {
  font-size: 0.75rem; /* 12px */
  color: var(--color-sub);
  font-weight: 500;
}
.product-name {
  font-size: 0.8125rem; /* 13px */
  font-weight: 600;
  color: var(--color-main);
  margin-top: 0.25rem;
  line-height: 1.4;
  padding: 0 0.5rem; /* 버튼 공간 확보 */
}

/* [ADDED] 삭제 버튼 스타일 */
.remove-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: var(--color-light);
  font-size: 1.25rem;
  line-height: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.remove-btn:hover {
  color: var(--color-main);
  background-color: var(--color-bg-light);
}

/* --- 본문 --- */
.comparison-body {
  background-color: #fff;
  border-radius: 0.625rem;
  border: 1px solid var(--color-bg-light);
}
.comparison-row {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-bg-light);
}
.comparison-row:last-child {
  border-bottom: none;
}
.row-label {
  font-size: 0.8125rem; /* 13px */
  font-weight: 600;
  color: var(--color-sub);
  text-align: center;
  margin-bottom: 0.75rem;
}
.row-values {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: start;
}
.value-item {
  line-height: 1.5;
  word-break: keep-all;
  min-height: 2.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 0.5rem;
}
.value-item:not(:last-child) {
  border-right: 1px solid var(--color-bg-light);
}
.value-item.align-left {
  justify-content: flex-start;
  text-align: left;
}
.text-value {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-main);
}
.rate-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
}
.rate-text.special {
  color: var(--color-main);
  position: relative;
}
.rate-text.special::after {
  content: '';
  position: absolute;
  bottom: -0.25rem;
  left: 50%;
  transform: translateX(-50%);
  width: 1.25rem;
  height: 2px;
  background-color: var(--color-main);
}
.tags-container {
  display: flex;
  flex-flow: column wrap;
  gap: 0.375rem;
  align-items: flex-start;
}
.tag-pill {
  font-size: 0.75rem;
  font-weight: 500;
  background-color: var(--color-bg-light);
  color: var(--color-sub);
  padding: 0.25rem 0.625rem;
  border-radius: 1rem;
}
.no-tags {
  font-size: 0.875rem;
  color: var(--color-light);
}

/* --- 푸터 및 버튼 --- */
.comparison-footer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  margin-top: 1rem;
}
.footer-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 0.625rem 0;
  font-size: 0.8125rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid var(--color-light);
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-secondary {
  background-color: #fff;
  color: var(--color-main);
}
.btn-secondary:hover {
  border-color: var(--color-main);
}
.btn-primary {
  background-color: var(--color-main);
  color: #fff;
  border-color: var(--color-main);
}
.btn-primary:hover {
  filter: brightness(115%);
}
</style>
