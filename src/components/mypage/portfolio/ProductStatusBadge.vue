<template>
  <div v-if="productStatus" class="product-status">
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

const productStatus = computed(() => {
  const today = new Date();

  if (props.item.maturityDate) {
    const maturityDate = new Date(props.item.maturityDate);
    const diffTime = maturityDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return {
        text: '만료',
        class: 'expired',
        icon: 'fas fa-exclamation-circle',
        priority: 1,
      };
    } else if (diffDays <= 7) {
      return {
        text: '만기임박',
        class: 'urgent',
        icon: 'fas fa-clock',
        priority: 2,
      };
    } else if (diffDays <= 30) {
      return {
        text: `만기 ${diffDays}일전`,
        class: 'warning',
        icon: 'fas fa-exclamation-triangle',
        priority: 3,
      };
    }
  }

  if (props.item.joinDate) {
    const joinDate = new Date(props.item.joinDate);
    const diffTime = today - joinDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return {
        text: '신규',
        class: 'new',
        icon: 'fas fa-star',
        priority: 4,
      };
    } else if (diffDays <= 30) {
      return {
        text: '최근가입',
        class: 'recent',
        icon: 'fas fa-bookmark',
        priority: 5,
      };
    }
  }

  const interestRate = props.item.interestRate;
  const customRate = props.item.customRate;
  const expectedReturn = props.item.expectedReturn;

  const rates = [interestRate, customRate, expectedReturn].filter((rate) => rate && rate > 0);
  const maxRate = rates.length > 0 ? Math.max(...rates) : 0;

  if (maxRate >= 5.0) {
    return {
      text: '초고수익',
      class: 'ultra-high-yield',
      icon: 'fas fa-rocket',
      priority: 6,
    };
  } else if (maxRate >= 4.0) {
    return {
      text: '고수익',
      class: 'high-yield',
      icon: 'fas fa-chart-line',
      priority: 7,
    };
  }

  if (props.item.category === '대출') {
    return {
      text: '대출상품',
      class: 'loan',
      icon: 'fas fa-credit-card',
      priority: 10,
    };
  }

  if (props.item.category === '보험' && !props.item.maturityDate) {
    return {
      text: '종신보장',
      class: 'lifetime',
      icon: 'fas fa-infinity',
      priority: 11,
    };
  }

  if (props.item.category === '기타') {
    return {
      text: '대체투자',
      class: 'alternative',
      icon: 'fas fa-building',
      priority: 12,
    };
  }

  if (props.item.saveTrm && props.item.joinDate && props.item.maturityDate) {
    const joinDate = new Date(props.item.joinDate);
    const maturityDate = new Date(props.item.maturityDate);
    const totalDuration = maturityDate - joinDate;
    const elapsed = today - joinDate;
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

    if (progress >= 80) {
      return {
        text: '만기근접',
        class: 'near-maturity',
        icon: 'fas fa-hourglass-end',
        priority: 13,
      };
    } else if (progress >= 50) {
      return {
        text: '중간지점',
        class: 'midterm',
        icon: 'fas fa-hourglass-half',
        priority: 14,
      };
    }
  }

  return null;
});
</script>

<style scoped>
.product-status {
  z-index: 10;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.6rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 긴급/위험 상태 */
.status-badge.expired {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  animation: pulse 2s infinite;
}

.status-badge.urgent {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  animation: pulse 2s infinite;
}

.status-badge.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* 신규/최근 상태 */
.status-badge.new {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  position: relative;
  overflow: hidden;
}

.status-badge.new::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  animation: shine 3s infinite;
}

.status-badge.recent {
  background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
}

/* 수익률 기반 상태 */
.status-badge.ultra-high-yield {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  border: 1px solid #fef2f2;
}

.status-badge.high-yield {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* 카테고리 기반 상태 */
.status-badge.loan {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.status-badge.lifetime {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.status-badge.alternative {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

/* 진행 상태 */
.status-badge.near-maturity {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.status-badge.midterm {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.status-badge i {
  font-size: 0.65rem;
  flex-shrink: 0;
}

/* 애니메이션 */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
</style>
