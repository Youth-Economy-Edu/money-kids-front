import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './QuizResultPage.module.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ResultPage() {
    const query = useQuery();
    const correct = query.get('correct');
    const total = query.get('total');
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>퀴즈 결과</h2>
            <p className={styles.resultText}>{correct} / {total} 문제 정답!</p>
            <button className={styles.button} onClick={() => navigate('/quiz')}>
                다시 풀기
            </button>
        </div>
    );
}

export default ResultPage;
