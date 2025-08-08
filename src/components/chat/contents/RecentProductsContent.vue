<template>
  <div class="container-fluid px-0">
    <div class="recent-viewed-container">
      <!-- 헤더 섹션 -->
      <div class="header-section mb-3">
        <div class="d-flex align-items-center gap-2">
          <div class="ms-2">
            <h5 class="header-title mb-0">{{ title }}</h5>
            <small class="header-subtitle">최근 관심을 보인 금융상품들</small>
          </div>
        </div>
      </div>

      <!-- 상품 리스트 -->
      <div v-if="displayProducts && displayProducts.length > 0" class="products-box">
        <div class="products-container">
          <div
            v-for="(product, index) in displayProducts"
            :key="`${product.productId}-${product.viewedAt}`"
            class="product-card scroll-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="handleProductClick(product)"
          >
            <!-- 카드 컨텐츠 -->
            <div class="card-content position-relative">
              <!-- 상품 헤더 -->
              <div class="product-header mb-2">
                <div class="badges-section">
                  <span class="category-badge">
                    {{ product.categoryName || '금융상품' }}
                  </span>
                  <span v-if="product.subcategoryName" class="subcategory-badge">
                    {{ product.subcategoryName }}
                  </span>
                </div>
                <!-- 조회 시간 표시 -->
                <div class="viewed-time-info d-flex align-items-center gap-1">
                  <i class="bi bi-clock time-icon"></i>
                  <span class="viewed-time">{{ formatViewedTime(product.viewedAt) }}</span>
                </div>
              </div>

              <!-- 상품 정보 -->
              <div class="product-info mb-2">
                <h6 class="product-name mb-1">
                  {{ product.productName || '상품명 없음' }}
                </h6>
                <p class="company-name mb-0">{{ product.korCoNm || '금융기관' }}</p>
              </div>

              <!-- 금리 정보 -->
              <div class="rate-section mb-2">
                <div v-if="hasBaseRate(product)" class="rate-item">
                  <span class="rate-label">기본</span>
                  <span class="rate-value base-rate">{{ formatRate(product.baseRate) }}%</span>
                </div>
                <div v-if="hasMaxRate(product)" class="rate-item">
                  <span class="rate-label">{{ getMaxRateLabel(product) }}</span>
                  <span class="rate-value max-rate">{{ formatRate(product.maxRate) }}%</span>
                </div>
                <div v-if="!hasBaseRate(product) && !hasMaxRate(product)" class="rate-item">
                  <span class="rate-label">금리</span>
                  <span class="rate-value no-rate">문의</span>
                </div>
              </div>

              <!-- 상품 세부 정보 -->
              <div v-if="hasDetailInfo(product)" class="details-section mb-2">
                <div class="details-grid">
                  <div v-if="product.saveTrm" class="detail-tag">
                    <i class="bi bi-calendar3 me-1"></i>
                    {{ product.saveTrm }}개월
                  </div>
                  <div v-if="product.rstvValue" class="detail-tag">
                    <i class="bi bi-wallet2 me-1"></i>
                    {{ product.rstvValue }}
                  </div>
                  <div v-if="product.rstvTypeName" class="detail-tag">
                    <i class="bi bi-tag me-1"></i>
                    {{ product.rstvTypeName }}
                  </div>
                </div>
              </div>

              <!-- 하단 정보 -->
              <div class="product-footer d-flex justify-content-between align-items-center mb-2">
                <div v-if="product.prdtTypeName" class="product-type">
                  <span class="type-badge">{{ product.prdtTypeName }}</span>
                </div>
                <div
                  v-if="product.externalLink && product.externalLink.trim()"
                  class="external-link"
                >
                  <a
                    :href="product.externalLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.stop="handleExternalLink(product.externalLink)"
                    class="link-btn"
                  >
                    <i class="bi bi-arrow-up-right me-1"></i>
                    상세
                  </a>
                </div>
              </div>

              <!-- 조회 상세 정보 (하단) -->
              <div class="viewed-details">
                <div class="viewed-full-time">
                  <i class="bi bi-eye me-1"></i>
                  <span class="full-time-text">{{ formatFullViewedTime(product.viewedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 더보기 버튼 -->
        <div v-if="moreUrl" class="more-section mt-3">
          <button class="more-button w-100" @click="navigateToMore">
            <div class="button-content d-flex align-items-center justify-content-center gap-2">
              <span class="button-text">더 많은 최근 상품 보기</span>
              <div class="button-arrow">
                <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <div class="empty-card">
          <div class="empty-content text-center">
            <div class="empty-icon-wrapper mb-3">
              <span class="empty-icon">👀</span>
            </div>
            <h6 class="empty-title mb-2">No Recent Views</h6>
            <p class="empty-description mb-0">아직 본 상품이 없어요! 금융상품을 둘러보세요.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// Props 정의
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '최근 본 상품',
  },
  moreUrl: {
    type: String,
    default: '',
  },
  maxDisplay: {
    type: Number,
    default: 5,
  },
});

// Emits 정의
const emit = defineEmits(['navigate-to-more', 'product-click']);

// 표시할 상품 목록 (최대 개수 제한, 조회 시간 순 정렬)
const displayProducts = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return [];

  // 조회 시간이 최신인 것부터 정렬
  const sortedData = [...props.data].sort((a, b) => {
    const dateA = new Date(a.viewedAt || 0);
    const dateB = new Date(b.viewedAt || 0);
    return dateB - dateA; // 최신순
  });

  return sortedData.slice(0, props.maxDisplay);
});

// 금리 관련 헬퍼 함수들
const hasBaseRate = (product) => {
  return product.baseRate !== null && product.baseRate !== undefined && product.baseRate > 0;
};

const hasMaxRate = (product) => {
  return product.maxRate !== null && product.maxRate !== undefined && product.maxRate > 0;
};

const getMaxRateLabel = (product) => {
  if (hasBaseRate(product)) {
    return '우대';
  } else {
    return '최고';
  }
};

const hasDetailInfo = (product) => {
  return product.saveTrm || product.rstvValue || product.rstvTypeName;
};

// 금리 포맷팅
const formatRate = (rate) => {
  if (rate === null || rate === undefined || rate === 0) return '0.00';
  return typeof rate === 'number' ? rate.toFixed(2) : parseFloat(rate || 0).toFixed(2);
};

// 숫자 포맷팅 (찜 개수 등)
const formatCount = (count) => {
  if (count === null || count === undefined || count === 0) return '0';
  return count.toLocaleString();
};

// 조회 시간 포맷팅 (상대 시간)
const formatViewedTime = (viewedAt) => {
  if (!viewedAt) return '';

  try {
    const viewedDate = new Date(viewedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - viewedDate) / (1000 * 60));

    if (diffInMinutes < 1) return '방금';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;

    return viewedDate.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return '';
  }
};

// 전체 조회 시간 포맷팅
const formatFullViewedTime = (viewedAt) => {
  if (!viewedAt) return '';

  try {
    const viewedDate = new Date(viewedAt);
    return viewedDate.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '';
  }
};

// 이벤트 핸들러
const navigateToMore = () => {
  emit('navigate-to-more', props.moreUrl);
};

const handleProductClick = (product) => {
  if (!product || !product.productId) return;

  const { productId, subcategoryName, saveTrm, intrRateType, rsrvType } = product;

  let path = '';
  let query = {};

  if (subcategoryName === '정기예금') {
    path = `/products/deposit/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
  } else if (subcategoryName === '자유적금') {
    path = `/products/savings/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
    if (rsrvType) query.rsrvType = rsrvType;
  } else if (subcategoryName === '연금저축') {
    path = `/products/pension/${productId}`;
    if (saveTrm) query.saveTrm = saveTrm;
    if (intrRateType) query.intrRateType = intrRateType;
  } else {
    path = `/products/unknown/${productId}`;
  }

  router.push({ path, query });

  // 상품 클릭 이벤트 emit
  emit('product-click', product);
};

const handleExternalLink = (link) => {
  console.log('외부 링크 클릭:', link);
};
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
}

.recent-viewed-container {
  max-width: 65vw;
  margin: 0 auto;
}

.header-section {
  padding: 0.4rem 0 0rem 0;
  padding-left: 0.2rem;
}

.header-title {
  font-size: 0.9rem !important;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.header-subtitle {
  font-size: 0.7rem !important;
  color: #6b7280;
  font-weight: 400;
}

/* 상품 컨테이너 */
.products-container {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  width: 100%;
}

/* 상품 카드 */
.product-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  flex: 0 0 100%;
  min-width: 100%;
  max-width: 100%;
  scroll-snap-align: center;
  box-shadow: 0 4px 24px rgba(45, 51, 107, 0.12);
}

.product-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 10px 36px rgba(45, 51, 107, 0.2);
}

.card-content {
  padding: 1.25rem;
  z-index: 1;
}

/* 상품 헤더 */
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.badges-section {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-badge {
  background: var(--color-main);
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 50px;
  white-space: nowrap;
}

.subcategory-badge {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-sub);
  font-size: 0.55rem;
  font-weight: 500;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  border: 1px solid rgba(125, 129, 162, 0.3);
  white-space: nowrap;
}

/* 조회 시간 정보 */
.viewed-time-info {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0.3rem 0.6rem;
  border-radius: 50px;
  font-size: 0.65rem;
  color: var(--color-sub);
}

.time-icon {
  font-size: 0.6rem;
  color: var(--color-main);
}

.viewed-time {
  font-weight: 500;
  color: var(--color-main);
}

/* 상품 정보 */
.product-name {
  font-size: 0.8rem !important;
  font-weight: 700;
  color: var(--color-main);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company-name {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--color-sub);
}

/* 금리 섹션 */
.rate-section {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #deecfc80;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.rate-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.rate-label {
  font-size: 0.6rem;
  font-weight: 500;
  color: var(--color-sub);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.rate-value {
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.base-rate {
  color: var(--color-main);
}

.max-rate {
  color: var(--color-main);
}

.no-rate {
  color: var(--color-light);
  font-size: 0.7rem;
  font-style: italic;
}

/* 세부 정보 */
.details-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-tag {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-sub);
  font-size: 0.6rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* 하단 정보 */
.type-badge {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-sub);
  font-size: 0.55rem;
  font-weight: 500;
  padding: 0.2rem 0.5rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.link-btn {
  background: var(--color-main);
  color: white;
  text-decoration: none;
  font-size: 0.6rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.link-btn:hover {
  background: var(--color-sub);
  transform: translateY(-1px);
  color: white;
}

/* 조회 상세 정보 */
.viewed-details {
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
}

.viewed-full-time {
  display: flex;
  align-items: center;
  font-size: 0.55rem;
  color: var(--color-light);
}

.viewed-full-time i {
  color: var(--color-main);
  font-size: 0.5rem;
}

.full-time-text {
  font-weight: 400;
}

/* 더보기 버튼 */
.more-section {
  text-align: center;
}
.more-section.mt-4 {
  margin-top: 0.5rem !important;
}
.more-button {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-main);
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.12);
}

.more-button:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(45, 51, 107, 0.2);
}

.button-arrow {
  transition: transform 0.3s ease;
}

.more-button:hover .button-arrow {
  transform: translateX(3px);
}

/* 빈 상태 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 15rem;
}

.empty-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 1.25rem;
  width: 100%;
  max-width: 20rem;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.1);
}

.empty-content {
  padding: 3rem 2rem;
}

.empty-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.empty-icon {
  font-size: 1.5rem;
  animation: gentle-float 3s ease-in-out infinite;
}

.empty-title {
  font-size: 1rem !important;
  font-weight: 700;
  color: var(--color-main);
  line-height: 1.3;
}

.empty-description {
  font-size: 0.75rem;
  color: var(--color-sub);
  line-height: 1.4;
}

/* 애니메이션 */
@keyframes gentle-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
