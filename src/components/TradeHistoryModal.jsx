import React, { useState, useEffect } from 'react';
import './TradeHistoryModal.css';

const TradeHistoryModal = ({ isOpen, onClose }) => {
  const [tradeHistory, setTradeHistory] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 거래내역 가져오기
  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. 거래내역 가져오기
      const data = await fetch('http://localhost:8080/api/stocks/trade/history').then(res => res.json());
      
      // 로컬 거래내역 추가
      const localTrades = JSON.parse(localStorage.getItem('localTrades') || '[]');
      const allData = [...data, ...localTrades];
      
      // 2. 주식 정보 가져오기 (이름 매핑용)
      const stocksResponse = await fetch('http://localhost:8080/api/stocks');
      const stocksData = await stocksResponse.json();
      
      // 3. 거래내역에 주식 이름 매핑 및 필터링
      let filteredData = allData;
      
      // 필터 적용
      if (filterType === 'buy') {
        filteredData = allData.filter(trade => trade.quantity > 0);
      } else if (filterType === 'sell') {
        filteredData = allData.filter(trade => trade.quantity < 0);
      }
      
      const enrichedData = filteredData.map(trade => {
        const stockInfo = stocksData.find(stock => stock.id === trade.stockId);
        return {
          ...trade,
          stockName: stockInfo ? stockInfo.name : trade.stockId,
          stockCode: stockInfo ? stockInfo.code : '',
          price: stockInfo ? stockInfo.price : 0,
          tradeType: trade.quantity > 0 ? 'BUY' : 'SELL',
          tradeDate: trade.date
        };
      });
      
      // 최신순으로 정렬 (날짜 기준 내림차순)
      const sortedData = enrichedData.sort((a, b) => {
        const dateA = new Date(a.date || a.tradeDate);
        const dateB = new Date(b.date || b.tradeDate);
        return dateB - dateA; // 최신 날짜가 먼저 오도록
      });
      
      setTradeHistory(sortedData);
    } catch (err) {
      console.error('거래내역 로드 오류:', err);
      setError('거래내역을 불러오는데 실패했습니다.');
      setTradeHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTradeHistory();
    }
  }, [isOpen, filterType]);

  const getTradeTypeText = (tradeType) => {
    switch (tradeType) {
      case 'BUY': return '매수';
      case 'SELL': return '매도';
      default: return '거래';
    }
  };

  const getTradeTypeStyle = (tradeType) => {
    switch (tradeType) {
      case 'BUY': return 'buy';
      case 'SELL': return 'sell';
      default: return '';
    }
  };

  // 날짜/시간 포맷팅 함수
  const formatTradeDate = (dateString) => {
    if (!dateString) return '정보 없음';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '정보 없음';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('날짜 파싱 오류:', error);
      return '정보 없음';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trade-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>거래내역</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              전체
            </button>
            <button 
              className={`filter-tab ${filterType === 'buy' ? 'active' : ''}`}
              onClick={() => setFilterType('buy')}
            >
              매수
            </button>
            <button 
              className={`filter-tab ${filterType === 'sell' ? 'active' : ''}`}
              onClick={() => setFilterType('sell')}
            >
              매도
            </button>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>거래내역을 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={fetchTradeHistory} className="retry-button">
                다시 시도
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="trade-list">
              {tradeHistory.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-chart-line empty-icon"></i>
                  <p>거래내역이 없습니다.</p>
                  <p className="empty-subtitle">주식 거래를 시작해보세요!</p>
                </div>
              ) : (
                tradeHistory.map((trade, index) => (
                  <div key={index} className="trade-item">
                    <div className="trade-main-info">
                      <div className="trade-stock-info">
                        <h3 className="stock-name">{trade.stockName || trade.stockId || '알 수 없음'}</h3>
                        <span className="stock-code">{trade.stockCode || trade.stockId || ''}</span>
                      </div>
                      <div className={`trade-type ${getTradeTypeStyle(trade.quantity > 0 ? 'BUY' : 'SELL')}`}>
                        {getTradeTypeText(trade.quantity > 0 ? 'BUY' : 'SELL')}
                      </div>
                    </div>
                    
                    <div className="trade-details">
                      <div className="trade-detail-item">
                        <span className="detail-label">수량</span>
                        <span className="detail-value">{Math.abs(trade.quantity || 0).toLocaleString()}주</span>
                      </div>
                      <div className="trade-detail-item">
                        <span className="detail-label">단가</span>
                        <span className="detail-value">₩{(trade.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="trade-detail-item">
                        <span className="detail-label">총액</span>
                        <span className="detail-value total-amount">
                          ₩{(Math.abs(trade.quantity || 0) * (trade.price || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="trade-detail-item">
                        <span className="detail-label">거래시간</span>
                        <span className="detail-value">{formatTradeDate(trade.date || trade.tradeDate)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistoryModal; 