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

  /** 비교함에 상품 추가 (중복/최대 3개 체크) */
  const addToCompareList = (product, option, productType) => {
    const productId = getProductId(product);
    const saveTrm = getSaveTrm(option);
    const optionId = option?.option_id ?? option?.optionId ?? null;
    const intrRateType = option?.intr_rate_type ?? option?.intrRateType ?? 'S';
    const rsrvType = option?.rsrv_type ?? option?.rsrvType ?? null;

    console.log('비교함 추가 시도:', {
      productId,
      saveTrm,
      intrRateType,
      rsrvType,
      productName: product?.product_name || product?.productName,
    });

    console.log('현재 비교함:', compareList.value);

    // 중복 체크 (정확한 비교를 위해 문자열로 변환)
    const duplicate = compareList.value.some((item) => {
      const idMatch = String(item.productId) === String(productId);
      const trmMatch = String(item.saveTrm) === String(saveTrm);
      const typeMatch = item.intrRateType === intrRateType;
      // rsrvType이 null인 경우 비교 방식 조정
      const rsrvMatch =
        (!rsrvType && !item.rsrvType) || (rsrvType && item.rsrvType && item.rsrvType === rsrvType);

      console.log('중복 체크:', {
        item: `${item.productName} (${item.saveTrm}개월)`,
        idMatch,
        trmMatch,
        typeMatch,
        rsrvMatch,
        결과: idMatch && trmMatch && typeMatch && rsrvMatch,
      });

      return idMatch && trmMatch && typeMatch && rsrvMatch;
    });

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
      productType,
      optionId,
      intrRateType,
      rsrvType,
      rsrvTypeNm: option?.rsrv_type_nm ?? option?.rsrvTypeNm ?? '',
      minDeposit: product?.min_deposit ?? product?.minDeposit ?? 0,
      addedAt: new Date().toISOString(),
    };

    console.log('추가할 아이템:', item);

    compareList.value = [...compareList.value, item];
    saveCompareListToStorage(compareList.value);
    showToast('상품이 비교함에 추가되었습니다.', 'success');
    return { success: true, silent: true };
  };

  // removeFromCompareList 함수 수정
  const removeFromCompareList = (productId, saveTrm, intrRateType, rsrvType) => {
    console.log('제거 시도:', { productId, saveTrm, intrRateType, rsrvType });

    // 필터링 조건 명확하게 수정
    compareList.value = compareList.value.filter((item) => {
      // 문자열 변환하여 비교 (다른 타입이어도 문제 없도록)
      const idMatch = String(item.productId) === String(productId);
      const trmMatch = String(item.saveTrm) === String(saveTrm);
      const typeMatch = item.intrRateType === intrRateType;

      // rsrvType 비교 로직 개선
      let rsrvMatch = false;
      if (rsrvType === undefined || rsrvType === null) {
        // rsrvType이 없으면 item의 rsrvType도 없어야 일치
        rsrvMatch = item.rsrvType === null || item.rsrvType === undefined;
      } else {
        // rsrvType이 있으면 정확히 비교
        rsrvMatch = item.rsrvType === rsrvType;
      }

      // 조건이 모두 일치하면 제거
      return !(idMatch && trmMatch && typeMatch && rsrvMatch);
    });

    saveCompareListToStorage(compareList.value);
  };

  /** 비교함 전체 비우기 */
  const clearCompareList = () => {
    compareList.value = [];
    saveCompareListToStorage([]);
    showToast('비교함이 비워졌습니다.', 'info');
    return { success: true, silent: true }; // alert 표시하지 않도록 silent 플래그 추가
  };

  /** 비교함 포함 여부 체크 */
  const isInCompareList = (productId, saveTrm, intrRateType, rsrvType) =>
    compareList.value.some((item) => {
      // 모든 기본 필드는 문자열로 변환하여 비교 (타입 불일치 방지)
      const idMatch = String(item.productId) === String(productId);
      const trmMatch = String(item.saveTrm) === String(saveTrm);
      const typeMatch = item.intrRateType === intrRateType;

      // rsrvType 비교 로직 개선
      let rsrvMatch = false;

      // 케이스 1: 둘 다 undefined/null인 경우 (일치)
      if (
        (rsrvType === undefined || rsrvType === null) &&
        (item.rsrvType === undefined || item.rsrvType === null)
      ) {
        rsrvMatch = true;
      }
      // 케이스 2: 하나만 undefined/null인 경우 (불일치)
      else if (
        rsrvType === undefined ||
        rsrvType === null ||
        item.rsrvType === undefined ||
        item.rsrvType === null
      ) {
        rsrvMatch = false;
      }
      // 케이스 3: 둘 다 값이 있는 경우, 직접 비교
      else {
        rsrvMatch = String(item.rsrvType) === String(rsrvType);
      }

      return idMatch && trmMatch && typeMatch && rsrvMatch;
    });

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
