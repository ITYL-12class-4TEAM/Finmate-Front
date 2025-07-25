import api from './index';
import { categoryTagMap, productTagMap } from '@/constants/tags';

// 게시글 목록 조회
export const getPostsAPI = async () => {
  const res = await api.get('/api/posts');
  const posts = res.data.body.data;

  return posts.map((post) => ({
    id: post.postId,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    likes: post.likeCount,
    comments: post.commentCount,
    tendency: 'APWC', // 임의 값 (백엔드 리팩터링 전)
    productType: productTagMap[post.productTag],
    tag: categoryTagMap[post.categoryTag],
  }));
};

// 게시글 상세 조회
export const getPostByIdAPI = async (id) => {
  const res = await api.get(`/api/posts/${id}`);
  const post = res.data.body.data;

  return {
    id: post.postId,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    likes: post.likeCount,
    imageUrl: post.attaches?.[0]?.url || '',
    tags: [productTagMap[post.productTag], categoryTagMap[post.categoryTag]],
    nickname: '익명', // TODO: 백엔드에서 닉네임 제공 시 교체
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
