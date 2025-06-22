import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import MainLayout from '../../layouts/MainLayout';
import { tendencyAPI } from '../../utils/api';
import './LearningProgress.css';

// Chart.js 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const LearningProgress = () => {
    const [learningData, setLearningData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 로그인한 유저의 ID를 localStorage에서 가져오기
    const childId = localStorage.getItem("userId") || "master"; // 기본값으로 master 사용 (실제 데이터 있음)

    useEffect(() => {
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

        fetchData();
    }, [childId]);

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
            <MainLayout title="학습 성과 추적" levelText="초급자">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>학습 데이터를 불러오는 중...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout title="학습 성과 추적" levelText="초급자">
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
            </MainLayout>
        );
    }

    return (
        <MainLayout title="학습 성과 추적" levelText="초급자">
            <div className="learning-progress-container">
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
        </MainLayout>
    );
};

export default LearningProgress;
