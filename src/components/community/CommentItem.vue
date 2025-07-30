<template>
  <div class="comment">
    <!-- 댓글 헤더 (작성자, 시각, 삭제) -->
    <div class="comment-header">
      <span class="nickname">{{ comment.nickname }}</span>
      <span class="time">{{ formattedTime(comment.createdAt) }}</span>
      <button
        v-if="comment.isMine"
        class="delete-btn"
        @click="handleDelete(comment.commentId)"
      >
        삭제
      </button>
    </div>

    <!-- 댓글 내용 -->
    <p class="comment-content">{{ comment.content }}</p>

    <!-- 댓글 푸터 (좋아요, 대댓글 작성) -->
    <div class="comment-footer">
      <button @click="toggleLike(comment.commentId)">
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

      <!-- 대댓글 작성 버튼 -->
      <button
        v-if="!isReply"
        class="reply-toggle-btn"
        @click="isReplying = !isReplying"
      >
        {{ isReplying ? '취소' : '댓글' }}
      </button>
    </div>

    <!-- 대댓글 입력창 -->
    <div class="reply-form" v-if="isReplying">
      <div class="anonymous-toggle">
        <input type="checkbox" v-model="isAnonymous" class="custom-checkbox" />
        <div class="anonymous-label">익명</div>
      </div>
      <input
        v-model="replyContent"
        placeholder="대댓글을 입력해주세요."
        class="reply-input"
      />
      <button @click="handleReplySubmit" class="reply-submit">등록</button>
    </div>

    <!-- 대댓글 렌더링 -->
    <div class="replies" v-if="childReplies.length">
      <CommentItem
        v-for="reply in childReplies"
        :key="reply.commentId"
        :comment="reply"
        :comments="comments"
        :refresh="refresh"
        :is-reply="true"
        class="reply"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import CommentItem from './CommentItem.vue';

import { toggleCommentLikeAPI } from '@/api/commentLike';
import { deleteCommentAPI, createCommentAPI } from '@/api/comments';

import { useModal } from '@/composables/useModal';

const props = defineProps({
  comment: Object,
  comments: Array,
  refresh: Function,
  isReply: {
    type: Boolean,
    default: false,
  },
});

const showModal = useModal();

const replyContent = ref('');
const isReplying = ref(false);
const isAnonymous = ref(false);

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

const handleReplySubmit = async () => {
  if (!replyContent.value.trim()) return;

  try {
    await createCommentAPI({
      postId: props.comment.postId,
      content: replyContent.value,
      anonymous: isAnonymous.value,
      parentComment: props.comment.commentId,
    });

    replyContent.value = '';
    isReplying.value = false;

    if (props.refresh) await props.refresh();
  } catch (e) {
    alert('대댓글 작성 실패');
  }
};

// 자식댓글 처리
const childReplies = computed(() =>
  props.comments.filter((c) => c.parentComment === props.comment.commentId)
);

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
  border-bottom: 0.5px solid var(--color-light);
}

/* 댓글 헤더 */
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

.delete-btn {
  background: none;
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-left: 1rem;
}

/* 댓글 내용 */
.comment-content {
  font-size: 0.8rem;
  line-height: 1.5;
  margin-bottom: 0.4rem;
}

/* 댓글 푸터 (좋아요) */
.comment-footer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.comment-footer button {
  background: none;
  color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.75rem;
}

.comment-footer svg {
  width: 1rem;
  height: 1rem;
}

/* 대댓글 작성 */
.reply-form {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.reply-toggle-btn {
  border: 0.2px solid var(--color-light);
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
}

.anonymous-toggle {
  display: flex;
  align-items: center;
  padding-left: 0.3rem;
}

.anonymous-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 0.3rem;
}

.custom-checkbox {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--color-main);
  background-color: var(--color-white);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.custom-checkbox:checked {
  background-color: var(--color-sub);
  border: 1px solid var(--color-sub);
}

.custom-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.reply-input {
  flex: 1;
  padding: 0.3rem;
  border-radius: 6px;
  font-size: 0.8rem;
  border: 0.5px solid var(--color-light);
}

.reply-submit {
  font-size: 0.8rem;
  border-radius: 6px;
  padding: 0 0.5rem;
}

/* 대댓글 */
.replies {
  margin-left: 2rem;
  margin-top: 1rem;
  padding: 0 0.6rem;
  background-color: var(--color-bg-light);
  border-radius: 10px;
}

.replies .reply:last-child {
  border-bottom: none;
}
</style>
