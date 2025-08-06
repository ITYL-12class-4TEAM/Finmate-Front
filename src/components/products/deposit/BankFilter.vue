<template>
    <div class="bank-filter">
      <h3>은행 선택</h3>
      
      <!-- 전체 선택 체크박스 -->
      <div class="all-banks">
        <label>
          <input
            type="checkbox"
            v-model="selectAllBanks"
            @change="toggleAllBanks"
          />
          전체 선택
        </label>
      </div>
      
      <!-- 저축은행 카테고리 -->
      <div class="bank-category">
        <label>
          <input
            type="checkbox"
            v-model="selectedBanks"
            value="savings_all"
            @change="handleBankSelection"
          />
          저축은행
        </label>
      </div>
      
      <!-- 일반 은행 목록 -->
      <div class="bank-list">
        <label 
          v-for="bank in regularBanks" 
          :key="bank" 
          class="bank-option"
        >
          <input
            type="checkbox"
            v-model="selectedBanks"
            :value="bank"
            @change="handleBankSelection"
          />
          {{ bank }}
        </label>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, nextTick } from 'vue';
  
  const props = defineProps({
    banks: {
      type: Array,
      default: () => []
    },
    initialSelectedBanks: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['update:selected-banks']);
  
  // 선택된 은행 코드 목록
  const selectedBanks = ref([]);
  
  // 전체 선택 상태
  const selectAllBanks = ref(false);
  
  // 일반 은행과 저축은행 분류
  const bankCategories = computed(() => {
    const regular = [];
    const savings = [];
    
    // props.banks가 배열인지 확인
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
  
  // 일반 은행 목록
  const regularBanks = computed(() => bankCategories.value.regularBanks);
  
  // 저축은행 목록
  const savingsBanks = computed(() => bankCategories.value.savingsBanks);
  
  // 모든 은행 코드 (일반 은행 + 저축은행 대표 코드)
  const allBankCodes = computed(() => {
    const codes = [...regularBanks.value];
    if (savingsBanks.value.length > 0) {
      codes.push('savings_all');
    }
    return codes;
  });
  
  // 전체 선택/해제 토글
  const toggleAllBanks = () => {
    if (selectAllBanks.value) {
      // 전체 선택
      selectedBanks.value = [...allBankCodes.value];
    } else {
      // 전체 해제
      selectedBanks.value = [];
    }
    
    // 부모 컴포넌트에 변경 알림
    emitSelectedBanks();
  };
  
  // 선택된 은행에 따라 전체 선택 상태 업데이트
  const handleBankSelection = () => {
    // 전체 선택 상태 업데이트
    selectAllBanks.value = 
      allBankCodes.value.length > 0 && 
      selectedBanks.value.length === allBankCodes.value.length;
    
    // 부모 컴포넌트에 변경 알림
    emitSelectedBanks();
  };
  
  // 실제 API 요청용 은행 코드 생성 및 이벤트 발생
  const emitSelectedBanks = () => {
    // API 요청용 은행 코드 목록 생성
    let apiReadyBankCodes = [...selectedBanks.value];
    
    // 저축은행 전체가 선택된 경우, 실제 저축은행 코드로 대체
    const savingsAllIndex = apiReadyBankCodes.indexOf('savings_all');
    if (savingsAllIndex !== -1) {
      // 'savings_all'을 제거하고 실제 저축은행 코드들로 대체
      apiReadyBankCodes.splice(savingsAllIndex, 1, ...savingsBanks.value);
    }
    
    // 부모 컴포넌트에 이벤트 발생
    emit('update:selected-banks', {
      uiCodes: selectedBanks.value, // UI 표시용 코드 (savings_all 포함)
      apiCodes: apiReadyBankCodes   // API 요청용 코드 (실제 저축은행 코드 포함)
    });
  };
  
  // 모든 일반 은행 선택 함수
  const selectAllRegularBanks = () => {
    console.log('모든 일반 은행 선택 시작');
    
    // 저축은행을 제외한 모든 은행을 선택
    selectedBanks.value = [...regularBanks.value];
    console.log('선택된 은행:', selectedBanks.value);
    
    // 선택 상태 업데이트 및 이벤트 발생
    handleBankSelection();
  };
  
  // 컴포넌트 마운트 시 실행
  onMounted(() => {
    console.log('BankFilter 마운트됨, 은행 목록:', 
      Array.isArray(props.banks) ? props.banks.length : '유효하지 않은 배열');
    
    // DOM이 업데이트된 후 실행
    nextTick(() => {
      // 저축은행을 제외한 모든 일반 은행 선택
      selectAllRegularBanks();
      
      console.log('초기 선택 완료, 선택된 은행:', selectedBanks.value);
    });
  });
  
  // banks 배열이 변경될 때마다 초기 선택 적용
  watch(() => props.banks, (newValue) => {
    if (Array.isArray(newValue) && newValue.length > 0 && selectedBanks.value.length === 0) {
      // 은행 목록이 로드되었고 아직 선택된 은행이 없을 때만 실행
      nextTick(() => {
        selectAllRegularBanks();
      });
    }
  }, { deep: true });
  </script>