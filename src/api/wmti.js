import api from './index';

// 기본 정보 제출
export const postPreinfoAPI = async (info) => {
  const res = await api.post('/api/preinfo/submit', info);
  return res.data;
};
