<template>
  <div class="verify-form-section">
    <div class="form-header">
      <h2>비밀번호 확인</h2>
      <p>회원정보 수정을 위해 본인 확인이 필요합니다</p>
    </div>

    <form class="verify-form" @submit.prevent="$emit('submit')">
      <div class="form-group">
        <label class="form-label">현재 비밀번호</label>
        <div class="input-wrapper" :class="{ error: hasError, focused: isFocused }">
          <input
            :value="currentPassword"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="비밀번호를 입력하세요"
            :disabled="loading"
            @input="handleInput"
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
          <button
            type="button"
            class="password-toggle"
            :disabled="loading"
            @click="$emit('toggle-visibility')"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <div v-if="hasError" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <button
        type="submit"
        class="verify-btn"
        :disabled="loading || !currentPassword.trim()"
        :class="{ loading: loading }"
      >
        <div class="btn-content">
          <div v-if="loading" class="loading-spinner"></div>
          <span>{{ loading ? '확인 중...' : '본인 확인' }}</span>
        </div>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  currentPassword: {
    type: String,
    required: true,
  },
  showPassword: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  hasError: {
    type: Boolean,
    required: true,
  },
  errorMessage: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['update:password', 'toggle-visibility', 'clear-error', 'submit']);

const isFocused = ref(false);

const handleInput = (event) => {
  emit('update:password', event.target.value);
  emit('clear-error');
};
</script>

<style scoped>
.verify-form-section {
  margin-bottom: 2.5rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  color: var(--color-main);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.form-header p {
  color: var(--color-sub);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
  font-weight: 500;
}

.verify-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: none;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.input-wrapper.focused {
  background: var(--color-white);
  box-shadow: 0 0 0 2px var(--color-main);
}

.input-wrapper.error {
  background: #fef2f2;
  box-shadow: 0 0 0 2px #ef4444;
}

.form-input {
  flex: 1;
  padding: 1rem 1.25rem;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--color-main);
  outline: none;
  font-weight: 500;
}

.form-input::placeholder {
  color: var(--color-light);
  font-weight: 400;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-toggle {
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  color: var(--color-light);
  cursor: pointer;
  transition: color 0.2s ease;
  border-radius: 0 12px 12px 0;
}

.password-toggle:hover:not(:disabled) {
  color: var(--color-main);
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.75rem;
  font-weight: 500;
}

.verify-btn {
  width: 100%;
  padding: 1.125rem;
  background: var(--color-main);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.01em;
}

.verify-btn:hover:not(:disabled) {
  background: #252968;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.2);
}

.verify-btn:active:not(:disabled) {
  transform: translateY(0);
}

.verify-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.verify-btn.loading {
  background: var(--color-sub);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .verify-form-section {
    margin-bottom: 1.5rem;
  }

  .form-header {
    margin-bottom: 1.5rem;
  }

  .form-header h2 {
    font-size: 1.25rem;
  }

  .form-header p {
    font-size: 0.8rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .input-wrapper {
    border-radius: 10px;
  }

  .form-input {
    padding: 0.875rem 1rem;
    font-size: 0.85rem;
  }

  .password-toggle {
    padding: 0.875rem 1rem;
    border-radius: 0 10px 10px 0;
  }

  .verify-btn {
    padding: 0.875rem;
    font-size: 0.85rem;
    border-radius: 10px;
  }

  .error-message {
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }
}
</style>
