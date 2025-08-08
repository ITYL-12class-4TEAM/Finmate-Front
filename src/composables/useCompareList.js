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

    // 중복 체크
    const duplicate = compareList.value.some(
      (item) =>
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm) &&
        item.intrRateType === intrRateType
    );
    if (duplicate) {
      showToast('이미 비교함에 추가된 상품입니다.', 'warning');
      return { success: false, silent: true }; // alert 표시하지 않도록 silent 플래그 추가
    }

    // 최대 3개 제한
    if (compareList.value.length >= 3) {
      showToast('상품은 최대 3개까지 비교할 수 있습니다', 'warning');
      return { success: false, silent: true }; // alert 표시하지 않도록 silent 플래그 추가
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
      minDeposit: product?.min_deposit ?? product?.minDeposit ?? 0,
      addedAt: new Date().toISOString(),
    };

    compareList.value = [...compareList.value, item];
    saveCompareListToStorage(compareList.value);
    showToast('상품이 비교함에 추가되었습니다.', 'success');
    return { success: true, silent: true }; // alert 표시하지 않도록 silent 플래그 추가
  };

  /** 비교함에서 상품 제거 */
  const removeFromCompareList = (productId, saveTrm, intrRateType) => {
    compareList.value = compareList.value.filter(
      (item) =>
        String(item.productId) !== String(productId) ||
        String(item.saveTrm) !== String(saveTrm) ||
        item.intrRateType !== intrRateType
    );
    saveCompareListToStorage(compareList.value);
    showToast('상품이 비교함에서 제거되었습니다.', 'warning');
    return { success: true, silent: true }; // alert 표시하지 않도록 silent 플래그 추가
  };

  /** 비교함 전체 비우기 */
  const clearCompareList = () => {
    compareList.value = [];
    saveCompareListToStorage([]);
    showToast('비교함이 비워졌습니다.', 'info');
    return { success: true, silent: true }; // alert 표시하지 않도록 silent 플래그 추가
  };

  /** 비교함 포함 여부 체크 */
  const isInCompareList = (productId, saveTrm, intrRateType) =>
    compareList.value.some(
      (item) =>
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm) &&
        item.intrRateType === intrRateType
    );

  /** 로컬스토리지 강제 삭제 */
  const clearStorage = () => {
    localStorage.removeItem(COMPARE_LIST_KEY);
    showToast('저장된 비교 데이터가 삭제되었습니다.', 'info');
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
