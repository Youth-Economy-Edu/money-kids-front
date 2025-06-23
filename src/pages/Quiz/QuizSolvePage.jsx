import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { completeQuizSession } from '../../services/quizService';
import styles from './QuizSolvePage.module.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function QuizSolvePage() {
    const query = useQuery();
    const level = query.get('level');
    const [quizzes, setQuizzes] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const navigate = useNavigate();
    const { getCurrentUserId } = useAuth();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await fetch(`/api/quizzes/random?level=${level}`);
                const result = await response.json();
                setQuizzes(result.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchQuizzes();
    }, [level]);

    const handleAnswer = (quizId, answer) => {
        setUserAnswers(prev => ({ ...prev, [quizId]: answer }));
    };

    const handleSubmit = async () => {
        let correctCount = 0;
        quizzes.forEach((quiz) => {
            if (userAnswers[quiz.id] === quiz.answer) {
                correctCount++;
            }
        });
        
        // 퀴즈 완료 시 포인트 지급
        const userId = getCurrentUserId(); // 현재 로그인한 사용자 ID
        const quizLevel = parseInt(level);
        
        if (!userId) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        try {
            const result = await completeQuizSession(userId, quizLevel, quizzes.length, correctCount);
            console.log('퀴즈 세션 완료 결과:', result);
            
            navigate(`/quiz/result?correct=${correctCount}&total=${quizzes.length}&pointsAwarded=${result.pointsAwarded}&pointsEarned=${result.pointsEarned}&message=${encodeURIComponent(result.message)}`);
        } catch (error) {
            console.error('퀴즈 세션 완료 실패:', error);
            navigate(`/quiz/result?correct=${correctCount}&total=${quizzes.length}&pointsAwarded=false&pointsEarned=0&message=${encodeURIComponent('퀴즈 완료 처리 중 오류가 발생했습니다.')}`);
        }
    };

    const getRandomEmoji = () => {
        const emojis = ['✨', '🌟', '💫', '🎉', '🎊', '💎', '🔮', '🌈', '🚀', '⚡'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    };

    const getQuestionEmoji = (index) => {
        const questionEmojis = ['💭', '🤔', '💡', '🧐', '🎯'];
        return questionEmojis[index % questionEmojis.length];
    };

    // 퀴즈 세션 완료 API 호출
    const completeQuizSession = async (userId, quizLevel, totalQuestions, correctAnswers) => {
        try {
            console.log('퀴즈 세션 완료 API 호출:', { userId, quizLevel, totalQuestions, correctAnswers });
            
            const response = await fetch('/api/quizzes/session/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    quizLevel: quizLevel,
                    totalQuestions: totalQuestions,
                    correctAnswers: correctAnswers
                })
            });
            
            console.log('퀴즈 세션 완료 API 응답 상태:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('퀴즈 세션 완료 API 성공 응답:', result);
                return result.data;
            } else {
                const errorResult = await response.json();
                console.error('퀴즈 세션 완료 API 실패 응답:', errorResult);
                throw new Error(errorResult.msg || '퀴즈 세션 완료 실패');
            }
        } catch (error) {
            console.error('퀴즈 세션 완료 API 오류:', error);
            throw error;
        }
    };

    return (
        <div className={styles.container}>
            {/* 헤더 영역 */}
            <div className={styles.header}>
                <h2 className={styles.title}>🧠 경제 테스트 🧠</h2>
                <p className={styles.subtitle}>정답을 선택해주세요 {getRandomEmoji()}</p>
                <div className={styles.progressBar}>
                    <div 
                        className={styles.progressFill} 
                        style={{ width: `${(Object.keys(userAnswers).length / quizzes.length) * 100}%` }}
                    ></div>
                </div>
                <p className={styles.progressText}>
                    {Object.keys(userAnswers).length} / {quizzes.length} 완료
                </p>
            </div>

            {/* 퀴즈 리스트 */}
            <div className={styles.quizList}>
                {quizzes.map((quiz, index) => (
                    <div key={quiz.id} className={styles.quizCard}>
                        <div className={styles.questionHeader}>
                            <div className={styles.questionNumber}>
                                {getQuestionEmoji(index)} Q{index + 1}
                            </div>
                            <div className={styles.statusIcon}>
                                {userAnswers[quiz.id] ? '✅' : '⭕'}
                            </div>
                        </div>
                        <p className={styles.question}>{quiz.question}</p>
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.answerButton} ${styles.yesButton} ${userAnswers[quiz.id] === 'O' ? styles.selected : ''}`}
                                onClick={() => handleAnswer(quiz.id, 'O')}
                            >
                                <span className={styles.buttonEmoji}>⭕</span>
                                <span className={styles.buttonText}>O</span>
                            </button>
                            <button
                                className={`${styles.answerButton} ${styles.noButton} ${userAnswers[quiz.id] === 'X' ? styles.selected : ''}`}
                                onClick={() => handleAnswer(quiz.id, 'X')}
                            >
                                <span className={styles.buttonEmoji}>❌</span>
                                <span className={styles.buttonText}>X</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 제출 버튼 */}
            {quizzes.length > 0 && (
                <div className={styles.submitContainer}>
                    <button 
                        className={styles.submitButton} 
                        onClick={handleSubmit}
                        disabled={Object.keys(userAnswers).length < quizzes.length}
                    >
                        <span className={styles.submitEmoji}>✨</span>
                        결과 확인하기
                        <span className={styles.submitEmoji}>✨</span>
                    </button>
                    <p className={styles.submitHint}>
                        {Object.keys(userAnswers).length < quizzes.length 
                            ? `아직 ${quizzes.length - Object.keys(userAnswers).length}개 문제가 남았어요 ⚡`
                            : '모든 문제를 완료했어요! 🎉'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}

export default QuizSolvePage;
