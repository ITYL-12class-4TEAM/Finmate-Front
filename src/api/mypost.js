// api/posts.js - 마이페이지 게시판 관련 API
import api from './index';

export const postsAPI = {
  // 내가 작성한 게시글 조회
  getMyPosts: async () => {
    const res = await api.get('/posts/my');
    return res.data;
  },

  // 게시글 상세 조회
  getPost: async (postId) => {
    const res = await api.get(`/posts/${postId}`);
    return res.data;
  },

  // 내가 스크랩한 게시글 조회
  getMyScraps: async () => {
    const res = await api.get('/scraps/my');
    return res.data;
  },

  // 내가 작성한 댓글 조회
  getMyComments: async () => {
    const res = await api.get('/comments/my');
    return res.data;
  },

  // 내가 좋아요한 게시글 조회
  getMyLikes: async () => {
    const res = await api.get('/post-like/me');
    return res.data;
  },
};
