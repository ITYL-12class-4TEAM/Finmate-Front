import api from './index';

// 댓글 좋아요 개수 조회
export const toggleCommentLikeAPI = async (commentId, memberId) => {
  const res = await api.post(
    `/api/comment-like/${commentId}/toggle?memberId=${memberId}`
  );
  return res.data.body.data.liked;
};

// 해당 댓글 좋아요 여부 조회
export const getCommentLikeCountAPI = async (commentId) => {
  const res = await api.get(`/api/comment-like/${commentId}/count`);
  return res.data.body.data;
};

// 댓글 좋아요 토글
export const getCommentLikedByMeAPI = async (commentId, memberId) => {
  const res = await api.get(
    `/api/comment-like/${commentId}/me?memberId=${memberId}`
  );
  return res.data.body.data.liked;
};
