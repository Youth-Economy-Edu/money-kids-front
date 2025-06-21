import React, { useState, useEffect } from 'react';
import './InvestmentPage.css';
import StockTradeModal from '../components/StockTradeModal';

const InvestmentPage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [userId] = useState('test_trader'); // 테스트용 고정 사용자 ID
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalAsset: 0,
    profitLoss: 0,
    profitRate: 0,
    cash: 0
  });
  const [sortClickCount, setSortClickCount] = useState({});
  const [topStocks, setTopStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  // 사용자 포인트 및 포트폴리오 정보 가져오기
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // 1. 사용자 포인트 정보 가져오기
      const pointsResponse = await fetch(`http://localhost:8080/api/users/${userId}/points`);
      
      if (!pointsResponse.ok) {
        throw new Error(`포인트 정보 API 오류: ${pointsResponse.status}`);
      }
      
      const pointsData = await pointsResponse.json();
      const userPoints = pointsData.data.points || 0;
      
      // 2. 포트폴리오 정보 가져오기 (평균 매수가 기준)
      const portfolioResponse = await fetch(`http://localhost:8080/api/users/${userId}/portfolio`);
      
      if (!portfolioResponse.ok) {
        throw new Error(`포트폴리오 정보 API 오류: ${portfolioResponse.status}`);
      }
      
      const portfolioData = await portfolioResponse.json();
      
      // 3. 주식 현재가 정보 가져오기
      const stocksResponse = await fetch('http://localhost:8080/api/stocks');
      
      if (!stocksResponse.ok) {
        throw new Error(`주식 정보 API 오류: ${stocksResponse.status}`);
      }
      
      const stocksData = await stocksResponse.json();
      
      // 4. 현재가 기준 주식 가치 및 평가 손익 계산
      let totalInvestment = 0; // 총 투자금 (평균 매수가 기준)
      let currentStockValue = 0; // 현재가 기준 주식 가치
      
      if (portfolioData.stocks && portfolioData.stocks.length > 0) {
        // 총 투자금 계산 (평균 매수가 기준)
        totalInvestment = portfolioData.stocks.reduce((sum, stock) => sum + stock.totalValue, 0);
        
        // 현재가 기준 주식 가치 계산
        portfolioData.stocks.forEach(portfolioStock => {
          // 현재가 찾기
          const currentStock = stocksData.find(s => s.name === portfolioStock.stockName);
          if (currentStock) {
            // 현재가 * 보유 수량
            const stockValue = currentStock.price * portfolioStock.quantity;
            currentStockValue += stockValue;
          }
        });
      }
      
      // 5. 총자산 및 평가 손익 계산
      const totalAsset = currentStockValue + userPoints; // 현재가 기준 총 자산
      const profitLoss = currentStockValue - totalInvestment; // 평가 손익
      
      // 수익률 계산 = 평가손익 / 총 투자금 * 100
      const profitRate = totalInvestment > 0 
        ? ((profitLoss / totalInvestment) * 100).toFixed(1) 
        : 0;
      
      setPortfolioSummary({
        totalAsset: totalAsset,
        profitLoss: profitLoss,
        profitRate: parseFloat(profitRate),
        cash: userPoints
      });
      
    } catch (err) {
      console.error('사용자 데이터 로드 오류:', err);
      setError('사용자 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // 주식 데이터 가져오기
  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/stocks');
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();

      const processedStocks = data.map(stock => {
        // 전일 대비 변화량 계산
        const change = stock.price - (stock.beforePrice || stock.price);

        const changeRate = stock.beforePrice
          ? ((change / stock.beforePrice) * 100).toFixed(2)
          : 0;

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

      setStocks(processedStocks);
      setFilteredStocks(processedStocks);
      setError(null);
    } catch (err) {
      console.error('주식 데이터 로드 오류:', err);
      setError('주식 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // 관심 종목 가져오기 함수 추가
  const fetchFavoriteStocks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/stocks/favorite?userId=${userId}`);

      if (response.status === 204) {
        // 관심 종목이 없는 경우
        setFilteredStocks([]);
        setError(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const favoriteStocks = await response.json();

      const processedFavorites = favoriteStocks.map(stock => {
        // 전일 대비 변화량 계산
        const change = stock.price - (stock.beforePrice || stock.price);
        
        // 등락률 계산 (전일 가격이 0이면 0% 처리)
        const changeRate = stock.beforePrice 
          ? ((change / stock.beforePrice) * 100).toFixed(2) 
          : 0;
        
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
      
      setFilteredStocks(processedFavorites);
      setError(null);
    } catch (err) {
      console.error('관심 종목 로드 오류:', err);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // 보유 주식 가져오기 함수 추가
  const fetchOwnedStocks = async () => {
    try {
      setLoading(true);
      
      // 1. 포트폴리오 정보 가져오기
      const portfolioResponse = await fetch(`http://localhost:8080/api/users/${userId}/portfolio`);
      
      if (!portfolioResponse.ok) {
        throw new Error(`포트폴리오 정보 API 오류: ${portfolioResponse.status}`);
      }
      
      const portfolioData = await portfolioResponse.json();
      
      if (!portfolioData.stocks || portfolioData.stocks.length === 0) {
        // 보유 주식이 없는 경우
        setFilteredStocks([]);
        setError('보유 중인 주식이 없습니다. 주식을 매수해보세요.');
        return;
      }
      
      // 2. 주식 현재가 정보 가져오기
      const stocksResponse = await fetch('http://localhost:8080/api/stocks');
      
      if (!stocksResponse.ok) {
        throw new Error(`주식 정보 API 오류: ${stocksResponse.status}`);
      }
      
      const stocksData = await stocksResponse.json();
      
      // 3. 보유 주식만 필터링하여 표시
      const ownedStockNames = portfolioData.stocks.map(stock => stock.stockName);
      const ownedStocks = stocksData.filter(stock => ownedStockNames.includes(stock.name));
      
      // 4. 데이터 가공
      const processedOwnedStocks = ownedStocks.map(stock => {
        // 전일 대비 변화량 계산
        const change = stock.price - (stock.beforePrice || stock.price);
        
        // 등락률 계산 (전일 가격이 0이면 0% 처리)
        const changeRate = stock.beforePrice 
          ? ((change / stock.beforePrice) * 100).toFixed(2) 
          : 0;
        
        // 변화 타입 결정 (상승, 하락, 유지)
        const changeType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        
        // 보유 수량 찾기
        const portfolioStock = portfolioData.stocks.find(s => s.stockName === stock.name);
        const quantity = portfolioStock ? portfolioStock.quantity : 0;
        
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
          category: stock.category || '',
          quantity: quantity // 보유 수량 추가
        };
      });
      
      setFilteredStocks(processedOwnedStocks);
      setError(null);
    } catch (err) {
      console.error('보유 주식 로드 오류:', err);
      setError('보유 주식을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색어 변경 시 필터링
  useEffect(() => {
    // 관심, 보유, 인기 필터가 활성화된 경우 기존 필터링 로직 건너뛰기
    if (activeFilter === '관심' || activeFilter === '보유' || activeFilter === '인기') {
      return;
    }
    filterStocks();
  }, [searchTerm, activeFilter, stocks]);

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

  // 검색 및 필터 적용 함수 수정
  const filterStocks = () => {
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
  };

  const handleSort = (key) => {
    // 현재 컬럼의 클릭 횟수 계산
    const currentCount = sortClickCount[key] || 0;
    const newCount = currentCount + 1;

    setSortClickCount({
      ...sortClickCount,
      [key]: newCount % 3
    });

    if (activeFilter === '인기') {
      if (key !== 'price') {
        setSortConfig({ key, direction: 'descending' });

        const sortedStocks = [...filteredStocks].sort((a, b) => {
          if (a[key] < b[key]) return 1;
          if (a[key] > b[key]) return -1;
          return 0;
        });

        const top5StockIds = sortedStocks.slice(0, 5).map(stock => stock.id);
        setTopStocks(top5StockIds);
        
        // isTop 속성 업데이트
        const updatedStocks = sortedStocks.map(stock => ({
          ...stock,
          isTop: top5StockIds.includes(stock.id)
        }));
        
        setFilteredStocks(updatedStocks);
      } else {
        setSortConfig({ key: 'price', direction: 'descending' });

        const sortedStocks = [...filteredStocks].sort((a, b) => b.price - a.price);

        const top5StockIds = sortedStocks.slice(0, 5).map(stock => stock.id);
        setTopStocks(top5StockIds);

        const updatedStocks = sortedStocks.map(stock => ({
          ...stock,
          isTop: top5StockIds.includes(stock.id)
        }));
        
        setFilteredStocks(updatedStocks);
      }
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

  // 인기 주식 가져오기 함수 수정
  const fetchPopularStocks = async () => {
    try {
      setLoading(true);
      
      // 주식 현재가 정보 가져오기
      const stocksResponse = await fetch('http://localhost:8080/api/stocks');
      
      if (!stocksResponse.ok) {
        throw new Error(`주식 정보 API 오류: ${stocksResponse.status}`);
      }
      
      const stocksData = await stocksResponse.json();
      
      // 현재가 기준으로 내림차순 정렬
      const sortedStocks = [...stocksData].sort((a, b) => b.price - a.price);
      const top5StockIds = sortedStocks.slice(0, 5).map(stock => stock.id);
      setTopStocks(top5StockIds);

      const processedStocks = sortedStocks.map(stock => {
        // 전일 대비 변화량 계산
        const change = stock.price - (stock.beforePrice || stock.price);
        
        // 등락률 계산 (전일 가격이 0이면 0% 처리)
        const changeRate = stock.beforePrice 
          ? ((change / stock.beforePrice) * 100).toFixed(2) 
          : 0;
        
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
          category: stock.category || '',
          isTop: top5StockIds.includes(stock.id) // 상위 5개 여부 표시
        };
      });
      
      // 정렬 설정 업데이트 (현재가 기준 내림차순)
      setSortConfig({ key: 'price', direction: 'descending' });
      setFilteredStocks(processedStocks);
      setError(null);
    } catch (err) {
      console.error('인기 주식 로드 오류:', err);
      setError('인기 주식을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 핸들러 수정
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);

    if (filter === '관심') {
      fetchFavoriteStocks();
    }
    else if (filter === '보유') {
      fetchOwnedStocks();
    }
    else if (filter === '인기') {
      fetchPopularStocks();
    }
    else {
      filterStocks();
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

  // 모달 닫기 핸들러
  const handleCloseModal = (needsRefresh) => {
    setShowTradeModal(false);
    setSelectedStock(null);
    
    // 거래 성공 후 데이터 새로고침
    if (needsRefresh) {
      // 사용자 포트폴리오 정보 새로고침
      fetchUserData();
      
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
    }
  };

  // 빠른 거래 핸들러 수정
  const handleQuickTrade = () => {
    // 첫 번째 주식을 선택하거나, 없으면 알림 표시
    if (filteredStocks.length > 0) {
      setSelectedStock(filteredStocks[0]);
      setShowTradeModal(true);
    } else {
      alert('거래 가능한 주식이 없습니다.');
    }
  };

  return (
    <div className="investment-page">
      <div className="investment-header">
        <div>
          <h1 className="page-title">모의 투자</h1>
          <p className="page-subtitle">실제와 같은 환경에서 안전하게 투자를 경험하고 전략을 연마하세요.</p>
        </div>
        <button className="btn btn-primarly"><i className="fas fa-exchange-alt"></i> 매수/매도</button>
      </div>

      {/* 포트폴리오 요약 */}
      <div className="portfolio-summary">
        <div className="summary-card">
          <div className="summary-value">₩{portfolioSummary.totalAsset.toLocaleString()}</div>
          <div className="summary-label">총 자산</div>
        </div>
        <div className="summary-card">
          <div className={`summary-value ${portfolioSummary.profitLoss > 0 ? 'price-positive' : 'price-negative'}`}>
            {portfolioSummary.profitLoss > 0 ? '+' : ''}₩{portfolioSummary.profitLoss.toLocaleString()}
          </div>
          <div className="summary-label">평가 손익</div>
        </div>
        <div className="summary-card">
          <div className={`summary-value ${portfolioSummary.profitRate > 0 ? 'price-positive' : 'price-negative'}`}>
            {portfolioSummary.profitRate > 0 ? '+' : ''}{portfolioSummary.profitRate}%
          </div>
          <div className="summary-label">수익률</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">₩{portfolioSummary.cash.toLocaleString()}</div>
          <div className="summary-label">현금</div>
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
        <div className="stock-header">
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
          <div className="sortable-header" onClick={() => handleSort('volume')}>
            거래량 {getSortIcon('volume')}
          </div>
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
              className={`stock-item ${activeFilter === '인기' && topStocks.includes(stock.id) ? 'top-stock' : ''}`} 
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
              <div style={{ fontWeight: 600 }}>₩{stock.price.toLocaleString()}</div>
              <div className={`price-${stock.changeType}`}>
                {stock.change > 0 ? '+' : ''}₩{Math.abs(stock.change).toLocaleString()}
              </div>
              <div className={`price-${stock.changeType}`}>
                {stock.change > 0 ? '+' : stock.change < 0 ? '-' : ''}{Math.abs(stock.changeRate)}%
              </div>
              <div>{stock.volume.toLocaleString()}</div>
            </div>
          ))
        )}
      </div>

      {/* 플로팅 버튼 */}
      <button className="floating-button" onClick={handleQuickTrade} title="빠른 거래">
        <i className="fas fa-bolt"></i>
      </button>

      {/* 거래 모달 */}
      {showTradeModal && selectedStock && (
        <StockTradeModal 
          stock={selectedStock} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default InvestmentPage;