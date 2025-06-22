// 경제 소식/기사 API 서비스
const API_BASE_URL = 'http://localhost:8080/api';

export const articleService = {
  // 모든 기사 조회
  getAllArticles: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/all`);
      const data = await response.json();
      
      if (data.code === 200) {
        return data.data;
      } else {
        throw new Error(data.msg || '기사 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('기사 조회 오류:', error);
      throw error;
    }
  },

  // 특정 주식의 기사 조회
  getArticleByStockId: async (stockId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/stock/${stockId}`);
      const data = await response.json();
      
      if (data.code === 200) {
        return data.data;
      } else if (data.code === 404) {
        return null; // 기사가 없는 경우
      } else {
        throw new Error(data.msg || '기사 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('주식별 기사 조회 오류:', error);
      throw error;
    }
  },

  // 사용자 포트폴리오 조회
  getUserPortfolio: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/portfolio`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('포트폴리오 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('포트폴리오 조회 오류:', error);
      throw error;
    }
  },

  // 전체 주식 목록 조회
  getAllStocks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks`);
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('주식 목록 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('주식 목록 조회 오류:', error);
      throw error;
    }
  }
}; 