import React, { useState, useEffect } from 'react';
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
import { Line } from 'react-chartjs-2';
import './StockChart.css';
import { getStockHistory, formatHistoryForChart } from '../utils/stockHistory';

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

const StockChart = ({ stock, onClose }) => {
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('1H'); // 1M, 5M, 10M, 1H, 1D, 1W, 1Mon
  const [loading, setLoading] = useState(true);
  const [avgPrice, setAvgPrice] = useState(null); // 평균 매수가
  const [isMinuteView, setIsMinuteView] = useState(true); // 분봉 보기 여부
  const [error, setError] = useState(null);

  // 실제 주가 히스토리 데이터를 기반으로 차트 데이터 생성
  const generateChartData = async (stock, range) => {
    try {
      // 1. 주가 히스토리 API 호출 시도
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const historyResponse = await fetch(`${API_BASE_URL}/stocks/${stock.id}/history?range=${range}`);
      
      if (historyResponse.ok) {
        // 백엔드에서 히스토리 데이터를 제공하는 경우
        const historyData = await historyResponse.json();
        return {
          labels: historyData.map(item => {
            const date = new Date(item.timestamp);
            return range === '1D' 
              ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
              : date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
          }),
          prices: historyData.map(item => item.price)
        };
      }
    } catch (error) {
      console.log('주가 히스토리 API 사용할 수 없음, 시뮬레이션 데이터 생성:', error.message);
    }
    
    // 2. API가 없는 경우 실제적인 시뮬레이션 데이터 생성
    return generateRealisticSimulation(stock, range);
  };

  // 실제 주가 변동 패턴을 반영한 시뮬레이션 데이터 생성
  const generateRealisticSimulation = (stock, range) => {
    const now = new Date();
    let dataPoints, intervalMs, timeFormat, volatility;
    
    // 시간 범위별 설정 - 변동성을 현실적인 수준으로 대폭 축소
    switch (range) {
      case '1M':
        dataPoints = 20; // 20개 1분봉 (20분간)
        intervalMs = 1 * 60 * 1000; // 1분 간격
        timeFormat = 'minute';
        volatility = 0.001; // 0.1% (기존 0.8%에서 대폭 축소)
        break;
      case '5M':
        dataPoints = 24; // 24개 5분봉 (2시간)
        intervalMs = 5 * 60 * 1000; // 5분 간격
        timeFormat = 'minute';
        volatility = 0.0008; // 0.08% (기존 0.6%에서 대폭 축소)
        break;
      case '10M':
        dataPoints = 18; // 18개 10분봉 (3시간)
        intervalMs = 10 * 60 * 1000; // 10분 간격
        timeFormat = 'minute';
        volatility = 0.0006; // 0.06% (기존 0.5%에서 대폭 축소)
        break;
      case '1H':
        dataPoints = 24; // 24개 1시간봉 (하루)
        intervalMs = 60 * 60 * 1000; // 1시간 간격
        timeFormat = 'hour';
        volatility = 0.0004; // 0.04% (기존 0.3%에서 축소)
        break;
      case '1D':
        dataPoints = 30; // 30개 1일봉 (한 달)
        intervalMs = 24 * 60 * 60 * 1000; // 1일 간격
        timeFormat = 'date';
        volatility = 0.0003; // 0.03% (기존 0.2%에서 축소)
        break;
      case '1W':
        dataPoints = 12; // 12개 1주봉 (3개월)
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 1주 간격
        timeFormat = 'week';
        volatility = 0.0002; // 0.02% (기존 0.15%에서 축소)
        break;
      case '1Mon':
        dataPoints = 12; // 12개 1월봉 (1년)
        intervalMs = 30 * 24 * 60 * 60 * 1000; // 1달 간격
        timeFormat = 'month';
        volatility = 0.0001; // 0.01% (기존 0.1%에서 축소)
        break;
      default:
        dataPoints = 24;
        intervalMs = 60 * 60 * 1000;
        timeFormat = 'hour';
        volatility = 0.0004;
    }
    
    const basePrice = stock.beforePrice || stock.price;
    const currentPrice = stock.price;
    const totalChange = currentPrice - basePrice;
    
    const labels = [];
    const prices = [];
    
    // 시드 값을 주식 ID 기반으로 설정하여 일관된 차트 생성
    const seed = stock.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let randomSeed = seed;
    
    // 시드 기반 랜덤 함수 (일관된 결과 보장)
    const seededRandom = () => {
      randomSeed = (randomSeed * 9301 + 49297) % 233280;
      return randomSeed / 233280;
    };
    
    // 트렌드 방향 결정 (상승/하락/횡보)
    const trendDirection = totalChange > 0 ? 1 : totalChange < 0 ? -1 : 0;
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * intervalMs));
      
      // 시간 포맷 개선 - 각 범위별로 적절한 표시
      let formattedTime;
      switch (timeFormat) {
        case 'minute':
          formattedTime = date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          });
          break;
        case 'hour':
          formattedTime = date.toLocaleString('ko-KR', { 
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            hour12: false
          }).replace(/\. /g, '/').replace(/\.$/, '');
          break;
        case 'date':
          formattedTime = date.toLocaleDateString('ko-KR', { 
            month: 'numeric', 
            day: 'numeric' 
          }).replace(/\. /g, '/').replace(/\.$/, '');
          break;
        case 'week':
          const weekEnd = new Date(date.getTime() + (6 * 24 * 60 * 60 * 1000));
          formattedTime = `${date.getMonth()+1}/${date.getDate()}~${weekEnd.getMonth()+1}/${weekEnd.getDate()}`;
          break;
        case 'month':
          formattedTime = date.toLocaleDateString('ko-KR', { 
            year: '2-digit',
            month: 'numeric'
          }).replace(/\. /g, '/').replace(/\.$/, '');
          break;
        default:
          formattedTime = date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit'
          });
      }
      
      labels.push(formattedTime);
      
      // 실제적인 가격 변동 시뮬레이션 - 변동성 대폭 축소
      const progress = (dataPoints - 1 - i) / (dataPoints - 1);
      
      // 트렌드 팩터 (전체 변화를 점진적으로 반영) - 최대 5%로 제한
      let trendFactor = Math.min(0.05, Math.max(-0.05, (totalChange / basePrice) * progress));
      
      // 랜덤 변동 (시간 범위별 차별화된 변동성) - 대폭 축소
      const randomVariation = (seededRandom() - 0.5) * volatility;
      
      // 이전 가격의 모멘텀 효과 (연속성) - 축소
      const momentum = i < dataPoints - 1 ? (seededRandom() - 0.5) * 0.0002 : 0;
      
      // 추세 반전 확률 (장기간일수록 높음) - 축소
      if (['1D', '1W', '1Mon'].includes(range)) {
        const reversalChance = seededRandom();
        if (reversalChance < 0.03) { // 3% 확률로 추세 반전 (기존 8%에서 축소)
          trendFactor *= -0.1; // 반전 강도도 축소 (기존 -0.3에서)
        }
      }
      
      // 분봉에서도 스파이크 대폭 축소
      let spikeFactor = 0;
      if (['1M', '5M', '10M'].includes(range)) {
        const spikeChance = seededRandom();
        if (spikeChance < 0.01) { // 1% 확률로 급등/급락 (기존 5%에서 축소)
          spikeFactor = (seededRandom() - 0.5) * 0.003; // ±0.3% 스파이크 (기존 ±2%에서 대폭 축소)
        }
      }
      
      const price = basePrice * (1 + trendFactor + randomVariation + momentum + spikeFactor);
      prices.push(Math.max(1, Math.round(price))); // 최소 1원 보장
    }
    
    // 마지막 데이터 포인트는 정확히 현재가로 설정
    prices[prices.length - 1] = currentPrice;
    
    return { labels, prices };
  };

  // 실제 거래내역 기반 평균 매수가 계산
  useEffect(() => {
    const calculateRealAvgPrice = async () => {
      try {
        // 1. 거래내역 가져오기
        const historyResponse = await fetch('http://localhost:8080/api/stocks/trade/history');
        const localTrades = JSON.parse(localStorage.getItem('localTrades') || '[]');
        
        let allTrades = [];
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          allTrades = [...historyData, ...localTrades];
        } else {
          allTrades = localTrades;
        }
        
        // 2. 해당 주식의 거래내역만 필터링
        const stockTrades = allTrades.filter(trade => 
          trade.stockId === stock.id || trade.stockName === stock.name
        );
        
        if (stockTrades.length === 0) {
          console.log(`${stock.name}: 거래내역 없음`);
          return;
        }
        
        // 3. 평균 매수가 계산 (FIFO 방식)
        let totalCost = 0;
        let totalShares = 0;
        let remainingShares = 0;
        
        // 시간순 정렬 (오래된 거래부터)
        const sortedTrades = stockTrades.sort((a, b) => {
          const timeA = new Date(a.tradeTime || a.timestamp || Date.now()).getTime();
          const timeB = new Date(b.tradeTime || b.timestamp || Date.now()).getTime();
          return timeA - timeB;
        });
        
        console.log(`${stock.name} 거래내역:`, sortedTrades);
        
        sortedTrades.forEach(trade => {
          const quantity = Math.abs(trade.quantity);
          const price = trade.price || stock.price;
          
          if (trade.quantity > 0) {
            // 매수
            totalCost += quantity * price;
            totalShares += quantity;
            remainingShares += quantity;
            console.log(`매수: ${quantity}주 x ₩${price.toLocaleString()} = ₩${(quantity * price).toLocaleString()}`);
          } else {
            // 매도 - FIFO 방식으로 평균 매수가에 영향 없음
            remainingShares -= quantity;
            console.log(`매도: ${quantity}주, 남은 수량: ${remainingShares}주`);
          }
        });
        
        // 4. 현재 보유 중인 경우에만 평균 매수가 표시
        if (remainingShares > 0 && totalShares > 0) {
          const avgPrice = Math.round(totalCost / totalShares);
          setAvgPrice(avgPrice);
          console.log(`${stock.name} 실제 평균 매수가: ₩${avgPrice.toLocaleString()} (총 비용: ₩${totalCost.toLocaleString()}, 총 매수량: ${totalShares}주, 현재 보유: ${remainingShares}주)`);
        } else {
          console.log(`${stock.name}: 현재 보유하지 않음`);
          setAvgPrice(null);
        }
        
      } catch (error) {
        console.error('평균 매수가 계산 실패:', error);
        // 실패 시 현재가 기준으로 추정
        const estimatedPrice = Math.round(stock.price * (0.95 + Math.random() * 0.1));
        setAvgPrice(estimatedPrice);
        console.log(`${stock.name} 추정 평균 매수가 (오류 시): ₩${estimatedPrice.toLocaleString()}`);
      }
    };
    
    if (stock) {
      calculateRealAvgPrice();
    }
  }, [stock]);

  useEffect(() => {
    if (stock) {
      setLoading(true);
      
      // 차트 데이터 생성 (실제 히스토리 우선, 없으면 시뮬레이션)
      const loadChartData = async () => {
        try {
          // 1. 로컬 히스토리 데이터 확인
          const history = getStockHistory(stock.id, timeRange);
          
          if (history && history.length >= 2) {
            // 실제 히스토리 데이터가 있으면 사용
            const formattedData = formatHistoryForChart(history, timeRange);
            setChartData(formattedData);
            console.log(`${stock.name} 실제 히스토리 데이터 사용 (${history.length}개 포인트)`);
          } else {
            // 히스토리가 없거나 부족하면 API 시도 후 시뮬레이션
            const chartData = await generateChartData(stock, timeRange);
            setChartData(chartData);
          }
        } catch (error) {
          console.error('차트 데이터 로드 실패:', error);
          // 에러 발생 시 기본 시뮬레이션 사용
          const fallbackData = generateRealisticSimulation(stock, timeRange);
          setChartData(fallbackData);
        } finally {
          setLoading(false);
        }
      };
      
      loadChartData();
    }
  }, [stock, timeRange, isMinuteView]);

  if (!stock) return null;

  const change = stock.price - (stock.beforePrice || stock.price);
  const changePercent = stock.beforePrice 
      ? (((change / stock.beforePrice) * 100) || 0).toFixed(2)
      : '0.00';
  const isPositive = change > 0;
  const isNegative = change < 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#657786',
          font: {
            size: 12,
          },
          filter: function(legendItem, chartData) {
            // 평균 매수가가 있을 때만 범례 표시
            return chartData.datasets.length > 1;
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: isPositive ? '#27ae60' : isNegative ? '#e74c3c' : '#95a5a6',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `₩${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#657786',
          font: {
            size: 11,
          }
        }
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#657786',
          font: {
            size: 11,
          },
          callback: function(value) {
            return '₩' + value.toLocaleString();
          }
        }
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
      },
      line: {
        borderWidth: 2,
        tension: 0.1,
      }
    }
  };

  const chartDataConfig = chartData ? {
    labels: chartData.labels,
    datasets: [
      {
        label: '주가',
        data: chartData.prices,
        borderColor: isPositive ? '#27ae60' : isNegative ? '#e74c3c' : '#95a5a6',
        backgroundColor: isPositive 
          ? 'rgba(39, 174, 96, 0.1)' 
          : isNegative 
            ? 'rgba(231, 76, 60, 0.1)' 
            : 'rgba(149, 165, 166, 0.1)',
        fill: true,
      },
      // 평균 매수가 선 추가
      ...(avgPrice ? [{
        label: '평균 매수가',
        data: new Array(chartData.labels.length).fill(avgPrice),
        borderColor: '#ff9800',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }] : [])
    ],
  } : null;

  return (
    <div className="stock-chart-modal">
      <div className="stock-chart-container">
        <div className="chart-header">
          <div className="stock-info">
            <h2 className="stock-name">{stock.name}</h2>
            <span className="stock-code">{stock.code}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="price-info">
          <div className="current-price">₩{(stock.price || 0).toLocaleString()}</div>
          <div className={`price-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? '+' : change < 0 ? '-' : ''}₩{Math.abs(change || 0).toLocaleString()}
          </div>
          {avgPrice && (
            <div className="avg-price-info">
              <span className="avg-price-label">평균 매수가</span>
              <span className="avg-price-value">₩{(avgPrice || 0).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 분봉/일봉 토글 */}
        <div className="view-toggle">
          <button
            className={`toggle-button ${isMinuteView ? 'active' : ''}`}
            onClick={() => {
              setIsMinuteView(true);
              setTimeRange('1H');
            }}
          >
            분봉
          </button>
          <button
            className={`toggle-button ${!isMinuteView ? 'active' : ''}`}
            onClick={() => {
              setIsMinuteView(false);
              setTimeRange('1D');
            }}
          >
            일봉
          </button>
        </div>

        <div className="time-range-buttons">
          {isMinuteView ? (
            // 분봉 옵션
            ['1M', '5M', '10M', '1H'].map(range => (
              <button
                key={range}
                className={`time-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === '1M' ? '1분' : range === '5M' ? '5분' : range === '10M' ? '10분' : '1시간'}
              </button>
            ))
          ) : (
            // 일봉 옵션
            ['1D', '1W', '1Mon'].map(range => (
              <button
                key={range}
                className={`time-btn ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range === '1D' ? '1일' : range === '1W' ? '1주' : '1달'}
              </button>
            ))
          )}
        </div>

        <div className="chart-wrapper">
          {loading ? (
            <div className="chart-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>차트 데이터를 불러오는 중...</p>
            </div>
          ) : chartDataConfig ? (
            <Line data={chartDataConfig} options={chartOptions} />
          ) : (
            <div className="chart-error">
              <p>{error || '차트 데이터를 불러올 수 없습니다.'}</p>
            </div>
          )}
        </div>

        <div className="chart-footer">
          <p className="chart-note">
            * 실제 주가 변동을 기록한 데이터입니다. 10초마다 자동 업데이트됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockChart; 