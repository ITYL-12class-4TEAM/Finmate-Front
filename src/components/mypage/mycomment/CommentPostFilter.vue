<template>
  <div class="post-filter">
    <div class="input-group">
      <span class="input-icon">
        <i class="bi bi-search"></i>
      </span>
      <input
        :value="searchQuery"
        @input="
          $emit('update:searchQuery', $event.target.value);
          $emit('filter');
        "
        type="text"
        class="input-text"
        placeholder="게시글 제목이나 작성자 검색..."
      />
    </div>

    <select
      :value="selectedBoard"
      @change="
        $emit('update:selectedBoard', $event.target.value);
        $emit('filter');
      "
      class="select"
    >
      <option value="">전체 게시판</option>
      <option value="FREE">자유게시판</option>
      <option value="HOT">HOT게시판</option>
      <option value="NOTICE">공지사항</option>
    </select>
    <select
      :value="sortBy"
      @change="
        $emit('update:sortBy', $event.target.value);
        $emit('filter');
      "
      class="select"
    >
      <option value="comment-date-desc">최근 댓글순</option>
      <option value="post-date-desc">게시글 최신순</option>
      <option value="like-desc">좋아요 많은순</option>
      <option value="comment-count-desc">댓글 많은순</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: String,
  selectedBoard: String,
  sortBy: String,
});

defineEmits([
  'update:searchQuery',
  'update:selectedBoard',
  'update:sortBy',
  'filter',
]);
</script>
<style scoped>
.post-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
}

.input-text {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.95rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
}

.select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background-color: #fff;
  appearance: none;
}
</style>
