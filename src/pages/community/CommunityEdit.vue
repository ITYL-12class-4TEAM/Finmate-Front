<template>
  <div class="community-edit">
    <BackButton title="게시글 수정" />

    <!-- 제목 입력 -->
    <input
      v-model="title"
      type="text"
      placeholder="제목을 입력해주세요."
      class="input"
      maxlength="40"
    />

    <!-- 내용 입력 -->
    <textarea
      v-model="content"
      placeholder="내용을 입력해주세요."
      class="textarea"
      maxlength="120"
    />
    <div class="char-limit">최대 120자</div>

    <!-- 이미지 파일이 있을 경우 -->
    <!-- <div v-for="file in attaches" :key="file.no" class="attach">
      <span>
        {{ file.filename }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="text-danger"
          @click="removeFile(file.no, file.filename)"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      </span>
    </div> -->

    <!-- 파일 업로드 input 추가 -->
    <!-- <div class="image-upload">
      <label for="file" class="image-label">첨부파일</label>
      <input
        id="file"
        type="file"
        accept="image/*"
        ref="files"
        class="image-input"
        multiple
      />
    </div> -->

    <!-- 상품군 태그 선택 -->
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

    <!-- 익명 여부 선택 -->
    <div class="anonymous-group">
      <div class="anonymous-label">익명</div>
      <input type="checkbox" v-model="isAnonymous" class="custom-checkbox" />
    </div>

    <!-- 수정 버튼 -->
    <div class="submit-button-wrapper">
      <BaseButton text="수정" class="submit-button" @click="updatePost" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useModal } from '@/composables/useModal';
import { getPostByIdAPI, updatePostAPI } from '@/api/posts';
import { reverseProductTagMap } from '@/constants/tags';

import BackButton from '@/components/common/BackButton.vue';
import BaseButton from '@/components/common/BaseButton.vue';

// 상태 변수
const route = useRoute();
const router = useRouter();
const postId = Number(route.params.id);

const title = ref('');
const content = ref('');
const boardId = ref(1);
const selectedProduct = ref('');
const isAnonymous = ref(false);
const attaches = ref([]);

const productTags = ['예금', '적금', '펀드', '보험'];

// 전역 유저 정보
const memberId = 1; // TODO: 전역 사용자 정보 적용

// 태그 선택 함수
const selectProduct = (tag) => (selectedProduct.value = tag);

// 게시글 정보 불러오기
const fetchPost = async () => {
  try {
    const res = await getPostByIdAPI(postId);
    boardId.value = res.boardId;
    title.value = res.title;
    content.value = res.content;
    selectedProduct.value = res.tags?.[0] || '';
    attaches.value = res.attaches;
    isAnonymous.value = res.isAnonymous;
  } catch (e) {
    alert('게시글 정보를 불러오지 못했습니다.');
    router.push('/community');
  }
};

// const removeFile = async (no, filename) => {
//   if (!confirm(filename + '을 삭제할까요?')) return;

//   await deleteFileAPI(no);
//   const ix = attaches.value.findIndex((f) => f.no === no);
//   attaches.value.splice(ix, 1);
// };

onMounted(fetchPost);

// 수정 요청
const showModal = useModal();

const updatePost = async () => {
  console.log('postId:', postId);

  if (!title.value || !content.value || !selectedProduct.value) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  const confirmed = await showModal('현재 상태로 수정하시겠습니까?');
  if (!confirmed) return;

  const editedData = {
    title: title.value,
    content: content.value,
    status: 'NORMAL',
    anonymous: isAnonymous.value,
    productTag: reverseProductTagMap[selectedProduct.value],
  };

  try {
    await updatePostAPI(postId, editedData);
    router.push({ name: 'CommunityDetail', params: { id: postId } });
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

.attach {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.4rem 0;
  font-size: 0.8rem;
  color: var(--color-main);
}

.attach svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  cursor: pointer;
}

.image-upload {
  margin-top: 1rem;
}
.image-label {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}
.image-input {
  display: block;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.tag-group,
.anonymous-group {
  display: flex;
  margin-bottom: 1rem;
  align-items: center;
}

.tag-label,
.anonymous-label {
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

.custom-checkbox {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--color-sub);
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.custom-checkbox:checked {
  background-color: var(--color-sub);
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
