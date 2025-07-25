<template>
  <BackButton title="게시글 작성" />
  <div class="community-write">
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

    <!-- 등록 버튼 -->
    <div class="submit-button-wrapper">
      <BaseButton text="등록" class="submit-button" @click="submitPost" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useModal } from '@/composables/useModal';
import { createPostAPI } from '@/api/posts';

import BackButton from '@/components/common/BackButton.vue';
import BaseButton from '@/components/common/BaseButton.vue';

// 상수
const productTags = ['예금', '적금', '펀드', '보험'];
const typeTags = ['추천', '질문', '경험', '자유'];

// 상태
const title = ref('');
const content = ref('');
const selectedProduct = ref('예금');
const selectedType = ref('추천');

const router = useRouter();
const showModal = useModal();

const memberId = 1; // TODO: 전역 사용자 정보 적용
const boardId = 1; // TODO: 게시판 ID 동적으로 처리 가능

// 태그 선택
const selectProduct = (tag) => (selectedProduct.value = tag);
const selectType = (tag) => (selectedType.value = tag);

// 게시글 등록
const submitPost = async () => {
  if (
    !title.value ||
    !content.value ||
    !selectedProduct.value ||
    !selectedType.value
  ) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  const confirmed = await showModal('현재 상태로 등록하시겠습니까?');
  if (!confirmed) return;

  const postData = {
    title: title.value,
    content: content.value,
    boardId,
    memberId,
    status: 'NORMAL',
    isAnonymous: false,
    // TODO: selectedProduct, selectedType도 서버와 연동 필요 시 추가
  };

  try {
    await createPostAPI(postData);
    router.push({ name: 'CommunityList' });
  } catch (e) {
    console.error('게시글 등록 실패:', e);
    alert('등록 중 오류가 발생했습니다.');
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
