<template>
  <div class="deposit-search-form">
    <div class="form-title">
      <h2>정기예금</h2>
      <div class="title-description">원하는 조건으로 정기예금 상품을 찾아보세요</div>
    </div>
    <div class="filter-container">
      <form @submit.prevent="onSearch">
        <!-- 예치 금액 입력 -->
        <div class="form-group">
          <label class="filter-label"> <i class="fa-solid fa-coins"></i> 예치 금액 </label>
          <div class="input-wrapper">
            <input
              type="text"
              v-model="localDepositAmount"
              class="form-input"
              @input="formatAmount"
              placeholder="100,000"
              autocomplete="off"
              inputmode="numeric"
            />
            <span class="input-suffix">원</span>
          </div>
        </div>

        <!-- 기간 선택 -->
        <div class="form-group">
          <label class="filter-label"> <i class="fa-solid fa-calendar-alt"></i> 기간 </label>
          <div class="custom-select">
            <select v-model="localPeriod" class="select-input">
              <option value="1">1개월</option>
              <option value="3">3개월</option>
              <option value="6">6개월</option>
              <option value="12">12개월</option>
              <option value="24">24개월</option>
              <option value="36">36개월</option>
            </select>
            <i class="fa-solid fa-chevron-down select-arrow"></i>
          </div>
        </div>

        <!-- 금리 유형 -->
        <div class="form-group">
          <label class="filter-label"> <i class="fa-solid fa-percentage"></i> 금리 유형 </label>
          <div class="option-buttons">
            <button
              type="button"
              class="option-button"
              :class="{ active: localInterestType === 'S' }"
              @click="localInterestType = 'S'"
            >
              단리
            </button>
            <button
              type="button"
              class="option-button"
              :class="{ active: localInterestType === 'M' }"
              @click="localInterestType = 'M'"
            >
              복리
            </button>
          </div>
        </div>

        <!-- 가입 방식 -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-laptop"></i> 가입 방식
            <div
              class="filter-tag all-tag"
              :class="{ active: selectAllJoinWays }"
              @click="toggleAllJoinWays(!selectAllJoinWays)"
            >
              전체
            </div>
          </label>
          <div class="tag-container">
            <div
              v-for="way in availableJoinWays"
              :key="way"
              class="filter-tag"
              :class="{ active: selectedJoinWays.includes(way) }"
              @click="toggleJoinWay(way)"
            >
              {{ way }}
            </div>
          </div>
        </div>

        <!-- 은행 선택 -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-building-columns"></i> 은행 선택
          </label>
          <button type="button" class="bank-select-button" @click="openBankModal">
            <span>{{ getBankSelectionText() }}</span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <!-- 액션 버튼 -->
        <div class="action-buttons">
          <button type="button" @click="onReset" class="reset-btn">
            <i class="fa-solid fa-rotate"></i> 초기화
          </button>
          <button type="submit" class="search-btn"><i class="fa-solid fa-search"></i> 검색</button>
        </div>
      </form>
    </div>

    <!-- 은행 선택 모달 -->
    <BankSelectModal
      :show="showBankModal"
      :banks="banks"
      :initial-selected-banks="selectedBanks.uiCodes"
      @close="closeBankModal"
      @update:selected-banks="updateSelectedBanks"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import BankSelectModal from './BankSelectModal.vue';

const props = defineProps({
  depositAmount: { type: String, default: '100000' },
  period: { type: String, default: '6' },
  interestType: { type: String, default: 'S' },
  joinWay: { type: [String, Array], default: 'all' },
  banks: { type: Array, default: () => [] },
  selectedBanks: { type: Object, default: () => ({ uiCodes: [], apiCodes: [] }) },
});
const emit = defineEmits(['search', 'reset']);

const localDepositAmount = ref(props.depositAmount);
const localPeriod = ref(props.period);
const localInterestType = ref(props.interestType);

const availableJoinWays = ref(['영업점', '인터넷', '스마트폰', '전화']);
const selectedJoinWays = ref([]);
const selectAllJoinWays = ref(false);

onMounted(() => {
  if (props.joinWay === 'all') {
    selectedJoinWays.value = [...availableJoinWays.value];
    selectAllJoinWays.value = true;
  } else if (Array.isArray(props.joinWay)) {
    selectedJoinWays.value = [...props.joinWay];
    updateSelectAllState();
  } else if (props.joinWay && props.joinWay !== 'all') {
    selectedJoinWays.value = [props.joinWay];
    selectAllJoinWays.value = false;
  } else {
    selectedJoinWays.value = [...availableJoinWays.value];
    selectAllJoinWays.value = true;
  }
});

const toggleAllJoinWays = (state) => {
  selectAllJoinWays.value = state;
  selectedJoinWays.value = state ? [...availableJoinWays.value] : [];
};
const toggleJoinWay = (way) => {
  const idx = selectedJoinWays.value.indexOf(way);
  if (idx === -1) selectedJoinWays.value.push(way);
  else selectedJoinWays.value.splice(idx, 1);
  updateSelectAllState();
};
const updateSelectAllState = () => {
  selectAllJoinWays.value = selectedJoinWays.value.length === availableJoinWays.value.length;
};

// 은행 필터
const showBankModal = ref(false);
const selectedBanks = ref({
  uiCodes: props.selectedBanks.uiCodes || [],
  apiCodes: props.selectedBanks.apiCodes || [],
});
const selectedBankCount = computed(() => selectedBanks.value.uiCodes.length);
const isAllBanksSelected = computed(
  () => selectedBankCount.value > 0 && selectedBankCount.value === props.banks.length
);

const getBankSelectionText = () => {
  if (selectedBankCount.value === 0) return '은행을 선택해주세요';
  if (isAllBanksSelected.value) return '모든 은행';
  if (selectedBankCount.value <= 2) return selectedBanks.value.uiCodes.join(', ');
  return `${selectedBanks.value.uiCodes[0]} 외 ${selectedBankCount.value - 1}개`;
};

watch(
  () => props.depositAmount,
  (v) => (localDepositAmount.value = v)
);
watch(
  () => props.period,
  (v) => (localPeriod.value = v)
);
watch(
  () => props.interestType,
  (v) => (localInterestType.value = v)
);
watch(
  () => props.joinWay,
  (v) => {
    if (v === 'all') {
      selectedJoinWays.value = [...availableJoinWays.value];
      selectAllJoinWays.value = true;
    } else if (Array.isArray(v)) {
      selectedJoinWays.value = [...v];
      updateSelectAllState();
    } else if (v && v !== 'all') {
      selectedJoinWays.value = [v];
      selectAllJoinWays.value = false;
    }
  }
);
watch(
  () => props.selectedBanks,
  (val) => {
    selectedBanks.value.uiCodes = val.uiCodes || [];
    selectedBanks.value.apiCodes = val.apiCodes || [];
  },
  { deep: true }
);

const formatAmount = () => {
  const numeric = localDepositAmount.value.replace(/[^\d]/g, '');
  localDepositAmount.value = numeric ? new Intl.NumberFormat('ko-KR').format(numeric) : '';
};

const openBankModal = () => {
  console.log('은행 선택 모달 열기 - 은행 데이터 상태:', {
    length: props.banks?.length || 0,
    isArray: Array.isArray(props.banks),
    sample: props.banks?.slice?.(0, 3) || [],
  });
  showBankModal.value = true;
};
const closeBankModal = () => {
  showBankModal.value = false;
};
const updateSelectedBanks = (bankCodes) => {
  selectedBanks.value = bankCodes;
};

const onSearch = () => {
  let joinWaysParam =
    selectAllJoinWays.value || selectedJoinWays.value.length === 0 ? 'all' : selectedJoinWays.value;
  emit('search', {
    depositAmount: localDepositAmount.value,
    period: localPeriod.value,
    interestType: localInterestType.value,
    joinWays: joinWaysParam,
    selectedBanks: selectedBanks.value,
  });
};

const onReset = () => {
  localDepositAmount.value = '100,000';
  localPeriod.value = '6';
  localInterestType.value = 'S';
  selectedJoinWays.value = [...availableJoinWays.value];
  selectAllJoinWays.value = true;
  const regularBanks = props.banks.filter(
    (bank) => typeof bank === 'string' && !bank.includes('저축은행')
  );
  selectedBanks.value = {
    uiCodes: [...regularBanks],
    apiCodes: [...regularBanks],
  };
  nextTick(() => emit('reset'));
};
</script>

<style scoped>
/* ==========================================================================
   1. 폼 전체 레이아웃 (유지)
   ========================================================================== */
.deposit-search-form {
  margin-bottom: 1.5rem;
}

/* ==========================================================================
   2. 폼 제목 (유지)
   ========================================================================== */
.form-title {
  margin-bottom: 1.25rem;
}

.form-title h2 {
  font-size: 1.5rem; /* 24px */
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 0.5rem 0;
}

.title-description {
  color: var(--color-sub);
  font-size: 0.9375rem; /* 15px */
}

/* ==========================================================================
   3. 필터 컨테이너 (유지)
   ========================================================================== */
.filter-container {
  background: #ffffff;
  border-radius: 0.75rem; /* 12px */
  padding: 1.25rem 1rem; /* 20px 16px */
  box-shadow: 0 0.125rem 1rem rgba(45, 51, 107, 0.04);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

/* ==========================================================================
   4. 필터 라벨 (유지)
   ========================================================================== */
.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem; /* 14px */
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.625rem; /* 10px */
}

.filter-label i {
  color: var(--color-sub);
}

/* ==========================================================================
   5. 입력 필드 (유지)
   ========================================================================== */
.input-wrapper,
.custom-select {
  position: relative;
}

.form-input,
.select-input {
  width: 100%;
  height: 3rem; /* 48px, 높이 통일 */
  padding: 0 1rem;
  font-size: 1rem; /* 16px */
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.5rem; /* 8px */
  background-color: var(--color-bg-light);
  color: var(--color-main);
  transition: all 0.2s ease-in-out;
}

.form-input:focus,
.select-input:focus {
  outline: none;
  border-color: var(--color-main);
  background-color: #ffffff;
  box-shadow: 0 0 0 0.1875rem rgba(45, 51, 107, 0.1); /* 3px */
}

.input-suffix,
.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-sub);
  pointer-events: none;
}

.select-input {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2.5rem; /* 화살표 공간 확보 */
}

/* ==========================================================================
   6. 버튼 및 태그 (✨ 수정)
   - 태그 컨테이너를 4열 그리드로 고정하여 한 줄에 표시되도록 변경
   ========================================================================== */
.option-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.option-button {
  height: 3rem; /* 48px */
  padding: 0 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.5rem;
  background-color: #ffffff;
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.option-button.active {
  background: var(--color-main);
  color: white;
  border-color: var(--color-main);
  font-weight: 600;
}

.tag-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* ✨ 4개의 컬럼으로 고정하여 한 줄에 표시 */
  gap: 0.5rem;
}

.filter-tag {
  padding: 0.625rem 0; /* 상하 여백으로 높이 조절 */
  font-size: 0.875rem;
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.5rem; /* 다른 버튼과 통일감 */
  background-color: #ffffff;
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  text-align: center;
}

.filter-tag.active {
  background: var(--color-main);
  color: #fff;
  border-color: var(--color-main);
}

.filter-label .all-tag {
  margin-left: auto; /* '전체' 버튼을 오른쪽 끝으로 이동 */
  font-size: 0.8125rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-light);
  color: var(--color-sub);
  background-color: #fff;
  border-radius: 1rem;
}

.filter-label .all-tag.active {
  background-color: var(--color-sub);
  color: #fff;
  border-color: var(--color-sub);
}

.bank-select-button {
  width: 100%;
  height: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  font-size: 1rem;
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.5rem;
  background-color: var(--color-bg-light);
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

/* ==========================================================================
   7. 검색/초기화 버튼 (유지)
   ========================================================================== */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.reset-btn,
.search-btn {
  height: 3.25rem; /* 52px */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.reset-btn {
  flex-basis: 35%; /* 초기화 버튼 너비 고정 */
  background-color: #ffffff;
  color: var(--color-sub);
  border: 0.0625rem solid var(--color-light);
}

.search-btn {
  flex: 1; /* 검색 버튼이 남은 공간 모두 차지 */
  background: var(--color-main);
  color: #fff;
  border: none;
}

.search-btn:hover {
  filter: brightness(110%);
}
</style>
