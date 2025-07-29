import api from './index';

// 게시글 좋아요 개수 조회
export const getScrapCountAPI = async (postId) => {
  const res = await api.get(`/api/sraps/posts/${postId}/count`);
  return res.data.body.data; // 숫자
};

// 해당 게시글 좋아요 여부 조회 TODO
export const getScrapByMeAPI = async (postId, memberId) => {
  const res = await api.get(`/api/post-like/${postId}/me?memberId=${memberId}`);
  return res.data.body.data.scraped; // true or false
};

// 게시글 좋아요 토글
export const toggleScrapAPI = async (postId) => {
  const res = await api.post(`/api/sraps/posts/${postId}`);
  return res.data.body.data.scraped;
};
