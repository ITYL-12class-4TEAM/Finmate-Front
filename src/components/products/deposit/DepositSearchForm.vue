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
          <label class="filter-label">
            <i class="fa-solid fa-coins"></i>
            예치 금액
          </label>
          <div class="input-wrapper">
            <input
              type="text"
              v-model="localDepositAmount"
              class="form-input"
              @input="formatAmount"
              placeholder="100,000"
            />
            <span class="input-suffix">원</span>
          </div>
        </div>

        <!-- 기간 선택 드롭다운으로 변경 -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-calendar-alt"></i>
            기간
          </label>
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

        <!-- 금리 유형 선택 -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-percentage"></i>
            금리 유형
          </label>
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

        <!-- 가입 방식 필터 수정 -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-laptop"></i>
            가입 방식
          </label>
          <div class="tag-container">
            <!-- 전체 버튼 스타일 변경 -->
            <div
              class="filter-tag all-tag"
              :class="{ active: selectAllJoinWays }"
              @click="toggleAllJoinWays(!selectAllJoinWays)"
            >
              전체
            </div>
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

        <!-- 은행 선택 필터 -->
        <div class="form-group">
          <label class="filter-label">
            <i class="fa-solid fa-building-columns"></i>
            은행 선택
          </label>
          <button type="button" class="bank-select-button" @click="openBankModal">
            <span>{{ getBankSelectionText() }}</span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <!-- 액션 버튼 그룹 -->
        <div class="action-buttons">
          <button type="button" @click="onReset" class="reset-btn">
            <i class="fa-solid fa-rotate"></i>
            초기화
          </button>
          <button type="submit" class="search-btn">
            <i class="fa-solid fa-search"></i>
            검색
          </button>
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

// 부모로부터 받은 프롭스
const props = defineProps({
  depositAmount: {
    type: String,
    default: '100000',
  },
  period: {
    type: String,
    default: '6',
  },
  interestType: {
    type: String,
    default: 'S',
  },
  joinWay: {
    type: [String, Array],
    default: 'all',
  },
  banks: {
    type: Array,
    default: () => [],
  },
  selectedBanks: {
    type: Object,
    default: () => ({ uiCodes: [], apiCodes: [] }),
  },
});

// 이벤트 정의
const emit = defineEmits(['search', 'reset']);

// 로컬 상태 (양방향 바인딩용)
const localDepositAmount = ref(props.depositAmount);
const localPeriod = ref(props.period);
const localInterestType = ref(props.interestType);
const selectedBanks = ref({
  uiCodes: props.selectedBanks.uiCodes || [],
  apiCodes: props.selectedBanks.apiCodes || [],
});

// 화면 표시용 라벨 배열
const availableJoinWays = ref(['영업점', '인터넷', '스마트폰', '전화']);

// 화면 라벨을 API 코드로 변환하는 함수
const convertLabelToCode = (label) => {
  const item = joinWayMapping.find((item) => item.label === label);
  return item ? item.value : label;
};

// API 코드를 화면 라벨로 변환하는 함수
const convertCodeToLabel = (code) => {
  const item = joinWayMapping.find((item) => item.value === code);
  return item ? item.label : code;
};

const selectedJoinWays = ref([]);
const selectAllJoinWays = ref(false);

// 초기 가입 방식 설정
onMounted(() => {
  if (props.joinWay === 'all') {
    // 전체 선택
    selectedJoinWays.value = [...availableJoinWays.value];
    selectAllJoinWays.value = true;
  } else if (Array.isArray(props.joinWay)) {
    // 배열로 전달된 경우
    selectedJoinWays.value = [...props.joinWay];
    updateSelectAllState();
  } else if (props.joinWay && props.joinWay !== 'all') {
    // 단일 문자열로 전달된 경우
    selectedJoinWays.value = [props.joinWay];
    selectAllJoinWays.value = false;
  } else {
    // 기본값: 전체 선택
    selectedJoinWays.value = [...availableJoinWays.value];
    selectAllJoinWays.value = true;
  }
});

// 전체 선택/해제 토글 함수 수정
const toggleAllJoinWays = (state) => {
  selectAllJoinWays.value = state;
  if (selectAllJoinWays.value) {
    selectedJoinWays.value = [...availableJoinWays.value];
  } else {
    selectedJoinWays.value = [];
  }
};

// 개별 가입 방식 토글 함수 수정
const toggleJoinWay = (way) => {
  const index = selectedJoinWays.value.indexOf(way);
  if (index === -1) {
    selectedJoinWays.value.push(way);
  } else {
    selectedJoinWays.value.splice(index, 1);
  }
  // 개별 선택 시 전체 선택 상태 업데이트
  updateSelectAllState();
};

// 개별 선택 시 전체 선택 상태 업데이트
const updateSelectAllState = () => {
  selectAllJoinWays.value = selectedJoinWays.value.length === availableJoinWays.value.length;
};

// 모달 표시 상태
const showBankModal = ref(false);

// 선택된 은행 수
const selectedBankCount = computed(() => {
  return selectedBanks.value.uiCodes.length;
});

// 모든 은행이 선택되었는지 여부
const isAllBanksSelected = computed(() => {
  return selectedBankCount.value > 0 && selectedBankCount.value === props.banks.length;
});

// 은행 선택 텍스트 가져오기
const getBankSelectionText = () => {
  if (selectedBankCount.value === 0) {
    return '은행을 선택해주세요';
  } else if (isAllBanksSelected.value) {
    return '모든 은행';
  } else if (selectedBankCount.value <= 2) {
    return selectedBanks.value.uiCodes.join(', ');
  } else {
    return `${selectedBanks.value.uiCodes[0]} 외 ${selectedBankCount.value - 1}개`;
  }
};

// props 변경 시 로컬 상태 업데이트
watch(
  () => props.depositAmount,
  (newVal) => {
    localDepositAmount.value = newVal;
  }
);

watch(
  () => props.period,
  (newVal) => {
    localPeriod.value = newVal;
  }
);

watch(
  () => props.interestType,
  (newVal) => {
    localInterestType.value = newVal;
  }
);

watch(
  () => props.joinWay,
  (newVal) => {
    if (newVal === 'all') {
      selectedJoinWays.value = [...availableJoinWays.value];
      selectAllJoinWays.value = true;
    } else if (Array.isArray(newVal)) {
      selectedJoinWays.value = [...newVal];
      updateSelectAllState();
    } else if (newVal && newVal !== 'all') {
      selectedJoinWays.value = [newVal];
      selectAllJoinWays.value = false;
    }
  }
);

watch(
  () => props.selectedBanks,
  (newVal) => {
    selectedBanks.value.uiCodes = newVal.uiCodes || [];
    selectedBanks.value.apiCodes = newVal.apiCodes || [];
  },
  { deep: true }
);

// 금액 포맷팅 함수
const formatAmount = () => {
  // 숫자만 추출
  const numericValue = localDepositAmount.value.replace(/[^\d]/g, '');

  // 숫자 포맷팅 (천 단위 콤마)
  if (numericValue) {
    localDepositAmount.value = new Intl.NumberFormat('ko-KR').format(numericValue);
  } else {
    localDepositAmount.value = '';
  }
};

// 은행 선택 모달 열기
const openBankModal = () => {
  showBankModal.value = true;
};

// 은행 선택 모달 닫기
const closeBankModal = () => {
  showBankModal.value = false;
};

// 은행 선택 업데이트
const updateSelectedBanks = (bankCodes) => {
  selectedBanks.value = bankCodes;
};

// 검색 이벤트 핸들러 수정
const onSearch = () => {
  // 선택된 가입 방법 처리
  let joinWaysParam;

  if (selectAllJoinWays.value) {
    // 전체 선택인 경우 'all' 전달
    joinWaysParam = 'all';
  } else if (selectedJoinWays.value.length > 0) {
    // 개별 선택인 경우 한글 그대로 전달 (매핑하지 않음)
    joinWaysParam = selectedJoinWays.value;
  } else {
    // 아무것도 선택하지 않은 경우 'all' 전달
    joinWaysParam = 'all';
  }

  emit('search', {
    depositAmount: localDepositAmount.value,
    period: localPeriod.value,
    interestType: localInterestType.value,
    joinWays: joinWaysParam, // 다중 선택 처리
    selectedBanks: selectedBanks.value,
  });
};

// 초기화 이벤트 핸들러
const onReset = () => {
  // 값을 직접 할당하고 즉시 반영되도록 수정
  localDepositAmount.value = '100,000';
  localPeriod.value = '6';
  localInterestType.value = 'S'; // 단리로 명확히 지정

  // 가입 방식 초기화 (모두 선택)
  selectedJoinWays.value = [...availableJoinWays.value];
  selectAllJoinWays.value = true;

  // 은행 선택 초기화: 저축은행을 제외한 모든 은행
  const regularBanks = props.banks.filter(
    (bank) => typeof bank === 'string' && !bank.includes('저축은행')
  );

  selectedBanks.value = {
    uiCodes: [...regularBanks],
    apiCodes: [...regularBanks],
  };

  // 변경사항 즉시 반영되도록 $nextTick 사용
  nextTick(() => {
    emit('reset');
  });

  // 버튼 활성화 상태 계산 속성 추가
  const isButtonActive = computed(() => ({
    S: localInterestType.value === 'S',
    M: localInterestType.value === 'M',
  }));
};
</script>

<style scoped>
.form-title {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-title h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 0.5rem 0;
  position: relative;
  display: inline-block;
}

.form-title h2::after {
  content: '';
  position: absolute;
  bottom: -0.25rem;
  left: 0;
  width: 2rem;
  height: 0.25rem;
  background: linear-gradient(to right, var(--color-main), var(--color-sub));
  border-radius: 1rem;
}

.deposit-search-form {
  margin-bottom: 1.5rem;
}

.filter-container {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  padding: 1.25rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-container:hover {
  border-color: rgba(185, 187, 204, 0.4);
  box-shadow: 0 4px 12px -2px rgba(45, 51, 107, 0.15);
}

.title-description {
  color: var(--color-sub);
  font-size: 0.95rem;
  margin-top: 0.75rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.filter-label i {
  font-size: 0.8rem;
  color: var(--color-sub);
}

/* 입력 필드 스타일 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-main);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
}

.input-suffix {
  position: absolute;
  right: 1rem;
  color: var(--color-sub);
  font-size: 0.9rem;
  pointer-events: none;
}

/* 셀렉트 박스 스타일 */
.custom-select {
  position: relative;
}

.select-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-main);
  appearance: none;
}

.select-input:focus {
  outline: none;
  border-color: var(--color-main);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-sub);
  font-size: 0.75rem;
  pointer-events: none;
  transition: all 0.2s ease;
}

.custom-select:hover .select-arrow {
  color: var(--color-main);
}

/* 옵션 버튼 스타일 */
.option-buttons {
  display: flex;
  gap: 0.5rem;
}

.option-button {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-button:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-sub);
}

.option-button.active {
  background: var(--color-main);
  color: white;
  border-color: var(--color-main);
}

/* 태그 컨테이너 스타일 */
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-tag:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-sub);
}

.filter-tag.active {
  background: var(--color-main);
  color: white;
  border-color: var(--color-main);
}

/* '전체' 버튼 스타일 차별화 */
.filter-tag.all-tag {
  background-color: var(--color-bg-light);
  border: 1px solid var(--color-sub);
  font-weight: bold;
}

.filter-tag.all-tag.active {
  background-color: var(--color-sub);
  color: white;
  border-color: var(--color-sub);
}

/* 은행 선택 버튼 */
.bank-select-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bank-select-button:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-main);
}

.bank-select-button i {
  color: var(--color-sub);
  font-size: 0.75rem;
}

/* 액션 버튼 그룹 */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.reset-btn {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-sub);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-sub);
}

.search-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--color-main) 0%, var(--color-sub) 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(45, 51, 107, 0.4);
}

.search-btn i,
.reset-btn i {
  font-size: 0.85rem;
}
</style>
