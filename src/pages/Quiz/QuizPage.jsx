import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizPage.module.css';

function QuizPage() {
    const navigate = useNavigate();
    const [quizProgress, setQuizProgress] = useState({});

    // 퀴즈 진행 현황 로드
    useEffect(() => {
        loadQuizProgress();
    }, []);

    const loadQuizProgress = async () => {
        try {
            const response = await fetch('/api/quizzes/user/master/progress');
            if (response.ok) {
                const result = await response.json();
                setQuizProgress(result.data || {});
            }
        } catch (error) {
            console.error('퀴즈 진행 현황 로드 실패:', error);
        }
    };

    const handleDifficultySelect = (level) => {
        // 오늘 이미 완료한 레벨인지 확인
        const isCompleted = quizProgress.todayCompletedLevels && quizProgress.todayCompletedLevels[level];
        
        if (isCompleted) {
            alert('오늘 이미 이 난이도의 퀴즈를 완료하셨습니다. 내일 다시 도전해주세요!');
            return;
        }
        
        navigate(`/quiz/solve?level=${level}`);
    };

    const difficultyData = [
        { 
            level: 1, 
            name: '기초', 
            emoji: '🌱', 
            desc: '경제의 기본 개념을 배워요',
            color: 'green'
        },
        { 
            level: 2, 
            name: '초급', 
            emoji: '📚', 
            desc: '실생활 경제 원리를 익혀요',
            color: 'blue'
        },
        { 
            level: 3, 
            name: '중급', 
            emoji: '💡', 
            desc: '투자와 저축을 이해해요',
            color: 'yellow'
        },
        { 
            level: 4, 
            name: '고급', 
            emoji: '🚀', 
            desc: '복잡한 금융 상품을 다뤄요',
            color: 'red'
        },
        { 
            level: 5, 
            name: '전문가', 
            emoji: '🏆', 
            desc: '고급 투자 전략을 마스터해요',
            color: 'purple'
        }
    ];

    return (
        <div className={styles['quiz-page']}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>🧠 경제 테스트 🧠</h1>
                    <p className={styles.subtitle}>당신의 경제 실력을 확인해보세요!</p>
                    <p className={styles.description}>어떤 난이도에 도전해보시겠어요? ✨</p>
                </div>
                
                <div className={styles['difficulty-buttons']}>
                    {difficultyData.map((difficulty) => {
                        const isCompleted = quizProgress.todayCompletedLevels && quizProgress.todayCompletedLevels[difficulty.level];
                        return (
                            <button
                                key={difficulty.level}
                                className={`${styles['difficulty-button']} ${isCompleted ? styles['completed'] : ''}`}
                                onClick={() => handleDifficultySelect(difficulty.level)}
                                disabled={isCompleted}
                            >
                                <div className={styles['difficulty-level']}>LV.{difficulty.level}</div>
                                <div className={styles['difficulty-emoji']}>{difficulty.emoji}</div>
                                <div className={styles['difficulty-name']}>{difficulty.name}</div>
                                <div className={styles['difficulty-desc']}>
                                    {isCompleted ? '오늘 완료됨 ✅' : difficulty.desc}
                                </div>
                                {isCompleted && (
                                    <div className={styles['completed-badge']}>
                                        완료
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default QuizPage;
