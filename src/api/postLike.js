import api from './index';

// 게시글 좋아요 개수 조회
export const getPostLikeCountAPI = async (postId) => {
  const res = await api.get(`/api/post-like/${postId}/count`);
  return res.data.body.data; // 숫자
};

// 해당 게시글 좋아요 여부 조회
export const getPostLikedByMeAPI = async (postId, memberId) => {
  const res = await api.get(`/api/post-like/${postId}/me?memberId=${memberId}`);
  return res.data.body.data.liked; // true or false
};

// 게시글 좋아요 토글
export const togglePostLikeAPI = async (postId) => {
  const res = await api.post(`/api/post-like/${postId}/toggle`);
  return res.data.body.data.liked;
};
