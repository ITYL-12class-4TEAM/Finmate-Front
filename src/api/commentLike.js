import api from './index';

// 댓글 좋아요 개수 조회
export const getCommentLikeCountAPI = async (commentId) => {
  const res = await api.get(`/comment-like/${commentId}/count`);
  return res.data.body.data;
};

// 해당 댓글 좋아요 여부 조회
export const getCommentLikedByMeAPI = async (commentId, memberId) => {
  const res = await api.get(`/comment-like/${commentId}/me?memberId=${memberId}`);
  return res.data.body.data.liked;
};

// 댓글 좋아요 토글
export const toggleCommentLikeAPI = async (commentId) => {
  const res = await api.post(`/comment-like/${commentId}/toggle`);
  return res.data.body.data.liked;
};
