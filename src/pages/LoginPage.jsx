import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // 카카오 SDK 로드
    if (!window.Kakao) {
      const script = document.createElement('script');
      script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login(formData);
      
      if (result.success) {
        login(result.user);
        navigate('/dashboard');
      } else {
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.kakaoLogin();
      
      if (result.success) {
        login(result.user);
        navigate('/dashboard');
      } else {
        setError('카카오 로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '카카오 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.googleLogin();
      
      if (result.success) {
        login(result.user);
        navigate('/dashboard');
      } else {
        setError('구글 로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login({
        email: 'demo@student.com',
        password: 'demo123'
      });
      
      if (result.success) {
        login(result.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('체험하기 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="brand-section">
            <div className="brand-icon">💰</div>
            <h1>Money Kids</h1>
            <p>청소년을 위한 경제교육 플랫폼</p>
          </div>
        </div>

        <div className="login-form-section">
          <h2>로그인</h2>
          <p>계정에 로그인하여 학습을 시작하세요</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="social-login-section">
            <button 
              className="social-btn kakao-btn"
              onClick={handleKakaoLogin}
              disabled={isLoading}
            >
              <span className="social-icon">💬</span>
              카카오로 로그인
            </button>
            
            <button 
              className="social-btn google-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <span className="social-icon">🔍</span>
              구글로 로그인
            </button>
          </div>

          <div className="divider">
            <span>또는</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="이메일을 입력하세요"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="demo-section">
            <h3>바로 체험해보기</h3>
            <p>회원가입 없이 데모 계정으로 체험해보세요</p>
            <button 
              className="demo-btn"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              🎯 체험하기
            </button>
          </div>

          <div className="signup-link">
            <p>
              아직 계정이 없으신가요?
              <button 
                className="link-btn"
                onClick={handleSignupClick}
                disabled={isLoading}
              >
                회원가입
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 