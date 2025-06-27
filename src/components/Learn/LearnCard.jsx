import React from 'react';
import styles from './LearnCard.module.css';

function LearnCard({ id, title, onClick, isCompleted, difficulty, isTodayCompleted }) {
    const getDifficultyInfo = (level) => {
        const difficultyMap = {
            1: { name: '기초', color: '#10B981', emoji: '🌱' },
            2: { name: '초급', color: '#3B82F6', emoji: '📚' },
            3: { name: '중급', color: '#F59E0B', emoji: '💡' },
            4: { name: '고급', color: '#EF4444', emoji: '🚀' },
            5: { name: '전문가', color: '#8B5CF6', emoji: '🏆' }
        };
        return difficultyMap[level] || difficultyMap[1];
    };

    const diffInfo = getDifficultyInfo(difficulty);

    return (
        <div 
            className={`${styles.learnCard} ${isCompleted ? styles.completed : ''} ${isTodayCompleted ? styles.todayCompleted : ''}`} 
            onClick={onClick}
            style={{ '--difficulty-color': diffInfo.color }}
        >
            <div className={styles.cardHeader}>
                <div className={styles.difficultyBadge}>
                    <span className={styles.difficultyEmoji}>{diffInfo.emoji}</span>
                    <span className={styles.difficultyName}>{diffInfo.name}</span>
                </div>
                {isCompleted && (
                    <div className={styles.completedIcon}>
                        ✅
                    </div>
                )}
                {isTodayCompleted && (
                    <div className={styles.todayCompletedIcon}>
                        🌟
                    </div>
                )}
            </div>
            
            <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{title}</h3>
                <div className={styles.cardFooter}>
                    <span className={styles.learnButton}>
                        {isTodayCompleted ? '내일 다시' : isCompleted ? '다시 보기' : '학습하기'}
                        <i className={styles.arrowIcon}>→</i>
                    </span>
                </div>
            </div>
            
            {isTodayCompleted && (
                <div className={styles.todayCompletedOverlay}>
                    <div className={styles.todayMessage}>오늘 완료</div>
                </div>
            )}
            
            <div className={styles.cardGlow}></div>
        </div>
    );
}

export default LearnCard;
