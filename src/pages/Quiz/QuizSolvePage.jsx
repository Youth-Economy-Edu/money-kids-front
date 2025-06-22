import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        const fetchQuizzes = async () => {
            const savedQuizzes = sessionStorage.getItem(`quiz-level-${level}`);
            if (savedQuizzes) {
                setQuizzes(JSON.parse(savedQuizzes));
            } else {
                try {
                    const response = await fetch(`/api/quizzes/random?level=${level}`);
                    const result = await response.json();
                    setQuizzes(result.data);
                    sessionStorage.setItem(`quiz-level-${level}`, JSON.stringify(result.data));
                } catch (err) {
                    console.error(err);
                }
            }
        };
        fetchQuizzes();
    }, [level]);

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
                {quizzes.map((quiz) => (
                    <div key={quiz.id} className={styles.quizCard}>
                        <p className={styles.question}>{quiz.question}</p>
                        <div className={styles.buttonGroup}>
                            <button className={`${styles.answerButton} ${userAnswers[quiz.id] === 'O' ? styles.selected : ''}`} onClick={() => handleAnswer(quiz.id, 'O')}>O</button>
                            <button className={`${styles.answerButton} ${userAnswers[quiz.id] === 'X' ? styles.selected : ''}`} onClick={() => handleAnswer(quiz.id, 'X')}>X</button>
                        </div>
                    </div>
                ))}
            </div>
            {quizzes.length > 0 && (
                <button className={styles.submitButton} onClick={handleSubmit}>제출하기</button>
            )}
        </div>
    );
}

export default QuizSolvePage;
