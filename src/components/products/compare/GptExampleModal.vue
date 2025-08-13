<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-content">
          <div class="mate-logo">
            <span class="mate-icon">🤖</span>
            <p>MATE의 상품 비교 요약</p>
          </div>
          <button class="close-btn" aria-label="닫기" @click="$emit('close')">×</button>
        </div>
      </div>

      <div class="modal-body">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-wrapper">
            <div class="loading-spinner"></div>
            <div class="loading-pulse"></div>
          </div>
          <p class="loading-text">MATE가 상품을 분석하고 있습니다...</p>
          <div class="loading-steps">
            <div class="step" :class="{ active: currentStep >= 1 }">
              <span class="step-icon">📊</span>
              상품 정보 수집
            </div>
            <div class="step" :class="{ active: currentStep >= 2 }">
              <span class="step-icon">💰</span>
              금리 및 조건 분석
            </div>
            <div class="step" :class="{ active: currentStep >= 3 }">
              <span class="step-icon">⚖️</span>
              장단점 비교
            </div>
            <div class="step" :class="{ active: currentStep >= 4 }">
              <span class="step-icon">✨</span>
              맞춤 추천 생성
            </div>
          </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">⚠️</div>
          <h4>분석 중 오류가 발생했습니다</h4>
          <p class="error-message">{{ error }}</p>
          <button class="retry-btn" @click="handleRetry">
            <span>🔄</span>
            다시 시도
          </button>
        </div>

        <!-- 결과 표시 -->
        <div v-else-if="gptResult" class="result-container">
          <div class="result-header">
            <div class="result-badge">
              <span class="result-icon">✨</span>
              <span>{{ compareList.length }}개 상품 비교 완료</span>
            </div>
          </div>

          <!-- GPT 결과를 향상된 포맷으로 렌더링 -->
          <div class="gpt-content" v-html="formattedResult"></div>

          <!-- 액션 버튼들 -->
          <div class="action-buttons">
            <button class="share-btn" @click="handleShare">
              <span>📋</span>
              결과 복사
            </button>
            <button class="regenerate-btn" @click="handleRegenerate">
              <span>🔄</span>
              다시 분석
            </button>
          </div>
        </div>

        <!-- 초기 상태 (분석 전) - 바로 분석 시작 -->
        <div v-else class="initial-container">
          <div class="products-preview">
            <div class="preview-header">
              <h4>분석할 상품 {{ compareList.length }}개</h4>
              <div class="product-count-badge">{{ compareList.length }}</div>
            </div>
            <div class="product-list">
              <div
                v-for="(product, index) in compareList"
                :key="product.productId"
                class="product-item"
                :style="{ animationDelay: index * 100 + 'ms' }"
              >
                <div class="product-info">
                  <span class="bank-name">{{ product.korCoNm }}</span>
                  <span class="product-name">{{ product.productName }}</span>
                </div>
                <div class="product-rate">
                  {{ formatRate(product.intrRate2 || product.intrRate) }}
                </div>
              </div>
            </div>
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
  show: { type: Boolean, default: false },
  compareList: { type: Array, default: () => [] },
});

defineEmits(['close']);

// 상태 관리
const isLoading = ref(false);
const error = ref(null);
const gptResult = ref(null);
const currentStep = ref(0);

// 로딩 단계 애니메이션
let stepInterval = null;

// 향상된 GPT 결과 포맷팅
const formattedResult = computed(() => {
  if (!gptResult.value) return '';

  let content = gptResult.value;

  // JSON 응답에서 실제 텍스트 추출
  if (typeof content === 'object' && content.body?.data) {
    content = content.body.data;
  }

  // 이스케이프된 문자열 처리
  if (typeof content === 'string') {
    content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }

  content = content
    // #### 헤더 -> h4 (두께 굵게 유지)
    .replace(/^#### (.*?)$/gm, '<h6 class="section-subtitle">$1</h6>')
    .replace(/^### (.*?)$/gm, '<h5 class="section-title">$1</h5>')
    .replace(/^## (.*?)$/gm, '<h4 class="main-title">$1</h4>')
    .replace(/^# (.*?)$/gm, '<h3 class="page-title">$1</h3>')

    // 구분선 변환
    .replace(/^---$/gm, '<div class="divider"></div>')

    // 리스트 변환
    .replace(/^\s*-\s+(.*?)$/gm, '<li class="bullet-item">$1</li>')
    .replace(/^\s*\*\s+(.*?)$/gm, '<li class="bullet-item">$1</li>')
    .replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="numbered-item">$1</li>')

    // 볼드, 이탤릭 변환
    .replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 리스트 래핑
  content = content.replace(/(?:<li class="bullet-item">.*?<\/li>\s*)+/gs, (match) => {
    return `<ul class="styled-list">${match}</ul><br>`;
  });
  content = content.replace(/(?:<li class="numbered-item">.*?<\/li>\s*)+/gs, (match) => {
    return `<ol class="styled-list numbered">${match}</ol><br>`;
  });

  // 리스트 내부 줄바꿈 제거
  content = content.replace(/(<ul.*?>)([\s\S]*?)(<\/ul>)/g, (match, start, inner, end) => {
    return start + inner.replace(/\n/g, ' ') + end;
  });
  content = content.replace(/(<ol.*?>)([\s\S]*?)(<\/ol>)/g, (match, start, inner, end) => {
    return start + inner.replace(/\n/g, ' ') + end;
  });
  content = content.replace(/(<li.*?>)([\s\S]*?)(<\/li>)/g, (match, start, inner, end) => {
    return start + inner.replace(/\n/g, ' ') + end;
  });

  // 줄바꿈 처리
  content = content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');

  // 전체 문단 래핑
  content = `<div class="formatted-content">${content}</div>`;

  return content;
});

// 분석 시작 (모달이 열리면 자동 시작)
const startAnalysis = async () => {
  if (props.compareList.length < 2) {
    error.value = '비교할 상품이 부족합니다. 최소 2개 이상의 상품을 선택해주세요.';
    return;
  }

  isLoading.value = true;
  error.value = null;
  gptResult.value = null;
  currentStep.value = 0;

  // 단계별 로딩 애니메이션
  stepInterval = setInterval(() => {
    if (currentStep.value < 4) {
      currentStep.value++;
    }
  }, 800);

  try {
    const result = await compareProductsWithGPT(props.compareList);
    gptResult.value = result;
  } catch (err) {
    console.error('GPT 분석 오류:', err);
    error.value = err.message || '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    isLoading.value = false;
    if (stepInterval) {
      clearInterval(stepInterval);
      stepInterval = null;
    }
  }
};

// 재시도
const handleRetry = () => {
  startAnalysis();
};

// 재분석
const handleRegenerate = () => {
  startAnalysis();
};

// 결과 공유/복사
const handleShare = async () => {
  try {
    const textContent =
      gptResult.value
        ?.replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"') || '';

    await navigator.clipboard.writeText(textContent);

    const shareBtn = document.querySelector('.share-btn');
    const originalText = shareBtn.innerHTML;
    shareBtn.innerHTML = '<span>✅</span>복사 완료!';
    shareBtn.classList.add('success');

    setTimeout(() => {
      shareBtn.innerHTML = originalText;
      shareBtn.classList.remove('success');
    }, 2000);
  } catch (err) {
    console.error('복사 실패:', err);
    alert('복사에 실패했습니다.');
  }
};

// 금리 포맷팅
const formatRate = (rate) => {
  if (!rate) return '-';
  return `${parseFloat(rate).toFixed(2)}%`;
};

// 모달이 열리면 자동으로 분석 시작
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      // 약간의 딜레이 후 분석 시작 (애니메이션을 위해)
      setTimeout(() => {
        startAnalysis();
      }, 600);
    } else {
      // 모달이 닫히면 정리
      if (stepInterval) {
        clearInterval(stepInterval);
        stepInterval = null;
      }
    }
  }
);

// 컴포넌트 언마운트 시 정리
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  if (stepInterval) {
    clearInterval(stepInterval);
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: overlayFadeIn 0.4s ease-out;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.modal-content {
  background: white;
  border-radius: 2rem;
  width: 90%;
  max-width: 50rem;
  max-height: 90vh;
  overflow: hidden;
  box-shadow:
    0 2rem 5rem rgba(45, 51, 107, 0.2),
    0 1rem 2rem rgba(45, 51, 107, 0.1);
  animation: modalSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid var(--color-bg-light);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-3rem) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  padding: 1.5rem 2rem;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 20rem;
  height: 20rem;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.mate-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mate-icon {
  font-size: 1.5rem;
  animation: bounce 2s infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.mate-logo p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-left: auto;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.1) rotate(90deg);
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 6rem);
}

/* 로딩 상태 */
.loading-container {
  text-align: center;
  padding: 3rem 0;
}

.loading-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
}

.loading-spinner {
  width: 4rem;
  height: 4rem;
  border: 0.3rem solid var(--color-bg-light);
  border-top: 0.3rem solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-pulse {
  position: absolute;
  top: -0.5rem;
  left: -0.5rem;
  width: 5rem;
  height: 5rem;
  border: 2px solid var(--color-main);
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.7;
  }
}

.loading-text {
  font-size: 1.2rem;
  color: var(--color-main);
  margin-bottom: 2rem;
  font-weight: 600;
  background: linear-gradient(45deg, var(--color-main), var(--color-sub));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-steps {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  max-width: 30rem;
  margin: 0 auto;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 1rem;
  color: var(--color-light);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 0.9rem;
  font-weight: 500;
  border: 2px solid var(--color-bg-light);
  box-shadow: 0 4px 15px rgba(45, 51, 107, 0.05);
}

.step.active {
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  transform: translateY(-4px) scale(1.05);
  border-color: var(--color-main);
  box-shadow: 0 8px 25px rgba(45, 51, 107, 0.2);
}

.step-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* 에러 상태 */
.error-container {
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #ffeaea 0%, #fff5f5 100%);
  border-radius: 1.5rem;
  border: 1px solid #ffcaca;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(220, 53, 69, 0.2));
}

.error-container h4 {
  color: #dc3545;
  margin-bottom: 0.75rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.error-message {
  color: var(--color-sub);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.retry-btn {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

/* 초기 상태 */
.initial-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.preview-header h4 {
  color: var(--color-main);
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.product-count-badge {
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(45, 51, 107, 0.2);
}

.product-list {
  background: linear-gradient(135deg, #f8f9ff 0%, var(--color-bg-light) 100%);
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #e0e6ff;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-bottom: 0.75rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e8ecff;
  transition: all 0.3s ease;
  animation: slideInLeft 0.5s ease-out both;
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.05);
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.product-item:last-child {
  margin-bottom: 0;
}

.product-item:hover {
  transform: translateX(0.5rem);
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.1);
  border-color: var(--color-light);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.bank-name {
  font-size: 0.85rem;
  color: var(--color-sub);
  font-weight: 500;
}

.product-name {
  font-weight: 600;
  color: var(--color-main);
  font-size: 1rem;
}

.product-rate {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-main);
  background: linear-gradient(45deg, var(--color-main), var(--color-sub));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 결과 표시 */
.result-container {
  animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(1.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  margin-bottom: 1.5rem;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 1.5rem;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(45, 51, 107, 0.2);
}

.result-icon {
  font-size: 1.2rem;
}

/* GPT 콘텐츠 스타일 */
.gpt-content {
  line-height: 1.6;
  color: #333;
  margin-bottom: 2rem;
}

.formatted-content {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-title {
  color: var(--color-main);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid var(--color-main);
}

.main-title {
  color: var(--color-main);
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1.5rem 0 1rem 0;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.1) 0%, rgba(125, 129, 162, 0.05) 100%);
  border-left: 4px solid var(--color-main);
  border-radius: 0 1rem 1rem 0;
}

.section-title {
  color: var(--color-sub);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem 0;
  padding-left: 1rem;
  border-left: 3px solid var(--color-light);
}

.section-subtitle {
  color: var(--color-sub);
  font-size: 1rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  padding-left: 1rem;
  border-left: 3px solid var(--color-light);
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, var(--color-light), transparent);
  margin: 2rem 0;
  opacity: 0.6;
}

.styled-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
  line-height: 1.6;
}

.bullet-item,
.numbered-item {
  margin-bottom: 0.5rem;
  color: #444;
}

.highlight {
  color: var(--color-main);
  font-weight: 600;
  background: rgba(45, 51, 107, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--color-bg-light);
}

.share-btn,
.regenerate-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 2px solid;
  font-size: 1rem;
}

.share-btn {
  background: white;
  color: var(--color-main);
  border-color: var(--color-light);
}

.share-btn:hover {
  background: var(--color-bg-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(45, 51, 107, 0.1);
}

.share-btn.success {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.regenerate-btn {
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  border-color: var(--color-main);
}

.regenerate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 51, 107, 0.3);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
    border-radius: 1.5rem;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .mate-logo p {
    font-size: 1.3rem;
  }

  .loading-steps {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .step {
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .product-item {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .product-rate {
    font-size: 1.1rem;
    align-self: flex-end;
  }

  .result-badge {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }

  .main-title {
    font-size: 1.1rem;
    padding: 0.75rem 1rem;
  }

  .page-title {
    font-size: 1.3rem;
  }
}
</style>
