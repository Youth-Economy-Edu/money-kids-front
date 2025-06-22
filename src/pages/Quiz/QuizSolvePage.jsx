import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './QuizSolvePage.module.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function QuizSolvePage() {
    const query = useQuery();
    const level = query.get('level') || query.get('difficulty');  // 🔥 파라미터 호환 완전 해결
    const [quizzes, setQuizzes] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!level) {
            navigate('/quiz');  // 잘못된 진입 방지
            return;
        }

        const fetchQuizzes = async () => {
            const savedQuizzes = sessionStorage.getItem(`quiz-level-${level}`);
            if (savedQuizzes) {
                try {
                    const parsed = JSON.parse(savedQuizzes);
                    if (Array.isArray(parsed)) {
                        setQuizzes(parsed);
                    } else {
                        setQuizzes([]);
                    }
                } catch {
                    setQuizzes([]);
                }
            } else {
                try {
                    const response = await fetch(`/api/quizzes/random?level=${level}`);
                    const result = await response.json();
                    setQuizzes(result.data);
                    sessionStorage.setItem(`quiz-level-${level}`, JSON.stringify(result.data));
                } catch (err) {
                    console.error(err);
                    setQuizzes([]);
                }
            }
        };
        fetchQuizzes();
    }, [level, navigate]);

    const handleAnswer = (quizId, answer) => {
        setUserAnswers(prev => ({ ...prev, [quizId]: answer }));
    };

    const handleSubmit = () => {
        let correctCount = 0;
        quizzes.forEach((quiz) => {
            if (userAnswers[quiz.id] === quiz.answer) {
                correctCount++;
            }
        });
        navigate(`/quiz/result?correct=${correctCount}&total=${quizzes.length}&level=${level}`);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>퀴즈 시작!</h2>
            <div className={styles.quizList}>
                {Array.isArray(quizzes) && quizzes.map((quiz) => (
                    <div key={quiz.id} className={styles.quizCard}>
                        <p className={styles.question}>{quiz.question}</p>
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.answerButton} ${userAnswers[quiz.id] === 'O' ? styles.selected : ''}`}
                                onClick={() => handleAnswer(quiz.id, 'O')}
                            >O</button>
                            <button
                                className={`${styles.answerButton} ${userAnswers[quiz.id] === 'X' ? styles.selected : ''}`}
                                onClick={() => handleAnswer(quiz.id, 'X')}
                            >X</button>
                        </div>
                    </div>
                ))}
            </div>
            {Array.isArray(quizzes) && quizzes.length > 0 && (
                <button className={styles.submitButton} onClick={handleSubmit}>제출하기</button>
            )}
        </div>
    );
}

export default QuizSolvePage;
