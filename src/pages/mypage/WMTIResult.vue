<template>
  <div class="wmti-result">
    <div class="page-header">
      <h2 class="page-title">WMTI 결과</h2>
      <p class="page-subtitle">나의 금융 성향 분석 결과를 확인하세요</p>
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

      <div v-else-if="!result" class="empty-state">
        <div class="text-center py-5">
          <i class="bi bi-graph-up display-1 text-muted"></i>
          <h4 class="mt-3 text-muted">아직 WMTI 검사를 받지 않았습니다</h4>
          <p class="text-muted">금융 성향 검사를 받고 나만의 투자 유형을 알아보세요.</p>
          <router-link to="/wmti" class="btn btn-primary">
            <i class="bi bi-clipboard-check me-2"></i>검사 받기
          </router-link>
        </div>
      </div>

      <div v-else>
        <!-- 결과 요약 카드 -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card result-card">
              <div class="card-body text-center">
                <div class="result-type mb-4">
                  <h1 class="display-4 mb-3">{{ result.type }}</h1>
                  <h3 class="text-primary mb-3">{{ result.typeName }}</h3>
                  <p class="lead">{{ result.description }}</p>
                </div>
                
                <div class="result-stats row">
                  <div class="col-md-3 col-6 mb-3">
                    <div class="stat-item">
                      <h4 class="text-primary">{{ result.riskLevel }}/10</h4>
                      <small class="text-muted">위험 선호도</small>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <div class="stat-item">
                      <h4 class="text-success">{{ result.returnExpectation }}%</h4>
                      <small class="text-muted">기대 수익률</small>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <div class="stat-item">
                      <h4 class="text-info">{{ result.investmentPeriod }}</h4>
                      <small class="text-muted">투자 기간</small>
                    </div>
                  </div>
                  <div class="col-md-3 col-6 mb-3">
                    <div class="stat-item">
                      <h4 class="text-warning">{{ result.score }}점</h4>
                      <small class="text-muted">총점</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 상세 분석 -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">투자 성향 분석</h5>
              </div>
              <div class="card-body">
                <div class="analysis-item mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span>안정성 선호</span>
                    <span class="fw-bold">{{ result.analysis.stability }}%</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-success" :style="{ width: result.analysis.stability + '%' }"></div>
                  </div>
                </div>
                
                <div class="analysis-item mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span>수익성 추구</span>
                    <span class="fw-bold">{{ result.analysis.profitability }}%</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-primary" :style="{ width: result.analysis.profitability + '%' }"></div>
                  </div>
                </div>
                
                <div class="analysis-item mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span>유동성 중시</span>
                    <span class="fw-bold">{{ result.analysis.liquidity }}%</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-info" :style="{ width: result.analysis.liquidity + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">추천 투자 상품</h5>
              </div>
              <div class="card-body">
                <div v-for="product in result.recommendedProducts" :key="product.id" class="recommended-product mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-1">{{ product.name }}</h6>
                      <small class="text-muted">{{ product.type }} · {{ product.riskLevel }}</small>
                    </div>
                    <div class="text-end">
                      <div class="fw-bold text-primary">{{ product.expectedReturn }}%</div>
                      <small class="text-muted">예상 수익률</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="row">
          <div class="col-12 text-center">
            <button @click="retakeTest" class="btn btn-outline-primary me-3">
              <i class="bi bi-arrow-clockwise me-2"></i>다시 검사하기
            </button>
            <button @click="downloadResult" class="btn btn-primary me-3">
              <i class="bi bi-download me-2"></i>결과 다운로드
            </button>
            <router-link to="/products" class="btn btn-success">
              <i class="bi bi-search me-2"></i>추천 상품 보기
            </router-link>
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
const result = ref(null)

const fetchWMTIResult = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.get('/api/user/wmti/result')
    result.value = response.data
  } catch (err) {
    if (err.response?.status === 404) {
      result.value = null
    } else {
      error.value = 'WMTI 결과를 불러오는데 실패했습니다.'
    }
    console.error('WMTI result fetch error:', err)
  } finally {
    loading.value = false
  }
}

const retakeTest = () => {
  window.location.href = '/wmti'
}

const downloadResult = async () => {
  try {
    const response = await axios.get('/api/user/wmti/result/download', {
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `WMTI_결과_${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert('결과 다운로드에 실패했습니다.')
    console.error('Download error:', err)
  }
}

onMounted(() => {
  fetchWMTIResult()
})
</script>

<style scoped>
.wmti-result {
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

.result-card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.result-type h1 {
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.stat-item {
  text-align: center;
}

.stat-item h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.analysis-item {
  padding: 0.75rem 0;
}

.recommended-product {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.empty-state i {
  font-size: 4rem;
}
</style>
