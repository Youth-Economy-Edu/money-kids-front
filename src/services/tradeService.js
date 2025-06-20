import { apiRequest } from './api.js';

// 투자/거래 서비스
export const tradeService = {
  // 주식 매수
  buyStock: async (tradeData) => {
    return await apiRequest('/stocks/trade/buy', {
      method: 'POST',
      body: JSON.stringify(tradeData)
    });
  },

  // 주식 매도
  sellStock: async (tradeData) => {
    return await apiRequest('/stocks/trade/sell', {
      method: 'POST',
      body: JSON.stringify(tradeData)
    });
  },

  // 잔고 조회
  getBalance: async () => {
    return await apiRequest('/stocks/trade/balance');
  },

  // 특정 주식 주문 내역 조회
  getOrderDetail: async (stockId) => {
    return await apiRequest(`/stocks/trade/order/${stockId}`);
  },

  // 전체 거래 내역 조회
  getTradeHistory: async () => {
    return await apiRequest('/stocks/trade/history');
  },

  // 거래 유형별 내역 조회 (buy/sell)
  getTradeHistoryByType: async (type) => {
    return await apiRequest(`/stocks/trade/history/${type}`);
  }
}; 