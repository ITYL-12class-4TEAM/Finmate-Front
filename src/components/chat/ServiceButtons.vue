<template>
  <!-- 서비스 기능 버튼들 -->
  <div v-if="showServiceButtons" class="service-buttons">
    <h3>
      {{ isAuthenticated ? '서비스 기능' : '비회원도 이용 가능한 기능' }}
    </h3>
    <div class="button-container">
      <div class="button-grid">
        <button
          v-for="service in availableServices"
          :key="`service-${service.id}`"
          class="service-btn"
          type="button"
          @click="handleServiceAction(service)"
        >
          <span class="service-icon">{{ service.icon }}</span>
          <span class="service-text">{{ service.text }}</span>
        </button>
      </div>
    </div>

    <!-- 로그인 안내 -->
    <div v-if="!isAuthenticated" class="login-guide">
      <p>🔐 <strong>로그인하면 추가로 이용할 수 있는 기능:</strong></p>
      <div class="member-features">
        <span
          v-for="feature in memberOnlyFeatures"
          :key="`feature-${feature.id}`"
          class="feature-tag"
        >
          {{ feature.icon }} {{ feature.text }}
        </span>
      </div>
      <button @click="navigateToLogin" class="login-btn">
        로그인하러 가기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Props 정의
const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  availableServices: {
    type: Array,
    default: () => [],
  },
  memberOnlyFeatures: {
    type: Array,
    default: () => [],
  },
});

// Emits 정의
const emit = defineEmits(['service-action', 'navigate-to-login']);

// 로컬 상태
const showServiceButtons = ref(true);

// 이벤트 핸들러
const handleServiceAction = (service) => {
  emit('service-action', service);
};

const navigateToLogin = () => {
  emit('navigate-to-login');
};
</script>

<style scoped>
.service-buttons {
  padding: 1rem;
  border-top: 1px solid var(--color-bg-light);
  border-bottom: 1px solid var(--color-bg-light);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.service-buttons h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: var(--color-text);
  font-weight: 600;
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: center;
  padding: 0 1rem; /* 양옆 여백 추가 */
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-width: 100%;
  width: 100%;
}

.service-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem 0.6rem;
  background: var(--color-bg-light);
  border: 1px solid var(--color-light);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
  font-size: 0.65rem;
  text-align: left;
  min-width: 0; /* flex 아이템이 줄어들 수 있도록 */
}

.service-btn:hover {
  background: var(--color-main);
  color: var(--color-white);
  border-color: var(--color-main);
  transform: translateY(-2px);
}

.service-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.service-text {
  flex: 1;
  line-height: 1.3;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0; /* 텍스트가 줄어들 수 있도록 */
}

/* 로그인 안내 */
.login-guide {
  background: rgba(45, 51, 107, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(45, 51, 107, 0.1);
  margin: 0 1rem; /* 양옆 여백 추가 */
}

.login-guide p {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: var(--color-text);
}

.member-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.feature-tag {
  background: rgba(45, 51, 107, 0.1);
  color: var(--color-main);
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px; /* 최대 너비 제한 */
}

.login-btn {
  background: var(--color-main);
  color: var(--color-white);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  width: 100%;
}

.login-btn:hover {
  background: var(--color-sub);
  transform: translateY(-1px);
}

@media (max-width: 430px) {
  .button-container {
    padding: 0 0.5rem; /* 모바일에서 여백 조정 */
  }

  .button-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }

  .service-btn {
    justify-content: center;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.4rem 0.3rem;
    font-size: 0.55rem;
    min-height: 2.5rem;
    text-align: center;
  }

  .service-icon {
    font-size: 0.9rem;
  }

  .service-text {
    font-size: 0.55rem;
    white-space: nowrap;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    text-align: center;
  }

  .login-guide {
    margin: 0 0.5rem; /* 모바일에서 여백 조정 */
  }

  .feature-tag {
    font-size: 0.7rem;
    max-width: 120px; /* 모바일에서 최대 너비 조정 */
  }
}
</style>
