<template>
  <div class="data-section">
    <h3 class="section-title">
      <i class="fas fa-database"></i>
      삭제될 데이터
    </h3>

    <div class="data-list">
      <div class="data-item">
        <i class="fas fa-user"></i>
        <div class="data-content">
          <h4>개인정보</h4>
          <p>프로필 정보, 계정 인증 정보</p>
        </div>
      </div>

      <div class="data-item">
        <i class="fas fa-chart-line"></i>
        <div class="data-content">
          <h4>활동 기록</h4>
          <p>작성한 게시글, 댓글, 좋아요, 공유 내역</p>
        </div>
      </div>

      <div class="data-item">
        <i class="fas fa-chart-pie"></i>
        <div class="data-content">
          <h4>금융 데이터</h4>
          <p>포트폴리오 및 투자 기록, 관심 종목 및 알림 설정</p>
        </div>
      </div>

      <div class="data-item">
        <i class="fas fa-bookmark"></i>
        <div class="data-content">
          <h4>저장된 콘텐츠</h4>
          <p>스크랩한 게시글, 즐겨찾기 목록</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 컴포넌트 로직 없음
</script>

<style scoped>
.data-section {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-bg-light);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.section-title i {
  color: var(--color-sub);
  font-size: 0.9rem;
}

.data-list {
  display: grid;
  gap: 0.6rem;
}

.data-item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.8rem;
  background: var(--color-bg-light);
  border-radius: 8px;
  border-left: 3px solid var(--color-main);
}

.data-item i {
  color: var(--color-main);
  font-size: 0.9rem;
  margin-top: 0.25rem;
  width: 1.25rem;
  text-align: center;
}

.data-content {
  flex: 1;
}

.data-content h4 {
  color: var(--color-main);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.data-content p {
  color: var(--color-sub);
  font-size: 0.7rem;
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 768px) {
  .data-section {
    padding: 1.5rem;
  }

  .data-list {
    gap: 0.75rem;
  }

  .data-item {
    padding: 0.75rem;
  }

  .data-item i {
    font-size: 1.125rem;
  }

  .data-content h4 {
    font-size: 0.9rem;
  }

  .data-content p {
    font-size: 0.85rem;
  }
}
</style>
