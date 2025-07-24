<template>
  <BackButton title="게시글 수정" />
  <div class="community-edit">
    <input
      v-model="title"
      type="text"
      placeholder="제목을 입력해주세요."
      class="input"
      maxlength="20"
    />

    <textarea
      v-model="content"
      placeholder="내용을 입력해주세요."
      class="textarea"
      maxlength="60"
    />
    <div class="char-limit">최대 60자</div>

    <div class="tag-group">
      <div class="tag-label">상품군</div>
      <div class="tag-line"></div>
      <div class="tags">
        <button
          v-for="tag in productTags"
          :key="tag"
          :class="['tag', selectedProduct === tag && 'active']"
          @click="selectProduct(tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <div class="tag-group">
      <div class="tag-label">속성</div>
      <div class="tag-line"></div>
      <div class="tags">
        <button
          v-for="tag in typeTags"
          :key="tag"
          :class="['tag', selectedType === tag && 'active']"
          @click="selectType(tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <div class="submit-button-wrapper">
      <BaseButton text="수정" class="submit-button" @click="updatePost" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BackButton from '@/components/common/BackButton.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useModal } from '@/composables/useModal';
import { getPostById } from '@/api/posts';
import { updatePostAPI } from '@/api/posts';

// route param에서 게시글 id 가져오기
const route = useRoute();
const router = useRouter();
const postId = Number(route.params.id);

const title = ref('');
const content = ref('');
const selectedProduct = ref('');
const selectedType = ref('');

const productTags = ['예금', '적금', '펀드', '보험'];
const typeTags = ['추천', '질문', '경험', '자유'];

// 기존 게시글 정보 가져오기
const fetchPost = async () => {
  try {
    const res = await getPostById(postId);
    console.log(res);
    title.value = res.title;
    content.value = res.content;
    selectedProduct.value = res.tags?.[0] ?? '';
    selectedType.value = res.tags?.[1] ?? '';
  } catch (e) {
    alert('게시글 정보를 불러오지 못했습니다.');
    router.push('/community'); // 에러 시 목록 페이지로 이동
  }
};

onMounted(() => {
  fetchPost();
});

const selectProduct = (tag) => {
  selectedProduct.value = tag;
};

const selectType = (tag) => {
  selectedType.value = tag;
};

const showModal = useModal();

const updatePost = async () => {
  if (
    !title.value ||
    !content.value ||
    !selectedProduct.value ||
    !selectedType.value
  ) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  const confirmed = await showModal('현재 상태로 수정하시겠습니까?');

  if (!confirmed) {
    return;
  }

  const postData = {
    postId,
    boardId: 1, // 실제 사용 중인 boardId로 대체
    wmtiId: 1, // 선택된 유형이 있다면 그걸로 대체
    memberId: 1, // 로그인된 사용자 ID로 대체
    title: title.value,
    content: content.value,
    isAnonymous: false,
    status: 'NORMAL',
  };

  try {
    const edited = await updatePostAPI(postId, postData);
    console.log('게시글 수정 성공:', edited);
    // 수정 후 상세 페이지 이동
    router.push(`/community/${postId}`);
  } catch (e) {
    console.error('수정 실패:', e);
    alert('수정 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
.input,
.textarea {
  width: 100%;
  border: 2px solid var(--color-light);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-top: 1.2rem;
  font-size: 1rem;
}

.input:focus,
.textarea:focus {
  outline: none;
  border: 2px solid var(--color-sub);
}

.textarea {
  min-height: 120px;
  resize: none;
}

.char-limit {
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-light);
  margin-top: -0.2rem;
  margin-bottom: 1rem;
}

.tag-group {
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
}

.tag-label {
  font-size: 0.9rem;
  font-weight: 600;
  width: 5rem;
}

.tag-line {
  width: 2px;
  height: 1rem;
  background-color: var(--color-light);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: 1rem;
}

.tag {
  border-radius: 20px;
  padding: 0.4rem 1rem;
  background-color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.tag.active {
  background-color: var(--color-light);
  color: black;
}

.submit-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 5rem;
}

@media (max-width: 768px) {
  .tag {
    padding: 0.3rem 0.6rem;
  }
}
</style>
