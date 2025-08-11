<template>
  <div class="profile-info-container">
    <!-- 프로필 섹션 -->
    <div class="content-wrapper">
      <div class="profile-card">
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
      <div v-if="userData" class="info-card">
        <h3 class="card-title">기본 정보</h3>

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
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background: #f8f9fa;
  padding: 1rem 1rem; 
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: auto;
  overflow-x: hidden;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 0;
}

.profile-card,
.info-card {
  background: var(--color-white);
  border-radius: 0.75rem;
  padding: 0.75rem; /* 기존 1rem → 0.75rem로 축소 */
  border: none;
  box-shadow: none;
  flex-shrink: 0;
}

.action-section {
  padding: 0.25rem; /* 버튼 위쪽 여백 최소화 */
}

.profile-card {
  flex-shrink: 0;
}

.info-card {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  justify-content: flex-start;
}

/* 프로필 카드 */
.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-container {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  background: #f1f3f4;
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
  font-size: 0.9375rem;
  font-weight: 700;
  color: #191f28;
  margin: 0 0 0.125rem 0;
}

.profile-username {
  color: #8b95a1;
  font-size: 0.6875rem;
  margin: 0;
  font-weight: 500;
}

/* 카드 타이틀 */
.card-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #191f28;
  margin: 0 0 0.75rem 0;
  flex-shrink: 0;
}

/* 정보 리스트 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex-shrink: 0;
  min-height: 0;
  justify-content: flex-start;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
  flex-shrink: 0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  background: #f1f3f4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon i {
  color: var(--color-sub);
  font-size: 0.625rem;
}

.info-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.info-label {
  font-size: 0.6875rem;
  color: #191f28;
  font-weight: 500;
}

.info-value {
  color: #4e5968;
  font-size: 0.6875rem;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 알림 상태 */
.notification-status {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.1875rem 0.375rem;
  border-radius: 0.625rem;
  white-space: nowrap;
}

.notification-status.on {
  background: #e8f5e8;
  color: #00c853;
}

.notification-status.off {
  background: #f5f5f5;
  color: #8b95a1;
}

.edit-button {
  width: 100%;
  padding: 0.625rem;
  border-radius: 0.625rem;
  font-weight: 600;
  font-size: 0.6875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3125rem;
  border: none;
  background: var(--color-sub);
  color: white;
}

.edit-button:hover {
  background: var(--color-main);
  transform: translateY(-1px);
}

.edit-button:active {
  transform: translateY(0);
}

.edit-button i {
  font-size: 0.625rem;
}

/* 데스크톱 */
@media (min-width: 769px) {
  .profile-info-container {
    padding: 1.25rem 0.875rem;
  }

  .content-wrapper {
    gap: 1.25rem;
    margin-bottom: 1.75rem;
    overflow: visible;
  }

  .profile-card,
  .info-card {
    border-radius: 1rem;
    padding: 1.5rem;
    flex-shrink: 0;
    height: 100%;
  }

  .avatar-container {
    width: 3.25rem;
    height: 3.25rem;
  }

  .profile-header {
    gap: 1rem;
  }

  .profile-name {
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }

  .profile-username {
    font-size: 0.8125rem;
  }

  .card-title {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .info-item {
    gap: 0.875rem;
    padding: 1rem 0;
  }

  .info-icon {
    width: 2rem;
    height: 2rem;
  }

  .info-icon i {
    font-size: 0.8125rem;
  }

  .info-label,
  .info-value {
    font-size: 0.8125rem;
  }

  .notification-status {
    font-size: 0.75rem;
    padding: 0.3125rem 0.625rem;
    border-radius: 0.875rem;
  }

  .action-section {
    padding: 0 0.375rem 0 0.375rem;
  }

  .edit-button {
    padding: 0.9375rem;
    font-size: 0.8125rem;
    border-radius: 0.875rem;
    gap: 0.4375rem;
  }

  .edit-button i {
    font-size: 0.75rem;
  }
}

/* 큰 모바일 */
@media (max-width: 768px) and (min-height: 700px) {
  .info-item {
    padding: 0.875rem 0;
  }

  .info-icon {
    width: 1.75rem;
    height: 1.75rem;
  }

  .info-icon i {
    font-size: 0.75rem;
  }
}

/* 작은 모바일 */
@media (max-width: 430px) and (max-height: 700px) {
  .profile-info-container {
    padding: 0.75rem 0.625rem;
  }

  .profile-card,
  .info-card {
    padding: 1rem;
  }

  .content-wrapper {
    gap: 0.75rem;
  }

  .card-title {
    margin-bottom: 0.75rem;
  }

  .info-item {
    padding: 0.625rem 0;
  }

  .action-section {
    padding: 0.5rem 0.25rem 0 0.25rem;
  }
}
</style>
