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

// 메모에서 추가 정보 파싱
const parseAdditionalInfo = (memo) => {
  if (!memo) return {};

  const info = {};
  const lines = memo.split('\n');

  for (const line of lines) {
    if (line.includes('현재가:')) {
      const match = line.match(/현재가:\s*([\d,]+)원/);
      if (match) info.currentPrice = parseInt(match[1].replace(/,/g, ''));
    }
    if (line.includes('보유수량:')) {
      const match = line.match(/보유수량:\s*(\d+)주/);
      if (match) info.quantity = parseInt(match[1]);
    }
    if (line.includes('보장금액:')) {
      const match = line.match(/보장금액:\s*([\d,]+)원/);
      if (match) info.coverage = parseInt(match[1].replace(/,/g, ''));
    }
    if (line.includes('세제혜택:')) {
      const match = line.match(/세제혜택:\s*(.+?)(?:,|$)/);
      if (match) info.taxBenefit = match[1].trim();
    }
  }

  return info;
};

const productStatus = computed(() => {
  const today = new Date();
  const category = props.item.category;
  const additionalInfo = parseAdditionalInfo(props.item.memo);

  // 1. 만료/만기 관련 상태 (최우선)
  if (props.item.maturityDate) {
    const maturityDate = new Date(props.item.maturityDate);
    const diffTime = maturityDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return {
        text: category === '대출' ? '상환완료' : '만료',
        class: 'expired',
        icon: category === '대출' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle',
        priority: 1,
      };
    } else if (diffDays <= 7) {
      return {
        text: category === '대출' ? '상환임박' : '만기임박',
        class: 'urgent',
        icon: 'fas fa-clock',
        priority: 2,
      };
    } else if (diffDays <= 30) {
      return {
        text: category === '대출' ? `상환 ${diffDays}일전` : `만기 ${diffDays}일전`,
        class: 'warning',
        icon: 'fas fa-exclamation-triangle',
        priority: 3,
      };
    }
  }

  // 2. 신규 가입 상태
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

  // 3. 상품별 특수 상태

  // 주식 관련 상태
  if (category === '주식') {
    if (additionalInfo.currentPrice && additionalInfo.quantity && props.item.amount) {
      const currentValue = additionalInfo.currentPrice * additionalInfo.quantity;
      const returnRate = ((currentValue - props.item.amount) / props.item.amount) * 100;

      if (returnRate >= 20) {
        return {
          text: `+${returnRate.toFixed(1)}%`,
          class: 'ultra-profit',
          icon: 'fas fa-rocket',
          priority: 6,
        };
      } else if (returnRate >= 10) {
        return {
          text: `+${returnRate.toFixed(1)}%`,
          class: 'high-profit',
          icon: 'fas fa-trending-up',
          priority: 7,
        };
      } else if (returnRate <= -10) {
        return {
          text: `${returnRate.toFixed(1)}%`,
          class: 'loss',
          icon: 'fas fa-trending-down',
          priority: 8,
        };
      } else if (returnRate > 0) {
        return {
          text: `+${returnRate.toFixed(1)}%`,
          class: 'profit',
          icon: 'fas fa-arrow-up',
          priority: 9,
        };
      }
    }
  }

  // 보험 관련 상태
  if (category === '보험') {
    if (additionalInfo.coverage) {
      const coverageAmount = additionalInfo.coverage;
      if (coverageAmount >= 1000000000) {
        // 10억 이상
        return {
          text: '고액보장',
          class: 'high-coverage',
          icon: 'fas fa-shield-alt',
          priority: 10,
        };
      } else if (coverageAmount >= 100000000) {
        // 1억 이상
        return {
          text: '충분보장',
          class: 'good-coverage',
          icon: 'fas fa-shield-alt',
          priority: 11,
        };
      }
    }

    if (!props.item.maturityDate) {
      return {
        text: '종신보장',
        class: 'lifetime',
        icon: 'fas fa-infinity',
        priority: 12,
      };
    }
  }

  // 연금 관련 상태
  if (category === '연금') {
    if (additionalInfo.taxBenefit) {
      const benefit = additionalInfo.taxBenefit;
      if (benefit === '세액공제' || benefit === '소득공제') {
        return {
          text: '세제혜택',
          class: 'tax-benefit',
          icon: 'fas fa-receipt',
          priority: 13,
        };
      }
    }
  }

  // 대출 관련 상태
  if (category === '대출') {
    const rate = props.item.customRate || props.item.interestRate;
    if (rate) {
      if (rate <= 2.0) {
        return {
          text: '초저금리',
          class: 'ultra-low-rate',
          icon: 'fas fa-percent',
          priority: 14,
        };
      } else if (rate <= 3.0) {
        return {
          text: '저금리',
          class: 'low-rate',
          icon: 'fas fa-percent',
          priority: 15,
        };
      } else if (rate >= 6.0) {
        return {
          text: '고금리',
          class: 'high-rate',
          icon: 'fas fa-exclamation-triangle',
          priority: 16,
        };
      }
    }
  }

  // 4. 수익률 기반 상태 (예금, 적금, 연금, 기타)
  if (['예금', '적금', '연금', '기타'].includes(category)) {
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
        priority: 17,
      };
    } else if (maxRate >= 4.0) {
      return {
        text: '고수익',
        class: 'high-yield',
        icon: 'fas fa-chart-line',
        priority: 18,
      };
    } else if (maxRate >= 3.0) {
      return {
        text: '양호수익',
        class: 'good-yield',
        icon: 'fas fa-thumbs-up',
        priority: 19,
      };
    }
  }

  // 5. 카테고리별 기본 상태
  if (category === '기타') {
    return {
      text: '대체투자',
      class: 'alternative',
      icon: 'fas fa-cube',
      priority: 20,
    };
  }

  // 6. 진행률 기반 상태
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
        priority: 21,
      };
    } else if (progress >= 50) {
      return {
        text: '중간지점',
        class: 'midterm',
        icon: 'fas fa-hourglass-half',
        priority: 22,
      };
    } else if (progress >= 20) {
      return {
        text: '진행중',
        class: 'in-progress',
        icon: 'fas fa-hourglass-start',
        priority: 23,
      };
    }
  }

  // 7. 기본 상태 (활성)
  return {
    text: '운용중',
    class: 'active',
    icon: 'fas fa-play-circle',
    priority: 24,
  };
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
  white-space: nowrap;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 긴급/위험 상태 */
.status-badge.expired {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
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

/* 주식 수익률 상태 */
.status-badge.ultra-profit {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  animation: pulse 2s infinite;
}

.status-badge.high-profit {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.status-badge.profit {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.status-badge.loss {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
}

/* 보험 보장 상태 */
.status-badge.high-coverage {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.status-badge.good-coverage {
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
}

.status-badge.lifetime {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

/* 연금 세제혜택 상태 */
.status-badge.tax-benefit {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* 대출 금리 상태 */
.status-badge.ultra-low-rate {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.status-badge.low-rate {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
}

.status-badge.high-rate {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* 수익률 기반 상태 */
.status-badge.ultra-high-yield {
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  border: 1px solid #fef2f2;
}

.status-badge.high-yield {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.status-badge.good-yield {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* 카테고리 기반 상태 */
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

.status-badge.in-progress {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.status-badge.active {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  opacity: 0.8;
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

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .status-badge,
  .status-badge::before {
    animation: none;
  }
}
</style>
