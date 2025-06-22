// 주가 히스토리 관리 유틸리티
const STOCK_HISTORY_KEY = 'stockPriceHistory';
const MAX_HISTORY_POINTS = 100; // 주식당 최대 저장 데이터 포인트

// 주가 히스토리 초기화
export const initializeStockHistory = () => {
  const existingHistory = localStorage.getItem(STOCK_HISTORY_KEY);
  if (!existingHistory) {
    localStorage.setItem(STOCK_HISTORY_KEY, JSON.stringify({}));
  }
};

// 현재 주가 기록
export const recordStockPrice = (stockId, price) => {
  const history = JSON.parse(localStorage.getItem(STOCK_HISTORY_KEY) || '{}');
  
  if (!history[stockId]) {
    history[stockId] = [];
  }
  
  const timestamp = new Date().toISOString();
  history[stockId].push({ timestamp, price });
  
  // 최대 포인트 수 제한
  if (history[stockId].length > MAX_HISTORY_POINTS) {
    history[stockId] = history[stockId].slice(-MAX_HISTORY_POINTS);
  }
  
  localStorage.setItem(STOCK_HISTORY_KEY, JSON.stringify(history));
};

// 여러 주식 가격 한번에 기록
export const recordMultipleStockPrices = (stocks) => {
  const history = JSON.parse(localStorage.getItem(STOCK_HISTORY_KEY) || '{}');
  const timestamp = new Date().toISOString();
  
  stocks.forEach(stock => {
    if (!history[stock.id]) {
      history[stock.id] = [];
    }
    
    history[stock.id].push({ timestamp, price: stock.price });
    
    // 최대 포인트 수 제한
    if (history[stock.id].length > MAX_HISTORY_POINTS) {
      history[stock.id] = history[stock.id].slice(-MAX_HISTORY_POINTS);
    }
  });
  
  localStorage.setItem(STOCK_HISTORY_KEY, JSON.stringify(history));
};

// 특정 주식의 히스토리 가져오기
export const getStockHistory = (stockId, range = '1H') => {
  const history = JSON.parse(localStorage.getItem(STOCK_HISTORY_KEY) || '{}');
  const stockHistory = history[stockId] || [];
  
  if (stockHistory.length === 0) {
    return null;
  }
  
  const now = new Date();
  let startTime;
  
  switch (range) {
    case '1M':
      startTime = new Date(now.getTime() - 5 * 60 * 1000); // 5분으로 확장 (1분봉 5개)
      break;
    case '5M':
      startTime = new Date(now.getTime() - 30 * 60 * 1000); // 30분으로 확장 (5분봉 6개)
      break;
    case '10M':
      startTime = new Date(now.getTime() - 60 * 60 * 1000); // 1시간으로 확장 (10분봉 6개)
      break;
    case '1H':
      startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6시간으로 확장 (1시간봉 6개)
      break;
    case '1D':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1일
      break;
    case '1W':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1주
      break;
    case '1Mon':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 1달
      break;
    default:
      startTime = new Date(now.getTime() - 60 * 60 * 1000); // 기본 1시간
  }
  
  // 시간 범위에 맞는 데이터 필터링
  const filteredHistory = stockHistory.filter(point => 
    new Date(point.timestamp) >= startTime
  );
  
  // 데이터가 충분하지 않으면 null 반환
  if (filteredHistory.length < 2) {
    return null;
  }
  
  return filteredHistory;
};

// 차트용 데이터 포맷팅
export const formatHistoryForChart = (history, range = '1H') => {
  if (!history || history.length === 0) {
    return null;
  }
  
  const labels = [];
  const prices = [];
  
  history.forEach(point => {
    const date = new Date(point.timestamp);
    
    // 분봉 시간대
    if (['1M', '5M', '10M', '1H'].includes(range)) {
      labels.push(date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    } 
    // 일봉 시간대
    else {
      labels.push(date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      }));
    }
    
    prices.push(point.price);
  });
  
  return { labels, prices };
};

// 초기화
initializeStockHistory(); 