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
      icon: '💼',
      label: '금리 유형',
      value: opt.intr_rate_type_nm || '정보 없음',
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
.key-features {
  padding: 1.25rem 1rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  max-width: 430px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-main);
  font-weight: 700;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.feature-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--color-bg-light);
  color: var(--color-main);
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
  min-width: 0;
}

.feature-label {
  font-size: 0.81rem;
  color: var(--color-sub);
  margin-bottom: 0.1rem;
  white-space: nowrap;
}

.feature-value {
  font-size: 0.97rem;
  font-weight: 500;
  color: var(--color-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 430px) {
  .key-features {
    padding: 1rem 0.6rem;
  }
  .feature-grid {
    gap: 0.7rem 0.25rem;
  }
  .section-title {
    font-size: 0.97rem;
  }
}
</style>
