import React, { useState, useEffect } from 'react';
import { articleService } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';
import './NewsPage.css';

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

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (currentUserId) {
      loadAllData();
    }
  }, [currentUserId]);

  // 15초마다 새로운 기사 확인 (더 자주 확인)
  useEffect(() => {
    if (currentUserId) {
      const interval = setInterval(() => {
        console.log('🔄 새로운 기사 확인 중...');
        checkForNewArticles();
      }, 15000); // 15초마다 확인 (기존 30초에서 단축)

      return () => clearInterval(interval);
    }
  }, [currentUserId, lastUpdateTime]);

  // 새로운 기사만 확인하는 함수 (개선)
  const checkForNewArticles = async () => {
    try {
      const allArticlesData = await articleService.getAllArticles();
      
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
            showNotification(`새로운 경제 뉴스 ${newArticles.length}건 업데이트! 📰\n${articleTitles}`);
            
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
      const portfolio = await articleService.getUserPortfolio(currentUserId);
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

  // 브라우저 알림 표시 (개선)
  const showNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification('Money Kids News', {
        body: message,
        icon: '/favicon.ico',
        tag: 'news-update'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Money Kids News', {
            body: message,
            icon: '/favicon.ico',
            tag: 'news-update'
          });
        }
      });
    }
  };

  // 전체 데이터 로드
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 주식 목록 로드하여 ID -> 이름 매핑 생성
      try {
        const stocksData = await articleService.getAllStocks();
        const stockMapping = {};
        stocksData.forEach(stock => {
          stockMapping[stock.id] = stock.name;
        });
        setStockMap(stockMapping);
      } catch (stockError) {
        console.warn('주식 목록 조회 실패:', stockError);
        setStockMap({});
      }
      
      // 전체 기사 로드
      const allArticlesData = await articleService.getAllArticles();
      
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
        const portfolio = await articleService.getUserPortfolio(currentUserId);
        
        const myStocks = portfolio.stocks || [];
        console.log('📊 포트폴리오 주식 정보:', myStocks);
        
        // 보유 중인 주식만 필터링 (수량 > 0)
        const ownedStocks = myStocks.filter(stock => stock.quantity > 0);
        console.log('✅ 실제 보유 중인 주식:', ownedStocks);
        
        if (ownedStocks.length === 0) {
          console.log('⚠️ 보유 중인 주식이 없습니다.');
          setMyStockArticles([]);
          return;
        }
        
        // 전체 주식 목록을 가져와서 이름으로 ID 매핑
        const allStocksResponse = await fetch('http://localhost:8080/api/stocks');
        const allStocks = await allStocksResponse.json();
        console.log('📋 전체 주식 목록:', allStocks);
        
        // 주식 이름을 기반으로 ID 매핑 생성
        const stockNameToIdMap = {};
        allStocks.forEach(stock => {
          stockNameToIdMap[stock.name] = stock.id;
        });
        console.log('🗺️ 주식 이름-ID 매핑:', stockNameToIdMap);
        
        // 포트폴리오의 주식 이름을 ID로 변환
        const myStockIds = [];
        const myStockNames = [];
        const debugInfo = [];
        
        ownedStocks.forEach(stock => {
          const stockName = stock.stockName;
          myStockNames.push(stockName);
          
          // 정확한 이름 매칭으로 ID 찾기
          const stockId = stockNameToIdMap[stockName];
          
          if (stockId) {
            myStockIds.push(stockId);
            debugInfo.push({
              name: stockName,
              id: stockId,
              quantity: stock.quantity,
              matched: true
            });
          } else {
            // 부분 매칭 시도 (공백, 특수문자 제거 후)
            const cleanName = stockName.replace(/\s+/g, '').toLowerCase();
            const foundStock = allStocks.find(s => 
              s.name.replace(/\s+/g, '').toLowerCase().includes(cleanName) ||
              cleanName.includes(s.name.replace(/\s+/g, '').toLowerCase())
            );
            
            if (foundStock) {
              myStockIds.push(foundStock.id);
              debugInfo.push({
                name: stockName,
                id: foundStock.id,
                originalName: foundStock.name,
                quantity: stock.quantity,
                matched: true,
                partialMatch: true
              });
            } else {
              debugInfo.push({
                name: stockName,
                quantity: stock.quantity,
                matched: false,
                error: 'ID를 찾을 수 없음'
              });
            }
          }
        });
        
        console.log('🔍 주식 매칭 결과:', debugInfo);
        console.log('📌 매칭된 주식 ID들:', myStockIds);
        console.log('📌 매칭된 주식 이름들:', myStockNames);
        
        if (myStockIds.length === 0) {
          console.log('❌ 매칭된 주식 ID가 없습니다.');
          setMyStockArticles([]);
          return;
        }
        
        // 보유 주식 관련 기사 필터링
        const portfolioArticles = uniqueArticles.filter(article => {
          const matchById = myStockIds.includes(article.stockId);
          const matchByName = myStockNames.some(name => 
            article.title.includes(name) || 
            article.content.includes(name) ||
            (article.stockName && article.stockName.includes(name))
          );
          
          return matchById || matchByName;
        });
        
        console.log('📰 매칭된 포트폴리오 기사:', portfolioArticles);
        setMyStockArticles(portfolioArticles);
        
      } catch (error) {
        console.error('❌ 포트폴리오 기사 필터링 오류:', error);
        setMyStockArticles([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 상대적 시간 계산
  const getRelativeTime = (dateString) => {
    const articleDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now - articleDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return diffInMinutes <= 0 ? '방금 전' : `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return `${diffInDays}일 전`;
    }
  };

  // 주식 이름 가져오기
  const getStockName = (stockId) => {
    return stockMap[stockId] || stockId; // 매핑이 없으면 ID를 그대로 표시
  };

  // 주식 이름으로 ID 찾기 (역매핑)
  const getStockIdByName = (stockName) => {
    for (const [id, name] of Object.entries(stockMap)) {
      if (name === stockName) {
        return id;
      }
    }
    return null;
  };

  // 감정 분석 결과 추출 함수
  const getSentiment = (title) => {
    if (!title) return null;
    
    const sentimentMap = {
      '중립': { label: 'NEUTRAL', color: '#6c757d' },
      '긍정': { label: 'POSITIVE', color: '#28a745' },
      '부정': { label: 'NEGATIVE', color: '#dc3545' },
      '중성': { label: 'NEUTRAL', color: '#6c757d' },
      '호재': { label: 'POSITIVE', color: '#28a745' },
      '악재': { label: 'NEGATIVE', color: '#dc3545' },
      '보통': { label: 'NEUTRAL', color: '#6c757d' }
    };
    
    for (const [sentiment, info] of Object.entries(sentimentMap)) {
      if (title.startsWith(`${sentiment}:`)) {
        return info;
      }
    }
    
    return null;
  };

  // 기사용 고유 키 생성
  const getUniqueArticleKey = (article, index) => {
    return `article-${article.id}-${article.stockId}-${article.date}-${index}`;
  };

  // 기사 상세보기
  const handleReadMore = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
  };

  // 현재 표시할 기사 목록 (최신순 정렬)
  const currentArticles = (viewMode === 'all' ? articles : myStockArticles)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // 뉴스 제목과 내용을 그대로 표시 (백엔드에서 이미 자연스럽게 생성됨)
  const formatArticleTitle = (title) => {
    if (!title) return '새로운 소식';
    return title.trim() || '새로운 소식';
  };

  const formatArticleContent = (content) => {
    if (!content) return '자세한 내용은 추후 공개됩니다.';
    return content.trim() || '자세한 내용은 추후 공개됩니다.';
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>경제 소식을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <div className="header-content">
          <h1 className="page-title">
            MONEY KIDS JOURNAL
            <span className="live-indicator">
              🔴 실시간
            </span>
          </h1>
          <p className="page-subtitle">청소년을 위한 프리미엄 경제 뉴스 (30초마다 자동 업데이트)</p>
          <div className="publish-info">
            최신 시장 동향과 투자 인사이트를 제공합니다
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            전체 뉴스
          </button>
          <button 
            className={`filter-btn ${viewMode === 'my' ? 'active' : ''}`}
            onClick={() => setViewMode('my')}
          >
            내 포트폴리오 ({myStockArticles.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <div className="error-message">
            <strong>오류 발생:</strong> {error}
            <button className="retry-btn" onClick={loadAllData}>
              다시 시도
            </button>
          </div>
        </div>
      )}

      <div className="articles-container">
        {currentArticles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>
              {viewMode === 'my' ? '보유 주식 관련 기사가 없습니다' : '기사가 없습니다'}
            </h3>
            <p>
              {viewMode === 'my' 
                ? '주식을 구매하시면 관련 경제 소식을 받아보실 수 있습니다.' 
                : '잠시 후 다시 확인해보세요.'
              }
            </p>
          </div>
        ) : (
          <div className="news-list">
            {currentArticles.map((article, index) => (
              <article key={getUniqueArticleKey(article, index)} className="news-item">
                <div className="news-item-header">
                  <div className="news-meta">
                    <span className="news-time">{getRelativeTime(article.date)}</span>
                    {article.stockId && (
                      <span className="news-source">{getStockName(article.stockId)}</span>
                    )}
                  </div>
                </div>
                
                <div className="news-content" onClick={() => handleReadMore(article)}>
                  <h2 className="news-headline">{formatArticleTitle(article.title)}</h2>
                  <p className="news-excerpt">
                    {(() => {
                      const content = formatArticleContent(article.content);
                      return content.length > 180 
                        ? `${content.substring(0, 180)}...` 
                        : content;
                    })()}
                  </p>
                </div>
                
                <div className="news-item-footer">
                  <button 
                    className="read-more-link"
                    onClick={() => handleReadMore(article)}
                  >
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* 기사 상세보기 모달 */}
      {showModal && selectedArticle && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{formatArticleTitle(selectedArticle.title)}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-meta">
                <span className="modal-time">
                  🕐 {getRelativeTime(selectedArticle.date)}
                </span>
                                 {selectedArticle.stockId && (
                   <span className="modal-stock">
                     📊 관련 종목: {getStockName(selectedArticle.stockId)}
                   </span>
                 )}
              </div>
              <div className="modal-content-text">
                {formatArticleContent(selectedArticle.content)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage; 