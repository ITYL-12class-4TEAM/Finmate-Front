import { ref } from 'vue';
import { useToast } from '@/composables/useToast';

const COMPARE_LIST_KEY = 'finmate_compare_list';

/** 상품 비교함 관리 (로컬스토리지+리액티브) */
export default function useCompareList() {
  const { showToast } = useToast();

  // 내부 util
  const getCompareListFromStorage = () => {
    try {
      const str = localStorage.getItem(COMPARE_LIST_KEY);
      return str ? JSON.parse(str) : [];
    } catch {
      return [];
    }
  };
  const saveCompareListToStorage = (list) => {
    try {
      localStorage.setItem(COMPARE_LIST_KEY, JSON.stringify(list));
    } catch {}
  };

  const compareList = ref(getCompareListFromStorage());

  // 상품/옵션 키 추출
  const getProductId = (product) =>
    product?.product_id ?? product?.productId ?? product?.id ?? null;
  const getSaveTrm = (option) => option?.save_trm ?? option?.saveTrm ?? option?.term ?? null;

  /**
   * 상품 타입에 따라 비교 키가 일치하는지 확인
   * 예금: productId, saveTrm, intrRateType이 일치해야 함
   * 적금: productId, saveTrm, intrRateType, rsrvType이 모두 일치해야 함
   */
  const isProductMatch = (item, productId, saveTrm, intrRateType, rsrvType, productType) => {
    // 기본 필드 비교 (문자열로 통일)
    const idMatch = String(item.productId) === String(productId);
    const trmMatch = String(item.saveTrm) === String(saveTrm);
    const typeMatch = item.intrRateType === intrRateType;

    // 상품 타입 결정 (rsrvType 존재 여부로 추론)
    const itemType = item.productType || (item.rsrvType ? 'savings' : 'deposit');
    const currentType = productType || (rsrvType ? 'savings' : 'deposit');

    // 타입별 처리
    if (currentType === 'deposit' && itemType === 'deposit') {
      // 예금 상품은 rsrvType 무시하고 기본 필드만 비교
      return idMatch && trmMatch && typeMatch;
    } else if (currentType === 'savings' && itemType === 'savings') {
      // 적금 상품은 rsrvType까지 비교
      const itemRsrvType = item.rsrvType || 'F';
      const compareRsrvType = rsrvType || 'F';
      return idMatch && trmMatch && typeMatch && itemRsrvType === compareRsrvType;
    } else {
      // 상품 타입이 다르면 일치하지 않음
      return false;
    }
  };
  // 상품 타입 추론 함수 추가
  const inferProductType = (product, option) => {
    // options 배열이 있는 경우 확인
    if (product.options && product.options.length > 0) {
      const firstOption = product.options[0];
      if (firstOption.rsrv_type || firstOption.rsrvType) {
        return 'savings'; // 적립식 상품(적금)
      }
    }

    // 직접 상품에 rsrvType이 있는 경우
    if (product.rsrv_type || product.rsrvType) {
      return 'savings'; // 적립식 상품(적금)
    }

    // option 객체에 rsrvType이 있는 경우
    if (option && (option.rsrv_type || option.rsrvType)) {
      return 'savings'; // 적립식 상품(적금)
    }

    // rsrvType이 없으면 예금 상품으로 간주
    return 'deposit';
  };

  /** 비교함에 상품 추가 (중복/최대 3개 체크) */
  const addToCompareList = (product, option, providedProductType) => {
    const productId = getProductId(product);
    const saveTrm = getSaveTrm(option);
    const optionId = option?.option_id ?? option?.optionId ?? null;
    const intrRateType = option?.intr_rate_type ?? option?.intrRateType ?? 'S';

    // 상품 타입 추론 (제공된 타입이 있으면 사용, 없으면 추론)
    const productType = providedProductType || inferProductType(product, option);

    // rsrvType 값 설정 (상품 타입에 관계없이 값이 있으면 유지)
    const rsrvType =
      option?.rsrv_type ?? option?.rsrvType ?? (productType === 'savings' ? 'F' : null);

    // rsrvTypeNm 값 설정
    const rsrvTypeNm =
      option?.rsrv_type_nm ??
      option?.rsrvTypeNm ??
      (rsrvType === 'S' ? '정액적립식' : rsrvType === 'F' ? '자유적립식' : null);

    // 중복 체크 (추론된 상품 타입 사용)
    const duplicate = compareList.value.some((item) =>
      isProductMatch(item, productId, saveTrm, intrRateType, rsrvType, productType)
    );

    if (duplicate) {
      showToast('이미 비교함에 추가된 상품입니다.', 'warning');
      return { success: false, silent: true };
    }

    // 최대 3개 제한
    if (compareList.value.length >= 3) {
      showToast('상품은 최대 3개까지 비교할 수 있습니다.', 'warning');
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
      productType, // 추론된 상품 타입 저장
      optionId,
      intrRateType,
      rsrvType, // rsrvType 값 사용
      rsrvTypeNm, // rsrvTypeNm 값 사용
      minDeposit: product?.min_deposit ?? product?.minDeposit ?? 0,
      addedAt: new Date().toISOString(),
    };

    compareList.value = [...compareList.value, item];
    saveCompareListToStorage(compareList.value);
    showToast('상품이 비교함에 추가되었습니다.', 'success');
    return { success: true, silent: true };
  };

  // 비교함에서 상품 제거
  const removeFromCompareList = (
    productId,
    saveTrm,
    intrRateType,
    rsrvType,
    providedProductType
  ) => {
    // rsrvType 존재 여부로 상품 타입 추론
    const productType = providedProductType || (rsrvType ? 'savings' : 'deposit');

    // 상품 타입 기반 필터링
    compareList.value = compareList.value.filter(
      (item) => !isProductMatch(item, productId, saveTrm, intrRateType, rsrvType, productType)
    );
    showToast('상품이 비교함에서 제거되었습니다.', 'info');
    saveCompareListToStorage(compareList.value);
  };

  /** 비교함 전체 비우기 */
  const clearCompareList = () => {
    compareList.value = [];
    saveCompareListToStorage([]);
    showToast('비교함이 비워졌습니다.', 'info');
    return { success: true, silent: true };
  };

  /** 비교함 포함 여부 체크 */
  const isInCompareList = (productId, saveTrm, intrRateType, rsrvType, providedProductType) => {
    // rsrvType 존재 여부로 상품 타입 추론
    const productType = providedProductType || (rsrvType ? 'savings' : 'deposit');

    return compareList.value.some((item) =>
      isProductMatch(item, productId, saveTrm, intrRateType, rsrvType, productType)
    );
  };

  /** 로컬스토리지 강제 삭제 */
  const clearStorage = () => {
    try {
      localStorage.removeItem(COMPARE_LIST_KEY);
      compareList.value = []; // 메모리에서도 즉시 제거
      showToast('저장된 비교 데이터가 삭제되었습니다.', 'info');
    } catch (error) {
      console.error('로컬 스토리지 삭제 중 오류 발생:', error);
      showToast('데이터 삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  // 외부 노출
  return {
    compareList,
    addToCompareList,
    removeFromCompareList,
    clearCompareList,
    isInCompareList,
    clearStorage,
    // 유틸 직접 접근 필요시
    getProductId,
    getSaveTrm,
  };
}
