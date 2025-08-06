// src/utils/wmtiUtils.js
import { ResultTypeEnum, RiskPreferenceDescriptionEnum } from '@/constants/wmtienums';

export const getResultTypeName = (resultType) => {
  return ResultTypeEnum[resultType] || resultType;
};

export const getRiskPreferenceDescription = (riskPreference) => {
  return RiskPreferenceDescriptionEnum[riskPreference] || riskPreference;
};

export const calculateRiskLevel = (item) => {
  const aggressiveScore = (item.ascore + item.pscore) / 2;
  const conservativeScore = item.lscore;
  const riskLevel = (aggressiveScore - conservativeScore + 100) / 20;
  return Math.max(1, Math.min(10, Math.round(riskLevel)));
};

export const calculateReturnExpectation = (item) => {
  const riskLevel = calculateRiskLevel(item);
  return Math.round(riskLevel * 1.2 + 2);
};

export const calculateTotalScore = (item) => {
  return item.ascore + item.lscore + item.mscore + item.pscore;
};

export const formatCreatedAtArray = (createdAtArray) => {
  if (Array.isArray(createdAtArray) && createdAtArray.length >= 5) {
    const [year, month, day, hour, minute, second = 0] = createdAtArray;
    return new Date(year, month - 1, day, hour, minute, second).toISOString();
  }
  return new Date().toISOString();
};
