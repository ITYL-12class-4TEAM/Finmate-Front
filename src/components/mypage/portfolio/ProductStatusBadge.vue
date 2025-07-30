<template>
  <div class="product-status" v-if="productStatus">
    <div class="status-badge" :class="productStatus.class">
      <i :class="productStatus.icon"></i>
      {{ productStatus.text }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

// 상품 상태 계산
const productStatus = computed(() => {
  const today = new Date();

  // 만기일 체크
  if (props.item.maturityDate) {
    const maturityDate = new Date(props.item.maturityDate);
    const diffTime = maturityDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return { text: '만료', class: 'completed', icon: 'fas fa-check-circle' };
    } else if (diffDays <= 30) {
      return {
        text: '만기임박',
        class: 'warning',
        icon: 'fas fa-exclamation-triangle',
      };
    }
  }

  // 가입일 체크 (신규 상품)
  if (props.item.joinDate) {
    const joinDate = new Date(props.item.joinDate);
    const diffTime = today - joinDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return { text: '신규', class: 'new', icon: 'fas fa-star' };
    }
  }

  // 고수익 상품 체크
  if (props.item.customRate && props.item.customRate >= 4.0) {
    return { text: '고수익', class: 'high-yield', icon: 'fas fa-arrow-up' };
  }

  return null;
});
</script>

<style scoped>
.product-status {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-badge.new {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.status-badge.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.status-badge.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.status-badge.high-yield {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.status-badge i {
  font-size: 0.6rem;
}
</style>
