// product.js 파일 전체 코드
import api from './index';

/**
* 상품 리스트 조회
* @param {Object} params - 검색 파라미터
* @returns {Promise<Object>} 상품 리스트 및 페이지 정보
*/
export const getProductsAPI = async (params = {}) => {
 try {
   // 요청 정보 로깅
   console.log('API 요청 파라미터:', params);

   // 백엔드 API 호출
   const response = await api.get('/api/products', { params });

   // 응답 로깅
   console.log('API 원본 응답:', response);

   // 데이터 추출 및 반환
   if (response.data) {
     // API 응답 구조에 맞게 데이터 추출
     const data = response.data;

     // 응답 구조가 body.data 형태인 경우
     if (data.body && data.body.data) {
       return data.body.data;
     }

     // 응답 구조가 body 형태인 경우
     if (data.body) {
       return data.body;
     }

     // 응답이 data 자체인 경우
     if (data.data) {
       return data.data;
     }

     // 그 외의 경우 응답 전체 반환
     return data;
   }
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
export const getProductDetailAPI = async (productType, productId) => {
 try {
   // 요청 로깅
   console.log(`상품 상세 조회 요청: 유형=${productType}, ID=${productId}`);

   // API 호출
   const response = await api.get(`/api/products/${productType}/${productId}`);

   // 응답 로깅
   console.log('상품 상세 응답:', response);

   // 데이터 추출 및 반환
   if (response.data && response.data.body && response.data.body.data) {
     return response.data.body.data;
   } else {
     console.warn('예상치 못한 API 응답 구조:', response.data);
     return null;
   }
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

   if (response.data && response.data.body && response.data.body.data) {
     return response.data.body.data.categories || [];
   } else {
     console.warn('예상치 못한 API 응답 구조:', response.data);
     return [];
   }
 } catch (error) {
   console.error('카테고리 조회 API 오류:', error);
   throw error;
 }
};

// /**
// * 상품 비교
// * @param {Array<string|number>} productIds - 비교할 상품 ID 목록
// * @returns {Promise<Object>} 상품 비교 결과
// */
// export const getProductsCompareAPI = async (productIds = []) => {
//  try {
//    // 쿼리 파라미터 구성
//    const params = {
//      ids: Array.isArray(productIds) ? productIds.join(',') : productIds,
//    };

//    const response = await api.get('/api/products/compare', { params });

//    if (response.data && response.data.body && response.data.body.data) {
//      return response.data.body.data;
//    } else {
//      console.warn('예상치 못한 API 응답 구조:', response.data);
//      return { products: [] };
//    }
//  } catch (error) {
//    console.error('상품 비교 API 오류:', error);
//    throw error;
//  }
// };

// 필터 옵션 API 호출 함수
export const getProductsFilterOptionsAPI = async (category) => {
 try {
   const response = await fetch(`/api/products/filter-options?category=${category}`);
   if (!response.ok) {
     throw new Error(`API 요청 실패: ${response.status}`);
   }
   return await response.json();
 } catch (error) {
   console.error('필터 옵션 가져오기 실패:', error);
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
export const compareProductsAPI = async (productIds, productType = 'deposit', optionId = null) => {
  try {
    // URL 직접 구성 (파라미터 문제를 확실히 해결하기 위해)
    let url = '/api/products/compare?';
    
    // productIds를 개별 파라미터로 변환
    if (Array.isArray(productIds) && productIds.length > 0) {
      productIds.forEach(id => {
        url += `productIds=${encodeURIComponent(id)}&`;
      });
    } else if (productIds) {
      url += `productIds=${encodeURIComponent(productIds)}&`;
    }
    
    // productType 추가
    url += `productType=${encodeURIComponent(productType)}`;
    
    // optionId 추가 (있는 경우)
    if (optionId) {
      url += `&optionId=${encodeURIComponent(optionId)}`;
    }
    
    console.log('비교 API 요청 URL:', url);
    
    // API 호출
    const response = await api.get(url);
    
    console.log('비교 API 응답:', response);
    
    // 데이터 추출 및 반환
    if (response.data) {
      const data = response.data;

      // 응답 구조가 body.data 형태인 경우
      if (data.body && data.body.data) {
        return data.body.data;
      }

      // 응답 구조가 body 형태인 경우
      if (data.body) {
        return data.body;
      }

      // 응답이 data 자체인 경우
      if (data.data) {
        return data.data;
      }

      // 그 외의 경우 응답 전체 반환
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('상품 비교 API 오류:', error);
    
    // 오류 상세 정보 로깅
    if (error.response) {
      console.error('API 응답 오류 상세:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    throw error;
  }
};