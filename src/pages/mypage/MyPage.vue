<template>
  <div class="profile-info-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <div class="profile-header">
        <div class="avatar-container">
          <img
            v-if="userData && userData.profileImage"
            :src="userData.profileImage"
            alt="프로필"
            class="avatar-image"
          />
          <img v-else :src="defaultProfileImage" alt="프로필" class="avatar-image" />
        </div>
        <div class="profile-info">
          <h2 class="profile-name">{{ userData?.nickname || '로딩중...' }}</h2>
          <p class="profile-username">@{{ userData?.username || '' }}</p>
        </div>
      </div>
    </div>

    <!-- 기본 정보 -->
    <div v-if="userData" class="info-section">
      <h3 class="section-title">기본 정보</h3>

      <div class="info-list">
        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="info-content">
            <span class="info-label">이메일</span>
            <span class="info-value">{{ maskEmail(userData.email) }}</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-mobile-alt"></i>
          </div>
          <div class="info-content">
            <span class="info-label">전화번호</span>
            <span class="info-value">{{ maskPhoneNumber(userData.phoneNumber) }}</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-birthday-cake"></i>
          </div>
          <div class="info-content">
            <span class="info-label">생년월일</span>
            <span class="info-value">{{ formatDate(userData.birthDate) }}</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-venus-mars"></i>
          </div>
          <div class="info-content">
            <span class="info-label">성별</span>
            <span class="info-value">{{ userData.gender || '-' }}</span>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-bell"></i>
          </div>
          <div class="info-content">
            <span class="info-label">푸시 알림</span>
            <span :class="getNotificationBadgeClass()">
              {{ userData.receivePushNotification ? '허용' : '차단' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 정보 수정 버튼 -->
    <div v-if="userData" class="action-section">
      <button class="edit-button" @click="editProfile">
        <i class="fas fa-edit"></i>
        개인정보 수정
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { memberAPI } from '../../api/member';
// 이미지 import 방식 수정
import defaultProfileImg from '../../assets/images/DefaultProfileImg.png';
import { useToast } from '@/composables/useToast';
const { showToast } = useToast();

const router = useRouter();
const userData = ref(null); // 초기값을 null로 설정
const defaultProfileImage = ref(defaultProfileImg); // import된 이미지 사용

// 메서드들
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const maskPhoneNumber = (phone) => {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$2');
};

const maskEmail = (email) => {
  if (!email) return '-';
  const [username, domain] = email.split('@');
  const maskedUsername = username.slice(0, 2) + '*'.repeat(username.length - 2);
  return `${maskedUsername}@${domain}`;
};

const getNotificationBadgeClass = () => {
  if (!userData.value) return 'notification-status off';
  return userData.value.receivePushNotification
    ? 'notification-status on'
    : 'notification-status off';
};

const editProfile = () => {
  router.push('/mypage/settings');
};

onMounted(async () => {
  try {
    const response = await memberAPI.getMyInfo();
    if (response.success) {
      userData.value = response.data;
    } else {
      showToast('사용자 정보 조회 실패:', response.message, 'error');
    }
  } catch (error) {
    showToast('사용자 정보 조회 실패:', error, 'error');
  }
});
</script>

<style scoped>
.profile-info-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: var(--color-white);
  min-height: 100vh;
}

/* 프로필 섹션 */
.profile-section {
  margin-bottom: 2.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-white);
  border: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.02em;
}

.profile-username {
  color: var(--color-sub);
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

/* 정보 섹션 */
.info-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: var(--color-white);
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon i {
  color: var(--color-sub);
  font-size: 1rem;
}

.info-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.info-label {
  font-size: 0.9rem;
  color: var(--color-main);
  font-weight: 600;
}

.info-value {
  color: var(--color-sub);
  font-size: 0.9rem;
  font-weight: 500;
  text-align: right;
}

/* 알림 상태 */
.notification-status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  white-space: nowrap;
}

.notification-status.on {
  background: #f0fdf4;
  color: #16a34a;
}

.notification-status.off {
  background: var(--color-white);
  border: 1px solid #f1f5f9;
  color: var(--color-light);
}

/* 액션 섹션 */
.action-section {
  margin-top: 2rem;
}

.edit-button {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  background: var(--color-main);
  color: white;
  letter-spacing: -0.01em;
}

.edit-button:hover {
  background: #252968;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 51, 107, 0.25);
}

.edit-button:active {
  transform: translateY(0);
}

.edit-button i {
  font-size: 0.85rem;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .profile-info-container {
    padding: 1.5rem 1rem;
    margin-top: 3rem;
  }

  .profile-section {
    margin-bottom: 2rem;
  }

  .profile-header {
    gap: 0.75rem;
  }

  .avatar-container {
    width: 3rem;
    height: 3rem;
    background: var(--color-white);
    border: 1px solid #f1f5f9;
  }

  .profile-name {
    font-size: 1.25rem;
  }

  .profile-username {
    font-size: 0.85rem;
  }

  .info-section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 1.25rem;
  }

  .info-item {
    gap: 0.75rem;
    padding: 0.875rem 0;
  }

  .info-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 10px;
    background: var(--color-white);
    border: 1px solid #f1f5f9;
  }

  .info-icon i {
    font-size: 0.9rem;
  }

  .info-label,
  .info-value {
    font-size: 0.85rem;
  }

  .notification-status {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }

  .edit-button {
    padding: 0.875rem;
    font-size: 0.85rem;
  }

  .edit-button i {
    font-size: 0.8rem;
  }
}
</style>
