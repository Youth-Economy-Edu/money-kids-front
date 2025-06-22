import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './InvestmentPage.css';
import StockTradeModal from '../components/StockTradeModal';
import StockChart from '../components/StockChart';
import TradeHistoryModal from '../components/TradeHistoryModal';
import TradeSuccessModal from '../components/TradeSuccessModal';
import { recordMultipleStockPrices } from '../utils/stockHistory';

const InvestmentPage = () => {
  const { getCurrentUserId, getCurrentUserName, user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const userId = getCurrentUserId(); // AuthContext에서 사용자 ID 가져오기
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
  const [showChart, setShowChart] = useState(false);
  const [showTradeHistory, setShowTradeHistory] = useState(false);
  const [showTradeSuccess, setShowTradeSuccess] = useState(false);
  const [tradeSuccessInfo, setTradeSuccessInfo] = useState({ 
    tradeType: '', 
    stockName: '', 
    quantity: 0 
  });

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
      
      // 4. 총 평가 손익 계산 (매수가 기준)
      let totalProfitLoss = 0; // 총 평가 손익
      let totalInvestment = 0; // 총 투자 금액
      let currentStockValue = 0; // 현재 가치
      
      if (portfolioData.stocks && portfolioData.stocks.length > 0) {
        console.log('=== 총 평가 손익 계산 (매수가 기준) ===');
        
        // 수량이 0보다 큰 주식만 계산
        const activeStocks = portfolioData.stocks.filter(stock => stock.quantity > 0);
        
        for (const portfolioStock of activeStocks) {
          // 현재가 찾기
          const currentStock = stocksData.find(s => s.name === portfolioStock.stockName);
          if (currentStock) {
            // 현재 가치 = 현재가 × 보유 수량
            const currentValue = currentStock.price * portfolioStock.quantity;
            currentStockValue += currentValue;
            
            // 총 투자 금액 (매수가 기준)
            const investmentAmount = portfolioStock.totalValue;
            totalInvestment += investmentAmount;
            
            // 이 주식의 손익 = 현재 가치 - 투자 금액
            const stockProfitLoss = currentValue - investmentAmount;
            totalProfitLoss += stockProfitLoss;
            
            // 평균 매수가
            const avgBuyPrice = portfolioStock.quantity > 0 
              ? Math.round(investmentAmount / portfolioStock.quantity) 
              : currentStock.price;
            
            console.log(`${portfolioStock.stockName}:`);
            console.log(`  보유수량: ${portfolioStock.quantity}주`);
            console.log(`  평균 매수가: ₩${avgBuyPrice.toLocaleString()}`);
            console.log(`  현재가: ₩${currentStock.price.toLocaleString()}`);
            console.log(`  총 투자금액: ₩${investmentAmount.toLocaleString()}`);
            console.log(`  현재 가치: ₩${currentValue.toLocaleString()}`);
            console.log(`  손익: ₩${stockProfitLoss.toLocaleString()}`);
          }
        }
      }
      
      // 5. 총 수익률 계산
      const totalProfitRate = totalInvestment > 0 
        ? ((totalProfitLoss / totalInvestment) * 100).toFixed(1) 
        : 0;
      
      console.log('=== 총 손익 요약 ===');
      console.log(`총 투자금액: ₩${totalInvestment.toLocaleString()}`);
      console.log(`현재 총 가치: ₩${currentStockValue.toLocaleString()}`);
      console.log(`총 평가 손익: ₩${totalProfitLoss.toLocaleString()}`);
      console.log(`총 수익률: ${totalProfitRate}%`);
      
      setPortfolioSummary({
        totalAsset: currentStockValue,
        profitLoss: totalProfitLoss,
        profitRate: parseFloat(totalProfitRate),
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
      
      // 주가 히스토리 기록
      recordMultipleStockPrices(processedStocks);
      console.log('주가 히스토리 기록 완료');
    } catch (err) {
      console.error('주식 데이터 로드 오류:', err);
      setError('주식 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
    
    // 10초마다 현재 화면의 주가만 실시간 업데이트
    const interval = setInterval(() => {
      console.log('현재 화면 주가 실시간 업데이트 중...');
      updateCurrentViewPrices();
    }, 10000); // 10초 (실제 서비스에서는 더 긴 간격 권장)
    
    return () => clearInterval(interval);
  }, []);

  // 현재 화면의 주가만 실시간 업데이트하는 함수
  const updateCurrentViewPrices = async () => {
    try {
      // 최신 주가 데이터 가져오기
      const response = await fetch('http://localhost:8080/api/stocks');
      if (!response.ok) return;
      
      const latestStocks = await response.json();
      
      // 현재 화면에 표시된 주식들의 가격만 업데이트
      if (filteredStocks.length === 0) return;
      
      const updatedStocks = filteredStocks.map(displayedStock => {
        const latestStock = latestStocks.find(s => s.id === displayedStock.id);
        if (latestStock) {
          const change = latestStock.price - (latestStock.beforePrice || latestStock.price);
          const changeRate = latestStock.beforePrice 
            ? ((change / latestStock.beforePrice) * 100).toFixed(2) 
            : 0;
          const changeType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
          
          return {
            ...displayedStock,
            price: latestStock.price,
            beforePrice: latestStock.beforePrice || latestStock.price,
            change: change,
            changeRate: parseFloat(changeRate),
            changeType: changeType
          };
        }
        return displayedStock;
      });
      
      setFilteredStocks(updatedStocks);
      console.log(`현재 화면 ${updatedStocks.length}개 주식 가격 업데이트 완료`);
      
      // 포트폴리오 요약도 함께 업데이트
      setTimeout(() => {
        console.log('포트폴리오 요약 실시간 업데이트');
        fetchUserData();
      }, 1000);
    } catch (error) {
      console.error('현재 화면 주가 업데이트 실패:', error);
    }
  };

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

  // 보유 주식 가져오기 함수 (기존 사용자 포트폴리오 API 사용)
  const fetchOwnedStocks = async () => {
    try {
      setLoading(true);
      
      // 1. 사용자 포트폴리오 정보 가져오기
      const portfolioResponse = await fetch(`http://localhost:8080/api/users/${userId}/portfolio`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!portfolioResponse.ok) {
        throw new Error(`포트폴리오 API 오류: ${portfolioResponse.status}`);
      }
      
      const portfolioData = await portfolioResponse.json();
      console.log('포트폴리오 데이터:', portfolioData);
      
      // 보유 주식 정보에서 수량이 0보다 큰 것만 필터링
      const portfolioStocks = portfolioData.stocks || [];
      const ownedStockNames = [];
      
      portfolioStocks.forEach(stock => {
        if (stock.quantity > 0) {
          ownedStockNames.push(stock.stockName);
        }
      });
      
      if (ownedStockNames.length === 0) {
        console.log('보유 주식 없음');
        setFilteredStocks([]);
        setError('보유 중인 주식이 없습니다. 주식을 매수해보세요.');
        return;
      }
      
      console.log('보유 주식 이름:', ownedStockNames);
      
      // 2. 주식 현재가 정보 가져오기
      const stocksResponse = await fetch('http://localhost:8080/api/stocks');
      
      if (!stocksResponse.ok) {
        throw new Error(`주식 정보 API 오류: ${stocksResponse.status}`);
      }
      
      const stocksData = await stocksResponse.json();
      
      // 3. 보유 주식만 필터링하여 표시 (이름 기준)
      const ownedStocks = stocksData.filter(stock => ownedStockNames.includes(stock.name));
      
      // 4. 데이터 가공
      const processedOwnedStocks = ownedStocks.map(stock => {
        // 포트폴리오에서 실제 보유 수량과 총 투자 금액 가져오기
        const portfolioStock = portfolioStocks.find(s => s.stockName === stock.name);
        const quantity = portfolioStock ? portfolioStock.quantity : 0;
        const totalValue = portfolioStock ? portfolioStock.totalValue : 0;
        
        // 평균 매수가 계산 (총 투자 금액 ÷ 보유 수량)
        const avgBuyPrice = quantity > 0 ? Math.round(totalValue / quantity) : stock.price;
        
        // 매수가 대비 변화량과 수익률 계산
        const change = stock.price - avgBuyPrice;
        const changeRate = avgBuyPrice > 0 
          ? ((change / avgBuyPrice) * 100).toFixed(2) 
          : 0;
        
        // 변화 타입 결정 (수익, 손실, 동일)
        const changeType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        
        console.log(`${stock.name} 수익률 계산:`);
        console.log(`  보유수량: ${quantity}주`);
        console.log(`  총 투자금액: ₩${totalValue.toLocaleString()}`);
        console.log(`  평균 매수가: ₩${avgBuyPrice.toLocaleString()}`);
        console.log(`  현재가: ₩${stock.price.toLocaleString()}`);
        console.log(`  수익/손실: ₩${change.toLocaleString()} (${changeRate}%)`);
        
        return {
          id: stock.id,
          name: stock.name,
          code: stock.code || '-',
          price: stock.price,
          beforePrice: avgBuyPrice, // 전일가 대신 평균 매수가 표시
          change: change,
          changeRate: parseFloat(changeRate),
          volume: stock.volume || 0,
          changeType: changeType,
          category: stock.category || '',
          quantity: quantity,
          avgBuyPrice: avgBuyPrice // 평균 매수가 추가
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

  // 거래내역 기반으로 보유 주식 계산 (폴백)
  const fetchOwnedStocksFromHistory = async () => {
    try {
      const historyResponse = await fetch('http://localhost:8080/api/stocks/trade/history', {
        cache: 'no-cache'
      });
      
      if (!historyResponse.ok) {
        throw new Error(`거래내역 API 오류: ${historyResponse.status}`);
      }
      
      const historyData = await historyResponse.json();
      console.log('거래내역 데이터:', historyData);
      
      // 로컬 거래내역 가져오기
      const localTrades = JSON.parse(localStorage.getItem('localTrades') || '[]');
      console.log('로컬 거래내역:', localTrades);
      
      // 모든 거래내역 합치기
      const allTrades = [...historyData, ...localTrades];
      
      // 주식별 보유 수량 계산
      const stockQuantities = {};
      const stockTotalCosts = {}; // 총 매수 금액 추가
      
      allTrades.forEach(trade => {
        if (!stockQuantities[trade.stockId]) {
          stockQuantities[trade.stockId] = 0;
          stockTotalCosts[trade.stockId] = 0;
        }
        stockQuantities[trade.stockId] += trade.quantity;
        stockTotalCosts[trade.stockId] += trade.quantity * trade.price; // 매수 금액 누적
      });
      
      console.log('주식별 보유 수량:', stockQuantities);
      console.log('주식별 총 매수 금액:', stockTotalCosts);
      
      // 수량이 0보다 큰 주식만 필터링
      const ownedStockIds = Object.keys(stockQuantities).filter(stockId => stockQuantities[stockId] > 0);
      
      if (ownedStockIds.length === 0) {
        console.log('보유 주식 없음');
        setFilteredStocks([]);
        setError('보유 중인 주식이 없습니다. 주식을 매수해보세요.');
        return;
      }
      
      // 주식 현재가 정보 가져오기
      const stocksResponse = await fetch('http://localhost:8080/api/stocks');
      
      if (!stocksResponse.ok) {
        throw new Error(`주식 정보 API 오류: ${stocksResponse.status}`);
      }
      
      const stocksData = await stocksResponse.json();
      
      // 보유 주식만 필터링하여 표시
      const ownedStocks = stocksData.filter(stock => ownedStockIds.includes(stock.id));
      
      // 데이터 가공
      const processedOwnedStocks = ownedStocks.map(stock => {
        const quantity = stockQuantities[stock.id] || 0;
        const totalCost = stockTotalCosts[stock.id] || 0;
        
        // 평균 매수가 계산
        const avgBuyPrice = quantity > 0 ? Math.round(totalCost / quantity) : stock.price;
        
        // 매수가 대비 변화량과 수익률 계산
        const change = stock.price - avgBuyPrice;
        const changeRate = avgBuyPrice > 0 
          ? ((change / avgBuyPrice) * 100).toFixed(2) 
          : 0;
        const changeType = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        
        console.log(`${stock.name} 수익률 계산 (거래내역 기준):`);
        console.log(`  보유수량: ${quantity}주`);
        console.log(`  총 매수금액: ₩${totalCost.toLocaleString()}`);
        console.log(`  평균 매수가: ₩${avgBuyPrice.toLocaleString()}`);
        console.log(`  현재가: ₩${stock.price.toLocaleString()}`);
        console.log(`  수익/손실: ₩${change.toLocaleString()} (${changeRate}%)`);
        
        return {
          id: stock.id,
          name: stock.name,
          code: stock.code || '-',
          price: stock.price,
          beforePrice: avgBuyPrice, // 전일가 대신 평균 매수가 표시
          change: change,
          changeRate: parseFloat(changeRate),
          volume: stock.volume || 0,
          changeType: changeType,
          category: stock.category || '',
          quantity: quantity,
          avgBuyPrice: avgBuyPrice
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

  // 필터 변경 핸들러 수정
  const handleFilterChange = async (filter) => {
    setActiveFilter(filter);
    console.log(`필터 변경: ${filter}`);

    // 각 필터에 맞는 최신 데이터를 가져옴
    if (filter === '관심') {
      await fetchFavoriteStocks();
    }
    else if (filter === '보유') {
      await fetchOwnedStocks();
    }
    else if (filter === '인기') {
      await fetchPopularStocks();
    }
    else {
      // 전체 필터 - 최신 전체 주식 데이터 가져오기
      await fetchStocks();
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
    
    // 성공 모달 정보 설정
    if (tradeInfo) {
      setTradeSuccessInfo(tradeInfo);
      setShowTradeSuccess(true);
    }
    
    // 포트폴리오 및 주식 데이터 새로고침
    await Promise.all([
      fetchUserData(),
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

  return (
    <div className="investment-page">
      <div className="investment-header">
        <div>
          <h1 className="page-title">모의 투자</h1>
          <p className="page-subtitle">실제와 같은 환경에서 안전하게 투자를 경험하고 전략을 연마하세요.</p>
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
          <div className={`summary-value ${portfolioSummary.profitLoss > 0 ? 'price-positive' : 'price-negative'}`}>
            {portfolioSummary.profitLoss > 0 ? '+' : ''}₩{portfolioSummary.profitLoss.toLocaleString()}
          </div>
          <div className="summary-label">오늘의 평가 손익</div>
        </div>
        <div className="summary-card">
          <div className={`summary-value ${portfolioSummary.profitRate > 0 ? 'price-positive' : 'price-negative'}`}>
            {portfolioSummary.profitRate > 0 ? '+' : ''}{portfolioSummary.profitRate}%
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
              <div style={{ fontWeight: 600 }}>₩{stock.price.toLocaleString()}</div>
              <div className={`price-${stock.changeType}`}>
                {stock.change > 0 ? '+' : stock.change < 0 ? '-' : ''}{Math.abs(stock.change).toLocaleString()}
              </div>
              <div className={`price-${stock.changeType}`}>
                {stock.changeRate > 0 ? '+' : stock.changeRate < 0 ? '-' : ''}{Math.abs(stock.changeRate)}%
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