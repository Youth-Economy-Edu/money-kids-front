import React, { useState } from 'react';
import './NotificationPermission.css';

const NotificationPermission = ({ isOpen, onClose, onAllow, onDeny }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAllow = async () => {
    setIsProcessing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onAllow();
        // 환영 알림 표시
        new Notification('🎉 Money Kids 알림 활성화!', {
          body: '실시간 주가 변동과 경제 뉴스 알림을 받을 수 있습니다.',
          icon: '/favicon.ico',
          tag: 'welcome-notification'
        });
      } else {
        onDeny();
      }
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      onDeny();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = () => {
    onDeny();
  };

  if (!isOpen) return null;

  return (
    <div className="notification-permission-overlay">
      <div className="notification-permission-modal">
        <div className="modal-header">
          <div className="notification-icon">🔔</div>
          <h2>알림 허용</h2>
          <p className="subtitle">더 나은 투자 경험을 위해 알림을 허용해주세요</p>
        </div>

        <div className="modal-content">
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">📈</span>
              <div>
                <h4>실시간 주가 변동 알림</h4>
                <p>보유 주식의 가격 변동을 즉시 확인하세요</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <span className="benefit-icon">⚠️</span>
              <div>
                <h4>중요 변동 특별 알림</h4>
                <p>±5% 이상의 큰 변동 시 즉시 알려드립니다</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <span className="benefit-icon">📰</span>
              <div>
                <h4>신규 경제 뉴스 알림</h4>
                <p>새로운 기업 뉴스와 시장 소식을 놓치지 마세요</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <span className="benefit-icon">🎯</span>
              <div>
                <h4>포트폴리오 관련 뉴스</h4>
                <p>보유 주식과 관련된 기업 뉴스를 우선 알림</p>
              </div>
            </div>
          </div>

          <div className="privacy-notice">
            <p>
              <span className="shield-icon">🛡️</span>
              알림은 브라우저에서만 표시되며, 개인정보는 안전하게 보호됩니다.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn-deny" 
            onClick={handleDeny}
            disabled={isProcessing}
          >
            나중에
          </button>
          <button 
            className={`btn-allow ${isProcessing ? 'processing' : ''}`}
            onClick={handleAllow}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                처리 중...
              </>
            ) : (
              <>
                <span className="bell-icon">🔔</span>
                알림 허용
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission; 