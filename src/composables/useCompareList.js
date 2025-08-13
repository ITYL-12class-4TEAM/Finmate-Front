import { ref } from 'vue';
import { useToast } from '@/composables/useToast';

// 상품군별 로컬스토리지 키 정의
const DEPOSIT_COMPARE_LIST_KEY = 'finmate_deposit_compare_list'; // 예금 비교함
const SAVINGS_COMPARE_LIST_KEY = 'finmate_savings_compare_list'; // 적금 비교함

/** 상품 비교함 관리 (예금/적금 상품군별 분리, 로컬스토리지+리액티브) */
export default function useCompareList() {
  const { showToast } = useToast();

  // 상품군별 비교함 리스트
  const depositCompareList = ref(getCompareListFromStorage(DEPOSIT_COMPARE_LIST_KEY));
  const savingsCompareList = ref(getCompareListFromStorage(SAVINGS_COMPARE_LIST_KEY));

  // 내부 util 함수
  function getCompareListFromStorage(storageKey) {
    try {
      const str = localStorage.getItem(storageKey);
      return str ? JSON.parse(str) : [];
    } catch {
      return [];
    }
  }

  function saveCompareListToStorage(list, storageKey) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // 상품/옵션 키 추출
  const getProductId = (product) =>
    product?.product_id ?? product?.productId ?? product?.id ?? null;

  const getSaveTrm = (option) => option?.save_trm ?? option?.saveTrm ?? option?.term ?? null;

  /**
   * 상품 타입 판별
   * rsrvType 존재 여부로 적금(savings)과 예금(deposit) 구분
   */
  const getProductType = (product, option) => {
    // options 배열이 있는 경우 확인
    if (product.options && product.options.length > 0) {
      const firstOption = product.options[0];
      if (firstOption.rsrv_type || firstOption.rsrvType) {
        return 'savings'; // 적립식 상품(적금)
      }
    }

    // 직접 상품에 rsrvType이 있는 경우
    if (product.rsrv_type || product.rsrvType) {
      return 'savings';
    }

    // option 객체에 rsrvType이 있는 경우
    if (option && (option.rsrv_type || option.rsrvType)) {
      return 'savings';
    }

    // rsrvType이 없으면 예금 상품으로 간주
    return 'deposit';
  };

  /**
   * 상품 매칭 비교 로직
   * 예금: productId, saveTrm, intrRateType이 일치해야 함
   * 적금: productId, saveTrm, intrRateType, rsrvType이 모두 일치해야 함
   */
  const isProductMatch = (item, productId, saveTrm, intrRateType, rsrvType, productType) => {
    // 기본 필드 비교 (문자열로 통일)
    const idMatch = String(item.productId) === String(productId);
    const trmMatch = String(item.saveTrm) === String(saveTrm);
    const typeMatch = item.intrRateType === intrRateType;

    // 상품 타입에 따른 처리
    if (productType === 'deposit') {
      // 예금 상품은 rsrvType 무시하고 기본 필드만 비교
      return idMatch && trmMatch && typeMatch;
    } else {
      // 적금 상품은 rsrvType까지 비교
      const itemRsrvType = item.rsrvType || 'F';
      const compareRsrvType = rsrvType || 'F';
      return idMatch && trmMatch && typeMatch && itemRsrvType === compareRsrvType;
    }
  };

  /**
   * 비교함에 상품 추가 (중복/최대 3개 체크)
   * @param {Object} product - 상품 정보
   * @param {Object} option - 옵션 정보
   * @param {String} [productType] - 직접 지정하는 상품 타입 ('deposit' 또는 'savings')
   */
  const addToCompareList = (product, option, providedProductType) => {
    const productId = getProductId(product);
    const saveTrm = getSaveTrm(option);
    const optionId = option?.option_id ?? option?.optionId ?? null;
    const intrRateType = option?.intr_rate_type ?? option?.intrRateType ?? 'S';

    // 상품 타입 결정 (제공된 타입이 있으면 사용, 없으면 추론)
    const productType = providedProductType || getProductType(product, option);

    // rsrvType 값 설정 (적금인 경우 사용)
    const rsrvType =
      option?.rsrv_type ?? option?.rsrvType ?? (productType === 'savings' ? 'F' : null);

    // rsrvTypeNm 값 설정
    const rsrvTypeNm =
      option?.rsrv_type_nm ??
      option?.rsrvTypeNm ??
      (rsrvType === 'S' ? '정액적립식' : rsrvType === 'F' ? '자유적립식' : null);

    // 현재 상품 타입에 맞는 비교함 선택
    const compareList = productType === 'deposit' ? depositCompareList : savingsCompareList;
    const storageKey =
      productType === 'deposit' ? DEPOSIT_COMPARE_LIST_KEY : SAVINGS_COMPARE_LIST_KEY;

    // 중복 체크
    const duplicate = compareList.value.some((item) =>
      isProductMatch(item, productId, saveTrm, intrRateType, rsrvType, productType)
    );

    if (duplicate) {
      showToast('이미 비교함에 추가된 상품입니다.', 'warning');
      return { success: false, silent: true };
    }

    // 최대 3개 제한
    if (compareList.value.length >= 3) {
      showToast(
        `${productType === 'deposit' ? '예금' : '적금'} 상품은 최대 3개까지 비교할 수 있습니다.`,
        'warning'
      );
      return { success: false, silent: true };
    }

    // 신규 아이템 객체
    const item = {
      productId,
      productName:
        product?.product_name ??
        product?.productName ??
        product?.finPrdtNm ??
        product?.fin_prdt_nm ??
        '',
      korCoNm: product?.kor_co_nm ?? product?.korCoNm ?? '',
      saveTrm,
      intrRate: option?.intr_rate ?? option?.intrRate ?? 0,
      intrRate2: option?.intr_rate2 ?? option?.intrRate2 ?? 0,
      productType,
      optionId,
      intrRateType,
      rsrvType,
      rsrvTypeNm,
      minDeposit: product?.min_deposit ?? product?.minDeposit ?? 0,
      addedAt: new Date().toISOString(),
    };

    // 상품군에 맞는 비교함에 저장
    compareList.value = [...compareList.value, item];
    saveCompareListToStorage(compareList.value, storageKey);

    showToast(
      `${productType === 'deposit' ? '예금' : '적금'} 상품이 비교함에 추가되었습니다.`,
      'success'
    );

    return { success: true, silent: true };
  };

  /**
   * 비교함에서 상품 제거
   */
  const removeFromCompareList = (productId, saveTrm, intrRateType, rsrvType, productType) => {
    // 상품 타입에 맞는 비교함 선택
    const compareList = productType === 'deposit' ? depositCompareList : savingsCompareList;
    const storageKey =
      productType === 'deposit' ? DEPOSIT_COMPARE_LIST_KEY : SAVINGS_COMPARE_LIST_KEY;

    // 상품 타입 기반 필터링
    compareList.value = compareList.value.filter(
      (item) => !isProductMatch(item, productId, saveTrm, intrRateType, rsrvType, productType)
    );

    saveCompareListToStorage(compareList.value, storageKey);
    showToast(
      `${productType === 'deposit' ? '예금' : '적금'} 상품이 비교함에서 제거되었습니다.`,
      'info'
    );
  };

  /**
   * 특정 상품군 비교함 비우기
   */
  const clearCompareList = (productType) => {
    if (productType === 'deposit') {
      depositCompareList.value = [];
      saveCompareListToStorage([], DEPOSIT_COMPARE_LIST_KEY);
      showToast('예금 비교함이 비워졌습니다.', 'info');
    } else if (productType === 'savings') {
      savingsCompareList.value = [];
      saveCompareListToStorage([], SAVINGS_COMPARE_LIST_KEY);
      showToast('적금 비교함이 비워졌습니다.', 'info');
    } else {
      // 모든 비교함 비우기
      depositCompareList.value = [];
      savingsCompareList.value = [];
      saveCompareListToStorage([], DEPOSIT_COMPARE_LIST_KEY);
      saveCompareListToStorage([], SAVINGS_COMPARE_LIST_KEY);
      showToast('모든 비교함이 비워졌습니다.', 'info');
    }

    return { success: true, silent: true };
  };

  /**
   * 비교함 포함 여부 체크
   */
  const isInCompareList = (productId, saveTrm, intrRateType, rsrvType, productType) => {
    // 상품 타입에 맞는 비교함 선택
    const compareList = productType === 'deposit' ? depositCompareList : savingsCompareList;

    return compareList.value.some((item) =>
      isProductMatch(item, productId, saveTrm, intrRateType, rsrvType, productType)
    );
  };

  /**
   * 로컬스토리지 강제 삭제 (특정 상품군 또는 모든 비교함)
   */
  const clearStorage = (productType) => {
    try {
      if (productType === 'deposit') {
        localStorage.removeItem(DEPOSIT_COMPARE_LIST_KEY);
        depositCompareList.value = [];
        showToast('예금 비교 데이터가 삭제되었습니다.', 'info');
      } else if (productType === 'savings') {
        localStorage.removeItem(SAVINGS_COMPARE_LIST_KEY);
        savingsCompareList.value = [];
        showToast('적금 비교 데이터가 삭제되었습니다.', 'info');
      } else {
        // 모든 비교함 삭제
        localStorage.removeItem(DEPOSIT_COMPARE_LIST_KEY);
        localStorage.removeItem(SAVINGS_COMPARE_LIST_KEY);
        depositCompareList.value = [];
        savingsCompareList.value = [];
        showToast('모든 비교 데이터가 삭제되었습니다.', 'info');
      }
    } catch (error) {
      console.error('로컬 스토리지 삭제 중 오류 발생:', error);
      showToast('데이터 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 외부 노출
  return {
    // 예금 비교함
    depositCompareList,
    // 적금 비교함
    savingsCompareList,
    // 상품 추가
    addToCompareList,
    // 상품 제거
    removeFromCompareList,
    // 비교함 비우기 (productType 인자로 'deposit', 'savings' 또는 생략하여 모두 비우기)
    clearCompareList,
    // 비교함 포함 여부 체크
    isInCompareList,
    // 로컬스토리지 삭제 (productType 인자로 'deposit', 'savings' 또는 생략하여 모두 삭제)
    clearStorage,
    // 상품 타입 판별
    getProductType,
    // 유틸 직접 접근 필요시
    getProductId,
    getSaveTrm,
  };
}
