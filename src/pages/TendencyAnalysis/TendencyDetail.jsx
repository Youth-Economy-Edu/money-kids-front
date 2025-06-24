import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Radar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
} from 'chart.js';
import { tendencyAPI } from '../../utils/api';
import './TendencyDetail.css';

// Chart.js 등록
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
);

const TendencyDetail = () => {
    const navigate = useNavigate();
    const { getCurrentUserId } = useAuth();
    const [tendencyData, setTendencyData] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    
    // 현재 로그인한 사용자 ID 가져오기
    const childId = getCurrentUserId();

    // 15분 제한 체크
    useEffect(() => {
        const checkAnalysisLimit = () => {
            const lastTime = localStorage.getItem(`lastAnalysis_${childId}`);
            if (lastTime) {
                const timePassed = Date.now() - parseInt(lastTime);
                const fifteenMinutes = 15 * 60 * 1000; // 15분
                if (timePassed < fifteenMinutes) {
                    setLastAnalysisTime(parseInt(lastTime));
                    setTimeRemaining(Math.ceil((fifteenMinutes - timePassed) / 1000));
                }
            }
        };

        checkAnalysisLimit();
        const interval = setInterval(() => {
            checkAnalysisLimit();
            if (timeRemaining > 0) {
                setTimeRemaining(prev => Math.max(0, prev - 1));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [childId, timeRemaining]);

    useEffect(() => {
        if (childId) {
            fetchData();
        } else {
            setError('로그인이 필요합니다.');
            setLoading(false);
        }
    }, [childId]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // 성향 그래프 데이터 조회 (캐싱 적용)
            const tendencyResult = await tendencyAPI.getTendencyGraph(childId);
            if (tendencyResult.success && tendencyResult.data) {
                setTendencyData(tendencyResult.data);
            } else {
                throw new Error(tendencyResult.error || 'Failed to fetch tendency graph');
            }

            // 성향 변화 추이 데이터 조회 (캐싱 적용)
            const historyResult = await tendencyAPI.getTendencyHistory(childId);
            if (historyResult.success && historyResult.data) {
                setHistoryData(historyResult.data);
            } else {
                throw new Error(historyResult.error || 'Failed to fetch tendency history');
            }
        } catch (error) {
            console.error('성향 데이터 로드 실패, 기본 분석 데이터를 사용합니다:', error);
            
            // 기본 분석 데이터 설정 (성향 분석을 유도)
            setTendencyData({
                scores: { 
                    "공격성": 50, 
                    "적극성": 50, 
                    "위험중립성": 50, 
                    "안정추구성": 50, 
                    "신중함": 50 
                },
                finalType: "미분석",
                feedback: "아직 성향 분석이 완료되지 않았습니다. AI 분석을 실행해보세요.",
                guidance: "성향 분석을 통해 맞춤형 투자 가이드를 받아보세요.",
                lastAnalyzedAt: null
            });
            
            setHistoryData([
                { 
                    date: new Date().toISOString().split('T')[0], 
                    type: "분석 대기", 
                    feedback: "성향 분석을 기다리고 있습니다.",
                    scores: { 
                        "공격성": 50, 
                        "적극성": 50, 
                        "위험중립성": 50, 
                        "안정추구성": 50, 
                        "신중함": 50 
                    }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // OpenAI 분석 수행
    const performNewAnalysis = async () => {
        if (timeRemaining > 0) {
            alert(`분석은 15분마다 한 번씩만 가능합니다. ${Math.floor(timeRemaining / 60)}분 ${timeRemaining % 60}초 후에 다시 시도해주세요.`);
            return;
        }

        setAnalyzing(true);
        setError(null);

        try {
            // 활동 로그 가져오기 (실제 구현 시 활동 로그 수집 API 필요)
            // 임시로 목업 데이터 사용
            const mockActivityLogs = [
                {
                    type: "quiz",
                    timeStamp: new Date().toISOString(),
                    data: {
                        quiz_category: "주식",
                        quiz_level: "중급",
                        correct: true
                    }
                },
                {
                    type: "stock_simulation",
                    timeStamp: new Date().toISOString(),
                    data: {
                        stock_category: "IT",
                        stock_company_size: "대기업",
                        action: "buy",
                        amount: 10
                    }
                },
                {
                    type: "content_completion",
                    timeStamp: new Date().toISOString(),
                    data: {
                        worksheet_category: "경제윤리",
                        worksheet_difficulty: "초급"
                    }
                }
            ];

            // OpenAI 분석 수행
            const analysisResult = await tendencyAPI.performAnalysis(childId, mockActivityLogs);
            
            if (analysisResult.success) {
                // 분석 시간 저장
                localStorage.setItem(`lastAnalysis_${childId}`, Date.now().toString());
                setLastAnalysisTime(Date.now());
                
                // 캐시 클리어하고 데이터 다시 가져오기
                await fetchData();
                
                alert('성향 분석이 완료되었습니다!');
            } else {
                throw new Error(analysisResult.error || '분석 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('분석 오류:', error);
            setError('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleRetry = () => {
        setError(null);
        setLoading(true);

        const fetchData = async () => {
            try {
                const tendencyResult = await tendencyAPI.getTendencyGraph(childId);
                if (tendencyResult.success) {
                    setTendencyData(tendencyResult.data);
                } else {
                    // 목업 데이터 사용
                    setTendencyData({
                        scores: {
                            "공격성": 65.0,
                            "적극성": 78.0,
                            "위험중립성": 55.0,
                            "안정추구성": 82.0,
                            "신중함": 75.0
                        },
                        finalType: "신중한 성장투자자",
                        feedback: "안정성을 중시하면서도 성장 가능성을 놓치지 않는 균형잡힌 성향입니다.",
                        guidance: "위험도가 낮은 대형주 위주로 투자해보세요.",
                        lastAnalyzedAt: "2024-01-15T10:30:00"
                    });
                }
            } catch (error) {
                console.error('재시도 실패:', error);
                setError('네트워크 연결을 확인해주세요.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    };

    // 레이더 차트 데이터 생성
    const getRadarChartData = () => {
        if (!tendencyData) return null;
        
        return {
            labels: Object.keys(tendencyData.scores),
            datasets: [{
                label: '현재 성향',
                data: Object.values(tendencyData.scores),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
            }]
        };
    };

    const radarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    font: {
                        size: 12
                    }
                },
                pointLabels: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.parsed.r}점`;
                    }
                }
            }
        }
    };

    // 성향 변화 추이 라인 차트 데이터 생성
    const getTrendChartData = () => {
        if (!historyData || historyData.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = historyData.map(history => 
            new Date(history.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
        );

        const categories = ['공격성', '적극성', '위험중립성', '안정추구성', '신중함'];
        const colors = [
            '#EF4444', // 빨강 - 공격성
            '#F97316', // 주황 - 적극성  
            '#8B5CF6', // 보라 - 위험중립성
            '#10B981', // 초록 - 안정추구성
            '#3B82F6'  // 파랑 - 신중함
        ];

        const datasets = categories.map((category, index) => ({
            label: category,
            data: historyData.map(history => history.scores[category] || 0),
            borderColor: colors[index],
            backgroundColor: colors[index] + '20',
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: colors[index],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            fill: false
        }));

        return { labels, datasets };
    };

    // 성향 변화 추이 라인 차트 옵션
    const getTrendChartOptions = () => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        scales: {
            x: {
                grid: {
                    color: '#f3f4f6'
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: '#f3f4f6'
                },
                ticks: {
                    stepSize: 20,
                    font: {
                        size: 12
                    },
                    callback: function(value) {
                        return value + '점';
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: '#374151',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}점`;
                    }
                }
            }
        }
    });

    // 점수 레벨 계산
    const getScoreLevel = (score) => {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        if (score >= 40) return 'low';
        return 'very-low';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <div className="error-icon">⚠️</div>
                    <h3>데이터를 불러올 수 없습니다</h3>
                    <p className="error-message">{error}</p>
                    <div className="error-actions">
                        <button className="btn btn-primary" onClick={handleRetry}>
                            다시 시도
                        </button>
                        <button className="btn btn-secondary" onClick={() => window.history.back()}>
                            이전으로
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tendency-detail-container">
            {/* 뒤로가기 버튼 */}
            <div className="page-header">
                <button 
                    className="back-button" 
                    onClick={() => navigate('/analysis')}
                    style={{
                        background: 'none',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ← 성향분석 메뉴로 돌아가기
                </button>
            </div>

            {/* 현재 성향 분석 */}
            <div className="current-tendency-section">
                <div className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2>📊 현재 경제 성향</h2>
                        <button
                            className={`analyze-button ${analyzing ? 'analyzing' : ''} ${timeRemaining > 0 ? 'disabled' : ''}`}
                            onClick={performNewAnalysis}
                            disabled={analyzing || timeRemaining > 0}
                            style={{
                                backgroundColor: timeRemaining > 0 ? '#ccc' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: analyzing || timeRemaining > 0 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {analyzing ? (
                                <>
                                    <span className="spinner" style={{
                                        display: 'inline-block',
                                        width: '14px',
                                        height: '14px',
                                        border: '2px solid #ffffff',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></span>
                                    분석 중...
                                </>
                            ) : timeRemaining > 0 ? (
                                <>
                                    ⏱️ {Math.floor(timeRemaining / 60)}분 {timeRemaining % 60}초 후 가능
                                </>
                            ) : (
                                <>
                                    🤖 AI 성향 분석 실행
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="tendency-type">
                        <span className="type-badge">{tendencyData?.finalType}</span>
                        <span className="analyzed-date">
                            분석일: {new Date(tendencyData?.lastAnalyzedAt).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <div className="radar-chart-container">
                        <Radar data={getRadarChartData()} options={radarOptions} />
                    </div>
                    
                    <div className="tendency-feedback">
                        <div className="feedback-item">
                            <h4>💬 피드백</h4>
                            <p>{tendencyData?.feedback}</p>
                        </div>
                        <div className="feedback-item">
                            <h4>💡 투자 가이드</h4>
                            <p>{tendencyData?.guidance}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 성향 변화 추이 */}
            <div className="history-section">
                <div className="section-card">
                    <h2>📈 성향 변화 추이</h2>
                    
                    {/* 라인 차트 */}
                    <div className="trend-chart-container">
                        <Line data={getTrendChartData()} options={getTrendChartOptions()} />
                    </div>
                    
                    {/* 완전히 새로운 분석 히스토리 */}
                    <div className="analysis-history">
                        <div className="history-details">
                            <h3>📋 분석 히스토리</h3>
                            <div className="history-list">
                                {historyData?.map((history, index) => (
                                    <div key={index} className="history-item">
                                        <div className="history-header">
                                            <span className="history-date">
                                                {new Date(history.date).toLocaleDateString('ko-KR')}
                                            </span>
                                            <span className={`history-type ${history.type.replace(/\s+/g, '-').toLowerCase()}`}>
                                                {history.type}
                                            </span>
                                        </div>
                                        <p className="history-feedback">{history.feedback}</p>
                                        
                                        {/* 개선된 점수 표시 */}
                                        <div className="score-badges">
                                            {Object.entries(history.scores).map(([key, value]) => (
                                                <div key={key} className="score-badge">
                                                    <span className="badge-label">{key}</span>
                                                    <span className={`badge-value ${getScoreLevel(value)}`}>
                                                        {value}점
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TendencyDetail;
