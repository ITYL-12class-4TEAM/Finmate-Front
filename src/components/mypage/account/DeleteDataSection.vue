<template>
  <div class="deletion-info">
    <div class="section-header">
      <h3 class="section-title">
        <i class="fas fa-database"></i>
        삭제될 데이터
      </h3>
    </div>

    <div class="deletion-grid">
      <div class="deletion-item">
        <div class="deletion-icon personal">
          <i class="fas fa-user"></i>
        </div>
        <div class="deletion-content">
          <h4>개인정보</h4>
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
          <h4>활동 기록</h4>
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
          <h4>금융 데이터</h4>
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
          <h4>저장된 콘텐츠</h4>
          <ul>
            <li>스크랩한 게시글</li>
            <li>즐겨찾기 목록</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 컴포넌트 로직 없음
</script>

<style scoped>
.deletion-info {
  padding: 2rem;
  border-bottom: 1px solid var(--color-bg-light);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-main);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  font-size: 1rem;
  color: var(--color-sub);
}

.deletion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.deletion-item {
  background: var(--color-bg-light);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: all 0.2s ease;
  border: 1px solid rgba(220, 38, 38, 0.1);
}

.deletion-item:hover {
  background: #e8e9ee;
  border-color: rgba(220, 38, 38, 0.2);
}

.deletion-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.deletion-icon.personal {
  background: #3b82f6;
}

.deletion-icon.activity {
  background: #10b981;
}

.deletion-icon.finance {
  background: #f59e0b;
}

.deletion-icon.saved {
  background: #8b5cf6;
}

.deletion-content {
  flex: 1;
}

.deletion-content h4 {
  color: var(--color-main);
  font-size: 1rem;
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
  font-size: 0.9rem;
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

@media (max-width: 768px) {
  .deletion-info {
    padding: 1.5rem;
  }

  .deletion-grid {
    grid-template-columns: 1fr;
  }

  .deletion-item {
    padding: 0.75rem;
  }

  .deletion-icon {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
}
</style>