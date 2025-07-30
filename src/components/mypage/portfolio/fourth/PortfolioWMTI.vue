<template>
  <div class="tab-pane active">
    <div class="row">
      <div class="col-12">
        <div class="stats-card">
          <div class="stats-header">
            <h5 class="stats-title">
              <i class="bi bi-person-badge me-2"></i>WMTI 투자 성향 분석
            </h5>
            <small class="text-muted">나만의 투자 성향을 분석해보세요</small>
          </div>
          <div class="stats-content">
            <div class="text-center py-5">
              <i class="bi bi-graph-up-arrow display-4 text-muted mb-3"></i>
              <h4 class="text-muted mb-3">WMTI 분석 준비 중</h4>
              <p class="text-muted mb-4">
                투자 성향과 포트폴리오 분석 기능이 곧 제공될 예정입니다.<br />
                개인별 맞춤 투자 전략과 성향 분석을 받아보세요.
              </p>
              <button class="btn btn-outline-primary" disabled>
                <i class="bi bi-clock me-2"></i>서비스 준비중
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-pane {
  min-height: 400px;
}

.stats-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.stats-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.stats-title {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.stats-content {
  padding: 0;
}

@media (max-width: 992px) {
  .stats-card {
    padding: 1rem;
  }

  .stats-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }
}
</style>
