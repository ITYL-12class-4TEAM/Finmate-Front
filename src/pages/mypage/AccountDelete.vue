<template>
  <div class="delete-account">
    <!-- 메인 카드 -->
    <div class="delete-container">
      <div class="delete-card">
        <!-- 경고 메시지 -->
        <div class="warning-section">
          <div class="warning-header">
            <div class="warning-content">
              <h3 class="warning-title">⚠️ 중요한 안내사항</h3>
              <p class="warning-desc">
                계정 탈퇴는 <strong>되돌릴 수 없는</strong> 작업입니다. 아래 내용을 신중히 검토한 후
                진행해주세요.
              </p>
            </div>
          </div>
        </div>

        <!-- 삭제될 데이터 목록 -->
        <div class="deletion-info">
          <div class="section-header">
            <h4 class="section-title">
              <i class="fas fa-database me-2"></i>
              삭제될 데이터
            </h4>
          </div>

          <div class="deletion-grid">
            <div class="deletion-item">
              <div class="deletion-icon personal">
                <i class="fas fa-user"></i>
              </div>
              <div class="deletion-content">
                <h6>개인정보</h6>
                <ul>
                  <li>프로필 정보</li>
                  <li>계정 인증 정보</li>
                </ul>
              </div>
            </div>

            <div class="deletion-item">
              <div class="deletion-icon activity">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="deletion-content">
                <h6>활동 기록</h6>
                <ul>
                  <li>작성한 게시글, 댓글</li>
                  <li>좋아요, 공유 내역</li>
                </ul>
              </div>
            </div>

            <div class="deletion-item">
              <div class="deletion-icon finance">
                <i class="fas fa-chart-pie"></i>
              </div>
              <div class="deletion-content">
                <h6>금융 데이터</h6>
                <ul>
                  <li>포트폴리오 및 투자 기록</li>
                  <li>관심 종목 및 알림 설정</li>
                </ul>
              </div>
            </div>

            <div class="deletion-item">
              <div class="deletion-icon saved">
                <i class="fas fa-bookmark"></i>
              </div>
              <div class="deletion-content">
                <h6>저장된 콘텐츠</h6>
                <ul>
                  <li>스크랩한 게시글</li>
                  <li>즐겨찾기 목록</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 탈퇴 확인 폼 -->
        <div v-if="showConfirmation" class="confirmation-section">
          <div class="section-header">
            <h4 class="section-title danger">
              <i class="fas fa-exclamation-circle me-2"></i>
              탈퇴 확인
            </h4>
          </div>

          <div class="confirmation-form">
            <!-- 이메일 확인 -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-envelope me-2"></i>
                본인 확인을 위해 이메일을 입력해주세요
              </label>
              <div class="email-display">
                <strong>입력해야 할 이메일:</strong> {{ userInfo.email }}
              </div>
              <input
                v-model="confirmEmail"
                type="email"
                class="form-input"
                placeholder="위의 이메일을 정확히 입력하세요"
                :class="{ error: emailError }"
                @keyup.enter="proceedToDelete"
                @input="clearEmailError"
              />
              <div v-if="emailError" class="form-message error">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ emailError }}
              </div>
            </div>

            <!-- 탈퇴 사유 -->
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-comment me-2"></i>
                탈퇴 사유를 선택해주세요 (선택사항)
              </label>
              <select v-model="deleteReason" class="form-select">
                <option value="">사유를 선택하세요</option>
                <option value="not-useful">서비스가 유용하지 않음</option>
                <option value="privacy">개인정보 보호 우려</option>
                <option value="too-complex">사용이 복잡함</option>
                <option value="alternative">다른 서비스 이용</option>
                <option value="temporary">일시적으로 사용 중단</option>
                <option value="other">기타</option>
              </select>
            </div>

            <!-- 추가 의견 -->
            <div v-if="deleteReason === 'other'" class="form-group">
              <label class="form-label">
                <i class="fas fa-edit me-2"></i>
                추가 의견
              </label>
              <textarea
                v-model="additionalFeedback"
                class="form-textarea"
                placeholder="서비스 개선을 위한 의견을 남겨주세요"
                rows="3"
              ></textarea>
            </div>

            <!-- 최종 확인 체크박스 -->
            <div class="final-check">
              <label class="check-label">
                <input v-model="finalConfirm" type="checkbox" class="check-input" />
                <span class="check-mark"></span>
                <span class="check-text">
                  위의 모든 내용을 확인했으며, 계정 탈퇴에 따른
                  <strong>데이터 영구 삭제</strong>에 동의합니다.
                </span>
              </label>
            </div>

            <!-- 버튼 그룹 -->
            <div class="form-actions">
              <button
                type="button"
                class="action-btn secondary"
                :disabled="processing"
                @click="cancelDeletion"
              >
                <i class="fas fa-times me-2"></i>
                취소
              </button>
              <button
                type="button"
                class="action-btn danger"
                :disabled="!canProceed || processing"
                :class="{ processing: processing }"
                @click="proceedToDelete"
              >
                <i v-if="processing" class="fas fa-spinner fa-spin me-2"></i>
                <i v-else class="fas fa-trash me-2"></i>
                {{ processing ? '처리 중...' : '회원 탈퇴' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 탈퇴 시작 버튼 -->
        <div v-if="!showConfirmation" class="start-deletion">
          <div class="start-warning">
            <p>모든 내용을 확인하셨다면, 아래 버튼을 클릭하여 탈퇴 절차를 시작하세요.</p>
          </div>
          <div class="start-actions">
            <button type="button" class="action-btn danger" @click="startDeletion">
              <i class="fas fa-exclamation-triangle me-2"></i>
              탈퇴 절차 시작
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 최종 확인 모달 -->
    <div v-if="showFinalModal" class="modal-overlay" @click="closeFinalModal">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <div class="modal-title danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            최종 확인
          </div>
        </div>

        <div class="modal-body">
          <div class="final-warning">
            <div class="warning-icon-large">
              <i class="fas fa-skull-crossbones"></i>
            </div>
            <h5>정말로 계정을 삭제하시겠습니까?</h5>
            <p>이 작업은 <strong>되돌릴 수 없으며</strong>, 모든 데이터가 즉시 영구 삭제됩니다.</p>
            <div v-if="countdown > 0" class="countdown">
              {{ countdown }}초 후 확인 버튼이 활성화됩니다...
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-btn secondary" @click="closeFinalModal">
            <i class="fas fa-times me-2"></i>
            취소
          </button>
          <button
            class="modal-btn danger"
            :disabled="countdown > 0 || processing"
            :class="{ processing: processing }"
            @click="confirmFinalDeletion"
          >
            <i v-if="processing" class="fas fa-spinner fa-spin me-2"></i>
            <i v-else class="fas fa-trash me-2"></i>
            {{ processing ? '삭제 중...' : '영구 삭제 확인' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 반응형 데이터
const showConfirmation = ref(false);
const showFinalModal = ref(false);
const processing = ref(false);
const countdown = ref(0);

// 폼 데이터
const confirmEmail = ref('');
const deleteReason = ref('');
const additionalFeedback = ref('');
const finalConfirm = ref(false);

// 에러 상태
const emailError = ref('');

// 사용자 정보
const userInfo = ref({
  email: 'testuser@example.com',
  nickname: '테스트유저',
});

// 타이머 참조
let countdownTimer = null;

// 계산된 속성
const canProceed = computed(() => {
  return confirmEmail.value && finalConfirm.value && !emailError.value;
});

// 에러 클리어 함수들
const clearEmailError = () => {
  emailError.value = '';
};

// 탈퇴 절차 시작
const startDeletion = () => {
  showConfirmation.value = true;
  // 스크롤을 폼으로 이동
  setTimeout(() => {
    document.querySelector('.confirmation-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 100);
};

// 탈퇴 취소
const cancelDeletion = () => {
  showConfirmation.value = false;
  resetForm();
};

// 폼 초기화
const resetForm = () => {
  confirmEmail.value = '';
  deleteReason.value = '';
  additionalFeedback.value = '';
  finalConfirm.value = false;
  emailError.value = '';
};

// 탈퇴 진행
const proceedToDelete = () => {
  // 유효성 검사 초기화
  emailError.value = '';

  // 이메일 확인
  if (!confirmEmail.value) {
    emailError.value = '이메일을 입력해주세요.';
    return;
  }

  if (confirmEmail.value.toLowerCase().trim() !== userInfo.value.email.toLowerCase().trim()) {
    emailError.value = '이메일이 일치하지 않습니다.';
    return;
  }

  // 최종 확인 체크
  if (!finalConfirm.value) {
    alert('탈퇴 동의 사항을 확인해주세요.');
    return;
  }

  // 최종 모달 표시
  showFinalModal.value = true;
  startCountdown();
};

// 카운트다운 시작
const startCountdown = () => {
  countdown.value = 5;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
    }
  }, 1000);
};

// 최종 모달 닫기
const closeFinalModal = () => {
  showFinalModal.value = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  countdown.value = 0;
};

// 최종 삭제 확인
const confirmFinalDeletion = async () => {
  processing.value = true;

  try {
    // 서버 요청 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 탈퇴 처리 완료
    closeFinalModal();

    alert(
      `계정 탈퇴가 완료되었습니다.\n\n그동안 서비스를 이용해주셔서 감사했습니다.\n메인 페이지로 이동합니다.`
    );

    // 로컬 스토리지 정리
    localStorage.clear();

    goToMain();
  } catch (error) {
    alert('탈퇴 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
    console.error('Account deletion error:', error);
  } finally {
    processing.value = false;
  }
};

// 탈퇴 완료 후 메인 페이지로 이동
const goToMain = () => {
  router.push('/');
};

// 컴포넌트 언마운트
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.delete-account {
  min-height: 40vh;
  display: flex;
  flex-direction: column;
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
.delete-container {
  display: flex;
  justify-content: center;
}

.delete-card {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  padding: 0.5rem;
  border: 1px solid rgba(185, 187, 204, 0.3);
  box-shadow: 0 4px 16px -2px rgba(45, 51, 107, 0.1);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 800px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.delete-card:hover {
  box-shadow: 0 8px 24px -4px rgba(45, 51, 107, 0.15);
  border-color: rgba(185, 187, 204, 0.4);
}

/* 경고 섹션 */
.warning-section {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.warning-section:hover {
  border-color: rgba(245, 158, 11, 0.4);
}

.warning-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.warning-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.warning-section:hover .warning-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.warning-content {
  flex: 1;
}

.warning-title {
  color: var(--color-main);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.warning-desc {
  color: var(--color-sub);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

/* 섹션 공통 */
.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(185, 187, 204, 0.2);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
  display: flex;
  align-items: center;
}

.section-title.danger {
  color: #dc2626;
}

/* 삭제될 데이터 섹션 */
.deletion-info {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.deletion-info:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(185, 187, 204, 0.3);
}

.deletion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}

.deletion-item {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.75rem;
  padding: 0.75rem;
  border: 1px solid rgba(220, 38, 38, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.3s ease;
}

.deletion-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(220, 38, 38, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);
}

.deletion-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.deletion-item:hover .deletion-icon {
  transform: scale(1.05);
}

.deletion-icon.personal {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.deletion-icon.activity {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.deletion-icon.finance {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.deletion-icon.saved {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.deletion-content {
  flex: 1;
}

.deletion-content h6 {
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.deletion-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.deletion-content li {
  position: relative;
  padding-left: 1rem;
  color: var(--color-sub);
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.deletion-content li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #dc2626;
  font-weight: bold;
}

/* 확인 섹션 */
.confirmation-section {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.05) 100%);
  border: 2px solid rgba(220, 38, 38, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirmation-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
}

.email-display {
  padding: 0.75rem;
  background: rgba(185, 187, 204, 0.1);
  border: 1px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-sub);
}

.email-display strong {
  color: var(--color-main);
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.875rem;
  border: 2px solid rgba(185, 187, 204, 0.3);
  border-radius: 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-main);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--color-sub);
  opacity: 0.7;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-main);
  box-shadow: 0 0 0 4px rgba(45, 51, 107, 0.1);
  background: white;
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
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

.form-message {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  animation: slideInMessage 0.3s ease-out;
}

@keyframes slideInMessage {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-message.error {
  color: #dc2626;
}

/* 체크박스 */
.final-check {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(185, 28, 28, 0.08) 100%);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 0.75rem;
}

.check-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.check-label:hover {
  opacity: 0.8;
}

.check-input {
  display: none;
}

.check-mark {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(220, 38, 38, 0.5);
  border-radius: 0.25rem;
  background: white;
  position: relative;
  flex-shrink: 0;
  margin-top: 0.125rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.check-input:checked + .check-mark {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-color: #dc2626;
  transform: scale(1.05);
}

.check-input:checked + .check-mark::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
}

.check-text {
  color: var(--color-main);
  font-size: 0.9rem;
  line-height: 1.4;
}

.check-text strong {
  color: #dc2626;
}

/* 액션 버튼 */
.form-actions,
.start-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  width: 100%;
  border-radius: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 3rem;
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
  transform: translateY(-2px);
}

.action-btn.danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.action-btn.danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.25);
}

.action-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.action-btn:focus-visible {
  outline: 2px solid var(--color-main);
  outline-offset: 2px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.processing {
  background: linear-gradient(135deg, var(--color-sub) 0%, var(--color-light) 100%);
}

.action-btn.processing::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 시작 섹션 */
.start-deletion {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid rgba(185, 187, 204, 0.2);
  text-align: center;
  transition: all 0.3s ease;
}

.start-deletion:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(185, 187, 204, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 51, 107, 0.1);
}

.start-warning {
  margin-bottom: 1.5rem;
}

.start-warning p {
  color: var(--color-sub);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
  animation: modalOverlayAppear 0.3s ease-out;
}

@keyframes modalOverlayAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-card {
  background: linear-gradient(135deg, var(--color-white) 0%, var(--color-bg-light) 100%);
  border-radius: 1rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(185, 187, 204, 0.3);
  animation: modalCardAppear 0.3s ease-out;
}

@keyframes modalCardAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(185, 187, 204, 0.2);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}

.modal-title.danger {
  color: #dc2626;
}

.modal-body {
  padding: 1rem;
}

.final-warning {
  text-align: center;
}

.warning-icon-large {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin: 0 auto 1rem auto;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
  animation: warningPulse 2s infinite;
}

@keyframes warningPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.final-warning h5 {
  color: var(--color-main);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.final-warning p {
  color: var(--color-sub);
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.countdown {
  color: #f59e0b;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0.5rem;
  animation: countdownPulse 1s infinite;
}

@keyframes countdownPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem 1rem;
  border-top: 1px solid rgba(185, 187, 204, 0.2);
}

.modal-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 48px;
}

.modal-btn.secondary {
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-sub);
  border: 1px solid rgba(185, 187, 204, 0.3);
}

.modal-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-main);
  transform: translateY(-1px);
}

.modal-btn.danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.modal-btn.danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.modal-btn.processing {
  background: linear-gradient(135deg, var(--color-sub) 0%, var(--color-light) 100%);
  position: relative;
  overflow: hidden;
}

/* 향상된 호버 효과 */
.deletion-info:hover,
.start-deletion:hover {
  transform: translateY(-2px);
}

/* 커스텀 스크롤바 */
.delete-account::-webkit-scrollbar {
  width: 8px;
}

.delete-account::-webkit-scrollbar-track {
  background: rgba(185, 187, 204, 0.1);
  border-radius: 4px;
}

.delete-account::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-radius: 4px;
}

.delete-account::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
}

/* 폼 입력 상태 개선 */
.form-input:hover:not(:focus):not(.error),
.form-select:hover:not(:focus),
.form-textarea:hover:not(:focus) {
  border-color: rgba(45, 51, 107, 0.5);
}

/* 성공/에러 상태 아이콘 */
.form-input.error {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23dc2626'%3e%3cpath d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z'/%3e%3cpath d='M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

/* 로딩 상태 스피너 개선 */
.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
