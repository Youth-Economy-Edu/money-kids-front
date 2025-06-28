import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LearnCard from '../../components/Learn/LearnCard';
import CardDetailPopup from '../../components/Learn/CardDetailPopup';
import styles from './ConceptListPage.module.css';
import { learnAPI } from '../../utils/apiClient';

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

// 포인트 지급 함수 (난이도별 자동 계산)
const awardPoints = async (userId, worksheetId) => {
    try {
        console.log('포인트 지급 API 호출:', { userId, worksheetId });
        
        const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_BASE_URL}/learn/worksheet/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                worksheetId: worksheetId,
                pointsEarned: 0  // 백엔드에서 난이도별로 자동 계산
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

// 일일 학습 완료 상태 체크 함수
const checkTodayCompletion = async (userId, worksheetId) => {
    try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_BASE_URL}/learn/worksheet/${worksheetId}/today-status?userId=${userId}`);
        if (response.ok) {
            const result = await response.json();
            return result.data?.completedToday || false;
        }
        return false;
    } catch (error) {
        console.error('오늘 완료 상태 확인 오류:', error);
        return false;
    }
};

function ConceptListPage() {
    const navigate = useNavigate();
    const { getCurrentUserId } = useAuth();
    
    const [concepts, setConcepts] = useState([]);
    const [selectedConcept, setSelectedConcept] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userProgress, setUserProgress] = useState({});
    const [quizProgress, setQuizProgress] = useState({});
    const [todayCompletedWorksheets, setTodayCompletedWorksheets] = useState(new Set()); // 오늘 완료한 워크시트들
    const [notification, setNotification] = useState(null);
    
    // 현재 로그인한 사용자 ID 가져오기
    const currentUserId = getCurrentUserId();

    useEffect(() => {
        if (currentUserId) {
            loadConcepts();
            loadUserProgress();
            loadQuizProgress();
            loadTodayCompletions(); // 오늘 완료 상태 로드
        }
    }, [selectedDifficulty, currentUserId]);

    const loadConcepts = useCallback(async () => {
        setLoading(true);
        console.log('loadConcepts 시작, selectedDifficulty:', selectedDifficulty);
        const result = await learnAPI.getConcepts();
        if (result.success) {
            console.log('받은 conceptsData:', result.data);
            setConcepts(result.data);
            setLoading(false);
            console.log('로딩 완료');
        } else {
            console.error('학습 데이터 로드 실패:', result.error);
            setConcepts([]);
            setLoading(false);
        }
    }, [selectedDifficulty]);

    const loadUserProgress = async () => {
        try {
            console.log('사용자 진도 로딩 시작, userId:', currentUserId);
            const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_BASE_URL}/learn/worksheet/progress?userId=${currentUserId}`);
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
            const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_BASE_URL}/quiz/progress?userId=${currentUserId}`);
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

    // 오늘 완료한 워크시트 목록 로드
    const loadTodayCompletions = async () => {
        try {
            console.log('🔄 오늘 완료 워크시트 로딩 시작, userId:', currentUserId);
            const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_BASE_URL}/learn/worksheet/today-completed?userId=${currentUserId}`);
            if (response.ok) {
                const result = await response.json();
                const todayCompleted = result.data?.completedWorksheetIds || [];
                setTodayCompletedWorksheets(new Set(todayCompleted));
                console.log('✅ 오늘 완료 워크시트:', todayCompleted);
            } else {
                console.error('오늘 완료 워크시트 로딩 실패, 상태코드:', response.status);
                setTodayCompletedWorksheets(new Set());
            }
        } catch (error) {
            console.error('오늘 완료 워크시트 로드 실패:', error);
            setTodayCompletedWorksheets(new Set());
        }
    };

    const handleCardClick = async (id) => {
        // 오늘 이미 완료한 워크시트인지 확인
        if (todayCompletedWorksheets.has(id)) {
            setNotification({
                type: 'info',
                message: '📚 오늘 이미 이 학습을 완료하셨습니다! 내일 다시 도전해주세요.',
                show: true
            });
            
            // 3초 후 알림 숨기기
            setTimeout(() => {
                setNotification(null);
            }, 3000);
            
            return; // 더 이상 진행하지 않음
        }
        
        const detail = await fetchConceptDetail(id);
        setSelectedConcept(detail);
    };

    const handleLearnComplete = async (worksheetId) => {
        console.log('학습 완료 시작:', { userId: currentUserId, worksheetId });
        
        // 오늘 이미 완료했는지 다시 한번 확인
        if (todayCompletedWorksheets.has(worksheetId)) {
            setNotification({
                type: 'info',
                message: '📚 오늘 이미 이 학습을 완료하셨습니다!',
                show: true
            });
            
            setTimeout(() => {
                setNotification(null);
            }, 3000);
            
            return;
        }
        
        // 학습 완료 시 포인트 지급 (난이도별 자동 계산)
        const result = await awardPoints(currentUserId, worksheetId);
        
        console.log('포인트 지급 결과:', result);
        
        if (result) {
            // API 응답 구조 확인
            console.log('API 응답 상세:', {
                pointsAwarded: result.pointsAwarded,
                pointsEarned: result.pointsEarned,
                isFirstTime: result.isFirstTime,
                isRelearning: result.isRelearning,
                alreadyCompletedToday: result.alreadyCompletedToday
            });
            
            if (result.pointsAwarded && result.pointsEarned > 0) {
                console.log('✅ 포인트 지급 성공:', result.pointsEarned, '포인트');
                
                // 첫 학습인지 재학습인지 구분
                if (result.isFirstTime) {
                    setNotification({
                        type: 'success',
                        message: `🎉 첫 학습 완료! ${result.pointsEarned}포인트를 획득했습니다!`,
                        show: true
                    });
                } else if (result.isRelearning) {
                    setNotification({
                        type: 'success',
                        message: `🔄 재학습 완료! ${result.pointsEarned}포인트를 획득했습니다!`,
                        show: true
                    });
                } else {
                    setNotification({
                        type: 'success',
                        message: `🎉 학습 완료! ${result.pointsEarned}포인트를 획득했습니다!`,
                        show: true
                    });
                }
                
                // 오늘 완료 목록에 추가
                setTodayCompletedWorksheets(prev => new Set([...prev, worksheetId]));
                
            } else if (result.alreadyCompletedToday) {
                // 오늘 이미 완료한 학습지인 경우
                console.log('ℹ️ 오늘 이미 완료한 학습지');
                setNotification({
                    type: 'info',
                    message: '📚 학습을 완료했습니다! (오늘은 이미 포인트를 받으셨어요)',
                    show: true
                });
                
                // 오늘 완료 목록에 추가
                setTodayCompletedWorksheets(prev => new Set([...prev, worksheetId]));
                
            } else if (!result.pointsAwarded) {
                // 포인트가 지급되지 않았지만 아직 오늘 첫 완료가 아닌 경우
                console.log('ℹ️ 포인트 지급 조건 미충족');
                setNotification({
                    type: 'info',
                    message: '📚 학습을 완료했습니다!',
                    show: true
                });
            } else {
                // 기타 경우 - 학습 완료는 되었지만 포인트 없음
                console.log('ℹ️ 학습 완료 (포인트 없음)');
                setNotification({
                    type: 'success',
                    message: '📚 학습을 완료했습니다!',
                    show: true
                });
            }
            
            // 진도 새로고침
            loadUserProgress();
        } else {
            console.log('❌ 포인트 지급 API 호출 실패');
            setNotification({
                type: 'info',
                message: '📚 학습을 완료했습니다!',
                show: true
            });
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
                    
                    {/* 오늘 완료한 학습 현황 표시 */}
                    {todayCompletedWorksheets.size > 0 && (
                        <div className={styles.todayProgressCard}>
                            <h3>✅ 오늘의 학습 현황</h3>
                            <p>{todayCompletedWorksheets.size}개의 학습을 완료했습니다! 🎉</p>
                            <small>내일 다시 새로운 학습에 도전하실 수 있습니다.</small>
                        </div>
                    )}
                    
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
                        concepts.map(concept => {
                            const isTodayCompleted = todayCompletedWorksheets.has(concept.id);
                            return (
                                <div key={concept.id} className={styles.cardWrapper}>
                                    <LearnCard
                                        id={concept.id}
                                        title={concept.title}
                                        onClick={() => handleCardClick(concept.id)}
                                        isCompleted={userProgress[concept.id]}
                                        difficulty={concept.difficulty}
                                        isTodayCompleted={isTodayCompleted} // 오늘 완료 상태 전달
                                    />
                                    {userProgress[concept.id] && (
                                        <div className={styles.completedBadge}>
                                            ✅ 완료
                                        </div>
                                    )}
                                    {isTodayCompleted && (
                                        <div className={styles.todayCompletedBadge}>
                                            🌟 오늘 완료
                                        </div>
                                    )}
                                </div>
                            );
                        })
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
