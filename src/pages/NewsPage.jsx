import React, { useState, useEffect } from 'react';
import { articleService } from '../services/articleService';
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

  // 임시 사용자 ID (실제로는 로그인된 사용자 정보에서 가져올 것)
  const currentUserId = 'root';



  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadAllData();
  }, []);

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
      
      // 사용자 포트폴리오를 통해 보유 주식 기사 필터링
      try {
        const portfolio = await articleService.getUserPortfolio(currentUserId);
        
        const myStocks = portfolio.stocks || [];
        
        // 포트폴리오의 stocks 배열에서 stockName을 stockId로 변환
        const myStockIds = myStocks.map(stock => {
          // stockName을 사용해서 stockId 찾기
          if (stock.stockName) {
            return getStockIdByName(stock.stockName);
          }
          // 기존 방식으로도 시도
          return stock.stockId || stock.id || stock.stock_id;
        }).filter(id => id); // undefined/null 값 제거
        
        // 내 주식에 해당하는 기사들만 필터링 (중복 제거된 기사에서)
        const myArticles = uniqueArticles.filter(article => 
          myStockIds.includes(article.stockId)
        );
        setMyStockArticles(myArticles);
      } catch (portfolioError) {
        console.warn('포트폴리오 조회 실패:', portfolioError);
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

  // 기사 제목 정리 함수
  const cleanTitle = (title) => {
    if (!title || title.trim() === '') {
      return '제목 없음';
    }
    
    // "중립:", "긍정:", "부정:" 등의 접두사 제거
    const prefixPattern = /^(중립|긍정|부정|중성|호재|악재|보통):\s*/;
    const cleanedTitle = title.replace(prefixPattern, '').trim();
    
    // 정리 후에도 빈 문자열이면 기본 제목 반환
    return cleanedTitle || '제목 없음';
  };

  // 기사 내용 정리 함수
  const cleanContent = (content) => {
    if (!content || content.trim() === '') {
      return '내용을 불러올 수 없습니다.';
    }
    return content.trim();
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
          </h1>
          <p className="page-subtitle">청소년을 위한 프리미엄 경제 뉴스</p>
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
                  <h2 className="news-headline">{cleanTitle(article.title)}</h2>
                  <p className="news-excerpt">
                    {(() => {
                      const content = cleanContent(article.content);
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
              <h2 className="modal-title">{cleanTitle(selectedArticle.title)}</h2>
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
                {cleanContent(selectedArticle.content)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsPage; 