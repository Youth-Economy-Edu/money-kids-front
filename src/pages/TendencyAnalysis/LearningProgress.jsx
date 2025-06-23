import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './LearningProgress.css';
import { tendencyAPI } from '../../utils/api';

// Chart.js 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const LearningProgress = () => {
    const navigate = useNavigate();
    const { getCurrentUserId } = useAuth();
    const [learningData, setLearningData] = useState(null);
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
            const result = await tendencyAPI.getLearningProgress(childId);
            if (result.success) {
                setLearningData(result.data);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('학습 진도 조회 실패:', error);
            setError(error.message || '학습 데이터를 불러오는 중 오류가 발생했습니다.');
            // 목업 데이터 사용
            setLearningData({
                totalQuizzes: 45,
                correctAnswers: 36,
                accuracyRate: 80.0,
                totalPointsEarned: 2500,
                currentLevel: 3,
                recentTrend: [
                    {"batch": 1, "accuracy": 85.0},
                    {"batch": 2, "accuracy": 75.0},
                    {"batch": 3, "accuracy": 90.0},
                    {"batch": 4, "accuracy": 82.0},
                    {"batch": 5, "accuracy": 88.0},
                    {"batch": 6, "accuracy": 78.0},
                    {"batch": 7, "accuracy": 92.0}
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await tendencyAPI.getLearningProgress(childId);
            if (result.success) {
                setLearningData(result.data);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('재시도 실패:', error);
            setError(error.message || '학습 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 학습 진도 라인 차트 데이터
    const getProgressChartData = () => {
        if (!learningData) return null;
        
        return {
            labels: learningData.recentTrend.map(trend => `${trend.batch}회차`),
            datasets: [{
                label: '정답률 (%)',
                data: learningData.recentTrend.map(trend => trend.accuracy),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>학습 데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <div className="error-icon">📚</div>
                    <h3>학습 데이터를 불러올 수 없습니다</h3>
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
        <div className="learning-progress-container">
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

            {/* 학습 성과 요약 */}
            <div className="summary-section">
                <div className="section-card">
                    <h2>📈 학습 성과 요약</h2>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <div className="summary-icon">📝</div>
                            <div className="summary-content">
                                <span className="summary-label">총 퀴즈 수</span>
                                <span className="summary-value">{learningData?.totalQuizzes}개</span>
                            </div>
                        </div>
                        
                        <div className="summary-item">
                            <div className="summary-icon">✅</div>
                            <div className="summary-content">
                                <span className="summary-label">정답 수</span>
                                <span className="summary-value">{learningData?.correctAnswers}개</span>
                            </div>
                        </div>
                        
                        <div className="summary-item">
                            <div className="summary-icon">🎯</div>
                            <div className="summary-content">
                                <span className="summary-label">정답률</span>
                                <span className="summary-value accuracy">{learningData?.accuracyRate}%</span>
                            </div>
                        </div>
                        
                        <div className="summary-item">
                            <div className="summary-icon">🏆</div>
                            <div className="summary-content">
                                <span className="summary-label">획득 포인트</span>
                                <span className="summary-value">{learningData?.totalPointsEarned?.toLocaleString()}P</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 학습 진도 추이 */}
            <div className="progress-chart-section">
                <div className="section-card">
                    <h2>📊 학습 진도 추이</h2>
                    <div className="chart-container">
                        <Line data={getProgressChartData()} options={chartOptions} />
                    </div>
                    <div className="chart-description">
                        <p>최근 7회차 퀴즈의 정답률 변화를 보여줍니다.</p>
                    </div>
                </div>
            </div>

            {/* 학습 인사이트 */}
            <div className="insights-section">
                <div className="section-card">
                    <h2>💡 학습 인사이트</h2>
                    <div className="insights-list">
                        <div className="insight-item">
                            <span className="insight-icon">🎯</span>
                            <span>현재 정답률이 {learningData?.accuracyRate}%로 우수합니다!</span>
                        </div>
                        <div className="insight-item">
                            <span className="insight-icon">📈</span>
                            <span>총 {learningData?.totalQuizzes}개의 퀴즈를 완료했습니다.</span>
                        </div>
                        <div className="insight-item">
                            <span className="insight-icon">🏆</span>
                            <span>현재 레벨 {learningData?.currentLevel}에 도달했습니다!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningProgress;
