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
            <div class="profile-name-section">
              <h2 class="profile-name">{{ userData?.nickname || '로딩중...' }}</h2>
            </div>
            <p class="profile-username">@{{ userData?.username || '' }}</p>
          </div>
        </div>
      </div>

      <!-- 기본 정보 -->
      <div v-if="userData" class="info-card">
        <h3 class="card-title">
          <i class="fa-solid fa-user"></i>
          기본 정보
        </h3>

        <div class="info-list">
          <div class="info-item">
            <div class="info-label">
              <i class="fa-solid fa-envelope"></i>
              <span>이메일</span>
            </div>
            <span class="info-value">{{ maskEmail(userData.email) }}</span>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="fa-solid fa-phone"></i>
              <span>전화번호</span>
            </div>
            <span class="info-value">{{ maskPhoneNumber(userData.phoneNumber) }}</span>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="fa-solid fa-calendar"></i>
              <span>생년월일</span>
            </div>
            <span class="info-value">{{ formatDate(userData.birthDate) }}</span>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="fa-solid fa-venus-mars"></i>
              <span>성별</span>
            </div>
            <span class="info-value">{{ userData.gender || '-' }}</span>
          </div>

          <div class="info-item">
            <div class="info-label">
              <i class="fa-solid fa-bell"></i>
              <span>푸시 알림</span>
            </div>
            <span :class="getNotificationBadgeClass()">
              {{ userData.receivePushNotification ? '허용' : '차단' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 정보 수정 버튼 -->
    <div v-if="userData" class="action-buttons">
      <button class="primary-button" @click="editProfile">
        <i class="fa-solid fa-edit"></i>
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
  if (!userData.value) return 'badge notification-off';
  return userData.value.receivePushNotification
    ? 'badge notification-on'
    : 'badge notification-off';
};

const editProfile = () => {
  router.push('/mypage/settings');
};

onMounted(async () => {
  try {
    const response = await memberAPI.getMyInfo();
    if (response.success) {
      userData.value = response.data;
      console.log('사용자 정보:', userData.value);
    } else {
      console.error('사용자 정보 조회 실패:', response);
    }
  } catch (error) {
    console.error('API 호출 에러:', error);
  }
});
</script>

<style scoped>
.profile-info-container {
  max-width: 430px;
  margin: 0 auto;
  background: var(--color-white);
  min-height: 100vh;
}

/* 카드 공통 스타일 */
.profile-card,
.info-card {
  background: var(--color-white);
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(185, 187, 204, 0.1);
  border: 1px solid rgba(185, 187, 204, 0.2);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

/* 프로필 카드 */
.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, rgba(45, 51, 107, 0.1) 0%, rgba(45, 51, 107, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 1.75rem;
  color: var(--color-sub);
}

.profile-info {
  flex: 1;
}

.profile-name-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.profile-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
}

.profile-username {
  color: var(--color-light);
  font-size: 0.75rem;
  margin: 0 0 0.25rem 0;
}

/* 정보 카드 */
.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0 0 1rem 0;
}

.card-title i {
  color: var(--color-sub);
  font-size: 1.25rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(185, 187, 204, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-light);
  font-weight: 500;
}

.info-label i {
  color: var(--color-light);
  width: 1.125rem;
  font-size: 1rem;
}

.info-value {
  color: var(--color-main);
  font-size: 0.875rem;
  font-weight: 500;
}

/* 배지 스타일 */
.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.notification-on {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.notification-off {
  background: rgba(185, 187, 204, 0.1);
  color: var(--color-light);
}

/* 액션 버튼 */
.action-buttons {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.primary-button {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  background: var(--color-sub);
  color: white;
}

.primary-button:hover {
  background: var(--color-main);
  transform: translateY(-1px);
}
</style>
