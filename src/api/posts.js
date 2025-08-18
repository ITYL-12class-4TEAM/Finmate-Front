import api from './index';
import { productTagMap } from '@/constants/tags';

// 게시글 목록 조회
export const getPostsAPI = async ({ page = 1, size = 5 }) => {
  const res = await api.get(`/api/posts/paging`, {
    params: {
      page,
      size,
    },
  });
  const data = res.data.body.data;

  const content = data.content.map((post) => ({
    id: post.postId,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    lastUpdated: post.lastUpdated,
    likes: post.likeCount,
    comments: post.commentCount,
    liked: post.liked,
    scraped: post.scraped,
    scrapCount: post.scrapCount,
    productType: productTagMap[post.productTag],
    nickname: post.nickname,
    anonymous: post.anonymous,
  }));

  return {
    content,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
  };
};

// 게시글 상세 조회
export const getPostByIdAPI = async (postId, memberId) => {
  const res = await api.get(`/api/posts/${postId}`);
  const post = res.data.body.data;

  return {
    id: post.postId,
    boardId: post.boardId,
    memberId: post.memberId,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    likes: post.likeCount,
    scraps: post.scrapCount,
    isAnonymous: post.anonymous,
    liked: post.liked,
    scraped: post.scraped,
    // attaches: post.attaches, // TODO: 배포 후 처리
    tags: [productTagMap[post.productTag]],
    nickname: post.nickname,
    isMine: post.memberId === memberId ? true : false,
    authorImage: '/authorImg.jpg', // TODO: 백엔드 이미지 연결 시 교체
  };
};

// 게시글 등록
export const createPostAPI = async (postData) => {
  const res = await api.post('/api/posts', postData);
  return res.data.body.data;
};

// 게시글 수정
export const updatePostAPI = async (postId, postData) => {
  const res = await api.put(`/api/posts/${postId}`, postData);
  return res.data.body.data;
};

// 게시글 삭제
export const deletePostAPI = async (postId) => {
  const res = await api.delete(`/api/posts/${postId}`);
  return res.data;
};

// 첨부파일 삭제 TODO: 배포 후 처리
// export const deleteFileAPI = async (no) => {
//   const res = await api.delete(`/api/posts/attachment/${no}`);
//   return res.data;
// };

// 전체 핫게시물 조회
export const getHotPostsAPI = async () => {
  const res = await api.get('/api/posts/hot');
  return res.data.body.data;
};
