<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h3 class="modal-title">
          <span class="gpt-icon">🤖</span>
          MATE 상품 비교 요약
        </h3>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 모달 컨텐츠 -->
      <div class="modal-content">
        <!-- 비교할 상품 목록 -->
        <div class="compare-products">
          <h4 class="section-title">비교할 상품</h4>
          <div class="product-list">
            <div v-for="product in compareList" :key="product.productId" class="product-item">
              <div class="bank-logo">{{ product.korCoNm.charAt(0) }}</div>
              <div class="product-info">
                <div class="bank-name">{{ product.korCoNm }}</div>
                <div class="product-name">{{ product.productName || product.finPrdtNm }}</div>
                <div class="product-rate">연 {{ product.intrRate2 || product.intrRate }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI 분석 결과 -->
        <div class="analysis-section">
          <h4 class="section-title">AI 분석 결과</h4>
          
          <!-- 로딩 상태 -->
          <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>AI가 상품을 분석하고 있습니다...</p>
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="error" class="error-container">
            <div class="error-icon">⚠️</div>
            <p class="error-message">{{ error }}</p>
            <button class="retry-btn" @click="requestComparison">다시 시도</button>
          </div>

          <!-- 분석 결과 -->
          <div v-else-if="analysisResult" class="analysis-result">
            <div class="result-content" v-html="formattedAnalysis"></div>
          </div>

          <!-- 초기 상태 -->
          <div v-else class="initial-state">
            <div class="ai-icon">🤖</div>
            <p class="description">
              선택한 상품들을 AI가 상세히 비교분석해드립니다.<br>
              금리, 가입조건, 장단점, 주의사항을 종합적으로 검토해보세요.
            </p>
            <button class="analyze-btn" @click="requestComparison">
              <span class="btn-icon">✨</span>
              AI 비교분석 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  compareList: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(['close']);

// 상태 관리
const isLoading = ref(false);
const error = ref(null);
const analysisResult = ref(null);

// 모달 닫기
const closeModal = () => {
  emit('close');
};

const handleOverlayClick = () => {
  closeModal();
};

// AI 비교 요청
const requestComparison = async () => {
  if (props.compareList.length < 2) {
    error.value = '비교할 상품이 2개 이상 필요합니다.';
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    analysisResult.value = null;

    // API 요청 데이터 구성
    const requestData = props.compareList.map(item => ({
      available: true,
      finCoNo: item.finCoNo || '0010001',
      finPrdtCd: item.productId || item.finPrdtCd,
      finPrdtNm: item.productName || item.finPrdtNm,
      joinMember: item.joinMember || '실명의 개인',
      joinWay: item.joinWay || '인터넷,스마트폰,전화(텔레뱅킹)',
      korCoNm: item.korCoNm,
      maxIntrRate: parseFloat(item.intrRate2 || item.intrRate || 0),
      preferentialTags: item.preferentialTags || [],
      productDetail: {
        available: true,
        dclsEndDay: item.dclsEndDay || '2026-12-31',
        dclsStrtDay: item.dclsStrtDay || '2025-01-01',
        etcNote: item.etcNote || item.etc_note || '',
        finCoNo: item.finCoNo || '0010001',
        finPrdtCd: item.productId || item.finPrdtCd,
        finPrdtNm: item.productName || item.finPrdtNm,
        joinDeny: item.joinDeny || '없음',
        joinMember: item.joinMember || '실명의 개인',
        joinWay: item.joinWay || '인터넷,스마트폰,전화(텔레뱅킹)',
        korCoNm: item.korCoNm,
        maxDepositAmount: item.maxDepositAmount || 100000000,
        minDepositAmount: item.minDepositAmount || 10000,
        mtrtInt: item.mtrtInt || '만기 후 보통예금 금리 적용',
        options: item.options || [{
          compoundRate: item.intrRateType === 'M',
          finPrdtCd: item.productId || item.finPrdtCd,
          intrRate: parseFloat(item.intrRate || 0),
          intrRate2: parseFloat(item.intrRate2 || item.intrRate || 0),
          intrRateType: item.intrRateType || 'S',
          intrRateTypeNm: item.intrRateTypeNm || '단리',
          productId: item.productId,
          rsrvType: 'null',
          rsrvTypeNm: 'null',
          saveTrm: parseInt(item.saveTrm || 12),
          singleRate: item.intrRateType !== 'M'
        }],
        preferentialTags: item.preferentialTags || [],
        productId: item.productId,
        spclCnd: item.spclCnd || '해당사항 없음'
      },
      productId: item.productId,
      productType: item.productType || 'deposit',
      spclCnd: item.spclCnd || '해당사항 없음'
    }));

    // API 호출
    const response = await axios.post('/api/chat/compare', requestData);
    
    if (response.data && response.data.body && response.data.body.data) {
      // JSON 문자열을 파싱하여 실제 텍스트 추출
      let analysisText = response.data.body.data;
      if (typeof analysisText === 'string' && analysisText.startsWith('"') && analysisText.endsWith('"')) {
        analysisText = JSON.parse(analysisText);
      }
      analysisResult.value = analysisText;
    } else {
      throw new Error('응답 데이터 형식이 올바르지 않습니다.');
    }

  } catch (err) {
    console.error('AI 비교 분석 오류:', err);
    error.value = err.response?.data?.message || 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    isLoading.value = false;
  }
};

// 분석 결과를 HTML로 포맷팅
const formattedAnalysis = computed(() => {
  if (!analysisResult.value) return '';

  let formatted = analysisResult.value;

  // 줄바꿈 처리
  formatted = formatted.replace(/\\n/g, '\n');
  formatted = formatted.replace(/\n/g, '<br>');

  // 제목 처리 (##, ###)
  formatted = formatted.replace(/### (.*?)(?=<br>|$)/g, '<h4 class="analysis-subtitle">$1</h4>');
  formatted = formatted.replace(/## (.*?)(?=<br>|$)/g, '<h3 class="analysis-title">$1</h3>');

  // 굵은 글씨 처리
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 리스트 항목 처리 (- 로 시작하는 줄)
  formatted = formatted.replace(/- (.*?)(?=<br>|$)/g, '<div class="list-item">• $1</div>');

  // 구분선 처리
  formatted = formatted.replace(/---/g, '<hr class="divider">');

  // 연속된 <br> 태그 정리
  formatted = formatted.replace(/(<br>\s*){3,}/g, '<br><br>');

  return formatted;
});

// 모달이 열릴 때 상태 초기화
watch(() => props.show, (newShow) => {
  if (newShow) {
    isLoading.value = false;
    error.value = null;
    analysisResult.value = null;
  }
});
</script>

<style scoped>
/* 모달 오버레이 */
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
  padding: 1rem;
}

/* 모달 컨테이너 */
.modal-container {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 1rem 3rem rgba(45, 51, 107, 0.2);
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-bg-light);
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.gpt-icon {
  font-size: 1.5rem;
  animation: pulse 2s infinite;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 모달 컨텐츠 */
.modal-content {
  padding: 1.5rem;
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

/* 섹션 제목 */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-bg-light);
}

/* 비교 상품 목록 */
.compare-products {
  margin-bottom: 2rem;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--color-bg-light);
  border-radius: 0.75rem;
  transition: transform 0.2s;
}

.product-item:hover {
  transform: translateY(-2px);
}

.bank-logo {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.bank-name {
  font-size: 0.875rem;
  color: var(--color-sub);
  margin-bottom: 0.25rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.25rem;
}

.product-rate {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-main);
}

/* 분석 섹션 */
.analysis-section {
  border-top: 1px solid var(--color-bg-light);
  padding-top: 2rem;
}

/* 로딩 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25rem solid var(--color-bg-light);
  border-top-color: var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* 에러 상태 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  color: var(--color-sub);
  margin-bottom: 1.5rem;
}

.retry-btn {
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background-color: #3d4785;
  transform: translateY(-1px);
}

/* 초기 상태 */
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
}

.ai-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.description {
  color: var(--color-sub);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.analyze-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 0.5rem 1rem rgba(45, 51, 107, 0.2);
}

.analyze-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.75rem 1.5rem rgba(45, 51, 107, 0.3);
}

.btn-icon {
  animation: sparkle 2s infinite;
}

/* 분석 결과 */
.analysis-result {
  background-color: var(--color-bg-light);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.result-content {
  line-height: 1.7;
  color: #333;
}

/* 분석 결과 내부 스타일 */
.result-content :deep(.analysis-title) {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-main);
}

.result-content :deep(.analysis-subtitle) {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 1.25rem 0 0.75rem 0;
}

.result-content :deep(.list-item) {
  margin: 0.5rem 0;
  padding-left: 1rem;
  color: #555;
}

.result-content :deep(.divider) {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, var(--color-light) 50%, transparent 100%);
  margin: 2rem 0;
}

.result-content :deep(strong) {
  color: var(--color-main);
  font-weight: 600;
}

/* 애니메이션 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

@keyframes sparkle {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-5deg) scale(1.1);
  }
  50% {
    transform: rotate(0deg) scale(1);
  }
  75% {
    transform: rotate(5deg) scale(1.1);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .product-item {
    flex-direction: column;
    text-align: center;
  }
  
  .bank-logo {
    margin-bottom: 0.5rem;
  }
}
</style>