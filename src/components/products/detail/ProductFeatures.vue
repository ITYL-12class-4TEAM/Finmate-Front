<template>
  <div class="key-features">
    <h3 class="section-title">상품 주요 정보</h3>
    <div class="feature-grid">
      <div v-for="f in features" :key="f.label" class="feature-item">
        <div class="feature-icon" :aria-label="f.label">{{ f.icon }}</div>
        <div class="feature-content">
          <div class="feature-label">{{ f.label }}</div>
          <div class="feature-value">{{ f.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: { type: Object, required: true },
  selectedOption: { type: Object, default: null },
  formatCurrency: { type: Function, required: true },
  formatDate: { type: Function, required: true },
});

// 안전하게 접근/표시
const features = computed(() => {
  const p = props.product?.productDetail || {};
  const opt = props.selectedOption || {};
  return [
    {
      icon: '💰',
      label: '최소 가입금액',
      value: props.formatCurrency?.(p.minDepositAmount),
    },
    {
      icon: '📈',
      label: '최대 가입금액',
      value: props.formatCurrency?.(p.maxDepositAmount),
    },
    {
      icon: '⏰',
      label: '가입 기간',
      value: (opt.save_trm || opt.saveTrm || '-') + '개월',
    },
    {
      icon: '📅',
      label: '공시 시작일',
      value: props.formatDate?.(p.dcls_strt_day),
    },
    {
      icon: '🔄',
      label: '가입 방법',
      value: p.join_way || '제한 없음',
    },
  ];
});
</script>

<style scoped>
/* ==========================================================================
   1. 카드 기본 레이아웃 (유지)
   ========================================================================== */
.key-features {
  background-color: #ffffff;
  border-radius: 0.75rem; /* 12px */
  padding: 0.75rem 1rem; /* 20px 16px */
  margin-bottom: 0.5rem;
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
}

/* ==========================================================================
   2. 섹션 제목 (유지)
   ========================================================================== */
.section-title {
  font-size: 1.1rem; /* 18px */
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 0.0625rem solid var(--color-bg-light);
}

/* ==========================================================================
   3. 정보 리스트 (✨ 그리드 -> 세로 리스트 레이아웃으로 변경)
   ========================================================================== */
.feature-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem; /* 각 항목 사이의 세로 간격을 넉넉하게 설정 */
}

.feature-item {
  display: flex;
  align-items: flex-start; /* 아이콘과 텍스트를 상단에 정렬 */
  gap: 0.75rem; /* 12px, 아이콘과 콘텐츠 사이 간격 */
}

/* ==========================================================================
   4. 아이콘 및 콘텐츠 스타일 (✨ 리스트 레이아웃에 맞게 수정)
   ========================================================================== */
.feature-icon {
  width: 2rem; /* 40px */
  height: 2rem; /* 40px */
  background: var(--color-bg-light);
  border-radius: 50%;
  font-size: 1.125rem; /* 18px */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
  min-width: 0;
  padding-top: 0.125rem; /* 아이콘과 텍스트의 시각적 높이 조절 */
}

.feature-label {
  font-size: 0.8rem; /* 14px */
  color: var(--color-sub);
  margin-bottom: 0.25rem; /* 라벨과 값 사이 간격 */
}

.feature-value {
  font-size: 0.9rem; /* 16px */
  font-weight: 600;
  color: var(--color-main);
  white-space: normal;
  word-break: keep-all; /* 단어 단위로 줄바꿈하여 가독성 향상 */
  line-height: 1.4;
}
</style>
