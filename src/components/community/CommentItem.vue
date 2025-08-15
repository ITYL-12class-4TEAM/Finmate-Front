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
          <i class="fa-heart" :class="comment.liked ? 'fas' : 'far'"></i>
          <span class="count">{{ comment.likeCount }}</span>
        </button>

        <!-- 대댓글 작성 버튼 -->
        <button v-if="!isReply" class="reply-toggle-btn" @click="isReplying = !isReplying">
          <i class="fas fa-reply"></i>
          {{ isReplying ? '취소' : '댓글' }}
        </button>

        <button v-if="comment.isMine" class="delete-btn" @click="handleDelete(comment.commentId)">
          <i class="fas fa-trash"></i>
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
        <button class="reply-submit" :disabled="!replyContent.trim()" @click="handleReplySubmit">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>

    <!-- 대댓글 렌더링 -->
    <div v-if="childReplies.length" class="replies">
      <div v-for="reply in childReplies" :key="reply.commentId" class="reply-wrapper">
        <div class="reply-arrow">
          <i class="fas fa-reply fa-flip-horizontal"></i>
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
  try {
    await toggleCommentLikeAPI(id);
    // props를 직접 변경하지 않고 refresh로 업데이트
    if (props.refresh) await props.refresh();
  } catch (e) {
    console.error('좋아요 토글 실패:', e);
  }
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
  // eslint-disable-next-line no-unused-vars
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
  padding: 0.75rem; /* 12px / 16 */
  border-bottom: 0.0625rem solid #f1f3f4; /* 1px / 16 */
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
  margin-bottom: 0.5rem; /* 8px / 16 */
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 8px / 16 */
}

.author-avatar {
  width: 1.5rem; /* 24px / 16 */
  height: 1.5rem; /* 24px / 16 */
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  color: white;
  font-size: 0.625rem; /* 10px / 16 */
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0.0625rem 0.1875rem rgba(45, 51, 107, 0.1); /* 0 1px 3px / 16 */
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem; /* 2px / 16 */
}

.nickname {
  font-weight: 600;
  font-size: 0.75rem; /* 12px / 16 */
  color: var(--color-main);
}

.time {
  font-size: 0.625rem; /* 10px / 16 */
  color: #9ca3af;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.375rem; /* 6px / 16 */
}

.like-btn {
  background: none;
  border: none;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.25rem; /* 4px / 16 */
  font-size: 0.75rem; /* 12px / 16 */
  padding: 0.25rem 0.375rem; /* 4px 6px / 16 */
  border-radius: 0.25rem; /* 4px / 16 */
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

.like-btn i {
  font-size: 0.875rem; /* 14px / 16 */
}

.count {
  font-weight: 500;
}

.reply-toggle-btn {
  background: none;
  border: 0.0625rem solid var(--color-light); /* 1px / 16 */
  color: var(--color-sub);
  font-size: 0.625rem; /* 10px / 16 */
  display: flex;
  align-items: center;
  gap: 0.25rem; /* 4px / 16 */
  padding: 0.25rem 0.5rem; /* 4px 8px / 16 */
  border-radius: 1rem; /* 16px / 16 */
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
}

.reply-toggle-btn:hover {
  background: var(--color-bg-light);
  border-color: var(--color-sub);
  color: var(--color-main);
}

.reply-toggle-btn i {
  font-size: 0.75rem; /* 12px / 16 */
}

.delete-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.625rem; /* 10px / 16 */
  display: flex;
  align-items: center;
  gap: 0.25rem; /* 4px / 16 */
  padding: 0.25rem 0.375rem; /* 4px 6px / 16 */
  border-radius: 0.25rem; /* 4px / 16 */
  transition: all 0.2s ease;
  cursor: pointer;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.delete-btn i {
  font-size: 0.75rem; /* 12px / 16 */
}

/* 댓글 내용 */
.comment-content {
  margin-bottom: 0.5rem; /* 8px / 16 */
}

.comment-content p {
  font-size: 0.75rem; /* 12px / 16 */
  line-height: 1.5;
  color: #374151;
  margin: 0;
}

/* 대댓글 작성 폼 */
.reply-form {
  margin-top: 0.75rem; /* 12px / 16 */
  padding: 0.75rem; /* 12px / 16 */
  background: var(--color-bg-light);
  border-radius: 0.5rem; /* 8px / 16 */
  border: 0.0625rem solid rgba(185, 187, 204, 0.15); /* 1px / 16 */
}

.reply-form-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem; /* 8px / 16 */
}

.checkbox-label {
  font-size: 0.75rem; /* 12px / 16 */
  color: var(--color-sub);
  font-weight: 500;
}

.reply-input-container {
  display: flex;
  gap: 0.5rem; /* 8px / 16 */
  align-items: center;
}

.reply-input {
  flex: 1;
  padding: 0.5rem 0.75rem; /* 8px 12px / 16 */
  border: 0.0625rem solid rgba(185, 187, 204, 0.25); /* 1px / 16 */
  border-radius: 1.5rem; /* 24px / 16 */
  font-size: 0.75rem; /* 12px / 16 */
  background: white;
  transition: all 0.2s ease;
  outline: none;
  height: 2rem; /* 32px / 16 */
}

.reply-input:focus {
  border-color: var(--color-sub);
  box-shadow: 0 0 0 0.125rem rgba(125, 129, 162, 0.08); /* 0 0 0 2px / 16 */
}

.reply-input::placeholder {
  color: #9ca3af;
}

.reply-submit {
  background: var(--color-main);
  border: none;
  color: white;
  padding: 0.5rem; /* 8px / 16 */
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem; /* 32px / 16 */
  height: 2rem; /* 32px / 16 */
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

.reply-submit i {
  font-size: 0.875rem; /* 14px / 16 */
}

/* 대댓글 */
.replies {
  margin-top: 0.75rem; /* 12px / 16 */
  border-top: 0.0625rem solid #f1f3f4; /* 1px / 16 */
  padding-top: 0.75rem; /* 12px / 16 */
}

.reply-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem; /* 12px / 16 */
  margin-bottom: 0.5rem; /* 8px / 16 */
}

.reply-wrapper:last-child {
  margin-bottom: 0;
}

.reply-arrow {
  flex-shrink: 0;
  margin-top: 0.375rem; /* 6px / 16 */
  color: var(--color-light);
  opacity: 0.7;
}

.reply-arrow i {
  font-size: 0.75rem; /* 12px / 16 */
}

.reply {
  flex: 1;
  background: rgba(248, 250, 252, 0.5);
  border: 0.0625rem solid rgba(185, 187, 204, 0.1); /* 1px / 16 */
  border-radius: 0.5rem; /* 8px / 16 */
  padding: 0.75rem; /* 12px / 16 */
  transition: all 0.2s ease;
}

.reply:hover {
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(185, 187, 204, 0.2);
}

/* 반응형 - 모바일 기준 */
@media (max-width: 26.875rem) {
  /* 430px / 16 */
  .comment {
    padding: 0.625rem; /* 10px / 16 */
  }

  .author-avatar {
    width: 1.25rem; /* 20px / 16 */
    height: 1.25rem; /* 20px / 16 */
    font-size: 0.5625rem; /* 9px / 16 */
  }

  .action-buttons {
    gap: 0.25rem; /* 4px / 16 */
  }

  .reply-wrapper {
    gap: 0.5rem; /* 8px / 16 */
  }

  .reply-input-container {
    gap: 0.375rem; /* 6px / 16 */
  }

  .reply-submit {
    width: 1.75rem; /* 28px / 16 */
    height: 1.75rem; /* 28px / 16 */
  }

  .nickname {
    font-size: 0.6875rem; /* 11px / 16 */
  }

  .time {
    font-size: 0.5625rem; /* 9px / 16 */
  }

  .comment-content p {
    font-size: 0.6875rem; /* 11px / 16 */
  }

  .like-btn {
    font-size: 0.6875rem; /* 11px / 16 */
    padding: 0.1875rem 0.3125rem; /* 3px 5px / 16 */
  }

  .like-btn i {
    font-size: 0.8125rem; /* 13px / 16 */
  }

  .reply-toggle-btn i {
    font-size: 0.6875rem; /* 11px / 16 */
  }

  .delete-btn i {
    font-size: 0.6875rem; /* 11px / 16 */
  }

  .reply-submit i {
    font-size: 0.8125rem; /* 13px / 16 */
  }

  .reply-arrow i {
    font-size: 0.6875rem; /* 11px / 16 */
  }
}
</style>
