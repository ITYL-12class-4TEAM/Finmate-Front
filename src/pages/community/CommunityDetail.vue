<template>
  <div class="community-detail">
    <BackButton :to="backTo" />

    <div v-if="post" class="post-main">
      <!-- 게시글 상단 -->
      <div class="post-header">
        <div class="author-avatar">
          {{ (post.nickname || '?').charAt(0).toUpperCase() }}
        </div>
        <div class="author-info">
          <span class="nickname">{{ post.nickname }}</span>
          <span class="time">{{ formattedTime(post.createdAt) }}</span>
        </div>

        <!-- 수정/삭제 버튼 (작성자일 경우) -->
        <div v-if="post.isMine" class="post-actions">
          <button class="btn-edit" @click="goToEditPage">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            수정
          </button>
          <button class="btn-delete" @click="deletePost">
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

      <!-- 게시글 본문 -->
      <div class="post-content">
        <h2 class="title">{{ post.title }}</h2>
        <p class="body-text">{{ post.content }}</p>

        <div v-if="post.tags && post.tags.length" class="tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">#{{ tag }}</span>
        </div>

        <!-- 반응 영역 -->
        <div class="reactions">
          <!-- 좋아요 버튼 -->
          <button class="reaction-btn" :class="{ liked: post.liked }" @click="toggleLike">
            <svg
              v-if="post.liked"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
            <span class="count">{{ post.likes || 0 }}</span>
          </button>

          <!-- 스크랩 버튼 -->
          <button class="reaction-btn" :class="{ scraped: post.scraped }" @click="toggleScrap">
            <svg
              v-if="post.scraped"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span class="count">{{ post.scraps || 0 }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 댓글 작성 -->
    <div class="comment-write">
      <div class="comment-write-header">
        <CustomCheckbox id="comment-anonymous" v-model="isAnonymous">
          <span class="checkbox-label">익명</span>
        </CustomCheckbox>
      </div>
      <div class="comment-input-container">
        <input
          v-model="newComment"
          placeholder="댓글을 입력해주세요."
          class="comment-input"
          @keypress.enter="submitComment"
        />
        <button class="comment-submit" @click="submitComment" :disabled="!newComment.trim()">
          <svg
            width="16"
            height="16"
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

    <!-- 댓글 목록 -->
    <div class="comment-section">
      <div class="comment-header">
        <h3 class="comment-count">댓글 {{ comments.length }}개</h3>
      </div>
      <div class="comments-list">
        <CommentItem
          v-for="comment in comments.filter((c) => !c.parentComment)"
          :key="comment.commentId"
          :comment="comment"
          :comments="comments"
          :refresh="fetchComments"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BackButton from '@/components/common/BackButton.vue';
import CommentItem from '@/components/community/CommentItem.vue';
import CustomCheckbox from '@/components/community/CustomCheckbox.vue';

import { getPostByIdAPI, deletePostAPI } from '@/api/posts';
import { getCommentsByPostId, createCommentAPI } from '@/api/comments';
import { togglePostLikeAPI } from '@/api/postLike';
import { togglePostScrapAPI } from '@/api/postScrap';

import { useModal } from '@/composables/useModal';
import { useAuthStore } from '@/stores/useAuthStore';

// 전역번수/ref 선언
const route = useRoute();
const router = useRouter();
const { showModal } = useModal();
const authStore = useAuthStore();

const memberId = computed(() => authStore.userInfo?.memberId || null);

const postId = route.params.id;

const post = ref(null);
const comments = ref([]);
const newComment = ref('');
const isAnonymous = ref(false);

// 날짜 배열 포맷: [2024, 7, 25, 13, 45] → "07/25 13:45"
const formattedTime = (arr) => {
  if (!arr || arr.length < 5) return '';
  const [_, month, day, hour, minute] = arr;
  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0'
  )} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// API 함수
const fetchPostDetail = async () => {
  try {
    post.value = await getPostByIdAPI(postId, memberId.value);
    // post.value = mockPost;
  } catch (e) {
    // alert('게시물을 불러오지 못했습니다.');
    console.error('게시글 불러오기 실패:', e);
  }
};

const fetchComments = async () => {
  try {
    comments.value = await getCommentsByPostId(postId, memberId.value);
    // comments.value = mockComments;
  } catch (e) {
    // alert('댓글을 불러오지 못했습니다.');
    console.error('댓글 불러오기 실패:', e);
  }
};

// 액션 핸들러
const toggleLike = async () => {
  try {
    const newStatus = await togglePostLikeAPI(postId);
    post.value.liked = newStatus;

    // 좋아요 개수 업데이트
    if (newStatus) {
      post.value.likes = (post.value.likes || 0) + 1;
    } else {
      post.value.likes = Math.max((post.value.likes || 0) - 1, 0);
    }
  } catch (e) {
    console.error('좋아요 토글 실패:', e);
    alert('좋아요 처리에 실패했습니다.');
  }
};

const toggleScrap = async () => {
  try {
    const newStatus = await togglePostScrapAPI(postId);
    post.value.scraped = newStatus;

    // 스크랩 개수 업데이트
    if (newStatus) {
      post.value.scraps = (post.value.scraps || 0) + 1;
    } else {
      post.value.scraps = Math.max((post.value.scraps || 0) - 1, 0);
    }
  } catch (e) {
    console.error('스크랩 토글 실패:', e);
    alert('스크랩 처리에 실패했습니다.');
  }
};

const goToEditPage = () => {
  router.push({ name: 'CommunityEdit', params: { id: post.value.id } });
};

const deletePost = async () => {
  if (!(await showModal('정말 삭제하시겠습니까?'))) return;
  try {
    await deletePostAPI(postId);
    router.push('/community');
  } catch (e) {
    alert('삭제 실패');
  }
};

const backTo = computed(() => {
  if (route.query.from === 'home') return '/';
  return '/community';
});

// 댓글 등록
const submitComment = async () => {
  const content = newComment.value.trim();
  if (!content) return;

  const commentData = {
    postId: Number(postId),
    content: content,
    anonymous: isAnonymous.value,
    parentComment: null,
  };

  try {
    await createCommentAPI(commentData);
    newComment.value = '';
    await fetchComments();
  } catch (e) {
    alert('댓글 등록 실패');
  }
};

onMounted(() => {
  fetchPostDetail();
  fetchComments();
});
</script>

<style scoped>
.community-detail {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1rem;
}

/* 게시글 메인 */
.post-main {
  background: white;
  border-radius: 0.875rem;
  padding: 1rem;
  margin-top: 1rem;
  border: 0.0625rem solid #f3f4f6;
  box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.post-main:hover {
  border-color: var(--color-light);
  box-shadow: 0 0.25rem 1rem rgba(45, 51, 107, 0.06);
}

/* 게시글 헤더 */
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 0.0625rem solid #f3f4f6;
}

.author-avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.15);
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  margin-left: 0.75rem;
}

.nickname {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-main);
}

.time {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* 액션 버튼 */
.post-actions {
  display: flex;
  gap: 0.375rem;
}

.post-actions button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;
  border: 0.0625rem solid transparent;
}

.btn-edit {
  background: var(--color-bg-light);
  color: var(--color-sub);
  border-color: rgba(185, 187, 204, 0.3);
}

.btn-edit:hover {
  background: var(--color-light);
  color: var(--color-main);
  border-color: var(--color-sub);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.3);
}

/* 게시글 본문 */
.post-content {
  line-height: 1.6;
}

.title {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.body-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 1.5rem;
  white-space: pre-line;
}

/* 태그 */
.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.tag {
  background: var(--color-bg-light);
  color: var(--color-sub);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  border: 0.0625rem solid rgba(185, 187, 204, 0.2);
}

/* 반응 영역 */
.reactions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 0.0625rem solid #f3f4f6;
}

.reaction-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.reaction-btn:hover {
  color: var(--color-sub);
}

.reaction-btn.liked {
  color: #ef4444;
}

.reaction-btn.liked:hover {
  color: #dc2626;
}

.reaction-btn.scraped {
  color: var(--color-main);
}

.reaction-btn.scraped:hover {
  color: var(--color-sub);
}

.count {
  font-weight: 500;
}

/* 댓글 작성 */
.comment-write {
  background: var(--color-bg-light);
  border-radius: 0.75rem;
  padding: 0.75rem;
  margin-top: 1.5rem;
  border: 0.0625rem solid rgba(185, 187, 204, 0.25);
}

.comment-write-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.checkbox-label {
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 500;
}

.comment-input-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 0.0625rem solid rgba(185, 187, 204, 0.3);
  border-radius: 1.5rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
  outline: none;
}

.comment-input:focus {
  border-color: var(--color-sub);
  box-shadow: 0 0 0 0.1875rem rgba(125, 129, 162, 0.1);
}

.comment-input::placeholder {
  color: #9ca3af;
}

.comment-submit {
  background: var(--color-main);
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
}

.comment-submit:hover:not(:disabled) {
  background: var(--color-sub);
  transform: scale(1.05);
}

.comment-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

/* 댓글 섹션 */
.comment-section {
  margin-top: 2rem;
}

.comment-header {
  margin-bottom: 1rem;
}

.comment-count {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 반응형 */
@media (max-width: 768px) {
  .community-detail {
    padding: 0.75rem;
  }

  .post-main {
    padding: 0.75rem;
  }

  .title {
    font-size: 1rem;
  }

  .body-text {
    font-size: 0.75rem;
  }

  .post-actions {
    flex-direction: column;
    gap: 0.25rem;
  }

  .post-actions button {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
  }

  .reactions {
    gap: 0.75rem;
  }

  .comment-submit {
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
