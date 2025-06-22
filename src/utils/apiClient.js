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

// 거래 API 호출 (인증 제거됨)
export const authenticatedFetch = async (url, options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        console.log('API 요청:', url, defaultOptions);
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            // 상세한 오류 정보 수집
            let errorMessage = `API 오류: ${response.status} ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage += ` - ${errorData.message}`;
                }
                console.error('백엔드 오류 상세:', errorData);
            } catch (e) {
                // JSON 파싱 실패 시 텍스트로 시도
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage += ` - ${errorText}`;
                    }
                } catch (e2) {
                    // 무시
                }
            }
            
            throw new Error(errorMessage);
        }
        
        return response;
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
};

// 주식 거래 API
export const tradeAPI = {
    // 매수
    buyStock: async (stockId, quantity) => {
        const response = await authenticatedFetch('http://localhost:8080/api/stocks/trade/buy', {
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
        const response = await authenticatedFetch('http://localhost:8080/api/stocks/trade/sell', {
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
        const response = await authenticatedFetch('http://localhost:8080/api/stocks/trade/balance');
        return response.json();
    },

    // 거래 내역 조회
    getTradeHistory: async () => {
        const response = await authenticatedFetch('http://localhost:8080/api/stocks/trade/history');
        return response.json();
    },

    // 특정 주식 주문 상세 조회
    getOrderDetail: async (stockId) => {
        const response = await authenticatedFetch(`http://localhost:8080/api/stocks/trade/order/${stockId}`);
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