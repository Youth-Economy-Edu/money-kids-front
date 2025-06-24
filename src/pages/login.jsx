import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import NotificationPermission from '../components/NotificationPermission';
import './login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공
        login(data.user);
        showToast('로그인이 완료되었습니다! 🎉', 'success');
        
        // 알림 권한 확인 후 모달 표시
        setTimeout(() => {
          if (Notification.permission === 'default') {
            setShowNotificationModal(true);
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        showToast(data.message || '로그인에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      showToast('서버 연결에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationAllow = () => {
    setShowNotificationModal(false);
    localStorage.setItem('notificationPermissionRequested', 'true');
    navigate('/');
  };

  const handleNotificationDeny = () => {
    setShowNotificationModal(false);
    localStorage.setItem('notificationPermissionRequested', 'true');
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>로그인</h1>
          <p>Money Kids에 오신 것을 환영합니다!</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            계정이 없으신가요? 
            <Link to="/register" className="register-link">회원가입</Link>
          </p>
        </div>
      </div>

      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <NotificationPermission
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onAllow={handleNotificationAllow}
        onDeny={handleNotificationDeny}
      />
    </div>
  );
}

export default Login; 