<template>
  <div class="edit-profile">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h2 class="page-title">
        <i class="fas fa-user-edit me-2"></i>
        회원정보 수정
      </h2>
      <p class="page-subtitle">개인정보를 안전하게 수정하실 수 있습니다</p>
    </div>

    <!-- 메인 카드 -->
    <div class="edit-container">
      <div class="edit-card">
        <!-- 수정 불가능한 정보 -->
        <div class="info-section readonly-section">
          <div class="section-header">
            <h5 class="section-title">
              <i class="fas fa-lock me-2"></i>
              기본 정보 (수정 불가)
            </h5>
          </div>

          <div class="readonly-grid">
            <div class="readonly-item">
              <div class="readonly-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <div class="readonly-content">
                <label class="readonly-label">이메일</label>
                <div class="readonly-value">{{ userInfo.email }}</div>
              </div>
            </div>

            <div class="readonly-item">
              <div class="readonly-icon">
                <i class="fas fa-phone"></i>
              </div>
              <div class="readonly-content">
                <label class="readonly-label">휴대폰 번호</label>
                <div class="readonly-value">{{ userInfo.phoneNumber }}</div>
              </div>
            </div>

            <div class="readonly-item">
              <div class="readonly-icon">
                <i class="fas fa-birthday-cake"></i>
              </div>
              <div class="readonly-content">
                <label class="readonly-label">생년월일</label>
                <div class="readonly-value">
                  {{ formatBirthDate(userInfo.birthDate) }}
                </div>
              </div>
            </div>

            <div class="readonly-item">
              <div class="readonly-icon">
                <i class="fas fa-venus-mars"></i>
              </div>
              <div class="readonly-content">
                <label class="readonly-label">성별</label>
                <div class="readonly-value">{{ userInfo.gender }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 수정 가능한 정보 -->
        <form @submit.prevent="updateProfile" class="edit-form">
          <div class="info-section">
            <div class="section-header">
              <h5 class="section-title">
                <i class="fas fa-edit me-2"></i>
                수정 가능한 정보
              </h5>
            </div>

            <!-- 닉네임 변경 -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-user me-2"></i>
                닉네임
              </label>
              <div class="input-with-button">
                <input
                  v-model="editForm.nickname"
                  type="text"
                  class="form-input"
                  placeholder="새 닉네임을 입력하세요"
                  maxlength="30"
                  :class="{ error: nicknameError, success: nicknameChecked }"
                  @input="onNicknameChange"
                />
                <button
                  type="button"
                  class="input-button"
                  @click="checkNicknameAvailability"
                  :disabled="!editForm.nickname || checkingNickname"
                  :class="{ loading: checkingNickname }"
                >
                  <i v-if="checkingNickname" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-check"></i>
                  중복확인
                </button>
              </div>

              <div v-if="nicknameError" class="form-message error">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ nicknameError }}
              </div>
              <div v-else-if="nicknameChecked" class="form-message success">
                <i class="fas fa-check-circle me-2"></i>
                사용 가능한 닉네임입니다.
              </div>
              <div class="form-hint">
                2-30자의 한글, 영문, 숫자 조합 (특수문자 제외)
              </div>
            </div>

            <!-- 비밀번호 변경 -->
            <div class="form-group">
              <div class="password-toggle-section">
                <label class="toggle-label">
                  <input
                    v-model="changePassword"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <span class="toggle-slider"></span>
                  <span class="toggle-text">
                    <i class="fas fa-key me-2"></i>
                    비밀번호 변경
                  </span>
                </label>
              </div>

              <div v-if="changePassword" class="password-fields">
                <div class="form-group">
                  <label class="form-label">새 비밀번호</label>
                  <div class="password-input-wrapper">
                    <input
                      v-model="editForm.newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="form-input"
                      placeholder="새 비밀번호를 입력하세요"
                      :class="{ error: passwordError }"
                      @input="validatePassword"
                    />
                    <button
                      type="button"
                      class="password-toggle-btn"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <i
                        :class="
                          showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                        "
                      ></i>
                    </button>
                  </div>
                  <div v-if="passwordError" class="form-message error">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ passwordError }}
                  </div>
                  <div class="form-hint">8자 이상, 영문+숫자+특수문자 조합</div>
                </div>

                <div class="form-group">
                  <label class="form-label">새 비밀번호 확인</label>
                  <input
                    v-model="editForm.confirmPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    class="form-input"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    :class="{ error: confirmPasswordError }"
                    @input="validatePassword"
                  />
                  <div v-if="confirmPasswordError" class="form-message error">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ confirmPasswordError }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 알림 설정 -->
          <div class="info-section">
            <div class="section-header">
              <h5 class="section-title">
                <i class="fas fa-bell me-2"></i>
                알림 설정
              </h5>
            </div>

            <div class="notification-setting">
              <label class="notification-label">
                <input
                  v-model="editForm.receivePushNotification"
                  type="checkbox"
                  class="notification-input"
                />
                <span class="notification-slider"></span>
                <div class="notification-content">
                  <span class="notification-title">푸시 알림 받기</span>
                  <span class="notification-desc"
                    >새로운 댓글, 좋아요, 공지사항 등의 알림을 받을 수
                    있습니다.</span
                  >
                </div>
              </label>
            </div>
          </div>

          <!-- 수정 버튼 -->
          <div class="form-actions">
            <button
              type="submit"
              class="action-btn primary"
              :disabled="loading || !isFormValid"
              :class="{ loading: loading }"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin me-2"></i>
              <i v-else class="fas fa-save me-2"></i>
              {{ loading ? '저장 중...' : '변경사항 저장' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 반응형 데이터
const loading = ref(false);
const changePassword = ref(false);
const showNewPassword = ref(false);
const checkingNickname = ref(false);
const nicknameChecked = ref(false);
const nicknameError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

// 사용자 기본 정보 (수정 불가)
const userInfo = ref({
  email: 'testuser@example.com',
  phoneNumber: '010-1234-5678',
  birthDate: '1995-03-15',
  gender: '남',
  nickname: '테스트유저',
  receivePushNotification: true,
});

// 수정 폼 데이터
const editForm = ref({
  nickname: '',
  newPassword: '',
  confirmPassword: '',
  receivePushNotification: true,
});

// 폼 유효성 검사
const isFormValid = computed(() => {
  let valid = true;

  // 닉네임이 변경되었다면 중복확인 필요
  if (
    editForm.value.nickname &&
    editForm.value.nickname !== userInfo.value.nickname
  ) {
    valid = valid && nicknameChecked.value && !nicknameError.value;
  }

  // 비밀번호 변경을 선택했다면 비밀번호 검증 필요
  if (changePassword.value) {
    valid =
      valid &&
      editForm.value.newPassword &&
      !passwordError.value &&
      !confirmPasswordError.value;
  }

  return valid;
});

// 생년월일 포맷팅
const formatBirthDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR');
};

// 닉네임 변경 감지
const onNicknameChange = () => {
  nicknameChecked.value = false;
  nicknameError.value = '';
};

// 닉네임 중복확인
const checkNicknameAvailability = async () => {
  if (!editForm.value.nickname) return;

  checkingNickname.value = true;
  nicknameError.value = '';
  nicknameChecked.value = false;

  try {
    // 닉네임 유효성 검사
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,30}$/;
    if (!nicknameRegex.test(editForm.value.nickname)) {
      nicknameError.value = '2-30자의 한글, 영문, 숫자만 사용 가능합니다.';
      return;
    }

    // 기존 닉네임과 같은지 확인
    if (editForm.value.nickname === userInfo.value.nickname) {
      nicknameError.value = '현재 닉네임과 동일합니다.';
      return;
    }

    // 서버 요청 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 간단한 중복 체크
    const unavailableNicknames = ['관리자', 'admin', '테스트', 'test'];
    if (unavailableNicknames.includes(editForm.value.nickname.toLowerCase())) {
      nicknameError.value = '이미 사용 중인 닉네임입니다.';
    } else {
      nicknameChecked.value = true;
    }
  } catch (err) {
    nicknameError.value = '중복확인 중 오류가 발생했습니다.';
  } finally {
    checkingNickname.value = false;
  }
};

// 비밀번호 유효성 검사
const validatePassword = () => {
  if (!changePassword.value) return;

  const password = editForm.value.newPassword;
  const confirmPassword = editForm.value.confirmPassword;

  passwordError.value = '';
  confirmPasswordError.value = '';

  if (password) {
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      passwordError.value =
        '8자 이상의 영문, 숫자, 특수문자 조합이어야 합니다.';
    }
  }

  if (confirmPassword && password !== confirmPassword) {
    confirmPasswordError.value = '비밀번호가 일치하지 않습니다.';
  }
};

// 프로필 업데이트
const updateProfile = async () => {
  validatePassword();

  if (!isFormValid.value) {
    alert('입력 정보를 다시 확인해주세요.');
    return;
  }

  loading.value = true;

  try {
    // 서버 요청 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const updateData = {
      receivePushNotification: editForm.value.receivePushNotification,
    };

    // 닉네임이 변경되었다면 추가
    if (
      editForm.value.nickname &&
      editForm.value.nickname !== userInfo.value.nickname
    ) {
      updateData.nickname = editForm.value.nickname;
      userInfo.value.nickname = editForm.value.nickname;
    }

    // 비밀번호가 변경되었다면 추가
    if (changePassword.value && editForm.value.newPassword) {
      updateData.password = editForm.value.newPassword;
    }

    userInfo.value.receivePushNotification =
      editForm.value.receivePushNotification;

    alert('회원정보가 성공적으로 수정되었습니다.');
    resetForm();
  } catch (err) {
    alert('회원정보 수정 중 오류가 발생했습니다.');
    console.error('Profile update error:', err);
  } finally {
    loading.value = false;
  }
};

// 컴포넌트 마운트
onMounted(() => {
  // 비밀번호 인증 확인
  const verified = localStorage.getItem('passwordVerified');
  if (!verified) {
    alert('비밀번호 확인이 필요합니다.');
    router.push('/mypage/verify-password');
    return;
  }
});
</script>

<style scoped>
.edit-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fc 0%, #e9ecef 100%);
  padding: 2rem 1rem;
}

/* 페이지 헤더 */
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-main);
  margin-bottom: 0.5rem;
  font-family: 'Pretendard', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-subtitle {
  color: var(--color-sub);
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

/* 메인 컨테이너 */
.edit-container {
  display: flex;
  justify-content: center;
}

.edit-card {
  background: linear-gradient(135deg, var(--color-white) 0%, #f8f9fc 100%);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 8px 32px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 800px;
}

/* 섹션 */
.info-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(185, 187, 204, 0.2);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-main);
  margin: 0;
  display: flex;
  align-items: center;
}

.section-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.section-badge.readonly {
  background: linear-gradient(
    135deg,
    var(--color-sub) 0%,
    var(--color-light) 100%
  );
}

.section-badge.editable {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
}

/* 읽기 전용 섹션 */
.readonly-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.readonly-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
}

.readonly-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-sub) 0%,
    var(--color-light) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.readonly-content {
  flex: 1;
}

.readonly-label {
  display: block;
  font-size: 0.75rem;
  color: var(--color-sub);
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.readonly-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
}

/* 폼 스타일 */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  font-family: 'Pretendard', sans-serif;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 4px rgba(45, 51, 107, 0.1);
  background: white;
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.form-input.success {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button .form-input {
  flex: 1;
}

.input-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.input-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.3);
}

.input-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.input-button.loading {
  background: linear-gradient(
    135deg,
    var(--color-sub) 0%,
    var(--color-light) 100%
  );
}

.form-message {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.form-message.error {
  color: #dc2626;
}

.form-message.success {
  color: #10b981;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-sub);
  margin-top: 0.25rem;
  opacity: 0.8;
}

/* 비밀번호 관련 */
.password-toggle-section {
  margin-bottom: 1rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background: rgba(185, 187, 204, 0.3);
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(1.5rem);
}

.toggle-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  display: flex;
  align-items: center;
}

.password-fields {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(185, 187, 204, 0.2);
  animation: slideDown 0.3s ease-out;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-sub);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.password-toggle-btn:hover {
  color: var(--color-main);
  background: rgba(185, 187, 204, 0.1);
}

/* 알림 설정 */
.notification-setting {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
}

.notification-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  user-select: none;
}

.notification-input {
  display: none;
}

.notification-slider {
  position: relative;
  width: 3.5rem;
  height: 2rem;
  background: rgba(185, 187, 204, 0.3);
  border-radius: 1rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.notification-slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.notification-input:checked + .notification-slider {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.notification-input:checked + .notification-slider::before {
  transform: translateX(1.5rem);
}

.notification-content {
  flex: 1;
}

.notification-title {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  margin-bottom: 0.25rem;
}

.notification-desc {
  font-size: 0.85rem;
  color: var(--color-sub);
  line-height: 1.4;
}

/* 액션 버튼 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Pretendard', sans-serif;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-sub);
  border: 1px solid rgba(185, 187, 204, 0.3);
}

.action-btn.secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-main);
  border-color: rgba(185, 187, 204, 0.5);
}

.action-btn.primary {
  background: linear-gradient(
    135deg,
    var(--color-main) 0%,
    var(--color-sub) 100%
  );
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(45, 51, 107, 0.25);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.loading {
  background: linear-gradient(
    135deg,
    var(--color-sub) 0%,
    var(--color-light) 100%
  );
}

/* 계정 관리 섹션 */
.account-management {
  background: linear-gradient(
    135deg,
    rgba(248, 249, 252, 0.8) 0%,
    rgba(233, 236, 239, 0.8) 100%
  );
  border: 1px solid rgba(185, 187, 204, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
}

.management-content {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(185, 187, 204, 0.15);
  padding: 1rem;
}

.management-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.management-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.management-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.management-text h6 {
  color: var(--color-main);
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.management-text p {
  color: var(--color-sub);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.management-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.management-btn.danger {
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0.1) 0%,
    rgba(185, 28, 28, 0.1) 100%
  );
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.management-btn.danger:hover {
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0.15) 0%,
    rgba(185, 28, 28, 0.15) 100%
  );
  border-color: rgba(220, 38, 38, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

/* 애니메이션 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 300px;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .edit-profile {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .edit-card {
    padding: 1.5rem;
  }

  .readonly-grid {
    grid-template-columns: 1fr;
  }

  .input-with-button {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .management-item {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .edit-card {
    padding: 1rem;
  }

  .info-section {
    padding: 1rem;
  }

  .readonly-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .notification-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
