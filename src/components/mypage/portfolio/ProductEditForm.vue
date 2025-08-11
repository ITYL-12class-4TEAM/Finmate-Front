<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container" @click.stop>
        <!-- 모달 헤더 -->
        <div class="modal-header">
          <div class="modal-title-section">
            <h4 class="modal-title">
              <i class="fas fa-edit"></i>
              상품 정보 수정
            </h4>
            <div class="modal-subtitle">
              {{ item.customProductName || '상품 정보' }}를 수정합니다
            </div>
          </div>
          <button class="modal-close" title="닫기" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 모달 바디 -->
        <div class="modal-body">
          <form class="edit-form" @submit.prevent="handleSubmit">
            <div class="form-grid">
              <!-- 상품명 -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="fas fa-tag"></i>
                  상품명
                </label>
                <input
                  v-model="formData.customProductName"
                  type="text"
                  class="form-input"
                  placeholder="상품명을 입력하세요"
                  required
                  autofocus
                />
              </div>

              <!-- 회사명 -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-building"></i>
                  금융회사
                </label>
                <input
                  v-model="formData.customCompanyName"
                  type="text"
                  class="form-input"
                  placeholder="예: 국민은행, 삼성증권"
                  maxlength="50"
                  list="company-suggestions"
                />
                <datalist id="company-suggestions">
                  <option v-for="company in companySuggestions" :key="company" :value="company">
                    {{ company }}
                  </option>
                </datalist>
              </div>

              <!-- 카테고리 -->
              <div class="form-group">
                <label class="form-label required">
                  <i class="fas fa-th-large"></i>
                  카테고리
                </label>
                <select v-model="formData.category" class="form-input form-select" required>
                  <option value="">카테고리 선택</option>
                  <option value="예금">예금</option>
                  <option value="적금">적금</option>
                  <option value="보험">보험</option>
                  <option value="연금">연금</option>
                  <option value="주식">주식</option>
                  <option value="대출">대출</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <!-- 세부 카테고리 -->
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-tags"></i>
                  세부 카테고리
                </label>
                <select v-model="formData.subcategory" class="form-input form-select">
                  <option value="">세부 분류 선택</option>
                  <option
                    v-for="subcategory in availableSubcategories"
                    :key="subcategory"
                    :value="subcategory"
                  >
                    {{ subcategory }}
                  </option>
                </select>
              </div>

              <!-- 동적 필드들 -->
              <template v-if="formData.category">
                <!-- 투자금액/월납입금액 등 -->
                <div v-if="shouldShowField('amount')" class="form-group">
                  <label class="form-label" :class="{ required: isRequiredField('amount') }">
                    <i class="fas fa-coins"></i>
                    {{ getFieldLabel('amount') }}
                  </label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="formData.amount"
                      type="number"
                      class="form-input"
                      placeholder="0"
                      min="0"
                      step="10000"
                      :required="isRequiredField('amount')"
                    />
                    <span class="input-unit">원</span>
                  </div>
                </div>

                <!-- 기준금리 (예금, 적금에 표시) -->
                <div v-if="shouldShowField('interestRate')" class="form-group">
                  <label class="form-label">
                    <i class="fas fa-chart-line"></i>
                    기준 금리 (%)
                  </label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="formData.interestRate"
                      type="number"
                      class="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <span class="input-unit">%</span>
                  </div>
                </div>

                <!-- 실제금리 (예금, 적금, 연금에 표시) -->
                <div v-if="shouldShowField('customRate')" class="form-group">
                  <label class="form-label" :class="{ required: isRequiredField('customRate') }">
                    <i class="fas fa-percent"></i>
                    {{ getFieldLabel('customRate') }}
                  </label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="formData.customRate"
                      type="number"
                      class="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      :required="isRequiredField('customRate')"
                    />
                    <span class="input-unit">%</span>
                  </div>
                </div>

                <!-- 기간 (상품별로 다른 라벨) -->
                <div v-if="shouldShowField('saveTrm')" class="form-group">
                  <label class="form-label" :class="{ required: isRequiredField('saveTrm') }">
                    <i class="fas fa-calendar-alt"></i>
                    {{ getFieldLabel('saveTrm') }}
                  </label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="formData.saveTrm"
                      type="number"
                      class="form-input"
                      placeholder="0"
                      min="0"
                      :required="isRequiredField('saveTrm')"
                    />
                    <span class="input-unit">개월</span>
                  </div>
                </div>

                <!-- 주식 전용 필드들 -->
                <template v-if="formData.category === '주식'">
                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-chart-line"></i>
                      현재가
                    </label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="formData.currentPrice"
                        type="number"
                        class="form-input"
                        placeholder="0"
                        min="0"
                      />
                      <span class="input-unit">원</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-cubes"></i>
                      보유 수량
                    </label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="formData.quantity"
                        type="number"
                        class="form-input"
                        placeholder="0"
                        min="0"
                      />
                      <span class="input-unit">주</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-globe"></i>
                      시장 구분
                    </label>
                    <select v-model="formData.marketType" class="form-input form-select">
                      <option value="">시장 선택</option>
                      <option value="코스피">코스피</option>
                      <option value="코스닥">코스닥</option>
                      <option value="해외">해외</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                </template>

                <!-- 보험 전용 필드들 -->
                <template v-if="formData.category === '보험'">
                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-shield-alt"></i>
                      보장금액
                    </label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="formData.coverage"
                        type="number"
                        class="form-input"
                        placeholder="0"
                        min="0"
                      />
                      <span class="input-unit">원</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-user-friends"></i>
                      수익자
                    </label>
                    <input
                      v-model="formData.beneficiary"
                      type="text"
                      class="form-input"
                      placeholder="수익자 이름"
                      maxlength="50"
                    />
                  </div>
                </template>

                <!-- 연금 전용 필드들 -->
                <template v-if="formData.category === '연금'">
                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-coins"></i>
                      연금 종류
                    </label>
                    <select v-model="formData.pensionType" class="form-input form-select">
                      <option value="">종류 선택</option>
                      <option value="연금저축">연금저축</option>
                      <option value="개인연금">개인연금</option>
                      <option value="IRP">IRP</option>
                      <option value="DC형">DC형</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      <i class="fas fa-receipt"></i>
                      세제혜택
                    </label>
                    <select v-model="formData.taxBenefit" class="form-input form-select">
                      <option value="">혜택 선택</option>
                      <option value="세액공제">세액공제</option>
                      <option value="소득공제">소득공제</option>
                      <option value="비과세">비과세</option>
                      <option value="해당없음">해당없음</option>
                    </select>
                  </div>
                </template>

                <!-- 가입일 -->
                <div v-if="shouldShowField('joinDate')" class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar-plus"></i>
                    가입일
                  </label>
                  <input
                    v-model="formData.joinDate"
                    type="date"
                    class="form-input"
                    :max="todayDate"
                  />
                </div>

                <!-- 만기일 -->
                <div
                  v-if="
                    shouldShowField('maturityDate') &&
                    ['예금', '적금', '보험', '연금'].includes(formData.category)
                  "
                  class="form-group"
                >
                  <label class="form-label">
                    <i class="fas fa-flag"></i>
                    만기일
                  </label>
                  <input
                    v-model="formData.maturityDate"
                    type="date"
                    class="form-input"
                    :min="formData.joinDate || todayDate"
                  />
                </div>
              </template>

              <!-- 메모 -->
              <div class="form-group full-width">
                <label class="form-label">
                  <i class="fas fa-sticky-note"></i>
                  메모
                </label>
                <textarea
                  v-model="formData.memo"
                  class="form-input form-textarea"
                  placeholder="추가 메모를 입력하세요..."
                  rows="3"
                  maxlength="500"
                ></textarea>
                <div v-if="formData.memo" class="character-count">
                  {{ formData.memo.length }}/500자
                </div>
              </div>
            </div>

            <!-- 자동 계산 섹션 (예금, 적금만) -->
            <div v-if="canAutoCalculate" class="auto-calculate-section">
              <div class="calculate-header">
                <div class="calculate-title">
                  <i class="fas fa-calculator"></i>
                  자동 계산
                </div>
                <button
                  type="button"
                  class="auto-calc-btn"
                  :disabled="isProcessing"
                  @click="autoCalculateAll"
                >
                  <i class="fas fa-magic"></i>
                  수익 자동계산
                </button>
              </div>

              <div class="calc-note">금액, 금리, 기간을 바탕으로 예상 수익을 계산합니다</div>

              <div class="calc-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-money-bill-wave"></i>
                    예상 이자
                  </label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="formData.estimatedInterest"
                      type="number"
                      class="form-input"
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                    <span class="input-unit">원</span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calculator"></i>
                    세후 예상 금액
                  </label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="formData.estimatedAfterTax"
                      type="number"
                      class="form-input"
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                    <span class="input-unit">원</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- 모달 푸터 -->
        <div class="modal-footer">
          <button
            type="button"
            class="modal-btn cancel-btn"
            :disabled="isProcessing"
            @click="closeModal"
          >
            <i class="fas fa-times"></i>
            취소
          </button>

          <button
            type="button"
            class="modal-btn reset-btn"
            :disabled="isProcessing"
            @click="resetForm"
          >
            <i class="fas fa-undo"></i>
            초기화
          </button>

          <button
            class="modal-btn save-btn"
            :disabled="isProcessing || !isFormValid"
            @click="handleSubmit"
          >
            <i :class="isProcessing ? 'fas fa-sync-alt spin' : 'fas fa-save'"></i>
            {{ isProcessing ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save-product']);

// 오늘 날짜
const todayDate = new Date().toISOString().split('T')[0];

// 금융회사 추천 목록
const companySuggestions = [
  '국민은행',
  'KB은행',
  '신한은행',
  '하나은행',
  '우리은행',
  'SC제일은행',
  '삼성증권',
  'NH투자증권',
  '키움증권',
  '미래에셋증권',
  '한국투자증권',
  '삼성생명',
  '한화생명',
  '교보생명',
  'DB생명',
  '흥국생명',
];

// 카테고리별 세부 카테고리 매핑
const subcategoryMapping = {
  예금: ['정기예금', '자유예금', '기업예금', 'CMA'],
  적금: ['정기적금', '자유적금', '펀드적금', '연금적금'],
  보험: ['종신보험', '정기보험', '연금보험', '변액보험'],
  연금: ['연금저축', '개인연금', 'IRP', 'DC형'],
  주식: ['국내주식', '해외주식', 'ETF', 'ETN'],
  대출: ['신용대출', '담보대출', '전세자금대출', '주택담보대출'],
  기타: ['부동산', '채권', '금', '암호화폐', '기타투자'],
};

// 상품군별 필드 설정
const productFieldConfig = {
  예금: {
    required: ['customProductName', 'customCompanyName', 'amount', 'customRate'],
    hidden: [],
    labels: {
      amount: '예치금액',
      customRate: '실제 금리 (%)',
      saveTrm: '예치 기간 (개월)',
    },
  },
  적금: {
    required: ['customProductName', 'customCompanyName', 'amount', 'customRate', 'saveTrm'],
    hidden: [],
    labels: {
      amount: '월 적립금액',
      customRate: '실제 금리 (%)',
      saveTrm: '적립 기간 (개월)',
    },
  },
  보험: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: ['customRate', 'interestRate'],
    labels: {
      amount: '월 보험료',
      saveTrm: '납입 기간 (개월)',
    },
  },
  연금: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: ['interestRate'],
    labels: {
      amount: '월 납입금액',
      customRate: '예상 수익률 (%)',
      saveTrm: '납입 기간 (개월)',
    },
  },
  주식: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: ['customRate', 'saveTrm', 'interestRate', 'maturityDate'],
    labels: {
      amount: '투자금액',
    },
  },
  대출: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: [],
    labels: {
      amount: '대출금액',
      customRate: '대출 금리 (%)',
      saveTrm: '대출 기간 (개월)',
    },
  },
  기타: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: ['interestRate'],
    labels: {
      amount: '투자금액',
      customRate: '예상 수익률 (%)',
      saveTrm: '투자 기간 (개월)',
    },
  },
};

// 사용 가능한 세부 카테고리
const availableSubcategories = computed(() => {
  return subcategoryMapping[formData.value.category] || [];
});

// 날짜를 input[type="date"] 형식으로 변환
function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// 메모에서 추가 정보 파싱
function parseAdditionalInfo(memo) {
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
}

// 추가 정보를 제외한 순수 메모 추출
function extractPureMemo(memo) {
  if (!memo) return '';

  const additionalInfoIndex = memo.indexOf('[추가정보]');
  if (additionalInfoIndex !== -1) {
    return memo.substring(0, additionalInfoIndex).trim();
  }

  return memo;
}

// 폼 데이터 초기화
const formData = ref({
  portfolioId: props.item.portfolioId || null,
  customProductName: props.item.customProductName || '',
  customCompanyName: props.item.customCompanyName || '',
  category: props.item.category || '',
  subcategory: props.item.subcategory || '',
  amount: props.item.amount || 0,
  riskLevel: props.item.riskLevel || '',
  interestRate: props.item.interestRate || null,
  customRate: props.item.customRate || null,
  expectedReturn: props.item.expectedReturn || null,
  saveTrm: props.item.saveTrm || null,
  joinDate: props.item.joinDate ? formatDateForInput(props.item.joinDate) : '',
  maturityDate: props.item.maturityDate ? formatDateForInput(props.item.maturityDate) : '',
  estimatedInterest: props.item.estimatedInterest || null,
  estimatedAfterTax: props.item.estimatedAfterTax || null,
  memo: extractPureMemo(props.item.memo) || '',
  // 추가 필드들
  ...parseAdditionalInfo(props.item.memo),
});

// 원본 데이터 백업 (초기화용)
const originalData = ref({ ...formData.value });

// 필드 표시 여부 확인
const shouldShowField = (fieldName) => {
  const config = productFieldConfig[formData.value.category];
  if (!config) return true;
  return !config.hidden.includes(fieldName);
};

// 필수 필드 여부 확인
const isRequiredField = (fieldName) => {
  const config = productFieldConfig[formData.value.category];
  if (!config) return false;
  return config.required.includes(fieldName);
};

// 필드 라벨 가져오기
const getFieldLabel = (fieldName) => {
  const config = productFieldConfig[formData.value.category];
  if (!config || !config.labels || !config.labels[fieldName]) {
    const defaultLabels = {
      amount: '투자금액',
      customRate: '실제 금리 (%)',
      saveTrm: '저축 기간 (개월)',
      joinDate: '가입일',
      maturityDate: '만기일',
    };
    return defaultLabels[fieldName] || fieldName;
  }
  return config.labels[fieldName];
};

// 폼 유효성 검사
const isFormValid = computed(() => {
  const config = productFieldConfig[formData.value.category];
  if (!config) return false;

  return config.required.every((field) => {
    const value = formData.value[field];
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined && value > 0;
  });
});

// 자동 계산 가능 여부 (예금, 적금만)
const canAutoCalculate = computed(() => {
  return (
    ['예금', '적금'].includes(formData.value.category) &&
    formData.value.amount > 0 &&
    (formData.value.interestRate > 0 || formData.value.customRate > 0) &&
    formData.value.saveTrm > 0
  );
});

// 카테고리 변경 시 처리
watch(
  () => formData.value.category,
  (newCategory) => {
    // 세부 카테고리 초기화
    if (newCategory && !availableSubcategories.value.includes(formData.value.subcategory)) {
      formData.value.subcategory = '';
    }

    // 숨김 필드 초기화
    const config = productFieldConfig[newCategory];
    if (config && config.hidden) {
      config.hidden.forEach((field) => {
        if (field === 'customRate') formData.value.customRate = null;
        if (field === 'saveTrm') formData.value.saveTrm = null;
        if (field === 'interestRate') formData.value.interestRate = null;
      });
    }

    // 카테고리별 특수 필드 초기화
    if (newCategory !== '주식') {
      formData.value.currentPrice = null;
      formData.value.quantity = null;
      formData.value.marketType = '';
    }
    if (newCategory !== '보험') {
      formData.value.coverage = null;
      formData.value.beneficiary = '';
    }
    if (newCategory !== '연금') {
      formData.value.pensionType = '';
      formData.value.taxBenefit = '';
    }
  }
);

// props.item 변경 시 폼 데이터 업데이트
watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      const additionalInfo = parseAdditionalInfo(newItem.memo);

      formData.value = {
        portfolioId: newItem.portfolioId || null,
        customProductName: newItem.customProductName || '',
        customCompanyName: newItem.customCompanyName || '',
        category: newItem.category || '',
        subcategory: newItem.subcategory || '',
        amount: newItem.amount || 0,
        riskLevel: newItem.riskLevel || '',
        interestRate: newItem.interestRate || null,
        customRate: newItem.customRate || null,
        expectedReturn: newItem.expectedReturn || null,
        saveTrm: newItem.saveTrm || null,
        joinDate: newItem.joinDate ? formatDateForInput(newItem.joinDate) : '',
        maturityDate: newItem.maturityDate ? formatDateForInput(newItem.maturityDate) : '',
        estimatedInterest: newItem.estimatedInterest || null,
        estimatedAfterTax: newItem.estimatedAfterTax || null,
        memo: extractPureMemo(newItem.memo) || '',
        // 추가 정보 필드들
        ...additionalInfo,
      };
      originalData.value = { ...formData.value };
    }
  },
  { deep: true }
);

// 만기일 자동 계산
const calculateMaturityDate = () => {
  if (formData.value.joinDate && formData.value.saveTrm > 0) {
    const joinDate = new Date(formData.value.joinDate);
    const maturityDate = new Date(joinDate);
    maturityDate.setMonth(maturityDate.getMonth() + formData.value.saveTrm);
    formData.value.maturityDate = formatDateForInput(maturityDate);
  }
};

// 세후 금액 계산
const calculateAfterTax = () => {
  if (formData.value.amount && formData.value.estimatedInterest) {
    const principal = formData.value.amount;
    const interest = formData.value.estimatedInterest;
    const taxRate = 0.154; // 이자소득세 15.4%
    const afterTaxInterest = Math.round(interest * (1 - taxRate));
    formData.value.estimatedAfterTax = principal + afterTaxInterest;
  }
};

// 전체 자동 계산
const autoCalculateAll = () => {
  if (!canAutoCalculate.value) return;

  const principal = formData.value.amount;
  const rate = (formData.value.customRate || formData.value.interestRate) / 100;
  const months = formData.value.saveTrm;

  // 복리 계산
  const futureValue = principal * Math.pow(1 + rate / 12, months);
  const interest = Math.round(futureValue - principal);

  formData.value.estimatedInterest = interest;

  // 세후 계산
  calculateAfterTax();

  // 만기일 계산
  if (formData.value.joinDate) {
    calculateMaturityDate();
  }
};

// 위험도 매핑 함수
const getRiskLevel = (category) => {
  const riskMapping = {
    예금: 'LOW',
    적금: 'LOW',
    보험: 'LOW',
    연금: 'MEDIUM',
    주식: 'HIGH',
    대출: 'MEDIUM',
    기타: 'MEDIUM',
  };
  return riskMapping[category] || 'MEDIUM';
};

// 폼 초기화
const resetForm = () => {
  if (confirm('모든 변경사항이 초기화됩니다. 계속하시겠습니까?')) {
    formData.value = { ...originalData.value };
  }
};

// 모달 닫기
const closeModal = () => {
  emit('close');
};

// 폼 제출 처리
const handleSubmit = () => {
  if (!isFormValid.value || props.isProcessing) return;

  // API 명세에 맞는 데이터 구조로 변환
  const cleanedData = {
    portfolioId: formData.value.portfolioId,
    amount: formData.value.amount,
    category: formData.value.category,
    customCompanyName: formData.value.customCompanyName.trim(),
    customProductName: formData.value.customProductName.trim(),
    subcategory: formData.value.subcategory || null,

    // 금리 관련
    customRate: formData.value.customRate || null,
    interestRate: formData.value.interestRate || null,
    expectedReturn: (() => {
      // 상품별로 다른 expectedReturn 계산
      if (
        formData.value.category === '주식' &&
        formData.value.currentPrice &&
        formData.value.quantity
      ) {
        const totalValue = formData.value.currentPrice * formData.value.quantity;
        return formData.value.amount > 0
          ? ((totalValue - formData.value.amount) / formData.value.amount) * 100
          : null;
      } else if (
        ['예금', '적금', '연금', '기타'].includes(formData.value.category) &&
        formData.value.customRate
      ) {
        return formData.value.customRate;
      }
      return formData.value.expectedReturn || null;
    })(),

    // 기간 관련
    saveTrm: formData.value.saveTrm || null,
    joinDate: formData.value.joinDate || null,
    maturityDate: formData.value.maturityDate || null,

    // 위험도 자동 설정
    riskLevel: getRiskLevel(formData.value.category),

    // 예상 수익 관련
    estimatedInterest: formData.value.estimatedInterest || null,
    estimatedAfterTax: formData.value.estimatedAfterTax || null,

    // 메모에 추가 정보 포함
    memo: (() => {
      let memo = formData.value.memo.trim();

      // 상품별 특수 정보를 메모에 추가
      const additionalInfo = [];

      if (formData.value.category === '주식') {
        if (formData.value.currentPrice)
          additionalInfo.push(`현재가: ${formData.value.currentPrice.toLocaleString()}원`);
        if (formData.value.quantity) additionalInfo.push(`보유수량: ${formData.value.quantity}주`);
        if (formData.value.marketType) additionalInfo.push(`시장: ${formData.value.marketType}`);
      } else if (formData.value.category === '보험') {
        if (formData.value.coverage)
          additionalInfo.push(`보장금액: ${formData.value.coverage.toLocaleString()}원`);
        if (formData.value.beneficiary)
          additionalInfo.push(`수익자: ${formData.value.beneficiary}`);
      } else if (formData.value.category === '연금') {
        if (formData.value.pensionType)
          additionalInfo.push(`연금종류: ${formData.value.pensionType}`);
        if (formData.value.taxBenefit)
          additionalInfo.push(`세제혜택: ${formData.value.taxBenefit}`);
      }

      if (additionalInfo.length > 0) {
        memo = memo
          ? `${memo}\n\n[추가정보]\n${additionalInfo.join(', ')}`
          : `[추가정보]\n${additionalInfo.join(', ')}`;
      }

      return memo || null;
    })(),
  };

  emit('save-product', cleanedData);
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
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    } else {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    }
  }
);
</script>

<style scoped>
/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 3rem;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(0.25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

/* 모달 컨테이너 */
.modal-container {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  max-width: 26.875rem;
  width: 100%;
  max-height: 110vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 2px solid rgba(185, 187, 204, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 252, 0.9) 100%);
}

.modal-title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-title i {
  color: var(--color-sub);
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--color-sub);
  font-weight: 500;
}

.modal-close {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(185, 187, 204, 0.3);
  color: var(--color-sub);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background: white;
  border-color: var(--color-main);
  color: var(--color-main);
  transform: scale(1.1);
}

/* 모달 바디 */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 180px);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-main);
  min-width: 120px;
  flex-shrink: 0;
  white-space: nowrap;
}

.form-label.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 0.25rem;
}

.form-label i {
  font-size: 0.8rem;
  color: var(--color-sub);
  width: 1rem;
  text-align: center;
}

.form-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.95);
  transition: all 0.3s ease;
  min-width: 0;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
  background: white;
}

.form-select {
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 4rem;
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-unit .form-input {
  padding-right: 2.5rem;
}

.input-unit {
  position: absolute;
  right: 0.75rem;
  color: var(--color-sub);
  font-size: 0.8rem;
  font-weight: 500;
  pointer-events: none;
}

.character-count {
  font-size: 0.7rem;
  color: var(--color-sub);
  text-align: right;
  margin-top: 0.25rem;
}

/* 자동 계산 섹션 */
.auto-calculate-section {
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.05), rgba(125, 129, 162, 0.05));
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.calculate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.calculate-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-main);
}

.auto-calc-btn {
  padding: 0.5rem 0.75rem;
  background: var(--color-sub);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auto-calc-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(125, 129, 162, 0.3);
}

.calc-note {
  font-size: 0.75rem;
  color: var(--color-sub);
  opacity: 0.8;
  margin-bottom: 1rem;
}

.calc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* 모달 푸터 */
.modal-footer {
  padding: 1rem;
  border-top: 1px solid rgba(185, 187, 204, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 252, 0.9) 100%);
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.5rem 0.5rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 5rem;
  justify-content: center;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.cancel-btn {
  background: var(--color-light);
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.reset-btn {
  background: var(--color-sub);
  color: white;
}

.reset-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.save-btn {
  background: var(--color-main);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
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
    transform: translateY(30px) scale(0.95);
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

.modal-btn:focus,
.form-input:focus {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}

/* 스크롤바 커스터마이징 */
.modal-body::-webkit-scrollbar {
  width: 0.25rem;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(185, 187, 204, 0.1);
  border-radius: 0.125rem;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(185, 187, 204, 0.4);
  border-radius: 0.125rem;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(185, 187, 204, 0.6);
}

@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-container,
  .modal-btn,
  .form-input {
    animation: none;
    transition: none;
  }
}
</style>
