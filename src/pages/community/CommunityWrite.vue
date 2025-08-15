<template>
  <div class="community-write">
    <!-- 상단 헤더 바 -->
    <div class="header-bar">
      <BackButton :to="'/community'" class="back-button" />
      <h1 class="board-title">글쓰기</h1>
      <div class="complete-section">
        <button class="complete-btn" :disabled="!isFormValid" @click="submitPost">
          <i class="fas fa-check"></i>
          완료
        </button>
      </div>
    </div>

    <div class="write-form">
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
        />
        <div class="char-limit">{{ content.length }}/120자</div>
      </div>

      <!-- 상품군 선택 -->
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
  max-width: 42rem; /* 672px / 16 */
  margin: 0 auto;
  padding: 0;
}

/* 헤더 바 */
.header-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.25rem; /* 16px 20px / 16 */
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 0.0625rem solid #f3f4f6; /* 1px / 16 */
  position: relative;
}

.back-button {
  position: absolute;
  left: 1.25rem; /* 20px / 16 */
}

.board-title {
  font-size: 1.125rem; /* 18px / 16 */
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
}

.complete-section {
  position: absolute;
  right: 1.25rem; /* 20px / 16 */
}

.complete-btn {
  background: var(--color-main);
  color: white;
  border: none;
  font-size: 0.875rem; /* 14px / 16 */
  font-weight: 600;
  padding: 0.5rem 1rem; /* 8px 16px / 16 */
  border-radius: 1rem; /* 16px / 16 */
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem; /* 6px / 16 */
}

.complete-btn:hover:not(:disabled) {
  background: var(--color-sub);
  transform: translateY(-0.0625rem); /* -1px / 16 */
}

.complete-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.complete-btn i {
  font-size: 0.8125rem; /* 13px / 16 */
}

.write-form {
  background: white;
  border-radius: 1.25rem; /* 20px / 16 */
  padding: 1.5rem; /* 24px / 16 */
  margin: 1rem 1.25rem; /* 16px 20px / 16 */
  border: 0.0625rem solid #f3f4f6; /* 1px / 16 */
  box-shadow: 0 0.25rem 1rem rgba(45, 51, 107, 0.06); /* 0 4px 16px / 16 */
}

/* 입력 그룹 */
.input-group {
  margin-bottom: 1.5rem; /* 24px / 16 */
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* 8px / 16 */
  font-size: 0.875rem; /* 14px / 16 */
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.5rem; /* 8px / 16 */
}

.input-label i {
  font-size: 0.875rem; /* 14px / 16 */
  color: var(--color-sub);
  width: 1rem; /* 16px / 16 */
}

/* 폼 입력 필드 */
.form-input,
.form-textarea {
  width: 100%;
  border: 0.0625rem solid rgba(185, 187, 204, 0.3); /* 1px / 16 */
  border-radius: 1rem; /* 16px / 16 */
  padding: 0.875rem 1.25rem; /* 14px 20px / 16 */
  font-size: 0.875rem; /* 14px / 16 */
  background: rgba(248, 250, 252, 0.5);
  transition: all 0.3s ease;
  resize: none;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-sub);
  background: white;
  box-shadow: 0 0 0 0.1875rem rgba(125, 129, 162, 0.08); /* 0 0 0 3px / 16 */
  transform: translateY(-0.0625rem); /* -1px / 16 */
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  min-height: 8rem; /* 128px / 16 */
  line-height: 1.6;
}

.char-limit {
  text-align: right;
  font-size: 0.75rem; /* 12px / 16 */
  color: var(--color-sub);
  margin-top: 0.5rem; /* 8px / 16 */
  opacity: 0.7;
}

/* 태그 컨테이너 */
.tag-container {
  display: flex;
  gap: 0.2rem; /* 8px / 16 */
  background: rgba(238, 238, 243, 0.3);
  padding: 1rem; /* 16px / 16 */
  border-radius: 1rem; /* 16px / 16 */
  overflow-x: auto;
  flex-wrap: wrap;
}

.tag-btn {
  background: white;
  border: 0.0625rem solid rgba(185, 187, 204, 0.3); /* 1px / 16 */
  color: var(--color-sub);
  font-size: 0.75rem; /* 12px / 16 */
  font-weight: 500;
  padding: 0.5rem 1rem; /* 8px 16px / 16 */
  border-radius: 1.25rem; /* 20px / 16 */
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 0.0625rem 0.25rem rgba(0, 0, 0, 0.05); /* 0 1px 4px / 16 */
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem; /* 4px / 16 */
}

.tag-btn i {
  font-size: 0.65rem; /* 10.4px / 16 */
}

.tag-btn:hover {
  background: var(--color-bg-light);
  border-color: var(--color-sub);
  color: var(--color-main);
  transform: translateY(-0.0625rem); /* -1px / 16 */
  box-shadow: 0 0.125rem 0.5rem rgba(45, 51, 107, 0.08); /* 0 2px 8px / 16 */
}

.tag-btn.active {
  background: linear-gradient(135deg, var(--color-main), var(--color-sub));
  border-color: transparent;
  color: white;
  transform: translateY(-0.0625rem); /* -1px / 16 */
  box-shadow: 0 0.1875rem 0.75rem rgba(45, 51, 107, 0.2); /* 0 3px 12px / 16 */
}

.tag-btn.active:hover {
  background: linear-gradient(135deg, var(--color-sub), var(--color-light));
  transform: translateY(-0.0625rem); /* -1px / 16 */
  box-shadow: 0 0.25rem 0.875rem rgba(45, 51, 107, 0.25); /* 0 4px 14px / 16 */
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
  font-size: 0.8125rem; /* 13px / 16 */
  color: var(--color-sub);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem; /* 6px / 16 */
}

.checkbox-label i {
  font-size: 0.875rem; /* 14px / 16 */
  color: var(--color-sub);
}

/* 반응형 - 모바일 기준 */
@media (max-width: 26.875rem) {
  /* 430px / 16 */
  .header-bar {
    padding: 0.875rem 1rem; /* 14px 16px / 16 */
  }

  .back-button {
    left: 1rem; /* 16px / 16 */
  }

  .complete-section {
    right: 1rem; /* 16px / 16 */
  }

  .board-title {
    font-size: 1rem; /* 16px / 16 */
  }

  .complete-btn {
    font-size: 0.8125rem; /* 13px / 16 */
    padding: 0.375rem 0.875rem; /* 6px 14px / 16 */
  }

  .complete-btn i {
    font-size: 0.75rem; /* 12px / 16 */
  }

  .write-form {
    margin: 1rem; /* 16px / 16 */
    padding: 1.25rem; /* 20px / 16 */
  }

  .input-group {
    margin-bottom: 1.25rem; /* 20px / 16 */
  }

  .input-label {
    font-size: 0.8125rem; /* 13px / 16 */
  }

  .input-label i {
    font-size: 0.8125rem; /* 13px / 16 */
  }

  .form-input,
  .form-textarea {
    padding: 0.75rem 1rem; /* 12px 16px / 16 */
    font-size: 0.8125rem; /* 13px / 16 */
  }

  .form-textarea {
    min-height: 7rem; /* 112px / 16 */
  }

  .tag-container {
    gap: 0.375rem; /* 6px / 16 */
    padding: 0.875rem; /* 14px / 16 */
  }

  .tag-btn {
    padding: 0.5rem 0.875rem; /* 8px 14px / 16 */
    font-size: 0.6rem; /* 9.6px / 16 */
  }

  .tag-btn i {
    font-size: 0.6rem; /* 9.6px / 16 */
  }

  .checkbox-label {
    font-size: 0.75rem; /* 12px / 16 */
  }

  .checkbox-label i {
    font-size: 0.8125rem; /* 13px / 16 */
  }
}
</style>
