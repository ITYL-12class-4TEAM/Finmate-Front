<template>
  <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-brain"></i>
          AI 상품 비교 요약
        </h3>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-content">
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>상품을 분석하고 있습니다...</p>
        </div>

        <div v-else-if="error" class="error-container">
          <i class="fas fa-exclamation-triangle"></i>
          <p class="error-message">{{ error }}</p>
          <button class="retry-btn" @click="requestComparison">
            <i class="fas fa-redo"></i>
            다시 시도
          </button>
        </div>

        <div v-else-if="analysisResult" class="analysis-result">
          <div class="result-content" v-html="formattedAnalysis"></div>
          <div class="analysis-footer">
            <i class="fas fa-info-circle"></i>
            <span>AI가 생성한 분석으로 참고용입니다.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { compareProductsWithGPT } from '@/api/chat';

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

const emit = defineEmits(['close']);

const isLoading = ref(false);
const error = ref(null);
const analysisResult = ref(null);

const closeModal = () => {
  emit('close');
};

const handleOverlayClick = () => {
  closeModal();
};

const getCacheKey = () => {
  if (!props.compareList || props.compareList.length < 2) return null;

  const productIds = props.compareList
    .map((product) => product.productId)
    .sort()
    .join('_');

  return `gpt_compare_${productIds}`;
};

const getCachedAnalysis = () => {
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
        return data.analysis;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
  } catch (err) {
    // Error handling silently
  }

  return null;
};

const cacheAnalysis = (analysisText) => {
  const cacheKey = getCacheKey();
  if (!cacheKey) return;

  try {
    const cacheData = {
      analysis: analysisText,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (err) {
    // Error handling silently
  }
};

const requestComparison = async () => {
  if (props.compareList.length < 2) {
    error.value = '비교할 상품이 2개 이상 필요합니다.';
    return;
  }

  const cachedAnalysis = getCachedAnalysis();
  if (cachedAnalysis) {
    analysisResult.value = cachedAnalysis;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    analysisResult.value = null;

    const gptResult = await compareProductsWithGPT(props.compareList);

    if (!gptResult) {
      throw new Error('AI 비교 결과가 없습니다.');
    }

    analysisResult.value = gptResult;
    cacheAnalysis(gptResult);
  } catch (err) {
    error.value = err.message || 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    isLoading.value = false;
  }
};

const formattedAnalysis = computed(() => {
  if (!analysisResult.value) return '';

  let formatted = analysisResult.value;

  if (typeof formatted !== 'string') {
    formatted = String(formatted);
  }

  formatted = formatted.replace(/\\n/g, '\n');
  formatted = formatted.replace(/### (.*?)(?=\n|$)/gm, '<h4 class="analysis-subtitle">$1</h4>');
  formatted = formatted.replace(/## (.*?)(?=\n|$)/gm, '<h3 class="analysis-title">$1</h3>');
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^- (.*?)$/gm, '<div class="list-item">• $1</div>');
  formatted = formatted.replace(/^---$/gm, '<hr class="divider">');
  formatted = formatted.replace(/\n/g, '<br>');
  formatted = formatted.replace(/<br>\s*(<h[34][^>]*>)/g, '$1');
  formatted = formatted.replace(/(<\/h[34]>)\s*<br>/g, '$1');
  formatted = formatted.replace(/<br>\s*(<div class="list-item">)/g, '$1');
  formatted = formatted.replace(/(<\/div>)\s*<br>(?=<div class="list-item">)/g, '$1');
  formatted = formatted.replace(/(<br>\s*){2,}/g, '<br>');

  return formatted;
});

watch(
  [() => props.show, () => props.compareList],
  ([newShow, newCompareList], [oldShow]) => {
    if (newShow && newCompareList && newCompareList.length >= 2) {
      if (!oldShow) {
        isLoading.value = false;
        error.value = null;
        analysisResult.value = null;
      }
      requestComparison();
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

.modal-container {
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
  border-bottom: 0.0625rem solid var(--color-bg-light);
  background: var(--color-white);
}

.modal-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.modal-title i {
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

.modal-content {
  padding: 1rem;
  max-height: 65vh;
  overflow-y: auto;
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 0.625rem 0;
  padding-bottom: 0.3125rem;
  border-bottom: 0.0625rem solid var(--color-bg-light);
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

.error-message {
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

.analysis-result {
  width: 100%;
}

.result-content {
  background: var(--color-bg-light);
  border-radius: 0.375rem;
  padding: 0.875rem;
  margin-bottom: 0.625rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--color-main);
  word-break: keep-all;
}

.analysis-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  color: var(--color-sub);
  font-size: 0.6875rem;
}

.analysis-footer i {
  color: var(--color-light);
  font-size: 0.6875rem;
}

.result-content :deep(.analysis-title) {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 1rem 0 0.75rem 0;
  padding-bottom: 0.375rem;
  border-bottom: 0.125rem solid var(--color-main);
}

.result-content :deep(.analysis-subtitle) {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0.875rem 0 0.5rem 0;
}

.result-content :deep(.list-item) {
  margin: 0.125rem 0;
  padding-left: 0.75rem;
  color: var(--color-sub);
}

.result-content :deep(.divider) {
  border: none;
  height: 0.125rem;
  background: var(--color-light);
  margin: 1rem 0;
}

.result-content :deep(strong) {
  color: var(--color-main);
  font-weight: 600;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-content::-webkit-scrollbar {
  width: 0.1875rem;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 0.125rem;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub);
}

@media (max-width: 26.875rem) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-container {
    max-width: 100%;
  }

  .modal-header {
    padding: 0.75rem 0.875rem;
  }

  .modal-title {
    font-size: 0.8125rem;
  }

  .modal-title i {
    font-size: 0.8125rem;
  }

  .close-btn {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.875rem;
  }

  .modal-content {
    padding: 0.875rem;
  }

  .result-content {
    padding: 0.75rem;
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .loading-container p {
    font-size: 0.75rem;
  }

  .error-message {
    font-size: 0.75rem;
  }

  .retry-btn {
    font-size: 0.75rem;
    padding: 0.4375rem 0.875rem;
  }

  .analysis-footer {
    font-size: 0.625rem;
  }

  .analysis-footer i {
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

  .modal-content {
    padding: 0.75rem;
  }

  .result-content {
    padding: 0.625rem;
    font-size: 0.6875rem;
  }
}
</style>
