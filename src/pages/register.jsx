import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';
import NotificationPermission from '../components/NotificationPermission';
import { API_BASE_URL } from '../utils/config';
import './Register/register.css';
import { useNotification } from '../contexts/NotificationContext';

function Register() {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    name: '',
    birth: '',
    phone: '',
    email: '',
    role: 'CHILD'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { notificationPermission, requestPermission } = useNotification();

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 해당 필드의 에러 메시지 지우기
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id) newErrors.id = '아이디를 입력해주세요.';
    if (!formData.password) newErrors.password = '비밀번호를 입력해주세요.';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    if (!formData.name) newErrors.name = '이름을 입력해주세요.';
    if (!formData.birth) newErrors.birth = '생년월일을 입력해주세요.';
    if (!formData.phone) newErrors.phone = '전화번호를 입력해주세요.';
    if (!formData.email) newErrors.email = '이메일을 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        login(data.user);
        showToast('회원가입이 완료되었습니다! 🎉', 'success');
        
        // 알림 권한 확인 후 모달 표시
        setTimeout(() => {
          if (notificationPermission === 'default') {
            setShowNotificationModal(true);
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        showToast(errorData.message || '회원가입에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      showToast('서버 연결에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPermission = async () => {
    const permission = await requestPermission();
    if (permission === 'granted') {
      showToast('알림이 활성화되었습니다! 🔔', 'success');
    }
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
            <label htmlFor="id">아이디</label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className={errors.id ? 'error' : ''}
              placeholder="아이디를 입력하세요"
            />
            {errors.id && <span className="error-message">{errors.id}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="비밀번호를 다시 입력하세요"
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="이름을 입력하세요"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="birth">생년월일</label>
            <input
              type="date"
              id="birth"
              name="birth"
              value={formData.birth}
              onChange={handleChange}
              className={errors.birth ? 'error' : ''}
            />
            {errors.birth && <span className="error-message">{errors.birth}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="전화번호를 입력하세요"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="이메일을 입력하세요"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role">역할</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="CHILD">학생</option>
              <option value="PARENT">부모</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? '가입 중...' : '회원가입'}
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
        onAllow={handleNotificationPermission}
        onDeny={handleNotificationDeny}
      />
    </div>
  );
}

export default Register; 