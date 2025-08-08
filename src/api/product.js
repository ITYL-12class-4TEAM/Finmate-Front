// product.js 파일 전체 코드
import api from './index';

/**
 * 상품 리스트 조회
 * @param {Object} params - 검색 파라미터
 * @returns {Promise<Object>} 상품 리스트 및 페이지 정보
 */
export const getProductsAPI = async (params = {}) => {
  try {
    // 백엔드 API 호출
    const response = await api.get('/api/products', { params });

    // 응답 로깅
    // console.log('API 원본 응답:', response.data.body.data);

    // 데이터 추출 및 반환
    return response.data.body.data;
  } catch (error) {
    console.error('상품 조회 API 오류:', error);
    throw error;
  }
};

/**
 * 상품 상세 정보 조회
 * @param {string|number} productId - 상품 ID
 * @returns {Promise<Object>} 상품 상세 정보
 */
export const getProductDetailAPI = async (productType, productId, params = {}) => {
  try {
    // API 호출
    const response = await api.get(`/api/products/${productType}/${productId}`, { params });

    // 응답 로깅
    // console.log('상품 상세 응답:', response.data.body.data);

    // 데이터 추출 및 반환
    return response.data.body.data;
  } catch (error) {
    console.error('상품 상세 조회 API 오류:', error);
    throw error;
  }
};

/**
 * 상품 카테고리 목록 조회
 * @returns {Promise<Array>} 카테고리 목록
 */
export const getProductsCategoriesAPI = async () => {
  try {
    const response = await api.get('/api/products/categories');

    return response.data.body.data.categories || [];
  } catch (error) {
    console.error('카테고리 조회 API 오류:', error);
    throw error;
  }
};

export const getProductsFilterOptionsAPI = async (category) => {
  try {
    // api 객체 사용 (axios 인스턴스)
    const response = await api.get('/api/products/filter-options', {
      params: { category },
    });

    return response.data.body.data;
  } catch (error) {
    console.error('필터 옵션 가져오기 실패:', error);

    // 오류 상세 정보 로깅 (다른 함수들과 일관성 유지)
    if (error.response) {
      console.error('API 응답 오류 상세:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }

    throw error;
  }
};

/**
 * 상품 비교 API
 * @param {Array<string|number>} productIds - 비교할 상품 ID 목록
 * @param {string} productType - 상품 유형 (deposit, pension 등)
 * @param {string} optionId - 옵션 ID (선택사항)
 * @returns {Promise<Object>} - 비교 결과
 */
export const compareProductsAPI = async (
  productIds,
  productType = 'deposit',
  saveTrm,
  intrRateType
) => {
  try {
    // URL 직접 구성 (파라미터 문제를 확실히 해결하기 위해)
    let url = '/api/products/compare?';

    // productIds를 개별 파라미터로 변환
    if (Array.isArray(productIds) && productIds.length > 0) {
      productIds.forEach((id) => {
        url += `productIds=${encodeURIComponent(id)}&`;
      });
    } else if (productIds) {
      url += `productIds=${encodeURIComponent(productIds)}&`;
    }

    // productType 추가
    url += `productType=${encodeURIComponent(productType)}`;

    // optionId 추가 (있는 경우)
    if (saveTrm) {
      url += `&optionId=${encodeURIComponent(saveTrm)}`;
    }

    if (intrRateType) {
      url += `&optionId=${encodeURIComponent(intrRateType)}`;
    }

    // API 호출
    const response = await api.get(url);

    // console.log('비교 API 응답:', response.data.body.data);

    return response.data.body.data;
  } catch (error) {
    console.error('상품 비교 API 오류:', error);

    // 오류 상세 정보 로깅
    if (error.response) {
      console.error('API 응답 오류 상세:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }

    throw error;
  }
};
