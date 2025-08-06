<template>
  <div class="summary-card">
    <div class="summary-grid">
      <div
        class="summary-item primary"
        :tabindex="0"
        role="button"
        :aria-label="`총 자산 ${formatCurrency(totalAmount)}`"
        @click="$emit('focus-metric', 'totalAmount')"
      >
        <div class="summary-icon">
          <i class="bi bi-wallet2"></i>
        </div>
        <small class="summary-label">총 자산</small>
        <h4 class="summary-value">{{ formatCurrency(totalAmount) }}</h4>
      </div>

      <div
        class="summary-item secondary"
        :tabindex="0"
        role="button"
        :aria-label="`보유 상품 ${portfolioCount}개`"
        @click="$emit('focus-metric', 'portfolioCount')"
      >
        <div class="summary-icon">
          <i class="bi bi-collection"></i>
        </div>
        <small class="summary-label">보유 상품</small>
        <h4 class="summary-value">{{ portfolioCount }}개</h4>
        <div class="summary-detail">
          <small>{{ getPortfolioInsight() }}</small>
        </div>
      </div>

      <div
        class="summary-item tertiary"
        :tabindex="0"
        role="button"
        :aria-label="`카테고리 ${categoryCount}개`"
        @click="$emit('focus-metric', 'categoryCount')"
      >
        <div class="summary-icon">
          <i class="bi bi-grid-3x3-gap"></i>
        </div>
        <small class="summary-label">카테고리</small>
        <h4 class="summary-value">{{ categoryCount }}개</h4>
        <div class="summary-detail">
          <small>{{ getDiversityLevel() }}</small>
        </div>
      </div>

      <div
        class="summary-item quaternary"
        :tabindex="0"
        role="button"
        :aria-label="`평균 투자액 ${formatCurrency(averageAmount)}`"
        @click="$emit('focus-metric', 'averageAmount')"
      >
        <div class="summary-icon">
          <i class="bi bi-bar-chart-line"></i>
        </div>
        <small class="summary-label">평균 투자액</small>
        <h4 class="summary-value">{{ formatCurrency(averageAmount) }}</h4>
        <div class="summary-detail">
          <small>{{ getAverageInsight() }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  portfolioCount: {
    type: Number,
    required: true,
    default: 0,
  },
  categoryCount: {
    type: Number,
    required: true,
    default: 0,
  },
  averageAmount: {
    type: Number,
    required: true,
    default: 0,
  },
});

// 이벤트 정의
const emit = defineEmits(['focus-metric']);

// 통화 포맷팅 (한국 스타일에 최적화)
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '0원';

  // 1억 이상은 억 단위로 표시
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remainder = amount % 100000000;
    if (remainder === 0) {
      return `${eok}억원`;
    } else {
      const man = Math.floor(remainder / 10000);
      if (man === 0) {
        return `${eok}억원`;
      }
      return `${eok}억 ${man}만원`;
    }
  }

  // 1만 이상은 만 단위로 표시
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    } else if (remainder < 1000) {
      return `${man}만원`;
    } else {
      return `${man}만 ${Math.floor(remainder / 1000)}천원`;
    }
  }

  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

// 포트폴리오 인사이트 - 실제 데이터에 맞게 조정
const getPortfolioInsight = () => {
  if (props.portfolioCount === 0) return '상품 없음';
  if (props.portfolioCount <= 2) return '집중 투자';
  if (props.portfolioCount <= 5) return '적정 분산';
  if (props.portfolioCount <= 7) return '다양한 분산';
  if (props.portfolioCount <= 10) return '충분한 분산';
  return '많은 상품';
};

// 다양성 수준 - 실제 JSON 데이터의 카테고리 수에 맞게 조정
const getDiversityLevel = () => {
  if (props.categoryCount === 0) return '분류 없음';
  if (props.categoryCount === 1) return '단일 유형';
  if (props.categoryCount === 2) return '기본 분산';
  if (props.categoryCount === 3) return '적정 분산';
  if (props.categoryCount === 4) return '좋은 분산';
  if (props.categoryCount >= 5) return '매우 다양함';
  return '균형 잡힌';
};

// 평균 투자액 인사이트 - 한국 실정에 맞게 조정
const getAverageInsight = () => {
  if (props.averageAmount === 0) return '';
  if (props.averageAmount < 1000000) return '소액 투자';
  if (props.averageAmount < 3000000) return '기본 규모';
  if (props.averageAmount < 10000000) return '중간 규모';
  if (props.averageAmount < 50000000) return '안정적 규모';
  return '대규모 투자';
};
</script>
<style scoped>
.summary-card {
  max-width: 26.875rem;
  width: 100%;
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(45, 51, 107, 0.1),
    0 2px 4px -1px rgba(45, 51, 107, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(45, 51, 107, 0.15);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.summary-item {
  text-align: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(185, 187, 204, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.summary-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-main);
  transform: scaleX(0);
  transition: transform 0.3s ease;
  transform-origin: left;
}

.summary-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.4);
  transform: translateY(-2px);
}

.summary-item:hover::before {
  transform: scaleX(1);
}

.summary-item:active {
  transform: translateY(0);
}

.summary-item.primary::before {
  background: linear-gradient(90deg, var(--color-main) 0%, var(--color-sub) 100%);
}

.summary-item.secondary::before {
  background: linear-gradient(90deg, var(--color-sub) 0%, var(--color-light) 100%);
}

.summary-item.tertiary::before {
  background: linear-gradient(90deg, var(--color-light) 0%, var(--color-sub) 100%);
}

.summary-item.quaternary::before {
  background: linear-gradient(90deg, var(--color-sub) 0%, var(--color-light) 100%);
}

.summary-icon {
  margin-bottom: 0.5rem;
}

.summary-icon i {
  font-size: 1.5rem;
  opacity: 0.9;
  transition: all 0.3s ease;
}

.summary-item:hover .summary-icon i {
  transform: scale(1.1);
  opacity: 1;
}

.summary-item.primary .summary-icon i {
  color: var(--color-main);
}

.summary-item.secondary .summary-icon i {
  color: var(--color-sub);
}

.summary-item.tertiary .summary-icon i {
  color: var(--color-light);
}

.summary-item.quaternary .summary-icon i {
  color: var(--color-sub);
}

.summary-label {
  color: var(--color-sub);
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}

.summary-value {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--color-main);
  line-height: 1.2;
}

.summary-detail {
  margin-top: 0.25rem;
}

.summary-detail small {
  color: var(--color-sub);
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.8;
}

/* 로딩 상태 (옵션) */
.summary-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.summary-item.loading .summary-value {
  background: linear-gradient(
    90deg,
    var(--color-bg-light) 25%,
    var(--color-light) 50%,
    var(--color-bg-light) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  height: 1.2em;
  color: transparent;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 포커스 상태 */
.summary-item:focus {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}
</style>
