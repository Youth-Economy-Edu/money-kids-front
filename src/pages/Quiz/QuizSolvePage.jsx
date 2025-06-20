import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { quizService } from '../../services/quizService';
import './QuizSolvePage.css';

const QuizSolvePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { level, category } = location.state || { level: '기초', category: '전체' };
  
  const [quizzes, setQuizzes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    loadQuizzes();
  }, [level]);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await quizService.getRandomQuizzes(level);
      
      if (response.success && response.quizzes.length > 0) {
        setQuizzes(response.quizzes);
        setUserAnswers(new Array(response.quizzes.length).fill(null));
      } else {
        setError('퀴즈를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('퀴즈 로딩 오류:', err);
      setError('퀴즈를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);

    // 정답 여부 확인
    const currentQuiz = quizzes[currentIndex];
    const isCorrect = currentQuiz.answer === answer;

    // 백엔드에 퀴즈 제출
    if (user) {
      try {
        const result = await quizService.submitQuiz({
          userId: user.id,
          quizId: currentQuiz.id,
          correct: isCorrect,
          points: isCorrect ? 10 : 0
        });

        if (result.success && isCorrect) {
          setEarnedPoints(prev => prev + (result.points || 10));
        }
      } catch (err) {
        console.error('퀴즈 제출 오류:', err);
      }
    }

    // 다음 문제로 이동 또는 결과 표시
    if (currentIndex < quizzes.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 1000);
    } else {
      // 모든 문제를 풀었을 때
      const correctCount = newAnswers.reduce((count, answer, index) => 
        count + (quizzes[index].answer === answer ? 1 : 0), 0
      );
      setScore(correctCount);
      setTimeout(() => {
        setShowResult(true);
      }, 1000);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setUserAnswers(new Array(quizzes.length).fill(null));
    setShowResult(false);
    setScore(0);
    setEarnedPoints(0);
    loadQuizzes(); // 새로운 퀴즈 로드
  };

  const handleExit = () => {
    navigate('/quiz', {
      state: { 
        completed: true, 
        score: score,
        total: quizzes.length,
        earnedPoints: earnedPoints
      }
    });
  };

  if (isLoading) {
    return (
      <div className="quiz-solve-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>퀴즈를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-solve-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate('/quiz')} className="back-btn">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / quizzes.length) * 100);
    
    return (
      <div className="quiz-solve-page">
        <div className="quiz-container result">
          <div className="result-header">
            <h2>퀴즈 완료!</h2>
            <div className="score-display">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {quizzes.length}</span>
            </div>
            <div className="percentage">{percentage}%</div>
            {earnedPoints > 0 && (
              <div className="earned-points">
                +{earnedPoints} 포인트 획득!
              </div>
            )}
          </div>

          <div className="result-details">
            {quizzes.map((quiz, index) => (
              <div key={index} className="result-item">
                <div className="result-question">
                  <span className="question-number">Q{index + 1}.</span>
                  {quiz.question}
                </div>
                <div className={`result-answer ${quiz.answer === userAnswers[index] ? 'correct' : 'incorrect'}`}>
                  <span className="answer-icon">
                    {quiz.answer === userAnswers[index] ? '✓' : '✗'}
                  </span>
                  <span className="answer-text">
                    {userAnswers[index] ? 'O' : 'X'} 
                    {quiz.answer !== userAnswers[index] && ` (정답: ${quiz.answer ? 'O' : 'X'})`}
                  </span>
                </div>
                {quiz.explanation && (
                  <div className="explanation">
                    💡 {quiz.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button onClick={handleRetry} className="retry-btn">
              다시 도전하기
            </button>
            <button onClick={handleExit} className="exit-btn">
              메인으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIndex];
  const progress = ((currentIndex + 1) / quizzes.length) * 100;

  return (
    <div className="quiz-solve-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="quiz-info">
            <span className="level-badge">{level}</span>
            <span className="category-badge">{currentQuiz.category || category}</span>
          </div>
          <div className="quiz-progress">
            <span className="progress-text">{currentIndex + 1} / {quizzes.length}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="quiz-content">
          <div className="question-number">Q{currentIndex + 1}</div>
          <h2 className="question">{currentQuiz.question}</h2>
          
          <div className="answer-buttons">
            <button 
              className={`answer-btn o-btn ${userAnswers[currentIndex] === true ? 'selected' : ''}`}
              onClick={() => handleAnswer(true)}
              disabled={userAnswers[currentIndex] !== null}
            >
              <span className="answer-icon">⭕</span>
              <span className="answer-text">맞다</span>
            </button>
            
            <button 
              className={`answer-btn x-btn ${userAnswers[currentIndex] === false ? 'selected' : ''}`}
              onClick={() => handleAnswer(false)}
              disabled={userAnswers[currentIndex] !== null}
            >
              <span className="answer-icon">❌</span>
              <span className="answer-text">틀리다</span>
            </button>
          </div>

          {userAnswers[currentIndex] !== null && (
            <div className={`feedback ${currentQuiz.answer === userAnswers[currentIndex] ? 'correct' : 'incorrect'}`}>
              <div className="feedback-icon">
                {currentQuiz.answer === userAnswers[currentIndex] ? '🎉' : '😢'}
              </div>
              <div className="feedback-text">
                {currentQuiz.answer === userAnswers[currentIndex] ? '정답입니다!' : '아쉽네요!'}
              </div>
              {currentQuiz.explanation && (
                <div className="feedback-explanation">
                  💡 {currentQuiz.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizSolvePage;
