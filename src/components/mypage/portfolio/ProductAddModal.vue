<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <div class="modal-title">
          <i class="fas fa-plus-circle"></i>
          새 상품 추가
        </div>
        <button class="modal-close" :disabled="isProcessing" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- 모달 바디 -->
      <div class="modal-body">
        <div class="modal-subtitle">새로운 투자 상품을 포트폴리오에 추가해보세요</div>

        <form class="add-form" @submit.prevent="handleSubmit">
          <div class="form-grid">
            <!-- 상품명 (항상 표시) -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-tag"></i>
                상품명
              </label>
              <input
                v-model="formData.customProductName"
                type="text"
                class="form-input"
                placeholder="예: KB Star 정기예금"
                required
                maxlength="100"
                autofocus
              />
            </div>

            <!-- 회사명 (항상 표시) -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-building"></i>
                금융회사
              </label>
              <input
                v-model="formData.customCompanyName"
                type="text"
                class="form-input"
                placeholder="예: 국민은행"
                required
                maxlength="50"
                list="company-suggestions"
              />
              <datalist id="company-suggestions">
                <option v-for="company in companySuggestions" :key="company" :value="company">
                  {{ company }}
                </option>
              </datalist>
            </div>

            <!-- 카테고리 (항상 표시) -->
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
                <option value="기타">기타</option>
              </select>
            </div>

            <!-- 세부 카테고리 (항상 표시) -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-tags"></i>
                세부 카테고리
              </label>
              <select
                v-model="formData.subcategory"
                class="form-input form-select"
                :disabled="!formData.category"
              >
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

              <!-- 금리 (예금, 적금, 연금에만 표시) -->
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
                    max="50"
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
                    max="1200"
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
                placeholder="상품에 대한 추가 정보를 입력..."
                rows="3"
                maxlength="500"
              ></textarea>
              <div v-if="formData.memo" class="character-count">
                {{ formData.memo.length }}/500자
              </div>
            </div>
          </div>

          <!-- 미리보기 -->
          <div v-if="canShowPreview" class="preview-section">
            <div class="preview-header">
              <i class="fas fa-eye"></i>
              미리보기
            </div>
            <div class="preview-content">
              <div class="preview-item">
                <span class="preview-label">{{ getFieldLabel('amount') }}</span>
                <span class="preview-value">
                  {{ formatCurrency(formData.amount) }}
                </span>
              </div>
              <div
                v-if="
                  formData.customRate &&
                  formData.saveTrm &&
                  ['예금', '적금'].includes(formData.category)
                "
                class="preview-item"
              >
                <span class="preview-label">예상 이자</span>
                <span class="preview-value profit">
                  {{ formatCurrency(calculateEstimatedInterest()) }}
                </span>
              </div>
              <div v-if="formData.joinDate && formData.saveTrm" class="preview-item">
                <span class="preview-label">예상 만기일</span>
                <span class="preview-value">
                  {{ calculateMaturityDate() }}
                </span>
              </div>
              <!-- 주식 미리보기 -->
              <div
                v-if="formData.category === '주식' && formData.currentPrice && formData.quantity"
                class="preview-item"
              >
                <span class="preview-label">예상 평가금액</span>
                <span class="preview-value">
                  {{ formatCurrency(formData.currentPrice * formData.quantity) }}
                </span>
              </div>
              <!-- 보험 미리보기 -->
              <div v-if="formData.category === '보험' && formData.coverage" class="preview-item">
                <span class="preview-label">보장금액</span>
                <span class="preview-value">
                  {{ formatCurrency(formData.coverage) }}
                </span>
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
          @click="handleClose"
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
          <i class="fas fa-sync-alt"></i>
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
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useToast } from '@/composables/useToast';

const { showToast } = useToast();

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'add-product']);

// 처리 상태
const isProcessing = ref(false);

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
  '국민연금',
  '삼성자산운용',
  '미래에셋자산운용',
  'KB자산운용',
];

// 카테고리별 세부 카테고리 매핑
const subcategoryMapping = {
  예금: ['정기예금', '자유예금', '기업예금', 'CMA'],
  적금: ['정기적금', '자유적금', '펀드적금', '연금적금'],
  보험: ['종신보험', '정기보험', '연금보험', '변액보험'],
  연금: ['연금저축', '개인연금', 'IRP', 'DC형'],
  주식: ['국내주식', '해외주식', 'ETF', 'ETN'],
  기타: ['부동산', '채권', '금', '암호화폐', '기타투자'],
};

// 상품군별 필드 설정
const productFieldConfig = {
  예금: {
    required: ['customProductName', 'customCompanyName', 'amount', 'customRate'],
    hidden: [],
    labels: {
      amount: '예치금액',
      customRate: '연 금리 (%)',
      saveTrm: '예치 기간 (개월)',
    },
  },
  적금: {
    required: ['customProductName', 'customCompanyName', 'amount', 'customRate', 'saveTrm'],
    hidden: [],
    labels: {
      amount: '월 적립금액',
      customRate: '연 금리 (%)',
      saveTrm: '적립 기간 (개월)',
    },
  },
  보험: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: ['customRate'],
    labels: {
      amount: '월 보험료',
      saveTrm: '납입 기간 (개월)',
    },
  },
  연금: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: [],
    labels: {
      amount: '월 납입금액',
      saveTrm: '납입 기간 (개월)',
    },
  },
  주식: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: ['customRate', 'saveTrm'],
    labels: {
      amount: '투자금액',
    },
  },
  기타: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: [],
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

// 폼 데이터 (기존 필드명 유지)
const formData = ref({
  customProductName: '',
  customCompanyName: '',
  category: '',
  subcategory: '',
  amount: null,
  customRate: null,
  saveTrm: null,
  joinDate: todayDate,
  memo: '',
  // 주식 관련 (기존 riskLevel 필드 재활용)
  currentPrice: null, // riskLevel 대신 사용
  quantity: null, // 새 필드
  marketType: '', // 새 필드
  // 보험 관련
  coverage: null, // 새 필드
  beneficiary: '', // 새 필드
  // 연금 관련
  pensionType: '', // 새 필드
  taxBenefit: '', // 새 필드
});

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
    // 기본 라벨
    const defaultLabels = {
      amount: '투자금액',
      customRate: '연 금리 (%)',
      saveTrm: '저축 기간 (개월)',
    };
    return defaultLabels[fieldName] || fieldName;
  }
  return config.labels[fieldName];
};

// 폼 유효성 검사
const isFormValid = computed(() => {
  const config = productFieldConfig[formData.value.category];
  if (!config) return false;

  // 필수 필드 검사
  return config.required.every((field) => {
    const value = formData.value[field];
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined && value > 0;
  });
});

// 미리보기 표시 여부
const canShowPreview = computed(() => {
  return (
    formData.value.amount > 0 &&
    (formData.value.customRate > 0 ||
      formData.value.saveTrm > 0 ||
      formData.value.joinDate ||
      (formData.value.category === '주식' &&
        formData.value.currentPrice &&
        formData.value.quantity) ||
      (formData.value.category === '보험' && formData.value.coverage))
  );
});

// 통화 포맷팅
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '0원';
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
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

// 예상 이자 계산
const calculateEstimatedInterest = () => {
  if (!formData.value.amount || !formData.value.customRate || !formData.value.saveTrm) return 0;
  const principal = formData.value.amount;
  const rate = formData.value.customRate / 100;
  const months = formData.value.saveTrm;
  const futureValue = principal * Math.pow(1 + rate / 12, months);
  return Math.round(futureValue - principal);
};

// 만기일 계산
const calculateMaturityDate = () => {
  if (!formData.value.joinDate || !formData.value.saveTrm) return '';
  const joinDate = new Date(formData.value.joinDate);
  const maturityDate = new Date(joinDate);
  maturityDate.setMonth(maturityDate.getMonth() + formData.value.saveTrm);
  return maturityDate.toLocaleDateString('ko-KR');
};

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

// 폼 초기화
const resetForm = () => {
  formData.value = {
    customProductName: '',
    customCompanyName: '',
    category: '',
    subcategory: '',
    amount: null,
    customRate: null,
    saveTrm: null,
    joinDate: todayDate,
    memo: '',
    currentPrice: null,
    quantity: null,
    marketType: '',
    coverage: null,
    beneficiary: '',
    pensionType: '',
    taxBenefit: '',
  };
};

// 오버레이 클릭 처리
const handleOverlayClick = () => {
  if (!isProcessing.value) {
    handleClose();
  }
};

// 모달 닫기
const handleClose = () => {
  if (!isProcessing.value) {
    emit('close');
    resetForm();
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
    기타: 'MEDIUM',
  };
  return riskMapping[category] || 'MEDIUM';
};

// 폼 제출
const handleSubmit = async () => {
  if (!isFormValid.value || isProcessing.value) return;

  isProcessing.value = true;

  try {
    // API 명세에 맞는 데이터 구조로 변환
    const newProduct = {
      amount: formData.value.amount,
      category: formData.value.category,
      customCompanyName: formData.value.customCompanyName.trim(),
      customProductName: formData.value.customProductName.trim(),
      subcategory: formData.value.subcategory || null,

      // 금리 관련 - 상품에 따라 다른 필드 사용
      customRate: formData.value.customRate || null,
      interestRate: formData.value.customRate || null, // API에서 요구하는 필드
      expectedReturn: (() => {
        // 상품별로 다른 expectedReturn 계산
        if (
          formData.value.category === '주식' &&
          formData.value.currentPrice &&
          formData.value.quantity
        ) {
          // 주식: 현재가 대비 투자금액 차이를 수익률로 계산
          const totalValue = formData.value.currentPrice * formData.value.quantity;
          return formData.value.amount > 0
            ? ((totalValue - formData.value.amount) / formData.value.amount) * 100
            : null;
        } else if (formData.value.category === '기타' && formData.value.customRate) {
          // 기타: 입력한 수익률 사용
          return formData.value.customRate;
        } else if (
          ['예금', '적금'].includes(formData.value.category) &&
          formData.value.customRate
        ) {
          // 예금/적금: 금리를 수익률로 사용
          return formData.value.customRate;
        }
        return null;
      })(),

      // 기간 관련
      saveTrm: formData.value.saveTrm || null,
      joinDate: formData.value.joinDate || null,
      maturityDate: (() => {
        if (formData.value.joinDate && formData.value.saveTrm) {
          const joinDate = new Date(formData.value.joinDate);
          const maturityDate = new Date(joinDate);
          maturityDate.setMonth(maturityDate.getMonth() + formData.value.saveTrm);
          return maturityDate.toISOString().split('T')[0];
        }
        return null;
      })(),

      // 위험도 자동 설정
      riskLevel: getRiskLevel(formData.value.category),

      // 메모에 추가 정보 포함
      memo: (() => {
        let memo = formData.value.memo.trim();

        // 상품별 특수 정보를 메모에 추가
        const additionalInfo = [];

        if (formData.value.category === '주식') {
          if (formData.value.currentPrice)
            additionalInfo.push(`현재가: ${formData.value.currentPrice.toLocaleString()}원`);
          if (formData.value.quantity)
            additionalInfo.push(`보유수량: ${formData.value.quantity}주`);
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

    emit('add-product', newProduct);
    showToast('저장되었습니다!', 'success');
    resetForm();
  } catch (error) {
    showToast('저장에 실패했습니다.', 'error');
  } finally {
    isProcessing.value = false;
  }
};

// ESC 키로 모달 닫기
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.isVisible && !isProcessing.value) {
    handleClose();
  }
};

// 이벤트 리스너 등록/해제
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 모달이 열릴 때 스크롤 방지
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);
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
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem; /* 16px */
  box-shadow: 0 1.25rem 3.75rem rgba(0, 0, 0, 0.3); /* 0 20px 60px */
  max-width: 26.875rem; /* 430px */
  width: 100%;
  max-height: 80svh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column; /* 플렉스 컨테이너로 만들기 */
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem; /* 16px */
  border-bottom: 0.0625rem solid rgba(185, 187, 204, 0.2); /* 1px */
  background: rgba(255, 255, 255, 0.8);
  flex-shrink: 0; /* 헤더 크기 고정 */
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 8px */
  font-size: 0.875rem; /* 14px */
  font-weight: 700;
  color: var(--color-main);
}

.modal-title i {
  color: var(--color-sub);
  font-size: 0.75rem; /* 12px */
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
}

.modal-close:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  transform: scale(1.1);
}

/* 모달 바디 */
.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 180px);
}

.modal-subtitle {
  color: var(--color-sub);
  font-size: 0.75rem; /* 12px */
  margin-bottom: 1rem; /* 16px */
  text-align: center;
}

.add-form {
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
  gap: 1rem; /* 8px */
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
  min-height: 4rem; /* 64px */
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-with-unit .form-input {
  padding-right: 2rem; /* 32px */
}

.input-unit {
  position: absolute;
  right: 0.75rem; /* 12px */
  color: var(--color-sub);
  font-size: 0.75rem; /* 12px */
  font-weight: 500;
  pointer-events: none;
}

.character-count {
  font-size: 0.625rem; /* 10px */
  color: var(--color-sub);
  text-align: right;
  margin-top: 0.25rem; /* 4px */
}

/* 미리보기 섹션 */
.preview-section {
  margin-top: 1rem; /* 16px */
  padding: 1rem; /* 16px */
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.05), rgba(125, 129, 162, 0.05));
  border-radius: 0.75rem; /* 12px */
  border: 0.0625rem solid rgba(185, 187, 204, 0.2); /* 1px */
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.25rem; /* 4px */
  font-size: 0.75rem; /* 12px */
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.75rem; /* 12px */
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* 8px */
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem; /* 8px */
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem; /* 8px */
}

.preview-label {
  font-size: 0.75rem; /* 12px */
  color: var(--color-sub);
  font-weight: 500;
}

.preview-value {
  font-size: 0.8125rem; /* 13px */
  font-weight: 600;
  color: var(--color-main);
}

.preview-value.profit {
  color: #10b981;
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
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-container,
  .modal-btn,
  .form-input {
    animation: none;
    transition: none;
  }
}

/* 포커스 상태 */
.modal-btn:focus,
.form-input:focus {
  outline: 0.125rem solid var(--color-main); /* 2px */
  outline-offset: 0.125rem; /* 2px */
}
</style>
