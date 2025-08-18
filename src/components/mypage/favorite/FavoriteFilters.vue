<template>
  <div class="favorites-filters">
    <div class="filter-container">
      <!-- 검색 입력 -->
      <div class="search-wrapper">
        <div class="search-input-container">
          <i class="fa-solid fa-search search-icon"></i>
          <input
            :value="searchQuery"
            type="text"
            class="search-input"
            placeholder="상품명이나 은행명 검색..."
            @input="handleSearchInput"
          />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 필터 옵션들 (모든 화면에서 일렬) -->
      <div class="filter-options">
        <!-- 상품 유형 선택 -->
        <div class="filter-group">
          <label class="filter-label">상품 유형</label>
          <div ref="typeSelectRef" class="custom-select">
            <div
              class="select-trigger"
              :class="{ active: typeDropdownOpen }"
              @click="toggleTypeDropdown"
            >
              <span class="select-value">{{ getTypeLabel(selectedType) }}</span>
              <i
                class="fa-solid fa-chevron-down select-arrow"
                :class="{ rotated: typeDropdownOpen }"
              ></i>
            </div>
            <div class="select-dropdown" :class="{ open: typeDropdownOpen }">
              <div
                class="select-option"
                :class="{ selected: selectedType === '' }"
                @click="selectType('')"
              >
                전체 상품
              </div>
              <div
                class="select-option"
                :class="{ selected: selectedType === '예금' }"
                @click="selectType('예금')"
              >
                예금
              </div>
              <div
                class="select-option"
                :class="{ selected: selectedType === '적금' }"
                @click="selectType('적금')"
              >
                적금
              </div>
            </div>
          </div>
        </div>

        <!-- 정렬 옵션 -->
        <div class="filter-group">
          <label class="filter-label">정렬 방식</label>
          <div ref="sortSelectRef" class="custom-select">
            <div
              class="select-trigger"
              :class="{ active: sortDropdownOpen }"
              @click="toggleSortDropdown"
            >
              <span class="select-value">{{ getSortLabel(sortBy) }}</span>
              <i
                class="fa-solid fa-chevron-down select-arrow"
                :class="{ rotated: sortDropdownOpen }"
              ></i>
            </div>
            <div class="select-dropdown" :class="{ open: sortDropdownOpen }">
              <div
                class="select-option"
                :class="{ selected: sortBy === 'name-asc' }"
                @click="selectSort('name-asc')"
              >
                이름순
              </div>
              <div
                class="select-option"
                :class="{ selected: sortBy === 'wishlist-desc' }"
                @click="selectSort('wishlist-desc')"
              >
                인기순
              </div>
              <div
                class="select-option"
                :class="{ selected: sortBy === 'date-desc' }"
                @click="selectSort('date-desc')"
              >
                최신순
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  searchQuery: String,
  selectedType: String,
  sortBy: String,
});

const emit = defineEmits(['update:searchQuery', 'update:selectedType', 'update:sortBy', 'filter']);

// 드롭다운 상태
const typeDropdownOpen = ref(false);
const sortDropdownOpen = ref(false);
const typeSelectRef = ref(null);
const sortSelectRef = ref(null);

// 라벨 매핑
const getTypeLabel = (value) => {
  const labels = {
    '': '전체 상품',
    예금: '예금',
    적금: '적금',
    펀드: '펀드',
    대출: '대출',
    보험: '보험',
    연금: '연금',
  };
  return labels[value] || '전체 상품';
};

const getSortLabel = (value) => {
  const labels = {
    'name-asc': '이름순',
    'wishlist-desc': '인기순',
    'date-desc': '최신순',
  };
  return labels[value] || '이름순';
};

// 이벤트 핸들러
const handleSearchInput = (event) => {
  emit('update:searchQuery', event.target.value);
  emit('filter');
};

const clearSearch = () => {
  emit('update:searchQuery', '');
  emit('filter');
};

// 드롭다운 토글
const toggleTypeDropdown = () => {
  typeDropdownOpen.value = !typeDropdownOpen.value;
  if (typeDropdownOpen.value) {
    sortDropdownOpen.value = false;
  }
};

const toggleSortDropdown = () => {
  sortDropdownOpen.value = !sortDropdownOpen.value;
  if (sortDropdownOpen.value) {
    typeDropdownOpen.value = false;
  }
};

// 옵션 선택
const selectType = (value) => {
  emit('update:selectedType', value);
  emit('filter');
  typeDropdownOpen.value = false;
};

const selectSort = (value) => {
  emit('update:sortBy', value);
  emit('filter');
  sortDropdownOpen.value = false;
};

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (typeSelectRef.value && !typeSelectRef.value.contains(event.target)) {
    typeDropdownOpen.value = false;
  }
  if (sortSelectRef.value && !sortSelectRef.value.contains(event.target)) {
    sortDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.favorites-filters {
  margin-bottom: 1rem;
}

.filter-container {
  background: var(--color-white);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #f1f5f9;
}

.search-wrapper {
  margin-bottom: 1rem;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--color-sub);
  font-size: 0.875rem;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: var(--color-white);
  color: var(--color-main);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--color-light);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 1px var(--color-main);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--color-sub);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
}

.clear-btn:hover {
  background: #f3f4f6;
  color: var(--color-main);
}

/* 필터 옵션 - 모든 화면에서 일렬 배치 */
.filter-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-main);
}

/* 커스텀 셀렉트 */
.custom-select {
  position: relative;
  z-index: 10;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: var(--color-white);
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.select-trigger:hover {
  border-color: var(--color-main);
}

.select-trigger.active {
  border-color: var(--color-main);
  box-shadow: 0 0 0 1px var(--color-main);
}

.select-value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-arrow {
  color: var(--color-sub);
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.select-arrow.rotated {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-0.5rem);
  transition: all 0.2s ease;
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
}

.select-dropdown.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.select-option {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f8fafc;
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: #f8fafc;
}

.select-option.selected {
  background: var(--color-main);
  color: var(--color-white);
}

.select-option.selected:hover {
  background: var(--color-sub);
}

/* 스크롤바 스타일 */
.select-dropdown::-webkit-scrollbar {
  width: 4px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: #f8fafc;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 2px;
}

/* 모바일에서도 일렬 유지 */
@media (max-width: 768px) {
  .filter-container {
    padding: 0.875rem;
  }

  .search-wrapper {
    margin-bottom: 0.875rem;
  }

  .search-input {
    padding: 0.625rem 0.875rem 0.625rem 2.25rem;
    font-size: 0.8125rem;
  }

  .filter-options {
    gap: 0.75rem;
  }

  .filter-label {
    font-size: 0.75rem;
  }

  .select-trigger {
    padding: 0.4375rem 0.625rem;
    font-size: 0.75rem;
  }

  .select-option {
    padding: 0.4375rem 0.625rem;
    font-size: 0.75rem;
  }

  .select-arrow {
    font-size: 0.6875rem;
    margin-left: 0.375rem;
  }
}

@media (max-width: 480px) {
  .filter-container {
    padding: 0.75rem;
  }

  .search-input {
    padding: 0.5rem 0.75rem 0.5rem 2rem;
    font-size: 0.75rem;
  }

  .search-icon {
    left: 0.75rem;
    font-size: 0.8125rem;
  }

  .clear-btn {
    right: 0.625rem;
    width: 1.125rem;
    height: 1.125rem;
  }

  .filter-options {
    gap: 0.625rem;
  }

  .filter-label {
    font-size: 0.6875rem;
  }

  .select-trigger {
    padding: 0.375rem 0.5rem;
    font-size: 0.6875rem;
  }

  .select-option {
    padding: 0.375rem 0.5rem;
    font-size: 0.6875rem;
  }

  .select-arrow {
    font-size: 0.625rem;
    margin-left: 0.25rem;
  }
}

/* 애니메이션 개선 */
@media (prefers-reduced-motion: reduce) {
  .select-dropdown,
  .select-arrow,
  .select-trigger,
  .select-option {
    transition: none;
  }
}
</style>
