<template>
    <div class="pagination">
      <!-- 첫 페이지로 이동 -->
      <button 
        class="pagination-arrow" 
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        :class="{ disabled: currentPage === 1 }"
      >
        <span>«</span> <!-- 또는 아이콘 사용 -->
      </button>
      
      <!-- 이전 페이지 그룹으로 이동 -->
      <button 
        class="pagination-arrow" 
        @click="goToPage(Math.max(1, currentPage - maxPageButtons))"
        :disabled="currentPage === 1"
        :class="{ disabled: currentPage === 1 }"
      >
        <span>‹</span> <!-- 또는 아이콘 사용 -->
      </button>
      
      <!-- 페이지 번호 버튼 -->
      <button 
        v-for="page in displayedPages" 
        :key="page" 
        @click="goToPage(page)" 
        :class="{ active: currentPage === page }"
        class="pagination-number"
      >
        {{ page }}
      </button>
      
      <!-- 다음 페이지 그룹으로 이동 -->
      <button 
        class="pagination-arrow" 
        @click="goToPage(Math.min(totalPages, currentPage + maxPageButtons))"
        :disabled="currentPage >= totalPages"
        :class="{ disabled: currentPage >= totalPages }"
      >
        <span>›</span> <!-- 또는 아이콘 사용 -->
      </button>
      
      <!-- 마지막 페이지로 이동 -->
      <button 
        class="pagination-arrow" 
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        :class="{ disabled: currentPage === totalPages }"
      >
        <span>»</span> <!-- 또는 아이콘 사용 -->
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // props 정의
  const props = defineProps({
    totalPages: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    }
  });
  
  // emit 정의
  const emit = defineEmits(['page-change']);
  
  // 한 번에 표시할 페이지 버튼 수 (중앙에 현재 페이지 + 양쪽으로 표시할 페이지 수)
  const maxPageButtons = 5;
  
  // 화면에 표시할 페이지 번호 계산
  const displayedPages = computed(() => {
    const pages = [];
    
    // 시작 페이지 계산 (현재 페이지를 중앙에 배치)
    let startPage = Math.max(1, props.currentPage - Math.floor(maxPageButtons / 2));
    
    // 시작 페이지가 totalPages - maxPageButtons + 1보다 크면 조정
    const endPage = Math.min(props.totalPages, startPage + maxPageButtons - 1);
    
    // 시작 페이지 재조정 (총 페이지 버튼 수 유지)
    startPage = Math.max(1, endPage - maxPageButtons + 1);
    
    // 페이지 번호 생성
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  });
  
  // 페이지 이동 함수
  const goToPage = (page) => {
    if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
      emit('page-change', page);
    }
  };
  </script>
  
  <style scoped>
  .pagination {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin: 20px 0;
  }
  
  .pagination button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .pagination button:hover:not(.disabled):not(.active) {
    background-color: #f5f5f5;
    border-color: #ccc;
  }
  
  .pagination button.active {
    background-color: #2d336b; /* 메인 컬러 적용 */
    color: white;
    border-color: #2d336b;
  }
  
  .pagination button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination-arrow {
    font-weight: bold;
  }
  
  .pagination-number {
    font-weight: 500;
  }
  </style>