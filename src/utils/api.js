// API 유틸리티 - 통일된 에러 처리 및 캐싱
import axios from 'axios';

// 캐시 저장소
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 캐시 키 생성
const getCacheKey = (url, params = {}) => {
    const paramString = Object.keys(params).length > 0 ? 
        '?' + new URLSearchParams(params).toString() : '';
    return url + paramString;
};

// 캐시에서 데이터 가져오기
const getFromCache = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

// 캐시에 데이터 저장
const setCache = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

// 통일된 API 호출 함수
export const apiCall = async (url, options = {}) => {
    const { 
        useCache = true, 
        params = {}, 
        method = 'GET',
        data = null 
    } = options;

    const cacheKey = getCacheKey(url, params);

    // 캐시 확인 (GET 요청이고 캐시 사용 시)
    if (method === 'GET' && useCache) {
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
            console.log(`Cache hit for ${url}`);
            return { success: true, data: cachedData };
        }
    }

    try {
        const config = {
            method,
            url,
            params: method === 'GET' ? params : undefined,
            data: method !== 'GET' ? data : undefined,
            timeout: 10000 // 10초 타임아웃
        };

        const response = await axios(config);
        
        // API 응답 형식 확인
        if (response.data && typeof response.data.code !== 'undefined') {
            if (response.data.code === 200) {
                // 성공 시 캐시 저장 (GET 요청이고 캐시 사용 시)
                if (method === 'GET' && useCache) {
                    setCache(cacheKey, response.data.data);
                }
                
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.msg
                };
            } else {
                // API에서 에러 코드 반환
                return {
                    success: false,
                    error: response.data.msg || '알 수 없는 오류가 발생했습니다.',
                    code: response.data.code
                };
            }
        } else {
            // 예상하지 못한 응답 형식
            return {
                success: false,
                error: '서버 응답 형식이 올바르지 않습니다.',
                code: 'INVALID_RESPONSE'
            };
        }
    } catch (error) {
        console.error(`API Error for ${url}:`, error);
        
        if (error.code === 'ECONNABORTED') {
            return {
                success: false,
                error: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
                code: 'TIMEOUT'
            };
        } else if (error.response) {
            // 서버에서 응답을 받았지만 에러 상태
            return {
                success: false,
                error: error.response.data?.msg || '서버 오류가 발생했습니다.',
                code: error.response.status
            };
        } else if (error.request) {
            // 요청이 전송되었지만 응답을 받지 못함
            return {
                success: false,
                error: '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.',
                code: 'NETWORK_ERROR'
            };
        } else {
            // 기타 오류
            return {
                success: false,
                error: '예상치 못한 오류가 발생했습니다.',
                code: 'UNKNOWN_ERROR'
            };
        }
    }
};

// 특정 API 호출 함수들
export const tendencyAPI = {
    // 대시보드 데이터 (캐싱 권장)
    getDashboard: (childId) => 
        apiCall(`/api/parent/child/${childId}/dashboard`, { useCache: true }),
    
    // 성향 그래프 데이터
    getTendencyGraph: (childId) => 
        apiCall(`/api/parent/child/${childId}/tendency-graph`, { useCache: true }),
    
    // 성향 변화 추이
    getTendencyHistory: (childId) => 
        apiCall(`/api/parent/child/${childId}/tendency-history`, { useCache: true }),
    
    // 학습 진도
    getLearningProgress: (childId) => 
        apiCall(`/api/parent/child/${childId}/learning-progress`, { useCache: true }),
    
    // 투자 분석
    getInvestmentAnalysis: (childId) => 
        apiCall(`/api/parent/child/${childId}/investment-analysis`, { useCache: true }),
    
    // 활동 요약
    getActivitySummary: (childId, days = 7) => 
        apiCall(`/api/parent/child/${childId}/activity-summary`, { 
            params: { days },
            useCache: true 
        }),
    
    // 추천사항
    getRecommendations: (childId) => 
        apiCall(`/api/parent/child/${childId}/recommendations`, { useCache: true }),
    
    // 자녀 프로필
    getProfile: (childId) => 
        apiCall(`/api/parent/child/${childId}/profile`, { useCache: true })
};

// 캐시 관리 함수들
export const cacheUtils = {
    // 전체 캐시 클리어
    clearAll: () => {
        cache.clear();
        console.log('All cache cleared');
    },
    
    // 특정 URL 패턴의 캐시 클리어
    clearByPattern: (pattern) => {
        for (const [key] of cache) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
        console.log(`Cache cleared for pattern: ${pattern}`);
    },
    
    // 캐시 상태 확인
    getStatus: () => {
        return {
            size: cache.size,
            keys: Array.from(cache.keys())
        };
    }
};
