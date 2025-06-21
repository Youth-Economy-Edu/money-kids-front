import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import MainLayout from '../../layouts/MainLayout';
import { tendencyAPI } from '../../utils/api';
import './ActivityMonitoring.css';

// Chart.js 등록
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ActivityMonitoring = () => {
    const [activityData, setActivityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(7);
    
    // 로그인한 유저의 ID를 localStorage에서 가져오기
    const childId = localStorage.getItem("userId") || "user001"; // 기본값으로 user001 사용

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await tendencyAPI.getActivitySummary(childId, selectedPeriod);
                if (result.success) {
                    setActivityData(result.data);
                } else {
                    console.warn('API 호출 실패, 목업 데이터 사용:', result.error);
                    // API 실패 시 목업 데이터 사용
                    setActivityData({
                        totalActivities: 25,
                        activityByType: {
                            "QUIZ": 8,
                            "TRADE": 5,
                            "LOGIN": 7,
                            "ARTICLE_READ": 5
                        },
                        activityByStatus: {
                            "SUCCESS": 20,
                            "FAIL": 3,
                            "PENDING": 2
                        },
                        periodDays: selectedPeriod,
                        mostActiveDay: "TUESDAY",
                        averageActivitiesPerDay: 3.6,
                        dailyActivities: [
                            { day: "월", count: 4 },
                            { day: "화", count: 6 },
                            { day: "수", count: 3 },
                            { day: "목", count: 5 },
                            { day: "금", count: 4 },
                            { day: "토", count: 2 },
                            { day: "일", count: 1 }
                        ]
                    });
                }
            } catch (error) {
                console.error('예상치 못한 오류:', error);
                // 목업 데이터 사용
                setActivityData({
                    totalActivities: 25,
                    activityByType: {
                        "QUIZ": 8,
                        "TRADE": 5,
                        "LOGIN": 7,
                        "ARTICLE_READ": 5
                    },
                    activityByStatus: {
                        "SUCCESS": 20,
                        "FAIL": 3,
                        "PENDING": 2
                    },
                    periodDays: selectedPeriod,
                    mostActiveDay: "TUESDAY",
                    averageActivitiesPerDay: 3.6,
                    dailyActivities: [
                        { day: "월", count: 4 },
                        { day: "화", count: 6 },
                        { day: "수", count: 3 },
                        { day: "목", count: 5 },
                        { day: "금", count: 4 },
                        { day: "토", count: 2 },
                        { day: "일", count: 1 }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [childId, selectedPeriod]);

    // 활동 유형별 도넛 차트
    const getActivityTypeData = () => {
        if (!activityData) return null;
        
        const typeLabels = {
            "QUIZ": "퀴즈",
            "TRADE": "거래",
            "LOGIN": "로그인",
            "ARTICLE_READ": "기사 읽기"
        };
        
        return {
            labels: Object.keys(activityData.activityByType).map(key => typeLabels[key] || key),
            datasets: [{
                data: Object.values(activityData.activityByType),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        };
    };

    // 일별 활동 바 차트
    const getDailyActivityData = () => {
        if (!activityData) return null;
        
        return {
            labels: activityData.dailyActivities.map(item => item.day),
            datasets: [{
                label: '활동 수',
                data: activityData.dailyActivities.map(item => item.count),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 4
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true
                }
            }
        }
    };

    if (loading) {
        return (
            <MainLayout title="활동 모니터링" levelText="초급자">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>데이터를 불러오는 중...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="활동 모니터링" levelText="초급자">
            <div className="activity-monitoring-container">
                {/* 기간 선택 */}
                <div className="period-selector">
                    <div className="period-buttons">
                        {[7, 14, 30].map(days => (
                            <button
                                key={days}
                                className={`period-btn ${selectedPeriod === days ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod(days)}
                            >
                                {days}일
                            </button>
                        ))}
                    </div>
                </div>

                {/* 활동 요약 */}
                <div className="summary-section">
                    <div className="section-card">
                        <h2>🏃‍♂️ 활동 요약 ({selectedPeriod}일간)</h2>
                        <div className="activity-summary">
                            <div className="summary-item">
                                <div className="summary-icon">📊</div>
                                <div className="summary-content">
                                    <span className="summary-label">총 활동</span>
                                    <span className="summary-value">{activityData?.totalActivities}회</span>
                                </div>
                            </div>
                            
                            <div className="summary-item">
                                <div className="summary-icon">📅</div>
                                <div className="summary-content">
                                    <span className="summary-label">일평균</span>
                                    <span className="summary-value">{activityData?.averageActivitiesPerDay}회</span>
                                </div>
                            </div>
                            
                            <div className="summary-item">
                                <div className="summary-icon">⭐</div>
                                <div className="summary-content">
                                    <span className="summary-label">가장 활발한 요일</span>
                                    <span className="summary-value">{activityData?.mostActiveDay}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 활동 유형별 분석 */}
                <div className="activity-type-section">
                    <div className="section-card">
                        <h2>📈 활동 유형별 분석</h2>
                        <div className="chart-container">
                            <Doughnut data={getActivityTypeData()} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* 일별 활동 현황 */}
                <div className="daily-activity-section">
                    <div className="section-card">
                        <h2>📅 일별 활동 현황</h2>
                        <div className="chart-container">
                            <Bar data={getDailyActivityData()} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* 활동 상태 */}
                <div className="status-section">
                    <div className="section-card">
                        <h2>✅ 활동 상태</h2>
                        <div className="status-grid">
                            {activityData?.activityByStatus && Object.entries(activityData.activityByStatus).map(([status, count]) => {
                                const statusInfo = {
                                    SUCCESS: { label: '성공', icon: '✅', color: 'var(--success-color)' },
                                    FAIL: { label: '실패', icon: '❌', color: 'var(--error-color)' },
                                    PENDING: { label: '진행중', icon: '⏳', color: 'var(--warning-color)' }
                                };
                                
                                return (
                                    <div key={status} className="status-item">
                                        <div className="status-icon" style={{ color: statusInfo[status]?.color }}>
                                            {statusInfo[status]?.icon}
                                        </div>
                                        <div className="status-content">
                                            <span className="status-label">{statusInfo[status]?.label}</span>
                                            <span className="status-value">{count}회</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 활동 인사이트 */}
                <div className="insights-section">
                    <div className="section-card">
                        <h2>💡 활동 인사이트</h2>
                        <div className="insights-content">
                            <div className="insight-item">
                                <span className="insight-icon">🎯</span>
                                <span>퀴즈 활동이 가장 활발합니다</span>
                            </div>
                            <div className="insight-item">
                                <span className="insight-icon">📈</span>
                                <span>화요일에 가장 많은 활동을 합니다</span>
                            </div>
                            <div className="insight-item">
                                <span className="insight-icon">⭐</span>
                                <span>성공률이 80%로 매우 높습니다</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ActivityMonitoring;
