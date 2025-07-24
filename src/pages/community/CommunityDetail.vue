<template>
  <div class="community-detail">
    <BackButton />

    <div class="post-main">
      <!-- 게시글 상단 -->
      <div class="post-header">
        <img class="profile-img" :src="post.authorImage" alt="프로필 이미지" />
        <div class="author-info">
          <span class="nickname">{{ post.nickname }}</span>
          <span class="time">{{ formattedTime(post.createdAt) }}</span>
        </div>
      </div>

      <!-- 게시글 본문 -->
      <div class="post-content">
        <h2 class="title">{{ post.title }}</h2>
        <p class="body-text">{{ post.content }}</p>
        <!-- 이미지가 있을 경우 -->
        <img
          v-if="post.imageUrl"
          class="post-image"
          :src="post.imageUrl"
          alt="본문 이미지"
        />
        <div class="tags">
          <span class="tag" v-for="tag in post.tags" :key="tag"
            >#{{ tag }}</span
          >
        </div>

        <div class="post-footer">
          <!-- 반응 영역 -->
          <div class="reactions">
            <!-- 좋아요 버튼 -->
            <button @click="toggleLike">
              <!-- 눌린 상태 하트 (fill 있음) -->
              <svg
                v-if="liked"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
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

              <!-- 안 눌린 상태 하트 (stroke만 있음) -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
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

              {{ post.likes }}
            </button>
            <!-- <button @click="toggleScrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                />
              </svg>
              {{ post.scraps }}
            </button> -->
          </div>

          <!-- 수정/삭제 버튼 (작성자일 경우) -->
          <div class="post-actions" v-if="isMine">
            <button class="btn-edit" @click="goToEditPage">수정</button>
            <button class="btn-delete" @click="deletePost">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 댓글 작성 -->
    <div class="comment-write" v-if="isLoggedIn">
      <input v-model="newComment" placeholder="댓글을 입력해주세요." />
      <button @click="submitComment">작성</button>
    </div>

    <!-- 댓글 목록 -->
    <div class="comment-section">
      <p class="comment-count">댓글 {{ comments.length }}개</p>
      <div class="comment" v-for="comment in comments" :key="comment.id">
        <div class="comment-header">
          <span class="nickname">{{ comment.nickname }}</span>
          <span class="time">{{ formattedTime(comment.time) }}</span>
          <button
            v-if="comment.isMine"
            class="delete-btn"
            @click="deleteComment"
          >
            삭제
          </button>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
        <!-- 댓글 좋아요 버튼 -->
        <div class="comment-footer">
          <button @click="toggleCommentLike(comment.id)">
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BackButton from '@/components/common/BackButton.vue';

const cr = useRoute();
const router = useRouter();

const id = cr.params.id;

const post = {
  authorImage: '/authorImg.jpg',
  nickname: '곰돌이',
  createdAt: '2025-07-21T14:40:00',
  title: '20대 직장인, 적금 뭐가 좋을까요?',
  content:
    '안녕하세요! 올해 사회초년생이 된 20대입니다. 매달 일정 금액을 적금으로 넣으려고 하는데, 어떤 상품이 좋을지 고민이에요. 금리도 중요하지만 중도해지 조건이나 우대금리 조건도 궁금합니다. 경험 있으신 분들 조언 부탁드려요!',
  imageUrl: '',
  tags: ['예금', '후기'],
  likes: 13,
  scraps: 6,
};

const comments = ref([
  {
    id: 1,
    nickname: '곰돌이',
    content: '신한은행도 괜찮더라구요!',
    time: '2025-07-21T15:00:00',
    isMine: true,
    likeCount: 3,
    liked: false,
  },
  {
    id: 2,
    nickname: '초보저축',
    content: '신한은행 금리 얼마인가요?',
    time: '2025-07-21T15:10:00',
    isMine: false,
    likeCount: 1,
    liked: true,
  },
]);

const liked = ref(false);
const scraped = ref(false);
const newComment = ref('');
const isLoggedIn = true;
const isMine = true;

const formattedTime = (d) => {
  const date = new Date(d);

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${month}/${day} ${hour}:${minute}`; // "07/21 14:40"
};

const toggleLike = () => {
  liked.value = !liked.value;
  // TODO: API 연동 좋아요 처리
};

const toggleScrap = () => {
  scraped.value = !scraped.value;
  // TODO: API 연동 스크랩 처리
};

const goToEditPage = () => {
  router.push({ name: 'CommunityEdit', params: { id: id } });
};

const deletePost = () => {
  // TODO: 게시물 삭제 로직
};

const submitComment = () => {
  // TODO: 코멘트 등록 로직
};

const deleteComment = () => {
  // TODO: 코멘트 삭제 처리
};

const toggleCommentLike = (commentId) => {
  const target = comments.value.find((c) => c.id === commentId);
  if (!target) return;

  target.liked = !target.liked;

  // TODO: API 연동: POST or DELETE 요청
};
</script>

<style scoped>
/* 게시글 상단 */
.post-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.profile-img {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.nickname {
  font-weight: bold;
  font-size: 0.9rem;
}

.time {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.5);
}

/* 게시글 본문 */
.post-main {
  border: 2px solid var(--color-bg-light);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

.title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.body-text {
  font-size: 0.8rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  white-space: pre-line;
}

.post-image {
  width: 100%;
  margin: 0.6rem 0;
  border-radius: 8px;
  object-fit: cover;
}

/* 태그 */
.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.tag {
  background-color: var(--color-bg-light);
  font-size: 0.75rem;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

/* 좋아요 & 스크랩 */
.reactions {
  display: flex;
  gap: 0.8rem;
}

.reactions button {
  background: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: rgba(0, 0, 0, 0.5);
}

.reactions svg {
  height: 1.2rem;
  width: 1.2rem;
}

/* 수정/삭제 버튼 */
.post-actions {
  display: flex;
  gap: 0.5rem;
}

.post-actions button {
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
  border-radius: 6px;
}

.btn-edit {
  background-color: var(--color-light);
}

.btn-delete {
  background-color: #ccb9b9;
}

/* 댓글 작성 */
.comment-write {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.2rem;
  padding: 0.25rem;
  border-radius: 10px;
  background-color: var(--color-bg-light);
}

.comment-write input {
  flex: 1;
  padding: 0.6rem 0.6rem;
  font-size: 0.8rem;
  border: none;
  border-radius: 6px;
}

.comment-write button {
  padding: 0 1.4rem;
  background-color: var(--color-sub);
  color: white;
  font-size: 0.8rem;
  border-radius: 6px;
}

/* 댓글 목록 */
.comment-section {
  margin-top: 1.5rem;
}

.comment-count {
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
  font-weight: 600;
}

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
