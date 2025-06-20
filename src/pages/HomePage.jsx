import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { stockApi, articleApi, tradeApi, quizApi } from '../services/apiService';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stocks: [],
    articles: [],
    balance: null,
    userStats: {
      level: 1,
      points: 0,
      studyDays: 1,
      completedQuizzes: 0,
      portfolio: 1000000
    }
  });

  // 대시보드 데이터 로드
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 병렬로 여러 API 호출
        const [stocksResult, articlesResult] = await Promise.allSettled([
          stockApi.getAllStocks(),
          articleApi.getAllArticles(),
        ]);

        const newData = { ...dashboardData };

        // 주식 데이터 처리
        if (stocksResult.status === 'fulfilled') {
          newData.stocks = stocksResult.value.slice(0, 6); // 상위 6개만
        }

        // 기사 데이터 처리
        if (articlesResult.status === 'fulfilled') {
          const articles = articlesResult.value?.data || [];
          newData.articles = articles.slice(0, 3); // 최신 3개만
        }

        // 로그인된 사용자의 경우 추가 데이터 로드
        if (user) {
          try {
            // 잔고 정보 (인증 필요할 수 있음)
            // const balanceResult = await tradeApi.getBalance();
            // newData.balance = balanceResult;
          } catch (error) {
            console.log('잔고 정보 로드 실패 (로그인 필요):', error);
          }
        }

        setDashboardData(newData);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // AI 기사 생성 핸들러
  const handleGenerateNews = async () => {
    try {
      setLoading(true);
      const result = await articleApi.generateArticles({ count: 1 });
      
      if (result.code === 200) {
        // 기사 생성 성공 시 새로운 기사 목록 로드
        const articlesResult = await articleApi.getAllArticles();
        if (articlesResult.data) {
          setDashboardData(prev => ({
            ...prev,
            articles: articlesResult.data.slice(0, 3)
          }));
        }
        alert('새로운 AI 뉴스가 생성되었습니다!');
      }
    } catch (error) {
      console.error('뉴스 생성 실패:', error);
      alert('뉴스 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    { 
      id: 1, 
      icon: '🎯', 
      title: '첫 퀴즈 완료', 
      description: '경제 개념 퀴즈를 처음으로 완료했어요!',
      completed: dashboardData.userStats.completedQuizzes >= 1
    },
    { 
      id: 2, 
      icon: '📚', 
      title: '5일 연속 학습', 
      description: '5일 동안 꾸준히 공부했어요!',
      completed: dashboardData.userStats.studyDays >= 5
    },
    { 
      id: 3, 
      icon: '💎', 
      title: '레벨 5 달성', 
      description: '레벨 5에 도달했어요!',
      completed: dashboardData.userStats.level >= 5
    },
    { 
      id: 4, 
      icon: '🏆', 
      title: '퀴즈 마스터', 
      description: '10개의 퀴즈를 완료했어요!',
      completed: dashboardData.userStats.completedQuizzes >= 10
    }
  ];

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>안녕하세요, {user?.name || '머니'}님! 👋</h1>
        <p>오늘도 경제 공부로 스마트한 하루를 시작해볼까요?</p>
      </div>

      {/* 실시간 주식 정보 */}
      <div className="market-overview">
        <div className="section-header">
          <h3>📈 실시간 주식 현황</h3>
          <button 
            className="refresh-btn"
            onClick={() => window.location.reload()}
          >
            새로고침
          </button>
        </div>
        <div className="stocks-grid">
          {dashboardData.stocks.map(stock => (
            <div key={stock.id} className="stock-card" onClick={() => navigate('/investment')}>
              <div className="stock-info">
                <h4>{stock.name}</h4>
                <p className="stock-category">{stock.category}</p>
              </div>
              <div className="stock-price">
                <span className="price">₩{stock.price?.toLocaleString()}</span>
                <span className={`change ${stock.price > stock.beforePrice ? 'positive' : 'negative'}`}>
                  {stock.price > stock.beforePrice ? '+' : ''}
                  {((stock.price - stock.beforePrice) / stock.beforePrice * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 뉴스 섹션 */}
      <div className="news-section">
        <div className="section-header">
          <h3>📰 AI 경제 뉴스</h3>
          <button 
            className="generate-news-btn"
            onClick={handleGenerateNews}
            disabled={loading}
          >
            {loading ? '생성 중...' : '🤖 AI 뉴스 생성'}
          </button>
        </div>
        <div className="news-grid">
          {dashboardData.articles.length > 0 ? (
            dashboardData.articles.map(article => (
              <div key={article.id} className="news-card" onClick={() => navigate('/news')}>
                <div className={`news-effect ${article.effect?.toLowerCase()}`}>
                  {article.effect === '호재' ? '📈' : article.effect === '악재' ? '📉' : '📊'}
                  {article.effect}
                </div>
                <h4>{article.title}</h4>
                <p>{article.content?.substring(0, 100)}...</p>
                <span className="news-date">
                  {new Date(article.date).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="no-news">
              <p>아직 생성된 뉴스가 없습니다.</p>
              <button onClick={handleGenerateNews} className="generate-first-news">
                첫 번째 AI 뉴스 생성하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-label">모의 투자 자산</div>
            <div className="stat-value">₩{dashboardData.userStats.portfolio.toLocaleString()}</div>
            <div className="stat-change positive">+₩50,000 (4.2%)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-label">완료한 퀴즈</div>
            <div className="stat-value">{dashboardData.userStats.completedQuizzes}개</div>
            <div className="stat-sublabel">이번 주 +{Math.max(0, dashboardData.userStats.completedQuizzes - 10)}개</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌟</div>
          <div className="stat-info">
            <div className="stat-label">학습 레벨</div>
            <div className="stat-value">{dashboardData.userStats.level}단계</div>
            <div className="stat-sublabel">다음 레벨까지 {Math.max(0, 500 - (dashboardData.userStats.points % 500))}점</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <div className="stat-label">연속 학습</div>
            <div className="stat-value">{dashboardData.userStats.studyDays}일</div>
            <div className="stat-sublabel">목표: 30일</div>
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="quick-actions">
        <h3>빠른 메뉴</h3>
        <div className="action-grid">
          <div className="action-card" onClick={() => navigate('/learn')}>
            <div className="action-icon">📚</div>
            <h4>경제 배우기</h4>
            <p>개념 학습하기</p>
            <p className="action-description">경제 개념을 체계적으로 학습해보세요</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/quiz')}>
            <div className="action-icon">🧩</div>
            <h4>퀴즈 풀기</h4>
            <p>실력 테스트</p>
            <p className="action-description">다양한 난이도의 퀴즈로 실력을 확인하세요</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/investment')}>
            <div className="action-icon">💰</div>
            <h4>모의 투자</h4>
            <p>투자 체험하기</p>
            <p className="action-description">가상 자금으로 안전한 투자를 경험하세요</p>
          </div>
          
          <div className="action-card analysis-card" onClick={() => navigate('/analysis')}>
            <div className="action-icon">🧠</div>
            <h4>성향 분석</h4>
            <p>AI 분석 받기</p>
            <p className="action-description">나만의 투자 성향을 분석해보세요</p>
          </div>
        </div>
      </div>

      {/* 업적 시스템 */}
      <div className="achievements-section">
        <h3>🏆 업적</h3>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.completed ? 'completed' : ''}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
              </div>
              {achievement.completed && <div className="achievement-check">✓</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 