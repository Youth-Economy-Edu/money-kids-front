import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import NotificationPermission from '../components/NotificationPermission';
import './register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: ''
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

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      setIsLoading(false);
      return;
    }

    // 나이 검증
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 150) {
      showToast('올바른 나이를 입력해주세요.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: age
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 회원가입 성공
        login(data.user);
        showToast('회원가입이 완료되었습니다! 🎉', 'success');
        
        // 알림 권한 확인 후 모달 표시
        setTimeout(() => {
          if (Notification.permission === 'default') {
            setShowNotificationModal(true);
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        showToast(data.message || '회원가입에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
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
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h1>회원가입</h1>
          <p>Money Kids와 함께 경제 공부를 시작해보세요!</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="이름을 입력하세요"
            />
          </div>

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
            <label htmlFor="age">나이</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="150"
              placeholder="나이를 입력하세요"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            이미 계정이 있으신가요? 
            <Link to="/login" className="login-link">로그인</Link>
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

export default Register; 