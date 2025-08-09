import api from './index';

const safeValue = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === 'string' && val.toLowerCase() === 'null') return null;
  return val;
};

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

    const response = await fetch('/api/chat/compare', {
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
