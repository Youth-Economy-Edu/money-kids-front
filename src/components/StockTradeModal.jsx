import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tradeAPI, publicAPI } from '../utils/apiClient';
import './StockTradeModal.css';

const StockTradeModal = ({ stock, onClose }) => {
  const { getCurrentUserId, getCurrentUserName, user } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [userPoints, setUserPoints] = useState(0);
  const [ownedQuantity, setOwnedQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const userId = getCurrentUserId(); // AuthContext에서 사용자 ID 가져오기
  const [isFavorite, setIsFavorite] = useState(false); // 관심 종목 상태 추가

  // 사용자 포인트 및 보유 주식 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 사용자 포인트 정보 가져오기
        const pointsResponse = await fetch(`http://localhost:8080/api/users/${userId}/points`);
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          setUserPoints(pointsData.data.points || 0);
        }
        
        // 보유 주식 정보 가져오기 (캐시 방지)
        const portfolioResponse = await fetch(`http://localhost:8080/api/users/${userId}/portfolio`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          const ownedStock = portfolioData.stocks?.find(s => s.stockName === stock.name);
          setOwnedQuantity(ownedStock?.quantity || 0);
          console.log(`${stock.name} 보유 수량:`, ownedStock?.quantity || 0);
        }
        
        // 관심 종목 여부 확인
        const favoritesResponse = await fetch(`http://localhost:8080/api/stocks/favorite?userId=${userId}`);
        
        // 응답이 204 No Content인 경우 빈 배열로 처리
        if (favoritesResponse.status === 204) {
          setIsFavorite(false);
          return;
        }
        
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          // 응답이 Stock 객체 배열인 경우
          const isFav = favoritesData.some(fav => String(fav.id) === String(stock.id));
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error('사용자 데이터 로드 오류:', err);
      }
    };

    if (stock) {
      fetchUserData();
    }
  }, [stock, userId]);

  // 관심 종목 토글 함수 추가
  const toggleFavorite = async () => {
    try {
      await publicAPI.toggleFavoriteStock(userId, stock.id);
      setIsFavorite(!isFavorite);
      console.log(`관심종목 ${!isFavorite ? '추가' : '제거'} 성공:`, stock.name);
    } catch (error) {
      console.error('관심 종목 설정 오류:', error);
      alert(`관심 종목 ${!isFavorite ? '추가' : '제거'} 실패: ${error.message}`);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setQuantity(1); // 탭 변경 시 수량 초기화
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleTrade = async () => {
    if (!stock || quantity <= 0) return;
    
    setLoading(true);
    
    try {
      const tradeType = activeTab === 'buy' ? '매수' : '매도';

      // 매수 시 포인트 확인
      if (activeTab === 'buy' && userPoints < stock.price * quantity) {
        alert('포인트가 부족합니다.');
        setLoading(false);
        return;
      }

      // 매도 시 보유 수량 확인
      if (activeTab === 'sell' && ownedQuantity < quantity) {
        alert('보유 수량이 부족합니다.');
        setLoading(false);
        return;
      }

      console.log('거래 요청:', { stockId: stock.id, quantity, type: tradeType });

      // 새로운 API 클라이언트 사용
      if (activeTab === 'buy') {
        await tradeAPI.buyStock(stock.id, quantity);
      } else {
        await tradeAPI.sellStock(stock.id, quantity);
      }

      // 거래 성공 시 로컬 거래내역 업데이트
      const tradeRecord = {
        stockId: stock.id,
        quantity: activeTab === 'buy' ? quantity : -quantity,
        date: new Date().toISOString().split('T')[0],
        price: stock.price
      };
      
      // 로컬 스토리지에 거래내역 추가
      const existingTrades = JSON.parse(localStorage.getItem('localTrades') || '[]');
      existingTrades.push(tradeRecord);
      localStorage.setItem('localTrades', JSON.stringify(existingTrades));
      
      alert(`${stock.name} ${quantity}주 ${tradeType} 완료!`);
      
      // 거래 성공 시 부모 컴포넌트에 새로고침 요청
      if (onClose) {
        onClose(true); // 거래 성공 시 true 전달하여 데이터 새로고침 요청
      }
    } catch (err) {
      console.error('거래 오류:', err);
      alert(`거래 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!stock) return null;

  const totalPrice = stock.price * quantity;
  const canBuy = userPoints >= totalPrice;
  const canSell = ownedQuantity >= quantity;

  return (
    <div className="modal-overlay">
      <div className="trade-modal">
        <div className="modal-header">
          {/* 관심 종목 버튼 추가 */}
          <button
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          <h2>{stock.name} 거래</h2>
          <button className="close-button" onClick={() => onClose(false)}>×</button>
        </div>
        
        <div className="stock-info">
          <div className="price-info">
            <div className="current-price">₩{stock.price.toLocaleString()}</div>
            <div className={`change-info price-${stock.changeType}`}>
              {stock.change > 0 ? '+' : ''}{stock.change.toLocaleString()} ({stock.changeRate}%)
            </div>
          </div>
        </div>
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'buy' ? 'active' : ''}`}
            onClick={() => handleTabChange('buy')}
          >
            매수
          </button>
          <button 
            className={`tab-button ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => handleTabChange('sell')}
          >
            매도
          </button>
        </div>
        
        <div className="trade-form">
          <div className="form-group">
            <label>수량</label>
            <div className="quantity-input">
              <button 
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={handleQuantityChange}
                min="1"
              />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>
          
          <div className="form-group">
            <label>총 {activeTab === 'buy' ? '매수' : '매도'}금액</label>
            <div className="total-price">₩{totalPrice.toLocaleString()}</div>
          </div>
          
          <div className="user-info">
            {activeTab === 'buy' ? (
              <>
                <div className="info-item">
                  <span>보유 포인트</span>
                  <span>₩{userPoints.toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span>거래 후 포인트</span>
                  <span>₩{(userPoints - totalPrice).toLocaleString()}</span>
                </div>
              </>
            ) : (
              <>
                <div className="info-item">
                  <span>보유 수량</span>
                  <span>{ownedQuantity}주</span>
                </div>
                <div className="info-item">
                  <span>거래 후 수량</span>
                  <span>{ownedQuantity - quantity}주</span>
                </div>
              </>
            )}
          </div>
          
          <button 
            className={`trade-button ${activeTab === 'buy' ? 'buy' : 'sell'}`}
            onClick={handleTrade}
            disabled={loading || (activeTab === 'buy' && !canBuy) || (activeTab === 'sell' && !canSell)}
          >
            {loading ? '처리 중...' : activeTab === 'buy' ? '매수하기' : '매도하기'}
          </button>
          
          {activeTab === 'buy' && !canBuy && (
            <div className="error-message">포인트가 부족합니다.</div>
          )}
          
          {activeTab === 'sell' && !canSell && (
            <div className="error-message">보유 수량이 부족합니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockTradeModal;