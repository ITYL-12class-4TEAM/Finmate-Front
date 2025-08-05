// api/recentView.js - 최근 본 상품 관련 API
import api from './index';

export const recentViewAPI = {
  // 최근 본 상품 조회
  getRecentView: async () => {
    const res = await api.get('/api/recent-viewed');
    return res;
  },

  // 최근 본 상품 삭제
  deleteRecentView: async (productId) => {
    const res = await api.delete(`/api/recent-viewed/${productId}`);
    return res.data;
  },

  // 최근 본 상품 전체 삭제
  deleteAllRecentView: async () => {
    const res = await api.delete('/api/recent-viewed/all');
    return res.data;
  },
};
