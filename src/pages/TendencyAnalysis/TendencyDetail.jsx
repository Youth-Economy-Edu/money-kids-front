import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
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
    Legend
);

const TendencyDetail = () => {
    const navigate = useNavigate();
    const { getCurrentUserId } = useAuth();
    const [tendencyData, setTendencyData] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 현재 로그인한 사용자 ID 가져오기
    const childId = getCurrentUserId();

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
            if (tendencyResult.success) {
                setTendencyData(tendencyResult.data);
            } else {
                console.warn('API 호출 실패, 목업 데이터 사용:', tendencyResult.error);
                // API 실패 시 목업 데이터 사용
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

            // 성향 변화 추이 데이터 조회 (캐싱 적용)
            const historyResult = await tendencyAPI.getTendencyHistory(childId);
            if (historyResult.success) {
                setHistoryData(historyResult.data);
            } else {
                console.warn('성향 변화 추이 조회 실패, 목업 데이터 사용:', historyResult.error);
                // 목업 데이터 사용
                setHistoryData([
                    {
                        date: "2024-01-15",
                        type: "신중한 성장투자자",
                        scores: {
                            "공격성": 65.0,
                            "적극성": 78.0,
                            "위험중립성": 55.0,
                            "안정추구성": 82.0,
                            "신중함": 75.0
                        },
                        feedback: "균형잡힌 성향으로 발전하고 있습니다."
                    },
                    {
                        date: "2024-01-08",
                        type: "보수적 투자자",
                        scores: {
                            "공격성": 45.0,
                            "적극성": 60.0,
                            "위험중립성": 70.0,
                            "안정추구성": 90.0,
                            "신중함": 85.0
                        },
                        feedback: "안정성을 중시하는 성향이 강합니다."
                    }
                ]);
            }
        } catch (error) {
            console.error('예상치 못한 오류:', error);
            // 완전히 실패한 경우에만 에러 표시
            setError('네트워크 연결을 확인해주세요.');
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

            setHistoryData([
                {
                    date: "2024-01-15",
                    type: "신중한 성장투자자",
                    scores: {
                        "공격성": 65.0,
                        "적극성": 78.0,
                        "위험중립성": 55.0,
                        "안정추구성": 82.0,
                        "신중함": 75.0
                    },
                    feedback: "균형잡힌 성향으로 발전하고 있습니다."
                },
                {
                    date: "2024-01-08",
                    type: "보수적 투자자",
                    scores: {
                        "공격성": 45.0,
                        "적극성": 60.0,
                        "위험중립성": 70.0,
                        "안정추구성": 90.0,
                        "신중함": 85.0
                    },
                    feedback: "안정성을 중시하는 성향이 강합니다."
                }
            ]);
        } finally {
            setLoading(false);
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
                    <h2>📊 현재 경제 성향</h2>
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
                    <div className="history-list">
                        {historyData?.map((history, index) => (
                            <div key={index} className="history-item">
                                <div className="history-header">
                                    <span className="history-date">{history.date}</span>
                                    <span className="history-type">{history.type}</span>
                                </div>
                                <p className="history-feedback">{history.feedback}</p>
                                <div className="score-summary">
                                    {Object.entries(history.scores).map(([key, value]) => (
                                        <div key={key} className="score-item">
                                            <span className="score-label">{key}</span>
                                            <div className="score-bar">
                                                <div 
                                                    className="score-fill" 
                                                    style={{ width: `${value}%` }}
                                                ></div>
                                            </div>
                                            <span className="score-value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TendencyDetail;
