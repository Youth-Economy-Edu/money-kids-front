import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnCard from '../../components/Learn/LearnCard';
import CardDetailPopup from '../../components/Learn/CardDetailPopup';
import styles from './ConceptListPage.module.css';

const fetchConcepts = async (difficulty) => {
    try {
        if (difficulty) {
            const response = await fetch(`/api/worksheet/difficulty/${difficulty}`);
            if (!response.ok) throw new Error('불러오기 실패');
            const result = await response.json();
            console.log(`난이도 ${difficulty} 응답:`, result);
            // 각 아이템에 difficulty 정보 추가
            const itemsWithDifficulty = (result.ids || []).map(item => ({
                ...item,
                difficulty: difficulty
            }));
            return itemsWithDifficulty;
        } else {
            const allResults = [];
            for (let i = 1; i <= 5; i++) {
                const res = await fetch(`/api/worksheet/difficulty/${i}`);
                if (res.ok) {
                    const resData = await res.json();
                    console.log(`난이도 ${i} 응답:`, resData);
                    const items = resData.ids || [];
                    // 각 아이템에 difficulty 정보 추가
                    const itemsWithDifficulty = items.map(item => ({
                        ...item,
                        difficulty: i
                    }));
                    allResults.push(...itemsWithDifficulty);
                }
            }
            console.log('전체 결과:', allResults);
            return allResults;
        }
    } catch (err) {
        console.error('fetchConcepts 에러:', err);
        return [];
    }
};

const fetchConceptDetail = async (id) => {
    try {
        const response = await fetch(`/api/worksheet/${id}`);
        if (!response.ok) throw new Error('상세 불러오기 실패');
        const result = await response.json();
        return result.data;
    } catch (err) {
        console.error(err);
        return null;
    }
};

// 포인트 지급 함수
const awardPoints = async (userId, worksheetId, pointsToAdd = 100) => {
    try {
        console.log('포인트 지급 API 호출:', { userId, worksheetId, pointsToAdd });
        
        const response = await fetch('/api/user/worksheet/complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                worksheetId: worksheetId,
                pointsEarned: pointsToAdd
            })
        });
        
        console.log('포인트 지급 API 응답 상태:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('포인트 지급 API 성공 응답:', result);
            return result;
        } else {
            const errorResult = await response.json();
            console.error('포인트 지급 API 실패 응답:', errorResult);
        }
        return null;
    } catch (error) {
        console.error('포인트 지급 API 오류:', error);
        return null;
    }
};

function ConceptListPage() {
    const [concepts, setConcepts] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [selectedConcept, setSelectedConcept] = useState(null);
    const [userProgress, setUserProgress] = useState({});
    const [quizProgress, setQuizProgress] = useState({});
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const navigate = useNavigate();
    
    // 임시 사용자 ID (실제로는 로그인 시스템에서)
    const currentUserId = 'master';

    useEffect(() => {
        loadConcepts();
        loadUserProgress();
        loadQuizProgress();
    }, [selectedDifficulty]);

    const loadConcepts = async () => {
        setLoading(true);
        console.log('loadConcepts 시작, selectedDifficulty:', selectedDifficulty);
        const conceptsData = await fetchConcepts(selectedDifficulty);
        console.log('받은 conceptsData:', conceptsData);
        setConcepts(conceptsData);
        setLoading(false);
        console.log('로딩 완료');
    };

    const loadUserProgress = async () => {
        try {
            console.log('사용자 진도 로딩 시작, userId:', currentUserId);
            const response = await fetch(`/api/user/${currentUserId}/worksheet/progress`);
            if (response.ok) {
                const progress = await response.json();
                console.log('사용자 진도 응답:', progress);
                setUserProgress(progress.data || {});
            } else {
                console.error('사용자 진도 로딩 실패, 상태코드:', response.status);
            }
        } catch (error) {
            console.error('진도 로드 실패:', error);
        }
    };

    const loadQuizProgress = async () => {
        try {
            console.log('퀴즈 진도 로딩 시작, userId:', currentUserId);
            const response = await fetch(`/api/quizzes/user/${currentUserId}/progress`);
            if (response.ok) {
                const progress = await response.json();
                console.log('퀴즈 진도 응답:', progress);
                setQuizProgress(progress.data || {});
            } else {
                console.error('퀴즈 진도 로딩 실패, 상태코드:', response.status);
            }
        } catch (error) {
            console.error('퀴즈 진도 로드 실패:', error);
        }
    };

    const handleCardClick = async (id) => {
        const detail = await fetchConceptDetail(id);
        setSelectedConcept(detail);
    };

    const handleLearnComplete = async (worksheetId) => {
        console.log('학습 완료 시작:', { userId: currentUserId, worksheetId });
        
        // 학습 완료 시 포인트 지급
        const result = await awardPoints(currentUserId, worksheetId, 100);
        
        console.log('포인트 지급 결과:', result);
        
        if (result) {
            if (result.pointsAwarded) {
                console.log('포인트 지급 성공:', result.pointsEarned, '포인트');
                setNotification({
                    type: 'success',
                    message: `🎉 학습 완료! ${result.pointsEarned}포인트를 획득했습니다!`,
                    show: true
                });
            } else {
                console.log('오늘 이미 완료한 학습지');
                setNotification({
                    type: 'info',
                    message: '📚 학습을 완료했습니다! (오늘은 이미 포인트를 받으셨어요)',
                    show: true
                });
            }
            
            // 진도 새로고침
            loadUserProgress();
        } else {
            console.log('포인트 지급 실패');
        }
        
        // 3초 후 알림 숨기기
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const handleQuizStart = () => {
        navigate('/quiz');
    };

    const getDifficultyInfo = (level) => {
        const difficultyMap = {
            1: { name: '기초', color: '#10B981', emoji: '🌱', desc: '경제의 기본 개념' },
            2: { name: '초급', color: '#3B82F6', emoji: '📚', desc: '실생활 경제 원리' },
            3: { name: '중급', color: '#F59E0B', emoji: '💡', desc: '투자와 저축의 이해' },
            4: { name: '고급', color: '#EF4444', emoji: '🚀', desc: '복잡한 금융 상품' },
            5: { name: '전문가', color: '#8B5CF6', emoji: '🏆', desc: '고급 투자 전략' }
        };
        return difficultyMap[level] || difficultyMap[1];
    };

    const getProgressStats = () => {
        // 전체 학습지 개수는 항상 25개 (1~5 난이도별로 5개씩)
        const totalConcepts = 25;
        const completedCount = Object.keys(userProgress).length;
        const progressPercentage = totalConcepts > 0 ? Math.round((completedCount / totalConcepts) * 100) : 0;
        
        return { totalConcepts, completedCount, progressPercentage };
    };

    const { totalConcepts, completedCount, progressPercentage } = getProgressStats();

    console.log('렌더링 시점 - concepts:', concepts, 'length:', concepts.length, 'loading:', loading);

    return (
        <div className={styles.conceptPage}>
            {/* 알림 메시지 */}
            {notification && (
                <div className={`${styles.notification} ${styles[notification.type]} ${notification.show ? styles.show : ''}`}>
                    {notification.message}
                </div>
            )}

            {/* 헤더 섹션 */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        📚 경제 배우기
                        <span className={styles.subtitle}>재미있는 경제 학습으로 똑똑한 경제 박사가 되어보세요!</span>
                    </h1>
                    
                    {/* 진도 현황 및 퀴즈 섹션 */}
                    <div className={styles.progressSection}>
                        <div className={styles.progressCard}>
                            <div className={styles.progressHeader}>
                                <h3>📊 학습 진도</h3>
                                <span className={styles.progressPercentage}>{progressPercentage}%</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill} 
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                            <div className={styles.progressStats}>
                                <span>{completedCount}개 완료</span>
                                <span>{totalConcepts}개 중</span>
                            </div>
                        </div>
                        
                        <div className={styles.quizCardInHeader}>
                            <div className={styles.quizContentInHeader}>
                                <h3>🎯 경제 퀴즈에 도전하세요!</h3>
                                <p>학습한 내용을 퀴즈로 확인하고 추가 포인트를 얻어보세요</p>
                                
                                {/* 오늘 완료한 퀴즈 레벨 표시 */}
                                {quizProgress.todayCompletedLevels && (
                                    <div className={styles.todayQuizProgress}>
                                        <span className={styles.todayLabel}>오늘 완료:</span>
                                        {[1, 2, 3, 4, 5].map(level => {
                                            const isCompleted = quizProgress.todayCompletedLevels[level];
                                            const info = getDifficultyInfo(level);
                                            return (
                                                <span 
                                                    key={level}
                                                    className={`${styles.levelBadge} ${isCompleted ? styles.completed : styles.pending}`}
                                                    title={`${info.name} (${info.desc})`}
                                                >
                                                    {info.emoji}
                                                </span>
                                            );
                                        })}
                                        {quizProgress.todaySessionsCount > 0 && (
                                            <span className={styles.todayPoints}>
                                                +{quizProgress.totalPointsEarnedToday}P
                                            </span>
                                        )}
                                    </div>
                                )}
                                
                                <button className={styles.quizButtonInHeader} onClick={handleQuizStart}>
                                    <span className={styles.quizButtonText}>퀴즈 풀기</span>
                                    <span className={styles.quizButtonIcon}>🏆</span>
                                </button>
                            </div>
                            <div className={styles.quizIllustrationInHeader}>
                                <div className={styles.quizIconInHeader}>🧠</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* 난이도 필터 */}
            <div className={styles.difficultySection}>
                <h2 className={styles.sectionTitle}>🎯 난이도별 학습</h2>
                <div className={styles.difficultyButtons}>
                    <button 
                        className={`${styles.difficultyButton} ${!selectedDifficulty ? styles.active : ''}`} 
                        onClick={() => setSelectedDifficulty(null)}
                    >
                        <span className={styles.difficultyEmoji}>📖</span>
                        <span className={styles.difficultyName}>전체</span>
                        <span className={styles.difficultyDesc}>모든 학습 내용</span>
                    </button>
                    
                    {[1, 2, 3, 4, 5].map(level => {
                        const info = getDifficultyInfo(level);
                        return (
                            <button
                                key={level}
                                className={`${styles.difficultyButton} ${selectedDifficulty === level ? styles.active : ''}`}
                                onClick={() => setSelectedDifficulty(level)}
                                style={{ '--difficulty-color': info.color }}
                            >
                                <span className={styles.difficultyEmoji}>{info.emoji}</span>
                                <span className={styles.difficultyName}>{info.name}</span>
                                <span className={styles.difficultyDesc}>{info.desc}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 학습 카드 그리드 */}
            <div className={styles.contentSection}>
                <div className={styles.cardGrid}>
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.loadingSpinner}></div>
                            <p>학습 내용을 불러오는 중...</p>
                        </div>
                    ) : concepts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📚</div>
                            <h3>학습 데이터가 없습니다</h3>
                            <p>선택한 난이도의 학습 내용이 준비되지 않았습니다.</p>
                        </div>
                    ) : (
                        concepts.map(concept => (
                            <div key={concept.id} className={styles.cardWrapper}>
                                <LearnCard
                                    id={concept.id}
                                    title={concept.title}
                                    onClick={() => handleCardClick(concept.id)}
                                    isCompleted={userProgress[concept.id]}
                                    difficulty={concept.difficulty}
                                />
                                {userProgress[concept.id] && (
                                    <div className={styles.completedBadge}>
                                        ✅ 완료
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 학습 상세 팝업 */}
            {selectedConcept && (
                <CardDetailPopup
                    concept={selectedConcept}
                    onClose={() => setSelectedConcept(null)}
                    onComplete={() => handleLearnComplete(selectedConcept.id)}
                />
            )}
        </div>
    );
}

export default ConceptListPage;
