import { analysisApi } from './apiService.js';

// 투자 성향 분석 서비스
export const analysisService = {
  // 성향 분석 수행
  performAnalysis: async (analysisData) => {
    try {
      const response = await analysisApi.performAnalysis(analysisData);
      return response;
    } catch (error) {
      console.error('성향 분석 수행 오류:', error);
      // 백엔드가 실행되지 않은 경우를 위한 mock 응답
      if (error.message.includes('서버에 연결할 수 없습니다')) {
        return {
          success: false,
          message: '분석 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
          error: 'SERVER_UNAVAILABLE'
        };
      }
      throw error;
    }
  },

  // 최신 분석 결과 조회
  getLatestResult: async (userId) => {
    try {
      const response = await analysisApi.getLatestResult(userId);
      return response;
    } catch (error) {
      console.error('최신 분석 결과 조회 오류:', error);
      // 404 에러인 경우 분석 결과가 없음을 의미
      if (error.message.includes('Not Found') || error.message.includes('404')) {
        return {
          success: false,
          message: '분석 결과가 없습니다. 새로운 분석을 시작해보세요.',
          error: 'NO_ANALYSIS_FOUND'
        };
      }
      throw error;
    }
  },

  // 성향 분석 이력 조회
  getAnalysisHistory: async (userId) => {
    try {
      const response = await analysisApi.getAnalysisHistory(userId);
      return response;
    } catch (error) {
      console.error('성향 분석 이력 조회 오류:', error);
      // 404 에러인 경우 이력이 없음을 의미
      if (error.message.includes('Not Found') || error.message.includes('404')) {
        return {
          success: true,
          data: [],
          message: '분석 이력이 없습니다.'
        };
      }
      throw error;
    }
  },

  // 성향 분석 결과 삭제
  deleteAnalysis: async (userId) => {
    try {
      const response = await analysisApi.deleteAnalysis(userId);
      return response;
    } catch (error) {
      console.error('성향 분석 결과 삭제 오류:', error);
      throw error;
    }
  }
};

export default analysisService; 