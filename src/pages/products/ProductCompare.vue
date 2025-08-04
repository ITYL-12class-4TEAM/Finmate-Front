<!-- pages/products/ProductCompare.vue -->
<template>
  <div class="compare-page">
    <!-- 헤더 -->
    <div class="page-header">
      <BackButton title="상품 목록으로" />
      <h1 class="page-title">금융 상품 비교</h1>
    </div>

    <!-- 비교함이 비어있는 경우 -->
    <div v-if="compareList.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>비교함이 비어있습니다.</p>
      <p class="empty-subtitle">상품 목록에서 비교할 상품을 추가해 주세요.</p>
      <button class="primary-btn" @click="goToProductList">
        상품 목록으로 이동
      </button>
    </div>

    <!-- 비교 콘텐츠 -->
    <div v-else class="compare-content">
      <!-- 비교함 관리 -->
      <div class="compare-actions">
        <div class="compare-count">{{ compareList.length }}/4 상품 비교 중</div>
        <button class="clear-btn" @click="handleClearCompare">
          비교함 비우기
        </button>
      </div>

      <!-- 비교 테이블 -->
      <div class="compare-table-container">
        <table class="compare-table">
          <thead>
            <tr>
              <th class="feature-cell">구분</th>
              <th
                v-for="item in compareList"
                :key="item.productId + item.saveTrm"
                class="product-cell"
              >
                <div class="product-header">
                  <div class="bank-name">{{ item.korCoNm }}</div>
                  <div class="product-name">{{ item.productName }}</div>
                  <button
                    class="remove-btn"
                    @click="handleRemoveItem(item.productId, item.saveTrm)"
                  >
                    ×
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 기본 금리 -->
            <tr>
              <td class="feature-cell">기본 금리</td>
              <td
                v-for="item in compareList"
                :key="`rate-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                <div class="highlight">{{ formatRate(item.intrRate) }}</div>
              </td>
            </tr>

            <!-- 우대 금리 -->
            <tr>
              <td class="feature-cell">우대 금리</td>
              <td
                v-for="item in compareList"
                :key="`rate2-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                <div class="highlight special">
                  {{ formatRate(item.intrRate2) }}
                </div>
              </td>
            </tr>

            <!-- 가입 기간 -->
            <tr>
              <td class="feature-cell">가입 기간</td>
              <td
                v-for="item in compareList"
                :key="`term-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                {{ item.saveTrm }}개월
              </td>
            </tr>

            <!-- 상품 유형 -->
            <tr>
              <td class="feature-cell">상품 유형</td>
              <td
                v-for="item in compareList"
                :key="`type-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                {{ getProductTypeName(item.productType) }}
              </td>
            </tr>

            <!-- 상세 보기 / 가입하기 -->
            <tr>
              <td class="feature-cell">상세 보기</td>
              <td
                v-for="item in compareList"
                :key="`action-${item.productId}-${item.saveTrm}`"
                class="product-cell"
              >
                <div class="action-buttons">
                  <button
                    class="detail-btn"
                    @click="
                      goToDetail(item.productId, item.productType, item.saveTrm)
                    "
                  >
                    상세 보기
                  </button>
                  <button class="join-btn" @click="handleJoinProduct(item)">
                    가입하기
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- API 비교 결과 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>상품 비교 정보를 불러오는 중입니다...</p>
      </div>

      <!-- 오류 상태 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">!</div>
        <p>{{ error }}</p>
        <p class="error-subtitle">
          API 연결에 실패했지만, 기본 비교 정보를 확인할 수 있습니다.
        </p>

        <!-- 간단한 비교 결과 요약 -->
        <div v-if="comparisonSummary" class="summary-cards">
          <div class="summary-card">
            <div class="summary-title">최고 금리 상품</div>
            <div class="summary-bank">
              {{ comparisonSummary.bestRate.bankName }}
            </div>
            <div class="summary-product">
              {{ comparisonSummary.bestRate.productName }}
            </div>
            <div class="summary-value">
              {{ formatRate(comparisonSummary.bestRate.rate) }}
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-title">최단 가입 기간</div>
            <div class="summary-bank">
              {{ comparisonSummary.shortestTerm.bankName }}
            </div>
            <div class="summary-product">
              {{ comparisonSummary.shortestTerm.productName }}
            </div>
            <div class="summary-value">
              {{ comparisonSummary.shortestTerm.term }}개월
            </div>
          </div>
        </div>

        <button class="retry-btn" @click="loadCompareData">다시 시도</button>
      </div>

      <!-- API 비교 결과 표시 -->
      <div v-else-if="compareData" class="compare-details">
        <h2 class="section-title">상세 비교 정보</h2>

        <!-- 비교 요약 (있는 경우) -->
        <div v-if="compareData.summary" class="comparison-summary">
          <div class="summary-icon">💡</div>
          <p>{{ compareData.summary }}</p>
        </div>

        <!-- 상품 목록이 있는 경우 -->
        <div
          v-if="compareData.products && compareData.products.length > 0"
          class="comparison-table-container"
        >
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="feature-name">항목</th>
                <th
                  v-for="product in compareData.products"
                  :key="product.id || product.productId"
                  class="product-column"
                >
                  {{ product.bankName || product.korCoNm }}
                  <div class="product-name-cell">
                    {{ product.productName || product.finPrdtNm }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- 예금/적금 상품 비교 항목 -->
              <template v-if="isDepositType">
                <!-- 금리 정보 -->
                <tr>
                  <td class="feature-name">기본 금리</td>
                  <td
                    v-for="product in compareData.products"
                    :key="`base-${product.id || product.productId}`"
                  >
                    {{ formatRate(product.baseRate || product.intrRate) }}
                  </td>
                </tr>
                <tr>
                  <td class="feature-name">우대 금리</td>
                  <td
                    v-for="product in compareData.products"
                    :key="`special-${product.id || product.productId}`"
                  >
                    {{ formatRate(product.specialRate || product.intrRate2) }}
                  </td>
                </tr>

                <!-- 가입 정보 -->
                <tr>
                  <td class="feature-name">최소 가입금액</td>
                  <td
                    v-for="product in compareData.products"
                    :key="`min-${product.id || product.productId}`"
                  >
                    {{
                      formatCurrency(product.minDeposit || product.min_deposit)
                    }}
                  </td>
                </tr>
                <tr>
                  <td class="feature-name">가입 기간</td>
                  <td
                    v-for="product in compareData.products"
                    :key="`term-${product.id || product.productId}`"
                  >
                    {{
                      product.term || product.saveTrm || product.save_trm
                    }}개월
                  </td>
                </tr>

                <!-- 기타 정보 -->
                <tr>
                  <td class="feature-name">금리 유형</td>
                  <td
                    v-for="product in compareData.products"
                    :key="`type-${product.id || product.productId}`"
                  >
                    {{
                      product.interestType || product.intr_rate_type_nm || "-"
                    }}
                  </td>
                </tr>
              </template>

              <!-- 연금 상품 비교 항목 -->
              <template v-else-if="isPensionType">
                <!-- 여기에 연금 상품 비교 항목 추가 -->
              </template>

              <!-- 공통 항목 -->
              <tr>
                <td class="feature-name">상세 정보</td>
                <td
                  v-for="product in compareData.products"
                  :key="`detail-${product.id || product.productId}`"
                >
                  <button
                    class="detail-link"
                    @click="
                      goToDetail(
                        product.id || product.productId,
                        getProductTypeFromProduct(product),
                        product.term || product.saveTrm || product.save_trm
                      )
                    "
                  >
                    상세 보기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 비교 데이터가 다른 형식일 경우 -->
        <div v-else class="no-products-message">
          비교 정보를 표시할 수 없습니다. 데이터 형식을 확인해주세요.
          <pre>{{ JSON.stringify(compareData, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- 확인 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalData.title }}</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>{{ modalData.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showModal = false">취소</button>
          <button class="confirm-btn" @click="handleModalConfirm">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useCompareList from "@/composables/useCompareList";
import BackButton from "@/components/common/BackButton.vue";
import { compareProductsAPI } from "@/api/product";

export default {
  name: "ProductCompare",
  components: {
    BackButton,
  },
  setup() {
    const router = useRouter();
    const { compareList, removeFromCompareList, clearCompareList } =
      useCompareList();

    const isLoading = ref(false);
    const compareData = ref(null);
    const error = ref(null);

    // 모달 상태
    const showModal = ref(false);
    const modalData = ref({
      title: "",
      message: "",
      action: null,
      payload: null,
    });

    // 상품 유형 체크 함수
    const isDepositType = computed(() => {
      return (
        compareList.value.length > 0 &&
        ["deposit", "saving"].includes(compareList.value[0].productType)
      );
    });

    const isPensionType = computed(() => {
      return (
        compareList.value.length > 0 &&
        compareList.value[0].productType === "pension"
      );
    });

    // 두 상품의 특정 속성을 비교하는 유틸리티 함수
    const compareAttribute = (attr, higherIsBetter = true) => {
      if (compareList.value.length < 2) return null;

      // 속성값으로 정렬
      const sorted = [...compareList.value].sort((a, b) => {
        const valA = parseFloat(a[attr]) || 0;
        const valB = parseFloat(b[attr]) || 0;
        return higherIsBetter ? valB - valA : valA - valB;
      });

      // 가장 좋은 상품 ID 반환
      return sorted[0].productId;
    };

    // 가장 높은 금리를 제공하는 상품 ID
    const bestRateProductId = computed(() => {
      return compareAttribute("intrRate2", true); // 높을수록 좋음
    });

    // 가장 짧은 가입 기간을 제공하는 상품 ID
    const shortestTermProductId = computed(() => {
      return compareAttribute("saveTrm", false); // 낮을수록 좋음
    });

    // 비교 결과 요약 문구
    const comparisonSummary = computed(() => {
      if (compareList.value.length < 2) return null;

      const bestRateProduct = compareList.value.find(
        (item) => item.productId === bestRateProductId.value
      );
      const shortestTermProduct = compareList.value.find(
        (item) => item.productId === shortestTermProductId.value
      );

      if (!bestRateProduct || !shortestTermProduct) return null;

      return {
        bestRate: {
          bankName: bestRateProduct.korCoNm,
          productName: bestRateProduct.productName,
          rate: bestRateProduct.intrRate2,
        },
        shortestTerm: {
          bankName: shortestTermProduct.korCoNm,
          productName: shortestTermProduct.productName,
          term: shortestTermProduct.saveTrm,
        },
      };
    });

    // 페이지 로드 시 API 호출
    const loadCompareData = async () => {
      if (compareList.value.length < 2) return;

      try {
        isLoading.value = true;
        error.value = null;

        // 상품 ID 목록 추출
        const productIds = compareList.value.map((item) => item.productId);

        // 상품 타입 (모두 같은 타입이라고 가정)
        const productType = compareList.value[0].productType;

        console.log("비교 API 호출 정보:", {
          productIds,
          productType,
          compareListItems: compareList.value,
        });

        // API 호출 - productIds 배열을 그대로 전달
        const response = await compareProductsAPI(productIds, productType);
        compareData.value = response;

        console.log("비교 데이터 로드 완료:", compareData.value);
      } catch (err) {
        console.error("상품 비교 데이터 로드 오류:", err);
        error.value = "비교 정보를 불러오는 중 오류가 발생했습니다.";
      } finally {
        isLoading.value = false;
      }
    };

    // 모달 확인 처리
    const handleModalConfirm = () => {
      if (modalData.value.action && modalData.value.payload) {
        modalData.value.action(modalData.value.payload);
      }
      showModal.value = false;
    };

    // 비교함에서 상품 제거
    const handleRemoveItem = (productId, saveTrm) => {
      modalData.value = {
        title: "상품 제거",
        message: "비교함에서 해당 상품을 제거하시겠습니까?",
        action: removeAndReload,
        payload: { productId, saveTrm },
      };
      showModal.value = true;
    };

    // 비교함 비우기
    const handleClearCompare = () => {
      modalData.value = {
        title: "비교함 비우기",
        message: "비교함의 모든 상품을 제거하시겠습니까?",
        action: clearAndReload,
        payload: null,
      };
      showModal.value = true;
    };

    // 상품 제거 후 데이터 리로드
    const removeAndReload = (payload) => {
      const { productId, saveTrm } = payload;
      removeFromCompareList(productId, saveTrm);

      // 비교함이 비었거나 1개만 남은 경우
      if (compareList.value.length < 2) {
        compareData.value = null;
      } else {
        loadCompareData();
      }
    };

    // 비교함 비우기 후 처리
    const clearAndReload = () => {
      clearCompareList();
      compareData.value = null;
    };

    // 상품 목록으로 이동
    const goToProductList = () => {
      router.push("/products");
    };

    // 현재 상품 유형 가져오기
    const getProductType = () => {
      return compareList.value.length > 0
        ? compareList.value[0].productType
        : "deposit";
    };

    // 상품 객체에서 상품 유형 추출
    const getProductTypeFromProduct = (product) => {
      // 예금/적금 상품인지 확인
      if (product.intr_rate_type || product.intrRateType || product.baseRate) {
        return "deposit";
      }

      // 연금 상품인지 확인
      if (product.pensionStartAge || product.pnsnStrtAge) {
        return "pension";
      }

      // 기본값 반환
      return getProductType();
    };

    // 상품 유형 이름 변환
    const getProductTypeName = (type) => {
      const typeNames = {
        deposit: "정기예금",
        pension: "연금저축",
        saving: "적금",
      };

      return typeNames[type] || "금융상품";
    };

    // 상세 페이지로 이동
    const goToDetail = (productId, productType = "deposit", saveTrm = null) => {
      const query = saveTrm ? { saveTrm } : {};
      router.push({
        path: `/products/${productType}/${productId}`,
        query,
      });
    };

    // 가입하기
    const handleJoinProduct = (item) => {
      // 여기서는 예시로 은행 웹사이트로 이동
      const bankWebsites = {
        국민은행: "https://www.kbstar.com",
        신한은행: "https://www.shinhan.com",
        우리은행: "https://www.wooribank.com",
        하나은행: "https://www.kebhana.com",
        농협은행: "https://banking.nonghyup.com",
        기업은행: "https://www.ibk.co.kr",
      };

      const url =
        bankWebsites[item.korCoNm] ||
        `https://www.google.com/search?q=${encodeURIComponent(
          item.korCoNm + " " + item.productName
        )}`;

      window.open(url, "_blank");
    };

    // 금액 포맷팅
    const formatCurrency = (value) => {
      if (value === null || value === undefined) return "정보 없음";
      return new Intl.NumberFormat("ko-KR").format(value) + "원";
    };

    // 금리 포맷팅
    const formatRate = (rate) => {
      if (rate === null || rate === undefined) return "정보 없음";
      return parseFloat(rate).toFixed(2) + "%";
    };

    onMounted(() => {
      if (compareList.value.length >= 2) {
        loadCompareData();
      }
    });

    return {
      compareList,
      isLoading,
      compareData,
      error,
      showModal,
      modalData,
      isDepositType,
      isPensionType,
      comparisonSummary,
      bestRateProductId,
      shortestTermProductId,
      handleRemoveItem,
      handleClearCompare,
      handleModalConfirm,
      goToProductList,
      getProductType,
      getProductTypeName,
      getProductTypeFromProduct,
      goToDetail,
      handleJoinProduct,
      loadCompareData,
      formatRate,
      formatCurrency,
    };
  },
};
</script>

<style scoped>
.compare-page {
  max-width: 375px;
  margin: 0 auto;
  padding: 1rem;
  font-family: "Noto Sans KR", sans-serif;
  color: var(--color-text);
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-main);
  flex: 1;
}

/* 비어있는 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: var(--color-text);
}

.empty-subtitle {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.primary-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

/* 비교 콘텐츠 */
.compare-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.compare-count {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-sub);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
}

/* 비교 테이블 */
.compare-table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 100%;
}

.compare-table th,
.compare-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--color-bg-light);
}

.feature-cell {
  background-color: var(--color-bg-light);
  font-weight: 500;
  color: var(--color-main);
  text-align: left;
  min-width: 5rem;
  position: sticky;
  left: 0;
  z-index: 1;
}

.product-cell {
  min-width: 8rem;
}

.product-header {
  position: relative;
  padding-right: 1.5rem;
}

.bank-name {
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-bottom: 0.25rem;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-main);
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: var(--color-sub);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.highlight {
  font-weight: 500;
  font-size: 1rem;
  color: var(--color-main);
}

.highlight.special {
  color: #e91e63;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-btn,
.join-btn {
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}

.detail-btn {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  border: 1px solid var(--color-light);
}

.join-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
}

/* 비교 상세 정보 */
.compare-details {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  margin: 0 0 1rem 0;
  color: var(--color-main);
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 0.25rem solid var(--color-bg-light);
  border-top: 0.25rem solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 오류 상태 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  text-align: center;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.error-icon {
  width: 3.125rem;
  height: 3.125rem;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.error-subtitle {
  color: var(--color-sub);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 20rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--color-bg-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: var(--color-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-sub);
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem 1rem;
}

.modal-body p {
  margin: 0;
  color: var(--color-text);
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background-color: var(--color-bg-light);
  color: var(--color-text);
  border: none;
}

.confirm-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
}

/* 비교 테이블 (API 응답) */
.comparison-table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 100%;
}

.comparison-table th,
.comparison-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid var(--color-bg-light);
}

.feature-name {
  background-color: var(--color-bg-light);
  font-weight: 500;
  color: var(--color-main);
  text-align: left;
  min-width: 5rem;
  position: sticky;
  left: 0;
  z-index: 1;
}

.product-column {
  min-width: 8rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.product-name-cell {
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-top: 0.25rem;
}

.highlight-cell {
  position: relative;
  font-weight: 600;
  color: var(--color-main);
}

.highlight-cell::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0.75rem 0.75rem 0;
  border-color: transparent var(--color-main) transparent transparent;
}

.detail-link {
  background-color: var(--color-bg-light);
  color: var(--color-main);
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
}

/* 비교 요약 */
.comparison-summary {
  background-color: #e9f7ff;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.summary-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.comparison-summary p {
  margin: 0;
  color: var(--color-main);
  line-height: 1.5;
}

/* 요약 카드 스타일 */
.summary-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
  width: 100%;
  max-width: 20rem;
}

.summary-card {
  background-color: var(--color-bg-light);
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid var(--color-main);
}

.summary-title {
  font-weight: 500;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.summary-bank {
  font-size: 0.75rem;
  color: var(--color-sub);
}

.summary-product {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
}

/* 모바일에서 가로 스크롤 용이하게 */
@media (max-width: 767px) {
  .compare-table-container {
    margin-left: -1rem;
    margin-right: -1rem;
    width: calc(100% + 2rem);
    border-radius: 0;
  }

  .compare-table {
    padding: 0 1rem;
  }
}

.no-products-message {
  padding: 1rem;
  color: var(--color-sub);
  text-align: center;
}

.no-products-message pre {
  text-align: left;
  overflow: auto;
  background-color: #f5f5f5;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-top: 1rem;
}
</style>
