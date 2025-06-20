import { apiRequest } from './api.js';

// 학부모 서비스
export const parentService = {
  // 자녀 기본 프로필 조회
  getChildProfile: async (childId) => {
    return await apiRequest(`/parent/child/${childId}/profile`);
  },

  // 경제 성향 그래프 데이터
  getTendencyGraph: async (childId) => {
    return await apiRequest(`/parent/child/${childId}/tendency-graph`);
  },

  // 활동 로그 요약
  getActivitySummary: async (childId, days = 7) => {
    return await apiRequest(`/parent/child/${childId}/activity-summary?days=${days}`);
  },

  // 학습 성과 분석
  getLearningProgress: async (childId) => {
    return await apiRequest(`/parent/child/${childId}/learning-progress`);
  },

  // 투자 포트폴리오 분석
  getInvestmentAnalysis: async (childId) => {
    return await apiRequest(`/parent/child/${childId}/investment-analysis`);
  },

  // 통합 대시보드 (메인 API)
  getDashboard: async (childId) => {
    return await apiRequest(`/parent/child/${childId}/dashboard`);
  },

  // 성향 변화 추이 분석
  getTendencyHistory: async (childId) => {
    return await apiRequest(`/parent/child/${childId}/tendency-history`);
  },

  // 교육 추천사항
  getRecommendations: async (childId) => {
    return await apiRequest(`/parent/child/${childId}/recommendations`);
  }
}; 