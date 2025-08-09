<template>
  <div class="community-write">
    <!-- 상단 헤더 바 -->
    <div class="header-bar">
      <BackButton :to="'/community'" class="back-button" />
      <h1 class="board-title">글쓰기</h1>
      <div class="complete-section">
        <button class="complete-btn" @click="submitPost" :disabled="!isFormValid">완료</button>
      </div>
    </div>

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

      <!-- 상품군 선택 -->
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
          <CustomCheckbox id="edit-anonymous" v-model="isAnonymous">
            <span class="checkbox-label">익명으로 작성</span>
          </CustomCheckbox>
        </div>
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
const selectedTags = ref([]);
const isAnonymous = ref(false);

const router = useRouter();
const { showModal } = useModal();

// 폼 유효성 검사
const isFormValid = computed(() => {
  return title.value.trim() && content.value.trim() && selectedProduct.value;
});

// 태그 선택
const selectProduct = (tag) => (selectedProduct.value = tag);

const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    if (selectedTags.value.length < 3) {
      // 최대 3개까지 선택 가능
      selectedTags.value.push(tag);
    }
  }
};

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
    tags: selectedTags.value,
  };

  try {
    await createPostAPI(postData);
    title.value = '';
    content.value = '';
    selectedTags.value = [];
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
  padding: 0;
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
}

.complete-btn:hover:not(:disabled) {
  background: var(--color-sub);
  transform: translateY(-1px);
}

.complete-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.write-form {
  background: white;
  border-radius: 1.25rem;
  padding: 1.5rem;
  margin: 1rem 1.25rem;
  border: 1px solid #f3f4f6;
  box-shadow: 0 4px 16px rgba(45, 51, 107, 0.06);
}

/* 입력 그룹 */
.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem;
}

/* 폼 입력 필드 */
.form-input,
.form-textarea {
  width: 100%;
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 1rem;
  padding: 0.875rem 1.25rem;
  font-size: 0.875rem;
  background: rgba(248, 250, 252, 0.5);
  transition: all 0.3s ease;
  resize: none;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-sub);
  background: white;
  box-shadow: 0 0 0 3px rgba(125, 129, 162, 0.08);
  transform: translateY(-1px);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  min-height: 8rem;
  line-height: 1.6;
}

.char-limit {
  text-align: right;
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-top: 0.5rem;
  opacity: 0.7;
}

/* 태그 컨테이너 */
.tag-container {
  display: flex;
  gap: 0.5rem;
  background: rgba(238, 238, 243, 0.3);
  padding: 1rem;
  border-radius: 1rem;
  overflow-x: auto;
  flex-wrap: wrap;
}

.tag-btn {
  background: white;
  border: 1px solid rgba(185, 187, 204, 0.3);
  color: var(--color-sub);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 1.25rem;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-btn:hover {
  background: var(--color-bg-light);
  border-color: var(--color-sub);
  color: var(--color-main);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(45, 51, 107, 0.08);
}

.tag-btn.active {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  border-color: transparent;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(45, 51, 107, 0.2);
}

.tag-btn.active:hover {
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(45, 51, 107, 0.25);
}

.tag-btn.secondary {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.3);
  color: #64748b;
}

.tag-btn.secondary:hover {
  background: #e2e8f0;
  border-color: #64748b;
  color: #475569;
}

.tag-btn.secondary.active {
  background: linear-gradient(135deg, #64748b, #475569);
  border-color: transparent;
  color: white;
}

/* 체크박스 컨테이너 */
.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-label {
  font-size: 0.8125rem;
  color: var(--color-sub);
  font-weight: 500;
}

/* 반응형 */
@media (max-width: 768px) {
  .header-bar {
    padding: 0.875rem 1rem;
  }

  .back-button {
    left: 1rem;
  }

  .complete-section {
    right: 1rem;
  }

  .board-title {
    font-size: 1rem;
  }

  .complete-btn {
    font-size: 0.8125rem;
    padding: 0.375rem 0.875rem;
  }

  .write-form {
    margin: 1rem;
    padding: 1.25rem;
  }

  .input-group {
    margin-bottom: 1.25rem;
  }

  .form-input,
  .form-textarea {
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
  }

  .form-textarea {
    min-height: 7rem;
  }

  .tag-container {
    gap: 0.375rem;
    padding: 0.875rem;
  }

  .tag-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.6rem;
  }
}
</style>
