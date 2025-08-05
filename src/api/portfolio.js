// api/portfolio.js - 마이페이지 포트폴리오 관련 API
import api from './index';

export const portfolioAPI = {
  // 포트폴리오 조회
  getPortfolio: async () => {
    const res = await api.get('/api/portfolio');
    return res.data;
  },

  // 포트폴리오 요약 조회
  getPortfolioSummary: async () => {
    const res = await api.get('/api/portfolio/summary');
    return res.data;
  },

  // 포트폴리오 추가
  addPortfolio: async (newProduct) => {
    const res = await api.post('/api/portfolio', newProduct);
    return res.data;
  },

  // 포트폴리오 수정
  updatePortfolio: async (portfolioId, updateData) => {
    const res = await api.patch(`/api/portfolio/${portfolioId}`, updateData);
    return res.data;
  },

  // 포트폴리오 삭제
  deletePortfolio: async (portfolioId) => {
    const res = await api.delete(`/api/portfolio/${portfolioId}`);
    return res.data;
  },
};
