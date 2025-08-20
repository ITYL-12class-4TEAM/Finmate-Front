<template>
  <div class="community-edit">
    <!-- 상단 헤더 바 -->
    <div class="header-bar">
      <BackButton :to="'/community'" class="back-button" />
      <h1 class="board-title">글수정</h1>
      <div class="complete-section">
        <button class="complete-btn" :disabled="!isFormValid" @click="updatePost">
          <i class="fas fa-check"></i>
          완료
        </button>
      </div>
    </div>
    <div class="edit-form">
      <!-- 제목 입력 -->
      <div class="input-group">
        <label class="input-label">
          <i class="fas fa-heading"></i>
          제목
        </label>
        <input
          v-model="title"
          type="text"
          placeholder="제목을 입력해주세요."
          class="form-input"
          maxlength="40"
        />
      </div>

      <!-- 내용 입력 -->
      <div class="input-group">
        <label class="input-label">
          <i class="fas fa-align-left"></i>
          내용
        </label>
        <textarea
          v-model="content"
          placeholder="내용을 입력해주세요."
          class="form-textarea"
          maxlength="120"
        ></textarea>
        <div class="char-limit">{{ content.length }}/120자</div>
      </div>

      <!-- 상품군 태그 선택 -->
      <div class="input-group">
        <label class="input-label">
          <i class="fas fa-tags"></i>
          상품군
        </label>
        <div class="tag-container">
          <button
            v-for="tag in productTags"
            :key="tag"
            :class="['tag-btn', { active: selectedProduct === tag }]"
            @click="selectProduct(tag)"
          >
            <i class="fas fa-hashtag"></i>{{ tag }}
          </button>
        </div>
      </div>

      <!-- 익명 여부 선택 -->
      <div class="input-group">
        <div class="checkbox-container">
          <CustomCheckbox id="edit-anonymous" v-model="isAnonymous">
            <span class="checkbox-label"> 익명으로 작성 </span>
          </CustomCheckbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useModal } from '@/composables/useModal';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/stores/useAuthStore';
import { getPostByIdAPI, updatePostAPI } from '@/api/posts';
import { reverseProductTagMap } from '@/constants/tags';

import BackButton from '@/components/common/BackButton.vue';
import CustomCheckbox from '@/components/community/CustomCheckbox.vue';

const route = useRoute();
const router = useRouter();
const postId = Number(route.params.id);
const authStore = useAuthStore();
const memberId = computed(() => authStore.userInfo?.memberId || null);
const { showToast } = useToast();
const { showModal } = useModal();

const title = ref('');
const content = ref('');
const boardId = ref(1);
const selectedProduct = ref('');
const isAnonymous = ref(false);
const attaches = ref([]);

const productTags = ['예금', '적금', '펀드', '보험'];

const isFormValid = computed(() => {
  return title.value.trim() && content.value.trim() && selectedProduct.value;
});

const selectProduct = (tag) => {
  selectedProduct.value = tag;
};

const fetchPost = async () => {
  try {
    const res = await getPostByIdAPI(postId, memberId.value);

    if (!res.isMine) {
      showToast('본인 게시글만 수정할 수 있습니다.', 'warning');
      router.replace('/community');
      return;
    }

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

onMounted(() => {
  fetchPost();
});

const updatePost = async () => {
  if (!isFormValid.value) {
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
    alert(e.response?.data?.message || '수정 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
.community-edit {
  max-width: 42rem;
  margin: 0 auto;
  padding: 1rem;
}

.edit-form {
  background: white;
  border-radius: 0.875rem;
  padding: 1.5rem;
  margin-top: 1rem;
  border: 0.0625rem solid #f3f4f6;
  box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.02);
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

.input-label i {
  font-size: 0.875rem;
  color: var(--color-sub);
  width: 1rem;
}

.form-input,
.form-textarea {
  width: 100%;
  border: 0.0625rem solid var(--color-light);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
  resize: none;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-sub);
  box-shadow: 0 0 0 0.1875rem rgba(125, 129, 162, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  min-height: 7.5rem;
  line-height: 1.5;
}

.char-limit {
  text-align: right;
  font-size: 0.6875rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.tag-container {
  display: flex;
  gap: 0.5rem;
  background: rgba(238, 238, 243, 0.3);
  padding: 0.75rem;
  border-radius: 1rem;
  overflow-x: auto;
}

.tag-btn {
  background: white;
  border: 0.0625rem solid rgba(185, 187, 204, 0.2);
  color: var(--color-sub);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-btn i {
  font-size: 0.75rem;
}

.tag-btn:hover {
  background: var(--color-bg-light);
  border-color: var(--color-sub);
  color: var(--color-main);
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.08);
}

.tag-btn.active {
  background: var(--color-main);
  border-color: transparent;
  color: white;
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.1875rem 0.75rem rgba(45, 51, 107, 0.2);
}

.tag-btn.active:hover {
  background: var(--color-sub);
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.875rem rgba(45, 51, 107, 0.25);
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-label {
  font-size: 0.8125rem;
  color: var(--color-sub);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.checkbox-label i {
  font-size: 0.875rem;
  color: var(--color-sub);
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.25rem;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 0.0625rem solid #f3f4f6;
  position: relative;
}

.back-button {
  position: absolute;
  left: 1.25rem;
}

.complete-section {
  position: absolute;
  right: 1.25rem;
}

.complete-btn {
  background: var(--color-main);
  color: white;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.complete-btn:hover:not(:disabled) {
  background: var(--color-sub);
  transform: translateY(-0.0625rem);
}

.complete-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.complete-btn i {
  font-size: 0.8125rem;
}

.board-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
}

@media (max-width: 26.875rem) {
  .community-edit {
    padding: 0.75rem;
  }

  .edit-form {
    padding: 1rem;
  }

  .input-group {
    margin-bottom: 1.25rem;
  }

  .input-label {
    font-size: 0.8125rem;
  }

  .input-label i {
    font-size: 0.8125rem;
  }

  .form-input,
  .form-textarea {
    padding: 0.625rem 0.875rem;
    font-size: 0.8125rem;
  }

  .form-textarea {
    min-height: 6rem;
  }

  .tag-container {
    gap: 0.375rem;
  }

  .tag-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
  }

  .tag-btn i {
    font-size: 0.6875rem;
  }

  .board-title {
    font-size: 1rem;
  }

  .header-bar {
    padding: 0.875rem 1rem;
  }

  .back-button {
    left: 1rem;
  }

  .complete-section {
    right: 1rem;
  }

  .complete-btn {
    font-size: 0.8125rem;
    padding: 0.375rem 0.875rem;
  }

  .complete-btn i {
    font-size: 0.75rem;
  }

  .checkbox-label {
    font-size: 0.75rem;
  }

  .checkbox-label i {
    font-size: 0.8125rem;
  }
}
</style>
