import api from './index';

export const wishlistAPI = {
  // 즐겨찾기 목록 조회
  getList: async () => {
    const res = await api.get('/api/wishlist');
    return res.data;
  },

  // 즐겨찾기 추가
  add: async ({ productId, intrRateType, rsrvType, saveTrm }) => {
    const res = await api.post('/api/wishlist', {
      productId,
      intrRateType,
      rsrvType,
      saveTrm,
    });
    return res.data;
  },

  // 즐겨찾기 삭제
  remove: async (productId) => {
    const res = await api.delete(`/api/wishlist/${productId}`);
    return res.data;
  },

  // 즐겨찾기 존재 여부 확인
  isFavorite: async (productId) => {
    const res = await api.get(`/api/wishlist/status/${productId}`);
    return res.data;
  },
};
