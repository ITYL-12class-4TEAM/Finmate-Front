<template>
  <div class="recent-view-info">
    <div class="product-details">
      <h6 class="product-name">{{ product.productName }}</h6>
      <div class="recent-meta">
        <span class="company-name">{{ product.korCoNm }}</span>
        <div class="viewed-time">
          <i class="fa-regular fa-clock"></i>
          <span>{{ formatViewTime(product.viewedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
});
// 조회 시간 포맷팅
const formatViewTime = (viewedAt) => {
  if (!viewedAt) return '방금 전';

  const now = new Date();
  const viewed = new Date(viewedAt);
  const diffInMinutes = Math.floor((now - viewed) / (1000 * 60));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return viewed.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped>
.recent-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.recent-view-info {
  width: 100%;
  max-width: 26.875rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.recent-view-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(45, 51, 107, 0.4) 0%,
    rgba(125, 129, 162, 0.4) 100%
  );
  transform: scaleY(0);
  transition: transform 0.3s ease;
  transform-origin: top;
}
/* 최근 조회 메타 정보 */
.recent-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  gap: 0.75rem;
}

.viewed-time {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--color-sub);
  font-size: 0.75rem;
  font-weight: 500;
}

.viewed-time i {
  font-size: 0.7rem;
  color: var(--color-light);
}
.recent-view-info:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(185, 187, 204, 0.3);
  transform: translateY(-1px);
}

.recent-view-info:hover::before {
  transform: scaleY(1);
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-main);
  line-height: 1.4;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: color 0.2s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.company-name {
  font-size: 0.8rem;
  color: var(--color-sub);
  font-weight: 500;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  opacity: 0.9;
  line-height: 1.3;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 호버 시 제목 색상 변화 */
.recent-view-info:hover .product-name {
  color: #1e2555;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .recent-view-info {
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.5rem;
    max-width: none;
  }

  .product-name {
    font-size: 0.95rem;
  }

  .company-info {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .interest-rate {
    align-self: flex-end;
    font-size: 0.65rem;
  }
}

@media (max-width: 480px) {
  .recent-view-info {
    padding: 0.375rem 0.5rem;
  }

  .product-name {
    font-size: 0.9rem;
  }

  .company-name {
    font-size: 0.75rem;
  }

  .interest-rate {
    font-size: 0.6rem;
    padding: 0.2rem 0.4rem;
  }
}

/* 로딩 상태 애니메이션 */
.recent-view-info.loading .product-name,
.recent-view-info.loading .company-name {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
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
.recent-view-info:focus-within {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}

/* 최근 조회 특화 스타일 */
.recent-view-info.highlighted {
  background: linear-gradient(
    135deg,
    rgba(5, 150, 105, 0.05) 0%,
    rgba(16, 185, 129, 0.02) 100%
  );
  border-color: rgba(5, 150, 105, 0.2);
}

.recent-view-info.highlighted::before {
  background: linear-gradient(180deg, #059669 0%, #10b981 100%);
}

/* 새로 조회된 항목 스타일 */
.recent-view-info.newly-viewed {
  animation: newlyViewedPulse 0.8s ease-out;
}

@keyframes newlyViewedPulse {
  0% {
    background: rgba(5, 150, 105, 0.1);
    transform: scale(1);
  }
  50% {
    background: rgba(5, 150, 105, 0.05);
    transform: scale(1.01);
  }
  100% {
    background: rgba(255, 255, 255, 0.6);
    transform: scale(1);
  }
}

/* 즐겨찾기 상품 표시 */
.recent-view-info.is-favorite .product-name::after {
  content: '❤️';
  margin-left: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

/* 특별 상품 배지 (선택적 사용) */
.recent-view-info.special-product::after {
  content: 'HOT';
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  border-radius: 0.5rem;
  transform: rotate(12deg);
  animation: hotBadge 2s infinite;
}

@keyframes hotBadge {
  0%,
  100% {
    transform: rotate(12deg) scale(1);
  }
  50% {
    transform: rotate(12deg) scale(1.1);
  }
}
</style>
