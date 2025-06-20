import { apiRequest } from './api.js';

// 주식 서비스
export const stockService = {
  // 전체 주식 목록 조회
  getAllStocks: async () => {
    return await apiRequest('/stocks');
  },

  // 주식 코드로 조회
  getStockByCode: async (stockCode) => {
    return await apiRequest(`/stocks/code/${stockCode}`);
  },

  // 종목명으로 검색
  getStocksByName: async (name) => {
    return await apiRequest(`/stocks/name?name=${name}`);
  },

  // 카테고리별 주식 조회
  getStocksByCategory: async (category) => {
    return await apiRequest(`/stocks/category?category=${category}`);
  },

  // 주식 순위 조회 (가격 기준 또는 변동률 기준)
  getStockRanking: async (standard = 'price') => {
    return await apiRequest(`/stocks/ranking?standard=${standard}`);
  },

  // 카테고리별 주식 순위 조회
  getStockRankingByCategory: async (category) => {
    return await apiRequest(`/stocks/category/ranking?category=${category}`);
  },

  // 위시리스트 조회
  getWishlist: async (userId) => {
    return await apiRequest(`/stocks/favorite?userId=${userId}`);
  },

  // 위시리스트 저장/삭제 토글
  toggleWishlist: async (wishlistData) => {
    return await apiRequest('/stocks/favorite', {
      method: 'POST',
      body: JSON.stringify(wishlistData)
    });
  }
}; 