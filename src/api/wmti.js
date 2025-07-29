import api from './index';

// 기본 정보 제출
export const postPreinfoAPI = async (info) => {
  const res = await api.post('/api/preinfo/submit', info);
  return res.data;
};
//wmti설문문항 가져오기
export const getWMTIQuestionsAPI = async () => {
  const res = await api.get('/api/wmti/questions');
  return res.data;
};

// wmti설문답변 제출
export const postwmtiAPI = async (info) => {
  const res = await api.post('/api/wmti/submit', info);
  return res.data;
};
