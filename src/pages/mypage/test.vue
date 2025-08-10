<template>
  <div class="portfolio-setup">
    <!-- 진행 단계 표시 -->
    <div class="progress-header">
      <h2>포트폴리오 설정</h2>
      <div class="progress-bar">
        <div
          class="progress-step"
          :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
        >
          <span class="step-number">1</span>
          <span class="step-text">자동 연동</span>
        </div>
        <div class="progress-line" :class="{ completed: currentStep > 1 }"></div>
        <div
          class="progress-step"
          :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
        >
          <span class="step-number">2</span>
          <span class="step-text">수동 추가</span>
        </div>
        <div class="progress-line" :class="{ completed: currentStep > 2 }"></div>
        <div class="progress-step" :class="{ active: currentStep >= 3 }">
          <span class="step-number">3</span>
          <span class="step-text">완료</span>
        </div>
      </div>
    </div>

    <!-- Step 1: 자동 연동 -->
    <div v-if="currentStep === 1" class="setup-step">
      <div class="step-header">
        <h3>🔗 계좌 자동 연동</h3>
        <p>주요 은행과 증권사 계좌를 자동으로 가져옵니다</p>
      </div>

      <div class="auto-connect-section">
        <!-- 연동 가능한 기관들 -->
        <div class="institution-grid">
          <div
            v-for="institution in availableInstitutions"
            :key="institution.code"
            class="institution-card"
            :class="{
              connected: institution.connected,
              connecting: institution.connecting,
            }"
          >
            <div class="institution-logo">
              <img :src="institution.logo" :alt="institution.name" />
            </div>
            <div class="institution-info">
              <h4>{{ institution.name }}</h4>
              <p>{{ institution.description }}</p>
              <div v-if="institution.connected" class="connected-accounts">
                <span class="account-count">{{ institution.accountCount }}개 계좌 연동됨</span>
              </div>
            </div>
            <div class="institution-action">
              <button
                v-if="!institution.connected"
                :disabled="institution.connecting"
                class="connect-btn"
                @click="connectInstitution(institution)"
              >
                <i v-if="institution.connecting" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-link"></i>
                {{ institution.connecting ? '연동 중...' : '연동하기' }}
              </button>
              <div v-else class="connected-status">
                <i class="fas fa-check-circle"></i>
                연동완료
              </div>
            </div>
          </div>
        </div>

        <!-- 연동 결과 요약 -->
        <div v-if="connectedCount > 0" class="connection-summary">
          <div class="summary-card">
            <h4>🎉 자동 연동 완료!</h4>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-number">{{ connectedCount }}</span>
                <span class="stat-label">개 기관</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ totalAutoAccounts }}</span>
                <span class="stat-label">개 계좌</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ formatCurrency(totalAutoAmount) }}</span>
                <span class="stat-label">총 자산</span>
              </div>
            </div>
            <div class="auto-products-preview">
              <h5>자동으로 가져온 상품들:</h5>
              <div class="product-list">
                <div
                  v-for="product in autoProducts.slice(0, 3)"
                  :key="product.id"
                  class="product-item"
                >
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-amount">{{ formatCurrency(product.amount) }}</span>
                </div>
                <div v-if="autoProducts.length > 3" class="more-products">
                  +{{ autoProducts.length - 3 }}개 더...
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 다음 단계 버튼 -->
        <div class="step-actions">
          <button class="skip-btn" @click="skipAutoConnect">자동 연동 건너뛰기</button>
          <button class="next-btn" :disabled="isConnecting" @click="nextStep">다음 단계</button>
        </div>
      </div>
    </div>

    <!-- Step 2: 수동 추가 -->
    <div v-if="currentStep === 2" class="setup-step">
      <div class="step-header">
        <h3>✏️ 추가 상품 입력</h3>
        <p>자동 연동되지 않은 상품들을 추가해보세요</p>
      </div>

      <div class="manual-add-section">
        <!-- 추천 상품들 -->
        <div v-if="suggestedProducts.length > 0" class="suggestions">
          <h4>🤖 추가하면 좋을 상품들</h4>
          <p>현재 포트폴리오를 분석해서 추천드려요</p>
          <div class="suggestion-grid">
            <div
              v-for="suggestion in suggestedProducts"
              :key="suggestion.id"
              class="suggestion-card"
            >
              <div class="suggestion-icon">
                <i :class="getCategoryIcon(suggestion.category)"></i>
              </div>
              <div class="suggestion-content">
                <h5>{{ suggestion.category }}</h5>
                <p>{{ suggestion.reason }}</p>
              </div>
              <button class="add-suggestion-btn" @click="addSuggestedProduct(suggestion)">
                추가하기
              </button>
            </div>
          </div>
        </div>

        <!-- 수동 추가된 상품들 -->
        <div class="manual-products">
          <div class="manual-header">
            <h4>수동 추가된 상품</h4>
            <button class="add-product-btn" @click="openAddModal">
              <i class="fas fa-plus"></i>
              새 상품 추가
            </button>
          </div>

          <div v-if="manualProducts.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>아직 수동으로 추가한 상품이 없습니다</p>
            <p class="hint">위의 추천 상품을 추가하거나 직접 입력해보세요</p>
          </div>

          <div v-else class="product-grid">
            <div v-for="product in manualProducts" :key="product.id" class="product-card">
              <div class="product-header">
                <div
                  class="product-category"
                  :style="{ backgroundColor: getCategoryColor(product.category) }"
                >
                  {{ product.category }}
                </div>
                <button class="remove-btn" @click="removeProduct(product)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <h5>{{ product.customProductName }}</h5>
              <p>{{ product.customCompanyName }}</p>
              <div class="product-amount">{{ formatCurrency(product.amount) }}</div>
            </div>
          </div>
        </div>

        <!-- 다음 단계 버튼 -->
        <div class="step-actions">
          <button class="back-btn" @click="previousStep">이전 단계</button>
          <button class="next-btn" @click="nextStep">설정 완료</button>
        </div>
      </div>
    </div>

    <!-- Step 3: 완료 -->
    <div v-if="currentStep === 3" class="setup-step">
      <div class="completion-section">
        <div class="completion-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h3>🎉 포트폴리오 설정 완료!</h3>

        <div class="final-summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">{{ totalProducts }}</div>
              <div class="summary-label">총 상품 수</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">{{ connectedCount }}</div>
              <div class="summary-label">자동 연동 기관</div>
            </div>
            <div class="summary-item">
              <div class="summary-number">{{ formatCurrency(totalAmount) }}</div>
              <div class="summary-label">총 자산</div>
            </div>
          </div>

          <div class="breakdown">
            <h4>카테고리별 분포</h4>
            <div class="category-breakdown">
              <div
                v-for="(amount, category) in categoryBreakdown"
                :key="category"
                class="category-item"
              >
                <div class="category-bar">
                  <div
                    class="category-fill"
                    :style="{
                      width: (amount / totalAmount) * 100 + '%',
                      backgroundColor: getCategoryColor(category),
                    }"
                  ></div>
                </div>
                <div class="category-info">
                  <span class="category-name">{{ category }}</span>
                  <span class="category-amount">{{ formatCurrency(amount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="start-btn" @click="goToPortfolio">포트폴리오 시작하기</button>
      </div>
    </div>

    <!-- 수동 추가 모달 -->
    <ProductAddModal
      :is-visible="showAddModal"
      @close="closeAddModal"
      @add-product="handleAddProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ProductAddModal from '../../components/mypage/portfolio/ProductAddModal.vue';

const emit = defineEmits(['setup-complete']);

// 상태
const currentStep = ref(1);
const showAddModal = ref(false);
const isConnecting = ref(false);

// 연동 가능한 기관들
const availableInstitutions = ref([
  {
    code: 'KB',
    name: 'KB국민은행',
    description: '예금, 적금, 대출',
    logo: '/logos/kb.png',
    connected: false,
    connecting: false,
    accountCount: 0,
    accounts: [],
  },
  {
    code: 'SHINHAN',
    name: '신한은행',
    description: '예금, 적금, 펀드',
    logo: '/logos/shinhan.png',
    connected: false,
    connecting: false,
    accountCount: 0,
    accounts: [],
  },
  {
    code: 'SAMSUNG',
    name: '삼성증권',
    description: '주식, CMA, 펀드',
    logo: '/logos/samsung.png',
    connected: false,
    connecting: false,
    accountCount: 0,
    accounts: [],
  },
  {
    code: 'MIRAE',
    name: '미래에셋증권',
    description: '주식, ETF, 해외투자',
    logo: '/logos/mirae.png',
    connected: false,
    connecting: false,
    accountCount: 0,
    accounts: [],
  },
]);

// 자동 연동된 상품들
const autoProducts = ref([]);

// 수동 추가된 상품들
const manualProducts = ref([]);

// 추천 상품들
const suggestedProducts = ref([
  {
    id: 'suggestion-1',
    category: '적금',
    reason: '비상금 마련을 위해 적금 상품을 추천드려요',
    template: {
      category: '적금',
      subcategory: '정기적금',
      customRate: 3.5,
      saveTrm: 12,
    },
  },
  {
    id: 'suggestion-2',
    category: '주식',
    reason: '장기 투자를 위해 주식 투자를 고려해보세요',
    template: {
      category: '주식',
      subcategory: '국내주식',
    },
  },
  {
    id: 'suggestion-3',
    category: '보험',
    reason: '보장성 상품으로 안전망을 구축하세요',
    template: {
      category: '보험',
      subcategory: '종신보험',
    },
  },
]);

// 계산된 값들
const connectedCount = computed(
  () => availableInstitutions.value.filter((inst) => inst.connected).length
);

const totalAutoAccounts = computed(() =>
  availableInstitutions.value.reduce((sum, inst) => sum + inst.accountCount, 0)
);

const totalAutoAmount = computed(() =>
  autoProducts.value.reduce((sum, product) => sum + product.amount, 0)
);

const totalProducts = computed(() => autoProducts.value.length + manualProducts.value.length);

const totalAmount = computed(
  () =>
    totalAutoAmount.value + manualProducts.value.reduce((sum, product) => sum + product.amount, 0)
);

const categoryBreakdown = computed(() => {
  const breakdown = {};

  [...autoProducts.value, ...manualProducts.value].forEach((product) => {
    const category = product.category;
    breakdown[category] = (breakdown[category] || 0) + product.amount;
  });

  return breakdown;
});

// 카테고리 설정
const CATEGORY_CONFIG = {
  예금: { color: '#059669', icon: 'fas fa-piggy-bank' },
  적금: { color: '#0891b2', icon: 'fas fa-coins' },
  보험: { color: '#7c3aed', icon: 'fas fa-shield-alt' },
  연금: { color: '#dc2626', icon: 'fas fa-university' },
  주식: { color: '#ea580c', icon: 'fas fa-chart-line' },
  대출: { color: '#6b7280', icon: 'fas fa-credit-card' },
  기타: { color: '#4338ca', icon: 'fas fa-cube' },
};

// 메서드들
const getCategoryColor = (category) => {
  return CATEGORY_CONFIG[category]?.color || CATEGORY_CONFIG['기타'].color;
};

const getCategoryIcon = (category) => {
  return CATEGORY_CONFIG[category]?.icon || CATEGORY_CONFIG['기타'].icon;
};

const formatCurrency = (amount) => {
  if (!amount) return '0원';
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remainder = amount % 100000000;
    if (remainder === 0) return `${eok}억원`;
    const man = Math.floor(remainder / 10000);
    return `${eok}억 ${man}만원`;
  }
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) return `${man}만원`;
    return `${man}만 ${remainder.toLocaleString()}원`;
  }
  return amount.toLocaleString() + '원';
};

// 기관 연동
const connectInstitution = async (institution) => {
  institution.connecting = true;
  isConnecting.value = true;

  try {
    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 가상의 연동 결과
    const mockAccounts = [
      { name: `${institution.name} 정기예금`, amount: 10000000, category: '예금' },
      { name: `${institution.name} 적금`, amount: 5000000, category: '적금' },
    ];

    institution.connected = true;
    institution.accountCount = mockAccounts.length;
    institution.accounts = mockAccounts;

    // 자동 상품 목록에 추가
    mockAccounts.forEach((account) => {
      autoProducts.value.push({
        id: `auto-${Date.now()}-${Math.random()}`,
        customProductName: account.name,
        customCompanyName: institution.name,
        category: account.category,
        amount: account.amount,
        isAutoConnected: true,
      });
    });
  } catch (error) {
    alert('연동에 실패했습니다.');
  } finally {
    institution.connecting = false;
    isConnecting.value = availableInstitutions.value.some((inst) => inst.connecting);
  }
};

// 추천 상품 추가
const addSuggestedProduct = (suggestion) => {
  showAddModal.value = true;
  // 추천 상품의 템플릿을 모달에 전달 (실제로는 props로)
};

// 단계 이동
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const skipAutoConnect = () => {
  currentStep.value = 2;
};

// 모달 관련
const openAddModal = () => {
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const handleAddProduct = (product) => {
  manualProducts.value.push({
    ...product,
    id: `manual-${Date.now()}`,
    isAutoConnected: false,
  });
  closeAddModal();
};

const removeProduct = (product) => {
  const index = manualProducts.value.findIndex((p) => p.id === product.id);
  if (index > -1) {
    manualProducts.value.splice(index, 1);
  }
};

// 완료
const goToPortfolio = () => {
  const allProducts = [...autoProducts.value, ...manualProducts.value];
  emit('setup-complete', allProducts);
};
</script>

<style scoped>
.portfolio-setup {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.progress-header {
  text-align: center;
  margin-bottom: 3rem;
}

.progress-header h2 {
  margin-bottom: 2rem;
  color: var(--color-main);
}

.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-step.active .step-number {
  background: var(--color-main);
  color: white;
}

.progress-step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-text {
  font-size: 0.875rem;
  color: var(--color-sub);
  font-weight: 500;
}

.progress-line {
  width: 3rem;
  height: 2px;
  background: #e5e7eb;
  transition: all 0.3s ease;
}

.progress-line.completed {
  background: #10b981;
}

.setup-step {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-header h3 {
  margin-bottom: 0.5rem;
  color: var(--color-main);
}

.institution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.institution-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.institution-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.institution-card.connected {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.institution-logo img {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
}

.institution-info {
  flex: 1;
}

.institution-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--color-main);
}

.institution-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-sub);
}

.connected-accounts {
  margin-top: 0.5rem;
}

.account-count {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 600;
}

.connect-btn {
  background: var(--color-main);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.connected-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
}

.connection-summary {
  margin: 2rem 0;
}

.summary-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #047857;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.auto-products-preview h5 {
  margin: 1rem 0 0.5rem 0;
  color: var(--color-main);
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
}

.suggestions {
  margin-bottom: 2rem;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.75rem;
}

.suggestion-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--color-main);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.suggestion-content {
  flex: 1;
}

.suggestion-content h5 {
  margin: 0 0 0.25rem 0;
  color: var(--color-main);
}

.suggestion-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-sub);
}

.add-suggestion-btn {
  background: var(--color-main);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.manual-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-product-btn {
  background: var(--color-main);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-sub);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.hint {
  font-size: 0.875rem;
  opacity: 0.8;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.product-card {
  background: white;
  border: 1px solid rgba(185, 187, 204, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.product-category {
  font-size: 0.75rem;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-sub);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.product-card h5 {
  margin: 0 0 0.25rem 0;
  color: var(--color-main);
}

.product-card p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--color-sub);
}

.product-amount {
  font-weight: 600;
  color: #059669;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.back-btn,
.skip-btn {
  background: var(--color-light);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.next-btn,
.start-btn {
  background: var(--color-main);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}

.completion-section {
  text-align: center;
}

.completion-icon {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.final-summary {
  margin: 2rem 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-item {
  background: rgba(16, 185, 129, 0.05);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.summary-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #047857;
  margin-bottom: 0.5rem;
}

.summary-label {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.breakdown {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.breakdown h4 {
  margin: 0 0 1rem 0;
  color: var(--color-main);
  text-align: left;
}

.category-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.category-bar {
  flex: 1;
  height: 0.5rem;
  background: rgba(185, 187, 204, 0.2);
  border-radius: 0.25rem;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.category-info {
  display: flex;
  justify-content: space-between;
  min-width: 8rem;
  font-size: 0.875rem;
}

.category-name {
  color: var(--color-main);
  font-weight: 500;
}

.category-amount {
  color: var(--color-sub);
  font-weight: 600;
}

.start-btn {
  font-size: 1rem;
  padding: 1rem 2rem;
  margin-top: 1rem;
}

/* 반응형 */
@media (max-width: 768px) {
  .portfolio-setup {
    padding: 1rem;
  }

  .institution-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-grid {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .step-actions {
    flex-direction: column;
  }

  .category-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .category-info {
    min-width: auto;
  }
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.setup-step {
  animation: fadeIn 0.5s ease-out;
}

.institution-card.connected {
  animation: connectedPulse 0.6s ease-out;
}

@keyframes connectedPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* 로딩 상태 */
.institution-card.connecting {
  opacity: 0.7;
  pointer-events: none;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 호버 효과 */
.connect-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
}

.add-suggestion-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
}

.next-btn:hover,
.start-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  .setup-step,
  .institution-card.connected,
  .connect-btn,
  .next-btn,
  .start-btn {
    animation: none;
    transition: none;
  }
}

/* 포커스 상태 */
.connect-btn:focus,
.add-suggestion-btn:focus,
.next-btn:focus,
.start-btn:focus {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}
</style>
