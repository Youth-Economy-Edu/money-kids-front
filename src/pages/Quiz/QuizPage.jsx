import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizPage.module.css';

function QuizPage() {
    const navigate = useNavigate();

    const handleDifficultySelect = (level) => {
        navigate(`/quiz/solve?level=${level}`);
    };

    return (
        <div className={styles['quiz-page']}>
            <h2 className={styles['title']}>퀴즈 난이도를 선택하세요!</h2>
            <div className={styles['difficulty-buttons']}>
                {[1, 2, 3, 4, 5].map(level => (
                    <button
                        key={level}
                        className={styles['difficulty-button']}
                        onClick={() => handleDifficultySelect(level)}
                    >
                        난이도 {level}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default QuizPage;
