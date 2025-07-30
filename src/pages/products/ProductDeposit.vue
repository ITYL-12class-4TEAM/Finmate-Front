<template>
  <div>
    <!-- 검색 카테고리명 -->
    <h2 class="product-title">정기예금</h2>
    <!-- 사용자에게 입력받을 값 -->
    <form @submit.prevent="searchProducts">
      <div class="form-group">
        <label>예치 금액</label>
        <input type="text" v-model="depositAmount" class="form-control" @input="formatAmount" />
        <span>원</span>
      </div>

      <div class="form-group">
        <label>기간(개월)</label>
        <div class="radio-group">
          <label><input type="radio" v-model="period" value="1" /> 1 </label>
          <label><input type="radio" v-model="period" value="3" /> 3 </label>
          <label><input type="radio" v-model="period" value="6" /> 6 </label>
          <label><input type="radio" v-model="period" value="12" /> 12 </label>
          <label><input type="radio" v-model="period" value="24" /> 24 </label>
          <label><input type="radio" v-model="period" value="36" /> 36 </label>
        </div>
      </div>

      <div class="form-group">
        <label>금리 유형</label>
        <div class="radio-group">
          <label
            ><input type="radio" v-model="interestType" value="B" /> 전체</label
          >
          <label
            ><input type="radio" v-model="interestType" value="S" /> 단리</label
          >
          <label
            ><input type="radio" v-model="interestType" value="M" /> 복리</label
          >
        </div>
      </div>

      <div class="form-group">
        <label>가입 방식</label>
        <div class="radio-group">
          <label
            ><input type="radio" v-model="joinWay" value="all" /> 전체</label
          >
          <label
            ><input type="radio" v-model="joinWay" value="online" />
            온라인</label
          >
          <label
            ><input type="radio" v-model="joinWay" value="offline" />
            오프라인</label
          >
        </div>
      </div>

      <div class="button-group">
        <button type="submit" class="search-btn">검색</button>
        <button type="button" @click="resetForm" class="reset-btn">
          <i class="fas fa-sync"></i>
        </button>
      </div>
      <div class="checkbox-group">
        <!-- 은행명이 엄청 많은데 다 넣을지 말지 결정해야됨 -->
      </div>
    </form>

    <!-- 검색 결과 영역 -->
    <div class="search-results">
      <div v-if="loading" class="loading">로딩 중...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else>
        <div class="results-count">검색 결과: {{ totalCount }}개</div>
        
        <!-- 상품 목록 -->
        <div class="product-list">
          <div v-for="product in depositProducts" :key="product.product_id || product.finPrdtCd" class="product-card">
            <div class="product-header">
              <div class="bank-name">{{ product.kor_co_nm || product.korCoNm }}</div>
              <div class="product-name">{{ product.product_name || product.finPrdtNm }}</div>
            </div>
            
            <div class="product-details">
              <div class="detail-row">
                <span class="detail-label">기본 금리</span>
                <span class="detail-value highlight">{{ formatRate(product.intr_rate || product.intrRate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">우대 금리</span>
                <span class="detail-value">{{ formatRate(product.intr_rate2 || product.intrRate2) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">가입 기간</span>
                <span class="detail-value">{{ product.save_trm || product.saveTrm }}개월</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 검색 결과가 없을 경우 -->
        <div v-if="depositProducts.length === 0" class="no-results">
          검색 조건에 맞는 상품이 없습니다.
        </div>
        
        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            v-for="page in totalPages" 
            :key="page" 
            @click="goToPage(page)" 
            :class="{ active: currentPage === page }"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { 
  getProductsAPI,
  getProductsCategoriesAPI,
  getProductsCompareAPI,
  getProductsFilterOptionsAPI,
} from '@/api/product';

// 폼 입력 데이터
const depositAmount = ref('100000');
const period = ref('6');  // 기본값 6개월 (이미지 기준)
const interestType = ref('B');  // 기본값 전체
const joinWay = ref('all');  // 기본값 전체

// 상품 목록 상태
const depositProducts = ref([]);
const loading = ref(false);
const error = ref(null);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

// 금액 포맷팅 함수
const formatAmount = () => {
  // 숫자만 추출
  const numericValue = depositAmount.value.replace(/[^\d]/g, '');
  
  // 숫자 포맷팅 (천 단위 콤마)
  if (numericValue) {
    depositAmount.value = new Intl.NumberFormat('ko-KR').format(numericValue);
  } else {
    depositAmount.value = '';
  }
};

// 금리 포맷팅 함수
const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

// 페이지 이동 함수
const goToPage = (page) => {
  currentPage.value = page;
  searchProducts();
};

// 상품 검색 함수
const searchProducts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 검색 파라미터 구성 (백엔드 API에서 기대하는 형식으로 변경)
    const params = {
      category: 'deposit',
      categoryId: 1,       // 예금 카테고리
      subcategoryId: 101,  // 정기예금 서브카테고리
      minAmount: depositAmount.value.replace(/,/g, ''),
      saveTrm: period.value,
      page: currentPage.value,
      size: pageSize.value,
      sortBy: 'intrRate',
      sortDirection: 'desc' // 무조건 소문자!!!!!
    };
    
    // 금리 유형 필터 추가
    if (interestType.value !== 'B') {
      params.intrRateType = interestType.value;
    }
    
    // 가입 방식 필터 추가
    if (joinWay.value !== 'all') {
      params.joinWay = joinWay.value;
    }

    console.log('검색 파라미터:', params);
    
    // API 호출 시 콘솔에 응답 로깅
    const response = await getProductsAPI(params);
    console.log('API 응답 (원본):', response);
    
    // 응답 구조 확인 및 데이터 추출
    if (response && response.body && response.body.data) {
      // API 응답 구조를 따라 올바른 경로에서 데이터 추출
      const data = response.body.data;
      depositProducts.value = data.products || [];
      totalCount.value = data.totalCount || 0;
    } else if (response && response.products) {
      // 이미 추출된 데이터 형태로 온 경우
      depositProducts.value = response.products || [];
      totalCount.value = response.totalCount || 0;
    } else {
      console.warn('예상치 못한 API 응답 구조:', response);
      depositProducts.value = [];
      totalCount.value = 0;
    }
  } catch (err) {
    console.error('상품 검색 실패:', err);
    error.value = '상품을 검색하는 중 오류가 발생했습니다. ' + (err.message || '');
    depositProducts.value = [];
    totalCount.value = 0;
  } finally {
    loading.value = false;
  }
};

// 폼 초기화 함수
const resetForm = () => {
  depositAmount.value = '100000';
  period.value = '6';
  interestType.value = 'B';
  joinWay.value = 'all';
  currentPage.value = 1;
  searchProducts(); // 초기화 후 검색 실행
};

// 초기 데이터 로딩
onMounted(async () => {
  try {
    // 필터 옵션 먼저 로드
    const filterOptions = await getProductsFilterOptionsAPI('deposit');
    console.log('필터 옵션:', filterOptions);
    
    // 필터 옵션이 있으면 초기값 설정
    if (filterOptions && filterOptions.depositAmountOptions) {
      depositAmount.value = String(filterOptions.depositAmountOptions.defaultValue || '100000');
      formatAmount(); // 금액 포맷팅 적용
    }
    
    // 초기 검색 실행
    searchProducts();
  } catch (err) {
    console.error('초기 데이터 로딩 실패:', err);
    error.value = '데이터를 불러오는 중 오류가 발생했습니다.';
  }
});
</script>

<style>
.product-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.form-group label {
  width: 80px;
  font-weight: 500;
  color: #666;
}

.form-control {
  flex: 1;
  max-width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: right;
}

.form-group span {
  margin-left: 8px;
  color: #666;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  width: auto;
  font-weight: normal;
}

.radio-group input[type="radio"] {
  margin-right: 4px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 30px;
}

.search-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-btn:hover {
  background-color: #3e9142;
}

.reset-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn:hover {
  background-color: #e8e8e8;
}

.search-results {
  margin-top: 20px;
}

.loading, .error, .no-results {
  padding: 20px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error {
  color: #e53935;
  background-color: #ffebee;
}

.results-count {
  font-size: 16px;
  margin-bottom: 16px;
  color: #666;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-header {
  margin-bottom: 12px;
}

.bank-name {
  font-size: 13px;
  color: #666;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-top: 4px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 13px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
}

.highlight {
  color: #E91E63;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.pagination button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button.active {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}
</style>