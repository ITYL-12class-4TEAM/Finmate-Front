<template>
  <div class="notification-filter">
    <!-- 검색 섹션 -->
    <div class="search-section">
      <div class="search-wrapper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="search-icon"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="알림 검색..."
          class="search-input"
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
        />
      </div>
    </div>

    <!-- 필터 옵션 -->
    <div class="filter-options">
      <!-- 알림 유형 선택 -->
      <div class="filter-group">
        <label class="filter-label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="filter-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 0v.75m0-.75v-.75m9.75 12h-9.75m9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0m-.75 0h-.75M3.75 18h.75m0 0v-.75m0 .75v.75"
            />
          </svg>
          알림 유형
        </label>
        <select
          class="filter-select"
          :value="selectedFilter"
          @change="$emit('update:selectedFilter', $event.target.value)"
        >
          <option value="">전체 유형</option>
          <option value="success">성공</option>
          <option value="warning">경고</option>
          <option value="info">정보</option>
          <option value="error">오류</option>
          <option value="unread">읽지 않음</option>
        </select>
      </div>

      <!-- 정렬 옵션 -->
      <div class="filter-group">
        <label class="filter-label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="filter-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"
            />
          </svg>
          정렬 방식
        </label>
        <select
          class="sort-select"
          :value="sortBy"
          @change="$emit('update:sortBy', $event.target.value)"
        >
          <option value="date-desc">최신순</option>
          <option value="date-asc">오래된순</option>
          <option value="type-desc">유형순</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
  selectedFilter: {
    type: String,
    default: '',
  },
  sortBy: {
    type: String,
    default: 'date-desc',
  },
});

defineEmits(['update:searchQuery', 'update:selectedFilter', 'update:sortBy', 'filter']);
</script>

<style scoped>
.notification-filter {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 2px 8px -2px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.notification-filter:hover {
  border-color: rgba(185, 187, 204, 0.4);
  box-shadow: 0 4px 12px -2px rgba(45, 51, 107, 0.15);
}

.search-section {
  margin-bottom: 1rem;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  z-index: 1;
  width: 0.875rem;
  height: 0.875rem;
  color: var(--color-sub);
  transition: color 0.2s ease;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-main);
  font-size: 0.95rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-main);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
}

.search-input:focus + .search-icon {
  color: var(--color-main);
}

.search-input::placeholder {
  color: var(--color-sub);
  opacity: 0.7;
}

.filters-section {
  margin-bottom: 0;
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

.filter-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--color-sub);
  transition: color 0.2s ease;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--color-main);
  font-weight: 600;
}

.filter-select,
.sort-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(185, 187, 204, 0.4);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
}

.filter-select:focus,
.sort-select:focus {
  outline: none;
  border-color: var(--color-main);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
}

.filter-select:hover,
.sort-select:hover {
  border-color: rgba(185, 187, 204, 0.5);
  background: var(--color-white);
}
</style>
