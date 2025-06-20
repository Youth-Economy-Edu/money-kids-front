import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuizPage.css';
import { quizService } from '../../services/quizService';

const QuizPage = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [quizInfo, setQuizInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const navigate = useNavigate();

  const userId = 'guest'; // 실제로는 로그인된 사용자 ID 사용

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 초기 데이터 로딩
  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 퀴즈 결과 데이터 로드
      const statsResult = await quizService.getQuizResults(userId);
      
      if (statsResult.success) {
        const stats = calculateQuizStats(statsResult.data);
        setQuizStats(stats);
      }

      // 난이도 정보 설정 (하드코딩)
      setQuizInfo([
        { difficulty: '기초', name: '기초', color: 'basic', count: 20, description: '경제의 기본 개념을 학습합니다' },
        { difficulty: '중급', name: '중급', color: 'intermediate', count: 15, description: '투자와 금융의 심화 개념을 학습합니다' },
        { difficulty: '고급', name: '고급', color: 'advanced', count: 10, description: '복잡한 경제 이론을 학습합니다' }
      ]);

    } catch (err) {
      console.error('초기 데이터 로딩 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 퀴즈 통계 계산
  const calculateQuizStats = (quizResults) => {
    if (!quizResults || quizResults.length === 0) {
      return {
        totalQuizzes: 0,
        correctAnswers: 0,
        accuracy: 0,
        totalPoints: 0
      };
    }

    const totalQuizzes = quizResults.length;
    const correctAnswers = quizResults.filter(result => result.correct).length;
    const accuracy = totalQuizzes > 0 ? Math.round((correctAnswers / totalQuizzes) * 100) : 0;
    const totalPoints = quizResults.reduce((sum, result) => sum + (result.points || 0), 0);

    return {
      totalQuizzes,
      correctAnswers,
      accuracy,
      totalPoints
    };
  };

  // 퀴즈 시작 핸들러
  const handleStartQuiz = async (difficulty) => {
    try {
      const level = difficulty.toLowerCase();
      const result = await quizService.getRandomQuizzes(level);
      
      if (result.success && result.quizzes.length > 0) {
        // 퀴즈 데이터를 세션 스토리지에 저장하고 퀴즈 페이지로 이동
        sessionStorage.setItem('currentQuizSession', JSON.stringify({
          difficulty,
          quizzes: result.quizzes,
          totalQuestions: result.quizzes.length,
          totalPoints: result.quizzes.length * 10, // 문제당 10점
          currentIndex: 0,
          score: 0,
          answers: []
        }));
        navigate('/quiz/session');
      } else {
        alert(result.error || '퀴즈를 시작할 수 없습니다.');
      }
    } catch (err) {
      console.error('퀴즈 시작 실패:', err);
      alert('퀴즈를 시작하는 중 오류가 발생했습니다.');
    }
  };

  // 랜덤 퀴즈 시작
  const handleRandomQuiz = async () => {
    const difficulties = ['기초', '중급', '고급'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    await handleStartQuiz(randomDifficulty);
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className="quiz-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>퀴즈 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="quiz-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button onClick={loadInitialData} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      {/* 헤더 섹션 */}
      <div className="hero-section">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">경제 퀴즈</span>
            <span className="title-emoji">🧠</span>
          </h1>
          <p className="hero-subtitle">
            학습한 경제 개념을 퀴즈로 확인하고 실력을 키워보세요!
          </p>
          
          {/* 통계 대시보드 */}
          <div className="stats-dashboard">
            <div className="stat-item">
              <div className="stat-value">{quizStats?.totalQuizzes || 0}</div>
              <div className="stat-label">총 문제수</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{quizStats?.correctAnswers || 0}</div>
              <div className="stat-label">정답수</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{quizStats?.accuracy || 0}%</div>
              <div className="stat-label">정답률</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{quizStats?.totalPoints || 0}</div>
              <div className="stat-label">획득 포인트</div>
            </div>
          </div>
        </div>
      </div>

      {/* 난이도 선택 섹션 */}
      <div className="difficulty-section">
        <h2 className="section-title">난이도별 퀴즈</h2>
        <div className="difficulty-grid">
          {quizInfo.map((info) => (
            <div key={info.difficulty} className={`difficulty-card ${info.color}`}>
              <div className="card-header">
                <h3>{info.name}</h3>
                <div className="difficulty-badge">{info.count}문제</div>
              </div>
              <p className="card-description">{info.description}</p>
              <button 
                className="start-quiz-btn"
                onClick={() => handleStartQuiz(info.difficulty)}
              >
                시작하기
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 섹션 */}
      <div className="quick-actions">
        <h2 className="section-title">빠른 퀴즈</h2>
        <div className="actions-grid">
          <div className="action-card random">
            <div className="action-icon">🎲</div>
            <h3>랜덤 퀴즈</h3>
            <p>랜덤으로 선택된 문제들로 도전해보세요</p>
            <button onClick={handleRandomQuiz} className="action-btn">
              랜덤 퀴즈 시작
            </button>
          </div>
          
          <div className="action-card stats">
            <div className="action-icon">📊</div>
            <h3>내 통계</h3>
            <p>지금까지의 퀴즈 성과를 확인해보세요</p>
            <button onClick={() => navigate('/quiz/stats')} className="action-btn">
              통계 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
