<template>
  <div class="filter-container">
    <!-- 검색 입력 -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          :value="searchQuery"
          type="text"
          class="search-input"
          placeholder="상품명이나 은행명 검색..."
          @input="handleSearchInput"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>

    <!-- 필터 섹션 -->
    <div class="filter-section">
      <div class="filter-row">
        <!-- 상품 유형 -->
        <div class="filter-item">
          <div class="filter-header">
            <i class="fa-solid fa-layer-group filter-icon"></i>
            <span class="filter-label">상품 유형</span>
          </div>
          <v-select
            v-model="selectedType"
            :items="[
              { label: '전체 상품', value: '' },
              { label: '예금', value: '예금' },
              { label: '적금', value: '적금' },
              { label: '펀드', value: '펀드' },
              { label: '대출', value: '대출' },
              { label: '보험', value: '보험' },
              { label: '연금', value: '연금' },
            ]"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details
            class="custom-select"
          />
        </div>

        <!-- 정렬 방식 -->
        <div class="filter-item">
          <div class="filter-header">
            <i class="fa-solid fa-sort filter-icon"></i>
            <span class="filter-label">정렬 방식</span>
          </div>
          <v-select
            v-model="sortBy"
            :items="[
              { label: '이름순', value: 'name-asc' },
              { label: '인기순', value: 'wishlist-desc' },
              { label: '최신순', value: 'date-desc' },
            ]"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            hide-details
            class="custom-select"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  totalCount: {
    type: Number,
    default: 0,
  },
});

const searchQuery = ref('');
const selectedType = ref('');
const sortBy = ref('name-asc');

const emit = defineEmits(['filter-change']);

const hasActiveFilters = computed(() => {
  return selectedType.value || sortBy.value !== 'name-asc';
});

const getTypeLabel = (value) => {
  const typeMap = {
    예금: '예금',
    적금: '적금',
    펀드: '펀드',
    대출: '대출',
    보험: '보험',
    연금: '연금',
  };
  return typeMap[value] || value;
};

const getSortLabel = (value) => {
  const sortMap = {
    'name-asc': '이름순',
    'wishlist-desc': '인기순',
    'date-desc': '최신순',
  };
  return sortMap[value] || value;
};

// RecentViewFilter.vue의 clearSearch 함수 수정
const clearSearch = () => {
  searchQuery.value = '';
  // 검색어가 비워지면 즉시 필터 변경 이벤트 발생
  emitFilterChange();
};

// handleSearchInput 함수도 수정 - 디바운싱 추가
let searchTimeout = null;

const handleSearchInput = (event) => {
  searchQuery.value = event.target.value;

  // 이전 타이머 취소
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // 300ms 후에 필터 변경 이벤트 발생 (디바운싱)
  searchTimeout = setTimeout(() => {
    emitFilterChange();
  }, 300);
};
const emitFilterChange = () => {
  console.log('emitFilterChange 호출', {
    search: searchQuery.value,
    type: selectedType.value,
    sort: sortBy.value,
  });
  emit('filter-change', {
    search: searchQuery.value,
    type: selectedType.value,
    sort: sortBy.value,
  });
};

watch([searchQuery, selectedType, sortBy], () => {
  console.log('watch 감지됨', {
    searchQuery: searchQuery.value,
    selectedType: selectedType.value,
    sortBy: sortBy.value,
  });
  emitFilterChange();
});
</script>

<style scoped>
.filter-container {
  background: var(--color-white);
  border-radius: 1rem; /* 16px -> 1rem */
  padding: 1.5rem; /* 24px -> 1.5rem */
  margin-bottom: 1.25rem; /* 20px -> 1.25rem */
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.04); /* 2px 12px */
  border: 0.09375rem solid var(--color-light); /* 1.5px -> 0.09375rem */
}

/* 검색 섹션 */
.search-section {
  margin-bottom: 1.75rem; /* 28px */
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem; /* 16px */
  color: var(--color-sub);
  font-size: 1rem; /* 16px */
  z-index: 2;
}

.search-input {
  width: 100%;
  height: 3rem; /* 48px */
  padding: 0 3rem; /* 48px */
  font-size: 0.9375rem; /* 15px */
  border-radius: 0.75rem; /* 12px */
  transition: all 0.2s ease;
  border: 0.08rem solid #b3b7c6; /* 1.5px */
  background: var(--color-white);
  color: var(--color-main);
  font-weight: 400;
}

.search-input::placeholder {
  color: var(--color-light);
  opacity: 0.7;
  font-weight: 400;
}

.search-input:focus {
  outline: none; /* 기본 파란 아웃라인 제거 */
  border-color: var(--color-sub);
  background: var(--color-white);
  box-shadow: var(--color-sub);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem; /* 12px */
  width: 1.5rem; /* 24px */
  height: 1.5rem; /* 24px */
  border: none;
  border-radius: 50%;
  background: var(--color-light);
  color: var(--color-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.75rem; /* 12px */
}

.clear-search-btn:hover {
  background: var(--color-light);
  color: var(--color-main);
  transform: scale(1.05);
}

/* 필터 섹션 */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* 20px */
}

/* 상품 유형, 정렬 한 줄 배치 */
.filter-row {
  display: flex;
  gap: 1.25rem; /* 20px */
}

.filter-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 8px */
  margin-bottom: 0.75rem; /* 12px */
}

.filter-icon {
  color: var(--color-main);
  font-size: 0.875rem; /* 14px */
}

.filter-label {
  font-size: 0.875rem; /* 14px */
  font-weight: 600;
  color: var(--color-main);
}

/* 커스텀 셀렉트 스타일링 */
.filter-item :deep(.v-field) {
  border: none;
  color: var(--color-main);
  background: var(--color-white) !important;
}

.filter-item :deep(.v-field--focused) {
  outline: none; /* 기본 파란 아웃라인 제거 */
  border-color: var(--color-sub);
  background: var(--color-white);
  box-shadow: var(--color-sub);
}

.filter-item :deep(.v-field__input) {
  padding: 0.75rem 1rem !important; /* 12px 16px */
  font-size: 0.9375rem !important; /* 15px */
  color: var(--color-main) !important;
}

.filter-item :deep(.v-field__append-inner) {
  padding-right: 1rem !important; /* 16px */
}

.filter-item :deep(.v-select__selection-text) {
  color: var(--color-main) !important;
}

/* 반응형 */
@media (max-width: 48rem) {
  /* 768px */
  .filter-container {
    padding: 1.25rem; /* 20px */
    border-radius: 0.75rem; /* 12px */
    margin-bottom: 1rem; /* 16px */
  }

  .search-section {
    margin-bottom: 1.5rem; /* 24px */
  }

  .search-input {
    height: 2.75rem; /* 44px */
    font-size: 0.875rem; /* 14px */
    padding: 0 2.75rem; /* 44px */
  }

  /* 모바일에서 세로로 쌓이도록 */
  .filter-row {
    flex-direction: row;
    gap: 1rem; /* 16px */
  }
}

@media (max-width: 30rem) {
  /* 480px */
  .filter-container {
    padding: 1rem; /* 16px */
    margin-bottom: 0.75rem; /* 12px */
  }

  .search-section {
    margin-bottom: 1.25rem; /* 20px */
  }

  .search-input {
    height: 2.625rem; /* 42px */
    font-size: 0.875rem; /* 14px */
    border-radius: 0.625rem; /* 10px */
  }

  .filter-header {
    margin-bottom: 0.625rem; /* 10px */
  }

  .filter-label {
    font-size: 0.8125rem; /* 13px */
  }

  .filter-icon {
    font-size: 0.8125rem; /* 13px */
  }

  .filter-item :deep(.v-field) {
    min-height: 2.625rem !important; /* 42px */
    border-radius: 0.625rem !important; /* 10px */
  }

  .filter-item :deep(.v-field__input) {
    padding: 0.625rem 0.875rem !important; /* 10px 14px */
    font-size: 0.875rem !important; /* 14px */
  }
}
</style>
