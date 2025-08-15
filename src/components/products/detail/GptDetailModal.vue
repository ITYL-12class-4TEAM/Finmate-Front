<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3><i class="fas fa-brain"></i> AI 상품 요약</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>상품을 분석 중입니다...</p>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button class="retry-btn" @click="generateSummary">
            <i class="fas fa-redo"></i>
            다시 시도
          </button>
        </div>

        <!-- 요약 결과 -->
        <div v-else-if="summary" class="summary-container">
          <div class="summary-content" v-html="formatSummary(summary)"></div>
          <div class="summary-footer">
            <i class="fas fa-info-circle"></i>
            <span>AI가 생성한 요약으로 참고용입니다.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getProductSummaryWithGPT } from '@/api/chat';

const props = defineProps({
  show: { type: Boolean, default: false },
  product: { type: Object, default: null },
  selectedOption: { type: Object, default: null },
});

defineEmits(['close']);

const isLoading = ref(false);
const error = ref(null);
const summary = ref('');

const getCacheKey = () => {
  if (!props.product || !props.selectedOption) return null;

  const productId = props.product.product_id || props.product.productId;
  const saveTrm = props.selectedOption.save_trm || props.selectedOption.saveTrm;
  const intrRateType = props.selectedOption.intr_rate_type || props.selectedOption.intrRateType;

  return `gpt_summary_${productId}_${saveTrm}_${intrRateType}`;
};

const getCachedSummary = () => {
  const cacheKey = getCacheKey();
  if (!cacheKey) return null;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      const now = new Date().getTime();
      const cacheTime = new Date(data.timestamp).getTime();
      const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        return data.summary;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (err) {
    console.error('캐시 읽기 오류:', err);
  }

  return null;
};

const cacheSummary = (summaryText) => {
  const cacheKey = getCacheKey();
  if (!cacheKey) return;

  try {
    const cacheData = {
      summary: summaryText,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (err) {
    console.error('캐시 저장 오류:', err);
  }
};

const formatSummary = (text) => {
  if (!text) return '';

  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/^[•\-*]\s+(.+)$/gm, '<span class="bullet-point">• $1</span>')
    .replace(/^\d+\.\s+(.+)$/gm, '<span class="number-point">$1</span>');
};

const generateSummary = async () => {
  if (!props.product || !props.selectedOption) return;

  const cachedSummary = getCachedSummary();
  if (cachedSummary) {
    summary.value = cachedSummary;
    return;
  }

  isLoading.value = true;
  error.value = null;
  summary.value = '';

  try {
    const gptResult = await getProductSummaryWithGPT(props.product, props.selectedOption);

    if (!gptResult) {
      throw new Error('AI 요약 결과가 없습니다.');
    }

    summary.value = gptResult;
    cacheSummary(gptResult);
  } catch (err) {
    error.value = err.message || 'AI 요약 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
  } finally {
    isLoading.value = false;
  }
};

watch(
  [() => props.show, () => props.product, () => props.selectedOption],
  ([newShow, newProduct, newSelectedOption], [oldShow]) => {
    if (newShow && newProduct && newSelectedOption) {
      if (!oldShow) {
        isLoading.value = false;
        error.value = null;
        summary.value = '';
      }
      generateSummary();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0.75rem;
  box-sizing: border-box;
}

.modal-content {
  background: var(--color-white);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 24rem;
  max-height: 85vh;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--color-bg-light);
  background: var(--color-white);
}

.modal-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.modal-header h3 i {
  color: var(--color-main);
  font-size: 0.875rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-sub);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: var(--color-bg-light);
  color: var(--color-main);
}

.modal-body {
  padding: 1rem;
  max-height: 65vh;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0;
  text-align: center;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 0.1875rem solid var(--color-bg-light);
  border-top-color: var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  color: var(--color-sub);
  font-size: 0.8125rem;
  margin: 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0;
  text-align: center;
}

.error-container i {
  font-size: 1.5rem;
  color: #f44336;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: var(--color-sub);
  font-size: 0.8125rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--color-sub);
}

.summary-container {
  width: 100%;
}

.summary-content {
  background: var(--color-bg-light);
  border-radius: 0.375rem;
  padding: 0.875rem;
  margin-bottom: 0.625rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-main);
  word-break: keep-all;
}

.summary-content :deep(strong) {
  font-weight: 600;
  color: var(--color-main);
}

.summary-content :deep(em) {
  font-style: italic;
  color: var(--color-sub);
}

.summary-content :deep(.bullet-point) {
  display: block;
  margin: 0.1875rem 0;
  padding-left: 0.625rem;
  position: relative;
  font-size: 0.8125rem;
}

.summary-content :deep(.bullet-point)::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-main);
  font-weight: 600;
}

.summary-content :deep(.number-point) {
  display: block;
  margin: 0.1875rem 0;
  padding-left: 0.75rem;
  font-weight: 500;
  font-size: 0.8125rem;
}

.summary-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: var(--color-sub);
  font-size: 0.6875rem;
}

.summary-footer i {
  color: var(--color-light);
  font-size: 0.6875rem;
}

.modal-body::-webkit-scrollbar {
  width: 0.1875rem;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 0.125rem;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub);
}

@media (max-width: 26.875rem) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    max-width: 100%;
  }

  .modal-header {
    padding: 0.75rem 0.875rem;
  }

  .modal-header h3 {
    font-size: 0.8125rem;
  }

  .modal-header h3 i {
    font-size: 0.8125rem;
  }

  .close-btn {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.875rem;
  }

  .modal-body {
    padding: 0.875rem;
  }

  .summary-content {
    padding: 0.75rem;
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .summary-content :deep(.bullet-point),
  .summary-content :deep(.number-point) {
    font-size: 0.75rem;
    margin: 0.125rem 0;
  }

  .loading-container p {
    font-size: 0.75rem;
  }

  .error-container p {
    font-size: 0.75rem;
  }

  .retry-btn {
    font-size: 0.75rem;
    padding: 0.4375rem 0.875rem;
  }

  .summary-footer {
    font-size: 0.625rem;
  }

  .summary-footer i {
    font-size: 0.625rem;
  }
}

@media (max-width: 20rem) {
  .modal-overlay {
    padding: 0.25rem;
  }

  .modal-header {
    padding: 0.625rem 0.75rem;
  }

  .modal-body {
    padding: 0.75rem;
  }

  .summary-content {
    padding: 0.625rem;
    font-size: 0.6875rem;
  }

  .summary-content :deep(.bullet-point),
  .summary-content :deep(.number-point) {
    font-size: 0.6875rem;
  }
}
</style>
