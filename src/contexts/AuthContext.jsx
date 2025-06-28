import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 초기 로드시 저장된 사용자 정보 확인
    useEffect(() => {
        const checkStoredUser = async () => {
            const storedUserId = localStorage.getItem('userId');
            if (storedUserId) {
                try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
                    
                    // 백엔드에서 사용자 정보 재확인
                    const response = await fetch(`${API_BASE_URL}/users/${storedUserId}`);
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                        
                        // 성향 분석 정보도 함께 로드 (캐싱)
                        const tendencyResponse = await fetch(`${API_BASE_URL}/parent/child/${storedUserId}/tendency-graph`);
                        if (tendencyResponse.ok) {
                            const tendencyData = await tendencyResponse.json();
                            setUser(prev => ({ ...prev, tendencyData }));
                        }
                    } else {
                        // 유효하지 않은 사용자 ID인 경우 로컬 스토리지 정리
                        localStorage.removeItem('userId');
                    }
                } catch (error) {
                    console.error('사용자 정보 확인 실패:', error);
                    localStorage.removeItem('userId');
                }
            }
            setIsLoading(false);
        };

        checkStoredUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('userId', userData.id);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userId');
    };

    const getCurrentUserId = () => {
        return user?.id || localStorage.getItem('userId');
    };

    const getCurrentUserName = () => {
        return user?.name || localStorage.getItem('userName') || '사용자';
    };

    const isAuthenticated = () => {
        return user !== null && user.id && localStorage.getItem('userId');
    };

    const requireAuth = () => {
        if (!isAuthenticated()) {
            throw new Error('인증이 필요합니다.');
        }
        return true;
    };

    const value = {
        user,
        login,
        logout,
        getCurrentUserId,
        getCurrentUserName,
        isAuthenticated,
        requireAuth,
        isLoading,
        loading: isLoading // 호환성을 위한 별칭
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 