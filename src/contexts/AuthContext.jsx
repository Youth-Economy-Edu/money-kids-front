import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 초기화 시 localStorage에서 사용자 정보 로드
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedUserId = localStorage.getItem('userId');
                const storedUserName = localStorage.getItem('userName');
                
                if (storedUserId) {
                    setUser({
                        id: storedUserId,
                        name: storedUserName || storedUserId,
                        isAuthenticated: true
                    });
                } else {
                    // 로그인하지 않은 상태로 설정
                    setUser(null);
                }
            } catch (error) {
                console.error('인증 초기화 오류:', error);
                // 오류 발생 시 로그인하지 않은 상태로 설정
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // 로그인 함수
    const login = (userData) => {
        try {
            const userInfo = {
                id: userData.id || userData.userId,
                name: userData.name || userData.userName || userData.id,
                isAuthenticated: true,
                ...userData
            };
            
            setUser(userInfo);
            localStorage.setItem('userId', userInfo.id);
            localStorage.setItem('userName', userInfo.name);
            
            console.log('로그인 성공:', userInfo);
            return true;
        } catch (error) {
            console.error('로그인 처리 오류:', error);
            return false;
        }
    };

    // 로그아웃 함수
    const logout = () => {
        try {
            setUser(null);
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            console.log('로그아웃 완료');
            return true;
        } catch (error) {
            console.error('로그아웃 처리 오류:', error);
            return false;
        }
    };

    // 사용자 정보 업데이트
    const updateUser = (updates) => {
        try {
            if (!user) return false;
            
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            
            // localStorage 업데이트
            if (updates.id) localStorage.setItem('userId', updates.id);
            if (updates.name) localStorage.setItem('userName', updates.name);
            
            console.log('사용자 정보 업데이트:', updatedUser);
            return true;
        } catch (error) {
            console.error('사용자 정보 업데이트 오류:', error);
            return false;
        }
    };

    // 현재 사용자 ID 가져오기 (하위 호환성)
    const getCurrentUserId = () => {
        if (!user?.id) {
            console.warn('사용자가 로그인되지 않았습니다.');
            return null;
        }
        return user.id;
    };

    // 현재 사용자 이름 가져오기
    const getCurrentUserName = () => {
        if (!user?.name) {
            console.warn('사용자가 로그인되지 않았습니다.');
            return null;
        }
        return user.name;
    };

    // 인증 상태 확인
    const isAuthenticated = () => {
        return user?.isAuthenticated || false;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateUser,
        getCurrentUserId,
        getCurrentUserName,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 