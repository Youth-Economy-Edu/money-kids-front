import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Axios 인스턴스 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 공통 API 요청 함수
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const config = {
      url: endpoint,
      method: options.method || 'GET',
      ...options
    };

    if (options.body) {
      config.data = options.body;
    }

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    console.error(`API 요청 실패 (${endpoint}):`, error);
    
    if (error.response) {
      throw new Error(error.response.data?.msg || error.response.statusText || 'API 요청 실패');
    } else if (error.request) {
      throw new Error('서버에 연결할 수 없습니다');
    } else {
      throw new Error('요청 중 오류가 발생했습니다');
    }
  }
};

// 서버 상태 확인
export const checkServerHealth = async () => {
  try {
    const response = await apiRequest('/api/stocks');
    return { 
      success: true, 
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('서버 상태 확인 실패:', error);
    return { 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Stock API Export
export const stockApi = {
  getAllStocks: async () => {
    try {
      const response = await apiRequest('/api/stocks');
      return response || [];
    } catch (error) {
      console.error('전체 주식 조회 실패:', error);
      return [];
    }
  },

  getByCode: async (code) => {
    try {
      const response = await apiRequest(`/api/stocks/code/${code}`);
      return response;
    } catch (error) {
      console.error('주식 코드 조회 실패:', error);
      return null;
    }
  },

  getByCategory: async (category) => {
    try {
      const response = await apiRequest('/api/stocks/category', { params: { category } });
      return response || [];
    } catch (error) {
      console.error('카테고리별 주식 조회 실패:', error);
      return [];
    }
  }
};

// Article API Export
export const articleApi = {
  getAllArticles: async () => {
    try {
      const response = await apiRequest('/api/articles/all');
      return response || { code: 200, data: [] };
    } catch (error) {
      console.error('기사 조회 실패:', error);
      return { code: 500, data: [], msg: '기사를 불러오는데 실패했습니다.' };
    }
  },

  generateNews: async () => {
    try {
      const response = await apiRequest('/api/articles/generate', { method: 'POST' });
      return response || { code: 200, msg: '뉴스가 성공적으로 생성되었습니다.', data: { generatedCount: 1 } };
    } catch (error) {
      console.error('AI 뉴스 생성 실패:', error);
      return { code: 500, msg: 'AI 뉴스 생성에 실패했습니다.', data: null };
    }
  },

  getByStockId: async (stockId) => {
    try {
      const response = await apiRequest(`/api/articles/stock/${stockId}`);
      return response || { code: 200, data: [] };
    } catch (error) {
      console.error('주식별 기사 조회 실패:', error);
      return { code: 500, data: [], msg: '기사를 불러오는데 실패했습니다.' };
    }
  }
};

// Trade API Export
export const tradeApi = {
  buyStock: async (data) => {
    try {
      const response = await apiRequest('/api/stocks/trade/buy', { method: 'POST', body: data });
      return { success: true, data: response };
    } catch (error) {
      console.error('주식 매수 실패:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  sellStock: async (data) => {
    try {
      const response = await apiRequest('/api/stocks/trade/sell', { method: 'POST', body: data });
      return { success: true, data: response };
    } catch (error) {
      console.error('주식 매도 실패:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  getTradeHistory: async () => {
    try {
      const response = await apiRequest('/api/stocks/trade/history');
      return { success: true, data: response || [] };
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  getBalance: async () => {
    try {
      const response = await apiRequest('/api/stocks/trade/balance');
      return { success: true, data: response };
    } catch (error) {
      console.error('잔고 조회 실패:', error);
      return { success: false, error: error.message, data: null };
    }
  }
};

// Quiz API Export
export const quizApi = {
  getRandom: async (count = 5) => {
    try {
      const response = await apiRequest(`/api/quizzes/random?count=${count}`);
      return { success: true, data: response || [] };
    } catch (error) {
      console.error('랜덤 퀴즈 조회 실패:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  submit: async (data) => {
    try {
      const response = await apiRequest('/api/quizzes/submit', { method: 'POST', body: data });
      return { success: true, data: response };
    } catch (error) {
      console.error('퀴즈 답안 제출 실패:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  getByCategory: async (category) => {
    try {
      const response = await apiRequest(`/api/quizzes/category/${category}`);
      return { success: true, data: response || [] };
    } catch (error) {
      console.error('카테고리별 퀴즈 조회 실패:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
};

// Analysis API Export
export const analysisApi = {
  perform: async (data) => {
    try {
      const response = await apiRequest('/api/analysis/perform', { method: 'POST', body: data });
      return { success: true, data: response };
    } catch (error) {
      console.error('분석 수행 실패:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  getResult: async (userId) => {
    try {
      const response = await apiRequest('/api/analysis/result', { params: { user_id: userId } });
      return { success: true, data: response };
    } catch (error) {
      console.error('분석 결과 조회 실패:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  getHistory: async (userId) => {
    try {
      const response = await apiRequest(`/api/analysis/history/${userId}`);
      return { success: true, data: response || [] };
    } catch (error) {
      console.error('분석 히스토리 조회 실패:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
};

// Worksheet API Export
export const worksheetApi = {
  getByDifficulty: async (difficulty) => {
    try {
      const response = await apiRequest(`/api/worksheets/difficulty/${difficulty}`);
      return { success: true, ids: response || [] };
    } catch (error) {
      console.error('난이도별 워크시트 조회 실패:', error);
      return { success: false, error: error.message, ids: [] };
    }
  },

  getConceptDetail: async (id) => {
    try {
      const response = await apiRequest(`/api/worksheets/${id}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('개념 상세 조회 실패:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  getAll: async () => {
    try {
      const response = await apiRequest('/api/worksheets');
      return { success: true, data: response || [] };
    } catch (error) {
      console.error('워크시트 목록 조회 실패:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  getConceptsByDifficulty: async (difficulty) => {
    try {
      const response = await apiRequest(`/api/worksheets/concepts/difficulty/${difficulty}`);
      return { success: true, data: response || [] };
    } catch (error) {
      console.error('개념별 워크시트 조회 실패:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
};

// 기본 API 서비스 객체
const apiService = {
  get: (url, config = {}) => apiRequest(url, { method: 'GET', ...config }),
  post: (url, data, config = {}) => apiRequest(url, { method: 'POST', body: data, ...config }),
  put: (url, data, config = {}) => apiRequest(url, { method: 'PUT', body: data, ...config }),
  delete: (url, config = {}) => apiRequest(url, { method: 'DELETE', ...config }),
  patch: (url, data, config = {}) => apiRequest(url, { method: 'PATCH', body: data, ...config }),
  health: checkServerHealth
};

export default apiService; 