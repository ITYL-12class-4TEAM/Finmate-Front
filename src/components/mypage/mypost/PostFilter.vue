<template>
  <div class="post-filter">
    <div class="filter-container">
      <!-- 검색 입력 -->
      <div class="search-wrapper">
        <div class="search-input-container">
          <i class="fa-solid fa-search search-icon"></i>
          <input
            :value="searchQuery"
            @input="handleSearchInput"
            type="text"
            class="search-input"
            placeholder="게시글 검색..."
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-btn"
            title="검색어 지우기"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 필터 옵션 -->
      <div class="filter-options">
        <!-- 상품 유형 선택 -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="fa-solid fa-layer-group"></i>
            게시판 유형
          </label>
          <div class="custom-select">
            <select
              :value="selectedType"
              @change="handleTypeChange"
              class="select-input"
            >
              <option value="">전체 게시판</option>
              <option value="FREE">자유게시판</option>
            </select>
            <i class="fa-solid fa-chevron-down select-arrow"></i>
          </div>
        </div>

        <!-- 정렬 옵션 -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="fa-solid fa-sort"></i>
            정렬 방식
          </label>
          <div class="custom-select">
            <select
              :value="sortBy"
              @change="handleSortChange"
              class="select-input"
            >
              <option value="date-desc">최신순</option>
              <option value="date-asc">오래된순</option>
              <option value="like-desc">좋아요 많은순</option>
              <option value="comment-desc">댓글 많은순</option>
            </select>
            <i class="fa-solid fa-chevron-down select-arrow"></i>
          </div>
        </div>
      </div>

      <!-- 필터 상태 표시 -->
      <div v-if="hasActiveFilters" class="active-filters">
        <span class="filter-status">
          <i class="fa-solid fa-filter"></i>
          필터 적용됨
        </span>
        <button @click="clearAllFilters" class="clear-all-btn">
          <i class="fa-solid fa-times"></i>
          전체 초기화
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  searchQuery: String,
  selectedType: String,
  sortBy: String,
});

const emit = defineEmits([
  'update:searchQuery',
  'update:selectedType',
  'update:sortBy',
  'filter',
]);
// 활성 필터 여부 확인
const hasActiveFilters = computed(() => {
  return props.searchQuery || props.selectedType;
});

// 이벤트 핸들러들
const handleSearchInput = (event) => {
  emit('update:searchQuery', event.target.value);
  emit('filter');
};

const handleTypeChange = (event) => {
  emit('update:selectedType', event.target.value);
  emit('filter');
};

const handleSortChange = (event) => {
  emit('update:sortBy', event.target.value);
  emit('filter');
};

const clearSearch = () => {
  emit('update:searchQuery', '');
  emit('filter');
};

const clearAllFilters = () => {
  emit('update:searchQuery', '');
  emit('update:selectedType', '');
  emit('update:sortBy', 'name-asc');
  emit('filter');
};
</script>

<style scoped>
.post-filter {
  margin-bottom: 1.5rem;
}

.filter-container {
  background: linear-gradient(
    135deg,
    var(--color-white) 0%,
    var(--color-bg-light) 100%
  );
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

/* 검색 입력 영역 */
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
  left: 1rem;
  color: var(--color-sub);
  font-size: 0.875rem;
  z-index: 2;
  transition: color 0.2s ease;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  font-size: 0.95rem;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-main);
}

.search-input::placeholder {
  color: var(--color-sub);
  opacity: 0.7;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-main);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
}

.search-input:focus + .search-icon,
.search-input-container:hover .search-icon {
  color: var(--color-main);
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
  width: 1.5rem;
  height: 1.5rem;
}

.clear-btn:hover {
  background: rgba(185, 187, 204, 0.2);
  color: var(--color-main);
}

/* 필터 옵션들 */
.filter-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-main);
}

.filter-label i {
  font-size: 0.75rem;
  color: var(--color-sub);
}

/* 커스텀 셀렉트 */
.custom-select {
  position: relative;
}

.select-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 0.9rem;
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

/* 활성 필터 상태 */
.active-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(45, 51, 107, 0.05) 0%,
    rgba(125, 129, 162, 0.03) 100%
  );
  border-radius: 0.75rem;
  border: 1px solid rgba(45, 51, 107, 0.15);
}

.filter-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-main);
}

.filter-status i {
  font-size: 0.75rem;
  color: var(--color-sub);
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-all-btn:hover {
  background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
  transform: translateY(-1px);
}

.clear-all-btn i {
  font-size: 0.7rem;
}

/* 로딩 상태 */
.post-filters.loading {
  opacity: 0.7;
  pointer-events: none;
}
</style>
