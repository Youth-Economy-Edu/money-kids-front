import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
import { tendencyAPI } from '../../utils/api';
import './InvestmentPortfolio.css';

// Chart.js 등록
ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const InvestmentPortfolio = () => {
    const navigate = useNavigate();
    const { getCurrentUserId } = useAuth();
    const [investmentData, setInvestmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 현재 로그인한 사용자 ID 가져오기
    const childId = getCurrentUserId();

    useEffect(() => {
        if (childId) {
            fetchData();
        }
    }, [childId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await tendencyAPI.getInvestmentAnalysis(childId);
            if (result.success) {
                setInvestmentData(result.data);
            } else {
                console.warn('API 호출 실패, 목업 데이터 사용:', result.error);
                // API 실패 시 목업 데이터 사용
                setInvestmentData({
                    hasInvestments: true,
                    totalStocks: 4,
                    stockComposition: {
                        "삼성전자": 2,
                        "스타벅스": 1,
                        "맥도날드": 3,
                        "넥슨게임즈": 1
                    },
                    categoryDistribution: {
                        "IT": 2,
                        "음식료": 2
                    },
                    totalInvestmentValue: 450000,
                    diversificationScore: 2,
                    stockPerformance: {
                        "삼성전자": { shares: 2, currentPrice: 75000, profit: 5000 },
                        "스타벅스": { shares: 1, currentPrice: 120000, profit: -8000 },
                        "맥도날드": { shares: 3, currentPrice: 85000, profit: 15000 },
                        "넥슨게임즈": { shares: 1, currentPrice: 95000, profit: -2000 }
                    }
                });
            }
        } catch (error) {
            console.error('예상치 못한 오류:', error);
            // 목업 데이터 사용
            setInvestmentData({
                hasInvestments: true,
                totalStocks: 4,
                stockComposition: {
                    "삼성전자": 2,
                    "스타벅스": 1,
                    "맥도날드": 3,
                    "넥슨게임즈": 1
                },
                categoryDistribution: {
                    "IT": 2,
                    "음식료": 2
                },
                totalInvestmentValue: 450000,
                diversificationScore: 2,
                stockPerformance: {
                    "삼성전자": { shares: 2, currentPrice: 75000, profit: 5000 },
                    "스타벅스": { shares: 1, currentPrice: 120000, profit: -8000 },
                    "맥도날드": { shares: 3, currentPrice: 85000, profit: 15000 },
                    "넥슨게임즈": { shares: 1, currentPrice: 95000, profit: -2000 }
                }
            });
        } finally {
            setLoading(false);
        }
    };

    // 주식 구성 도넛 차트 데이터
    const getStockCompositionData = () => {
        if (!investmentData) return null;
        
        return {
            labels: Object.keys(investmentData.stockComposition),
            datasets: [{
                data: Object.values(investmentData.stockComposition),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)'
                ],
                borderWidth: 2
            }]
        };
    };

    // 업종별 분산 바 차트 데이터
    const getCategoryData = () => {
        if (!investmentData) return null;
        
        return {
            labels: Object.keys(investmentData.categoryDistribution),
            datasets: [{
                label: '보유 종목 수',
                data: Object.values(investmentData.categoryDistribution),
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
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (!investmentData?.hasInvestments) {
        return (
            <div className="no-investment-container">
                <div className="no-investment-content">
                    <div className="no-investment-icon">📈</div>
                    <h2>아직 투자를 시작하지 않았습니다</h2>
                    <p>모의 투자를 통해 경험을 쌓아보세요!</p>
                    <button className="btn btn-primary">모의 투자 시작하기</button>
                </div>
            </div>
        );
    }

    return (
        <div className="investment-portfolio-container">
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

            {/* 투자 요약 */}
            <div className="summary-section">
                <div className="section-card">
                    <h2>💰 투자 포트폴리오 요약</h2>
                    <div className="investment-summary">
                        <div className="summary-item">
                            <div className="summary-icon">📊</div>
                            <div className="summary-content">
                                <span className="summary-label">보유 주식</span>
                                <span className="summary-value">{investmentData?.totalStocks}개</span>
                            </div>
                        </div>
                        
                        <div className="summary-item">
                            <div className="summary-icon">💵</div>
                            <div className="summary-content">
                                <span className="summary-label">총 투자금액</span>
                                <span className="summary-value">{investmentData?.totalInvestmentValue?.toLocaleString()}원</span>
                            </div>
                        </div>
                        
                        <div className="summary-item">
                            <div className="summary-icon">🎯</div>
                            <div className="summary-content">
                                <span className="summary-label">분산도 점수</span>
                                <span className="summary-value">{investmentData?.diversificationScore}/5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 주식 구성 */}
            <div className="composition-section">
                <div className="section-card">
                    <h2>📈 보유 주식 구성</h2>
                    <div className="chart-container">
                        <Doughnut data={getStockCompositionData()} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* 업종별 분산 */}
            <div className="category-section">
                <div className="section-card">
                    <h2>🏢 업종별 분산</h2>
                    <div className="chart-container">
                        <Bar data={getCategoryData()} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* 개별 주식 성과 */}
            <div className="performance-section">
                <div className="section-card">
                    <h2>📊 개별 주식 성과</h2>
                    <div className="stock-list">
                        {investmentData?.stockPerformance && Object.entries(investmentData.stockPerformance).map(([stock, data]) => (
                            <div key={stock} className="stock-item">
                                <div className="stock-info">
                                    <span className="stock-name">{stock}</span>
                                    <span className="stock-shares">{data.shares}주</span>
                                </div>
                                <div className="stock-price">
                                    <span className="current-price">{data.currentPrice?.toLocaleString()}원</span>
                                    <span className={`profit ${data.profit >= 0 ? 'positive' : 'negative'}`}>
                                        {data.profit >= 0 ? '+' : ''}{data.profit?.toLocaleString()}원
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 투자 조언 */}
            <div className="advice-section">
                <div className="section-card">
                    <h2>💡 투자 조언</h2>
                    <div className="advice-content">
                        <div className="advice-item">
                            <span className="advice-icon">🌟</span>
                            <span>분산투자를 통해 리스크를 줄여보세요</span>
                        </div>
                        <div className="advice-item">
                            <span className="advice-icon">📈</span>
                            <span>장기적인 관점에서 투자해보세요</span>
                        </div>
                        <div className="advice-item">
                            <span className="advice-icon">🎯</span>
                            <span>정기적으로 포트폴리오를 점검하세요</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentPortfolio;
