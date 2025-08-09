<template>
  <div class="community-write">
    <BackButton title="게시글 작성" />

    <div class="write-form">
      <!-- 제목 입력 -->
      <div class="input-group">
        <label class="input-label">제목</label>
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
        <label class="input-label">내용</label>
        <textarea
          v-model="content"
          placeholder="내용을 입력해주세요."
          class="form-textarea"
          maxlength="120"
        />
        <div class="char-limit">{{ content.length }}/120자</div>
      </div>

      <!-- 상품군 태그 선택 -->
      <div class="input-group">
        <label class="input-label">상품군</label>
        <div class="tag-container">
          <button
            v-for="tag in productTags"
            :key="tag"
            :class="['tag-btn', { active: selectedProduct === tag }]"
            @click="selectProduct(tag)"
          >
            #{{ tag }}
          </button>
        </div>
      </div>

      <!-- 익명 여부 선택 -->
      <div class="input-group">
        <div class="checkbox-container">
          <CustomCheckbox id="write-anonymous" v-model="isAnonymous">
            <span class="checkbox-label">익명으로 작성</span>
          </CustomCheckbox>
        </div>
      </div>

      <!-- 등록 버튼 -->
      <div class="submit-section">
        <button class="submit-btn" @click="submitPost" :disabled="!isFormValid">
          <svg
            v-if="!isFormValid"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
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
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
          등록하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useModal } from '@/composables/useModal';
import { createPostAPI } from '@/api/posts';
import { reverseProductTagMap } from '@/constants/tags';

import BackButton from '@/components/common/BackButton.vue';
import CustomCheckbox from '@/components/community/CustomCheckbox.vue';

// 상수
const productTags = ['예금', '적금', '펀드', '보험'];

// 상태
const title = ref('');
const content = ref('');
const selectedProduct = ref('예금');
const isAnonymous = ref(false);

const router = useRouter();
const { showModal } = useModal();

// 폼 유효성 검사
const isFormValid = computed(() => {
  return title.value.trim() && content.value.trim() && selectedProduct.value;
});

// 태그 선택
const selectProduct = (tag) => (selectedProduct.value = tag);

// 게시글 등록
const submitPost = async () => {
  if (!isFormValid.value) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  const confirmed = await showModal('현재 상태로 등록하시겠습니까?');
  if (!confirmed) return;

  const postData = {
    title: title.value,
    content: content.value,
    boardId: 1,
    anonymous: isAnonymous.value,
    status: 'NORMAL',
    productTag: reverseProductTagMap[selectedProduct.value],
  };

  try {
    await createPostAPI(postData);
    title.value = '';
    content.value = '';
    router.push({ name: 'CommunityList' });
  } catch (e) {
    console.error('게시글 등록 실패:', e);
    alert('등록 중 오류가 발생했습니다.');
  }
};
</script>

<style scoped>
.community-write {
  max-width: 42rem;
  margin: 0 auto;
  padding: 1rem;
}

.write-form {
  background: white;
  border-radius: 1.25rem;
  padding: 1.25rem;
  margin-top: 0.75rem;
  border: 0.0625rem solid #f3f4f6;
  box-shadow: 0 0.25rem 1rem rgba(45, 51, 107, 0.06);
}

/* 입력 그룹 */
.input-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.375rem;
}

/* 폼 입력 필드 */
.form-input,
.form-textarea {
  width: 100%;
  border: 0.0625rem solid rgba(185, 187, 204, 0.3);
  border-radius: 1.25rem;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  transition: all 0.3s ease;
  resize: none;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-sub);
  background: white;
  box-shadow: 0 0 0 0.1875rem rgba(125, 129, 162, 0.08);
  transform: translateY(-0.0625rem);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  min-height: 6rem;
  line-height: 1.5;
}

.char-limit {
  text-align: right;
  font-size: 0.625rem;
  color: var(--color-sub);
  margin-top: 0.25rem;
  opacity: 0.7;
}

/* 태그 컨테이너 */
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
  font-size: 0.5rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-btn:hover {
  background: var(--color-bg-light);
  border-color: var(--color-sub);
  color: var(--color-main);
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.08);
}

.tag-btn.active {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  border-color: transparent;
  color: white;
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.1875rem 0.75rem rgba(45, 51, 107, 0.2);
}

.tag-btn.active:hover {
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.25rem 0.875rem rgba(45, 51, 107, 0.25);
}

/* 체크박스 컨테이너 */
.checkbox-container {
  display: flex;
  align-items: center;
  background: rgba(238, 238, 243, 0.3);
  padding: 0.75rem;
  border-radius: 1rem;
  border: 0.0625rem solid rgba(185, 187, 204, 0.2);
}

.checkbox-label {
  font-size: 0.6875rem;
  color: var(--color-sub);
  font-weight: 500;
}

/* 제출 섹션 */
.submit-section {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 0.0625rem solid #f3f4f6;
  display: flex;
  justify-content: center;
}

.submit-btn {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  color: white;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 0.25rem 0.875rem rgba(45, 51, 107, 0.2);
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  transform: translateY(-0.0625rem);
  box-shadow: 0 0.375rem 1.25rem rgba(45, 51, 107, 0.3);
}

.submit-btn:disabled {
  background: linear-gradient(135deg, #d1d5db, #9ca3af);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
}

/* 반응형 */
@media (max-width: 768px) {
  .community-write {
    padding: 0.75rem;
  }

  .write-form {
    padding: 1.5rem;
    border-radius: 1.25rem;
  }

  .input-group {
    margin-bottom: 1.25rem;
  }

  .form-input,
  .form-textarea {
    padding: 0.875rem 1rem;
    font-size: 0.7rem;
    border-radius: 0.875rem;
  }

  .form-textarea {
    min-height: 6.5rem;
  }

  .tag-container {
    gap: 0.3rem;
    padding: 0.875rem;
    border-radius: 0.875rem;
  }

  .tag-btn {
    padding: 0.625rem 1rem;
    font-size: 0.6rem;
    border-radius: 1.5rem;
  }

  .checkbox-container {
    padding: 0.875rem;
    border-radius: 0.875rem;
  }

  .submit-btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.8rem;
    border-radius: 1.5rem;
  }
}
</style>
