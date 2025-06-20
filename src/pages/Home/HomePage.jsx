import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header/header';
import { authService } from '../../services/authService';
import { quizService } from '../../services/quizService';
import { investmentService } from '../../services/investmentService';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: user?.name || '머니',
    points: 0,
    portfolio: 1000000,
    completedQuizzes: 0,
    studyDays: 1,
    level: 1,
    tendency: null
  });

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  const fetchUserData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 사용자 기본 정보 가져오기
      const userResponse = await authService.getCurrentUser();
      if (userResponse.success) {
        const updatedUserData = {
          ...userData,
          name: userResponse.user.name || user.name,
          points: userResponse.user.points || 0,
          tendency: userResponse.user.tendency
        };
        
        // 퀴즈 결과 가져오기
        try {
          const quizResponse = await quizService.getQuizResults(user.id);
          if (quizResponse.success) {
            updatedUserData.completedQuizzes = quizResponse.results.length;
          }
        } catch (error) {
          console.error('퀴즈 결과 조회 실패:', error);
        }
        
        // 포트폴리오 정보 가져오기
        try {
          const portfolioResponse = await investmentService.getPortfolio(user.id);
          if (portfolioResponse.success) {
            const totalValue = portfolioResponse.portfolio.reduce((sum, item) => {
              return sum + (item.quantity * item.currentPrice);
            }, 0);
            updatedUserData.portfolio = 1000000 + totalValue; // 초기 자금 + 주식 가치
          }
        } catch (error) {
          console.error('포트폴리오 조회 실패:', error);
        }
        
        // 학습일수 계산
        const joinDate = new Date(user.joinDate || Date.now());
        const today = new Date();
        const diffTime = Math.abs(today - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        updatedUserData.studyDays = diffDays || 1;
        
        // 레벨 계산 (100포인트당 1레벨)
        updatedUserData.level = Math.floor(updatedUserData.points / 100) + 1;
        
        setUserData(updatedUserData);
        updateUser({
          ...user,
          ...updatedUserData
        });
      }
    } catch (error) {
      console.error('사용자 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <Header onLogout={handleLogout} />
      
      <main className="home-main">
        {/* 메인 스탯 카드 */}
        <div className="main-stats-card">
          <h2>안녕하세요, {userData.name}님! 👋</h2>
          <p>오늘도 경제 공부로 스마트한 하루를 시작해볼까요?</p>
          
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="icon">💰</span>
              <div className="content">
                <span className="label">모의 투자 자산</span>
                <span className="value">₩{formatNumber(userData.portfolio)}</span>
                <span className="change positive">+₩50,000 (4.2%)</span>
              </div>
            </div>
            
            <div className="quick-stat">
              <span className="icon">⚡</span>
              <div className="content">
                <span className="label">완료한 퀴즈</span>
                <span className="value">{userData.completedQuizzes}개</span>
                <span className="sublabel">이번 주 +{Math.max(0, userData.completedQuizzes - 10)}개</span>
              </div>
            </div>
            
            <div className="quick-stat">
              <span className="icon">🔥</span>
              <div className="content">
                <span className="label">학습 연속일</span>
                <span className="value">{userData.studyDays}일</span>
                <span className="sublabel">목표: 30일</span>
              </div>
            </div>
          </div>
        </div>

        {/* 오늘의 추천 활동 */}
        <section className="today-recommendations">
          <h3>좋은 아침이에요, 학습자님! 👋</h3>
          <p>오늘도 경제 공부로 스마트한 하루를 시작해볼까요?</p>
          
          <div className="recommendation-cards">
            <Link to="/quiz/solve" className="recommendation-card quiz">
              <span className="icon">🧩</span>
              <h4>퀴즈 완료하기</h4>
              <p>아직 풀지 않은 문제가 있어요</p>
            </Link>
            
            <Link to="/news" className="recommendation-card news">
              <span className="icon">📰</span>
              <h4>경제 뉴스 읽기</h4>
              <p>최신 경제 소식을 확인해보세요</p>
            </Link>
            
            <Link to="/learn" className="recommendation-card learn">
              <span className="icon">📚</span>
              <h4>새로운 개념 학습</h4>
              <p>투자의 기초를 배워보세요</p>
            </Link>
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <section className="quick-menu">
          <h3>빠른 메뉴</h3>
          <div className="menu-grid">
            <Link to="/learn" className="menu-card">
              <div className="menu-icon">📚</div>
              <span className="menu-title">경제 배우기</span>
              <span className="menu-desc">경제 기본을 체계적으로 학습</span>
            </Link>
            
            <Link to="/quiz" className="menu-card">
              <div className="menu-icon">🧩</div>
              <span className="menu-title">퀴즈 풀기</span>
              <span className="menu-desc">지식을 테스트로 확인</span>
            </Link>
            
            <Link to="/invest" className="menu-card">
              <div className="menu-icon">💰</div>
              <span className="menu-title">모의 투자</span>
              <span className="menu-desc">가상 자금으로 안전하게 투자 연습</span>
            </Link>
            
            <Link to="/analysis" className="menu-card">
              <div className="menu-icon">🧠</div>
              <span className="menu-title">성향 분석</span>
              <span className="menu-desc">AI 기반 투자 성향 분석</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage; 