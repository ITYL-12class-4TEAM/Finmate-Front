<template>
  <div class="empty-state">
    <div class="text-center py-5">
      <i class="bi bi-file-text display-1 text-muted"></i>
      <h4 class="mt-3 text-muted">
        {{
          hasFilters ? '검색 결과가 없습니다' : '즐겨찾기한 상품이 없습니다.'
        }}
      </h4>
      <p class="text-muted">
        {{
          hasFilters
            ? '다른 검색어나 필터를 시도해보세요.'
            : '관심 있는 금융 상품을 즐겨찾기에 추가해보세요.'
        }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hasFilters: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}
</style>
