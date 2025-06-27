import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Login/login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // 실제 로그인 API 연동 필요
    const dummyUser = { id: 'testuser', name: '테스트' };
    login(dummyUser);
    navigate('/home');
  };

  return (
    <div className="login-container">
      <button onClick={handleLogin}>로그인</button>
    </div>
  );
};

export default Login; 