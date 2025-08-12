<template>
  <div class="confirm-section">
    <h3 class="section-title danger">
      <i class="fas fa-exclamation-circle"></i>
      탈퇴 확인
    </h3>

    <div class="form-container">
      <!-- 이메일 확인 -->
      <div class="form-group">
        <label class="form-label">
          <i class="fas fa-envelope"></i>
          본인 확인을 위해 이메일을 입력해주세요
        </label>
        <div class="email-display"><strong>입력해야 할 이메일:</strong> {{ userInfo.email }}</div>
        <input
          :value="confirmEmail"
          type="email"
          class="form-input"
          placeholder="위의 이메일을 정확히 입력하세요"
          :class="{ error: emailError }"
          @input="handleEmailInput"
          @keyup.enter="handleProceed"
        />
        <div v-if="emailError" class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          {{ emailError }}
        </div>
      </div>

      <!-- 탈퇴 사유 -->
      <div class="form-group">
        <label class="form-label">
          <i class="fas fa-comment"></i>
          탈퇴 사유를 선택해주세요 (선택사항)
        </label>
        <div class="custom-select" ref="reasonSelectRef">
          <div
            class="select-trigger"
            :class="{
              active: reasonDropdownOpen,
              'has-value': hasSelectedValue(deleteReason),
            }"
            @click="toggleReasonDropdown"
          >
            <span
              class="select-value"
              :class="{
                placeholder: !hasSelectedValue(deleteReason),
                selected: hasSelectedValue(deleteReason),
              }"
            >
              {{ getReasonLabel(deleteReason) }}
            </span>
            <i
              class="fas fa-chevron-down select-arrow"
              :class="{ rotated: reasonDropdownOpen }"
            ></i>
          </div>
          <div class="select-dropdown" :class="{ open: reasonDropdownOpen }">
            <div
              class="select-option"
              :class="{ selected: deleteReason === '' }"
              @click="selectReason('')"
            >
              사유를 선택하세요
            </div>
            <div
              class="select-option"
              :class="{ selected: deleteReason === 'not-useful' }"
              @click="selectReason('not-useful')"
            >
              서비스가 유용하지 않음
            </div>
            <div
              class="select-option"
              :class="{ selected: deleteReason === 'privacy' }"
              @click="selectReason('privacy')"
            >
              개인정보 보호 우려
            </div>
            <div
              class="select-option"
              :class="{ selected: deleteReason === 'too-complex' }"
              @click="selectReason('too-complex')"
            >
              사용이 복잡함
            </div>
            <div
              class="select-option"
              :class="{ selected: deleteReason === 'alternative' }"
              @click="selectReason('alternative')"
            >
              다른 서비스 이용
            </div>
            <div
              class="select-option"
              :class="{ selected: deleteReason === 'temporary' }"
              @click="selectReason('temporary')"
            >
              일시적으로 사용 중단
            </div>
            <div
              class="select-option"
              :class="{ selected: deleteReason === 'other' }"
              @click="selectReason('other')"
            >
              기타
            </div>
          </div>
        </div>
      </div>

      <!-- 추가 의견 -->
      <div v-if="deleteReason === 'other'" class="form-group">
        <label class="form-label">
          <i class="fas fa-edit"></i>
          추가 의견
        </label>
        <textarea
          :value="additionalFeedback"
          class="form-textarea"
          placeholder="서비스 개선을 위한 의견을 남겨주세요"
          rows="3"
          @input="$emit('update:additionalFeedback', $event.target.value)"
        ></textarea>
      </div>

      <!-- 최종 확인 체크박스 -->
      <div class="final-check">
        <label class="check-label">
          <input
            :checked="finalConfirm"
            type="checkbox"
            class="check-input"
            @change="$emit('update:finalConfirm', $event.target.checked)"
          />
          <span class="check-mark"></span>
          <span class="check-text">
            위의 모든 내용을 확인했으며, 계정 탈퇴에 따른
            <strong>데이터 영구 삭제</strong>에 동의합니다.
          </span>
        </label>
      </div>

      <!-- 버튼 그룹 -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" :disabled="processing" @click="$emit('cancel')">
          <i class="fas fa-times"></i>
          취소
        </button>
        <button
          type="button"
          class="btn-danger"
          :disabled="!isFormValid || processing"
          @click="handleProceed"
        >
          <i v-if="processing" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-trash"></i>
          {{ processing ? '처리 중...' : '회원 탈퇴' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
  },
  confirmEmail: {
    type: String,
    required: true,
  },
  deleteReason: {
    type: String,
    required: true,
  },
  additionalFeedback: {
    type: String,
    required: true,
  },
  finalConfirm: {
    type: Boolean,
    required: true,
  },
  emailError: {
    type: String,
    required: true,
  },
  processing: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  'update:confirmEmail',
  'update:deleteReason',
  'update:additionalFeedback',
  'update:finalConfirm',
  'clear-email-error',
  'proceed',
  'cancel',
]);

// 드롭다운 상태
const reasonDropdownOpen = ref(false);
const reasonSelectRef = ref(null);

// 폼 유효성 검사 - 즉시 계산
const isFormValid = computed(() => {
  // 이메일이 정확히 일치하는지 확인
  const emailMatches = props.confirmEmail === props.userInfo.email;
  // 최종 확인 체크박스가 체크되었는지 확인
  const finalConfirmed = props.finalConfirm;
  // 이메일 에러가 없는지 확인
  const noEmailError = !props.emailError;

  return emailMatches && finalConfirmed && noEmailError;
});

const handleEmailInput = (event) => {
  const value = event.target.value;
  emit('update:confirmEmail', value);

  // 실시간으로 에러 클리어
  if (props.emailError) {
    emit('clear-email-error');
  }
};

// 진행 버튼 클릭 핸들러
const handleProceed = () => {
  if (isFormValid.value && !props.processing) {
    emit('proceed');
  }
};

// 라벨 매핑
const getReasonLabel = (value) => {
  const labels = {
    '': '사유를 선택하세요',
    'not-useful': '서비스가 유용하지 않음',
    privacy: '개인정보 보호 우려',
    'too-complex': '사용이 복잡함',
    alternative: '다른 서비스 이용',
    temporary: '일시적으로 사용 중단',
    other: '기타',
  };
  return labels[value] || '사유를 선택하세요';
};

// 선택된 값이 있는지 확인
const hasSelectedValue = (value) => {
  return value !== undefined && value !== null;
};

// 드롭다운 토글
const toggleReasonDropdown = () => {
  reasonDropdownOpen.value = !reasonDropdownOpen.value;
};

// 옵션 선택
const selectReason = (value) => {
  // 빈 값('')은 선택할 수 없도록 함
  if (value !== '') {
    emit('update:deleteReason', value);
  }
  reasonDropdownOpen.value = false;
};

// 외부 클릭 감지
const handleClickOutside = (event) => {
  if (reasonSelectRef.value && !reasonSelectRef.value.contains(event.target)) {
    reasonDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.confirm-section {
  padding: 2rem;
  border-bottom: 1px solid var(--color-bg-light);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
}

.section-title.danger {
  color: #dc2626;
}

.section-title i {
  font-size: 1rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-main);
  font-size: 0.8rem;
  font-weight: 500;
}

.form-label i {
  color: var(--color-sub);
  width: 1rem;
}

.email-display {
  padding: 0.875rem;
  background: var(--color-bg-light);
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--color-sub);
}

.email-display strong {
  color: var(--color-main);
}

.form-input,
.form-textarea {
  padding: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.8rem;
  background: var(--color-white);
  transition: all 0.2s ease;
  color: var(--color-main);
  font-family: inherit;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--color-sub);
  opacity: 0.7;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 3px rgba(45, 51, 107, 0.1);
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

/* 커스텀 셀렉트 */
.custom-select {
  position: relative;
  z-index: 10;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.875rem;
  font-size: 0.7rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: var(--color-white);
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.select-trigger:hover {
  border-color: var(--color-main);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.select-trigger.active {
  border-color: var(--color-main);
  box-shadow: 0 0 0 4px rgba(45, 51, 107, 0.1);
  transform: translateY(-1px);
}

.select-value {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.select-value.placeholder {
  color: var(--color-sub);
  font-weight: 400;
  font-style: italic;
}

.select-value.selected {
  color: var(--color-main);
  font-weight: 600;
}

.select-trigger.has-value {
  border-color: var(--color-main);
}

.select-arrow {
  color: var(--color-sub);
  font-size: 0.6rem;
  transition: all 0.3s ease;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.select-arrow.rotated {
  transform: rotate(180deg);
  color: var(--color-main);
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  max-height: 250px;
  overflow-y: auto;
  z-index: 20;
}

.select-dropdown.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.select-option {
  padding: 0.75rem 1rem;
  font-size: 0.7rem;
  color: var(--color-main);
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 600;
  background: var(--color-white);
}

.select-option:first-child {
  color: var(--color-sub);
  font-weight: 400;
  font-style: italic;
  cursor: default;
  pointer-events: none;
}

.select-option:first-child:hover {
  background: var(--color-white);
  transform: none;
}

.select-option:last-child {
  border-bottom: none;
}

.select-option:hover {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: var(--color-main);
  font-weight: 700;
  transform: translateX(4px);
}

.select-option.selected {
  background: var(--color-main);
  color: var(--color-white);
  font-weight: 700;
}

.select-option.selected:hover {
  background: var(--color-sub);
  transform: translateX(0);
}

/* 스크롤바 스타일 */
.select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: var(--color-bg-light);
  border-radius: 3px;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: var(--color-light);
  border-radius: 3px;
}

.select-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--color-sub);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-size: 0.7rem;
  font-weight: 500;
}

/* 체크박스 */
.final-check {
  padding: 1.25rem;
  background: var(--color-bg-light);
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.check-label {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  cursor: pointer;
  user-select: none;
}

.check-input {
  display: none;
}

.check-mark {
  width: 22px;
  height: 22px;
  border: 2px solid #d1d5db;
  border-radius: 5px;
  background: white;
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s ease;
}

.check-input:checked + .check-mark {
  background: var(--color-main);
  border-color: var(--color-main);
}

.check-input:checked + .check-mark::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
}

.check-text {
  color: var(--color-main);
  font-size: 0.8rem;
  line-height: 1.5;
}

.check-text strong {
  color: #dc2626;
}

/* 버튼들 */
.form-actions {
  display: flex;
  gap: 0.875rem;
  justify-content: flex-end;
}

.btn-secondary,
.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 130px;
  justify-content: center;
}

.btn-secondary {
  background: var(--color-bg-light);
  color: var(--color-sub);
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  color: var(--color-main);
  border-color: var(--color-sub);
}

.btn-danger {
  background: #dc2626 !important; /* 활성화 상태 - 빨간색 */
  color: white;
  transition: all 0.2s ease;
}

.btn-danger:not(:disabled) {
  background: #dc2626 !important;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c !important; /* 호버 시 더 진한 빨간색 */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

.btn-danger:disabled {
  background: #9ca3af !important; /* 비활성화 상태 - 회색 */
  color: #ffffff;
  opacity: 1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary:disabled {
  background: var(--color-bg-light);
  color: var(--color-sub);
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .confirm-section {
    padding: 1.5rem;
  }

  .form-label {
    font-size: 0.7rem;
  }

  .email-display,
  .form-input,
  .form-select,
  .form-textarea {
    font-size: 0.7rem;
    padding: 0.75rem;
  }

  .form-input,
  .form-textarea {
    font-size: 0.7rem;
    padding: 0.75rem;
  }

  .select-trigger {
    padding: 1rem 1.125rem;
    font-size: 0.8rem;
  }

  .select-option {
    padding: 1rem 1.125rem;
    font-size: 0.8rem;
  }

  .select-arrow {
    font-size: 0.7rem;
    margin-left: 0.75rem;
  }

  .check-text {
    font-size: 0.7rem;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn-secondary,
  .btn-danger {
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 0.7rem;
  }
}
</style>
