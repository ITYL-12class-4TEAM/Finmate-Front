import api from './index';

// 게시글에 해당하는 댓글 리스트 조회
export const getCommentsByPostId = async (postId, currentUserId) => {
  const res = await api.get(`/api/comments/post/${postId}`);
  const comments = res.data.body.data;

  return comments.map((c) => ({
    id: c.commentId,
    content: c.content,
    createdAt: c.createdAt,
    nickname: c.anonymous ? '익명' : c.nickname || `사용자${c.memberId}`, // TODO: 백 리팩터링 후 교체
    isMine: c.memberId === currentUserId ? true : false,
    likeCount: c.likeCount,
    liked: c.liked,
  }));
};

// 댓글 생성
export const createCommentAPI = async (commentData) => {
  const res = await api.post('/api/comments', commentData);
  return res.data;
};

// 댓글 삭제
export const deleteCommentAPI = async (commentId) => {
  const res = await api.delete(`/api/comments/${commentId}`);
  return res.data;
};
