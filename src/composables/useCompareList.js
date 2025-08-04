import { ref } from "vue";

/**
 * 상품 비교 목록 관리를 위한 컴포저블
 */
export default function useCompareList() {
  // 로컬 스토리지 키
  const COMPARE_LIST_KEY = "finmate_compare_list";

  // 비교함 목록을 로컬 스토리지에서 가져오기
  const getCompareListFromStorage = () => {
    try {
      const storedList = localStorage.getItem(COMPARE_LIST_KEY);
      return storedList ? JSON.parse(storedList) : [];
    } catch (error) {
      console.error("비교함 목록 로드 오류:", error);
      return [];
    }
  };

  // 비교함 목록을 로컬 스토리지에 저장
  const saveCompareListToStorage = (list) => {
    try {
      localStorage.setItem(COMPARE_LIST_KEY, JSON.stringify(list));
    } catch (error) {
      console.error("비교함 목록 저장 오류:", error);
    }
  };

  // 비교함 목록 상태
  const compareList = ref(getCompareListFromStorage());

  // 상품 ID 속성명 찾기 (다양한 API 응답 형식 대응)
  const getProductId = (product) => {
    // 가능한 ID 필드명 목록
    const possibleIdFields = ["product_id", "productId", "id"];

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
    const possibleTrmFields = ["save_trm", "saveTrm", "term"];

    // 존재하는 필드 찾기
    for (const field of possibleTrmFields) {
      if (option[field] !== undefined) {
        return option[field];
      }
    }

    // 없으면 null 반환
    return null;
  };

  // 비교함에 상품 추가
  const addToCompareList = (product, option, productType) => {
    // 제품 ID와 기간 가져오기
    const productId = getProductId(product);
    const saveTrm = getSaveTrm(option);

    console.log("추가하려는 상품 정보:", {
      productId,
      saveTrm,
      product,
      option,
      productType,
    });

    if (!productId) {
      return { success: false, message: "상품 ID를 찾을 수 없습니다." };
    }

    // 이미 추가된 상품인지 확인
    const isDuplicate = compareList.value.some((item) => {
      return (
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm)
      );
    });

    if (isDuplicate) {
      return { success: false, message: "이미 비교함에 추가된 상품입니다." };
    }

    // 최대 4개까지만 추가 가능
    if (compareList.value.length >= 4) {
      return {
        success: false,
        message: "비교함에는 최대 4개까지 상품을 담을 수 있습니다.",
      };
    }

    // 비교함에 추가할 상품 정보
    const compareItem = {
      productId: productId,
      productName: product.product_name || product.productName || "",
      korCoNm: product.kor_co_nm || product.korCoNm || "",
      saveTrm: saveTrm,
      intrRate: option.intr_rate || option.intrRate || 0,
      intrRate2: option.intr_rate2 || option.intrRate2 || 0,
      productType: productType,
      optionId: option.option_id || option.optionId || null,
      addedAt: new Date().toISOString(),
    };

    // 비교 목록에 추가
    const newList = [...compareList.value, compareItem];
    compareList.value = newList;

    // 로컬 스토리지에 저장
    saveCompareListToStorage(newList);

    return { success: true, message: "상품이 비교함에 추가되었습니다." };
  };

  // 비교함에서 제거
  const removeFromCompareList = (productId, saveTrm) => {
    const newList = compareList.value.filter((item) => {
      return !(
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm)
      );
    });

    compareList.value = newList;
    saveCompareListToStorage(newList);

    return { success: true, message: "상품이 비교함에서 제거되었습니다." };
  };

  // 비교함 비우기
  const clearCompareList = () => {
    compareList.value = [];
    saveCompareListToStorage([]);

    return { success: true, message: "비교함이 비워졌습니다." };
  };

  // 상품이 비교함에 있는지 확인
  const isInCompareList = (productId, saveTrm) => {
    return compareList.value.some((item) => {
      const result =
        String(item.productId) === String(productId) &&
        String(item.saveTrm) === String(saveTrm);

      console.log("비교 중:", {
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
