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
          <label><input type="radio" v-model="localPeriod" value="12" /> 12 </label>
          <label><input type="radio" v-model="localPeriod" value="24" /> 24 </label>
          <label><input type="radio" v-model="localPeriod" value="36" /> 36 </label>
        </div>
      </div>
  
      <div class="form-group">
        <label>금리 유형</label>
        <div class="radio-group">
          <label><input type="radio" v-model="localInterestType" value="B" /> 전체</label>
          <label><input type="radio" v-model="localInterestType" value="S" /> 단리</label>
          <label><input type="radio" v-model="localInterestType" value="M" /> 복리</label>
        </div>
      </div>
  
      <div class="form-group">
        <label>가입 방식</label>
        <div class="radio-group">
          <label><input type="radio" v-model="localJoinWay" value="all" /> 전체</label>
          <label><input type="radio" v-model="localJoinWay" value="online" /> 온라인</label>
          <label><input type="radio" v-model="localJoinWay" value="offline" /> 오프라인</label>
        </div>
      </div>
  
      <div class="button-group">
        <button type="submit" class="search-btn">검색</button>
        <button type="button" @click="onReset" class="reset-btn">
          <i class="fas fa-sync"></i>
        </button>
      </div>
    </form>
  </template>
  
  <script setup>
  import { ref, watch, defineProps, defineEmits } from 'vue';
  
  // 부모로부터 받은 프롭스
  const props = defineProps({
    depositAmount: {
      type: String,
      default: '100000'
    },
    period: {
      type: String,
      default: '6'
    },
    interestType: {
      type: String,
      default: 'B'
    },
    joinWay: {
      type: String,
      default: 'all'
    }
  });
  
  // 이벤트 정의
  const emit = defineEmits(['search', 'reset']);
  
  // 로컬 상태 (양방향 바인딩용)
  const localDepositAmount = ref(props.depositAmount);
  const localPeriod = ref(props.period);
  const localInterestType = ref(props.interestType);
  const localJoinWay = ref(props.joinWay);
  
  // props 변경 시 로컬 상태 업데이트
  watch(() => props.depositAmount, (newVal) => {
    localDepositAmount.value = newVal;
  });
  
  watch(() => props.period, (newVal) => {
    localPeriod.value = newVal;
  });
  
  watch(() => props.interestType, (newVal) => {
    localInterestType.value = newVal;
  });
  
  watch(() => props.joinWay, (newVal) => {
    localJoinWay.value = newVal;
  });
  
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
  
  // 검색 이벤트 핸들러
  const onSearch = () => {
    emit('search', {
      depositAmount: localDepositAmount.value,
      period: localPeriod.value,
      interestType: localInterestType.value,
      joinWay: localJoinWay.value
    });
  };
  
  // 초기화 이벤트 핸들러
  const onReset = () => {
    localDepositAmount.value = '100000';
    localPeriod.value = '6';
    localInterestType.value = 'B';
    localJoinWay.value = 'all';
    
    emit('reset');
  };
  </script>
  
  <style scoped>
  .form-group {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
  }
  
  .form-group label {
    width: 80px;
    font-weight: 500;
    color: #666;
  }
  
  .form-control {
    flex: 1;
    max-width: 200px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: right;
  }
  
  .form-group span {
    margin-left: 8px;
    color: #666;
  }
  
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .radio-group label {
    display: flex;
    align-items: center;
    cursor: pointer;
    width: auto;
    font-weight: normal;
  }
  
  .radio-group input[type='radio'] {
    margin-right: 4px;
  }
  
  .button-group {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    margin-bottom: 30px;
  }
  
  .search-btn {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .search-btn:hover {
    background-color: #3e9142;
  }
  
  .reset-btn {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .reset-btn:hover {
    background-color: #e8e8e8;
  }
  </style>