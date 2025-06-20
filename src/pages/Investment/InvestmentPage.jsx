import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { investmentService } from '../../services/investmentService';
import './InvestmentPage.css';

function InvestmentPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('market');
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState('buy');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [balance, setBalance] = useState(1000000);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      // 전체 주식 목록 가져오기
      const stocksResponse = await investmentService.getAllStocks();
      if (stocksResponse.success) {
        setStocks(stocksResponse.stocks);
      } else {
        setError('주식 데이터를 불러오는데 실패했습니다.');
      }
      
      // 관심 종목 가져오기
      const watchlistResponse = await investmentService.getWatchlist(user.id);
      if (watchlistResponse.success) {
        setWatchlist(watchlistResponse.watchlist);
      }
      
      // 포트폴리오 가져오기
      const portfolioResponse = await investmentService.getPortfolio(user.id);
      if (portfolioResponse.success) {
        setPortfolio(portfolioResponse.portfolio);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!selectedStock || quantity <= 0) {
      setError('올바른 수량을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      let response;
      if (tradeType === 'buy') {
        response = await investmentService.buyStock(
          user.id,
          selectedStock.id,
          quantity,
          selectedStock.price
        );
      } else {
        response = await investmentService.sellStock(
          user.id,
          selectedStock.id,
          quantity,
          selectedStock.price
        );
      }

      if (response.success) {
        setSuccessMessage(
          tradeType === 'buy' 
            ? `${selectedStock.name} ${quantity}주를 매수했습니다.`
            : `${selectedStock.name} ${quantity}주를 매도했습니다.`
        );
        setQuantity(1);
        setSelectedStock(null);
        fetchData(); // 데이터 새로고침
      } else {
        setError(response.error || '거래에 실패했습니다.');
      }
    } catch (error) {
      setError('거래 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async (stock) => {
    try {
      const response = await investmentService.toggleWatchlist(user.id, stock.id);
      if (response.success) {
        fetchData(); // 관심 종목 새로고침
      }
    } catch (error) {
      console.error('관심 종목 토글 실패:', error);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const getFilteredStocks = () => {
    let filtered = stocks;
    
    if (filter !== 'all') {
      filtered = stocks.filter(stock => stock.category === filter);
    }
    
    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.changeRate - a.changeRate;
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const calculateTotalAsset = () => {
    const stockValue = portfolio.reduce((sum, item) => {
      const stock = stocks.find(s => s.id === item.stockId);
      return sum + (stock ? stock.price * item.quantity : 0);
    }, 0);
    return balance + stockValue;
  };

  // 실제 데이터에서 카테고리 목록 추출
  const getCategories = () => {
    const categories = [...new Set(stocks.map(stock => stock.category))];
    return categories.sort();
  };

  if (loading && stocks.length === 0) {
    return (
      <div className="investment-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>MySQL 데이터베이스에서 주식 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>모의 투자</h1>
        <p>가상 자금으로 안전하게 투자를 연습해보세요</p>
        {stocks.length > 0 && (
          <p className="data-info">💾 MySQL 데이터베이스에서 {stocks.length}개 종목을 불러왔습니다</p>
        )}
      </div>

      {/* 자산 현황 */}
      <div className="asset-summary">
        <div className="asset-card total">
          <span className="label">총 자산</span>
          <span className="value">₩{formatNumber(calculateTotalAsset())}</span>
        </div>
        <div className="asset-card cash">
          <span className="label">보유 현금</span>
          <span className="value">₩{formatNumber(balance)}</span>
        </div>
        <div className="asset-card stocks">
          <span className="label">주식 평가액</span>
          <span className="value">₩{formatNumber(calculateTotalAsset() - balance)}</span>
        </div>
        <div className="asset-card return">
          <span className="label">수익률</span>
          <span className="value positive">+2.5%</span>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="tab-menu">
        <button 
          className={`tab ${activeTab === 'market' ? 'active' : ''}`}
          onClick={() => setActiveTab('market')}
        >
          주식 시장
        </button>
        <button 
          className={`tab ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          관심 종목
        </button>
        <button 
          className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          내 포트폴리오
        </button>
      </div>

      {/* 메시지 표시 */}
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* 탭 컨텐츠 */}
      <div className="tab-content">
        {activeTab === 'market' && (
          <div className="market-section">
            <div className="market-controls">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">전체 종목</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">이름순</option>
                <option value="price">가격순</option>
                <option value="change">변동률순</option>
              </select>
            </div>

            <div className="stock-list">
              {getFilteredStocks().map(stock => (
                <div key={stock.id} className="stock-item">
                  <div className="stock-info">
                    <h3>{stock.name}</h3>
                    <span className="stock-code">{stock.code}</span>
                    <span className="stock-category">{stock.category}</span>
                  </div>
                  <div className="stock-price">
                    <span className="price">₩{formatNumber(stock.price)}</span>
                    <span className={`change ${stock.changeRate >= 0 ? 'positive' : 'negative'}`}>
                      {stock.changeRate >= 0 ? '+' : ''}{stock.changeRate}%
                    </span>
                  </div>
                  <div className="stock-actions">
                    <button 
                      className="watchlist-btn"
                      onClick={() => toggleWatchlist(stock)}
                    >
                      {watchlist.some(w => w.id === stock.id) ? '★' : '☆'}
                    </button>
                    <button 
                      className="trade-btn buy"
                      onClick={() => {
                        setSelectedStock(stock);
                        setTradeType('buy');
                      }}
                    >
                      매수
                    </button>
                    <button 
                      className="trade-btn sell"
                      onClick={() => {
                        setSelectedStock(stock);
                        setTradeType('sell');
                      }}
                    >
                      매도
                    </button>
                  </div>
                </div>
              ))}
              
              {getFilteredStocks().length === 0 && (
                <div className="empty-state">
                  <p>선택한 카테고리에 종목이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="watchlist-section">
            {watchlist.length === 0 ? (
              <div className="empty-state">
                <p>관심 종목이 없습니다.</p>
                <p>주식 시장에서 ☆ 버튼을 눌러 추가해보세요!</p>
              </div>
            ) : (
              <div className="stock-list">
                {watchlist.map(stock => (
                  <div key={stock.id} className="stock-item">
                    <div className="stock-info">
                      <h3>{stock.name}</h3>
                      <span className="stock-code">{stock.code}</span>
                    </div>
                    <div className="stock-price">
                      <span className="price">₩{formatNumber(stock.price)}</span>
                      <span className={`change ${stock.changeRate >= 0 ? 'positive' : 'negative'}`}>
                        {stock.changeRate >= 0 ? '+' : ''}{stock.changeRate}%
                      </span>
                    </div>
                    <div className="stock-actions">
                      <button 
                        className="trade-btn buy"
                        onClick={() => {
                          setSelectedStock(stock);
                          setTradeType('buy');
                        }}
                      >
                        매수
                      </button>
                      <button 
                        className="trade-btn sell"
                        onClick={() => {
                          setSelectedStock(stock);
                          setTradeType('sell');
                        }}
                      >
                        매도
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="portfolio-section">
            {portfolio.length === 0 ? (
              <div className="empty-state">
                <p>보유한 주식이 없습니다.</p>
                <p>주식 시장에서 매수를 시작해보세요!</p>
              </div>
            ) : (
              <div className="portfolio-list">
                {portfolio.map(item => {
                  const stock = stocks.find(s => s.id === item.stockId);
                  if (!stock) return null;
                  
                  const totalValue = stock.price * item.quantity;
                  const profit = (stock.price - item.averagePrice) * item.quantity;
                  const profitRate = ((stock.price - item.averagePrice) / item.averagePrice * 100).toFixed(2);
                  
                  return (
                    <div key={item.id} className="portfolio-item">
                      <div className="portfolio-info">
                        <h3>{stock.name}</h3>
                        <span className="holding">{item.quantity}주 보유</span>
                      </div>
                      <div className="portfolio-value">
                        <span className="current-value">₩{formatNumber(totalValue)}</span>
                        <span className={`profit ${profit >= 0 ? 'positive' : 'negative'}`}>
                          {profit >= 0 ? '+' : ''}₩{formatNumber(Math.abs(profit))}
                          ({profitRate}%)
                        </span>
                      </div>
                      <button 
                        className="trade-btn sell"
                        onClick={() => {
                          setSelectedStock(stock);
                          setTradeType('sell');
                        }}
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
      </div>

      {/* 거래 모달 */}
      {selectedStock && (
        <div className="trade-modal-overlay" onClick={() => setSelectedStock(null)}>
          <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{tradeType === 'buy' ? '매수' : '매도'} 주문</h2>
            <div className="modal-stock-info">
              <h3>{selectedStock.name}</h3>
              <p>현재가: ₩{formatNumber(selectedStock.price)}</p>
              <p>카테고리: {selectedStock.category}</p>
            </div>
            <div className="trade-form">
              <label>
                수량
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </label>
              <div className="order-summary">
                <p>주문 금액: ₩{formatNumber(selectedStock.price * quantity)}</p>
                {tradeType === 'buy' && (
                  <p>매수 가능: ₩{formatNumber(balance)}</p>
                )}
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setSelectedStock(null)}
                >
                  취소
                </button>
                <button 
                  className={`confirm-btn ${tradeType}`}
                  onClick={handleTrade}
                  disabled={loading || (tradeType === 'buy' && selectedStock.price * quantity > balance)}
                >
                  {loading ? '처리중...' : tradeType === 'buy' ? '매수하기' : '매도하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentPage; 