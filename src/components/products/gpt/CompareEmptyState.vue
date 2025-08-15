<template>
  <div class="empty-state">
    <div class="empty-content">
      <!-- 빈 상태 아이콘 -->
      <div class="empty-icon">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <!-- 비교 테이블 아이콘 -->
          <rect x="20" y="30" width="80" height="60" rx="8" fill="var(--color-bg-light)" stroke="var(--color-light)" stroke-width="2"/>
          
          <!-- 테이블 그리드 -->
          <line x1="20" y1="45" x2="100" y2="45" stroke="var(--color-light)" stroke-width="1"/>
          <line x1="20" y1="60" x2="100" y2="60" stroke="var(--color-light)" stroke-width="1"/>
          <line x1="20" y1="75" x2="100" y2="75" stroke="var(--color-light)" stroke-width="1"/>
          <line x1="45" y1="30" x2="45" y2="90" stroke="var(--color-light)" stroke-width="1"/>
          <line x1="72.5" y1="30" x2="72.5" y2="90" stroke="var(--color-light)" stroke-width="1"/>
          
          <!-- 빈 상태를 나타내는 점선 사각형들 -->
          <rect x="47" y="32" width="23" height="11" rx="2" fill="none" stroke="var(--color-light)" stroke-width="1" stroke-dasharray="2,2"/>
          <rect x="75" y="32" width="23" height="11" rx="2" fill="none" stroke="var(--color-light)" stroke-width="1" stroke-dasharray="2,2"/>
          
          <!-- 물음표 아이콘 -->
          <circle cx="60" cy="105" r="8" fill="var(--color-sub)"/>
          <text x="60" y="110" text-anchor="middle" fill="white" font-size="12" font-weight="bold">?</text>
        </svg>
      </div>

      <!-- 메시지 -->
      <div class="empty-message">
        <h3 class="empty-title">비교할 상품이 없습니다</h3>
        <p class="empty-description">
          상품을 2개 이상 선택하시면<br>
          상세한 비교 정보를 확인할 수 있습니다
        </p>
      </div>

      <!-- 액션 버튼 -->
      <div class="empty-actions">
        <button class="go-products-btn" @click="$emit('goToProducts')">
          <span class="btn-icon">🔍</span>
          상품 둘러보기
        </button>
      </div>

      <!-- 도움말 정보 -->
      <div class="help-info">
        <h4 class="help-title">💡 상품 비교 방법</h4>
        <div class="help-steps">
          <div class="help-step">
            <span class="step-number">1</span>
            <span class="step-text">관심 있는 상품 페이지에서 '비교함 담기' 클릭</span>
          </div>
          <div class="help-step">
            <span class="step-number">2</span>
            <span class="step-text">2~3개의 상품을 비교함에 추가</span>
          </div>
          <div class="help-step">
            <span class="step-number">3</span>
            <span class="step-text">비교 페이지에서 상품들을 한눈에 비교</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Emits
defineEmits(['goToProducts']);
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem 1rem;
}

.empty-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

/* 빈 상태 아이콘 */
.empty-icon {
  margin-bottom: 2rem;
  opacity: 0.8;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 메시지 */
.empty-message {
  margin-bottom: 2rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 1rem 0;
}

.empty-description {
  font-size: 1rem;
  color: var(--color-sub);
  line-height: 1.6;
  margin: 0;
}

/* 액션 버튼 */
.empty-actions {
  margin-bottom: 3rem;
}

.go-products-btn {
  display: inline-flex;
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
  transition: all 0.3s ease;
  box-shadow: 0 0.5rem 1rem rgba(45, 51, 107, 0.2);
}

.go-products-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.75rem 1.5rem rgba(45, 51, 107, 0.3);
}

.go-products-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.25rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -5px, 0);
  }
  70% {
    transform: translate3d(0, -3px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

/* 도움말 정보 */
.help-info {
  background-color: var(--color-bg-light);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: left;
}

.help-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0 0 1rem 0;
  text-align: center;
}

.help-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.help-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 0.5rem;
  border-left: 4px solid var(--color-main);
  transition: transform 0.2s;
}

.help-step:hover {
  transform: translateX(5px);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, var(--color-main) 0%, #3d4785 100%);
  color: white;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  font-size: 0.9375rem;
  color: var(--color-sub);
  line-height: 1.4;
}

/* 반응형 */
@media (max-width: 768px) {
  .empty-state {
    padding: 1rem;
    min-height: 50vh;
  }
  
  .empty-icon svg {
    width: 100px;
    height: 100px;
  }
  
  .empty-title {
    font-size: 1.25rem;
  }
  
  .empty-description {
    font-size: 0.9375rem;
  }
  
  .go-products-btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
  
  .help-info {
    padding: 1rem;
  }
  
  .help-step {
    padding: 0.5rem;
  }
  
  .step-text {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .help-step {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .step-number {
    order: -1;
  }
}
</style>