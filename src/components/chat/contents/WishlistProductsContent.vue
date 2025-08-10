<template>
  <div class="container-fluid px-0">
    <div class="wishlist-container">
      <!-- 헤더 섹션 -->
      <div class="header-section mb-3">
        <div class="d-flex align-items-center gap-2">
          <div>
            <h5 class="header-title mb-0" v-html="message.title"></h5>
            <small class="header-subtitle" v-html="message.subtitle"></small>
          </div>
        </div>
      </div>

      <!-- 상품 리스트 -->
      <div v-if="displayProducts && displayProducts.length > 0" class="products-box">
        <div class="products-container">
          <div
            v-for="(product, index) in displayProducts"
            :key="product.productId || product.productName"
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
                    <i class="fas fa-tags" style="margin-right: 0.25rem; font-size: 0.5rem"></i>
                    {{ product.categoryName || '금융상품' }}
                  </span>
                  <span v-if="product.subcategoryName" class="subcategory-badge">
                    <i class="fas fa-tag" style="margin-right: 0.25rem; font-size: 0.45rem"></i>
                    {{ product.subcategoryName }}
                  </span>
                </div>
                <div class="wishlist-info d-flex align-items-center gap-1">
                  <i class="fas fa-star star-icon" style="font-size: 0.7rem; color: #fbbf24"></i>
                  <span class="wishlist-count">{{ formatCount(product.wishlistCount) }}</span>
                </div>
              </div>

              <!-- 상품 정보 -->
              <div class="product-info mb-2">
                <h6 class="product-name mb-1">
                  {{ product.productName || '상품명 없음' }}
                </h6>
                <p class="company-name mb-0">
                  <i class="fas fa-building" style="margin-right: 0.25rem; font-size: 0.6rem"></i>
                  {{ product.korCoNm || '금융기관' }}
                </p>
              </div>

              <!-- 금리 정보 -->
              <div class="rate-section mb-2">
                <div v-if="hasBaseRate(product)" class="rate-item">
                  <span class="rate-label">
                    <i
                      class="fas fa-percentage"
                      style="margin-right: 0.25rem; font-size: 0.5rem"
                    ></i>
                    기본
                  </span>
                  <span class="rate-value base-rate">{{ formatRate(product.baseRate) }}%</span>
                </div>
                <div v-if="hasMaxRate(product)" class="rate-item">
                  <span class="rate-label">
                    <i class="fas fa-arrow-up" style="margin-right: 0.25rem; font-size: 0.5rem"></i>
                    {{ getMaxRateLabel(product) }}
                  </span>
                  <span class="rate-value max-rate">{{ formatRate(product.maxRate) }}%</span>
                </div>
                <div v-if="!hasBaseRate(product) && !hasMaxRate(product)" class="rate-item">
                  <span class="rate-label">
                    <i class="fas fa-phone" style="margin-right: 0.25rem; font-size: 0.5rem"></i>
                    금리
                  </span>
                  <span class="rate-value no-rate">문의</span>
                </div>
              </div>

              <!-- 상품 세부 정보 -->
              <div v-if="hasDetailInfo(product)" class="details-section mb-2">
                <div class="details-grid">
                  <div v-if="product.saveTrm" class="detail-tag">
                    <i
                      class="fas fa-calendar-alt"
                      style="margin-right: 0.25rem; font-size: 0.5rem"
                    ></i>
                    {{ product.saveTrm }}개월
                  </div>
                  <div v-if="product.rstvValue" class="detail-tag">
                    <i class="fas fa-wallet" style="margin-right: 0.25rem; font-size: 0.5rem"></i>
                    {{ product.rstvValue }}
                  </div>
                  <div v-if="product.rstvTypeName" class="detail-tag">
                    <i
                      class="fas fa-info-circle"
                      style="margin-right: 0.25rem; font-size: 0.5rem"
                    ></i>
                    {{ product.rstvTypeName }}
                  </div>
                </div>
              </div>

              <!-- 하단 정보 -->
              <div class="product-footer d-flex justify-content-between align-items-center">
                <div v-if="product.prdtTypeName" class="product-type">
                  <span class="type-badge">
                    <i
                      class="fas fa-bookmark"
                      style="margin-right: 0.25rem; font-size: 0.45rem"
                    ></i>
                    {{ product.prdtTypeName }}
                  </span>
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
                    <i
                      class="fas fa-external-link-alt"
                      style="margin-right: 0.25rem; font-size: 0.5rem"
                    ></i>
                    상세
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 더보기 버튼 -->
        <div v-if="moreUrl" class="more-section mt-3">
          <button class="more-button w-100" @click="navigateToMore">
            <div class="button-content d-flex align-items-center justify-content-center gap-2">
              <span class="button-text">더 많은 상품 보기</span>
              <div class="button-arrow">
                <i class="fas fa-arrow-right" style="font-size: 0.875rem"></i>
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
              <i class="fas fa-heart empty-icon" style="color: #fbbf24"></i>
            </div>
            <h6 class="empty-title mb-2">No Favorites Yet</h6>
            <p class="empty-description mb-0">
              <i
                class="fas fa-star"
                style="margin-right: 0.25rem; font-size: 0.7rem; color: #fbbf24"
              ></i>
              관심있는 금융상품을 찜해보세요!
            </p>
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
    default: 'My Wishlist',
  },
  moreUrl: {
    type: String,
    default: '',
  },
  maxDisplay: {
    type: Number,
    default: 5,
  },
  message: {
    type: Object,
    required: true,
  },
});

// Emits 정의
const emit = defineEmits(['navigate-to-more', 'product-click']);

// 표시할 상품 목록 (최대 개수 제한)
const displayProducts = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return [];
  return props.data.slice(0, props.maxDisplay);
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
};

const handleExternalLink = (link) => {
  console.log(
    '<i class="fas fa-external-link-alt" style="color: #4a90e2;"></i> 외부 링크 클릭:',
    link
  );
};
</script>

<style scoped>
:root {
  --color-main: #2d336b;
  --color-sub: #7d81a2;
  --color-light: #b9bbcc;
  --color-bg-light: #eeeef3;
  --color-white: #ffffff;
}

.wishlist-container {
  max-width: 65vw;
  margin: 0 auto;
}

.header-section {
  padding: 0.4rem 0 0rem 0;
  padding-left: 0.2rem;
  margin-bottom: 0rem !important;
}

.header-title {
  font-size: 0.9rem !important;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

/* Header title Font Awesome 아이콘 스타일 */
.header-title :deep(.fas) {
  margin-right: 0.5rem;
  font-size: 0.85rem;
}

.header-subtitle {
  font-size: 0.7rem !important;
  color: #6b7280;
  font-weight: 400;
}

.header-subtitle :deep(i.fas) {
  margin-right: 0.25rem;
  font-size: 0.65rem !important;
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
}

/* v-html로 렌더링된 아이콘에 대한 스타일 */
.header-subtitle i.fas {
  margin-right: 0.25rem;
  font-size: 0.65rem !important;
  display: inline-block;
  vertical-align: middle;
  color: #ffc107; /* 색상도 명시적으로 지정 */
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
  box-shadow: 0 0 20px rgba(45, 51, 107, 0.15);
}

.product-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 30px rgba(45, 51, 107, 0.25);
}

.product-card:hover .fas {
  animation: icon-bounce 0.6s ease-in-out;
}

.card-content {
  padding: 0.7rem;
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
  gap: 0.2rem;
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
  display: flex;
  align-items: center;
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
  display: flex;
  align-items: center;
}

.wishlist-info {
  font-size: 0.65rem;
  color: var(--color-sub);
}

.star-icon {
  animation: star-twinkle 2s ease-in-out infinite;
}

.wishlist-count {
  font-weight: 600;
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
  display: flex;
  align-items: center;
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
  display: flex;
  align-items: center;
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
  display: flex;
  align-items: center;
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

.link-btn:hover .fas {
  animation: link-pulse 0.6s ease-in-out;
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

.more-button:hover .button-arrow .fas {
  animation: arrow-pulse 0.6s ease-in-out;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Font Awesome 아이콘 애니메이션 */
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

@keyframes star-twinkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.9);
  }
}

@keyframes icon-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes link-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes arrow-pulse {
  0%,
  100% {
    transform: translateX(3px) scale(1);
  }
  50% {
    transform: translateX(6px) scale(1.1);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .wishlist-container {
    max-width: 90vw;
  }
}
</style>
