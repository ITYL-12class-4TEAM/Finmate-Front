<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-content">
          <div class="mate-logo">
            <span class="mate-icon">🤖</span>
            <h3>MATE의 상품 비교 요약</h3>
          </div>
          <button class="close-btn" @click="$emit('close')" aria-label="닫기">×</button>
        </div>
      </div>

      <div class="modal-body">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">MATE가 상품을 분석하고 있습니다...</p>
          <div class="loading-steps">
            <div class="step" :class="{ active: currentStep >= 1 }">상품 정보 수집</div>
            <div class="step" :class="{ active: currentStep >= 2 }">금리 및 조건 분석</div>
            <div class="step" :class="{ active: currentStep >= 3 }">장단점 비교</div>
            <div class="step" :class="{ active: currentStep >= 4 }">맞춤 추천 생성</div>
          </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">⚠️</div>
          <h4>분석 중 오류가 발생했습니다</h4>
          <p class="error-message">{{ error }}</p>
          <button class="retry-btn" @click="handleRetry">다시 시도</button>
        </div>

        <!-- 결과 표시 -->
        <div v-else-if="gptResult" class="result-container">
          <div class="result-header">
            <span class="result-icon">✨</span>
            <h4>{{ compareList.length }}개 상품 비교 완료</h4>
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

        <!-- 초기 상태 (분석 전) -->
        <div v-else class="initial-container">
          <div class="products-preview">
            <h4>분석할 상품 ({{ compareList.length }}개)</h4>
            <div class="product-list">
              <div v-for="product in compareList" :key="product.productId" class="product-item">
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

          <div class="analysis-info">
            <h5>MATE가 분석해드리는 내용:</h5>
            <ul class="analysis-features">
              <li>✅ 각 상품의 금리와 조건 상세 비교</li>
              <li>✅ 상품별 장단점 및 특징 분석</li>
              <li>✅ 가입 조건과 주의사항 정리</li>
              <li>✅ 개인 상황에 맞는 추천</li>
            </ul>
          </div>

          <button class="start-analysis-btn" @click="startAnalysis">
            <span class="btn-icon">🚀</span>
            분석 시작하기
          </button>
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

const emit = defineEmits(['close']);

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

  // 마크다운을 HTML로 변환 (개선된 버전)
  content = content
    // 헤더 변환 (순서 중요)
    .replace(/^### (.*?)$/gm, '<h3 class="section-title">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 class="main-title">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 class="page-title">$1</h1>')

    // 테이블 변환 (향상된)
    .replace(
      /\|([^\n]+)\|\n\|([^\n]+)\|\n((?:\|[^\n]+\|\n?)+)/g,
      (match, header, separator, rows) => {
        const headerCells = header
          .split('|')
          .map((cell) => cell.trim())
          .filter((cell) => cell);
        const rowsArray = rows
          .trim()
          .split('\n')
          .map((row) =>
            row
              .split('|')
              .map((cell) => cell.trim())
              .filter((cell) => cell)
          );

        let tableHTML = '<div class="table-container"><table class="comparison-table">';
        tableHTML += '<thead><tr>';
        headerCells.forEach((cell) => {
          tableHTML += `<th>${cell}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        rowsArray.forEach((row) => {
          if (row.length > 0) {
            tableHTML += '<tr>';
            row.forEach((cell, index) => {
              const cellClass = index === 0 ? 'first-column' : '';
              tableHTML += `<td class="${cellClass}">${cell}</td>`;
            });
            tableHTML += '</tr>';
          }
        });

        tableHTML += '</tbody></table></div>';
        return tableHTML;
      }
    )

    // 구분선 변환
    .replace(/^---$/gm, '<div class="divider"></div>')

    // 리스트 변환 (개선된)
    .replace(/^\* (.*?)$/gm, '<li class="bullet-item">$1</li>')
    .replace(/^- (.*?)$/gm, '<li class="bullet-item">$1</li>')
    .replace(/^\d+\. (.*?)$/gm, '<li class="numbered-item">$1</li>')

    // 볼드, 이탤릭 변환
    .replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')

    // 문단 구분
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // 리스트 래핑 (개선된)
  content = content.replace(
    /(<li class="bullet-item">.*?<\/li>)(?=(?:(?!<li class="bullet-item">)[\s\S])*?(?:<li class="bullet-item">|$))/gs,
    '<ul class="styled-list">$1</ul>'
  );
  content = content.replace(
    /(<li class="numbered-item">.*?<\/li>)(?=(?:(?!<li class="numbered-item">)[\s\S])*?(?:<li class="numbered-item">|$))/gs,
    '<ol class="styled-list numbered">$1</ol>'
  );

  // 전체를 문단으로 래핑
  content = `<div class="formatted-content">${content}</div>`;

  return content;
});

// 분석 시작
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

// 결과 공유/복사 (개선된)
const handleShare = async () => {
  try {
    // HTML 태그 제거하고 텍스트만 추출
    const textContent =
      gptResult.value
        ?.replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"') || '';

    await navigator.clipboard.writeText(textContent);

    // 간단한 피드백 (실제로는 toast 컴포넌트 사용 권장)
    const shareBtn = document.querySelector('.share-btn');
    const originalText = shareBtn.innerHTML;
    shareBtn.innerHTML = '<span>✅</span>복사 완료!';
    shareBtn.style.background = '#28a745';

    setTimeout(() => {
      shareBtn.innerHTML = originalText;
      shareBtn.style.background = '';
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

// 모달이 닫힐 때 정리
watch(
  () => props.show,
  (newShow) => {
    if (!newShow) {
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 50rem;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 1.25rem 3.125rem rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-2rem) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
  padding: 1.25rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mate-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mate-icon {
  font-size: 1.5rem;
  animation: bounce 2s infinite;
}

.mate-logo h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 5rem);
}

/* 로딩 상태 */
.loading-container {
  text-align: center;
  padding: 2rem 0;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 0.25rem solid #f3f3f3;
  border-top: 0.25rem solid var(--color-main);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-text {
  font-size: 1.125rem;
  color: var(--color-main);
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 20rem;
  margin: 0 auto;
}

.step {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  color: #6c757d;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.step.active {
  background: var(--color-main);
  color: white;
  transform: translateX(0.5rem);
}

/* 에러 상태 */
.error-container {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-container h4 {
  color: #dc3545;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: var(--color-main);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.retry-btn:hover {
  filter: brightness(110%);
}

/* 초기 상태 */
.initial-container {
  padding: 1rem 0;
}

.products-preview h4 {
  color: var(--color-main);
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.product-list {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bank-name {
  font-size: 0.875rem;
  color: #6c757d;
}

.product-name {
  font-weight: 500;
  color: var(--color-main);
}

.product-rate {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
}

.analysis-info {
  margin-bottom: 1.5rem;
}

.analysis-info h5 {
  color: var(--color-main);
  margin-bottom: 0.75rem;
}

.analysis-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.analysis-features li {
  padding: 0.375rem 0;
  color: #495057;
  font-size: 0.9375rem;
}

.start-analysis-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.start-analysis-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(45, 51, 107, 0.3);
}

.btn-icon {
  font-size: 1.25rem;
}

/* 결과 표시 */
.result-container {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.result-icon {
  font-size: 1.5rem;
}

.result-header h4 {
  color: var(--color-main);
  margin: 0;
}

/* 개선된 GPT 콘텐츠 스타일 */
.gpt-content {
  line-height: 1.7;
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
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-main);
}

.main-title {
  color: var(--color-main);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--color-main) 10, transparent);
  border-left: 4px solid var(--color-main);
  border-radius: 0 0.5rem 0.5rem 0;
}

.section-title {
  color: #495057;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem 0;
  padding-left: 1rem;
  border-left: 3px solid #dee2e6;
}

.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--color-main), transparent);
  margin: 2rem 0;
  opacity: 0.3;
}

/* 개선된 테이블 스타일 */
.table-container {
  margin: 1.5rem 0;
  overflow-x: auto;
  border-radius: 0.75rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.1);
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.9rem;
}

.comparison-table thead th {
  background: linear-gradient(135deg, var(--color-main), #3d4785);
  color: white;
  font-weight: 600;
  padding: 1rem 0.75rem;
  text-align: left;
  border: none;
}

.comparison-table thead th:first-child {
  border-radius: 0.75rem 0 0 0;
}

.comparison-table thead th:last-child {
  border-radius: 0 0.75rem 0 0;
}

.comparison-table tbody td {
  padding: 0.875rem 0.75rem;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
}

.comparison-table tbody td.first-column {
  background: #f8f9fa;
  font-weight: 600;
  color: var(--color-main);
  width: 15%;
}

.comparison-table tbody tr:last-child td {
  border-bottom: none;
}

.comparison-table tbody tr:last-child td:first-child {
  border-radius: 0 0 0 0.75rem;
}

.comparison-table tbody tr:last-child td:last-child {
  border-radius: 0 0 0.75rem 0;
}

.comparison-table tbody tr:hover {
  background: rgba(45, 51, 107, 0.02);
}

/* 개선된 리스트 스타일 */
.styled-list {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.styled-list.numbered {
  counter-reset: item;
}

.bullet-item {
  margin-bottom: 0.5rem;
  position: relative;
  list-style: none;
}

.bullet-item::before {
  content: '•';
  color: var(--color-main);
  font-weight: bold;
  position: absolute;
  left: -1rem;
}

.numbered-item {
  margin-bottom: 0.5rem;
  position: relative;
  list-style: none;
  counter-increment: item;
}

.numbered-item::before {
  content: counter(item) '.';
  color: var(--color-main);
  font-weight: bold;
  position: absolute;
  left: -1.5rem;
  width: 1rem;
}

.highlight {
  color: var(--color-main);
  font-weight: 600;
  background: rgba(45, 51, 107, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.share-btn,
.regenerate-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid #dee2e6;
}

.share-btn {
  background: white;
  color: var(--color-main);
}

.share-btn:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.regenerate-btn {
  background: var(--color-main);
  color: white;
  border-color: var(--color-main);
}

.regenerate-btn:hover {
  filter: brightness(110%);
  transform: translateY(-1px);
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
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .mate-logo h3 {
    font-size: 1.125rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .comparison-table {
    font-size: 0.8rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.5rem;
  }

  .table-container {
    margin: 1rem -1rem;
    border-radius: 0;
  }

  .comparison-table thead th:first-child,
  .comparison-table thead th:last-child,
  .comparison-table tbody tr:last-child td:first-child,
  .comparison-table tbody tr:last-child td:last-child {
    border-radius: 0;
  }
}
</style>
```
