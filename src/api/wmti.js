import api from './index';
import {
  getResultTypeName,
  getRiskPreferenceDescription,
  calculateRiskLevel,
  calculateReturnExpectation,
  calculateTotalScore,
  formatCreatedAtArray,
} from '../util/wmtiUtils';

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
// WMTI 코드 기반 분석 정보 조회 (wmti-analysis.json 호출)
export const getWMTIAnalysisAPI = async (wmtiCode) => {
  const res = await api.get(`/api/wmti/analysis/${wmtiCode}`);
  return res.data;
};
//Preinfo 연산값 조회
export const getPreInfoCalcAPI = async () => {
  const res = await api.get(`/api/preinfo/my`);
  return res.data;
};

// wmti 코드 모아보기
export const getWMTICodesAPI = async () => {
  const res = await api.get('/api/wmti/analysis/all');
  return res.data;
};

// wmti결과 가져오기
export const getWMTIResultAPI = async (memberId) => {
  const res = await api.get(`/api/wmti/result/${memberId}`);
  return res.data;
};

//wmti 검사이력 가져오기
export const getWMTIHistoryAPI = async (memberId) => {
  const res = await api.get(`/api/wmti/history/member/${memberId}`);

  if (res.data.header.status !== 'OK') {
    throw new Error(res.data.header.message);
  }

  const rawList = res.data.body.data;

  const processedList = rawList.map((item) => ({
    id: item.historyId,
    type: item.resultType,
    typeName: getResultTypeName(item.resultType),
    description: getRiskPreferenceDescription(item.riskPreference),
    riskLevel: calculateRiskLevel(item),
    returnExpectation: calculateReturnExpectation(item),
    score: calculateTotalScore(item),
    createdAt: formatCreatedAtArray(item.createdAt),
    wmtiCode: item.wmtiCode,
    originalData: item,
  }));

  return processedList;
};
