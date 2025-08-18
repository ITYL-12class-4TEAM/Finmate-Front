const safeValue = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string' && val.toLowerCase() === 'null') return null;
  return val;
};

// 상품 비교 API
export const compareProductsWithGPT = async (compareList) => {
  try {
    const requestData = compareList.map((item) => {
      // preferentialTags 안전하게 처리
      let preferentialTags = [];
      if (item.preferentialTags) {
        if (Array.isArray(item.preferentialTags)) {
          preferentialTags = item.preferentialTags;
        } else if (typeof item.preferentialTags === 'string') {
          preferentialTags = item.preferentialTags.split(',').map((t) => t.trim());
        }
      } else if (item.preferential_tags) {
        if (Array.isArray(item.preferential_tags)) {
          preferentialTags = item.preferential_tags;
        } else if (typeof item.preferential_tags === 'string') {
          preferentialTags = item.preferential_tags.split(',').map((t) => t.trim());
        }
      }

      return {
        available: safeValue(item.available),
        finCoNo: safeValue(item.finCoNo ?? item.fin_co_no),
        finPrdtCd: safeValue(item.finPrdtCd ?? item.fin_prdt_cd ?? item.productId),
        finPrdtNm: safeValue(item.finPrdtNm ?? item.productName),
        joinMember: safeValue(item.joinMember ?? item.join_member),
        joinWay: safeValue(item.joinWay ?? item.join_way),
        korCoNm: safeValue(item.korCoNm),
        maxIntrRate:
          item.intrRate2 !== undefined
            ? parseFloat(item.intrRate2)
            : item.intrRate !== undefined
              ? parseFloat(item.intrRate)
              : null,
        preferentialTags,

        productDetail: {
          available: safeValue(item.available),
          dclsEndDay: safeValue(item.dclsEndDay),
          dclsStrtDay: safeValue(item.dclsStrtDay),
          etcNote: safeValue(item.etcNote ?? item.etc_note),
          finCoNo: safeValue(item.finCoNo ?? item.fin_co_no),
          finPrdtCd: safeValue(item.finPrdtCd ?? item.fin_prdt_cd ?? item.productId),
          finPrdtNm: safeValue(item.finPrdtNm ?? item.productName),
          joinDeny: safeValue(item.joinDeny),
          joinMember: safeValue(item.joinMember ?? item.join_member),
          joinWay: safeValue(item.joinWay ?? item.join_way),
          korCoNm: safeValue(item.korCoNm),
          maxDepositAmount: item.maxDepositAmount ?? item.max_deposit_amount ?? null,
          minDepositAmount: item.minDepositAmount ?? item.min_deposit_amount ?? null,
          mtrtInt: safeValue(item.mtrtInt),
          options: [
            {
              compoundRate: item.intrRateType === 'M',
              finPrdtCd: safeValue(item.finPrdtCd ?? item.fin_prdt_cd ?? item.productId),
              intrRate: item.intrRate !== undefined ? parseFloat(item.intrRate) : null,
              intrRate2:
                item.intrRate2 !== undefined
                  ? parseFloat(item.intrRate2)
                  : item.intrRate !== undefined
                    ? parseFloat(item.intrRate)
                    : null,
              intrRateType: safeValue(item.intrRateType),
              intrRateTypeNm: safeValue(item.intrRateTypeNm),
              productId: item.productId ?? null,
              rsrvType: safeValue(item.rsrvType),
              rsrvTypeNm: safeValue(item.rsrvTypeNm),
              saveTrm: item.saveTrm !== undefined ? parseInt(item.saveTrm) : null,
              singleRate: item.intrRateType !== 'M',
            },
          ],
          preferentialTags,
          productId: item.productId ?? null,
          spclCnd: safeValue(item.spclCnd),
        },

        productId: item.productId ?? null,
        productType: safeValue(item.productType),
        spclCnd: safeValue(item.spclCnd),
      };
    });

    const response = await fetch('/chat/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.header?.status !== 'OK') {
      throw new Error(data.header?.message || '서버 오류가 발생했습니다.');
    }

    let gptResult = data.body?.data;

    if (typeof gptResult === 'string') {
      try {
        gptResult = JSON.parse(gptResult);
      } catch {
        console.log('GPT 결과를 문자열로 처리합니다.');
      }
    }

    return gptResult;
  } catch (error) {
    console.error('GPT 비교 요청 실패:', error);
    throw error;
  }
};

// 상품 데이터를 API 요청 형식으로 변환하는 함수
const transformProductDataForSummary = (product, selectedOption) => {
  if (!product || !selectedOption) return null;

  // preferentialTags 처리
  let preferentialTags = [];
  if (product.preferentialTags || product.preferential_tags) {
    const tags = product.preferentialTags || product.preferential_tags;
    if (Array.isArray(tags)) {
      preferentialTags = tags;
    } else if (typeof tags === 'string') {
      preferentialTags = tags.split(',').map((t) => t.trim());
    }
  }

  return {
    available: safeValue(product.available),
    finCoNo: safeValue(product.finCoNo || product.fin_co_no),
    finPrdtCd: safeValue(product.finPrdtCd || product.fin_prdt_cd || product.productId),
    finPrdtNm: safeValue(product.finPrdtNm || product.fin_prdt_nm || product.productName),
    joinMember: safeValue(product.joinMember || product.join_member),
    joinWay: safeValue(product.joinWay || product.join_way),
    korCoNm: safeValue(product.korCoNm || product.kor_co_nm),
    maxIntrRate:
      selectedOption.intr_rate2 !== undefined
        ? parseFloat(selectedOption.intr_rate2)
        : selectedOption.intr_rate !== undefined
          ? parseFloat(selectedOption.intr_rate)
          : selectedOption.intrRate2 !== undefined
            ? parseFloat(selectedOption.intrRate2)
            : selectedOption.intrRate !== undefined
              ? parseFloat(selectedOption.intrRate)
              : null,
    preferentialTags,

    productDetail: {
      available: safeValue(product.available),
      dclsEndDay: safeValue(
        product.productDetail?.dcls_end_day || product.productDetail?.dclsEndDay
      ),
      dclsStrtDay: safeValue(
        product.productDetail?.dcls_strt_day || product.productDetail?.dclsStrtDay
      ),
      etcNote: safeValue(product.productDetail?.etc_note || product.productDetail?.etcNote),
      finCoNo: safeValue(product.finCoNo || product.fin_co_no),
      finPrdtCd: safeValue(product.finPrdtCd || product.fin_prdt_cd || product.productId),
      finPrdtNm: safeValue(product.finPrdtNm || product.fin_prdt_nm || product.productName),
      joinDeny: safeValue(product.productDetail?.join_deny || product.productDetail?.joinDeny),
      joinMember: safeValue(
        product.productDetail?.join_member || product.productDetail?.joinMember
      ),
      joinWay: safeValue(product.productDetail?.join_way || product.productDetail?.joinWay),
      korCoNm: safeValue(product.korCoNm || product.kor_co_nm),
      maxDepositAmount:
        product.productDetail?.max_deposit_amount ||
        product.productDetail?.maxDepositAmount ||
        null,
      minDepositAmount:
        product.productDetail?.min_deposit_amount ||
        product.productDetail?.minDepositAmount ||
        null,
      mtrtInt: safeValue(product.productDetail?.mtrt_int || product.productDetail?.mtrtInt),
      options: [
        {
          compoundRate: (selectedOption.intr_rate_type || selectedOption.intrRateType) === 'M',
          finPrdtCd: safeValue(product.finPrdtCd || product.fin_prdt_cd || product.productId),
          intrRate:
            selectedOption.intr_rate !== undefined
              ? parseFloat(selectedOption.intr_rate)
              : selectedOption.intrRate !== undefined
                ? parseFloat(selectedOption.intrRate)
                : null,
          intrRate2:
            selectedOption.intr_rate2 !== undefined
              ? parseFloat(selectedOption.intr_rate2)
              : selectedOption.intr_rate !== undefined
                ? parseFloat(selectedOption.intr_rate)
                : selectedOption.intrRate2 !== undefined
                  ? parseFloat(selectedOption.intrRate2)
                  : selectedOption.intrRate !== undefined
                    ? parseFloat(selectedOption.intrRate)
                    : null,
          intrRateType: safeValue(selectedOption.intr_rate_type || selectedOption.intrRateType),
          intrRateTypeNm: safeValue(
            selectedOption.intr_rate_type_nm || selectedOption.intrRateTypeNm
          ),
          productId: product.product_id || product.productId || null,
          rsrvType: safeValue(selectedOption.rsrv_type || selectedOption.rsrvType),
          rsrvTypeNm: safeValue(selectedOption.rsrv_type_nm || selectedOption.rsrvTypeNm),
          saveTrm:
            selectedOption.save_trm !== undefined
              ? parseInt(selectedOption.save_trm)
              : selectedOption.saveTrm !== undefined
                ? parseInt(selectedOption.saveTrm)
                : null,
          singleRate: (selectedOption.intr_rate_type || selectedOption.intrRateType) !== 'M',
        },
      ],
      preferentialTags,
      productId: product.product_id || product.productId || null,
      spclCnd: safeValue(product.productDetail?.spcl_cnd || product.productDetail?.spclCnd),
    },

    productId: product.product_id || product.productId || null,
    productType: safeValue(product.productType || 'deposit'),
    spclCnd: safeValue(product.productDetail?.spcl_cnd || product.productDetail?.spclCnd),
  };
};

// 상품 요약 API
export const getProductSummaryWithGPT = async (product, selectedOption) => {
  try {
    // 상품 데이터 변환
    const requestData = transformProductDataForSummary(product, selectedOption);

    if (!requestData) {
      throw new Error('상품 데이터를 변환할 수 없습니다.');
    }

    const response = await fetch('/chat/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.header?.status !== 'OK') {
      throw new Error(data.header?.message || 'API 응답 오류가 발생했습니다.');
    }

    let gptResult = data.body?.data;

    if (typeof gptResult === 'string') {
      try {
        if (gptResult.startsWith('"') && gptResult.endsWith('"')) {
          gptResult = JSON.parse(gptResult);
        }
      } catch {
        console.log('GPT 요약 결과를 문자열로 처리합니다.');
      }
    }

    if (!gptResult) {
      throw new Error('AI 요약 결과가 없습니다.');
    }

    return gptResult;
  } catch (error) {
    console.error('GPT 상품 요약 요청 실패:', error);
    throw error;
  }
};
