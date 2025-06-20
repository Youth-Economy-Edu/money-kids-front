import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/apiService';
import './ServerStatus.css';

const ServerStatus = () => {
  const [serverStatus, setServerStatus] = useState('checking'); // checking, online, offline
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    checkServerStatus();
    // 5분마다 서버 상태 체크
    const interval = setInterval(checkServerStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      await apiRequest('/api/health', { method: 'GET' });
      setServerStatus('online');
      setShowBanner(false);
    } catch (error) {
      if (error.message.includes('서버에 연결할 수 없습니다')) {
        setServerStatus('offline');
        setShowBanner(true);
      } else {
        setServerStatus('online');
        setShowBanner(false);
      }
    }
  };

  if (!showBanner) return null;

  return (
    <div className="server-status-banner">
      <div className="banner-content">
        <div className="banner-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <div className="banner-message">
          <strong>백엔드 서버에 연결할 수 없습니다</strong>
          <p>일부 기능이 제한될 수 있습니다. 개발 중인 mock 데이터를 사용합니다.</p>
        </div>
        <button 
          className="banner-close"
          onClick={() => setShowBanner(false)}
          aria-label="닫기"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default ServerStatus; 