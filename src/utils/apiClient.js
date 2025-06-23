// API 클라이언트 - 인증 헤더 자동 추가
import { useAuth } from '../contexts/AuthContext';

// 기본 인증 정보 (백엔드 테스트용)
const DEFAULT_CREDENTIALS = {
    username: 'testUser',
    password: 'testPassword'
};

// 인증 헤더 생성
const createAuthHeaders = (additionalHeaders = {}) => {
    const credentials = btoa(`${DEFAULT_CREDENTIALS.username}:${DEFAULT_CREDENTIALS.password}`);
    
    return {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
        ...additionalHeaders
    };
};

// 인증이 필요한 API 호출을 위한 헬퍼 함수
const authenticatedFetch = async (url, options = {}) => {
    // 현재 로그인한 사용자 ID 가져오기
    const userId = localStorage.getItem('userId');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-User-Id': userId || 'master' // 헤더에 사용자 ID 추가
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 오류 (${response.status}): ${errorText}`);
    }
    
    return response;
};

// 주식 거래 API
export const tradeAPI = {
    // 매수
    buyStock: async (stockId, quantity) => {
        const userId = localStorage.getItem('userId') || 'master';
        const response = await authenticatedFetch(`http://localhost:8080/api/stocks/trade/buy?userId=${userId}`, {
            method: 'POST',
            body: JSON.stringify({
                stockId: stockId.toString(),
                quantity: quantity
            })
        });
        return response;
    },

    // 매도
    sellStock: async (stockId, quantity) => {
        const userId = localStorage.getItem('userId') || 'master';
        const response = await authenticatedFetch(`http://localhost:8080/api/stocks/trade/sell?userId=${userId}`, {
            method: 'POST',
            body: JSON.stringify({
                stockId: stockId.toString(),
                quantity: quantity
            })
        });
        return response;
    },

    // 잔고 조회
    getBalance: async () => {
        const userId = localStorage.getItem('userId') || 'master';
        const response = await authenticatedFetch(`http://localhost:8080/api/stocks/trade/balance?userId=${userId}`);
        return response.json();
    },

    // 거래 내역 조회
    getTradeHistory: async () => {
        const userId = localStorage.getItem('userId') || 'master';
        const response = await authenticatedFetch(`http://localhost:8080/api/stocks/trade/history?userId=${userId}`);
        return response.json();
    },

    // 특정 주식 주문 상세 조회
    getOrderDetail: async (stockId) => {
        const userId = localStorage.getItem('userId') || 'master';
        const response = await authenticatedFetch(`http://localhost:8080/api/stocks/trade/order/${stockId}?userId=${userId}`);
        return response.json();
    }
};

// 일반 API (인증 불필요)
export const publicAPI = {
    // 주식 목록 조회
    getStocks: async () => {
        const response = await fetch('http://localhost:8080/api/stocks');
        if (!response.ok) {
            throw new Error(`API 오류: ${response.status}`);
        }
        return response.json();
    },

    // 사용자 포인트 조회
    getUserPoints: async (userId) => {
        const response = await fetch(`http://localhost:8080/api/users/${userId}/points`);
        if (!response.ok) {
            throw new Error(`포인트 정보 API 오류: ${response.status}`);
        }
        return response.json();
    },

    // 사용자 포트폴리오 조회
    getUserPortfolio: async (userId) => {
        const response = await fetch(`http://localhost:8080/api/users/${userId}/portfolio`);
        if (!response.ok) {
            throw new Error(`포트폴리오 정보 API 오류: ${response.status}`);
        }
        return response.json();
    },

    // 관심 종목 조회
    getFavoriteStocks: async (userId) => {
        const response = await fetch(`http://localhost:8080/api/stocks/favorite?userId=${userId}`);
        
        if (response.status === 204) {
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`관심 종목 API 오류: ${response.status}`);
        }
        
        return response.json();
    },

    // 관심 종목 토글
    toggleFavoriteStock: async (userId, stockId) => {
        const response = await fetch('http://localhost:8080/api/stocks/favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                stockId: stockId
            })
        });

        if (!response.ok) {
            throw new Error(`관심 종목 설정 오류: ${response.status}`);
        }

        return response;
    }
};

export default { authenticatedFetch, tradeAPI, publicAPI }; 