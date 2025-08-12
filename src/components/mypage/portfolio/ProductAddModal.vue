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
        <!-- 서브타이틀 -->
        <div class="modal-subtitle with-help">새로운 투자 상품을 포트폴리오에 추가해보세요</div>

        <form class="add-form" @submit.prevent="handleSubmit">
          <div class="form-grid">
            <!-- 상품명 -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-tag"></i>
                상품명
              </label>
              <div class="input-with-auto">
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
            </div>

            <!-- 회사명 -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fas fa-building"></i>
                금융회사
              </label>

              <!-- 인풋 + 자동입력 + 도움말 -->
              <div class="input-with-auto tooltip-host">
                <input
                  v-model="formData.customCompanyName"
                  type="text"
                  class="form-input"
                  placeholder="예: 국민은행"
                  required
                  maxlength="50"
                  list="company-suggestions"
                />

                <button
                  type="button"
                  class="auto-fill-btn big"
                  :disabled="isAutoFilling || !canAutoFill"
                  :title="autoFillHint"
                  aria-label="자동입력"
                  @click="autoFillProduct"
                >
                  {{ isAutoFilling ? '검색중...' : '자동입력' }}
                </button>

                <!-- 도움말 버튼 -->
                <button
                  type="button"
                  class="info-btn"
                  aria-describedby="auto-fill-help"
                  @mouseenter="showHelp = true"
                  @mouseleave="showHelp = false"
                  @focus="showHelp = true"
                  @blur="showHelp = false"
                >
                  <i class="fas fa-question-circle"></i>
                </button>

                <!-- 툴팁 (회사명 라인의 버튼 옆) -->
                <div id="auto-fill-help" class="tooltip" role="tooltip" :class="{ show: showHelp }">
                  <div class="tooltip-title">자동입력 사용 안내</div>
                  <ul>
                    <li><b>상품명, 금융회사, 카테고리, 세부 카테고리</b>를 입력하면 활성화돼요.</li>
                    <li>기간/우대금리 옵션 선택 시 적용 금리가 자동 계산돼요.</li>
                    <li>“적용하기”를 누르면 폼에 값이 채워집니다.</li>
                  </ul>
                  <div class="tooltip-foot">※ 실제 금리는 금융사 정책에 따라 달라질 수 있어요.</div>
                </div>
              </div>

              <!-- datalist (한 번만 선언) -->
              <datalist id="company-suggestions">
                <option v-for="company in companySuggestions" :key="company" :value="company">
                  {{ company }}
                </option>
              </datalist>
            </div>
            <!-- AI 자동입력 결과 표시 -->
            <div v-if="autoFillResult && isCategoryReady" class="auto-fill-result full-width">
              <div class="result-header">
                <i class="fas fa-robot"></i>
                <span>AI가 찾은 상품 정보</span>
                <button class="apply-btn" @click="applyAutoFill">적용하기</button>
                <button class="clear-btn" @click="clearAutoFill">×</button>
              </div>

              <div class="result-content">
                <div class="result-grid">
                  <div class="result-item">
                    <span class="result-label">카테고리</span>
                    <span class="result-value">{{ autoFillResult.category }}</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">기본 금리</span>
                    <span class="result-value">{{ autoFillResult.baseRate }}%</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">최고 금리</span>
                    <span class="result-value highlight">{{ autoFillResult.maxRate }}%</span>
                  </div>
                  <div class="result-item">
                    <span class="result-label">계약 기간</span>
                    <span class="result-value">{{ autoFillResult.termMonths }}개월</span>
                  </div>
                  <div v-if="autoFillResult.minAmount" class="result-item">
                    <span class="result-label">최소 납입</span>
                    <span class="result-value">{{ formatCurrency(autoFillResult.minAmount) }}</span>
                  </div>
                  <div v-if="autoFillResult.maxAmount" class="result-item">
                    <span class="result-label">최대 납입</span>
                    <span class="result-value">{{ formatCurrency(autoFillResult.maxAmount) }}</span>
                  </div>
                  <div
                    v-if="autoFillResult.termOptions?.length"
                    class="result-item"
                    style="display: block"
                  >
                    <span class="result-label">기간 선택</span>
                    <div style="margin-top: 0.5rem">
                      <label
                        v-for="opt in autoFillResult.termOptions"
                        :key="opt.months"
                        style="
                          margin-right: 0.5rem;
                          display: inline-flex;
                          align-items: center;
                          gap: 0.35rem;
                        "
                      >
                        <input v-model="selectedTermMonths" type="radio" :value="opt.months" />
                        {{ opt.description || opt.months + '개월' }}
                        <span v-if="opt.interestRate">
                          ({{ Number(opt.interestRate).toFixed(1) }}%)
                        </span>
                      </label>
                    </div>
                  </div>

                  <!-- ✅ 우대금리 선택 -->
                  <div
                    v-if="autoFillResult.rateOptions?.length"
                    class="result-item"
                    style="display: block"
                  >
                    <span class="result-label">우대금리 선택</span>
                    <div class="features-list" style="margin-top: 0.5rem">
                      <label
                        v-for="opt in autoFillResult.rateOptions"
                        :key="opt.condition"
                        class="feature-tag"
                        style="display: inline-flex; align-items: center; gap: 6px; cursor: pointer"
                        :title="opt.description"
                      >
                        <input v-model="selectedRateKeys" type="checkbox" :value="opt.condition" />
                        {{ opt.condition }} (+{{ Number(opt.rate).toFixed(1) }}%p)
                      </label>
                    </div>
                  </div>

                  <!-- ✅ 적용 금리 미리보기 -->
                  <div class="result-item">
                    <span class="result-label">적용 금리</span>
                    <span class="result-value highlight">{{ effectiveRate }}%</span>
                  </div>
                </div>

                <div v-if="autoFillResult.features" class="result-features">
                  <span class="features-label">주요 특징:</span>
                  <div class="features-list">
                    <span
                      v-for="feature in autoFillResult.features"
                      :key="feature"
                      class="feature-tag"
                    >
                      {{ feature }}
                    </span>
                  </div>
                </div>

                <div v-if="autoFillResult.note" class="result-note">
                  <i class="fas fa-info-circle"></i>
                  {{ autoFillResult.note }}
                </div>
              </div>
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
/* =========================
 * Imports & basic wiring
 * ========================= */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useToast } from '@/composables/useToast';
import { portfolioAPI } from '../../../api/portfolio';

const { showToast } = useToast();
const props = defineProps({
  isVisible: { type: Boolean, default: false },
});

const emit = defineEmits(['close', 'add-product']);
const showHelp = ref(false);

/* =========================
 * Constants / static data
 * ========================= */
const isProcessing = ref(false);
const todayDate = new Date().toISOString().split('T')[0];

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

const subcategoryMapping = {
  예금: ['정기예금', '자유예금', '기업예금', 'CMA'],
  적금: ['정기적금', '자유적금', '펀드적금', '연금적금'],
  보험: ['종신보험', '정기보험', '연금보험', '변액보험'],
  연금: ['연금저축', '개인연금', 'IRP', 'DC형'],
  주식: ['국내주식', '해외주식', 'ETF', 'ETN'],
  기타: ['부동산', '채권', '금', '암호화폐', '기타투자'],
};

const productFieldConfig = {
  예금: {
    required: ['customProductName', 'customCompanyName', 'amount', 'customRate'],
    hidden: [],
    labels: { amount: '예치금액', customRate: '연 금리 (%)', saveTrm: '예치 기간 (개월)' },
  },
  적금: {
    required: ['customProductName', 'customCompanyName', 'amount', 'customRate', 'saveTrm'],
    hidden: [],
    labels: { amount: '월 적립금액', customRate: '연 금리 (%)', saveTrm: '적립 기간 (개월)' },
  },
  보험: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: ['customRate'],
    labels: { amount: '월 보험료', saveTrm: '납입 기간 (개월)' },
  },
  연금: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: [],
    labels: { amount: '월 납입금액', saveTrm: '납입 기간 (개월)' },
  },
  주식: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: ['customRate', 'saveTrm'],
    labels: { amount: '투자금액' },
  },
  기타: {
    required: ['customProductName', 'customCompanyName', 'amount'],
    hidden: [],
    labels: { amount: '투자금액', customRate: '예상 수익률 (%)', saveTrm: '투자 기간 (개월)' },
  },
};

/* =========================
 * Core form state (declare BEFORE any computed/watch using it)
 * ========================= */
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
  // 주식 관련
  currentPrice: null,
  quantity: null,
  marketType: '',
  // 보험 관련
  coverage: null,
  beneficiary: '',
  // 연금 관련
  pensionType: '',
  taxBenefit: '',
});

/* =========================
 * Derived state
 * ========================= */
const availableSubcategories = computed(() => subcategoryMapping[formData.value?.category] || []);
const isCategoryReady = computed(() => {
  return !!formData.value?.category && !!formData.value?.subcategory;
});

const autoFillRequirements = computed(() => {
  const missing = [];
  if (!(formData.value?.customProductName || '').trim()) missing.push('상품명');
  if (!(formData.value?.customCompanyName || '').trim()) missing.push('금융회사');
  if (!formData.value?.category) missing.push('카테고리');
  if (!formData.value?.subcategory) missing.push('세부 카테고리');
  return {
    ready: missing.length === 0,
    missing,
    message: missing.length ? `${missing.join(', ')} 입력 필요` : '자동입력 가능',
  };
});

const canAutoFill = computed(() => autoFillRequirements.value.ready);

const autoFillHint = computed(() =>
  autoFillRequirements.value.ready ? 'AI로 자동입력' : autoFillRequirements.value.message
);

const isFormValid = computed(() => {
  const cfg = productFieldConfig[formData.value.category];
  if (!cfg) return false;
  return cfg.required.every((field) => {
    const v = formData.value[field];
    if (typeof v === 'string') return v.trim().length > 0;
    return v !== null && v !== undefined && Number(v) > 0;
  });
});

const canShowPreview = computed(() => {
  return (
    Number(formData.value.amount) > 0 &&
    (Number(formData.value.customRate) > 0 ||
      Number(formData.value.saveTrm) > 0 ||
      !!formData.value.joinDate ||
      (formData.value.category === '주식' &&
        Number(formData.value.currentPrice) > 0 &&
        Number(formData.value.quantity) > 0) ||
      (formData.value.category === '보험' && Number(formData.value.coverage) > 0))
  );
});

/* =========================
 * Auto-fill (API) state
 * ========================= */
const isAutoFilling = ref(false);
const isApplyingAutoFill = ref(false);
const autoFillResult = ref(null); // 변환된 결과 객체
const selectedTermMonths = ref(null); // 12,24,36...
const selectedRateKeys = ref([]); // ['급여이체우대', ...]

// autoFillResult 변경 시 선택 기본값 세팅
watch(autoFillResult, (val) => {
  if (!val) {
    selectedTermMonths.value = null;
    selectedRateKeys.value = [];
    return;
  }
  const monthsList = val.termOptions?.map((o) => o.months) || [];
  if (val.termMonths) selectedTermMonths.value = val.termMonths;
  else if (monthsList.length) selectedTermMonths.value = monthsList[0];
  else selectedTermMonths.value = null;
  selectedRateKeys.value = []; // 기본 미선택
});

const baseRateForTerm = computed(() => {
  const opts = autoFillResult.value?.termOptions || [];
  const sel = Number(selectedTermMonths.value);
  const found = opts.find((o) => Number(o.months) === sel);
  const rate = found?.interestRate;
  // 기간 금리가 정의돼 있으면 그걸, 없으면 기본금리
  return Number.isFinite(rate) ? Number(rate) : Number(autoFillResult.value?.baseRate) || 0;
});

// 선택 우대금리 합계(%p) - 기존 그대로
const selectedRateBonus = computed(() => {
  if (!autoFillResult.value?.rateOptions?.length) return 0;
  const map = new Map(
    autoFillResult.value.rateOptions.map((o) => [o.condition, Number(o.rate) || 0])
  );
  return (selectedRateKeys.value || []).reduce((sum, key) => sum + (map.get(key) || 0), 0);
});

// 최종 적용 금리(기본 + 선택 우대)
const effectiveRate = computed(() => {
  const base = baseRateForTerm.value; // ← 변경 포인트
  const bonus = selectedRateBonus.value || 0;
  const raw = base + bonus;
  const cap = Number(autoFillResult.value?.maxRate);
  const final = Number.isFinite(cap) ? Math.min(raw, cap) : raw;
  return Math.round(final * 100) / 100; // 소수 둘째 자리 반올림
});

/* =========================
 * Helpers
 * ========================= */
const formatCurrency = (amount) => {
  const n = Number(amount) || 0;
  if (n === 0) return '0원';
  if (n >= 100000000) {
    const eok = Math.floor(n / 100000000);
    const rem = n % 100000000;
    if (rem === 0) return `${eok}억원`;
    const man = Math.floor(rem / 10000);
    return `${eok}억 ${man}만원`;
  }
  if (n >= 10000) {
    const man = Math.floor(n / 10000);
    const rem = n % 10000;
    if (rem === 0) return `${man}만원`;
    return `${man}만 ${rem.toLocaleString()}원`;
  }
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
};

const calculateEstimatedInterest = () => {
  const principal = Number(formData.value.amount) || 0;
  const rate = (Number(formData.value.customRate) || 0) / 100;
  const months = Number(formData.value.saveTrm) || 0;
  if (!principal || !rate || !months) return 0;
  const futureValue = principal * Math.pow(1 + rate / 12, months);
  return Math.round(futureValue - principal);
};

const calculateMaturityDate = () => {
  if (!formData.value.joinDate || !formData.value.saveTrm) return '';
  const joinDate = new Date(formData.value.joinDate);
  const maturityDate = new Date(joinDate);
  maturityDate.setMonth(maturityDate.getMonth() + Number(formData.value.saveTrm));
  return maturityDate.toLocaleDateString('ko-KR');
};

const shouldShowField = (fieldName) => {
  const cfg = productFieldConfig[formData.value.category];
  if (!cfg) return true;
  return !cfg.hidden.includes(fieldName);
};

const isRequiredField = (fieldName) => {
  const cfg = productFieldConfig[formData.value.category];
  if (!cfg) return false;
  return cfg.required.includes(fieldName);
};

const getFieldLabel = (fieldName) => {
  const cfg = productFieldConfig[formData.value.category];
  if (!cfg || !cfg.labels || !cfg.labels[fieldName]) {
    const defaults = { amount: '투자금액', customRate: '연 금리 (%)', saveTrm: '저축 기간 (개월)' };
    return defaults[fieldName] || fieldName;
  }
  return cfg.labels[fieldName];
};

const getRiskLevel = (category) => {
  const m = { 예금: 'LOW', 적금: 'LOW', 보험: 'LOW', 연금: 'MEDIUM', 주식: 'HIGH', 기타: 'MEDIUM' };
  return m[category] || 'MEDIUM';
};

/* =========================
 * Auto-fill (API) functions
 * ========================= */
const transformApiDataToUIFormat = (apiData) => {
  const normalizedTerms = (apiData.termOptions || []).map((opt) => ({
    months: Number(opt.months),
    interestRate: opt.interestRate != null ? Number(opt.interestRate) : null,
    description: opt.description || `${opt.months}개월`,
  }));

  const normalizedRates = (apiData.rateOptions || [])
    .filter((opt) => opt.condition !== '기본금리') // 기본금리 제외
    .map((opt) => ({
      condition: String(opt.condition),
      rate: Number(opt.rate), // %p
      description: opt.description || '',
    }));

  const recommendedTermOption =
    normalizedTerms.find((o) => o.months === apiData.recommendedTerm) || normalizedTerms[0];

  const features = normalizedRates.map((o) => `${o.condition} ${o.rate}%p`);
  let additionalFeatures = [];
  if (apiData.rawResponse) {
    try {
      const rawData = JSON.parse(apiData.rawResponse);
      if (Array.isArray(rawData.features)) additionalFeatures = rawData.features;
    } catch (e) {
      console.warn('rawResponse 파싱 실패:', e);
    }
  }

  return {
    productName: apiData.customProductName || '상품명 확인 필요',
    companyName: apiData.customCompanyName || '회사명 확인 필요',
    category: apiData.category,
    subcategory: apiData.subcategory,

    baseRate: apiData.baseRate,
    maxRate: apiData.maxRate,

    termMonths: recommendedTermOption?.months || apiData.recommendedTerm,

    minAmount: apiData.minAmount,
    maxAmount: apiData.maxAmount,
    amountType: apiData.amountType,

    riskLevel: apiData.riskLevel,

    features: [...features, ...additionalFeatures],
    note: apiData.memo || `기본금리 ${apiData.baseRate}%, 최고금리 ${apiData.maxRate}%`,
    confidence: apiData.confidence,

    termOptions: normalizedTerms,
    rateOptions: normalizedRates,

    originalData: apiData,
  };
};

const isValidApiResponse = (res) =>
  !!(res && res.header?.status === 'OK' && res.body?.data?.success);

const autoFillProduct = async () => {
  if (!canAutoFill.value || isAutoFilling.value) return;
  isAutoFilling.value = true;

  try {
    // ref 자체를 전달 (API 구현이 formData.value를 내부에서 읽음)
    const apiResponse = await portfolioAPI.getProductInfo(formData);
    console.log(apiResponse);

    if (!isValidApiResponse(apiResponse)) {
      throw new Error('유효하지 않은 응답');
    }

    const data = apiResponse.body.data;
    const transformed = transformApiDataToUIFormat(data);

    if (Number(transformed.confidence) > 0.7) {
      autoFillResult.value = transformed;
      showToast('상품 정보를 찾았습니다! 🎉', 'success');
    } else {
      autoFillResult.value = {
        ...transformed,
        note: '정확하지 않을 수 있습니다. 직접 확인 후 수정해주세요.',
      };
      showToast('정확한 정보를 찾지 못했습니다. 😅', 'warning');
    }
  } catch (err) {
    console.error('자동입력 실패:', err);
    autoFillResult.value = null;
    showToast('상품 정보를 가져올 수 없습니다. 😞', 'error');
  } finally {
    isAutoFilling.value = false;
  }
};

const clearAutoFill = () => {
  autoFillResult.value = null;
  selectedTermMonths.value = null;
  selectedRateKeys.value = [];
};

const applyAutoFill = () => {
  if (!autoFillResult.value) return;
  const r = autoFillResult.value;

  // 기본
  formData.value.category = r.category;
  formData.value.subcategory = r.subcategory;

  // 금리/기간 (선택 반영)
  formData.value.customRate = effectiveRate.value || r.maxRate || r.baseRate || null;
  formData.value.saveTrm = selectedTermMonths.value || r.termMonths || null;

  // 금액 기본값
  if (r.amountType === 'MONTHLY') formData.value.amount = r.maxAmount || 500000;
  else if (r.amountType === 'PREMIUM') formData.value.amount = r.minAmount || 50000;
  else formData.value.amount = r.minAmount || 1000000;

  // 주식 특수 처리
  if (r.category === '주식' && r.originalData) {
    const od = r.originalData;
    formData.value.currentPrice = Number(od.minAmount) || 0;
    formData.value.quantity = 1;
    formData.value.amount = formData.value.currentPrice || r.minAmount || 0;
    if (od.memo?.includes('코스피')) formData.value.marketType = '코스피';
    else if (od.memo?.includes('코스닥')) formData.value.marketType = '코스닥';
  }

  // 보험 특수 처리
  if (r.category === '보험' && r.originalData?.memo) {
    const m = r.originalData.memo.match(/사망보험금:\s*(\d+)원/);
    if (m) formData.value.coverage = Number(m[1]) || null;
  }

  // 메모 구성
  const features = r.features?.join(', ') || '';
  const note = r.note || '';
  let memoContent = note;
  if (features) memoContent += `\n\n[우대혜택]\n${features}`;
  if (r.originalData?.memo && r.originalData.memo !== note) {
    memoContent += `\n\n[상세정보]\n${r.originalData.memo}`;
  }
  formData.value.memo = memoContent;

  showToast('정보가 자동입력되었습니다! ✨', 'success');
  autoFillResult.value = null; // 적용 후 결과 카드 닫기
};

/* =========================
 * Category changes
 * ========================= */
watch(
  () => formData.value.category,
  (newCategory) => {
    // 자동입력 중/적용 중에는 건드리지 않음
    if (isAutoFilling.value || isApplyingAutoFill.value) return;

    // 세부 카테고리 유효성만 점검
    if (newCategory && !availableSubcategories.value.includes(formData.value.subcategory)) {
      formData.value.subcategory = '';
    }

    // 숨김 필드 초기화(기존 로직 유지)
    const cfg = productFieldConfig[newCategory];
    if (cfg?.hidden?.length) {
      if (cfg.hidden.includes('customRate')) formData.value.customRate = null;
      if (cfg.hidden.includes('saveTrm')) formData.value.saveTrm = null;
    }

    // 특수 필드 초기화(기존 로직 유지)
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

/* =========================
 * Submit / close / reset
 * ========================= */
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
  clearAutoFill();
};

const handleOverlayClick = () => {
  if (!isProcessing.value) handleClose();
};

const handleClose = () => {
  if (!isProcessing.value) {
    emit('close');
    resetForm();
  }
};

const handleSubmit = async () => {
  if (!isFormValid.value || isProcessing.value) return;
  isProcessing.value = true;

  try {
    const newProduct = {
      amount: formData.value.amount,
      category: formData.value.category,
      customCompanyName: formData.value.customCompanyName.trim(),
      customProductName: formData.value.customProductName.trim(),
      subcategory: formData.value.subcategory || null,
      customRate: formData.value.customRate || null,
      interestRate: formData.value.customRate || null,
      expectedReturn: (() => {
        if (
          formData.value.category === '주식' &&
          Number(formData.value.currentPrice) > 0 &&
          Number(formData.value.quantity) > 0
        ) {
          const totalValue = formData.value.currentPrice * formData.value.quantity;
          return formData.value.amount > 0
            ? ((totalValue - formData.value.amount) / formData.value.amount) * 100
            : null;
        } else if (formData.value.category === '기타' && formData.value.customRate) {
          return formData.value.customRate;
        } else if (
          ['예금', '적금'].includes(formData.value.category) &&
          formData.value.customRate
        ) {
          return formData.value.customRate;
        }
        return null;
      })(),
      saveTrm: formData.value.saveTrm || null,
      joinDate: formData.value.joinDate || null,
      maturityDate: (() => {
        if (formData.value.joinDate && formData.value.saveTrm) {
          const join = new Date(formData.value.joinDate);
          const mat = new Date(join);
          mat.setMonth(mat.getMonth() + Number(formData.value.saveTrm));
          return mat.toISOString().split('T')[0];
        }
        return null;
      })(),
      riskLevel: getRiskLevel(formData.value.category),
      memo: (() => {
        let memo = (formData.value.memo || '').trim();
        const add = [];
        if (formData.value.category === '주식') {
          if (formData.value.currentPrice)
            add.push(`현재가: ${formData.value.currentPrice.toLocaleString()}원`);
          if (formData.value.quantity) add.push(`보유수량: ${formData.value.quantity}주`);
          if (formData.value.marketType) add.push(`시장: ${formData.value.marketType}`);
        } else if (formData.value.category === '보험') {
          if (formData.value.coverage)
            add.push(`보장금액: ${formData.value.coverage.toLocaleString()}원`);
          if (formData.value.beneficiary) add.push(`수익자: ${formData.value.beneficiary}`);
        } else if (formData.value.category === '연금') {
          if (formData.value.pensionType) add.push(`연금종류: ${formData.value.pensionType}`);
          if (formData.value.taxBenefit) add.push(`세제혜택: ${formData.value.taxBenefit}`);
        }
        if (add.length)
          memo = memo
            ? `${memo}\n\n[추가정보]\n${add.join(', ')}`
            : `[추가정보]\n${add.join(', ')}`;
        return memo || null;
      })(),
    };

    // 실제 저장은 부모에서 처리 (@add-product)
    emit('add-product', newProduct);
    showToast('저장되었습니다!', 'success');
    resetForm();
  } catch (e) {
    showToast('저장에 실패했습니다.', 'error');
  } finally {
    isProcessing.value = false;
  }
};

/* =========================
 * Lifecycle / listeners
 * ========================= */
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.isVisible && !isProcessing.value) handleClose();
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

watch(
  () => props.isVisible,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : '';
  }
);
watch([() => formData.value.category, () => formData.value.subcategory], () => {
  if (isAutoFilling.value || isApplyingAutoFill.value) return;
  autoFillResult.value = null;
  selectedTermMonths.value = null;
  selectedRateKeys.value = [];
});
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
} /* ===== 자동입력(자동완성) 입력 UI ===== */
.input-with-auto {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.input-with-auto .form-input {
  flex: 1;
  min-width: 0;
}

.auto-fill-btn.big {
  padding: 0.5rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.6rem;
}

.auto-fill-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auto-fill-btn.big:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.15);
}
/* ===== AI 자동입력 결과 카드 ===== */
.auto-fill-result {
  grid-column: 1 / -1;
  border: 1px solid rgba(185, 187, 204, 0.35);
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.04), rgba(125, 129, 162, 0.04));
  overflow: hidden;
}

.auto-fill-result .result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
  padding: 0.75rem 0.875rem;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(185, 187, 204, 0.25);
}

.result-header i {
  color: var(--color-sub, #7d81a2);
}

.result-header > span {
  margin-right: auto;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-main, #2d336b);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.result-header .apply-btn,
.result-header .clear-btn {
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 0.4rem 0.6rem;
}

.result-header .apply-btn {
  background: var(--color-main, #2d336b);
  color: #fff;
}

.result-header .apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(45, 51, 107, 0.25);
}

.result-header .clear-btn {
  background: transparent;
  color: var(--color-sub, #7d81a2);
  padding: 0.25rem 0.5rem;
}

.result-header .clear-btn:hover {
  background: rgba(185, 187, 204, 0.15);
}

/* 결과 내용 */
.auto-fill-result .result-content {
  padding: 0.75rem 0.875rem 0.9rem;
  display: grid;
  gap: 0.75rem;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.result-item {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(185, 187, 204, 0.25);
  border-radius: 0.5rem;
  padding: 0.55rem 0.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.result-label {
  color: var(--color-sub, #7d81a2);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.result-value {
  color: var(--color-main, #2d336b);
  font-size: 0.85rem;
  font-weight: 700;
}

.result-value.highlight {
  color: #10b981; /* 최고 금리 강조 */
}

/* 특징(태그) 영역 */
.result-features {
  display: grid;
  gap: 0.4rem;
}

.features-label {
  color: var(--color-sub, #7d81a2);
  font-size: 0.75rem;
  font-weight: 600;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.feature-tag {
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.08);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
  font-size: 0.72rem;
  font-weight: 700;
}

/* 참고/노트 */
.result-note {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.55rem 0.6rem;
  background: rgba(59, 130, 246, 0.06);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 0.5rem;
  color: #1d4ed8;
  font-size: 0.78rem;
}

.result-note i {
  margin-top: 0.05rem;
}

/* ===== 작은 UX 보완들 ===== */

/* select와 input의 disabled 시각 보완 */
.form-input:disabled,
.form-select:disabled {
  background: rgba(245, 246, 250, 0.9);
  color: rgba(125, 129, 162, 0.8);
}

/* datalist 화살표 간격 최소화 (브라우저별 차이 완화) */
input[list]::-webkit-calendar-picker-indicator {
  opacity: 0.6;
}

/* 숫자 입력에서 스핀 버튼 정리 (크롬/엣지) */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* 파이어폭스 */
input[type='number'] {
  -moz-appearance: textfield;
}

/* 저장 버튼 로딩 스핀 아이콘 미세 정렬 */
.save-btn .spin {
  margin-left: 0.1rem;
}
/* ===== 옵션 선택 UI (기간/우대금리) 자연스러운 스타일 ===== */

/* 라디오/체크박스 기본 색상을 테마 컬러로 */
.auto-fill-result .result-item input[type='radio'],
.auto-fill-result .result-item input[type='checkbox'] {
  accent-color: var(--color-main);
}

/* 기간 선택 라벨(라디오)도 pill 형태로 */
.auto-fill-result .result-item label {
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(185, 187, 204, 0.35);
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-main);
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

/* 호버 시 살짝 떠오르게 */
.auto-fill-result .result-item label:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(45, 51, 107, 0.12);
}

/* 체크/선택된 라벨 하이라이트 (브라우저가 :has 지원 시 적용) */
@supports selector(:has(*)) {
  .auto-fill-result .result-item label:has(input:checked) {
    background: rgba(45, 51, 107, 0.08);
    border-color: rgba(45, 51, 107, 0.35);
  }
}

/* 우대금리 태그(label.feature-tag) 미세 조정 */
.auto-fill-result .result-item .feature-tag {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #059669;
}
@supports selector(:has(*)) {
  .auto-fill-result .result-item .feature-tag:has(input:checked) {
    background: rgba(16, 185, 129, 0.14);
    border-color: rgba(16, 185, 129, 0.5);
  }
}

/* 적용 금리 행을 조금 더 강조 */
.auto-fill-result .result-item:last-child {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(16, 185, 129, 0.03));
  border-color: rgba(16, 185, 129, 0.25);
}

/* 카드 내 옵션 영역 여백/정렬 개선 */
.auto-fill-result .result-item[style*='display: block'] {
  align-items: flex-start;
}
.auto-fill-result .result-item[style*='display: block'] > div {
  margin-top: 0.5rem;
}

.auto-hint {
  font-size: 0.78rem;
  color: var(--color-sub);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.35rem;
}
/* 성공/경고/에러 토스트가 있을 때(가정) 색상 가이드 */
:root,
:host {
  --color-white: #ffffff;
  --color-bg-light: #f8f9fc;
  --color-main: #2d336b; /* 남색 톤 */
  --color-sub: #7d81a2; /* 보조 그레이시 퍼플 */
  --color-light: #9aa0b4; /* 라이트 버튼 */
}
/* 서브타이틀 + 도움말 */
.modal-subtitle.with-help {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

/* 작은 원형 버튼 느낌 */
.info-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem; /* 20px */
  height: 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(185, 187, 204, 0.4);
  background: #fff;
  color: var(--color-sub);
  font-size: 0.9rem;
  cursor: help;
  transition: all 0.2s ease;
}
.info-btn:hover,
.info-btn:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.12);
  color: var(--color-main);
}

/* 툴팁 */
.tooltip {
  position: absolute;
  top: 100%;
  right: -10%;
  margin-top: 0.5rem;
  width: min(28rem, 90vw);
  padding: 0.75rem 0.85rem;
  background: #fff;
  border: 1px solid rgba(185, 187, 204, 0.35);
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  color: var(--color-main);
  font-size: 0.78rem;
  line-height: 1.45;
  z-index: 1001;

  /* 기본은 숨김 */
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

/* 화살표 */
.tooltip::before {
  content: '';
  position: absolute;
  right: 0.85rem;
  top: -6px;
  width: 10px;
  height: 10px;
  background: #fff;
  border-left: 1px solid rgba(185, 187, 204, 0.35);
  border-top: 1px solid rgba(185, 187, 204, 0.35);
  transform: rotate(45deg);
}

/* 보이기 상태 */
.tooltip.show {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.tooltip-title {
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
}

.tooltip ul {
  margin: 0.25rem 0 0.4rem;
  padding-left: 1rem;
}
.tooltip li {
  margin: 0.15rem 0;
  color: var(--color-sub);
}

.tooltip-foot {
  font-size: 0.72rem;
  color: var(--color-sub);
  border-top: 1px dashed rgba(185, 187, 204, 0.4);
  margin-top: 0.35rem;
  padding-top: 0.35rem;
}

.input-with-auto.tooltip-host {
  position: relative;
  overflow: visible; /* 혹시 잘릴 일 방지 */
}
</style>
