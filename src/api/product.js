import api from './index';

// 상품 리스트 조회
export const getProductsAPI = async (params = {}) => {
  console.log('API 호출 파라미터:');

  const res = await api.get(`/api/products`);

  return res.data.body.data;
};

// 상품 상세 정보 조회
export const getProductsDetailAPI = async () => {
  console.log('API 호출 파라미터:');

  const res = await api.get(`/api/products/${productType}/${productId}`);
  const detail = res.data.body.data.productDetail;

  return{
    id: detail.product_id,
    bank_name: detail.kor_co_nm,
    product_name: detail.fin_prdt_nm,
    intr_rate_name: detail.intr_rate_name, // 단리 복리
    save_trm: detail.save_trm, // 예치 기간
    intr_rate: detail.intr_rate, // 기본 금리
    intr_rate2: detail.intr_rate2, // 우대 금리
    // preferencial_conditions: ~ 우대조건 추가해야함
    join_way: detail.join_way, // 가입 방법
    join_member: detail.join_member, // 가입대상 (ex. 군인, 50세 이상 등...)
    available: detail.availablem, // 판매여부 boolean
    mtrt_int: detail.mtrt_int, // 만기 후 이자율
    min_deposit: detail.min_deposit,
    max_deposit: detail.max_deposit,
    etc_note: detail.etc_note, // 비고
  }
};


// 상품 카테고리 목록
export const getProductsCategoriesAPI = async () => {
  const res = await api.get(`/api/products/categories`);

  return res.data.body.data;
};

// 상품 비교
export const getProductsCompareAPI = async () => {
  const res = await api.get(`/api/products/compare`);

  return res.data.body.data;
};

// 카테고리별 필터 옵션
export const getProductsFilterOptionsAPI = async (category = 'deposit', subCategory) => {
  const params = {category};
  if(subCategory) params.subCategory = subCategory;
  
  const res = await api.get(`/api/products/filter-options`,{params});

  return res.data.body.data;
};

// 카테고리별 하위 카테고리 목록
export const getProductsSubCategoriesAPI = async () => {
  const res = await api.get(`/api/products/categories/${categoryCode}/subcategories`);

  return res.data.body.data;
};