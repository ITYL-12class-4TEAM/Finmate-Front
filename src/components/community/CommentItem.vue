<template>
  <div class="comment">
    <div class="comment-header">
      <span class="nickname">{{ comment.nickname }}</span>
      <span class="time">{{ formattedTime(comment.createdAt) }}</span>
      <button
        v-if="comment.isMine"
        class="delete-btn"
        @click="handleDelete(comment.id)"
      >
        삭제
      </button>
    </div>

    <p class="comment-content">{{ comment.content }}</p>

    <div class="comment-footer">
      <button @click="toggleLike(comment.id)">
        <svg
          v-if="comment.liked"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-5"
        >
          <path
            d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218
         25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25
         2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052
         5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25
         0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17
         15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5
         -1.935 0-3.597 1.126-4.312 2.733
         -.715-1.607-2.377-2.733-4.313-2.733
         C5.1 3.75 3 5.765 3 8.25
         c0 7.22 9 12 9 12s9-4.78 9-12Z"
          />
        </svg>
        {{ comment.likeCount }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { toggleCommentLikeAPI } from '@/api/commentLike';
import { deleteCommentAPI } from '@/api/comments';

import { useModal } from '@/composables/useModal';

const props = defineProps({
  comment: Object,
  refresh: Function,
});

const showModal = useModal();

// 액션 핸들러
const toggleLike = async (id) => {
  const newStatus = await toggleCommentLikeAPI(id);
  props.comment.liked = newStatus;
  props.comment.likeCount += newStatus ? 1 : -1;
};

const handleDelete = async (id) => {
  if (!(await showModal('댓글을 삭제하시겠습니까?'))) return;
  try {
    await deleteCommentAPI(id);
    if (props.refresh) await props.refresh();
  } catch (e) {
    alert('댓글 삭제 실패');
  }
};

// 날짜 배열 포맷
const formattedTime = (arr) => {
  if (!arr || arr.length < 5) return '';
  const [_, month, day, hour, minute] = arr;
  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0'
  )} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};
</script>

<style scoped>
.comment {
  padding: 0.6rem 0;
  border-bottom: 1px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.2rem;
}

.comment-header .nickname {
  font-weight: 600;
  font-size: 0.8rem;
}

.comment-header .time {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.5);
  margin-left: 0.5rem;
}

.comment-content {
  font-size: 0.8rem;
  line-height: 1.5;
}

.delete-btn {
  background: none;
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-left: 1rem;
}

.comment-footer {
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.comment-footer button {
  background: none;
  color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
}

.comment-footer svg {
  width: 1rem;
  height: 1rem;
}
</style>
