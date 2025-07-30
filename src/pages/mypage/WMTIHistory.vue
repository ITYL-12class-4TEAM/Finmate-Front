<template>
  <div class="wmti-history">
    <div class="page-header">
      <h2 class="page-title">WMTI 검사 히스토리</h2>
      <p class="page-subtitle">과거 금융 성향 검사 기록을 확인하세요</p>
    </div>

    <div class="content-area">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <div v-else-if="historyList.length === 0" class="empty-state">
        <div class="text-center py-5">
          <i class="bi bi-list-ul display-1 text-muted"></i>
          <h4 class="mt-3 text-muted">아직 검사 히스토리가 없습니다</h4>
          <p class="text-muted">금융 성향 검사를 받아보세요.</p>
          <router-link to="/wmti" class="btn btn-primary">
            <i class="bi bi-clipboard-check me-2"></i>검사 받기
          </router-link>
        </div>
      </div>

      <div v-else>
        <!-- 히스토리 리스트 -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">검사 기록 ({{ historyList.length }}건)</h5>
                <div>
                  <select v-model="sortBy" @change="sortHistory" class="form-select form-select-sm">
                    <option value="date-desc">최신순</option>
                    <option value="date-asc">오래된순</option>
                    <option value="score-desc">점수 높은순</option>
                    <option value="score-asc">점수 낮은순</option>
                  </select>
                </div>
              </div>
              <div class="card-body">
                <div class="timeline">
                  <div v-for="(history, index) in historyList" :key="history.id" class="timeline-item">
                    <div class="timeline-marker" :class="getTimelineMarkerClass(index)"></div>
                    <div class="timeline-content">
                      <div class="history-card">
                        <div class="row align-items-center">
                          <div class="col-md-8">
                            <div class="d-flex align-items-center mb-2">
                              <span class="badge badge-type me-2">{{ history.type }}</span>
                              <h6 class="mb-0">{{ history.typeName }}</h6>
                            </div>
                            <p class="text-muted mb-2">{{ history.description }}</p>
                            <div class="history-stats">
                              <div class="stat-item me-4">
                                <small class="text-muted">위험도</small>
                                <div class="fw-bold">{{ history.riskLevel }}/10</div>
                              </div>
                              <div class="stat-item me-4">
                                <small class="text-muted">기대수익</small>
                                <div class="fw-bold text-success">{{ history.returnExpectation }}%</div>
                              </div>
                              <div class="stat-item">
                                <small class="text-muted">총점</small>
                                <div class="fw-bold text-primary">{{ history.score }}점</div>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-4 text-end">
                            <div class="mb-2">
                              <small class="text-muted">
                                <i class="bi bi-calendar me-1"></i>
                                {{ formatDate(history.createdAt) }}
                              </small>
                            </div>
                            <div class="action-buttons">
                              <button @click="viewResult(history)" class="btn btn-sm btn-outline-primary me-2">
                                <i class="bi bi-eye me-1"></i>결과 보기
                              </button>
                              <button @click="downloadResult(history)" class="btn btn-sm btn-outline-secondary me-2">
                                <i class="bi bi-download me-1"></i>다운로드
                              </button>
                              <button @click="deleteHistory(history)" class="btn btn-sm btn-outline-danger">
                                <i class="bi bi-trash me-1"></i>삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 비교 차트 -->
        <div class="row mt-4" v-if="historyList.length > 1">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">성향 변화 추이</h5>
              </div>
              <div class="card-body">
                <div class="comparison-chart">
                  <canvas id="historyChart" width="400" height="200"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(false)
const error = ref('')
const historyList = ref([])
const sortBy = ref('date-desc')

const fetchHistory = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.get('/api/user/wmti/history')
    historyList.value = response.data
    sortHistory()
  } catch (err) {
    error.value = 'WMTI 히스토리를 불러오는데 실패했습니다.'
    console.error('WMTI history fetch error:', err)
  } finally {
    loading.value = false
  }
}

const sortHistory = () => {
  switch (sortBy.value) {
    case 'date-desc':
      historyList.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'date-asc':
      historyList.value.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'score-desc':
      historyList.value.sort((a, b) => b.score - a.score)
      break
    case 'score-asc':
      historyList.value.sort((a, b) => a.score - b.score)
      break
  }
}

const viewResult = (history) => {
  // 결과 상세 페이지로 이동 또는 모달 열기
  window.open(`/mypage/wmti-result/${history.id}`, '_blank')
}

const downloadResult = async (history) => {
  try {
    const response = await axios.get(`/api/user/wmti/history/${history.id}/download`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `WMTI_결과_${formatDate(history.createdAt)}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert('다운로드에 실패했습니다.')
    console.error('Download error:', err)
  }
}

const deleteHistory = async (history) => {
  if (!confirm('이 검사 기록을 삭제하시겠습니까?')) return
  
  try {
    await axios.delete(`/api/user/wmti/history/${history.id}`)
    historyList.value = historyList.value.filter(h => h.id !== history.id)
    alert('기록이 삭제되었습니다.')
  } catch (err) {
    alert('삭제에 실패했습니다.')
    console.error('Delete error:', err)
  }
}

const getTimelineMarkerClass = (index) => {
  if (index === 0) return 'timeline-marker-latest'
  return 'timeline-marker-normal'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.wmti-history {
  padding: 1rem 0;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2.25rem;
  top: 0.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-marker-latest {
  background-color: #0d6efd;
}

.timeline-marker-normal {
  background-color: #6c757d;
}

.timeline-content {
  padding-left: 1rem;
}

.history-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.history-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.badge-type {
  background-color: #6f42c1;
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.history-stats {
  display: flex;
  align-items: center;
}

.stat-item {
  display: inline-block;
}

.stat-item small {
  display: block;
  font-size: 0.75rem;
}

.action-buttons .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.empty-state i {
  font-size: 4rem;
}

.comparison-chart {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}
</style>
