<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container" @click.stop>
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <div class="modal-title-section">
            <h4 class="modal-title">
              {{ item.customProductName || '상품 상세정보' }}
            </h4>
            <div class="modal-subtitle">
              <span class="company-name">{{ item.customCompanyName || '회사명 없음' }}</span>
              <span class="category-divider">•</span>
              <span class="subcategory-name">{{ item.subcategory || '분류 없음' }}</span>
            </div>
          </div>
          <button class="modal-close" title="닫기" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 모달 바디 -->
        <div class="modal-body">
          <!-- 상품 요약 카드 -->
          <div class="product-summary-card">
            <div class="amount-display">
              <div class="amount-value">{{ formatCurrency(item.amount) }}</div>
              <div class="amount-label">{{ getAmountLabel() }}</div>
              <div v-if="totalAmount" class="amount-ratio">
                전체의 {{ ((item.amount / totalAmount) * 100).toFixed(1) }}%
              </div>
            </div>
            <div class="product-meta">
              <ProductStatus :item="item" />
              <div
                class="category-badge"
                :style="{ backgroundColor: getCategoryColor(item.category) }"
              >
                <i :class="getCategoryIcon(item.category)"></i>
                {{ item.category }}
              </div>
            </div>
          </div>

          <!-- 세부 정보 그리드 -->
          <div class="details-grid">
            <!-- 가입일 -->
            <div class="detail-item">
              <div class="detail-icon calendar">
                <i class="fas fa-calendar-plus"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">가입일</div>
                <div class="detail-value">{{ formatDate(item.joinDate) }}</div>
                <div class="detail-sub">{{ getDaysAgo() }}</div>
              </div>
            </div>

            <!-- 카테고리 정보 -->
            <div class="detail-item">
              <div class="detail-icon category">
                <i class="fas fa-tags"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">상품 분류</div>
                <div class="detail-value">{{ item.category }}</div>
                <div class="detail-sub">{{ item.subcategory }}</div>
              </div>
            </div>

            <!-- 회사명 -->
            <div class="detail-item">
              <div class="detail-icon company">
                <i class="fas fa-building"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">금융회사</div>
                <div class="detail-value">
                  {{ item.customCompanyName || '회사명 없음' }}
                </div>
                <div v-if="getCompanyType()" class="detail-sub">
                  {{ getCompanyType() }}
                </div>
              </div>
            </div>

            <!-- 상품별 특화 정보 -->

            <!-- 예금/적금 전용 정보 -->
            <template v-if="['예금', '적금'].includes(item.category)">
              <!-- 저축 기간 -->
              <div v-if="item.saveTrm" class="detail-item">
                <div class="detail-icon duration">
                  <i class="fas fa-hourglass-half"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">
                    {{ item.category === '예금' ? '예치 기간' : '적립 기간' }}
                  </div>
                  <div class="detail-value">{{ item.saveTrm }}개월</div>
                  <div class="detail-sub">{{ getMaturityInfo() }}</div>
                </div>
              </div>

              <!-- 금리 정보 -->
              <div v-if="hasRateInfo()" class="detail-item">
                <div class="detail-icon rate">
                  <i class="fas fa-percent"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">금리 정보</div>
                  <div class="detail-value interest">{{ formatRateInfo() }}</div>
                  <div v-if="item.expectedReturn" class="detail-sub">
                    예상수익률 {{ item.expectedReturn }}%
                  </div>
                </div>
              </div>

              <!-- 만기일 -->
              <div v-if="item.maturityDate" class="detail-item">
                <div class="detail-icon maturity">
                  <i class="fas fa-flag"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">만기일</div>
                  <div class="detail-value">
                    {{ formatDate(item.maturityDate) }}
                  </div>
                  <div class="detail-sub" :class="getMaturityStatusClass()">
                    {{ getMaturityDaysLeft() }}
                  </div>
                </div>
              </div>

              <!-- 예상 수익 -->
              <div v-if="item.estimatedInterest || item.estimatedAfterTax" class="detail-item">
                <div class="detail-icon profit">
                  <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">예상 수익</div>
                  <div v-if="item.estimatedInterest" class="detail-value profit">
                    {{ formatCurrency(item.estimatedInterest) }}
                  </div>
                  <div v-if="item.estimatedAfterTax" class="detail-sub">
                    세후 {{ formatCurrency(item.estimatedAfterTax) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- 주식 전용 정보 -->
            <template v-if="item.category === '주식'">
              <!-- 현재 주가 -->
              <div v-if="stockInfo.currentPrice" class="detail-item">
                <div class="detail-icon stock-price">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">현재가</div>
                  <div class="detail-value">{{ stockInfo.currentPrice.toLocaleString() }}원</div>
                  <div v-if="stockInfo.quantity" class="detail-sub">
                    {{ stockInfo.quantity }}주 보유
                  </div>
                </div>
              </div>

              <!-- 시장 정보 -->
              <div v-if="stockInfo.marketType" class="detail-item">
                <div class="detail-icon market">
                  <i class="fas fa-globe"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">시장 구분</div>
                  <div class="detail-value">{{ stockInfo.marketType }}</div>
                </div>
              </div>

              <!-- 수익률 -->
              <div v-if="stockInfo.returnRate !== null" class="detail-item">
                <div
                  class="detail-icon"
                  :class="stockInfo.returnRate >= 0 ? 'profit-rate' : 'loss-rate'"
                >
                  <i
                    :class="stockInfo.returnRate >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"
                  ></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">수익률</div>
                  <div class="detail-value" :class="stockInfo.returnRate >= 0 ? 'profit' : 'loss'">
                    {{ stockInfo.returnRate >= 0 ? '+' : '' }}{{ stockInfo.returnRate.toFixed(2) }}%
                  </div>
                  <div class="detail-sub">
                    {{ stockInfo.returnRate >= 0 ? '수익' : '손실' }}:
                    {{ formatCurrency(Math.abs(stockInfo.profitLoss)) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- 보험 전용 정보 -->
            <template v-if="item.category === '보험'">
              <!-- 보장금액 -->
              <div v-if="insuranceInfo.coverage" class="detail-item">
                <div class="detail-icon coverage">
                  <i class="fas fa-shield-alt"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">보장금액</div>
                  <div class="detail-value coverage">
                    {{ formatCurrency(insuranceInfo.coverage) }}
                  </div>
                  <div class="detail-sub">
                    보험료 대비 {{ (insuranceInfo.coverage / item.amount).toFixed(0) }}배 보장
                  </div>
                </div>
              </div>

              <!-- 수익자 -->
              <div v-if="insuranceInfo.beneficiary" class="detail-item">
                <div class="detail-icon beneficiary">
                  <i class="fas fa-user-friends"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">수익자</div>
                  <div class="detail-value">{{ insuranceInfo.beneficiary }}</div>
                </div>
              </div>

              <!-- 납입 기간 -->
              <div v-if="item.saveTrm" class="detail-item">
                <div class="detail-icon duration">
                  <i class="fas fa-hourglass-half"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">납입 기간</div>
                  <div class="detail-value">{{ item.saveTrm }}개월</div>
                  <div class="detail-sub">{{ getInsuranceProgress() }}</div>
                </div>
              </div>

              <!-- 만기일 또는 종신 -->
              <div class="detail-item">
                <div class="detail-icon maturity">
                  <i :class="item.maturityDate ? 'fas fa-flag' : 'fas fa-infinity'"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">보장 기간</div>
                  <div v-if="item.maturityDate" class="detail-value">
                    {{ formatDate(item.maturityDate) }} 만기
                  </div>
                  <div v-else class="detail-value lifetime">종신보장</div>
                  <div
                    v-if="item.maturityDate"
                    class="detail-sub"
                    :class="getMaturityStatusClass()"
                  >
                    {{ getMaturityDaysLeft() }}
                  </div>
                </div>
              </div>
            </template>

            <!-- 연금 전용 정보 -->
            <template v-if="item.category === '연금'">
              <!-- 연금 종류 -->
              <div v-if="pensionInfo.pensionType" class="detail-item">
                <div class="detail-icon pension-type">
                  <i class="fas fa-university"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">연금 종류</div>
                  <div class="detail-value">{{ pensionInfo.pensionType }}</div>
                </div>
              </div>

              <!-- 세제혜택 -->
              <div v-if="pensionInfo.taxBenefit" class="detail-item">
                <div class="detail-icon tax-benefit">
                  <i class="fas fa-receipt"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">세제혜택</div>
                  <div class="detail-value tax">{{ pensionInfo.taxBenefit }}</div>
                  <div class="detail-sub">연간 세액공제 한도 확인 필요</div>
                </div>
              </div>

              <!-- 납입 기간 -->
              <div v-if="item.saveTrm" class="detail-item">
                <div class="detail-icon duration">
                  <i class="fas fa-hourglass-half"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">납입 기간</div>
                  <div class="detail-value">{{ item.saveTrm }}개월</div>
                  <div class="detail-sub">{{ getPensionProgress() }}</div>
                </div>
              </div>

              <!-- 수익률 -->
              <div v-if="item.customRate || item.expectedReturn" class="detail-item">
                <div class="detail-icon rate">
                  <i class="fas fa-percent"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">예상 수익률</div>
                  <div class="detail-value interest">
                    {{ item.customRate || item.expectedReturn }}%
                  </div>
                  <div class="detail-sub">장기 투자 기준</div>
                </div>
              </div>
            </template>

            <!-- 대출 전용 정보 -->
            <template v-if="item.category === '대출'">
              <!-- 대출 금리 -->
              <div v-if="hasRateInfo()" class="detail-item">
                <div class="detail-icon loan-rate">
                  <i class="fas fa-percent"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">대출 금리</div>
                  <div class="detail-value loan-interest">{{ formatRateInfo() }}</div>
                  <div class="detail-sub">{{ getLoanRateStatus() }}</div>
                </div>
              </div>

              <!-- 대출 기간 -->
              <div v-if="item.saveTrm" class="detail-item">
                <div class="detail-icon duration">
                  <i class="fas fa-hourglass-half"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">대출 기간</div>
                  <div class="detail-value">{{ item.saveTrm }}개월</div>
                  <div class="detail-sub">{{ getLoanProgress() }}</div>
                </div>
              </div>

              <!-- 상환일 -->
              <div v-if="item.maturityDate" class="detail-item">
                <div class="detail-icon maturity">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">상환 예정일</div>
                  <div class="detail-value">
                    {{ formatDate(item.maturityDate) }}
                  </div>
                  <div class="detail-sub" :class="getMaturityStatusClass()">
                    {{ getRepaymentDaysLeft() }}
                  </div>
                </div>
              </div>
            </template>

            <!-- 기타 투자 전용 정보 -->
            <template v-if="item.category === '기타'">
              <!-- 예상 수익률 -->
              <div v-if="item.customRate || item.expectedReturn" class="detail-item">
                <div class="detail-icon rate">
                  <i class="fas fa-chart-area"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">예상 수익률</div>
                  <div class="detail-value interest">
                    {{ item.customRate || item.expectedReturn }}%
                  </div>
                  <div class="detail-sub">투자 목표 수익률</div>
                </div>
              </div>

              <!-- 투자 기간 -->
              <div v-if="item.saveTrm" class="detail-item">
                <div class="detail-icon duration">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">투자 기간</div>
                  <div class="detail-value">{{ item.saveTrm }}개월</div>
                  <div class="detail-sub">{{ getInvestmentProgress() }}</div>
                </div>
              </div>

              <!-- 목표일 -->
              <div v-if="item.maturityDate" class="detail-item">
                <div class="detail-icon maturity">
                  <i class="fas fa-flag"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">목표일</div>
                  <div class="detail-value">
                    {{ formatDate(item.maturityDate) }}
                  </div>
                  <div class="detail-sub" :class="getMaturityStatusClass()">
                    {{ getTargetDaysLeft() }}
                  </div>
                </div>
              </div>
            </template>

            <!-- 메모 -->
            <div v-if="pureNote && pureNote.trim()" class="detail-item full-width">
              <div class="detail-icon memo">
                <i class="fas fa-sticky-note"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">메모</div>
                <div class="detail-value memo">{{ pureNote }}</div>
              </div>
            </div>

            <!-- 추가 정보 없음 -->
            <div v-if="!hasAdditionalInfo()" class="detail-item full-width info-notice">
              <div class="detail-icon info">
                <i class="fas fa-info-circle"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">추가 정보</div>
                <div class="detail-value">
                  저축 기간, 금리, 만기일 등의 상세 정보를 추가로 등록할 수 있습니다.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 모달 푸터 -->
        <div class="modal-footer">
          <div class="product-actions">
            <button
              class="action-btn edit-btn"
              :title="isEditing ? '수정 중' : '수정'"
              :disabled="isEditing || isProcessing"
              :class="{ active: isEditing }"
              @click="handleEdit"
            >
              <i :class="isEditing ? 'fas fa-sync-alt spin' : 'fas fa-pen'"></i>
              <span class="btn-text">수정</span>
            </button>

            <button
              class="action-btn delete-btn"
              title="삭제"
              :disabled="isProcessing || isDeleting"
              @click="handleDelete"
            >
              <i :class="isDeleting ? 'fas fa-sync-alt spin' : 'fas fa-trash'"></i>
              <span class="btn-text">{{ isDeleting ? '처리중...' : '삭제' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ProductStatus from './ProductStatusBadge.vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close', 'start-edit', 'delete-product']);

const isDeleting = ref(false);

// 카테고리별 설정
const CATEGORY_CONFIG = {
  예금: { color: '#059669', icon: 'fas fa-piggy-bank' },
  적금: { color: '#0891b2', icon: 'fas fa-coins' },
  보험: { color: '#7c3aed', icon: 'fas fa-shield-alt' },
  연금: { color: '#dc2626', icon: 'fas fa-university' },
  주식: { color: '#ea580c', icon: 'fas fa-chart-line' },
  대출: { color: '#6b7280', icon: 'fas fa-credit-card' },
  기타: { color: '#4338ca', icon: 'fas fa-cube' },
};

// 메모에서 추가 정보 파싱
const parseAdditionalInfo = (memo) => {
  if (!memo) return {};

  const info = {};
  const lines = memo.split('\n');

  for (const line of lines) {
    if (line.includes('현재가:')) {
      const match = line.match(/현재가:\s*([\d,]+)원/);
      if (match) info.currentPrice = parseInt(match[1].replace(/,/g, ''));
    }
    if (line.includes('보유수량:')) {
      const match = line.match(/보유수량:\s*(\d+)주/);
      if (match) info.quantity = parseInt(match[1]);
    }
    if (line.includes('시장:')) {
      const match = line.match(/시장:\s*(.+?)(?:,|$)/);
      if (match) info.marketType = match[1].trim();
    }
    if (line.includes('보장금액:')) {
      const match = line.match(/보장금액:\s*([\d,]+)원/);
      if (match) info.coverage = parseInt(match[1].replace(/,/g, ''));
    }
    if (line.includes('수익자:')) {
      const match = line.match(/수익자:\s*(.+?)(?:,|$)/);
      if (match) info.beneficiary = match[1].trim();
    }
    if (line.includes('연금종류:')) {
      const match = line.match(/연금종류:\s*(.+?)(?:,|$)/);
      if (match) info.pensionType = match[1].trim();
    }
    if (line.includes('세제혜택:')) {
      const match = line.match(/세제혜택:\s*(.+?)(?:,|$)/);
      if (match) info.taxBenefit = match[1].trim();
    }
  }

  return info;
};

// 순수 메모 추출 (추가정보 제외)
const pureNote = computed(() => {
  if (!props.item.memo) return '';

  const additionalInfoIndex = props.item.memo.indexOf('[추가정보]');
  if (additionalInfoIndex !== -1) {
    return props.item.memo.substring(0, additionalInfoIndex).trim();
  }

  return props.item.memo;
});

// 주식 정보
const stockInfo = computed(() => {
  if (props.item.category !== '주식') return {};

  const additionalInfo = parseAdditionalInfo(props.item.memo);
  const info = { ...additionalInfo };

  if (info.currentPrice && info.quantity && props.item.amount) {
    const currentValue = info.currentPrice * info.quantity;
    info.returnRate = ((currentValue - props.item.amount) / props.item.amount) * 100;
    info.profitLoss = currentValue - props.item.amount;
  } else {
    info.returnRate = null;
    info.profitLoss = 0;
  }

  return info;
});

// 보험 정보
const insuranceInfo = computed(() => {
  if (props.item.category !== '보험') return {};
  return parseAdditionalInfo(props.item.memo);
});

// 연금 정보
const pensionInfo = computed(() => {
  if (props.item.category !== '연금') return {};
  return parseAdditionalInfo(props.item.memo);
});

// 색상/아이콘 가져오기
const getCategoryColor = (categoryName) => {
  return CATEGORY_CONFIG[categoryName]?.color || CATEGORY_CONFIG['기타'].color;
};

const getCategoryIcon = (categoryName) => {
  return CATEGORY_CONFIG[categoryName]?.icon || CATEGORY_CONFIG['기타'].icon;
};

// 금액 라벨
const getAmountLabel = () => {
  const labels = {
    예금: '예치금액',
    적금: '월 적립금액',
    보험: '월 보험료',
    연금: '월 납입금액',
    주식: '투자금액',
    대출: '대출금액',
    기타: '투자금액',
  };
  return labels[props.item.category] || '투자금액';
};

// 모달 닫기
const closeModal = () => {
  emit('close');
};

// ESC 키로 모달 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isVisible) {
    closeModal();
  }
};

// 키보드 이벤트 리스너 등록
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    }
  }
);

// 통화 포맷팅
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '0원';

  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remainder = amount % 100000000;
    if (remainder === 0) {
      return `${eok}억원`;
    } else {
      const man = Math.floor(remainder / 10000);
      return `${eok}억 ${man}만원`;
    }
  }

  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man}만원`;
    } else {
      return `${man}만 ${remainder.toLocaleString()}원`;
    }
  }

  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}.${String(date.getDate()).padStart(2, '0')}`;
  } catch (error) {
    return '-';
  }
};

// 회사 타입 추측
const getCompanyType = () => {
  const companyName = props.item.customCompanyName || '';
  if (companyName.includes('은행')) return '은행';
  if (companyName.includes('증권')) return '증권회사';
  if (companyName.includes('보험')) return '보험회사';
  if (companyName.includes('카드')) return '카드회사';
  if (companyName.includes('캐피탈')) return '캐피탈';
  return '';
};

// 가입 일수 계산
const getDaysAgo = () => {
  if (!props.item.joinDate) return '';
  try {
    const joinDate = new Date(props.item.joinDate);
    if (isNaN(joinDate.getTime())) return '';
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘 가입';
    if (diffDays < 30) return `${diffDays}일 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  } catch (error) {
    return '';
  }
};

// 수익률 정보 존재 여부
const hasRateInfo = () => {
  return !!(props.item.interestRate || props.item.customRate);
};

// 수익률 정보 포맷팅
const formatRateInfo = () => {
  const rates = [];
  if (props.item.interestRate) {
    rates.push(`기준금리 ${props.item.interestRate}%`);
  }
  if (props.item.customRate) {
    rates.push(`실제금리 ${props.item.customRate}%`);
  }
  return rates.join(' / ') || '정보 없음';
};

// 만기 정보 계산
const getMaturityInfo = () => {
  if (!props.item.maturityDate || !props.item.joinDate) return '';
  try {
    const joinDate = new Date(props.item.joinDate);
    const maturityDate = new Date(props.item.maturityDate);
    const today = new Date();
    if (isNaN(joinDate.getTime()) || isNaN(maturityDate.getTime())) return '';
    if (today > maturityDate) return '만기 완료';
    const totalDays = Math.floor((maturityDate - joinDate) / (1000 * 60 * 60 * 24));
    const passedDays = Math.max(0, Math.floor((today - joinDate) / (1000 * 60 * 60 * 24)));
    const progress = Math.min(100, Math.floor((passedDays / totalDays) * 100));
    return `진행률 ${progress}%`;
  } catch (error) {
    return '';
  }
};

// 보험 진행률
const getInsuranceProgress = () => {
  if (!props.item.joinDate || !props.item.saveTrm) return '';
  try {
    const joinDate = new Date(props.item.joinDate);
    const today = new Date();
    const monthsPassed = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24 * 30));
    const progress = Math.min(100, Math.floor((monthsPassed / props.item.saveTrm) * 100));
    return `납입 진행률 ${progress}%`;
  } catch (error) {
    return '';
  }
};

// 연금 진행률
const getPensionProgress = () => {
  if (!props.item.joinDate || !props.item.saveTrm) return '';
  try {
    const joinDate = new Date(props.item.joinDate);
    const today = new Date();
    const monthsPassed = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24 * 30));
    const progress = Math.min(100, Math.floor((monthsPassed / props.item.saveTrm) * 100));
    return `납입 진행률 ${progress}%`;
  } catch (error) {
    return '';
  }
};

// 대출 진행률
const getLoanProgress = () => {
  if (!props.item.joinDate || !props.item.saveTrm) return '';
  try {
    const joinDate = new Date(props.item.joinDate);
    const today = new Date();
    const monthsPassed = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24 * 30));
    const progress = Math.min(100, Math.floor((monthsPassed / props.item.saveTrm) * 100));
    return `상환 진행률 ${progress}%`;
  } catch (error) {
    return '';
  }
};

// 투자 진행률
const getInvestmentProgress = () => {
  if (!props.item.joinDate || !props.item.saveTrm) return '';
  try {
    const joinDate = new Date(props.item.joinDate);
    const today = new Date();
    const monthsPassed = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24 * 30));
    const progress = Math.min(100, Math.floor((monthsPassed / props.item.saveTrm) * 100));
    return `투자 진행률 ${progress}%`;
  } catch (error) {
    return '';
  }
};

// 대출 금리 상태
const getLoanRateStatus = () => {
  const rate = props.item.customRate || props.item.interestRate;
  if (!rate) return '';
  if (rate <= 2.0) return '매우 우수한 금리';
  if (rate <= 3.0) return '우수한 금리';
  if (rate <= 4.0) return '보통 금리';
  if (rate <= 6.0) return '높은 금리';
  return '매우 높은 금리';
};

// 만기까지 남은 일수
const getMaturityDaysLeft = () => {
  if (!props.item.maturityDate) return '';
  try {
    const maturityDate = new Date(props.item.maturityDate);
    if (isNaN(maturityDate.getTime())) return '';
    const today = new Date();
    const diffTime = maturityDate - today;
    if (diffTime < 0) return '만기 완료';
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘 만기';
    if (diffDays <= 7) return `${diffDays}일 남음 (임박)`;
    if (diffDays <= 30) return `${diffDays}일 남음`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 남음`;
    return `${Math.floor(diffDays / 365)}년 남음`;
  } catch (error) {
    return '';
  }
};

// 상환일까지 남은 일수 (대출용)
const getRepaymentDaysLeft = () => {
  if (!props.item.maturityDate) return '';
  try {
    const maturityDate = new Date(props.item.maturityDate);
    if (isNaN(maturityDate.getTime())) return '';
    const today = new Date();
    const diffTime = maturityDate - today;
    if (diffTime < 0) return '상환 완료';
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘 상환';
    if (diffDays <= 7) return `${diffDays}일 남음 (임박)`;
    if (diffDays <= 30) return `${diffDays}일 남음`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 남음`;
    return `${Math.floor(diffDays / 365)}년 남음`;
  } catch (error) {
    return '';
  }
};

// 목표일까지 남은 일수 (기타 투자용)
const getTargetDaysLeft = () => {
  if (!props.item.maturityDate) return '';
  try {
    const targetDate = new Date(props.item.maturityDate);
    if (isNaN(targetDate.getTime())) return '';
    const today = new Date();
    const diffTime = targetDate - today;
    if (diffTime < 0) return '목표일 경과';
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘이 목표일';
    if (diffDays <= 7) return `${diffDays}일 남음`;
    if (diffDays <= 30) return `${diffDays}일 남음`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 남음`;
    return `${Math.floor(diffDays / 365)}년 남음`;
  } catch (error) {
    return '';
  }
};

// 만기 상태 클래스
const getMaturityStatusClass = () => {
  if (!props.item.maturityDate) return '';
  try {
    const maturityDate = new Date(props.item.maturityDate);
    if (isNaN(maturityDate.getTime())) return '';
    const today = new Date();
    const diffTime = maturityDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffTime < 0) return 'completed';
    if (diffDays <= 7) return 'urgent';
    if (diffDays <= 30) return 'warning';
    return '';
  } catch (error) {
    return '';
  }
};

// 추가 정보 존재 여부 확인
const hasAdditionalInfo = () => {
  return !!(
    props.item.saveTrm ||
    props.item.interestRate ||
    props.item.customRate ||
    props.item.expectedReturn ||
    props.item.estimatedInterest ||
    props.item.estimatedAfterTax ||
    props.item.maturityDate ||
    (pureNote.value && pureNote.value.trim())
  );
};

// 이벤트 핸들러
const handleEdit = () => {
  if (!props.isEditing && !props.isProcessing) {
    emit('start-edit', props.item);
  }
};

const handleDelete = (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (props.isProcessing || isDeleting.value) {
    return;
  }

  isDeleting.value = true;
  emit('delete-product', props.item);

  setTimeout(() => {
    closeModal();
  }, 100);
};
</script>

<style scoped>
/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(0.25rem); /* 4px */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem; /* 16px */
  animation: fadeIn 0.3s ease-out;
}

/* 모달 컨테이너 */
.modal-container {
  background: var(--color-white);
  border-radius: 1rem; /* 16px */
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.3); /* 0 20px 60px */
  max-width: 35rem; /* 560px - 조금 더 넓게 */
  width: 100%;
  max-height: 80svh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem; /* 16px */
  border-bottom: 0.0625rem solid rgba(185, 187, 204, 0.2); /* 1px */
  background: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 0.875rem; /* 14px */
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-subtitle {
  font-size: 0.75rem; /* 12px */
  color: var(--color-sub);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.company-name {
  font-weight: 600;
}

.category-divider {
  opacity: 0.6;
}

.modal-close {
  width: 1.75rem; /* 28px */
  height: 1.75rem; /* 28px */
  border-radius: 50%;
  border: none;
  background: rgba(185, 187, 204, 0.2);
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* 12px */
  flex-shrink: 0;
}

.modal-close:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  transform: scale(1.1);
}

/* 모달 바디 */
.modal-body {
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(80svh - 140px);
  flex: 1;
}

/* 상품 요약 카드 */
.product-summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-bg-light);
  border-radius: 0.75rem;
  border: 0.0625rem solid rgba(185, 187, 204, 0.2);
  margin-bottom: 1.5rem;
}

.amount-display {
  flex: 1;
}

.amount-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.25rem;
}

.amount-label {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
  margin-bottom: 0.15rem;
}

.amount-ratio {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
  opacity: 0.8;
}

.product-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.category-badge i {
  font-size: 0.65rem;
}

/* 세부 정보 그리드 */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
}
.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  border: 0.0625rem solid rgba(185, 187, 204, 0.15);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(185, 187, 204, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.08);
}

.detail-icon {
  width: 1.75rem; /* 28px */
  height: 1.75rem; /* 28px */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* 12px */
  flex-shrink: 0;
  color: white;
  transition: all 0.3s ease;
}

/* 기본 아이콘 색상 - 기존 스타일과 통일 */
.detail-icon.calendar {
  background: var(--color-sub);
}
.detail-icon.category {
  background: var(--color-sub);
}
.detail-icon.company {
  background: var(--color-sub);
}
.detail-icon.duration {
  background: var(--color-sub);
}
.detail-icon.rate {
  background: var(--color-sub);
}
.detail-icon.maturity {
  background: var(--color-sub);
}
.detail-icon.profit {
  background: var(--color-sub);
}
.detail-icon.memo {
  background: var(--color-sub);
}
.detail-icon.info {
  background: var(--color-sub);
}

/* 상품별 특수 아이콘 */
.detail-icon.stock-price {
  background: var(--color-sub);
}
.detail-icon.market {
  background: var(--color-sub);
}
.detail-icon.profit-rate {
  background: var(--color-sub);
}
.detail-icon.loss-rate {
  background: var(--color-sub);
}
.detail-icon.coverage {
  background: var(--color-sub);
}
.detail-icon.beneficiary {
  background: var(--color-sub);
}
.detail-icon.pension-type {
  background: var(--color-sub);
}
.detail-icon.tax-benefit {
  background: var(--color-sub);
}
.detail-icon.loan-rate {
  background: var(--color-sub);
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.75rem; /* 12px */
  color: var(--color-sub);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 0.85rem; /* 약 13-14px */
  font-weight: 600;
  color: var(--color-main);
  line-height: 1.4;
  margin-bottom: 0.15rem;
}

.detail-value.interest {
  color: #10b981;
  font-weight: 700;
}
.detail-value.profit {
  color: #059669;
  font-weight: 700;
}
.detail-value.loss {
  color: #dc2626;
  font-weight: 700;
}
.detail-value.coverage {
  color: #7c3aed;
  font-weight: 700;
}
.detail-value.tax {
  color: #059669;
  font-weight: 700;
}
.detail-value.loan-interest {
  color: #f59e0b;
  font-weight: 700;
}
.detail-value.lifetime {
  color: #8b5cf6;
  font-weight: 700;
}
.detail-value.memo {
  font-weight: 500;
  white-space: normal;
  line-height: 1.5;
}

.detail-sub {
  font-size: 0.625rem; /* 10px */
  color: var(--color-sub);
  font-weight: 400;
  opacity: 0.8;
  line-height: 1.4;
}

.detail-sub.completed {
  color: #10b981;
  font-weight: 500;
}
.detail-sub.urgent {
  color: #dc2626;
  font-weight: 600;
}
.detail-sub.warning {
  color: #f59e0b;
  font-weight: 500;
}

/* 특별 상태 */
.info-notice {
  background: var(--color-bg-light);
  border: 1px dashed rgba(185, 187, 204, 0.4);
}

.info-notice .detail-value {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-sub);
  line-height: 1.5;
}

/* 모달 푸터 */
.modal-footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(185, 187, 204, 0.15);
  background: var(--color-white);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-shrink: 0;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 4rem;
  justify-content: center;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.edit-btn {
  background: var(--color-main);
  color: white;
}

.edit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
}

.delete-btn {
  background: var(--color-light);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.btn-text {
  font-size: 0.8rem;
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(1.875rem) scale(0.95); /* 30px */
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.spin {
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

/* 스크롤바 커스터마이징 */
.modal-body::-webkit-scrollbar {
  width: 0.25rem; /* 4px */
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(185, 187, 204, 0.1);
  border-radius: 0.125rem; /* 2px */
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(185, 187, 204, 0.4);
  border-radius: 0.125rem; /* 2px */
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(185, 187, 204, 0.6);
}

/* 반응형 및 접근성 */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-container,
  .action-btn,
  .detail-item {
    animation: none;
    transition: none;
  }
}

/* 포커스 상태 */
.action-btn:focus {
  outline: 0.125rem solid var(--color-main); /* 2px */
  outline-offset: 0.125rem; /* 2px */
}
</style>
