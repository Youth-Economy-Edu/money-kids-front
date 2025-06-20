import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { investmentService } from '../services/investmentService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './StockDetailPage.css';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockDetailPage = () => {
  const { stockCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stock, setStock] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [tradeModal, setTradeModal] = useState({
    isOpen: false,
    type: 'buy',
    quantity: 1
  });

  useEffect(() => {
    if (stockCode) {
      loadStockDetail();
    }
  }, [stockCode, user]);

  const loadStockDetail = async () => {
    if (!stockCode) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 주식 정보와 포트폴리오 정보를 병렬로 로드
      const [stockResult, portfolioResult] = await Promise.all([
        investmentService.getStockByCode(stockCode),
        user ? investmentService.getPortfolio(user.id) : Promise.resolve({ success: true, portfolio: null })
      ]);

      if (stockResult.success && stockResult.stock) {
        setStock(stockResult.stock);
        
        // Mock 주가 이력 데이터 생성
        generateMockPriceHistory(stockResult.stock);
      } else {
        setError('주식 정보를 찾을 수 없습니다.');
      }
      
      if (portfolioResult.success) {
        setPortfolio(portfolioResult.portfolio);
      }
    } catch (err) {
      console.error('주식 상세 정보 로딩 오류:', err);
      setError('주식 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock 주가 이력 데이터 생성
  const generateMockPriceHistory = (stockData) => {
    const history = [];
    const basePrice = stockData.beforePrice || stockData.price;
    const currentPrice = stockData.price;
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // 주가 변동을 시뮬레이션
      let price;
      if (i === 0) {
        price = currentPrice;
      } else {
        const volatility = 0.03; // 3% 변동성
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        const priceRatio = (currentPrice / basePrice);
        const progressRatio = (days - i) / days;
        price = Math.round(basePrice * (1 + (priceRatio - 1) * progressRatio + randomChange));
      }
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: price,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    
    setPriceHistory(history);
  };

  const openTradeModal = (type) => {
    setTradeModal({
      isOpen: true,
      type: type,
      quantity: 1
    });
  };

  const closeTradeModal = () => {
    setTradeModal({
      isOpen: false,
      type: 'buy',
      quantity: 1
    });
  };

  const handleTrade = async () => {
    if (!user || !stock) return;
    
    const { type, quantity } = tradeModal;
    
    try {
      const result = await investmentService.tradeStock({
        userId: user.id,
        stockCode: stock.code,
        tradeType: type.toUpperCase(),
        quantity: quantity,
        price: stock.price
      });
      
      if (result.success) {
        alert(`${type === 'buy' ? '매수' : '매도'} 주문이 체결되었습니다.`);
        
        // 포트폴리오 다시 로드
        if (user) {
          const portfolioResult = await investmentService.getPortfolio(user.id);
          if (portfolioResult.success) {
            setPortfolio(portfolioResult.portfolio);
          }
        }
        
        closeTradeModal();
      }
    } catch (err) {
      console.error('거래 오류:', err);
      alert(err.message || '거래 중 오류가 발생했습니다.');
    }
  };

  // 차트 데이터 구성
  const chartData = {
    labels: priceHistory.map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: '주가',
        data: priceHistory.map(item => item.price),
        borderColor: stock?.changeRate >= 0 ? '#10B981' : '#EF4444',
        backgroundColor: stock?.changeRate >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return '₩' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6
      }
    }
  };

  // 보유 주식 정보 가져오기
  const holdingStock = portfolio?.stocks?.find(s => s.code === stockCode);

  if (isLoading) {
    return (
      <div className="stock-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>주식 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="stock-detail-page">
        <div className="error-container">
          <h2>오류</h2>
          <p>{error || '주식 정보를 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate(-1)}>뒤로 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-detail-page">
      {/* 헤더 */}
      <div className="stock-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="stock-info">
          <h1>{stock.name}</h1>
          <p className="stock-code">{stock.code}</p>
        </div>
        <div className="stock-price-info">
          <div className="current-price">₩{stock.price.toLocaleString()}</div>
          <div className={`price-change ${stock.changeRate >= 0 ? 'positive' : 'negative'}`}>
            {stock.changeRate >= 0 ? '+' : ''}₩{((stock.price - stock.beforePrice) || 0).toLocaleString()}
            ({stock.changeRate >= 0 ? '+' : ''}{stock.changeRate}%)
          </div>
        </div>
      </div>

      {/* 거래 버튼 */}
      {user && (
        <div className="trade-buttons">
          <button className="buy-btn" onClick={() => openTradeModal('buy')}>
            <i className="fas fa-plus"></i>
            매수
          </button>
          <button 
            className="sell-btn" 
            onClick={() => openTradeModal('sell')}
            disabled={!holdingStock || holdingStock.quantity === 0}
          >
            <i className="fas fa-minus"></i>
            매도
          </button>
        </div>
      )}

      {/* 보유 정보 */}
      {holdingStock && (
        <div className="holding-info">
          <h3>보유 정보</h3>
          <div className="holding-details">
            <div className="holding-item">
              <span>보유 수량</span>
              <span>{holdingStock.quantity}주</span>
            </div>
            <div className="holding-item">
              <span>평균 단가</span>
              <span>₩{holdingStock.avgPrice?.toLocaleString() || stock.price.toLocaleString()}</span>
            </div>
            <div className="holding-item">
              <span>평가 금액</span>
              <span>₩{(stock.price * holdingStock.quantity).toLocaleString()}</span>
            </div>
            <div className="holding-item">
              <span>수익률</span>
              <span className={`${((stock.price - (holdingStock.avgPrice || stock.price)) / (holdingStock.avgPrice || stock.price) * 100) >= 0 ? 'positive' : 'negative'}`}>
                {((stock.price - (holdingStock.avgPrice || stock.price)) / (holdingStock.avgPrice || stock.price) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="detail-tabs">
        <button 
          className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          차트
        </button>
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          기업 정보
        </button>
        <button 
          className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          관련 뉴스
        </button>
      </div>

      {/* 차트 탭 */}
      {activeTab === 'chart' && (
        <div className="chart-section">
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="chart-stats">
            <div className="stat-item">
              <span>최고가</span>
              <span>₩{Math.max(...priceHistory.map(p => p.price)).toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span>최저가</span>
              <span>₩{Math.min(...priceHistory.map(p => p.price)).toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span>거래량</span>
              <span>{priceHistory[priceHistory.length - 1]?.volume.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* 기업 정보 탭 */}
      {activeTab === 'info' && (
        <div className="info-section">
          <div className="company-info">
            <h3>기업 개요</h3>
            <div className="info-grid">
              <div className="info-item">
                <span>업종</span>
                <span>{stock.category || '기술'}</span>
              </div>
              <div className="info-item">
                <span>시가총액</span>
                <span>₩{(stock.price * 1000000).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span>PER</span>
                <span>{(Math.random() * 20 + 5).toFixed(1)}</span>
              </div>
              <div className="info-item">
                <span>PBR</span>
                <span>{(Math.random() * 3 + 0.5).toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span>ROE</span>
                <span>{(Math.random() * 15 + 5).toFixed(1)}%</span>
              </div>
              <div className="info-item">
                <span>배당수익률</span>
                <span>{(Math.random() * 4 + 1).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관련 뉴스 탭 */}
      {activeTab === 'news' && (
        <div className="news-section">
          <div className="news-list">
            <div className="news-item">
              <h4>{stock.name} 실적 발표 임박</h4>
              <p>다음 주 실적 발표를 앞두고 주가 변동성이 확대될 것으로 예상됩니다.</p>
              <span className="news-date">2024.01.15</span>
            </div>
            <div className="news-item">
              <h4>업계 전망 밝아, 관련주 상승세</h4>
              <p>업계 전반의 성장 전망이 밝아지면서 관련 종목들이 강세를 보이고 있습니다.</p>
              <span className="news-date">2024.01.14</span>
            </div>
            <div className="news-item">
              <h4>신규 사업 진출로 성장 동력 확보</h4>
              <p>새로운 사업 영역 진출을 통해 중장기 성장 동력을 확보했다고 발표했습니다.</p>
              <span className="news-date">2024.01.13</span>
            </div>
          </div>
        </div>
      )}

      {/* 거래 모달 */}
      {tradeModal.isOpen && (
        <div className="modal-overlay" onClick={closeTradeModal}>
          <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{tradeModal.type === 'buy' ? '매수' : '매도'} 주문</h2>
              <button className="close-btn" onClick={closeTradeModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="trade-stock-info">
                <h3>{stock.name}</h3>
                <p className="stock-code">{stock.code}</p>
                <p className="current-price">현재가: ₩{stock.price.toLocaleString()}</p>
              </div>
              
              <div className="trade-form">
                <div className="form-group">
                  <label>수량</label>
                  <input 
                    type="number" 
                    min="1"
                    max={tradeModal.type === 'sell' ? holdingStock?.quantity || 0 : undefined}
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
                    <span>₩{(stock.price * tradeModal.quantity).toLocaleString()}</span>
                  </div>
                  {tradeModal.type === 'sell' && holdingStock && (
                    <div className="summary-row">
                      <span>보유수량</span>
                      <span>{holdingStock.quantity}주</span>
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

export default StockDetailPage; 