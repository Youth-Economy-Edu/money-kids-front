// API 클라이언트 V2: 환경 변수, 중앙 에러 처리, 자동 인증

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 중앙화된 API 호출 함수
const apiFetch = async (url, options = {}) => {
    const userId = localStorage.getItem('userId'); // 또는 AuthContext에서 가져오기

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(userId && { 'X-User-Id': userId })
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        
        if (!response.ok) {
            // 204 No Content는 성공으로 간주
            if (response.status === 204) {
                return { success: true, data: null };
            }

            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { message: await response.text() };
            }
            
            console.error('API Error:', { 
                status: response.status, 
                url: `${API_BASE_URL}${url}`, 
                error: errorData 
            });

            throw new Error(errorData.message || `API Error: ${response.status}`);
        }

        // 응답 본문이 비어있을 수 있는 경우 처리
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return { success: true, data };
        }
        
        return { success: true, data: await response.text() };

    } catch (error) {
        console.error('Network or other error:', error);
        return { success: false, error: error.message };
    }
};

// --- 주식 관련 API ---
export const stockAPI = {
    getAll: () => apiFetch('/stocks'),
    getFavorites: (userId) => apiFetch(`/stocks/favorite?userId=${userId}`),
    toggleFavorite: (userId, stockId) => apiFetch('/stocks/favorite', {
        method: 'POST',
        body: JSON.stringify({ userId, stockId }),
    }),
};

// --- 거래 관련 API ---
export const tradeAPI = {
    buy: (userId, stockId, quantity) => apiFetch(`/stocks/trade/buy?userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify({ stockId: stockId.toString(), quantity }),
    }),
    sell: (userId, stockId, quantity) => apiFetch(`/stocks/trade/sell?userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify({ stockId: stockId.toString(), quantity }),
    }),
    getBalance: (userId) => apiFetch(`/stocks/trade/balance?userId=${userId}`),
    getHistory: (userId) => apiFetch(`/stocks/trade/history?userId=${userId}`),
    getOrders: (userId, stockId) => apiFetch(`/stocks/trade/order/${stockId}?userId=${userId}`),
};

// --- 사용자 정보 API ---
export const userAPI = {
    getPoints: (userId) => apiFetch(`/users/${userId}/points`),
    getPortfolio: (userId) => apiFetch(`/users/${userId}/portfolio`),
};

// --- 성향 분석 API ---
export const tendencyAPI = {
    getTendencyGraph: (childId) => apiFetch(`/tendency/${childId}/graph`),
    requestAnalysis: (childId) => apiFetch(`/tendency/${childId}/request-analysis`, { method: 'POST' }),
    getLearningProgress: (childId) => apiFetch(`/tendency/${childId}/learning-progress`),
    getRecommendations: (childId) => apiFetch(`/tendency/${childId}/recommendations`),
};

// --- 학습 및 퀴즈 API ---
export const learnAPI = {
    getConcepts: () => apiFetch('/learn/concepts'),
    getConceptDetail: (conceptId) => apiFetch(`/learn/concepts/${conceptId}`),
    getQuiz: (difficulty, count) => apiFetch(`/quiz?difficulty=${difficulty}&count=${count}`),
    submitQuiz: (userId, answers) => apiFetch(`/quiz/submit?userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
    }),
};

// --- 뉴스 기사 API ---
export const articleAPI = {
    getAll: () => apiFetch('/articles'),
    getRelated: (stockId) => apiFetch(`/articles/related/${stockId}`),
};

export default {
    stockAPI,
    tradeAPI,
    userAPI,
    tendencyAPI,
    learnAPI,
    articleAPI,
}; 