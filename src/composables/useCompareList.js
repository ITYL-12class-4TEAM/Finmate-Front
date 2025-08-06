import { ref } from 'vue';

/**
 * 상품 비교 목록 관리를 위한 컴포저블
 */
export default function useCompareList() {
  // 로컬 스토리지 키
  const COMPARE_LIST_KEY = 'finmate_compare_list';

  // 비교함 목록을 로컬 스토리지에서 가져오기
  const getCompareListFromStorage = () => {
    try {
      const storedList = localStorage.getItem(COMPARE_LIST_KEY);
      return storedList ? JSON.parse(storedList) : [];
    } catch (error) {
      console.error('비교함 목록 로드 오류:', error);
      return [];
    }
  };

  // 비교함 목록을 로컬 스토리지에 저장
  const saveCompareListToStorage = (list) => {
    try {
      localStorage.setItem(COMPARE_LIST_KEY, JSON.stringify(list));
    } catch (error) {
      console.error('비교함 목록 저장 오류:', error);
    }
  };

  // 비교함 목록 상태
  const compareList = ref(getCompareListFromStorage());

  // 상품 ID 속성명 찾기 (다양한 API 응답 형식 대응)
  const getProductId = (product) => {
    // 가능한 ID 필드명 목록
    const possibleIdFields = ['product_id', 'productId', 'id'];

    // 존재하는 필드 찾기
    for (const field of possibleIdFields) {
      if (product[field] !== undefined) {
        return product[field];
      }
    }

    // 없으면 null 반환
    return null;
  };

  // 기간 속성명 찾기
  const getSaveTrm = (option) => {
    // 가능한 기간 필드명 목록
    const possibleTrmFields = ['save_trm', 'saveTrm', 'term'];

    // 존재하는 필드 찾기
    for (const field of possibleTrmFields) {
      if (option[field] !== undefined) {
        return option[field];
      }
    }

    // 없으면 null 반환
    return null;
  };

  // useCompareList.js 수정 (addToCompareList 함수)
  const addToCompareList = (product, option, productType) => {
    // 상품 ID와 옵션 정보 추출
    const productId = getProductId(product);
    const saveTrm = getSaveTrm(option);
    const optionId = option.option_id || option.optionId;
    const intrRateType = option.intr_rate_type || option.intrRateType || 'S';

    // 이미 비교함에 동일한 상품이 있는지 확인 (ID와 saveTrm으로 체크)
    const isDuplicate = compareList.value.some(
      (item) =>
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm) &&
        item.intrRateType === intrRateType
    );

    // 이미 존재하면 추가하지 않고 메시지 반환
    if (isDuplicate) {
      return { success: false, message: '이미 비교함에 추가된 상품입니다.' };
    }

    // 비교함에 추가할 상품 정보
    const compareItem = {
      productId: productId,
      productName:
        product.product_name ||
        product.productName ||
        product.finPrdtNm ||
        product.fin_prdt_nm ||
        '',
      korCoNm: product.kor_co_nm || product.korCoNm || '',
      saveTrm: saveTrm,
      intrRate: option.intr_rate || option.intrRate || 0,
      intrRate2: option.intr_rate2 || option.intrRate2 || 0,
      productType: productType,
      optionId: optionId,
      intrRateType: intrRateType, // 금리 유형 코드 저장
      // 추가 정보
      minDeposit: product.min_deposit || product.minDeposit || 0,
      addedAt: new Date().toISOString(),
    };

    // 비교 목록에 추가
    const newList = [...compareList.value, compareItem];
    compareList.value = newList;

    // 로컬 스토리지에 저장
    saveCompareListToStorage(newList);

    return { success: true, message: '상품이 비교함에 추가되었습니다.' };
  };

  // 비교함에서 제거
  const removeFromCompareList = (productId, saveTrm, intrRateType) => {
    const newList = compareList.value.filter((item) => {
      return !(
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm) &&
        item.intrRateType === intrRateType
      );
    });

    compareList.value = newList;
    saveCompareListToStorage(newList);

    return { success: true, message: '상품이 비교함에서 제거되었습니다.' };
  };

  // 비교함 비우기
  const clearCompareList = () => {
    compareList.value = [];
    saveCompareListToStorage([]);

    return { success: true, message: '비교함이 비워졌습니다.' };
  };

  // 상품이 비교함에 있는지 확인
  const isInCompareList = (productId, saveTrm, intrRateType) => {
    return compareList.value.some((item) => {
      const result =
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm) &&
        item.intrRateType === intrRateType;

      console.log('비교 중:', {
        검사대상: { productId, saveTrm },
        비교아이템: { productId: item.productId, saveTrm: item.saveTrm },
        일치여부: result,
      });

      return result;
    });
  };

  return {
    compareList,
    addToCompareList,
    removeFromCompareList,
    clearCompareList,
    isInCompareList,
    clearStorage: () => localStorage.removeItem(COMPARE_LIST_KEY),
  };
}
