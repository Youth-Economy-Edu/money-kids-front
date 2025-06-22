import React, { useEffect, useState } from 'react';
import './TradeSuccessModal.css';

const TradeSuccessModal = ({ isOpen, tradeType, stockName, quantity, onClose }) => {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    console.log('TradeSuccessModal useEffect 실행됨');
    console.log('TradeSuccessModal 상태:', { isOpen, tradeType, stockName, quantity });
    console.log('TradeSuccessModal Props:', { isOpen, tradeType, stockName, quantity, onClose });
    
    if (isOpen) {
      console.log('모달이 열렸습니다. 폭죽 효과 시작!');
      setShowFireworks(true);
      // 3초 후 자동으로 닫기
      const timer = setTimeout(() => {
        console.log('3초 후 모달 자동 닫기');
        onClose();
      }, 3000);
      
      return () => {
        console.log('타이머 정리');
        clearTimeout(timer);
      };
    } else {
      console.log('모달이 닫혔습니다. 폭죽 효과 중지');
      setShowFireworks(false);
    }
  }, [isOpen, tradeType, stockName, quantity, onClose]);

  console.log('TradeSuccessModal 렌더링:', isOpen);

  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay">
      {/* 폭죽 효과 */}
      {showFireworks && (
        <div className="fireworks-container">
          <div className="firework firework-1">
            <div className="explosion">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="spark" style={{ '--i': i }}></span>
              ))}
            </div>
          </div>
          <div className="firework firework-2">
            <div className="explosion">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="spark" style={{ '--i': i }}></span>
              ))}
            </div>
          </div>
          <div className="firework firework-3">
            <div className="explosion">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="spark" style={{ '--i': i }}></span>
              ))}
            </div>
          </div>
          <div className="firework firework-4">
            <div className="explosion">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="spark" style={{ '--i': i }}></span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 성공 메시지 */}
      <div className={`success-modal ${tradeType === '매수' ? 'buy' : 'sell'}`}>
        <div className="success-content">
          <div className="success-icon">
            {tradeType === '매수' ? '🎉' : '💰'}
          </div>
          <h2 className="success-title">
            {tradeType === '매수' ? '매수 성공!' : '매도 성공!'}
          </h2>
          <div className="success-details">
            <p className="stock-info">
              <span className="stock-name">{stockName}</span>
              <span className="quantity">{quantity}주</span>
            </p>
            <p className="success-message">
              {tradeType === '매수' 
                ? '주문이 성공적으로 완료되었어요!' 
                : '매도가 성공적으로 완료되었어요!'}
            </p>
          </div>
          <div className="celebration-text">
            ✨ 축하합니다! ✨
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeSuccessModal; 