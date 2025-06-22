import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './QuizResultPage.module.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ResultPage() {
    const query = useQuery();
    const correct = parseInt(query.get('correct'));
    const total = parseInt(query.get('total'));
    const pointsAwarded = query.get('pointsAwarded') === 'true';
    const pointsEarned = parseInt(query.get('pointsEarned')) || 0;
    const message = decodeURIComponent(query.get('message') || '');
    const navigate = useNavigate();

    const percentage = Math.round((correct / total) * 100);
    
    const getResultData = () => {
        if (percentage >= 90) {
            return {
                emoji: '👑',
                title: '완벽한 경제 천재!',
                message: '당신은 경제 분야의 전문가예요!',
                subMessage: '모든 문제를 거의 완벽하게 맞혔어요 ✨',
                color: 'gold',
                bgGradient: 'linear-gradient(135deg, #ffd700, #ffed4e)'
            };
        } else if (percentage >= 70) {
            return {
                emoji: '🌟',
                title: '경제 실력자!',
                message: '정말 훌륭한 경제 지식을 가지고 있어요!',
                subMessage: '대부분의 문제를 정확히 맞혔어요 💖',
                color: 'silver',
                bgGradient: 'linear-gradient(135deg, #c0c0c0, #e6e6e6)'
            };
        } else if (percentage >= 50) {
            return {
                emoji: '💪',
                title: '경제 공부 중!',
                message: '기본기는 탄탄해요!',
                subMessage: '조금만 더 공부하면 완벽해질 거예요 🔥',
                color: 'bronze',
                bgGradient: 'linear-gradient(135deg, #cd7f32, #daa520)'
            };
        } else {
            return {
                emoji: '🌱',
                title: '경제 새싹!',
                message: '시작이 반이에요!',
                subMessage: '포기하지 말고 계속 도전해보세요 💕',
                color: 'green',
                bgGradient: 'linear-gradient(135deg, #10b981, #34d399)'
            };
        }
    };

    const resultData = getResultData();

    return (
        <div className={styles.container}>
            <div className={styles.resultCard}>
                <div className={styles.confetti}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={styles.confettiPiece} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)]
                        }}></div>
                    ))}
                </div>
                
                <div className={styles.resultEmoji}>{resultData.emoji}</div>
                <h1 className={styles.title}>{resultData.title}</h1>
                <p className={styles.message}>{resultData.message}</p>
                
                <div className={styles.scoreSection}>
                    <div className={styles.scoreCircle} style={{ background: resultData.bgGradient }}>
                        <div className={styles.scoreText}>
                            <span className={styles.scoreNumber}>{correct}</span>
                            <span className={styles.scoreTotal}>/ {total}</span>
                        </div>
                        <div className={styles.percentage}>{percentage}%</div>
                    </div>
                </div>
                
                <p className={styles.subMessage}>{resultData.subMessage}</p>
                
                {/* 포인트 지급 정보 */}
                <div className={styles.pointsInfo}>
                    {pointsAwarded ? (
                        <div className={styles.pointsAwarded}>
                            <span className={styles.pointsIcon}>🎉</span>
                            <span className={styles.pointsText}>{pointsEarned}포인트 획득!</span>
                        </div>
                    ) : (
                        <div className={styles.noPoints}>
                            <span className={styles.pointsIcon}>⏰</span>
                            <span className={styles.pointsText}>
                                {message || '오늘은 이미 포인트를 받으셨거나 점수가 부족합니다.'}
                            </span>
                        </div>
                    )}
                </div>
                
                <div className={styles.buttonGroup}>
                    <button 
                        className={`${styles.button} ${styles.primaryButton}`} 
                        onClick={() => navigate('/quiz')}
                    >
                        <span className={styles.buttonEmoji}>🔄</span>
                        다시 도전하기
                    </button>
                    <button 
                        className={`${styles.button} ${styles.secondaryButton}`} 
                        onClick={() => navigate('/concept-list')}
                    >
                        <span className={styles.buttonEmoji}>📚</span>
                        경제 공부하기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResultPage;
