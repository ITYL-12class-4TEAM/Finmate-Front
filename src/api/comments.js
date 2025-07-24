import api from './index';

// 댓글 조회
export const getCommentsByPostId = async (postId, currentUserId = null) => {
  const res = await api.get('/api/comments');
  const all = res.data.body.data;

  return all
    .filter((c) => c.postId === Number(postId))
    .map((c) => ({
      id: c.commentId,
      content: c.content,
      createdAt: c.createdAt, // 날짜 포맷은 Vue 컴포넌트에서 처리
      nickname: c.anonymous ? '익명' : `사용자${c.memberId}`,
      isMine: currentUserId ? c.memberId === currentUserId : false,
      likeCount: 0, // 좋아요 API 연동 시 반영
      liked: false,
    }));
};

// 댓글 생성
export const createCommentAPI = async ({
  postId,
  content,
  memberId = 1,
  isAnonymous = false,
}) => {
  const res = await api.post('/api/comments', {
    postId,
    memberId,
    content,
    isAnonymous,
  });
  return res.data;
};

// 댓글 삭제
export const deleteCommentAPI = async (commentId) => {
  const res = await api.delete(`/api/comments/${commentId}`);
  return res.data;
};
