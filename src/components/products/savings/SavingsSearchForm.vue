<template>
  <div class="deposit-search-form">
    <div class="form-title">
      <h2>적금</h2>
      <div class="title-description">원하는 조건으로 적금 상품을 찾아보세요</div>
    </div>

    <form class="filter-container grid-layout" @submit.prevent="onSearch">
      <label class="filter-label"><i class="fa-solid fa-coins"></i> 월 납입 금액</label>
      <div class="input-wrapper">
        <input
          v-model="localDepositAmount"
          type="text"
          class="form-input"
          placeholder="100,000"
          autocomplete="off"
          inputmode="numeric"
          @input="formatAmount"
        />
        <span class="input-suffix">원</span>
      </div>

      <label class="filter-label"><i class="fa-solid fa-calendar-alt"></i> 기간</label>
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

      <label class="filter-label"><i class="fa-solid fa-percentage"></i> 금리 유형</label>
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

      <label class="filter-label"><i class="fa-solid fa-money-bill-wave"></i> 적립 방식</label>
      <div class="option-buttons">
        <button
          type="button"
          class="option-button"
          :class="{ active: localRsrvType === 'F' }"
          @click="localRsrvType = 'F'"
        >
          자유적립식
        </button>
        <button
          type="button"
          class="option-button"
          :class="{ active: localRsrvType === 'S' }"
          @click="localRsrvType = 'S'"
        >
          정액적립식
        </button>
      </div>

      <div class="join-way-label-group">
        <label class="filter-label"><i class="fa-solid fa-laptop"></i> 가입 방식</label>
        <div
          class="filter-tag all-tag"
          :class="{ active: selectAllJoinWays }"
          @click="toggleAllJoinWays(!selectAllJoinWays)"
        >
          전체
        </div>
      </div>
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

      <label class="filter-label"><i class="fa-solid fa-building-columns"></i> 은행 선택</label>
      <button type="button" class="bank-select-button" @click="openBankModal">
        <span>{{ getBankSelectionText() }}</span>
        <i class="fa-solid fa-chevron-right"></i>
      </button>

      <button type="button" class="reset-btn" @click="onReset">
        <i class="fa-solid fa-rotate"></i> 초기화
      </button>
      <button type="submit" class="search-btn"><i class="fa-solid fa-search"></i> 검색</button>
    </form>

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
import BankSelectModal from '../deposit/BankSelectModal.vue';

const props = defineProps({
  depositAmount: { type: String, default: '100000' },
  period: { type: String, default: '6' },
  interestType: { type: String, default: 'S' },
  rsrvType: { type: String, default: 'F' },
  joinWay: { type: [String, Array], default: 'all' },
  banks: { type: Array, default: () => [] },
  selectedBanks: { type: Object, default: () => ({ uiCodes: [], apiCodes: [] }) },
});
const emit = defineEmits(['search', 'reset']);

const localDepositAmount = ref(props.depositAmount);
const localPeriod = ref(props.period);
const localInterestType = ref(props.interestType);
const localRsrvType = ref(props.rsrvType);
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
  () => props.rsrvType,
  (v) => (localRsrvType.value = v)
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
    rsrvType: localRsrvType.value,
    joinWays: joinWaysParam,
    selectedBanks: selectedBanks.value,
  });
};

const onReset = () => {
  localDepositAmount.value = '100,000';
  localPeriod.value = '6';
  localInterestType.value = 'S';
  localRsrvType.value = 'F';
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
   1. 폼 전체 레이아웃
   ========================================================================== */
.deposit-search-form {
  margin-bottom: 0.5rem;
}
.form-title {
  margin-bottom: 0.75rem;
  padding: 0 0.5rem;
}
.form-title h2 {
  font-size: 1.2rem; /* 1.3rem → 1.04rem (80%) */
  font-weight: 700;
  color: #2d336b;
  margin: 0 0 0.35rem 0;
}
.title-description {
  color: #7d81a2;
  font-size: 0.72rem; /* 0.9rem → 0.72rem (80%) */
}

/* ==========================================================================
   2. 필터 컨테이너 & Grid 레이아웃
   ========================================================================== */
.filter-container.grid-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem 1rem;
  align-items: center;
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 0.8rem 1.3rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
}

/* ==========================================================================
   3. 필터 라벨 (왼쪽 컬럼)
   ========================================================================== */
.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem; /* 0.9375rem → 0.75rem (80%) */
  font-weight: 600;
  color: #2d336b;
  white-space: nowrap;
}
.filter-label i {
  color: #7d81a2;
  font-size: 0.8rem; /* 1rem → 0.8rem (80%) */
}

/* ==========================================================================
   4. 입력 필드 및 버튼 (오른쪽 컬럼)
   ========================================================================== */
.input-wrapper,
.custom-select,
.option-buttons,
.bank-select-button,
.tag-container {
  min-width: 0;
}
.input-wrapper,
.custom-select {
  position: relative;
}
.form-input,
.select-input {
  width: 100%;
  height: 2.2rem; /* 2.5rem → 2.2rem */
  padding: 0 1rem;
  font-size: 0.8rem; /* 1rem → 0.8rem (80%) */
  font-weight: 500;
  border: 1px solid #dcdce4;
  border-radius: 0.5rem;
  background-color: #f7f7fa;
  color: #2d336b;
  transition: all 0.2s ease-in-out;
}
.input-suffix,
.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7d81a2;
  pointer-events: none;
}
.select-input {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2.5rem;
}

/* ==========================================================================
   5. 버튼 및 태그
   ========================================================================== */
.option-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.option-button {
  height: 2.2rem; /* 2.5rem → 2.2rem */
  padding: 0 1rem;
  font-size: 0.75rem; /* 0.9375rem → 0.75rem (80%) */
  font-weight: 500;
  border-radius: 0.5rem;
  background-color: #f7f7fa;
  color: #7d81a2;
  border: 1px solid #dcdce4;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.option-button.active {
  background: #2d336b;
  color: #fff;
  border-color: #2d336b;
  font-weight: 600;
}

/* ✨ 가입 방식 (최종 레이아웃) ✨ */
.join-way-label-group {
  display: flex;
  flex-direction: column;
  align-items: center; /* 라벨과 전체 버튼을 가운데 정렬 */
  gap: 0.5rem; /* 라벨과 전체 버튼 사이 간격 */
  justify-self: center; /* Grid 셀 내에서 스스로 가운데 정렬 */
}
.all-tag {
  font-size: 0.65rem; /* 0.8125rem → 0.65rem (80%) */
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background-color: #f0f2f5;
  color: #7d81a2;
  border: 1px solid transparent;
  cursor: pointer;
}
.all-tag.active {
  background-color: #7d81a2;
  color: #fff;
}
.tag-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2x2 Grid로 변경 */
  gap: 0.5rem;
}
.filter-tag {
  /* ✨ height를 2.2rem으로 명시적으로 설정 */
  height: 2.2rem; /* 2.5rem → 2.2rem */
  font-size: 0.7rem; /* 0.875rem → 0.7rem (80%) */
  border-radius: 0.5rem;
  /* ✨ flexbox를 이용해 텍스트를 완벽하게 중앙 정렬 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.5rem; /* 좌우 여백 추가 */
  background-color: #ffffff;
  color: #7d81a2;
  border: 1px solid #dcdce4;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}
.filter-tag.active {
  background: #2d336b;
  color: #fff;
  border-color: #2d336b;
}

.bank-select-button {
  height: 2.2rem; /* 2.5rem → 2.2rem */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  font-size: 0.8rem; /* 1rem → 0.8rem (80%) */
  font-weight: 500;
  border-radius: 0.5rem;
  background-color: #f7f7fa;
  border: 1px solid #dcdce4;
  color: #2d336b;
  cursor: pointer;
}

/* ==========================================================================
   6. 검색/초기화 버튼
   ========================================================================== */
.reset-btn,
.search-btn {
  margin-top: 0.25rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem; /* 1rem → 0.8rem (80%) */
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid;
}
.reset-btn {
  grid-column: 1;
  background-color: #f8f8f8;
  color: #7d81a2;
  border-color: #dcdce4;
}
.search-btn {
  grid-column: 2;
  background: #2d336b;
  color: #fff;
  border-color: #2d336b;
}
</style>
