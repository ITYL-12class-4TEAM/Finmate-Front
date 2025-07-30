import api from './index';

// 게시글 스크랩 개수 조회
export const getScrapCountAPI = async (postId) => {
  const res = await api.get(`/api/scraps/posts/${postId}/count`);
  return res.data.body.data.scrapCount;
};

// 게시글 좋아요 토글
export const togglePostScrapAPI = async (postId) => {
  const res = await api.post(`/api/scraps/posts/${postId}`);
  return res.data.body.data.scraped;
};
