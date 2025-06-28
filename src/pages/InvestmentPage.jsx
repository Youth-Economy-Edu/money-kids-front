import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './InvestmentPage.css';
import StockTradeModal from '../components/StockTradeModal';
import StockChart from '../components/StockChart';
import TradeHistoryModal from '../components/TradeHistoryModal';
import TradeSuccessModal from '../components/TradeSuccessModal';
import { recordMultipleStockPrices } from '../utils/stockHistory';
import { useNotification } from '../contexts/NotificationContext';
import { stockAPI, userAPI, tradeAPI } from '../utils/apiClient';

const InvestmentPage = () => {
  const { getCurrentUserId, getCurrentUserName, user, loading: authLoading } = useAuth();
  const userId = getCurrentUserId(); // AuthContext에서 사용자 ID 가져오기
  const { showNotification } = useNotification();

  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalAsset: 0,
    profitLoss: 0,
    profitRate: 0,
    cash: 0
  });
  const [sortClickCount, setSortClickCount] = useState({});
  const [topStocks, setTopStocks] = useState([]);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showTradeHistory, setShowTradeHistory] = useState(false);
  const [showTradeSuccess, setShowTradeSuccess] = useState(false);
  const [tradeSuccessInfo, setTradeSuccessInfo] = useState({ 
    tradeType: '', 
    stockName: '', 
    quantity: 0 
  });

  // 사용자 포인트 및 포트폴리오 정보 가져오기
  const loadUserData = async () => {
    if (!userId) return;
    
    try {
      // userAPI 사용으로 변경
      const pointsResult = await userAPI.getPoints(userId);
      if (pointsResult.success) {
        setPortfolioSummary(prev => ({ ...prev, cash: pointsResult.data.points }));
      }

      const portfolioResult = await userAPI.getPortfolio(userId);
      if (portfolioResult.success) {
        setStocks(portfolioResult.data.stocks);
        setFilteredStocks(portfolioResult.data.stocks);
      }

      // stockAPI 사용으로 변경
      const stocksResult = await stockAPI.getAll();
      if (stocksResult.success) {
        setStocks(stocksResult.data);
        setFilteredStocks(stocksResult.data);
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
      setError('사용자 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  // 모든 주식 데이터 가져오기
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await stockAPI.getAll();
    if (result.success) {
      setStocks(result.data);
      setFilteredStocks(result.data);
    } else {
      setError(result.error || '주식 데이터를 불러오는데 실패했습니다.');
      console.error('주식 데이터 로드 오류:', result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStocks();
    
    // 🌟 브라우저 알림 권한 요청
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('📢 실시간 주가 변동 알림이 활성화되었습니다.');
        }
      });
    }
    
    // 5초마다 현재 화면의 주가 실시간 업데이트
    const interval = setInterval(() => {
      console.log('🔄 현재 화면 주가 실시간 업데이트 중...');
      updateCurrentViewPrices();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // 주식 목록 새로고침
  const updateCurrentViewPrices = async () => {
    try {
      // stockAPI 사용으로 변경
      const stocksResult = await stockAPI.getAll();
      if (stocksResult.success) {
        setStocks(stocksResult.data);
        setFilteredStocks(stocksResult.data);
      }
    } catch (error) {
      console.error('주식 가격 업데이트 실패:', error);
    }
  };

  // 관심 종목 가져오기
  const fetchFavoriteStocks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const result = await stockAPI.getFavorites(userId);
    if (result.success) {
      setFilteredStocks(result.data || []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [userId]);

  // 보유 주식 가져오기
  const fetchOwnedStocks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const portfolioResult = await userAPI.getPortfolio(userId);
    
    if (portfolioResult.success) {
      const owned = portfolioResult.data.stocks.filter(s => s.quantity > 0);
      setFilteredStocks(owned); // API 응답에 맞춰 데이터 가공 필요
    } else {
      setError(portfolioResult.error);
    }
    setLoading(false);
  }, [userId]);

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(async (filter) => {
    setActiveFilter(filter);
    if (filter === '전체') await fetchStocks();
    else if (filter === '관심') await fetchFavoriteStocks();
    else if (filter === '보유') await fetchOwnedStocks();
    // '인기' 필터는 클라이언트 사이드에서 처리하거나 별도 API 필요
  }, [fetchStocks, fetchFavoriteStocks, fetchOwnedStocks]);

  useEffect(() => {
    if (!authLoading) {
      handleFilterChange(activeFilter);
    }
  }, [authLoading, activeFilter, handleFilterChange]);

  // 검색 및 필터 적용 함수 수정 (useCallback 사용)
  const filterStocks = useCallback(() => {
    // 관심, 보유, 인기 필터가 활성화된 경우 이 함수에서는 필터링하지 않음
    if (activeFilter === '관심' || activeFilter === '보유' || activeFilter === '인기') {
      return;
    }
    
    let result = [...stocks];
    
    // 검색어 필터링
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(stock =>
        stock.name.toLowerCase().includes(term) ||
        stock.code.toLowerCase().includes(term)
      );
    }
    
    // 정렬 설정이 있으면 정렬 적용
    if (sortConfig.key === 'id') {
      // ID 기준 정렬 (초기 순서)
      result.sort((a, b) => a.id - b.id);
    } else if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredStocks(result);
  }, [stocks, activeFilter, searchTerm, sortConfig]);

  // 검색어 변경 시 필터링
  useEffect(() => {
    // 관심, 보유, 인기 필터가 활성화된 경우 기존 필터링 로직 건너뛰기
    if (activeFilter === '관심' || activeFilter === '보유' || activeFilter === '인기') {
      return;
    }
    filterStocks();
  }, [filterStocks]); // filterStocks를 의존성으로 사용

  // 정렬 적용
  useEffect(() => {
    if (sortConfig.key) {
      const sortedStocks = [...filteredStocks].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
      setFilteredStocks(sortedStocks);
    }
  }, [sortConfig]);

  const handleSort = (key) => {
    // 현재 컬럼의 클릭 횟수 계산
    const currentCount = sortClickCount[key] || 0;
    const newCount = currentCount + 1;

    setSortClickCount({
      ...sortClickCount,
      [key]: newCount % 3
    });

    if (activeFilter === '인기') {
      setSortConfig({ key, direction: 'descending' });

      let sortedStocks;
      if (key === 'changeRate') {
        // 등락률 정렬 시 절대값 기준
        sortedStocks = [...filteredStocks].sort((a, b) => {
          const absA = Math.abs(a.changeRate);
          const absB = Math.abs(b.changeRate);
          return absB - absA;
        });
      } else {
        // 다른 컬럼은 일반 정렬
        sortedStocks = [...filteredStocks].sort((a, b) => {
          if (a[key] < b[key]) return 1;
          if (a[key] > b[key]) return -1;
          return 0;
        });
      }

      // 정렬 후 상위 5개 재선정
      const top5StockIds = sortedStocks.slice(0, 5).map(stock => stock.id);
      setTopStocks(top5StockIds);
      
      // isTop 속성 업데이트
      const updatedStocks = sortedStocks.map(stock => ({
        ...stock,
        isTop: top5StockIds.includes(stock.id)
      }));
      
      setFilteredStocks(updatedStocks);
      return;
    }

    // 일반 정렬 로직은 그대로 유지
    if (newCount % 3 === 1) {
      // 1번째 클릭 - 내림차순(높은 순)
      setSortConfig({ key, direction: 'descending' });
    } else if (newCount % 3 === 2) {
      // 2번째 클릭 - 오름차순(낮은 순)
      setSortConfig({ key, direction: 'ascending' });
    } else {
      // 3번째 클릭 - 정렬 해제, ID 순으로 정렬
      setSortConfig({ key: 'id', direction: 'ascending' });
      filterStocks(); // 정렬 해제 후 필터링 다시 적용
    }
  };

  // 정렬 아이콘 표시 수정
  const getSortIcon = (key) => {
    // 인기 필터가 활성화된 경우
    if (activeFilter === '인기') {
      // 정렬이 해제된 상태(ID 순)인 경우
      if (sortConfig.key === 'id') {
        return null; // 아이콘 없음
      }
      // 현재 정렬 중인 컬럼인 경우 체크 표시
      return sortConfig.key === key ? <i className="fas fa-check"></i> : null;
    }

    // 정렬이 해제된 상태(ID 순)인 경우
    if (sortConfig.key === 'id') {
      return <i className="fas fa-sort"></i>;
    }
    
    // 현재 정렬 중인 컬럼이 아닌 경우
    if (sortConfig.key !== key) {
      return <i className="fas fa-sort"></i>;
    }

    // 정렬 방향에 따른 아이콘
    return sortConfig.direction === 'ascending'
      ? <i className="fas fa-sort-up"></i>
      : <i className="fas fa-sort-down"></i>;
  };

  // 인기 주식 가져오기 함수 수정 (등락률 기준 TOP 5)
  const fetchPopularStocks = async () => {
    try {
      setLoading(true);
      
      // 주식 현재가 정보 가져오기
      const stocksResponse = await fetch('http://localhost:8080/api/stocks');
      
      if (!stocksResponse.ok) {
        throw new Error(`주식 정보 API 오류: ${stocksResponse.status}`);
      }
      
      const stocksData = await stocksResponse.json();
      
      // 데이터 가공 및 등락률 계산
      const processedStocks = stocksData.map(stock => {
        // 전일 대비 변화량 계산
        const change = stock.price - (stock.beforePrice || stock.price);
        
        // 등락률 계산 (전일 가격이 0이면 0% 처리)
        const changeRate = stock.beforePrice 
          ? (((stock.price - stock.beforePrice) / stock.beforePrice) * 100).toFixed(2)
          : '0.00';
        
        // 변화 타입 결정 (상승, 하락, 유지)
        const changeType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        
        return {
          id: stock.id,
          name: stock.name,
          code: stock.code || '-',
          price: stock.price,
          beforePrice: stock.beforePrice || stock.price,
          change: change,
          changeRate: parseFloat(changeRate),
          volume: stock.volume || 0,
          changeType: changeType,
          category: stock.category || ''
        };
      });
      
      // 등락률 절대값 기준으로 정렬 (변동성이 큰 주식 우선)
      const sortedByChangeRate = [...processedStocks].sort((a, b) => {
        const absChangeRateA = Math.abs(a.changeRate);
        const absChangeRateB = Math.abs(b.changeRate);
        return absChangeRateB - absChangeRateA;
      });
      
      // 상위 5개 주식의 ID 저장
      const top5StockIds = sortedByChangeRate.slice(0, 5).map(stock => stock.id);
      setTopStocks(top5StockIds);
      
      // 모든 주식에 isTop 속성 추가
      const stocksWithTopFlag = processedStocks.map(stock => ({
        ...stock,
        isTop: top5StockIds.includes(stock.id)
      }));
      
      // 등락률 기준으로 정렬된 상태로 표시
      const finalSortedStocks = stocksWithTopFlag.sort((a, b) => {
        const absChangeRateA = Math.abs(a.changeRate);
        const absChangeRateB = Math.abs(b.changeRate);
        return absChangeRateB - absChangeRateA;
      });
      
      // 정렬 설정 업데이트 (등락률 기준 내림차순)
      setSortConfig({ key: 'changeRate', direction: 'descending' });
      setFilteredStocks(finalSortedStocks);
      setError(null);
      
      console.log('인기 주식 TOP 5 (등락률 기준):', sortedByChangeRate.slice(0, 5).map(s => ({
        name: s.name,
        changeRate: s.changeRate + '%'
      })));
    } catch (err) {
      console.error('인기 주식 로드 오류:', err);
      setError('인기 주식을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 주식 클릭 핸들러 수정
  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setShowTradeModal(true);
  };

  // 차트 보기 핸들러
  const handleShowChart = (stock, e) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    setSelectedStock(stock);
    setShowChart(true);
  };

  // 차트 닫기 핸들러
  const handleCloseChart = () => {
    setShowChart(false);
    setSelectedStock(null);
  };

  // 거래 완료 후 호출되는 핸들러
  const handleTradeComplete = async (tradeInfo) => {
    console.log('거래 완료 - 전체 데이터 새로고침 중...');
    
    // 헤더 데이터 새로고침을 위한 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('tradeComplete', {
      detail: tradeInfo
    }));
    
    // 성공 모달 정보 설정
    if (tradeInfo) {
      setTradeSuccessInfo(tradeInfo);
      setShowTradeSuccess(true);
    }
    
    // 포트폴리오 및 주식 데이터 새로고침
    await Promise.all([
      loadUserData(),
      updateCurrentViewPrices()
    ]);
    
    // 현재 활성화된 필터에 따라 데이터 새로고침
    if (activeFilter === '보유') {
      fetchOwnedStocks();
    } else if (activeFilter === '관심') {
      fetchFavoriteStocks();
    } else if (activeFilter === '인기') {
      fetchPopularStocks();
    } else {
      fetchStocks();
    }
    
    // 모든 데이터 처리 이후 페이지 자동 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowTradeModal(false);
    setSelectedStock(null);
  };

  // 빠른 거래 핸들러
  const handleQuickTrade = () => {
    // 첫 번째 주식을 선택하거나, 없으면 알림 표시
    if (filteredStocks.length > 0) {
      setSelectedStock(filteredStocks[0]);
      setShowTradeModal(true);
    } else {
      alert('거래 가능한 주식이 없습니다.');
    }
  };

  // 모든 주식 리스트 새로고침 (가격 업데이트)
  const refreshAllStocks = async () => {
    try {
      setLoading(true);
      // stockAPI 사용으로 변경
      const stocksResult = await stockAPI.getAll();
      if (stocksResult.success) {
        setStocks(stocksResult.data);
        setFilteredStocks(stocksResult.data);
      }
    } catch (error) {
      console.error('주식 목록 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return <div>로딩중...</div>;
  }

  if (error) {
    return <div>에러: {error}</div>;
  }

  return (
    <div className="investment-page">
      <div className="investment-header">
        <div>
          <h1 className="page-title">
            모의 투자
            <span className="realtime-indicator">
              <span className="realtime-dot"></span>
              실시간 업데이트
            </span>
          </h1>
          <p className="page-subtitle">실제와 같은 환경에서 안전하게 투자를 경험하고 전략을 연마하세요. 주가는 10초마다 자동 업데이트됩니다.</p>
        </div>
                        <button 
                  className="btn btn-primarly" 
                  onClick={() => setShowTradeHistory(true)}
                >
                  <i className="fas fa-history"></i> 거래내역
                </button>
      </div>

      {/* 오늘의 손익 요약 */}
      <div className="portfolio-summary">
        <div className="summary-card">
          <div className={`summary-value ${portfolioSummary?.profitLoss > 0 ? 'price-positive' : 'price-negative'}`}>
            {portfolioSummary?.profitLoss > 0 ? '+' : ''}₩{((portfolioSummary?.profitLoss ?? 0)).toLocaleString()}
          </div>
          <div className="summary-label">오늘의 평가 손익</div>
        </div>
        <div className="summary-card">
          <div className={`summary-value ${portfolioSummary?.profitRate > 0 ? 'price-positive' : 'price-negative'}`}>
            {portfolioSummary?.profitRate > 0 ? '+' : ''}{portfolioSummary?.profitRate}%
          </div>
          <div className="summary-label">오늘의 수익률</div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="종목명 또는 코드 검색..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button
          className={`filter-btn ${activeFilter === '전체' ? 'active' : ''}`}
          onClick={() => handleFilterChange('전체')}
        >
          전체
        </button>
        <button
          className={`filter-btn ${activeFilter === '보유' ? 'active' : ''}`}
          onClick={() => handleFilterChange('보유')}
        >
          보유
        </button>
        <button
          className={`filter-btn ${activeFilter === '관심' ? 'active' : ''}`}
          onClick={() => handleFilterChange('관심')}
        >
          관심
        </button>
        <button
          className={`filter-btn ${activeFilter === '인기' ? 'active' : ''}`}
          onClick={() => handleFilterChange('인기')}
        >
          인기
        </button>
      </div>

      {/* 주식 목록 */}
      <div className="stock-list">
        <div className={`stock-header ${activeFilter === '보유' ? 'holdings-view' : ''}`}>
          <div>종목명</div>
          <div className="sortable-header" onClick={() => handleSort('price')}>
            현재가 {getSortIcon('price')}
          </div>
          <div className="sortable-header" onClick={() => handleSort('change')}>
            전일대비 {getSortIcon('change')}
          </div>
          <div className="sortable-header" onClick={() => handleSort('changeRate')}>
            등락률 {getSortIcon('changeRate')}
          </div>
          {activeFilter === '보유' && (
            <div>보유량</div>
          )}
          <div></div>
        </div>

        {loading ? (
          <div className="loading-message">데이터를 불러오는 중...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredStocks.length === 0 ? (
          <div className="no-data-message">검색 결과가 없습니다.</div>
        ) : (
          filteredStocks.map(stock => (
            <div 
              key={stock.id} 
              className={`stock-item ${activeFilter === '인기' && topStocks.includes(stock.id) ? 'top-stock' : ''} ${activeFilter === '보유' ? 'holdings-view' : ''}`} 
              onClick={() => handleStockClick(stock)}
            >
              <div>
                <div className="stock-name">
                  {activeFilter === '인기' && topStocks.includes(stock.id) && 
                    <span className="top-badge">TOP</span>
                  }
                  {stock.name}
                </div>
                <div className="stock-code">{stock.code}</div>
              </div>
              <div style={{ fontWeight: 600 }}>₩{((stock?.price ?? 0)).toLocaleString()}</div>
              <div className={`price-change ${stock?.changeType}`}>
                {stock?.change > 0 ? '+' : stock?.change < 0 ? '-' : ''}{Math.abs(stock?.change ?? 0).toLocaleString()}
              </div>
              <div className={`price-${stock?.changeType}`}>
                {stock?.changeRate > 0 ? '+' : stock?.changeRate < 0 ? '-' : ''}{Math.abs(stock?.changeRate)}%
              </div>
              {activeFilter === '보유' && (
                <div className="quantity-display">
                  {stock.quantity}주
                </div>
              )}
              <div className="stock-actions">
                <button 
                  className="chart-btn"
                  onClick={(e) => handleShowChart(stock, e)}
                  title="차트 보기"
                >
                  <i className="fas fa-chart-line"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 플로팅 버튼 */}
      <button className="floating-button" onClick={handleQuickTrade} title="빠른 거래">
        <i className="fas fa-bolt"></i>
      </button>

      {/* 거래 모달 */}
      {selectedStock && showTradeModal && (
        <StockTradeModal 
          stock={selectedStock} 
          onClose={handleCloseModal}
          onTradeComplete={handleTradeComplete}
        />
      )}

      {/* 주식 차트 모달 */}
      {showChart && selectedStock && (
        <StockChart 
          stock={selectedStock} 
          onClose={handleCloseChart} 
        />
      )}

      {/* 거래내역 모달 */}
      {showTradeHistory && (
        <TradeHistoryModal 
          isOpen={showTradeHistory}
          onClose={() => setShowTradeHistory(false)} 
        />
      )}

      {/* 거래 성공 모달 */}
      {showTradeSuccess && (
        <TradeSuccessModal 
          isOpen={showTradeSuccess}
          tradeType={tradeSuccessInfo.tradeType}
          stockName={tradeSuccessInfo.stockName}
          quantity={tradeSuccessInfo.quantity}
          onClose={() => setShowTradeSuccess(false)} 
        />
      )}
    </div>
  );
};

export default InvestmentPage;