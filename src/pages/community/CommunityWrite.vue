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
import BackButton from '@/components/common/BackButton.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useModal } from '@/composables/useModal';
import { useRouter } from 'vue-router';

const router = useRouter();

const title = ref('');
const content = ref('');

const productTags = ['예금', '적금', '펀드', '보험'];
const typeTags = ['추천', '질문', '경험', '자유'];

const selectedProduct = ref('예금');
const selectedType = ref('추천');

const selectProduct = (tag) => {
  selectedProduct.value = tag;
};

const selectType = (tag) => {
  selectedType.value = tag;
};

const showModal = useModal();

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

  if (!confirmed) {
    return;
  }

  // TODO: API 연결 후 게시글 등록 요청 보내기
  console.log('작성된 글:', {
    title: title.value,
    content: content.value,
    product: selectedProduct.value,
    type: selectedType.value,
  });

  // 입력 후 목록으로 이동
  router.push({ name: 'CommunityList' });
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
