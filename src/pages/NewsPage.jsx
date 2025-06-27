import React, { useState, useEffect, useCallback } from 'react';
import { articleAPI, userAPI } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import './NewsPage.css';
import { useNotification } from '../contexts/NotificationContext';

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [myStockArticles, setMyStockArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stockMap, setStockMap] = useState({}); // 주식 ID -> 이름 매핑
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const { getCurrentUserId } = useAuth();
  const currentUserId = getCurrentUserId();
  const { showNotification } = useNotification();

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (currentUserId) {
      loadAllData();
    }
  }, [currentUserId]);

  // 30초마다 새로운 기사 확인 (배포 최적화)
  useEffect(() => {
    if (currentUserId) {
      const interval = setInterval(() => {
        console.log('🔄 새로운 기사 확인 중...');
        checkForNewArticles();
      }, 30000); // 30초마다 확인 (배포 최적화)

      return () => clearInterval(interval);
    }
  }, [currentUserId, lastUpdateTime]);

  // 새로운 기사만 확인하는 함수 (개선)
  const checkForNewArticles = async () => {
    try {
      const allArticlesData = await articleAPI.getAll();
      
      if (allArticlesData && allArticlesData.length > 0) {
        // 최신 기사의 시간을 확인
        const sortedArticles = allArticlesData.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestArticleTime = new Date(sortedArticles[0].date);
        
        // 마지막 업데이트 시간보다 새로운 기사가 있으면 전체 새로고침
        if (!lastUpdateTime || latestArticleTime > lastUpdateTime) {
          console.log('🆕 새로운 기사 발견! 데이터 새로고침');
          
          // 새로 추가된 기사들 찾기
          const newArticles = lastUpdateTime ? 
            sortedArticles.filter(article => new Date(article.date) > lastUpdateTime) : 
            [sortedArticles[0]];
          
          setLastUpdateTime(latestArticleTime);
          loadAllData();
          
          // 알림 표시 (첫 로드가 아닌 경우에만)
          if (lastUpdateTime) {
            const articleTitles = newArticles.map(a => a.title).join(', ');
            showNewsNotification(`새로운 경제 뉴스 ${newArticles.length}건 업데이트! 📰\n${articleTitles}`);
            
            // 🌟 포트폴리오 관련 기사가 있는지 확인
            checkPortfolioRelatedNews(newArticles);
          }
        }
      }
    } catch (error) {
      console.error('새 기사 확인 실패:', error);
    }
  };

  // 포트폴리오 관련 새 기사 확인 및 특별 알림
  const checkPortfolioRelatedNews = async (newArticles) => {
    try {
      const portfolio = await articleAPI.getUserPortfolio(currentUserId);
      const myStocks = portfolio.stocks || [];
      const ownedStocks = myStocks.filter(stock => stock.quantity > 0);
      
      if (ownedStocks.length === 0) return;
      
      const myStockNames = ownedStocks.map(stock => stock.stockName);
      
      // 포트폴리오 관련 새 기사 찾기
      const portfolioNews = newArticles.filter(article => 
        myStockNames.some(stockName => 
          article.title.includes(stockName) || 
          article.content.includes(stockName)
        )
      );
      
      // 포트폴리오 관련 기사가 있으면 특별 알림
      if (portfolioNews.length > 0 && Notification.permission === 'granted') {
        const relatedStocks = portfolioNews.map(article => {
          const relatedStock = myStockNames.find(stockName => 
            article.title.includes(stockName) || article.content.includes(stockName)
          );
          return `📊 ${relatedStock}: ${article.title}`;
        }).join('\n');
        
        new Notification('🎯 보유 주식 관련 뉴스!', {
          body: `포트폴리오 관련 새 기사 ${portfolioNews.length}건:\n${relatedStocks}`,
          icon: '/favicon.ico',
          tag: 'portfolio-news'
        });
      }
    } catch (error) {
      console.error('포트폴리오 관련 기사 확인 실패:', error);
    }
  };

  // 전체 데이터 로드
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 주식 목록 로드하여 ID -> 이름 매핑 생성
      try {
        const stocksData = await articleAPI.getAllStocks();
        const stockMapping = {};
        stocksData.forEach(stock => {
          stockMapping[stock.id] = stock.name;
        });
        setStockMap(stockMapping);
      } catch (stockError) {
        console.warn('주식 목록 조회 실패:', stockError);
        setStockMap({});
      }
      
      // 전체 기사 로드 (이미 articleAPI에서 24시간 필터링됨)
      const allArticlesData = await articleAPI.getAll();
      
      // 중복 기사 제거 및 데이터 검증 (ID + stockId + title 조합으로 중복 확인)
      const uniqueArticles = [];
      const seen = new Set();
      
      (allArticlesData || []).forEach(article => {
        // 기본 데이터 검증
        if (!article || !article.id) {
          console.warn('잘못된 기사 데이터:', article);
          return;
        }
        
        // 제목이 없거나 빈 경우 기본값 설정
        const title = article.title || '제목 없음';
        const content = article.content || '내용이 없습니다.';
        
        const uniqueKey = `${article.id}-${article.stockId}-${title}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          uniqueArticles.push({
            ...article,
            title,
            content
          });
        }
      });
      
      setArticles(uniqueArticles);
      
      // 최신 기사 시간 업데이트
      if (uniqueArticles.length > 0) {
        const sortedArticles = uniqueArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLastUpdateTime(new Date(sortedArticles[0].date));
      }
      
      // 사용자 포트폴리오를 통해 보유 주식 기사 필터링
      try {
        const portfolio = await articleAPI.getUserPortfolio(currentUserId);
        
        const myStocks = portfolio.stocks || [];
        console.log('📊 포트폴리오 주식 정보:', myStocks);
        
        // 보유 중인 주식만 필터링 (수량 > 0)
        const ownedStocks = myStocks.filter(stock => stock.quantity > 0);
        
        if (ownedStocks.length === 0) {
          setMyStockArticles([]);
          console.log('📭 보유 주식이 없습니다');
        } else {
          const myStockIds = ownedStocks.map(stock => stock.stockId);
          const myStockNames = ownedStocks.map(stock => stock.stockName);
          
          console.log('🎯 보유 주식 ID:', myStockIds);
          console.log('🎯 보유 주식명:', myStockNames);
          
          // 보유 주식 관련 기사 필터링 (ID와 이름 모두 확인)
          const filteredMyStockArticles = uniqueArticles.filter(article => {
            const isMyStockById = myStockIds.includes(article.stockId);
            const isMyStockByName = myStockNames.some(stockName => 
              article.title.includes(stockName) || 
              article.content.includes(stockName)
            );
            return isMyStockById || isMyStockByName;
          });
          
          console.log('🎯 내 주식 관련 기사 개수:', filteredMyStockArticles.length);
          setMyStockArticles(filteredMyStockArticles);
        }
      } catch (portfolioError) {
        console.error('포트폴리오 조회 실패:', portfolioError);
        setMyStockArticles([]);
      }
      
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setError('뉴스를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // 시간 정보를 쉽게 읽을 수 있는 형태로 변환
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const articleDate = new Date(dateString);
    const diffInMs = now - articleDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  };

  // 주식 이름 가져오기
  const getStockName = (stockId) => {
    return stockMap[stockId] || `주식 ${stockId}`;
  };

  // 주식명으로 ID 찾기
  const getStockIdByName = (stockName) => {
    for (const [id, name] of Object.entries(stockMap)) {
      if (name === stockName) {
        return parseInt(id);
      }
    }
    return null;
  };

  // 기사 감정 분석 (제목 기반)
  const getSentiment = (title) => {
    const positiveWords = ['상승', '증가', '호조', '성장', '상한가', '급등', '돌파', '신고가', '플러스'];
    const negativeWords = ['하락', '감소', '부진', '하한가', '급락', '폭락', '마이너스', '침체'];
    
    const lowerTitle = title.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerTitle.includes(word));
    const hasNegative = negativeWords.some(word => lowerTitle.includes(word));
    
    if (hasPositive && !hasNegative) return '📈';
    if (hasNegative && !hasPositive) return '📉';
    return '📊';
  };

  // 고유 키 생성
  const getUniqueArticleKey = (article, index) => {
    return `${article.id}-${article.stockId}-${index}`;
  };

  const handleReadMore = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
  };

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 기사 제목 포맷팅
  const formatArticleTitle = (title) => {
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  };

  // 기사 내용 포맷팅
  const formatArticleContent = (content) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  const showNewsNotification = (message) => {
    showNotification('Money Kids News', {
      body: message,
      tag: 'news-update'
    });
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>최신 경제 뉴스를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-page">
        <div className="error">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
          <button onClick={loadAllData} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <h1>📰 경제 소식</h1>
        <p>실시간 경제 뉴스와 시장 동향을 확인하세요!</p>
        
        {/* 뉴스 업데이트 상태 */}
        <div className="news-stats">
          <div className="stat-item">
            <span className="stat-label">전체 뉴스</span>
            <span className="stat-value">{articles.length}건</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">내 주식 관련</span>
            <span className="stat-value">{myStockArticles.length}건</span>
          </div>
          {lastUpdateTime && (
            <div className="stat-item">
              <span className="stat-label">마지막 업데이트</span>
              <span className="stat-value">{getRelativeTime(lastUpdateTime.toISOString())}</span>
            </div>
          )}
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="news-tabs">
        <button 
          className={`tab-button ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          전체 뉴스 ({articles.length})
        </button>
        <button 
          className={`tab-button ${viewMode === 'my' ? 'active' : ''}`}
          onClick={() => setViewMode('my')}
        >
          내 주식 뉴스 ({myStockArticles.length})
        </button>
      </div>

      {/* 뉴스 목록 */}
      <div className="news-content">
        {viewMode === 'all' ? (
          <div className="news-grid">
            {articles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>뉴스가 없습니다</h3>
                <p>아직 새로운 경제 뉴스가 없습니다.</p>
              </div>
            ) : (
              articles.map((article, index) => (
                <div key={getUniqueArticleKey(article, index)} className="news-card">
                  <div className="news-card-header">
                    <span className="sentiment-icon">{getSentiment(article.title)}</span>
                    <span className="stock-name">{getStockName(article.stockId)}</span>
                    <span className="news-time">{getRelativeTime(article.date)}</span>
                  </div>
                  <h3 className="news-title">{formatArticleTitle(article.title)}</h3>
                  <p className="news-preview">{formatArticleContent(article.content)}</p>
                  <button 
                    className="read-more-button"
                    onClick={() => handleReadMore(article)}
                  >
                    자세히 보기 →
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="news-grid">
            {myStockArticles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <h3>내 주식 관련 뉴스가 없습니다</h3>
                <p>보유 주식에 대한 새로운 뉴스가 없습니다.<br/>투자하고 관련 뉴스를 받아보세요!</p>
              </div>
            ) : (
              myStockArticles.map((article, index) => (
                <div key={getUniqueArticleKey(article, index)} className="news-card my-stock">
                  <div className="news-card-header">
                    <span className="sentiment-icon">{getSentiment(article.title)}</span>
                    <span className="stock-name my-stock-badge">{getStockName(article.stockId)}</span>
                    <span className="news-time">{getRelativeTime(article.date)}</span>
                  </div>
                  <h3 className="news-title">{formatArticleTitle(article.title)}</h3>
                  <p className="news-preview">{formatArticleContent(article.content)}</p>
                  <button 
                    className="read-more-button"
                    onClick={() => handleReadMore(article)}
                  >
                    자세히 보기 →
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 뉴스 상세 모달 */}
      {showModal && selectedArticle && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <span className="sentiment-icon large">{getSentiment(selectedArticle.title)}</span>
                <div>
                  <h2>{selectedArticle.title}</h2>
                  <div className="modal-meta">
                    <span className="stock-name">{getStockName(selectedArticle.stockId)}</span>
                    <span className="news-time">{getRelativeTime(selectedArticle.date)}</span>
                  </div>
                </div>
              </div>
              <button className="close-button" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p>{selectedArticle.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage; 