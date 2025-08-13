<template>
  <div class="compare-table-container">
    <!-- 데스크톱용 테이블 -->
    <div class="desktop-table">
      <table class="compare-table">
        <thead>
          <tr>
            <th class="category-header">구분</th>
            <th v-for="item in items" :key="item.productId" class="product-header">
              <div class="product-header-content">
                <div class="bank-info">
                  <div class="bank-logo">{{ item.korCoNm.charAt(0) }}</div>
                  <div class="bank-name">{{ item.korCoNm }}</div>
                </div>
                <div class="product-name">{{ item.productName || item.finPrdtNm }}</div>
                <button
                  class="remove-btn"
                  title="비교함에서 제거"
                  @click="$emit('remove', item.productId, item.saveTrm, item.intrRateType)"
                >
                  ×
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- 금리 정보 -->
          <tr class="rate-row">
            <td class="category-cell">
              <div class="category-label">
                <span class="icon">💰</span>
                <span>금리</span>
              </div>
            </td>
            <td v-for="item in items" :key="`rate-${item.productId}`" class="data-cell">
              <div class="rate-info">
                <div class="rate-value">연 {{ item.intrRate2 || item.intrRate }}%</div>
                <div class="rate-type">
                  {{ getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType) }}
                </div>
              </div>
            </td>
          </tr>

          <!-- 가입 기간 -->
          <tr>
            <td class="category-cell">
              <div class="category-label">
                <span class="icon">📅</span>
                <span>가입기간</span>
              </div>
            </td>
            <td v-for="item in items" :key="`term-${item.productId}`" class="data-cell">
              <div class="term-info">{{ item.saveTrm }}개월</div>
            </td>
          </tr>

          <!-- 가입 금액 -->
          <tr>
            <td class="category-cell">
              <div class="category-label">
                <span class="icon">💳</span>
                <span>가입금액</span>
              </div>
            </td>
            <td v-for="item in items" :key="`amount-${item.productId}`" class="data-cell">
              <div class="amount-info">
                <div class="min-amount">최소: {{ getMinDepositForProduct(item.productId) }}</div>
                <div class="max-amount">최대: {{ getMaxDepositForProduct(item.productId) }}</div>
              </div>
            </td>
          </tr>

          <!-- 가입 대상 -->
          <tr>
            <td class="category-cell">
              <div class="category-label">
                <span class="icon">👤</span>
                <span>가입대상</span>
              </div>
            </td>
            <td v-for="item in items" :key="`member-${item.productId}`" class="data-cell">
              <div class="member-info">
                {{ item.joinMember || item.join_member || '실명의 개인' }}
              </div>
            </td>
          </tr>

          <!-- 가입 방법 -->
          <tr>
            <td class="category-cell">
              <div class="category-label">
                <span class="icon">🌐</span>
                <span>가입방법</span>
              </div>
            </td>
            <td v-for="item in items" :key="`way-${item.productId}`" class="data-cell">
              <div class="join-way">{{ item.joinWay || '인터넷, 스마트폰, 영업점' }}</div>
            </td>
          </tr>

          <!-- 우대 조건 -->
          <tr v-if="hasPreferentialTags">
            <td class="category-cell">
              <div class="category-label">
                <span class="icon">⭐</span>
                <span>우대조건</span>
              </div>
            </td>
            <td v-for="item in items" :key="`pref-${item.productId}`" class="data-cell">
              <div class="preferential-tags">
                <span
                  v-for="tag in item.preferentialTags || item.preferential_tags || []"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="!(item.preferentialTags || item.preferential_tags)?.length"
                  class="no-data"
                >
                  해당없음
                </span>
              </div>
            </td>
          </tr>

          <!-- 특이사항 -->
          <tr v-if="hasSpecialConditions">
            <td class="category-cell">
              <div class="category-label">
                <span class="icon">📋</span>
                <span>특이사항</span>
              </div>
            </td>
            <td v-for="item in items" :key="`note-${item.productId}`" class="data-cell">
              <div class="note-info">{{ item.etcNote || item.etc_note || '없음' }}</div>
            </td>
          </tr>

          <!-- 액션 버튼 -->
          <tr class="action-row">
            <td class="category-cell">
              <div class="category-label">
                <span class="icon">🔗</span>
                <span>액션</span>
              </div>
            </td>
            <td v-for="item in items" :key="`action-${item.productId}`" class="data-cell">
              <div class="action-buttons">
                <button
                  class="detail-btn"
                  @click="$emit('viewDetail', item.productId, item.productType, item.saveTrm)"
                >
                  상세보기
                </button>
                <button class="join-btn" @click="$emit('joinProduct', item)">가입하기</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 모바일용 카드 -->
    <div class="mobile-cards">
      <div v-for="item in items" :key="item.productId" class="product-card">
        <!-- 카드 헤더 -->
        <div class="card-header">
          <div class="bank-info">
            <div class="bank-logo">{{ item.korCoNm.charAt(0) }}</div>
            <div>
              <div class="bank-name">{{ item.korCoNm }}</div>
              <div class="product-name">{{ item.productName || item.finPrdtNm }}</div>
            </div>
          </div>
          <button
            class="remove-btn"
            @click="$emit('remove', item.productId, item.saveTrm, item.intrRateType)"
          >
            ×
          </button>
        </div>

        <!-- 카드 컨텐츠 -->
        <div class="card-content">
          <!-- 금리 (하이라이트) -->
          <div class="highlight-info">
            <div class="rate-display">
              <span class="rate-label">금리</span>
              <span class="rate-value">연 {{ item.intrRate2 || item.intrRate }}%</span>
              <span class="rate-type"
                >({{
                  getInterestTypeForProduct(item.productId, item.saveTrm, item.intrRateType)
                }})</span
              >
            </div>
          </div>

          <!-- 기본 정보 -->
          <div class="info-grid">
            <div class="info-item">
              <span class="label">가입기간</span>
              <span class="value">{{ item.saveTrm }}개월</span>
            </div>
            <div class="info-item">
              <span class="label">최소가입금액</span>
              <span class="value">{{ getMinDepositForProduct(item.productId) }}</span>
            </div>
            <div class="info-item">
              <span class="label">최대가입금액</span>
              <span class="value">{{ getMaxDepositForProduct(item.productId) }}</span>
            </div>
            <div class="info-item">
              <span class="label">가입대상</span>
              <span class="value">{{ item.joinMember || item.join_member || '실명의 개인' }}</span>
            </div>
            <div class="info-item">
              <span class="label">가입방법</span>
              <span class="value">{{ item.joinWay || '인터넷, 스마트폰, 영업점' }}</span>
            </div>
          </div>

          <!-- 우대 조건 -->
          <div
            v-if="(item.preferentialTags || item.preferential_tags)?.length"
            class="preferential-section"
          >
            <div class="section-title">우대조건</div>
            <div class="tag-list">
              <span
                v-for="tag in item.preferentialTags || item.preferential_tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 특이사항 -->
          <div v-if="item.etcNote || item.etc_note" class="note-section">
            <div class="section-title">특이사항</div>
            <div class="note-content">{{ item.etcNote || item.etc_note }}</div>
          </div>

          <!-- 액션 버튼 -->
          <div class="card-actions">
            <button
              class="detail-btn"
              @click="$emit('viewDetail', item.productId, item.productType, item.saveTrm)"
            >
              상세보기
            </button>
            <button class="join-btn" @click="$emit('joinProduct', item)">가입하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  compareData: {
    type: Object,
    default: null,
  },
  getMinDepositForProduct: {
    type: Function,
    required: true,
  },
  getMaxDepositForProduct: {
    type: Function,
    required: true,
  },
  getInterestTypeForProduct: {
    type: Function,
    required: true,
  },
});

// Emits
defineEmits(['remove', 'viewDetail', 'joinProduct']);

// 우대 조건이 있는지 확인
const hasPreferentialTags = computed(() => {
  return props.items.some((item) => (item.preferentialTags || item.preferential_tags)?.length > 0);
});

// 특이사항이 있는지 확인
const hasSpecialConditions = computed(() => {
  return props.items.some(
    (item) =>
      (item.etcNote || item.etc_note) &&
      (item.etcNote || item.etc_note) !== '없음' &&
      (item.etcNote || item.etc_note) !== 'null'
  );
});
</script>

<style scoped>
/* 컨테이너 */
.compare-table-container {
  background-color: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 1rem rgba(45, 51, 107, 0.08);
}

/* 데스크톱 테이블 */
.desktop-table {
  display: block;
  overflow-x: auto;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

/* 테이블 헤더 */
.compare-table thead {
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
}

.category-header {
  width: 150px;
  min-width: 150px;
  padding: 1.5rem 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 1.125rem;
  position: sticky;
  left: 0;
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  z-index: 10;
}

.product-header {
  padding: 1rem;
  text-align: center;
  min-width: 200px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.product-header-content {
  position: relative;
}

.bank-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.bank-logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.bank-name {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

.remove-btn {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.125rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 테이블 바디 */
.compare-table tbody tr {
  border-bottom: 1px solid var(--color-bg-light);
}

.compare-table tbody tr:hover {
  background-color: rgba(45, 51, 107, 0.02);
}

.category-cell {
  width: 150px;
  min-width: 150px;
  padding: 1.25rem 1rem;
  background-color: var(--color-bg-light);
  position: sticky;
  left: 0;
  z-index: 5;
  border-right: 1px solid #ddd;
}

.category-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-main);
  font-size: 0.9375rem;
}

.icon {
  font-size: 1.125rem;
}

.data-cell {
  padding: 1.25rem 1rem;
  text-align: center;
  vertical-align: middle;
  border-left: 1px solid var(--color-bg-light);
}

/* 금리 정보 스타일 */
.rate-row {
  background-color: rgba(45, 51, 107, 0.03);
}

.rate-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rate-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-main);
}

.rate-type {
  font-size: 0.8125rem;
  color: var(--color-sub);
}

/* 기간 정보 */
.term-info {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
}

/* 금액 정보 */
.amount-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.min-amount {
  color: var(--color-sub);
}

.max-amount {
  color: var(--color-sub);
}

/* 가입 정보 */
.member-info,
.join-way {
  font-size: 0.875rem;
  color: var(--color-sub);
  line-height: 1.4;
}

/* 우대 조건 */
.preferential-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
}

.tag {
  background-color: var(--color-main);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.no-data {
  color: var(--color-light);
  font-size: 0.875rem;
}

/* 특이사항 */
.note-info {
  font-size: 0.8125rem;
  color: var(--color-sub);
  line-height: 1.4;
  max-width: 200px;
  margin: 0 auto;
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-btn,
.join-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.detail-btn {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  border: 1px solid var(--color-light);
}

.detail-btn:hover {
  background-color: var(--color-light);
  color: white;
}

.join-btn {
  background-color: var(--color-main);
  color: white;
}

.join-btn:hover {
  background-color: #3d4785;
  transform: translateY(-1px);
}

/* 모바일 카드 (기본적으로 숨김) */
.mobile-cards {
  display: none;
}

/* 모바일 반응형 */
@media (max-width: 1024px) {
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
    padding: 1rem;
    gap: 1rem;
  }

  .product-card {
    background-color: white;
    border-radius: 0.75rem;
    border: 1px solid var(--color-bg-light);
    margin-bottom: 1rem;
    overflow: hidden;
  }

  .card-header {
    background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
    color: white;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .card-header .bank-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .card-header .bank-logo {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.125rem;
  }

  .card-header .bank-name {
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0.9;
    margin-bottom: 0.25rem;
  }

  .card-header .product-name {
    font-size: 1rem;
    font-weight: 600;
  }

  .card-header .remove-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.25rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-content {
    padding: 1rem;
  }

  .highlight-info {
    background: linear-gradient(135deg, rgba(45, 51, 107, 0.05) 0%, rgba(45, 51, 107, 0.1) 100%);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .rate-display {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .rate-label {
    font-size: 0.875rem;
    color: var(--color-sub);
    font-weight: 500;
  }

  .rate-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-main);
  }

  .rate-type {
    font-size: 0.8125rem;
    color: var(--color-sub);
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .info-item .label {
    font-size: 0.75rem;
    color: var(--color-sub);
    font-weight: 500;
  }

  .info-item .value {
    font-size: 0.875rem;
    color: var(--color-main);
    font-weight: 600;
  }

  .preferential-section,
  .note-section {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background-color: var(--color-bg-light);
    border-radius: 0.5rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-main);
    margin-bottom: 0.5rem;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tag-list .tag {
    background-color: var(--color-main);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .note-content {
    font-size: 0.8125rem;
    color: var(--color-sub);
    line-height: 1.4;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
  }

  .card-actions .detail-btn,
  .card-actions .join-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .card-actions .detail-btn {
    background-color: var(--color-bg-light);
    color: var(--color-main);
    border: 1px solid var(--color-light);
  }

  .card-actions .detail-btn:hover {
    background-color: var(--color-light);
    color: white;
  }

  .card-actions .join-btn {
    background-color: var(--color-main);
    color: white;
  }

  .card-actions .join-btn:hover {
    background-color: #3d4785;
  }
}
</style>
