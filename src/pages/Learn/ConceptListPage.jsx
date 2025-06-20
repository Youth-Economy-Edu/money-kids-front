import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnCard from '../../components/Learn/LearnCard';
import CardDetailPopup from '../../components/Learn/CardDetailPopup';
import './ConceptListPage.css';
import { conceptService } from '../../services/conceptService';

const ConceptListPage = () => {
    const [selectedDifficulty, setSelectedDifficulty] = useState(0);
    const [concepts, setConcepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [difficultyStats, setDifficultyStats] = useState([]);
    const [overallProgress, setOverallProgress] = useState(null);
    
    const navigate = useNavigate();

    // 난이도 설정 (백엔드 API 기반)
    const difficulties = [
        { id: 0, name: '전체', color: 'all', icon: '📚' },
        { id: 1, name: '기초', color: 'basic', icon: '🌱' },
        { id: 2, name: '초급', color: 'beginner', icon: '📘' },
        { id: 3, name: '중급', color: 'intermediate', icon: '📙' },
        { id: 4, name: '고급', color: 'advanced', icon: '📕' },
        { id: 5, name: '전문가', color: 'expert', icon: '🏆' }
    ];

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadInitialData();
    }, []);

    // 난이도 변경 시 개념 목록 재로드
    useEffect(() => {
        if (!loading) {
            loadConcepts(selectedDifficulty);
        }
    }, [selectedDifficulty]);

    // 초기 데이터 로딩
    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // 병렬로 데이터 로드
            const [conceptsResult, statsResult, progressResult] = await Promise.all([
                conceptService.getConceptsByDifficulty(selectedDifficulty),
                conceptService.getDifficultyStats(),
                conceptService.getOverallProgress()
            ]);

            if (conceptsResult.success) {
                setConcepts(conceptsResult.data);
            } else {
                setError(conceptsResult.error);
            }

            if (statsResult.success) {
                setDifficultyStats(statsResult.data);
            }

            if (progressResult.success) {
                setOverallProgress(progressResult.data);
            }

        } catch (err) {
            console.error('초기 데이터 로딩 실패:', err);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 개념 목록 로드
    const loadConcepts = async (difficulty) => {
        try {
            const result = await conceptService.getConceptsByDifficulty(difficulty);
            if (result.success) {
                setConcepts(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('개념 목록 로딩 실패:', err);
            setError('개념 목록을 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 카드 클릭 핸들러
    const handleCardClick = async (conceptId) => {
        try {
            const result = await conceptService.getConceptDetail(conceptId);
            if (result.success) {
                setSelectedCard(result.data);
                setShowPopup(true);
            } else {
                alert(result.error || '개념 상세 정보를 불러올 수 없습니다.');
            }
        } catch (err) {
            console.error('개념 상세 조회 실패:', err);
            alert('개념 상세 정보를 불러오는 중 오류가 발생했습니다.');
        }
    };

    // 학습 시작 핸들러
    const handleStartLearning = (conceptId) => {
        navigate(`/learn/detail/${conceptId}`);
    };

    // 팝업 닫기
    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedCard(null);
    };

    // 난이도별 진행률 계산
    const getDifficultyProgress = (difficultyId) => {
        const stat = difficultyStats.find(s => s.level === difficultyId);
        return stat ? stat.progress : 0;
    };

    // 난이도별 개념 수 계산
    const getDifficultyCount = (difficultyId) => {
        if (difficultyId === 0) {
            return concepts.length;
        }
        const stat = difficultyStats.find(s => s.level === difficultyId);
        return stat ? stat.count : 0;
    };

    // 로딩 화면
    if (loading) {
        return (
            <div className="concept-list-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>학습 자료를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 화면
    if (error) {
        return (
            <div className="concept-list-page">
                <div className="error-container">
                    <div className="error-icon">❌</div>
                    <h3>오류가 발생했습니다</h3>
                    <p>{error}</p>
                    <button onClick={loadInitialData} className="retry-button">
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="concept-list-page">
            {/* 헤더 섹션 */}
            <div className="hero-section">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
                
                <div className="hero-content">
                    <h1 className="hero-title">
                        <span className="gradient-text">경제 개념 학습</span>
                        <span className="title-emoji">📚</span>
                    </h1>
                    <p className="hero-subtitle">
                        단계별로 경제 지식을 쌓아가며 금융 전문가로 성장해보세요!
                    </p>
                    
                    {/* 통계 대시보드 */}
                    <div className="stats-dashboard">
                        <div className="stat-item">
                            <div className="stat-value">{concepts.length}</div>
                            <div className="stat-label">학습 자료</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{overallProgress?.progressPercentage || 0}%</div>
                            <div className="stat-label">완료율</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{overallProgress?.streakDays || 0}일</div>
                            <div className="stat-label">연속 학습</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 난이도 선택 섹션 */}
            <div className="difficulty-section">
                <h2 className="section-title">학습 난이도 선택</h2>
                <div className="difficulty-grid">
                    {difficulties.map(diff => (
                        <div
                            key={diff.id}
                            className={`difficulty-card ${diff.color} ${selectedDifficulty === diff.id ? 'active' : ''}`}
                            onClick={() => setSelectedDifficulty(diff.id)}
                        >
                            <div className="difficulty-header">
                                <span className="difficulty-icon">{diff.icon}</span>
                                <span className="difficulty-name">{diff.name}</span>
                            </div>
                            <div className="difficulty-info">
                                <div className="concept-count">{getDifficultyCount(diff.id)}개 개념</div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${getDifficultyProgress(diff.id)}%` }}
                                    ></div>
                                </div>
                                <div className="progress-text">{getDifficultyProgress(diff.id)}% 완료</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 현재 선택 정보 */}
            <div className="current-selection">
                <div className="selection-card">
                    <div className="selection-header">
                        <span className="selection-icon">
                            {difficulties.find(d => d.id === selectedDifficulty)?.icon}
                        </span>
                        <h3 className="selection-title">
                            {difficulties.find(d => d.id === selectedDifficulty)?.name} 레벨
                        </h3>
                    </div>
                    <div className="selection-stats">
                        <div className="selection-stat">
                            <span className="stat-number">{concepts.length}</span>
                            <span className="stat-text">개의 학습 자료</span>
                        </div>
                        <div className="selection-stat">
                            <span className="stat-number">{concepts.filter(c => c.isCompleted).length}</span>
                            <span className="stat-text">완료된 학습</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 학습 카드 그리드 */}
            <div className="concepts-section">
                <h2 className="section-title">학습 자료</h2>
                {concepts.length > 0 ? (
                    <div className="concepts-grid">
                        {concepts.map(concept => (
                            <LearnCard
                                key={concept.id}
                                id={concept.id}
                                title={concept.title || concept.name}
                                description={concept.description || concept.content?.substring(0, 100) + '...'}
                                difficulty={concept.difficultyName}
                                progress={concept.progress}
                                isCompleted={concept.isCompleted}
                                icon={concept.icon}
                                onClick={() => handleCardClick(concept.id)}
                                onStart={() => handleStartLearning(concept.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3>학습 자료가 없습니다</h3>
                        <p>선택한 난이도에 해당하는 학습 자료가 아직 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 퀴즈 도전 섹션 */}
            <div className="quiz-challenge-section">
                <div className="challenge-card">
                    <div className="challenge-content">
                        <div className="challenge-icon">🧩</div>
                        <div className="challenge-text">
                            <h3>퀴즈로 실력 테스트</h3>
                            <p>학습한 내용을 퀴즈로 확인해보세요!</p>
                        </div>
                        <div className="challenge-stats">
                            <div className="mini-stat">
                                <span className="mini-number">25</span>
                                <span className="mini-label">문제</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-number">85%</span>
                                <span className="mini-label">정답률</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        className="challenge-button"
                        onClick={() => navigate('/quiz')}
                    >
                        퀴즈 도전하기
                    </button>
                </div>
            </div>

            {/* 카드 상세 팝업 */}
            {showPopup && selectedCard && (
                <CardDetailPopup
                    card={selectedCard}
                    onClose={handleClosePopup}
                    onStart={() => handleStartLearning(selectedCard.id)}
                />
            )}
        </div>
    );
};

export default ConceptListPage;
