import api from './index';

const subcategoryKorMap = {
  정기예금: '예금',
  자유적금: '적금',
  연금저축: '연금',
};

// 인기 관심상품 조회
export const getWishListPopularyAPI = async () => {
  const res = await api.get(`/api/wishlist/populary`);
  const data = res.data.body.data;

  // 데이터 가공
  return data
    .filter((category) => category.products.length > 0)
    .map((category) => {
      const categoryKor = subcategoryKorMap[category.subcategoryName];

      return {
        ...category,
        subcategoryName: categoryKor,
        products: category.products.map((product) => ({
          ...product,
          subcategoryName: categoryKor,
        })),
      };
    });
};
