import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { investmentService } from '../services/investmentService';
import './InvestmentPage.css';

const InvestmentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('market');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState({
    totalAsset: 1000000,
    cash: 1000000,
    stocks: []
  });
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModal, setTradeModal] = useState({
    isOpen: false,
    type: 'buy',
    stock: null,
    quantity: 1
  });

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 병렬로 데이터 로드
      const [stocksResult, portfolioResult, watchlistResult] = await Promise.all([
        investmentService.getAllStocks(),
        investmentService.getPortfolio(user.id),
        investmentService.getWatchlist(user.id)
      ]);

      if (stocksResult.success) {
        setStocks(stocksResult.stocks);
      }
      
      if (portfolioResult.success) {
        setPortfolio(portfolioResult.portfolio);
      }
      
      if (watchlistResult.success) {
        setWatchlist(watchlistResult.watchlist);
      }
    } catch (err) {
      console.error('데이터 로딩 오류:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock => 
    selectedCategory === 'all' || stock.category === selectedCategory
  );

  const toggleWatchlist = async (stock) => {
    if (!user) return;
    
    try {
      const result = await investmentService.toggleWatchlist(user.id, stock.code);
      
      if (result.success) {
        // 위시리스트 다시 로드
        const watchlistResult = await investmentService.getWatchlist(user.id);
        if (watchlistResult.success) {
          setWatchlist(watchlistResult.watchlist);
        }
      }
    } catch (err) {
      console.error('위시리스트 토글 오류:', err);
    }
  };

  const openTradeModal = (stock, type) => {
    setTradeModal({
      isOpen: true,
      type: type,
      stock: stock,
      quantity: 1
    });
  };

  const closeTradeModal = () => {
    setTradeModal({
      isOpen: false,
      type: 'buy',
      stock: null,
      quantity: 1
    });
  };

  const handleTrade = async () => {
    if (!user || !tradeModal.stock) return;
    
    const { type, stock, quantity } = tradeModal;
    const totalPrice = stock.price * quantity;
    
    // 매수 시 잔액 확인
    if (type === 'buy' && totalPrice > portfolio.cash) {
      alert('잔액이 부족합니다.');
      return;
    }
    
    // 매도 시 보유 수량 확인
    if (type === 'sell') {
      const portfolioStocks = portfolio?.stocks || [];
      const holding = portfolioStocks.find(s => s.code === stock.code);
      if (!holding || holding.quantity < quantity) {
        alert('보유 수량이 부족합니다.');
        return;
      }
    }
    
    try {
      const result = await investmentService.tradeStock({
        userId: user.id,
        stockCode: stock.code,
        tradeType: type.toUpperCase(),
        quantity: quantity,
        price: stock.price
      });
      
      if (result.success) {
        alert(result.message);
        
        // 포트폴리오 다시 로드
        const portfolioResult = await investmentService.getPortfolio(user.id);
        if (portfolioResult.success) {
          setPortfolio(portfolioResult.portfolio);
        }
        
        closeTradeModal();
      }
    } catch (err) {
      console.error('거래 오류:', err);
      alert(err.message || '거래 중 오류가 발생했습니다.');
    }
  };

  const calculateReturn = (stock) => {
    const avgPrice = stock.avgPrice || stock.price;
    const returnRate = ((stock.price - avgPrice) / avgPrice * 100).toFixed(2);
    const returnAmount = (stock.price - avgPrice) * stock.quantity;
    return { rate: returnRate, amount: returnAmount };
  };

  // 안전한 계산을 위한 방어 코드 추가
  const portfolioStocks = portfolio?.stocks || [];
  const portfolioCash = portfolio?.cash || 0;
  
  const totalStockValue = portfolioStocks.reduce((sum, stock) => 
    sum + (stock.price * stock.quantity), 0
  );
  const totalAssetValue = portfolioCash + totalStockValue;
  const totalReturnRate = ((totalAssetValue - 1000000) / 1000000 * 100).toFixed(2);

  const handleStockClick = (stockCode) => {
    navigate(`/stock/${stockCode}`);
  };

  if (isLoading) {
    return (
      <div className="investment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="investment-page">
      <div className="page-header">
        <h1>모의 투자</h1>
        <p>가상의 돈으로 실제 투자를 연습해보세요</p>
      </div>

      {/* 포트폴리오 요약 */}
      <div className="portfolio-summary">
        <div className="summary-card">
          <div className="summary-label">총 자산</div>
          <div className="summary-value">₩{totalAssetValue.toLocaleString()}</div>
          <div className={`summary-change ${totalReturnRate >= 0 ? 'positive' : 'negative'}`}>
            {totalReturnRate >= 0 ? '+' : ''}{totalReturnRate}%
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-label">보유 현금</div>
          <div className="summary-value">₩{portfolioCash.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">주식 평가액</div>
          <div className="summary-value">₩{totalStockValue.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">수익률</div>
          <div className={`summary-value ${totalReturnRate >= 0 ? 'positive' : 'negative'}`}>
            {totalReturnRate >= 0 ? '+' : ''}{totalReturnRate}%
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          주식 시장
        </button>
        <button 
          className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          내 포트폴리오
        </button>
        <button 
          className={`tab-btn ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          관심 종목
        </button>
      </div>

      {/* 주식 시장 탭 */}
      {activeTab === 'market' && (
        <div className="market-section">
          <div className="category-filter">
            <button 
              className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              전체
            </button>
            <button 
              className={`filter-btn ${selectedCategory === 'IT' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('IT')}
            >
              IT/기술
            </button>
            <button 
              className={`filter-btn ${selectedCategory === 'Medical' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Medical')}
            >
              의료/바이오
            </button>
          </div>

          <div className="stock-list">
            {filteredStocks.map(stock => (
              <div key={stock.code} className="stock-card">
                <div 
                  className="stock-header clickable"
                  onClick={() => handleStockClick(stock.code)}
                >
                  <div className="stock-info">
                    <h3>{stock.name}</h3>
                    <span className="stock-code">{stock.code}</span>
                  </div>
                  <button 
                    className={`watchlist-btn ${watchlist.some(w => w.code === stock.code) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(stock);
                    }}
                  >
                    {watchlist.some(w => w.code === stock.code) ? '★' : '☆'}
                  </button>
                </div>
                
                <div 
                  className="stock-price clickable"
                  onClick={() => handleStockClick(stock.code)}
                >
                  <div className="current-price">₩{stock.price.toLocaleString()}</div>
                  <div className={`price-change ${stock.changeRate >= 0 ? 'positive' : 'negative'}`}>
                    {stock.changeRate >= 0 ? '+' : ''}{stock.change?.toLocaleString() || 0}
                    ({stock.changeRate >= 0 ? '+' : ''}{stock.changeRate}%)
                  </div>
                </div>
                
                <div className="stock-actions">
                  <button 
                    className="buy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTradeModal(stock, 'buy');
                    }}
                  >
                    매수
                  </button>
                  <button 
                    className="sell-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTradeModal(stock, 'sell');
                    }}
                  >
                    매도
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 포트폴리오 탭 */}
      {activeTab === 'portfolio' && (
        <div className="portfolio-section">
          {portfolioStocks.length === 0 ? (
            <div className="empty-portfolio">
              <p>아직 보유한 주식이 없습니다.</p>
              <button onClick={() => setActiveTab('market')}>주식 시장 둘러보기</button>
            </div>
          ) : (
            <div className="portfolio-list">
              {portfolioStocks.map(stock => {
                const returns = calculateReturn(stock);
                return (
                  <div key={stock.code} className="portfolio-item">
                    <div className="portfolio-stock-info">
                      <h3>{stock.name}</h3>
                      <span className="stock-code">{stock.code}</span>
                    </div>
                    
                    <div className="portfolio-details">
                      <div className="detail-item">
                        <span className="label">보유수량</span>
                        <span className="value">{stock.quantity}주</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">평균단가</span>
                        <span className="value">₩{stock.avgPrice?.toLocaleString() || stock.price.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">현재가</span>
                        <span className="value">₩{stock.price.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">평가금액</span>
                        <span className="value">₩{(stock.price * stock.quantity).toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">수익률</span>
                        <span className={`value ${returns.rate >= 0 ? 'positive' : 'negative'}`}>
                          {returns.rate >= 0 ? '+' : ''}{returns.rate}%
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="sell-btn"
                      onClick={() => openTradeModal(stock, 'sell')}
                    >
                      매도
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 관심 종목 탭 */}
      {activeTab === 'watchlist' && (
        <div className="watchlist-section">
          {watchlist.length === 0 ? (
            <div className="empty-watchlist">
              <p>관심 종목이 없습니다.</p>
              <button onClick={() => setActiveTab('market')}>주식 시장 둘러보기</button>
            </div>
          ) : (
            <div className="stock-list">
              {watchlist.map(stock => (
                <div key={stock.code} className="stock-card">
                  <div 
                    className="stock-header clickable"
                    onClick={() => handleStockClick(stock.code)}
                  >
                    <div className="stock-info">
                      <h3>{stock.name}</h3>
                      <span className="stock-code">{stock.code}</span>
                    </div>
                    <button 
                      className="watchlist-btn active"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(stock);
                      }}
                    >
                      ★
                    </button>
                  </div>
                  
                  <div 
                    className="stock-price clickable"
                    onClick={() => handleStockClick(stock.code)}
                  >
                    <div className="current-price">₩{stock.price.toLocaleString()}</div>
                    <div className={`price-change ${stock.changeRate >= 0 ? 'positive' : 'negative'}`}>
                      {stock.changeRate >= 0 ? '+' : ''}{stock.change?.toLocaleString() || 0}
                      ({stock.changeRate >= 0 ? '+' : ''}{stock.changeRate}%)
                    </div>
                  </div>
                  
                  <div className="stock-actions">
                    <button 
                      className="buy-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTradeModal(stock, 'buy');
                      }}
                    >
                      매수
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 거래 모달 */}
      {tradeModal.isOpen && tradeModal.stock && (
        <div className="modal-overlay" onClick={closeTradeModal}>
          <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{tradeModal.type === 'buy' ? '매수' : '매도'} 주문</h2>
              <button className="close-btn" onClick={closeTradeModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="trade-stock-info">
                <h3>{tradeModal.stock.name}</h3>
                <p className="stock-code">{tradeModal.stock.code}</p>
                <p className="current-price">현재가: ₩{tradeModal.stock.price.toLocaleString()}</p>
              </div>
              
              <div className="trade-form">
                <div className="form-group">
                  <label>수량</label>
                  <input 
                    type="number" 
                    min="1"
                    value={tradeModal.quantity}
                    onChange={(e) => setTradeModal({
                      ...tradeModal,
                      quantity: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
                
                <div className="trade-summary">
                  <div className="summary-row">
                    <span>주문금액</span>
                    <span>₩{(tradeModal.stock.price * tradeModal.quantity).toLocaleString()}</span>
                  </div>
                  {tradeModal.type === 'buy' && (
                    <div className="summary-row">
                      <span>주문가능금액</span>
                      <span>₩{portfolioCash.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={closeTradeModal}>
                    취소
                  </button>
                  <button 
                    className={`confirm-btn ${tradeModal.type}`}
                    onClick={handleTrade}
                  >
                    {tradeModal.type === 'buy' ? '매수' : '매도'}하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPage; 