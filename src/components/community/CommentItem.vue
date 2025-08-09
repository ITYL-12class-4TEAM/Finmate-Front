<template>
  <div class="comment">
    <!-- 댓글 헤더 (작성자, 시각, 액션버튼들) -->
    <div class="comment-header">
      <div class="author-info">
        <div class="author-avatar">
          {{ (comment.nickname || '?').charAt(0).toUpperCase() }}
        </div>
        <div class="author-details">
          <span class="nickname">{{ comment.nickname }}</span>
          <span class="time">{{ formattedTime(comment.createdAt) }}</span>
        </div>
      </div>
      <div class="action-buttons">
        <button
          class="like-btn"
          :class="{ liked: comment.liked }"
          @click="toggleLike(comment.commentId)"
        >
          <svg v-if="comment.liked" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
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
          <span class="count">{{ comment.likeCount }}</span>
        </button>

        <!-- 대댓글 작성 버튼 -->
        <button v-if="!isReply" class="reply-toggle-btn" @click="isReplying = !isReplying">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>
          {{ isReplying ? '취소' : '댓글' }}
        </button>

        <button v-if="comment.isMine" class="delete-btn" @click="handleDelete(comment.commentId)">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
            />
          </svg>
          삭제
        </button>
      </div>
    </div>

    <!-- 댓글 내용 -->
    <div class="comment-content">
      <p>{{ comment.content }}</p>
    </div>

    <!-- 대댓글 입력창 -->
    <div v-if="isReplying" class="reply-form">
      <div class="reply-form-header">
        <CustomCheckbox id="reply-anonymous" v-model="isAnonymous">
          <span class="checkbox-label">익명</span>
        </CustomCheckbox>
      </div>
      <div class="reply-input-container">
        <input
          v-model="replyContent"
          placeholder="대댓글을 입력해주세요."
          class="reply-input"
          @keypress.enter="handleReplySubmit"
        />
        <button class="reply-submit" @click="handleReplySubmit" :disabled="!replyContent.trim()">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 대댓글 렌더링 -->
    <div v-if="childReplies.length" class="replies">
      <div v-for="reply in childReplies" :key="reply.commentId" class="reply-wrapper">
        <div class="reply-arrow">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </div>
        <CommentItem
          :comment="reply"
          :comments="comments"
          :refresh="refresh"
          :is-reply="true"
          class="reply"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import CommentItem from './CommentItem.vue';

import { toggleCommentLikeAPI } from '@/api/commentLike';
import { deleteCommentAPI, createCommentAPI } from '@/api/comments';

import { useModal } from '@/composables/useModal';

import CustomCheckbox from '@/components/community/CustomCheckbox.vue';

const props = defineProps({
  comment: Object,
  comments: Array,
  refresh: Function,
  isReply: {
    type: Boolean,
    default: false,
  },
});

const { showModal } = useModal();

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
  background: white;
  padding: 0.75rem;
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.2s ease;
}

.comment:hover {
  background: rgba(248, 250, 252, 0.8);
}

.comment:last-child {
  border-bottom: none;
}

/* 댓글 헤더 */
.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(45, 51, 107, 0.1);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.nickname {
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--color-main);
}

.time {
  font-size: 0.625rem;
  color: #9ca3af;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.like-btn {
  background: none;
  border: none;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.like-btn:hover {
  color: var(--color-sub);
  background: rgba(125, 129, 162, 0.05);
}

.like-btn.liked {
  color: #ef4444;
}

.like-btn.liked:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.05);
}

.count {
  font-weight: 500;
}

.reply-toggle-btn {
  background: none;
  border: 1px solid var(--color-light);
  color: var(--color-sub);
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
}

.reply-toggle-btn:hover {
  background: var(--color-bg-light);
  border-color: var(--color-sub);
  color: var(--color-main);
}

.delete-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

/* 댓글 내용 */
.comment-content {
  margin-bottom: 0.5rem;
}

.comment-content p {
  font-size: 0.75rem;
  line-height: 1.5;
  color: #374151;
  margin: 0;
}

/* 댓글 푸터 - 제거됨 */

/* 대댓글 작성 폼 */
.reply-form {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--color-bg-light);
  border-radius: 0.5rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
}

.reply-form-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.checkbox-label {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
}

.reply-input-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.reply-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.25);
  border-radius: 1.5rem;
  font-size: 0.75rem;
  background: white;
  transition: all 0.2s ease;
  outline: none;
  height: 2rem;
}

.reply-input:focus {
  border-color: var(--color-sub);
  box-shadow: 0 0 0 2px rgba(125, 129, 162, 0.08);
}

.reply-input::placeholder {
  color: #9ca3af;
}

.reply-submit {
  background: var(--color-main);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}

.reply-submit:hover:not(:disabled) {
  background: var(--color-sub);
  transform: scale(1.05);
}

.reply-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

/* 대댓글 */
.replies {
  margin-top: 0.75rem;
  border-top: 1px solid #f1f3f4;
  padding-top: 0.75rem;
}

.reply-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.reply-wrapper:last-child {
  margin-bottom: 0;
}

.reply-arrow {
  flex-shrink: 0;
  margin-top: 0.375rem;
  color: var(--color-light);
  opacity: 0.7;
}

.reply {
  flex: 1;
  background: rgba(248, 250, 252, 0.5);
  border: 1px solid rgba(185, 187, 204, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s ease;
}

.reply:hover {
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(185, 187, 204, 0.2);
}

/* 반응형 */
@media (max-width: 768px) {
  .comment {
    padding: 0.625rem;
  }

  .author-avatar {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.5625rem;
  }

  .action-buttons {
    gap: 0.25rem;
  }

  .reply-wrapper {
    gap: 0.5rem;
  }

  .reply-input-container {
    gap: 0.375rem;
  }

  .reply-submit {
    width: 1.75rem;
    height: 1.75rem;
  }

  .nickname {
    font-size: 0.6875rem;
  }

  .time {
    font-size: 0.5625rem;
  }

  .comment-content p {
    font-size: 0.6875rem;
  }

  .like-btn {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.3125rem;
  }
}
</style>
