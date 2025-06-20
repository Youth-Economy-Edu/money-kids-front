import api from './api';

export const investmentService = {
  // 전체 주식 목록 조회
  async getAllStocks() {
    try {
      const response = await api.get('/api/stocks');
      
      if (Array.isArray(response)) {
        const stocksWithChangeRate = response.map(stock => ({
          ...stock,
          changeRate: stock.beforePrice > 0 
            ? ((stock.price - stock.beforePrice) / stock.beforePrice * 100).toFixed(2)
            : 0
        }));
        
        return {
          success: true,
          stocks: stocksWithChangeRate
        };
      }
      
      return {
        success: true,
        stocks: []
      };
    } catch (error) {
      console.error('전체 주식 조회 실패:', error);
      return {
        success: false,
        error: error.message,
        stocks: []
      };
    }
  },

  // 카테고리별 주식 조회
  async getStocksByCategory(category) {
    try {
      const response = await api.get('/api/stocks/category', {
        params: { category }
      });
      
      if (response.data && Array.isArray(response.data)) {
        const stocksWithChangeRate = response.data.map(stock => ({
          ...stock,
          changeRate: stock.beforePrice > 0 
            ? ((stock.price - stock.beforePrice) / stock.beforePrice * 100).toFixed(2)
            : 0
        }));
        
        return {
          success: true,
          stocks: stocksWithChangeRate
        };
      }
      
      return {
        success: true,
        stocks: []
      };
    } catch (error) {
      console.error('카테고리별 주식 조회 실패:', error);
      return {
        success: false,
        error: error.message,
        stocks: []
      };
    }
  },

  // 주식 순위 조회
  async getStockRanking(standard = 'price') {
    try {
      const response = await api.get('/api/stocks/ranking', {
        params: { standard }
      });
      
      if (response.data) {
        if (standard === 'changeRate') {
          // 변동률 기준 순위는 이미 계산된 값이 포함되어 있음
          return {
            success: true,
            stocks: response.data
          };
        } else {
          // 주가 기준 순위
          const stocksWithChangeRate = response.data.map(stock => ({
            ...stock,
            changeRate: stock.beforePrice > 0 
              ? ((stock.price - stock.beforePrice) / stock.beforePrice * 100).toFixed(2)
              : 0
          }));
          
          return {
            success: true,
            stocks: stocksWithChangeRate
          };
        }
      }
      
      return {
        success: true,
        stocks: []
      };
    } catch (error) {
      console.error('주식 순위 조회 실패:', error);
      return {
        success: false,
        error: error.message,
        stocks: []
      };
    }
  },

  // 관심 종목 목록 조회
  async getWatchlist(userId) {
    try {
      const response = await api.get('/api/stocks/favorite');
      
      if (response && Array.isArray(response)) {
        return {
          success: true,
          watchlist: response
        };
      }
      
      return {
        success: true,
        watchlist: []
      };
    } catch (error) {
      console.error('관심 종목 조회 실패:', error);
      return {
        success: true,
        watchlist: []
      };
    }
  },

  // 관심 종목 목록 조회 (별칭 함수 - InvestmentPage.jsx 호환성)
  async getWishlist(userId) {
    try {
      const response = await api.get('/api/stocks/favorite');
      
      if (response && Array.isArray(response)) {
        return {
          success: true,
          watchlist: response
        };
      }
      
      return {
        success: true,
        watchlist: []
      };
    } catch (error) {
      console.error('관심 종목 조회 실패:', error);
      return {
        success: true,
        watchlist: []
      };
    }
  },

  // 관심 종목 추가/삭제 (토글)
  async toggleWatchlist(userId, stockId) {
    try {
      await api.post('/api/stocks/favorite', {
        userId,
        stockId
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('관심 종목 토글 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 관심 종목 추가/삭제 (별칭 함수 - InvestmentPage.jsx 호환성)
  async toggleWishlist(userId, stockId) {
    try {
      await api.post('/api/stocks/favorite', {
        userId,
        stockId
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('관심 종목 토글 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 주식 매수
  async buyStock(userId, stockId, quantity, price) {
    try {
      const response = await api.post('/api/stocks/trade/buy', {
        userId,
        stockId,
        quantity,
        price
      });
      
      return {
        success: true,
        trade: response.data
      };
    } catch (error) {
      console.error('주식 매수 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // 주식 매도
  async sellStock(userId, stockId, quantity, price) {
    try {
      const response = await api.post('/api/stocks/trade/sell', {
        userId,
        stockId,
        quantity,
        price
      });
      
      return {
        success: true,
        trade: response.data
      };
    } catch (error) {
      console.error('주식 매도 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // 거래 내역 조회
  async getTradeHistory(userId) {
    try {
      const response = await api.get('/api/stocks/trade/history');
      
      return {
        success: true,
        trades: response.data || []
      };
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
      return {
        success: true,
        trades: []
      };
    }
  },

  // 포트폴리오 조회
  async getPortfolio(userId) {
    try {
      const response = await api.get(`/users/${userId}/portfolio`);
      return {
        success: true,
        portfolio: response.data
      };
    } catch (error) {
      console.error('포트폴리오 조회 실패:', error);
      
      // 500 에러나 404 에러인 경우 기본 포트폴리오 반환
      if (error.message.includes('Internal Server Error') || error.message.includes('Not Found')) {
        console.log('기본 포트폴리오를 사용합니다.');
        return {
          success: true,
          portfolio: {
            totalAsset: 1000000,
            cash: 1000000,
            stocks: []
          }
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 주식 코드로 단일 주식 조회
  async getStockByCode(stockCode) {
    try {
      const response = await api.get(`/api/stocks/code/${stockCode}`);
      
      if (response) {
        const stockWithChangeRate = {
          ...response,
          changeRate: response.beforePrice > 0 
            ? ((response.price - response.beforePrice) / response.beforePrice * 100).toFixed(2)
            : 0
        };
        
        return {
          success: true,
          stock: stockWithChangeRate
        };
      }
      
      return {
        success: false,
        error: '주식을 찾을 수 없습니다.'
      };
    } catch (error) {
      console.error('주식 조회 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 주식 거래 (매수/매도)
  async tradeStock(tradeData) {
    try {
      const { userId, stockCode, tradeType, quantity, price } = tradeData;
      
      const endpoint = tradeType === 'BUY' ? '/api/stocks/trade/buy' : '/api/stocks/trade/sell';
      const response = await api.post(endpoint, {
        userId,
        stockCode,
        quantity,
        price
      });
      
      return {
        success: true,
        trade: response,
        message: `${tradeType === 'BUY' ? '매수' : '매도'} 주문이 성공적으로 체결되었습니다.`
      };
    } catch (error) {
      console.error('주식 거래 실패:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};

export default investmentService; 