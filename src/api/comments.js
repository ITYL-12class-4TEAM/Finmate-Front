import api from './index';

// 게시글에 해당하는 댓글 리스트 조회
export const getCommentsByPostId = async (postId, currentUserId) => {
  const res = await api.get(`/comments/post/${postId}`);
  const comments = res.data.body.data;

  return comments.map((c) => ({
    commentId: c.commentId,
    postId: c.postId,
    content: c.content,
    createdAt: c.createdAt,
    nickname: c.nickname,
    isMine: c.memberId === currentUserId ? true : false,
    likeCount: c.likeCount,
    liked: c.liked,
    parentComment: c.parentComment,
  }));
};

// 댓글 생성
export const createCommentAPI = async (commentData) => {
  const res = await api.post('/comments', commentData);
  return res.data;
};

// 댓글 삭제
export const deleteCommentAPI = async (commentId) => {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
};
