<template>
  <div class="card-header">
    <div class="bank-logo">
      <img v-if="bankLogo" :src="bankLogo" :alt="korCoNm" />
      <div v-else class="bank-initial">{{ bankInitial }}</div>
    </div>
    <div class="product-info">
      <p class="bank-name">{{ korCoNm }}</p>
      <h2 class="product-name">{{ finPrdtNm }}</h2>
      <div class="product-tags">
        <span v-if="isDigitalOnly" class="tag digital">비대면 전용</span>
        <span class="tag category">{{ categoryName }}</span>
        <span class="tag interest-type">{{ interestTypeName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// defineProps를 사용하여 props 정의
const props = defineProps({
  korCoNm: { type: String, required: true },
  finPrdtNm: { type: String, required: true },
  isDigitalOnly: { type: Boolean, default: false },
  categoryName: { type: String, default: '금융상품' },
  interestTypeName: { type: String, default: '기본금리' },
});

// 은행 로고 매핑 객체
const bankLogos = {
  /* ... 은행 로고 URL 맵 ... */
};

// computed 속성 정의
const bankLogo = computed(() => bankLogos[props.korCoNm] || null);
const bankInitial = computed(() => (props.korCoNm ? props.korCoNm.charAt(0) : ''));
</script>
