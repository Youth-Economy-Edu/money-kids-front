import React, { createContext, useState, useContext, useEffect } from 'react';

// AuthContext 생성
const AuthContext = createContext();

// AuthProvider 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedUserId = localStorage.getItem('currentUserId');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // userId도 저장되어 있는지 확인
        if (!savedUserId && userData.id) {
          localStorage.setItem('currentUserId', userData.id);
        }
      } catch (error) {
        console.error('사용자 정보 복원 실패:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('currentUserId');
      }
    }
    setLoading(false);
  }, []);

  // 로그인 함수
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // userId 별도로 저장 (백엔드 API 호출용)
    if (userData.id) {
      localStorage.setItem('currentUserId', userData.id);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
  };

  // 사용자 정보 업데이트 함수
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // userId가 변경된 경우 업데이트
    if (userData.id && userData.id !== user?.id) {
      localStorage.setItem('currentUserId', userData.id);
    }
  };

  // 인증 여부 확인
  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext }; 