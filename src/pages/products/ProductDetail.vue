<template>
  <div class="product-detail-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>상품 정보를 불러오는 중입니다...</p>

      <!-- 금융용어 툴팁 섹션 -->
      <div class="financial-terms-section">
        <h3 class="section-title">금융용어 사전</h3>
        <div class="terms-list">
          <div class="term-item" @click="showTermDetail('복리')">
            <div class="term-name">복리</div>
            <div class="term-preview">
              원금뿐만 아니라 이자에도 이자가 붙는 계산법으로...
            </div>
          </div>
          <div class="term-item" @click="showTermDetail('단리')">
            <div class="term-name">단리</div>
            <div class="term-preview">
              원금에 대해서만 이자가 발생하는 계산법으로...
            </div>
          </div>
          <div class="term-item" @click="showTermDetail('세금우대')">
            <div class="term-name">세금우대</div>
            <div class="term-preview">
              일반과세보다 낮은 세율이 적용되는 금융상품...
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <button class="back-btn" @click="goBack">목록으로 돌아가기</button>
    </div>

    <div v-else-if="product" class="product-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <BackButton title="목록으로"/>
        <h1 class="page-title">{{ getCategoryName() }} 상세 정보</h1>
      </div>
      <div>
        <div>
          <h3>금융회사명</h3>
          <p>{{ product.kor_co_nm || product.korCoNm }}</p>
        </div>
        <div>
          <h3>상품명</h3>
          <p>{{ product.fin_prdt_nm || product.finPrdtNm }}</p>
        </div>
        <div>
          <h3>최소 가입 금액</h3>
          <p>{{ formatCurrency(product.productDetail.min_deposit) }}</p>
        </div>
        <div>
          <h3>최대 가입 금액</h3>
          <p>{{ formatCurrency(product.productDetail.max_deposit) }}</p>
        </div>
        <div>
          <h3>기본금리</h3>
          <p>{{ formatRate(selectedOption?.intr_rate) }}</p>
        </div>
        <div>
          <h3>우대금리</h3>
          <p>{{ formatRate(selectedOption?.intr_rate2) }}</p>
        </div>
        <div>
          <h3>금리유형</h3>
          <p>{{ selectedOption?.intr_rate_type_nm }}</p>
        </div>
        <div>
          <h3>우대조건</h3>
          <p>백엔드에서 deposit_produt 테이블에서 preferential_conditions 가져와야됨 </p>
        </div>
        <div>
          <h3>가입 방법</h3>
          <p>join_way 가져와야됨 </p>
        </div>
        <div>
          <h3>가입 제한</h3>
          <p>join_deny 가져와야됨 </p>
        </div>
        <div>
          <h3>가입대상</h3>
          <p>join_member 가져와야됨 </p>
        </div>
        <div>
          <h3>기타 유의사항</h3>
          <p>etc_note 가져와야됨 </p>
        </div>
      </div>

      <!-- 이하 생략된 중첩 구조 -->
    </div>

    <!-- 금융용어 상세 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ selectedTerm.name }}</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>{{ selectedTerm.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProductDetailAPI } from '@/api/product';
import BackButton from '@/components/common/BackButton.vue'



export default {
  components:{
    BackButton
  },

  name: 'ProductDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 상태 관리
    const product = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const showModal = ref(false);
    const selectedTerm = ref({ name: '', description: '' });

    // 전역 상태 (localStorage 대체용)
    // 실제 구현에서는 Pinia/Vuex 또는 provide/inject를 사용
    const compareList = ref([]);

    // 상품 정보 로드
    const loadProductDetail = async () => {
      try {
        loading.value = true;
        error.value = null;

        const category = route.params.category; // 'deposit', 'pension' 등
        const productId = route.params.id;
        const saveTrm = route.query.saveTrm;

        console.log(
          `상품 상세 정보 로드: 카테고리=${category}, ID=${productId}, saveTrm=${saveTrm}`
        );

        // API에 saveTrm 파라미터 전달
        const response = await getProductDetailAPI(category, productId, {
          saveTrm,
        });
        console.log('API 응답 데이터:', response);

        if (response) {
          // API가 이미 필터링된 데이터를 제공하므로 직접 할당
          product.value = response;

          // 필요시 추가 데이터 가공 (예: is_digital_only 플래그 추가)
          product.value.is_digital_only =
            product.value.join_way === 'online' ||
            product.value.join_way === '인터넷';

          console.log('매핑된 상품 정보:', product.value);
        } else {
          error.value = '상품 정보를 찾을 수 없습니다.';
        }
      } catch (err) {
        console.error('상품 상세 정보 로드 오류:', err);
        error.value = '상품 정보를 불러오는 중 오류가 발생했습니다.';
      } finally {
        loading.value = false;
      }
    };

    // 우대 조건 파싱
    const parsedPreferentialConditions = computed(() => {
      if (!product.value || !product.value.preferential_conditions) {
        return [];
      }

      // 여러 줄로 구분된 경우
      const conditions = product.value.preferential_conditions.split(/\n|\r\n/);

      // 정리된 조건 목록
      const parsedConditions = [];

      for (const condition of conditions) {
        if (condition.trim() === '') continue;

        // 번호, 기호 등으로 시작하는 패턴 제거
        const cleanCondition = condition
          .replace(/^\d+[\.\)]\s*|\-\s*|\*\s*/, '')
          .trim();

        if (cleanCondition) {
          parsedConditions.push(cleanCondition);
        }
      }

      return parsedConditions;
    });

    // 상품 유형 체크 함수
    const isDepositProduct = () => {
      return route.params.category === 'deposit';
    };

    const isPensionProduct = () => {
      return route.params.category === 'pension';
    };

    // 카테고리 이름 가져오기
    const getCategoryName = () => {
      const category = route.params.category;

      switch (category) {
        case 'deposit':
          return '정기예금';
        case 'pension':
          return '연금저축';
        case 'saving':
          return '적금';
        default:
          return '금융상품';
      }
    };

    // 금리 유형 이름 가져오기
    const getInterestTypeName = () => {
      if (!product.value) return '';

      // 금리 유형 코드 확인
      const interestTypeCode = product.value.intr_rate_type;

      if (interestTypeCode === 'S') {
        return '단리';
      } else if (interestTypeCode === 'M') {
        return '복리';
      } else {
        return '기본금리';
      }
    };

    // 은행 로고 URL 가져오기
    const getBankLogo = () => {
      if (!product.value || !product.value.kor_co_nm) return null;

      // TODO: 실제 은행 로고 URL 매핑 추가
      const bankLogos = {
        국민은행: '/bank-logos/kb.png',
        신한은행: '/bank-logos/shinhan.png',
        우리은행: '/bank-logos/woori.png',
        하나은행: '/bank-logos/hana.png',
        농협은행: '/bank-logos/nh.png',
        기업은행: '/bank-logos/ibk.png',
      };

      return bankLogos[product.value.kor_co_nm] || null;
    };

    // 은행 이니셜 가져오기 (로고가 없을 경우)
    const getBankInitial = () => {
      if (!product.value || !product.value.kor_co_nm) return '';

      const bankName = product.value.kor_co_nm;
      // 첫 글자 반환
      return bankName.charAt(0);
    };

    // 금융용어 상세 보기
    const showTermDetail = (termName) => {
      // 금융용어 정보 (실제로는 API 호출 또는 데이터에서 가져와야 함)
      const termData = {
        복리: {
          name: '복리',
          description:
            '복리는 원금뿐만 아니라 이자에도 이자가 붙는 계산법입니다. 장기 투자 시 단리보다 더 많은 수익을 얻을 수 있습니다. 복리는 이자가 원금에 더해져 다음 기간에는 이 합계액에 대해 이자가 계산되는 방식으로, "이자의 이자"라고도 불립니다.',
        },
        단리: {
          name: '단리',
          description:
            '단리는 원금에 대해서만 이자가 발생하는 계산법입니다. 즉, 이자는 원금에만 적용되고 이전에 발생한 이자에는 적용되지 않습니다. 단리 계산은 복리 계산보다 단순하지만, 장기 투자 시 복리보다 수익이 적을 수 있습니다.',
        },
        세금우대: {
          name: '세금우대',
          description:
            '세금우대는 일반과세보다 낮은 세율이 적용되는 금융상품을 말합니다. 일반적으로 이자소득에 대해 15.4%(소득세 14%, 지방소득세 1.4%)의 세금이 부과되지만, 세금우대 상품은 이보다 낮은 9.5%(소득세 8.7%, 지방소득세 0.8%)의 세율이 적용됩니다. 주로 장기 저축을 장려하기 위한 정책으로 활용됩니다.',
        },
      };

      selectedTerm.value = termData[termName] || {
        name: termName,
        description: '해당 용어에 대한 설명이 준비되지 않았습니다.',
      };

      showModal.value = true;
    };

    // 비교함에 추가 (localStorage 대신 메모리 상태 사용)
    const addToCompare = () => {
      if (!product.value) return;

      // 이미 추가된 상품인지 확인
      const alreadyAdded = compareList.value.some(
        (item) => item.product_id === product.value.product_id
      );

      if (alreadyAdded) {
        alert('이미 비교함에 추가된 상품입니다.');
        return;
      }

      // 최대 4개까지만 추가 가능
      if (compareList.value.length >= 4) {
        alert('비교함에는 최대 4개까지 상품을 담을 수 있습니다.');
        return;
      }

      // 간소화된 상품 정보만 저장
      const simpleProduct = {
        product_id: product.value.product_id,
        product_name: product.value.product_name,
        kor_co_nm: product.value.kor_co_nm,
        intr_rate: product.value.intr_rate,
        intr_rate2: product.value.intr_rate2,
        save_trm: product.value.save_trm,
        category: route.params.category,
      };

      // 비교 목록에 추가 (반응형 상태 업데이트)
      compareList.value = [...compareList.value, simpleProduct];

      alert('비교함에 상품이 추가되었습니다.');
    };

    // 상품 가입하기
    const joinProduct = () => {
      if (!product.value) return;

      // 상품 가입 링크가 있으면 해당 링크로, 없으면 은행 홈페이지로
      const joinUrl = product.value.external_link || getBankWebsite();

      // 새 탭에서 열기
      window.open(joinUrl, '_blank');
    };

    // 은행 웹사이트 URL 가져오기
    const getBankWebsite = () => {
      if (!product.value || !product.value.kor_co_nm) return '#';

      const bankWebsites = {
        국민은행: 'https://www.kbstar.com',
        신한은행: 'https://www.shinhan.com',
        우리은행: 'https://www.wooribank.com',
        하나은행: 'https://www.kebhana.com',
        농협은행: 'https://banking.nonghyup.com',
        기업은행: 'https://www.ibk.co.kr',
      };

      return (
        bankWebsites[product.value.kor_co_nm] ||
        `https://www.google.com/search?q=${encodeURIComponent(
          product.value.kor_co_nm
        )}`
      );
    };

    // 목록으로 돌아가기
    const goBack = () => {
      router.back();
    };

    // 날짜 포맷팅 (YYYYMMDD → YYYY.MM.DD)
    const formatDate = (dateStr) => {
      if (!dateStr) return '';

      // 날짜 형식 확인
      if (typeof dateStr === 'string') {
        // YYYYMMDD 형식
        if (/^\d{8}$/.test(dateStr)) {
          return `${dateStr.substring(0, 4)}.${dateStr.substring(
            4,
            6
          )}.${dateStr.substring(6, 8)}`;
        }

        // YYYY-MM-DD 형식
        if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
          return dateStr.substring(0, 10).replace(/-/g, '.');
        }
      }

      // 날짜 객체인 경우
      if (dateStr instanceof Date) {
        const year = dateStr.getFullYear();
        const month = String(dateStr.getMonth() + 1).padStart(2, '0');
        const day = String(dateStr.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
      }

      return dateStr;
    };

    // 금액 포맷팅
    const formatCurrency = (value) => {
      if (value === null) return '회사가 정보 안 줌 ㅠ';
      return new Intl.NumberFormat('ko-KR').format(value) + '원';
    };

    // 금리 포맷팅
    const formatRate = (rate) => {
      if (rate === null || rate === undefined) return '정보 없음';
      return parseFloat(rate).toFixed(2) + '%';
    };

    // 선택된 옵션 계산
    const selectedOption = computed(() => {
      if (
        !product.value ||
        !product.value.productDetail
      ) {
        return null;
      }

      const options = product.value.productDetail.options;

      if(!options || !Array.isArray(options)){
        return null;
      }

      const saveTrm = route.query.saveTrm;

      // saveTrm과 일치하는 옵션 찾기
      return (
        options.find(
          (opt) => String(opt.save_trm || opt.saveTrm) === String(saveTrm)
        ) || options[0]
      );
    });

    // 컴포넌트 마운트 시 데이터 로드
    onMounted(() => {
      loadProductDetail();
    });

    return {
      product,
      loading,
      error,
      showModal,
      selectedTerm,
      selectedOption,
      compareList, // 상태 반환 추가
      parsedPreferentialConditions,
      isDepositProduct,
      isPensionProduct,
      getCategoryName,
      getInterestTypeName,
      getBankLogo,
      getBankInitial,
      showTermDetail,
      addToCompare,
      joinProduct,
      goBack,
      formatDate,
      formatCurrency,
      formatRate,
    };
  },
};
</script>

<style scoped>
.product-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 로딩 & 에러 상태 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  width: 50px;
  height: 50px;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  margin-right: 16px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f5f5f5;
}

.back-arrow {
  margin-right: 6px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: #333;
  flex: 1;
}

/* 상품 카드 스타일 */
.product-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
}

.card-header {
  display: flex;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.bank-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.bank-logo img {
  max-width: 100%;
  max-height: 100%;
}

.bank-initial {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #666;
}

.product-info {
  flex: 1;
}

.bank-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.product-name {
  font-size: 22px;
  margin: 0 0 12px 0;
  color: #333;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.tag.digital {
  background-color: #2196f3;
  color: white;
}

.tag.category {
  background-color: #4caf50;
  color: white;
}

.tag.interest-type {
  background-color: #f5f5f5;
  color: #666;
}

/* 금리 정보 섹션 */
.interest-section {
  padding: 24px;
  background-color: #f9f9f9;
}

.interest-rates {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.rate-item {
  text-align: center;
}

.rate-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.rate-value {
  font-size: 28px;
  font-weight: 500;
  color: #333;
}

.rate-value.highlight {
  color: #e91e63;
}

.rate-divider {
  width: 1px;
  height: 60px;
  background-color: #ddd;
}

.rate-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: white;
  border-radius: 6px;
  padding: 12px;
  font-size: 13px;
  color: #666;
}

.notice-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f0f0f0;
  font-style: italic;
  font-weight: bold;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

/* 상품 주요 정보 */
.key-features {
  padding: 24px;
}

.section-title {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: #333;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 50%;
  color: #4caf50;
  font-size: 16px;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
}

.feature-value {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

/* 우대 조건 섹션 */
.conditions-card {
  padding: 24px;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.condition-item {
  display: flex;
  gap: 12px;
}

.condition-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  flex-shrink: 0;
}

.condition-text {
  flex: 1;
  line-height: 1.5;
  font-size: 14px;
  color: #333;
}

.no-conditions {
  color: #888;
  font-style: italic;
  padding: 8px 0;
}

/* 상품 설명 섹션 */
.description-card {
  padding: 24px;
}

.product-description {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

/* 액션 섹션 */
.action-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0 32px;
}

.add-compare-btn,
.join-btn {
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-compare-btn {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.add-compare-btn:hover {
  background-color: #eee;
}

.join-btn {
  background-color: #4caf50;
  color: white;
  border: none;
}

.join-btn:hover {
  background-color: #3e9142;
}

/* 금융용어 섹션 */
.financial-terms-section {
  margin-top: 32px;
}

.terms-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.term-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.term-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.term-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.term-preview {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

/* 반응형 스타일 */
@media (max-width: 600px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .interest-rates {
    flex-direction: column;
    gap: 16px;
  }

  .rate-divider {
    width: 80%;
    height: 1px;
  }

  .action-section {
    flex-direction: column;
  }

  .card-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .bank-logo {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .terms-list {
    grid-template-columns: 1fr;
  }
}
</style>
