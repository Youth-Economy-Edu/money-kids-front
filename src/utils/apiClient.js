// API 클라이언트 V2: 환경 변수, 중앙 에러 처리, 자동 인증

const API_BASE_URL = import.meta.env.PROD 
    ? 'http://3.25.213.98:8080/api'
    : import.meta.env.VITE_API_URL || '/api';

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
        console.error('API 호출 실패:', error);
        
        // 인증 실패 시 로그인 페이지로 리다이렉트
        if (error.status === 401) {
            window.location.href = '/login';
        }
        
        throw error;
    }
};

// --- 인증 관련 API ---
export const authAPI = {
    login: (id, password) => {
        const formData = new URLSearchParams();
        formData.append('id', id);
        formData.append('password', password);
        
        return apiFetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
    },
    register: (userData) => apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
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
    getInfo: (userId) => apiFetch(`/users/${userId}`),
    getPoints: (userId) => apiFetch(`/users/${userId}/points`),
    updatePoints: (userId, points) => apiFetch(`/users/${userId}/points`, {
        method: 'PUT',
        body: JSON.stringify({ points }),
    }),
    getPortfolio: (userId) => apiFetch(`/users/${userId}/portfolio`),
};

// --- 성향 분석 API ---
export const tendencyAPI = {
    getTendencyGraph: (childId) => apiFetch(`/tendency/${childId}/graph`),
    requestAnalysis: (childId) => apiFetch(`/tendency/${childId}/request-analysis`, { method: 'POST' }),
    getLearningProgress: (childId) => apiFetch(`/tendency/${childId}/learning-progress`),
    getRecommendations: (childId) => apiFetch(`/tendency/${childId}/recommendations`),
};

// --- 학습 관련 API ---
export const learnAPI = {
    // 워크시트 관련
    getConceptsByDifficulty: (level) => apiFetch(`/worksheet/difficulty/${level}`),
    getConceptDetail: (id) => apiFetch(`/worksheet/${id}`),
    completeWorksheet: (userId, worksheetId, pointsEarned) => apiFetch('/user/worksheet/complete', {
        method: 'POST',
        body: JSON.stringify({ userId, worksheetId, pointsEarned }),
    }),
    getUserProgress: (userId) => apiFetch(`/user/${userId}/worksheet/progress`),
    
    // 퀴즈 관련
    getRandomQuizzes: (level) => apiFetch(`/quizzes/random?level=${level}`),
    submitQuiz: (quizData) => apiFetch('/quizzes/submit', {
        method: 'POST',
        body: JSON.stringify(quizData),
    }),
    getUserQuizProgress: (userId) => apiFetch(`/quizzes/user/${userId}/progress`),
    completeQuizSession: (sessionData) => apiFetch('/quizzes/session/complete', {
        method: 'POST',
        body: JSON.stringify(sessionData),
    }),
};

// --- 기사 관련 API ---
export const articleAPI = {
    getAll: () => apiFetch('/articles'),
    getById: (id) => apiFetch(`/articles/${id}`),
    getByCategory: (category) => apiFetch(`/articles?category=${category}`),
};

export default {
    authAPI,
    stockAPI,
    tradeAPI,
    userAPI,
    tendencyAPI,
    learnAPI,
    articleAPI,
}; 