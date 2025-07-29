<template>
  <div>
    <!-- 검색 카테고리명 -->
    <h2 class="product-title">정기예금</h2>
    <!-- 사용자에게 입력받을 값 -->
    <form @submit.prevent="searchProducts">
      <div class="form-group">
        <label>예치 금액</label>
        <input type="text" v-model="depositAmount" class="form-control" />
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
      <div class = "checkbox-group">
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
          <div v-for="product in depositProducts" :key="product.finPrdtCd" class="product-card">
            <div class="product-header">
              <div class="bank-name">{{ product.korCoNm }}</div>
              <div class="product-name">{{ product.finPrdtNm }}</div>
            </div>
            
            <div class="product-details">
              <div class="detail-row">
                <span class="detail-label">기본 금리</span>
                <span class="detail-value highlight">{{ formatRate(product.intrRate) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">우대 금리</span>
                <span class="detail-value">{{ formatRate(product.intrRate2) }}</span>
              </div>
              <div class="detail-row" v-if="product.saveTrm">
                <span class="detail-label">가입 기간</span>
                <span class="detail-value">{{ product.saveTrm }}개월</span>
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
import { onMounted, ref, computed} from 'vue';
import axios from 'axios';
import {
  getProductsAPI,
  getProductsCategoriesAPI,
  getProductsCompareAPI,
  getProductsFilterOptionsAPI,
} from '@/api/product';

// 폼 입력 데이터
const depositAmount = ref('100000');
const period = ref('24');  // 기본값 24개월
const interestType = ref('B');  // 기본값 전체
const joinWay = ref('all');  // 기본값 전체

// 상품 목록 상태
const depositProducts = ref([]);
const loading = ref(false);
const error = ref(null);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(1); // 초기값 하드코딩

// 페이지 수 업데이트 함수
const updateTotalPages = () => {
  totalPages.value = Math.ceil(totalCount.value / pageSize.value);
};

// 금리 포맷팅 함수 - 올바르게 정의
const formatRate = (rate) => {
  if (rate === null || rate === undefined) return '정보 없음';
  return parseFloat(rate).toFixed(2) + '%';
};

// 상품 검색 함수
const searchProducts = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 검색 파라미터 구성
    const params = {
      categoryId: 1,       // 예금 카테고리
      subcategoryId: 101,  // 정기예금 서브카테고리
      minAmount: depositAmount.value.replace(/,/g, ''),
      saveTrm: period.value,
      intrRateType: interestType.value === 'B' ? null : interestType.value,
      joinWay: joinWay.value === 'all' ? null : joinWay.value,
      page: currentPage.value,
      size: pageSize.value,
      sortBy: 'intrRate',
      sortDirection: 'DESC'
    };

    console.log('검색 파라미터:', params);
    
    // 수정된 API 호출
    const data = await getProductsAPI(params);
    console.log('API 응답 데이터:', data);
    
    if (data) {
      depositProducts.value = data.products || [];
      totalCount.value = data.totalCount || 0;
      updateTotalPages();
    } else {
      depositProducts.value = [];
      totalCount.value = 0;
      totalPages.value = 1;
    }
  } catch (err) {
    console.error('상품 검색 실패:', err);
    error.value = '상품을 검색하는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

// 폼 초기화 함수
const resetForm = () => {
  depositAmount.value = '100000';
  period.value = '24';
  interestType.value = 'B';
  joinWay.value = 'all';
};

// 상품 목록 불러오기
const fetchProducts = async () => {
  console.log('fetchProducts 시작');
  try {
    const data = await getProductsAPI();
    console.log('상품 목록 불러오기 성공');
    console.log(data);
  } catch (e) {
    console.error('상품 목록 불러오기 실패:', e);
  }
};

// 상품 카테고리 목록 불러오기
const fetchProductsCategories = async () => {
  try {
    const data = await getProductsCategoriesAPI();
    console.log('상품 카테고리 목록 불러오기 성공');
    console.log(data);
  } catch (e) {
    console.error('상품 카테고리 목록 불러오기 실패:', e);
  }
};

// 상품 비교하기
const fetchProductsCompare = async () => {
  try {
    const data = await getProductsCompareAPI();
    console.log('상품 비교 성공');
    console.log(data);
  } catch (e) {
    console.error('상품 비교 실패:', e);
  }
};

// 카테고리별 필터 불러오기
const fetchProductsFilterOptions = async () => {
  try {
    const data = await getProductsFilterOptionsAPI();
    console.log('카테고리 필터 불러오기 성공');
    console.log(data);
  } catch (e) {
    console.error('카테고리별 필터 불러오기 실패:', e);
  }
};

onMounted(() => {
  // console.log('fetchProducts 호출 전');
  fetchProducts();
  // console.log('fetchProducts 호출 완료');
  fetchProductsCategories();
  fetchProductsCompare();
  fetchProductsFilterOptions();
  searchProducts();
});


</script>

<style>
.product-title{
  display: flex;
  flex-direction: center;
  align-items: center;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.form-group label {
  width: 80px;
  font-weight: 500;
}

.radio-group {
  display: flex;
  gap: 10px;
}

.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  width: auto;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.search-btn {
  background-color: #5f6caf;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}

.reset-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
}
</style>
