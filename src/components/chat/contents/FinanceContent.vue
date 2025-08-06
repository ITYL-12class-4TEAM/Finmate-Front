<template>
  <div class="finance-content">
    <div class="content-header">
      <span class="header-icon">{{ getHeaderIcon() }}</span>
      <p class="content-title">{{ message.title }}</p>
    </div>

    <div class="finance-result">
      <div class="result-content" v-html="formattedContent"></div>
    </div>

    <div class="finance-actions">
      <button class="action-btn share-btn" aria-label="결과 공유" @click="shareResult">
        <span class="action-icon">📤</span>
        <span class="action-text">공유하기</span>
      </button>
      <button class="action-btn save-btn" aria-label="결과 저장" @click="saveResult">
        <span class="action-icon">💾</span>
        <span class="action-text">저장하기</span>
      </button>
    </div>

    <div class="finance-footer">
      <div class="disclaimer">
        <span class="disclaimer-icon">⚠️</span>
        <div class="disclaimer-content">
          <p class="disclaimer-text">
            <strong>투자 주의사항</strong><br />
            본 정보는 참고용이며, 투자 결정은 개인 책임하에 신중히 하시기 바랍니다. 금융상품의
            수익률은 시장 상황에 따라 변동될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

const getHeaderIcon = () => {
  if (props.message.title?.includes('비교')) return '⚖️';
  if (props.message.title?.includes('요약')) return '📊';
  if (props.message.title?.includes('분석')) return '📈';
  if (props.message.title?.includes('추천')) return '💡';
  return '💰';
};

const formattedContent = computed(() => {
  if (!props.message.text) return '';

  let content = props.message.text;

  // 줄바꿈을 <br>로 변환
  content = content.replace(/\n/g, '<br>');

  // 금융 키워드 하이라이팅 (더 많은 키워드 추가)
  const keywords = [
    '수익률',
    '리스크',
    '안전성',
    '유동성',
    '세제혜택',
    '만기',
    '최소금액',
    '적금',
    '예금',
    'ISA',
    'IRP',
    'ETF',
    '펀드',
    '보험',
    '대출',
    '금리',
    '이자',
    '배당',
    '원금보장',
    '중도해지',
    '가입조건',
  ];

  keywords.forEach((keyword) => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    content = content.replace(regex, '<span class="highlight">$1</span>');
  });

  // 숫자와 퍼센트 강조 (더 정확한 패턴)
  content = content.replace(/(\d+(?:\.\d+)?%)/g, '<span class="percentage">$1</span>');
  content = content.replace(/(\d{1,3}(?:,\d{3})*원)/g, '<span class="amount">$1</span>');
  content = content.replace(/(\d{1,3}(?:,\d{3})*만원)/g, '<span class="amount">$1</span>');
  content = content.replace(/(\d+년)/g, '<span class="period">$1</span>');
  content = content.replace(/(\d+개월)/g, '<span class="period">$1</span>');

  // 장점/단점 구분 (더 많은 패턴)
  content = content.replace(
    /(장점|혜택|특징|추천이유)[:：]/gi,
    '<span class="pros-title">$1:</span>'
  );
  content = content.replace(
    /(단점|주의사항|위험요소|제한사항|고려사항)[:：]/gi,
    '<span class="cons-title">$1:</span>'
  );

  // 등급이나 평점 표시
  content = content.replace(/(★+|⭐+)/g, '<span class="rating">$1</span>');
  content = content.replace(/([A-Z]+등급)/g, '<span class="grade">$1</span>');

  // 상품명 강조
  content = content.replace(
    /(청년|주택|적금|예금|펀드|ETF|보험)(\s*[가-힣]+)/g,
    '<span class="product-name">$1$2</span>'
  );

  return content;
});

const shareResult = () => {
  if (navigator.share) {
    navigator
      .share({
        title: props.message.title,
        text: props.message.text,
        url: window.location.href,
      })
      .catch(console.error);
  } else {
    // 폴백: 클립보드에 복사
    navigator.clipboard
      .writeText(`${props.message.title}\n\n${props.message.text}`)
      .then(() => alert('결과가 클립보드에 복사되었습니다!'))
      .catch(() => alert('공유 기능을 사용할 수 없습니다.'));
  }
};

const saveResult = () => {
  const data = {
    title: props.message.title,
    content: props.message.text,
    timestamp: new Date().toISOString(),
    type: 'finance-analysis',
  };

  try {
    const savedResults = JSON.parse(localStorage.getItem('financeResults') || '[]');
    savedResults.push(data);
    localStorage.setItem('financeResults', JSON.stringify(savedResults));
    alert('결과가 저장되었습니다!');
  } catch (error) {
    console.error('저장 실패:', error);
    alert('저장에 실패했습니다.');
  }
};
</script>

<style scoped>
.content-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(90, 106, 207, 0.1);
}

.header-icon {
  font-size: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.content-title {
  font-weight: 700;
  margin: 0;
  color: var(--color-main);
  font-size: 1rem;
  letter-spacing: 0.01em;
  flex: 1;
}

.finance-content {
  width: 100%;
}

.finance-result {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 255, 0.95) 100%);
  border-radius: 16px;
  border: 1px solid var(--color-light);
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.finance-result::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(
    90deg,
    #4caf50 0%,
    #2196f3 25%,
    #9c27b0 50%,
    #ff9800 75%,
    #f44336 100%
  );
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.result-content {
  padding: 1.5rem;
  line-height: 1.7;
  color: var(--color-text);
  font-size: 0.9rem;
}

.result-content :deep(br + br) {
  display: block;
  margin: 0.5rem 0;
  content: '';
}

.result-content :deep(.highlight) {
  background: linear-gradient(120deg, rgba(90, 106, 207, 0.15) 0%, rgba(154, 165, 208, 0.2) 100%);
  color: var(--color-main);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid rgba(90, 106, 207, 0.2);
  transition: all 0.2s ease;
}

.result-content :deep(.highlight):hover {
  background: linear-gradient(120deg, rgba(90, 106, 207, 0.25) 0%, rgba(154, 165, 208, 0.3) 100%);
  transform: scale(1.02);
}

.result-content :deep(.percentage) {
  background: linear-gradient(120deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 15px;
  font-weight: 700;
  font-size: 0.9em;
  display: inline-block;
  margin: 0 0.2rem;
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.4);
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.result-content :deep(.amount) {
  background: linear-gradient(120deg, #2196f3 0%, #42a5f5 100%);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 15px;
  font-weight: 700;
  font-size: 0.9em;
  display: inline-block;
  margin: 0 0.2rem;
  box-shadow: 0 3px 8px rgba(33, 150, 243, 0.4);
  animation: bounce 0.5s ease-out;
}

.result-content :deep(.period) {
  background: linear-gradient(120deg, #ff9800 0%, #ffb74d 100%);
  color: white;
  padding: 0.15rem 0.4rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85em;
  display: inline-block;
  margin: 0 0.1rem;
  box-shadow: 0 2px 6px rgba(255, 152, 0, 0.4);
}

.result-content :deep(.pros-title) {
  color: #4caf50;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.05em;
  margin: 0.5rem 0;
}

.result-content :deep(.pros-title)::before {
  content: '✅';
  font-size: 1.1em;
  animation: checkmark 0.5s ease-out;
}

@keyframes checkmark {
  0% {
    transform: scale(0) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.result-content :deep(.cons-title) {
  color: #f44336;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.05em;
  margin: 0.5rem 0;
}

.result-content :deep(.cons-title)::before {
  content: '⚠️';
  font-size: 1.1em;
  animation: warning 0.5s ease-out;
}

@keyframes warning {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

.result-content :deep(.rating) {
  color: #ff9800;
  font-size: 1.2em;
  text-shadow: 0 0 5px rgba(255, 152, 0, 0.5);
  margin: 0 0.2rem;
}

.result-content :deep(.grade) {
  background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9em;
  display: inline-block;
  margin: 0 0.2rem;
  box-shadow: 0 3px 8px rgba(156, 39, 176, 0.4);
}

.result-content :deep(.product-name) {
  background: linear-gradient(120deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%);
  color: #9c27b0;
  padding: 0.2rem 0.5rem;
  border-radius: 8px;
  font-weight: 600;
  border: 1px solid rgba(156, 39, 176, 0.3);
  margin: 0 0.1rem;
}

.finance-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid var(--color-light);
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  color: var(--color-text);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.share-btn:hover {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.save-btn:hover {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.action-icon {
  font-size: 1.1rem;
}

.finance-footer {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  padding: 1rem;
  position: relative;
}

.finance-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%);
  border-radius: 12px 12px 0 0;
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.disclaimer-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
  animation: pulse 2s ease-in-out infinite;
}

.disclaimer-content {
  flex: 1;
}

.disclaimer-text {
  margin: 0;
  font-size: 0.8rem;
  color: #f57c00;
  line-height: 1.5;
  font-weight: 500;
}

.disclaimer-text strong {
  color: #e65100;
  font-weight: 700;
  display: block;
  margin-bottom: 0.25rem;
}

/* 애니메이션 효과 */
.finance-result {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.finance-actions {
  animation: fadeIn 0.8s ease-out 0.3s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 호버 효과 */
.finance-result:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .content-header {
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }

  .header-icon {
    font-size: 1.3rem;
  }

  .content-title {
    font-size: 0.9rem;
  }

  .finance-result {
    margin-bottom: 1rem;
  }

  .result-content {
    padding: 1.25rem;
    font-size: 0.85rem;
  }

  .result-content :deep(.percentage),
  .result-content :deep(.amount),
  .result-content :deep(.period) {
    font-size: 0.8em;
    padding: 0.15rem 0.4rem;
  }

  .finance-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.6rem 1rem;
    font-size: 0.75rem;
    justify-content: center;
  }

  .disclaimer {
    gap: 0.5rem;
  }

  .disclaimer-icon {
    font-size: 1.1rem;
  }

  .disclaimer-text {
    font-size: 0.75rem;
  }

  .finance-footer {
    padding: 0.75rem;
  }
}

/* 접근성 */
.action-btn:focus {
  outline: 2px solid rgba(90, 106, 207, 0.5);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .header-icon,
  .disclaimer-icon,
  .result-content :deep(.percentage),
  .result-content :deep(.amount),
  .result-content :deep(.pros-title)::before,
  .result-content :deep(.cons-title)::before {
    animation: none;
  }

  .finance-result,
  .finance-actions {
    animation: none;
  }

  .finance-result::before {
    animation: none;
  }
}

/* 다크모드 대응 */
@media (prefers-color-scheme: dark) {
  .finance-result {
    background: linear-gradient(135deg, rgba(45, 51, 107, 0.2) 0%, rgba(90, 106, 207, 0.1) 100%);
  }

  .result-content :deep(.highlight) {
    background: rgba(90, 106, 207, 0.3);
    color: #a5b4fc;
  }

  .action-btn {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .disclaimer-text {
    color: #ffb74d;
  }

  .disclaimer-text strong {
    color: #ff9800;
  }
}

/* 인쇄 스타일 */
@media print {
  .finance-content {
    break-inside: avoid;
  }

  .finance-actions {
    display: none;
  }

  .result-content :deep(.percentage),
  .result-content :deep(.amount),
  .result-content :deep(.period),
  .result-content :deep(.grade) {
    background: #666 !important;
    color: white !important;
    box-shadow: none !important;
  }

  .finance-footer {
    background: #f5f5f5 !important;
    border: 1px solid #ccc !important;
  }

  .finance-result::before {
    display: none;
  }
}
</style>
