import React, { useState, useEffect } from 'react';
import { stockApi, articleApi } from '../services/apiService';
import './NewsPage.css';

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState('all');
  const [selectedEffect, setSelectedEffect] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 기사와 주식 데이터를 병렬로 가져오기
      const [articlesResult, stocksResult] = await Promise.allSettled([
        articleApi.getAllArticles(),
        stockApi.getAllStocks()
      ]);

      // 기사 데이터 처리
      if (articlesResult.status === 'fulfilled' && articlesResult.value?.code === 200) {
        setArticles(articlesResult.value.data || []);
      }

      // 주식 데이터 처리
      if (stocksResult.status === 'fulfilled') {
        const stockData = stocksResult.value || [];
        setStocks(Array.isArray(stockData) ? stockData : []);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNews = async () => {
    try {
      setIsGenerating(true);
      const response = await articleApi.generateNews();
      
      if (response.code === 200) {
        // 성공적으로 생성된 후 데이터 다시 로드
        await fetchData();
        alert(`${response.data.generatedCount}개의 뉴스가 생성되었습니다!`);
      } else {
        alert(response.msg || 'AI 뉴스 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 뉴스 생성 실패:', error);
      alert('AI 뉴스 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 필터링된 기사 목록
  const filteredArticles = articles.filter(article => {
    const stockFilter = selectedStock === 'all' || article.stockId === selectedStock;
    const effectFilter = selectedEffect === 'all' || article.effect === selectedEffect;
    return stockFilter && effectFilter;
  });

  // 뉴스 통계
  const newsStats = {
    total: articles.length,
    호재: articles.filter(a => a.effect === '호재').length,
    악재: articles.filter(a => a.effect === '악재').length,
    중립: articles.filter(a => a.effect === '중립').length
  };

  // 효과 배지 정보
  const getEffectBadge = (effect) => {
    const badges = {
      '호재': { class: 'positive', icon: '📈', text: '호재' },
      '악재': { class: 'negative', icon: '📉', text: '악재' },
      '중립': { class: 'neutral', icon: '➖', text: '중립' }
    };
    return badges[effect] || badges['중립'];
  };

  // 주가 변동 클래스
  const getPriceChangeClass = (beforePrice, currentPrice) => {
    if (!beforePrice || beforePrice === 0) return 'neutral';
    if (currentPrice > beforePrice) return 'positive';
    if (currentPrice < beforePrice) return 'negative';
    return 'neutral';
  };

  return (
    <div className="news-page">
      <div className="news-header">
        <div className="header-content">
          <h1>📰 AI 경제 뉴스</h1>
          <p>AI가 생성한 최신 경제 뉴스를 확인하고 주식 시장 변화를 체험해보세요</p>
        </div>
        <button 
          className={`generate-btn ${isGenerating ? 'generating' : ''}`}
          onClick={handleGenerateNews}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="spinner"></div>
              AI 뉴스 생성 중...
            </>
          ) : (
            <>
              <i className="fas fa-robot"></i>
              AI 뉴스 생성
            </>
          )}
        </button>
      </div>

      {/* 뉴스 통계 대시보드 */}
      <div className="news-stats">
        <div className="dashboard-card total">
          <div className="dashboard-icon">
            <i className="fas fa-newspaper"></i>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-value">{newsStats.total}</div>
            <div className="dashboard-label">전체 뉴스</div>
          </div>
        </div>
        <div className="dashboard-card positive">
          <div className="dashboard-icon">
            <i className="fas fa-arrow-trend-up"></i>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-value">{newsStats.호재}</div>
            <div className="dashboard-label">호재 뉴스</div>
          </div>
        </div>
        <div className="dashboard-card negative">
          <div className="dashboard-icon">
            <i className="fas fa-arrow-trend-down"></i>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-value">{newsStats.악재}</div>
            <div className="dashboard-label">악재 뉴스</div>
          </div>
        </div>
        <div className="dashboard-card neutral">
          <div className="dashboard-icon">
            <i className="fas fa-minus"></i>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-value">{newsStats.중립}</div>
            <div className="dashboard-label">중립 뉴스</div>
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="filter-section">
        <div className="filter-group">
          <button
            className={`filter-btn ${selectedStock === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStock('all')}
          >
            <i className="fas fa-globe"></i>
            전체 종목
          </button>
          {stocks.map((stock, index) => (
            <button
              key={`stock-filter-${stock.id || index}`}
              className={`filter-btn ${selectedStock === stock.id ? 'active' : ''}`}
              onClick={() => setSelectedStock(stock.id)}
            >
              {stock.name}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <button
            className={`filter-btn effect-all ${selectedEffect === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedEffect('all')}
          >
            전체 효과
          </button>
          <button
            className={`filter-btn effect-positive ${selectedEffect === '호재' ? 'active' : ''}`}
            onClick={() => setSelectedEffect('호재')}
          >
            <i className="fas fa-smile"></i>
            호재
          </button>
          <button
            className={`filter-btn effect-negative ${selectedEffect === '악재' ? 'active' : ''}`}
            onClick={() => setSelectedEffect('악재')}
          >
            <i className="fas fa-frown"></i>
            악재
          </button>
          <button
            className={`filter-btn effect-neutral ${selectedEffect === '중립' ? 'active' : ''}`}
            onClick={() => setSelectedEffect('중립')}
          >
            <i className="fas fa-meh"></i>
            중립
          </button>
        </div>
      </div>

      {/* 뉴스 목록 */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-animation">
            <div className="news-skeleton"></div>
            <div className="news-skeleton"></div>
            <div className="news-skeleton"></div>
          </div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-newspaper"></i>
          </div>
          <h3>아직 뉴스가 없어요</h3>
          <p>AI 뉴스 생성 버튼을 눌러 새로운 뉴스를 만들어보세요!</p>
        </div>
      ) : (
        <div className="news-grid">
          {filteredArticles.map((article, index) => {
            const effectBadge = getEffectBadge(article.effect);
            const relatedStock = stocks.find(s => s.id === article.stockId);
            
            return (
              <article key={`article-${article.id || index}`} className={`news-card effect-${article.effect.toLowerCase()}`}>
                <div className="news-header">
                  <span className={`effect-badge ${effectBadge.class}`}>
                    {effectBadge.icon}
                    {effectBadge.text}
                  </span>
                  <span className="news-date">
                    <i className="fas fa-clock"></i>
                    {new Date(article.date).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="news-title">{article.title}</h3>
                
                <p className="news-content">{article.content}</p>
                
                {relatedStock && (
                  <div className="news-stock-info">
                    <div className="stock-tag">
                      <i className="fas fa-tag"></i>
                      {relatedStock.name}
                    </div>
                    <div className={`stock-price ${getPriceChangeClass(relatedStock.beforePrice, relatedStock.price)}`}>
                      ₩{relatedStock.price.toLocaleString()}
                      <span className="price-change">
                        ({relatedStock.beforePrice && relatedStock.beforePrice > 0 ? 
                          `${((relatedStock.price - relatedStock.beforePrice) / relatedStock.beforePrice * 100).toFixed(2)}%` : 
                          '0%'})
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="news-actions">
                  <button className="action-btn like">
                    <i className="far fa-heart"></i>
                    좋아요
                  </button>
                  <button className="action-btn share">
                    <i className="fas fa-share"></i>
                    공유
                  </button>
                  <button className="action-btn read-more">
                    자세히 보기
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* AI 뉴스 설명 섹션 */}
      <div className="ai-info-section">
        <div className="ai-info-card">
          <div className="ai-info-icon">
            <i className="fas fa-robot"></i>
          </div>
          <div className="ai-info-content">
            <h3>AI 뉴스 시스템이란?</h3>
            <p>
              최신 인공지능 기술을 활용하여 실시간 주식 정보를 바탕으로 
              경제 뉴스를 자동으로 생성합니다. 청소년들이 쉽게 이해할 수 있도록 
              맞춤형으로 작성된 뉴스를 통해 경제 공부를 더욱 재미있게 할 수 있어요!
            </p>
            <div className="ai-features">
              <div className="ai-feature">
                <i className="fas fa-brain"></i>
                <span>스마트 분석</span>
              </div>
              <div className="ai-feature">
                <i className="fas fa-clock"></i>
                <span>실시간 생성</span>
              </div>
              <div className="ai-feature">
                <i className="fas fa-user-graduate"></i>
                <span>맞춤형 콘텐츠</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage; 