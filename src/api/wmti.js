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

//wmti 설문결과 호출
// export const getWMTIResultAPI = async (memberId) => {
//   const res = await api.get('/api/wmti/result',{
//     params: {memberId},
//   });
//   return res.data;
// }
// 📁 src/api/wmti.js
export const getWMTIResultAPI = async (memberId) => {
  const res = await api.get(`/api/wmti/result/${memberId}`);
  return res.data;
};

//wmti 설문이력 열람

//wmti-analysis.json 호출
// WMTI 코드 기반 분석 정보 조회
export const getWMTIAnalysisAPI = async (wmtiCode) => {
  const res = await api.get(`/api/wmti/analysis/${wmtiCode}`);
  return res.data;
};

//wmti 테마-포트폴리오 호출
