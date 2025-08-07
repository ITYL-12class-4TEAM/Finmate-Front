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
.deposit-search-form {
  margin-bottom: 1.5rem;
  max-width: 430px;
  margin-left: auto;
  margin-right: auto;
}
.form-title {
  margin-bottom: 1.3rem;
  position: relative;
}
.form-title h2 {
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}
.form-title h2::after {
  content: '';
  position: absolute;
  bottom: -0.2rem;
  left: 0;
  width: 2rem;
  height: 0.18rem;
  background: linear-gradient(to right, var(--color-main), var(--color-sub));
  border-radius: 1rem;
}
.title-description {
  color: var(--color-sub);
  font-size: 0.95rem;
  margin-top: 0.6rem;
}
.filter-container {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  padding: 1.1rem;
  border: 1px solid rgba(185, 187, 204, 0.26);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.09);
  transition: all 0.3s;
}
.form-group {
  margin-bottom: 1.18rem;
}
.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.91rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.38rem;
}
.filter-label i {
  font-size: 0.8rem;
  color: var(--color-sub);
}
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.97rem;
  border: 1px solid rgba(185, 187, 204, 0.37);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.83);
  color: var(--color-main);
  transition: all 0.3s;
}
.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.09);
}
.input-suffix {
  position: absolute;
  right: 1rem;
  color: var(--color-sub);
  font-size: 0.92rem;
  pointer-events: none;
}
.custom-select {
  position: relative;
}
.select-input {
  width: 100%;
  padding: 0.7rem 2.5rem 0.7rem 1rem;
  font-size: 0.97rem;
  border: 1px solid rgba(185, 187, 204, 0.34);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-main);
  cursor: pointer;
  appearance: none;
  transition: all 0.2s;
}
.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-sub);
  font-size: 0.75rem;
  pointer-events: none;
}
.option-buttons {
  display: flex;
  gap: 0.5rem;
}
.option-button {
  flex: 1;
  padding: 0.72rem 1rem;
  font-size: 0.95rem;
  border: 1px solid rgba(185, 187, 204, 0.38);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.82);
  color: var(--color-sub);
  cursor: pointer;
  transition:
    background 0.22s,
    border 0.22s,
    color 0.22s;
}
.option-button:hover {
  background: rgba(255, 255, 255, 0.97);
  border-color: var(--color-sub);
}
.option-button.active {
  background: var(--color-main);
  color: white;
  border-color: var(--color-main);
}
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.filter-tag {
  padding: 0.5rem 0.75rem;
  font-size: 0.86rem;
  border: 1px solid rgba(185, 187, 204, 0.38);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.82);
  color: var(--color-sub);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border 0.2s;
}
.filter-tag:hover {
  background: rgba(255, 255, 255, 0.97);
  border-color: var(--color-sub);
}
.filter-tag.active {
  background: var(--color-main);
  color: #fff;
  border-color: var(--color-main);
}
.filter-tag.all-tag {
  background: var(--color-bg-light);
  border: 1px solid var(--color-sub);
  font-weight: bold;
}
.filter-tag.all-tag.active {
  background: var(--color-sub);
  color: #fff;
  border-color: var(--color-sub);
}
.bank-select-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.97rem;
  border: 1px solid rgba(185, 187, 204, 0.34);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.84);
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.2s;
}
.bank-select-button:hover {
  background: rgba(255, 255, 255, 0.97);
  border-color: var(--color-main);
}
.bank-select-button i {
  color: var(--color-sub);
  font-size: 0.78rem;
}
.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.4rem;
}
.reset-btn {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.72rem 1.25rem;
  font-size: 0.97rem;
  font-weight: 500;
  border: 1px solid rgba(185, 187, 204, 0.36);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.2s;
}
.reset-btn:hover {
  background: rgba(255, 255, 255, 0.97);
  border-color: var(--color-sub);
}
.search-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.72rem 1.5rem;
  font-size: 0.97rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(45, 51, 107, 0.14);
}
.search-btn i,
.reset-btn i {
  font-size: 0.85rem;
}
@media (max-width: 430px) {
  .deposit-search-form {
    max-width: 100vw;
  }
  .form-title h2 {
    font-size: 1.18rem;
  }
  .form-title {
    margin-bottom: 1rem;
  }
  .filter-container {
    padding: 0.85rem;
  }
}
</style>
