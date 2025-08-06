<template>
  <form @submit.prevent="onSearch">
    <div class="form-group">
      <label>예치 금액</label>
      <input
        type="text"
        v-model="localDepositAmount"
        class="form-control"
        @input="formatAmount"
      />
      <span>원</span>
    </div>

    <div class="form-group">
      <label>기간(개월)</label>
      <div class="radio-group">
        <label><input type="radio" v-model="localPeriod" value="1" /> 1 </label>
        <label><input type="radio" v-model="localPeriod" value="3" /> 3 </label>
        <label><input type="radio" v-model="localPeriod" value="6" /> 6 </label>
        <label
          ><input type="radio" v-model="localPeriod" value="12" /> 12</label
        >
        <label
          ><input type="radio" v-model="localPeriod" value="24" /> 24</label
        >
        <label
          ><input type="radio" v-model="localPeriod" value="36" /> 36</label
        >
      </div>
    </div>

    <div class="form-group">
      <label>금리 유형</label>
      <div class="radio-group">
        <label
          ><input type="radio" v-model="localInterestType" value="B" />
          전체</label
        >
        <label
          ><input type="radio" v-model="localInterestType" value="S" />
          단리</label
        >
        <label
          ><input type="radio" v-model="localInterestType" value="M" />
          복리</label
        >
      </div>
    </div>

    <!-- 가입 방식 -->
    <div class="form-group">
      <label>가입 방식</label>
      <div class="checkbox-group">
        <!-- 전체 선택 체크박스 -->
        <label class="checkbox-option">
          <input
            type="checkbox"
            v-model="selectAllJoinWays"
            @change="toggleAllJoinWays"
          />
          <span>전체</span>
        </label>

        <!-- 개별 가입 방식 체크박스 -->
        <label
          class="checkbox-option"
          v-for="way in availableJoinWays"
          :key="way"
        >
          <input
            type="checkbox"
            v-model="selectedJoinWays"
            :value="way"
            @change="updateSelectAllState"
          />
          <span>{{ way }}</span>
        </label>
      </div>
    </div>

    <!-- 은행 선택 필터 버튼 -->
    <div class="form-group">
      <div class="filter-button-group">
        <button type="button" class="filter-button" @click="openBankModal">
          은행 선택
          <span class="selected-count">({{ selectedBankCount }})</span>
        </button>

        <!-- 추가 필터 버튼 -->
        <!-- <button type="button" class="filter-button">금액 범위</button> -->
        <!-- <button type="button" class="filter-button">우대 조건</button> -->
      </div>

      <!-- 선택된 은행 목록 -->
      <div v-if="selectedBankCount > 0" class="selected-banks-summary">
        <span v-if="isAllBanksSelected">모든 은행</span>
        <span v-else-if="selectedBankCount <= 3">
          {{ selectedBanks.uiCodes.join(', ') }}
        </span>
        <span v-else>
          {{ selectedBanks.uiCodes.slice(0, 2).join(', ') }} 외
          {{ selectedBankCount - 2 }}개
        </span>
      </div>
    </div>

    <!-- 검색 버튼 -->
    <div class="button-group">
      <button type="submit" class="search-btn">검색</button>
      <button type="button" @click="onReset" class="reset-btn">
        <i class="fas fa-sync"></i>
      </button>
    </div>

    <!-- 은행 선택 모달 -->
    <BankSelectModal
      :show="showBankModal"
      :banks="banks"
      :initial-selected-banks="selectedBanks.uiCodes"
      @close="closeBankModal"
      @update:selected-banks="updateSelectedBanks"
    />
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
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
    default: 'B',
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

// 가입 방식 관련 상태
const joinWayMapping = [
  { label: '영업점', value: 'branch' },
  { label: '인터넷', value: 'internet' },
  { label: '스마트폰', value: 'mobile' },
  { label: '전화', value: 'phone' },
];

// 화면 표시용 라벨 배열
const availableJoinWays = ref(joinWayMapping.map((item) => item.label));

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

// 전체 선택/해제 토글 함수
const toggleAllJoinWays = () => {
  if (selectAllJoinWays.value) {
    selectedJoinWays.value = [...availableJoinWays.value];
  } else {
    selectedJoinWays.value = [];
  }
};

// 개별 선택 시 전체 선택 상태 업데이트
const updateSelectAllState = () => {
  selectAllJoinWays.value =
    selectedJoinWays.value.length === availableJoinWays.value.length;
};

// 모달 표시 상태
const showBankModal = ref(false);

// 선택된 은행 수
const selectedBankCount = computed(() => {
  return selectedBanks.value.uiCodes.length;
});

// 모든 은행이 선택되었는지 여부
const isAllBanksSelected = computed(() => {
  return (
    selectedBankCount.value > 0 &&
    selectedBankCount.value === props.banks.length
  );
});

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
    localDepositAmount.value = new Intl.NumberFormat('ko-KR').format(
      numericValue
    );
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

// 검색 이벤트 핸들러
const onSearch = () => {
  const selectedJoinWayCodes = selectAllJoinWays.value
    ? 'all'
    : selectedJoinWays.value.map((label) => convertLabelToCode(label));
  
  emit('search', {
    depositAmount: localDepositAmount.value,
    period: localPeriod.value,
    interestType: localInterestType.value,
    // 여기서 변환된 코드 값을 사용해야 합니다!
    joinWay: selectAllJoinWays.value ? 'all' : selectedJoinWayCodes, // 수정: selectedJoinWays.value -> selectedJoinWayCodes
    selectedBanks: selectedBanks.value,
  });
};

// 초기화 이벤트 핸들러
const onReset = () => {
  localDepositAmount.value = '100000';
  localPeriod.value = '6';
  localInterestType.value = 'B';

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

  emit('reset');
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-option input {
  margin-right: 0.375rem;
}

.filter-button-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.filter-button {
  background-color: var(--color-bg-light);
  border: 1px solid var(--color-light);
  border-radius: 1.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
  color: var(--color-sub);
  cursor: pointer;
}

.selected-count {
  color: var(--color-main);
  font-weight: 600;
}

.selected-banks-summary {
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.search-btn {
  flex: 1;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.reset-btn {
  background-color: var(--color-bg-light);
  border: 1px solid var(--color-light);
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>
