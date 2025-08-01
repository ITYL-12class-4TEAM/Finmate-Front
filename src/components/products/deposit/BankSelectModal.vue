<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>은행 선택</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      
      <div class="bank-type-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'bank' }"
          @click="activeTab = 'bank'"
        >
          은행
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'savings' }"
          @click="activeTab = 'savings'"
        >
          저축은행
        </button>
      </div>
      
      <div class="bank-selection-content">
        <div class="select-all-option">
          <label>
            <input 
              type="checkbox" 
              v-model="selectAllBanks"
              @change="toggleAllBanks"
            /> 
            모든 은행 선택
          </label>
        </div>
        
        <div class="bank-grid">
          <div 
            v-for="bank in displayedBanks" 
            :key="bank" 
            class="bank-item"
          >
            <label>
              <input 
                type="checkbox" 
                v-model="selectedBanks"
                :value="bank"
                @change="handleBankSelection"
              />
              <div class="bank-logo">
                <!-- 은행 로고 표시 (실제 구현 시 로고 이미지 추가) -->
                <div class="bank-logo-placeholder"></div>
              </div>
              <div class="bank-name">{{ bank }}</div>
            </label>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="confirm-btn" @click="confirmSelection">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  banks: {
    type: Array,
    default: () => []
  },
  initialSelectedBanks: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'update:selected-banks']);

// 활성 탭 (은행 또는 저축은행)
const activeTab = ref('bank');

// 선택된 은행 목록
const selectedBanks = ref([]);

// 전체 선택 상태
const selectAllBanks = ref(false);

// 은행과 저축은행 분류
const bankCategories = computed(() => {
  const regular = [];
  const savings = [];
  
  if (Array.isArray(props.banks)) {
    props.banks.forEach(bank => {
      if (typeof bank === 'string') {
        if (bank.includes('저축은행')) {
          savings.push(bank);
        } else {
          regular.push(bank);
        }
      }
    });
  }
  
  return {
    regularBanks: regular,
    savingsBanks: savings
  };
});

// 현재 탭에 따라 표시할 은행 목록
const displayedBanks = computed(() => {
  if (activeTab.value === 'bank') {
    return bankCategories.value.regularBanks;
  } else {
    return bankCategories.value.savingsBanks;
  }
});

// 모든 은행 코드 (일반 은행 + 저축은행)
const allBanks = computed(() => [
  ...bankCategories.value.regularBanks,
  ...bankCategories.value.savingsBanks
]);

// 전체 선택/해제 토글
const toggleAllBanks = () => {
  if (selectAllBanks.value) {
    // 현재 탭에 따라 전체 선택
    if (activeTab.value === 'bank') {
      // 기존 선택된 저축은행은 유지하고 일반 은행만 추가
      const currentSavings = selectedBanks.value.filter(bank => 
        bankCategories.value.savingsBanks.includes(bank)
      );
      selectedBanks.value = [...bankCategories.value.regularBanks, ...currentSavings];
    } else {
      // 기존 선택된 일반 은행은 유지하고 저축은행만 추가
      const currentRegular = selectedBanks.value.filter(bank => 
        bankCategories.value.regularBanks.includes(bank)
      );
      selectedBanks.value = [...currentRegular, ...bankCategories.value.savingsBanks];
    }
  } else {
    // 현재 탭에 따라 전체 해제
    if (activeTab.value === 'bank') {
      // 일반 은행만 해제하고 저축은행은 유지
      selectedBanks.value = selectedBanks.value.filter(bank => 
        bankCategories.value.savingsBanks.includes(bank)
      );
    } else {
      // 저축은행만 해제하고 일반 은행은 유지
      selectedBanks.value = selectedBanks.value.filter(bank => 
        bankCategories.value.regularBanks.includes(bank)
      );
    }
  }
};

// 선택된 은행에 따라 전체 선택 상태 업데이트
const handleBankSelection = () => {
  // 현재 탭에 따라 전체 선택 상태 업데이트
  if (activeTab.value === 'bank') {
    // 일반 은행 탭에서는 모든 일반 은행이 선택되었는지 확인
    const allRegularSelected = bankCategories.value.regularBanks.every(bank => 
      selectedBanks.value.includes(bank)
    );
    selectAllBanks.value = allRegularSelected;
  } else {
    // 저축은행 탭에서는 모든 저축은행이 선택되었는지 확인
    const allSavingsSelected = bankCategories.value.savingsBanks.every(bank => 
      selectedBanks.value.includes(bank)
    );
    selectAllBanks.value = allSavingsSelected;
  }
};

// 탭 변경 시 전체 선택 상태 업데이트
watch(activeTab, () => {
  handleBankSelection();
});

// 모달이 열릴 때 초기 선택 상태 설정
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    // 초기 선택 은행이 있으면 사용
    if (Array.isArray(props.initialSelectedBanks) && props.initialSelectedBanks.length > 0) {
      selectedBanks.value = [...props.initialSelectedBanks];
    } else {
      // 기본값: 저축은행을 제외한 모든 은행
      selectedBanks.value = [...bankCategories.value.regularBanks];
    }
    
    // 초기 탭은 은행으로 설정
    activeTab.value = 'bank';
    
    // 선택 상태 업데이트
    nextTick(() => {
      handleBankSelection();
    });
  }
});

// 선택 확인 및 모달 닫기
const confirmSelection = () => {
  // 부모 컴포넌트에 선택된 은행 목록 전달
  emit('update:selected-banks', {
    uiCodes: selectedBanks.value,
    apiCodes: selectedBanks.value
  });
  
  // 모달 닫기
  closeModal();
};

// 모달 닫기
const closeModal = () => {
  emit('close');
};

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 기본 선택 은행 설정
  if (Array.isArray(props.initialSelectedBanks) && props.initialSelectedBanks.length > 0) {
    selectedBanks.value = [...props.initialSelectedBanks];
  } else {
    // 기본값: 저축은행을 제외한 모든 은행
    selectedBanks.value = [...bankCategories.value.regularBanks];
  }
  
  // 선택 상태 업데이트
  handleBankSelection();
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-height: 80vh;
  background-color: white;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 0;
}

.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  position: relative;
  border-bottom: 1px solid var(--color-bg-light);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
}

.close-btn {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-sub);
}

.bank-type-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-bg-light);
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: none;
  font-size: 1rem;
  cursor: pointer;
  color: var(--color-sub);
}

.tab-btn.active {
  font-weight: 600;
  color: var(--color-main);
  border-bottom: 2px solid var(--color-main);
}

.bank-selection-content {
  padding: 1rem;
  overflow-y: auto;
  max-height: 60vh;
}

.select-all-option {
  margin-bottom: 1rem;
}

.select-all-option label {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-main);
}

.bank-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.1rem;
}

.bank-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid var(--color-bg-light);
  border-radius: 0.5rem;
}

.bank-item label {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.bank-logo {
  width: 2.5rem;
  height: 2.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bank-logo-placeholder {
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--color-bg-light);
  border-radius: 50%;
}

.bank-name {
  font-size: 0.7rem;
  text-align: center;
  color: var(--color-sub);
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
}

.confirm-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

</style>