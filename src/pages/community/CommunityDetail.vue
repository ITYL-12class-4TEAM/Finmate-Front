<template>
  <div class="community-detail">
    <!-- 상단 헤더 바 -->
    <div class="header-bar">
      <BackButton :to="backTo" class="back-button" />
      <h1 class="board-title">게시판</h1>
      <div class="more-menu">
        <button class="more-button" @click="toggleMoreMenu">
          <i class="fas fa-ellipsis-v"></i>
        </button>

        <!-- 더보기 드롭다운 메뉴 -->
        <div v-if="showMoreMenu" class="more-dropdown" @click.stop>
          <button class="dropdown-item" @click="reportPost">
            <i class="fas fa-exclamation-triangle"></i>
            신고
          </button>
          <button class="dropdown-item" @click="blockUser">
            <i class="fas fa-ban"></i>
            차단
          </button>
          <button class="dropdown-item" @click="shareUrl">
            <i class="fas fa-share"></i>
            URL 공유
          </button>
        </div>
      </div>
    </div>

    <div class="content-container">
      <div v-if="post" class="post-main">
        <!-- 게시글 상단 -->
        <div class="post-header">
          <div class="author-section">
            <div class="author-avatar">
              {{ (post.nickname || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="author-info">
              <span class="nickname">{{ post.nickname }}</span>
              <span class="time">{{ formattedTime(post.createdAt) }}</span>
            </div>
          </div>

          <!-- 수정/삭제 버튼 (작성자일 경우) -->
          <div v-if="post.isMine" class="post-actions">
            <button class="btn-edit" @click="goToEditPage">수정</button>
            <button class="btn-delete" @click="deletePost">삭제</button>
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
              <i class="fa-heart" :class="post.liked ? 'fas' : 'far'"></i>
              <span class="count">{{ post.likes || 0 }}</span>
            </button>

            <button class="reaction-btn" aria-label="댓글 보기" @click="toggleComments">
              <i class="fas fa-comment"></i>
              <span class="count">{{ comments.length }}</span>
            </button>
            <!-- 스크랩 버튼 -->
            <button class="reaction-btn" :class="{ scraped: post.scraped }" @click="toggleScrap">
              <i class="fa-bookmark" :class="post.scraped ? 'fas' : 'far'"></i>
              <span class="count">{{ post.scraps || 0 }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 웹에서만 보이는 댓글 작성 -->
      <div class="comment-write web-only">
        <CustomCheckbox id="comment-anonymous" v-model="isAnonymous">
          <span class="checkbox-label">익명</span>
        </CustomCheckbox>
        <input
          v-model="newComment"
          placeholder="댓글을 입력해주세요."
          class="comment-input"
          @keypress.enter="submitComment"
        />
        <button class="comment-submit" :disabled="!newComment.trim()" @click="submitComment">
          등록
        </button>
      </div>

      <!-- 댓글 목록 -->
      <div class="comment-section">
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

    <!-- 모바일에서만 보이는 하단 고정 댓글 작성 -->
    <div class="comment-write-fixed mobile-only">
      <div class="comment-write-container">
        <CustomCheckbox id="comment-anonymous-mobile" v-model="isAnonymous">
          <span class="checkbox-label">익명</span>
        </CustomCheckbox>
        <input
          v-model="newComment"
          placeholder="댓글을 입력해주세요."
          class="comment-input"
          @keypress.enter="submitComment"
        />
        <button class="comment-submit" :disabled="!newComment.trim()" @click="submitComment">
          등록
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
import { useToast } from '@/composables/useToast';

// 전역번수/ref 선언
const route = useRoute();
const router = useRouter();
const { showModal } = useModal();
const { showToast } = useToast();
const authStore = useAuthStore();

const memberId = computed(() => authStore.userInfo?.memberId || null);

const postId = route.params.id;

const post = ref(null);
const comments = ref([]);
const newComment = ref('');
const isAnonymous = ref(false);
const showMoreMenu = ref(false);

// 날짜 배열 포맷: [2024, 7, 25, 13, 45] → "07/25 13:45"
const formattedTime = (arr) => {
  if (!arr || arr.length < 5) return '';
  // eslint-disable-next-line no-unused-vars
  const [_, month, day, hour, minute] = arr;
  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0'
  )} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// 더보기 메뉴 토글
const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value;
};

// 외부 클릭 시 메뉴 닫기
const handleClickOutside = (event) => {
  if (!event.target.closest('.more-menu')) {
    showMoreMenu.value = false;
  }
};
// 더보기 메뉴 기능들
const reportPost = async () => {
  showMoreMenu.value = false;
  if (await showModal('이 게시글을 신고하시겠습니까?')) {
    // 신고 API 호출
    showToast('신고가 접수되었습니다.', 'success');
  }
};

const blockUser = async () => {
  showMoreMenu.value = false;
  if (await showModal(`${post.value?.nickname}님을 차단하시겠습니까?`)) {
    // 차단 API 호출
    showToast('사용자가 차단되었습니다.', 'success');
  }
};

const shareUrl = async () => {
  showMoreMenu.value = false;
  const currentUrl = window.location.href;

  try {
    if (navigator.share) {
      // 모바일 네이티브 공유
      await navigator.share({
        title: post.value?.title || '게시글',
        url: currentUrl,
      });
    } else {
      // 클립보드 복사
      await navigator.clipboard.writeText(currentUrl);
      showToast('URL이 클립보드에 복사되었습니다.', 'success');
    }
    showToast('URL이 클립보드에 복사되었습니다.', 'success');
  } catch (error) {
    showToast('URL 공유에 실패했습니다.', 'error');
  }
};

// API 함수
const fetchPostDetail = async () => {
  try {
    post.value = await getPostByIdAPI(postId, memberId.value);
  } catch (e) {
    const status = e?.response?.status ?? e?.status ?? null;

    if (status === 404) {
      showToast('게시글을 찾을 수 없습니다.', 'error');
      router.push('/community');
    } else {
      showToast('게시글 불러오기 실패', 'error');
    }
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
    const status = e?.response?.status ?? e?.status ?? null;

    if (status === 401) {
      showToast('로그인이 필요한 기능입니다', 'warning');
    } else {
      showToast('좋아요 처리에 실패했습니다.', 'error');
    }
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
    const status = e?.response?.status ?? e?.status ?? null;

    if (status === 401) {
      showToast('로그인이 필요한 기능입니다', 'warning');
    } else {
      showToast('스크랩 처리에 실패했습니다.', 'error');
    }
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
    const status = e?.response?.status ?? e?.status ?? null;

    if (status === 401) {
      showToast('로그인이 필요한 기능입니다', 'warning');
    } else {
      showToast('댓글 처리에 실패했습니다.', 'error');
    }
  }
};

onMounted(() => {
  fetchPostDetail();
  fetchComments();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.stat-item {
  display: flex;
  align-items: center;
  gap: 0.1875rem;
  color: #9ca3af;
  transition: color 0.2s ease;
  cursor: pointer;
  padding: 0.1875rem;
  border-radius: 0.25rem;
}

.stat-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.interaction-icon {
  color: #6b7280;
}

.stat-count {
  font-size: 0.625rem;
  font-weight: 500;
}

.community-detail {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0;
}

.content-container {
  padding-bottom: 6rem; /* 모바일 하단 고정 댓글 입력란 공간 확보 */
}

/* 헤더 바 */
.header-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.25rem;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.back-button {
  position: absolute;
  left: 1.25rem;
}

.board-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
}

.more-menu {
  position: absolute;
  right: 1.25rem;
}

.more-button {
  background: none;
  border: none;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.more-button:hover {
  background: #f3f4f6;
  color: var(--color-main);
}

.more-button i {
  font-size: 1.25rem;
}

.more-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  min-width: 9rem;
  z-index: 20;
  margin-top: 0.25rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: #f3f4f6;
  color: var(--color-main);
}

.dropdown-item:first-child:hover {
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
}

.dropdown-item i {
  font-size: 1rem;
  width: 1rem;
  text-align: center;
}

/* 게시글 메인 */
.post-main {
  background: white;
  padding: 1rem;
  margin: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

/* 게시글 헤더 */
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.author-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.author-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--color-sub);
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.15);
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-left: 0.75rem;
}

.nickname {
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--color-main);
}

.time {
  font-size: 0.6875rem;
  color: #9ca3af;
}

/* 액션 버튼 - 일렬로 글자만 */
.post-actions {
  display: flex;
  gap: 0.75rem;
}

.post-actions button {
  background: none;
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.btn-edit {
  color: var(--color-sub);
}

.btn-edit:hover {
  color: var(--color-main);
  background: rgba(125, 129, 162, 0.05);
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.05);
}

/* 게시글 본문 */
.post-content {
  line-height: 1.6;
}

.title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.body-text {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #374151;
  margin-bottom: 1rem;
  white-space: pre-line;
}

/* 태그 */
.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tag {
  background: var(--color-bg-light);
  color: var(--color-sub);
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.25rem 0.625rem;
  border-radius: 0.875rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  transition: all 0.2s ease;
}

.tag:hover {
  background: rgba(185, 187, 204, 0.1);
  border-color: var(--color-sub);
}

/* 반응 영역 */
.reactions {
  display: flex;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.reaction-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--color-sub);
  font-size: 0.8125rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: 500;
}

.reaction-btn:hover {
  color: var(--color-sub);
  background: rgba(185, 187, 204, 0.05);
  transform: translateY(-1px);
}

.reaction-btn.liked {
  color: #ef4444;
}

.reaction-btn.liked:hover {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.05);
}

.reaction-btn.scraped {
  color: var(--color-sub);
}

.reaction-btn.scraped:hover {
  color: var(--color-sub);
  background: rgba(125, 129, 162, 0.05);
}

.reaction-btn i {
  font-size: 1rem;
}

.count {
  font-weight: 600;
}

/* 댓글 작성 - 웹 전용 */
.comment-write {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  margin: 1rem 1.25rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.checkbox-label {
  font-size: 0.8125rem;
  color: var(--color-sub);
  font-weight: 500;
  white-space: nowrap;
}

.comment-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: #f9fafb;
  transition: all 0.2s ease;
  outline: none;
}

.comment-input:focus {
  border-color: var(--color-sub);
  background: white;
  box-shadow: 0 0 0 3px rgba(125, 129, 162, 0.1);
}

.comment-input::placeholder {
  color: #9ca3af;
}

.comment-submit {
  background: var(--color-main);
  border: none;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}

.comment-submit:hover:not(:disabled) {
  background: var(--color-sub);
  transform: translateY(-1px);
}

.comment-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

/* 댓글 작성 - 모바일 하단 고정 */
.comment-write-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  z-index: 30;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.comment-write-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 48rem;
  margin: 0 auto;
}

/* 댓글 섹션 */
.comment-section {
  margin: 1.5rem 1rem 1rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 반응형 표시/숨김 */
.web-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .content-container {
    padding-bottom: 5rem; /* 모바일에서 하단 고정 댓글 입력란 공간 */
  }

  .header-bar {
    padding: 0.875rem 1rem;
  }

  .back-button {
    left: 1rem;
  }

  .more-menu {
    right: 1rem;
  }

  .more-button i {
    font-size: 1.125rem;
  }

  .board-title {
    font-size: 1rem;
  }

  .post-main {
    margin: 0.75rem;
    padding: 0.875rem;
  }

  .post-header {
    margin-bottom: 0.875rem;
    padding-bottom: 0.625rem;
  }

  .author-avatar {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.75rem;
  }

  .author-info {
    margin-left: 0.625rem;
  }

  .nickname {
    font-size: 0.75rem;
  }

  .time {
    font-size: 0.625rem;
  }

  .post-actions {
    gap: 0.5rem;
  }

  .post-actions button {
    font-size: 0.6875rem;
    padding: 0.1875rem 0.375rem;
  }

  .title {
    font-size: 0.9375rem;
    margin-bottom: 0.875rem;
  }

  .body-text {
    font-size: 0.75rem;
    margin-bottom: 0.875rem;
  }

  .tags {
    margin-bottom: 0.875rem;
    gap: 0.375rem;
  }

  .tag {
    font-size: 0.625rem;
    padding: 0.1875rem 0.5rem;
  }

  .reactions {
    gap: 0.875rem;
    padding-top: 0.625rem;
  }

  .reaction-btn {
    font-size: 0.75rem;
    gap: 0.25rem;
    padding: 0.25rem 0.375rem;
  }

  .reaction-btn i {
    font-size: 0.9375rem;
  }

  .comment-section {
    margin: 1.25rem 0.75rem 1rem;
  }

  .more-dropdown {
    right: -0.5rem;
    min-width: 8rem;
  }

  .dropdown-item {
    padding: 0.625rem;
    font-size: 0.8125rem;
  }

  .dropdown-item i {
    font-size: 0.9375rem;
  }

  /* 웹/모바일 표시 전환 */
  .web-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }

  /* 모바일 하단 고정 댓글 입력란 스타일 조정 */
  .comment-write-fixed .comment-input {
    font-size: 0.875rem;
    padding: 0.625rem 0.875rem;
  }

  .comment-write-fixed .comment-submit {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }

  .comment-write-fixed .checkbox-label {
    font-size: 0.75rem;
  }
}

/* 웹에서 큰 화면일 때 */
@media (min-width: 1024px) {
  .comment-write {
    margin: 1.5rem 2rem;
    padding: 1.25rem 1.5rem;
  }

  .comment-section {
    margin: 2rem 2rem 1rem;
  }

  .post-main {
    margin: 1.25rem 2rem;
    padding: 1.5rem;
  }
}
</style>
