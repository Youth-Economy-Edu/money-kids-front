import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './QuizResultPage.module.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ResultPage() {
    const query = useQuery();
    const correct = parseInt(query.get('correct'));
    const total = parseInt(query.get('total'));
    const level = parseInt(query.get('level'));
    const navigate = useNavigate();

    const [rewardStatus, setRewardStatus] = useState(null);

    useEffect(() => {
        const giveReward = async () => {
            if (correct === total) {
                try {
                    const response = await fetch(`/api/quiz/reward?level=${level}`, { method: 'POST' });
                    if (response.ok) {
                        setRewardStatus('success');
                    } else if (response.status === 409) {
                        setRewardStatus('already');
                    } else {
                        throw new Error('보상 지급 실패');
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };
        giveReward();
    }, [correct, total, level]);

    const handleRetry = () => {
        navigate(`/quiz/solve?level=${level}`);
    };

    const handleChangeLevel = () => {
        navigate('/quiz');
    };

    const rewardAmount = level * 1000;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>퀴즈 결과</h2>
            <p className={styles.resultText}>{correct} / {total} 문제 정답!</p>

            {correct === total ? (
                <div className={styles.rewardBox}>
                    {rewardStatus === null && <p>보상 지급 중...</p>}
                    {rewardStatus === 'success' && (
                        <>
                            <p>🎉 축하합니다! 전부 정답입니다!</p>
                            <p>{rewardAmount.toLocaleString()}원 포인트가 지급되었습니다!</p>
                        </>
                    )}
                    {rewardStatus === 'already' && (
                        <>
                            <p>🎉 전부 정답입니다!</p>
                            <p>오늘은 이미 보상을 받으셨습니다 🔒</p>
                        </>
                    )}
                </div>
            ) : (
                <div className={styles.buttonGroup}>
                    <button className={styles.retryButton} onClick={handleRetry}>동일 문제 다시 풀기</button>
                    <button className={styles.levelButton} onClick={handleChangeLevel}>난이도 변경</button>
                </div>
            )}
        </div>
    );
}

export default ResultPage;
