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
                console.warn('API 호출 실패, 실제 포트폴리오 데이터 기반 목업 사용:', result.error);
                // 실제 포트폴리오 정보 가져오기 시도
                await generateMockDataFromPortfolio();
            }
        } catch (error) {
            console.error('예상치 못한 오류:', error);
            // 실제 포트폴리오 정보 가져오기 시도
            await generateMockDataFromPortfolio();
        } finally {
            setLoading(false);
        }
    };

    // 실제 포트폴리오 데이터 기반으로 목업 데이터 생성
    const generateMockDataFromPortfolio = async () => {
        try {
            const portfolioResponse = await fetch(`http://localhost:8080/api/users/${childId}/portfolio`);
            if (portfolioResponse.ok) {
                const portfolioData = await portfolioResponse.json();
                const stocks = portfolioData.stocks || [];
                
                if (stocks.length > 0) {
                    // 실제 데이터 기반으로 구성
                    const stockComposition = {};
                    const categoryDistribution = {};
                    let totalInvestmentValue = 0;
                    const stockPerformance = {};
                    
                    stocks.forEach(stock => {
                        if (stock.quantity > 0) {
                            stockComposition[stock.stockName] = stock.quantity;
                            totalInvestmentValue += stock.totalValue;
                            
                            // 카테고리 임시 설정 (실제로는 주식 정보에서 가져와야 함)
                            const category = getStockCategory(stock.stockName);
                            categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
                            
                            // 현재 주가 정보 필요
                            stockPerformance[stock.stockName] = {
                                shares: stock.quantity,
                                currentPrice: Math.round(stock.totalValue / stock.quantity), // 평균 매수가로 추정
                                profit: Math.round((Math.random() - 0.5) * 20000) // 임시 수익/손실
                            };
                        }
                    });
                    
                    setInvestmentData({
                        hasInvestments: true,
                        totalStocks: Object.keys(stockComposition).length,
                        stockComposition,
                        categoryDistribution,
                        totalInvestmentValue,
                        diversificationScore: Math.min(5, Object.keys(categoryDistribution).length),
                        stockPerformance
                    });
                    return;
                }
            }
        } catch (portfolioError) {
            console.warn('포트폴리오 데이터 조회 실패:', portfolioError);
        }
        
        // 기본 목업 데이터
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
    };

    // 주식 이름으로 카테고리 추정
    const getStockCategory = (stockName) => {
        if (stockName.includes('삼성') || stockName.includes('LG') || stockName.includes('네이버') || stockName.includes('카카오') || stockName.includes('넥슨')) {
            return 'IT';
        } else if (stockName.includes('스타벅스') || stockName.includes('맥도날드') || stockName.includes('CJ') || stockName.includes('농심')) {
            return '음식료';
        } else if (stockName.includes('현대') || stockName.includes('기아')) {
            return '자동차';
        } else if (stockName.includes('신한') || stockName.includes('KB') || stockName.includes('하나')) {
            return '금융';
        } else {
            return '기타';
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
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/invest')}
                    >
                        모의 투자 시작하기
                    </button>
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

            {/* 개별 주식 성과 */}
            <div className="performance-section">
                <div className="section-card">
                    <h2>📊 개별 주식 성과</h2>
                    <div className="stock-performance-list">
                        {investmentData?.stockPerformance && Object.entries(investmentData.stockPerformance).map(([stock, data]) => {
                            const profitRate = ((data.profit || 0) / ((data.currentPrice || 0) * (data.shares || 1))) * 100;
                            const totalValue = (data.currentPrice || 0) * (data.shares || 0);
                            
                            return (
                                <div key={stock} className="detailed-stock-item">
                                    <div className="stock-header">
                                        <div className="stock-name-section">
                                            <h3 className="stock-name">{stock}</h3>
                                            <span className="stock-category">{getStockCategory(stock)}</span>
                                        </div>
                                        <div className={`profit-indicator ${data.profit >= 0 ? 'profit' : 'loss'}`}>
                                            {data.profit >= 0 ? '📈' : '📉'}
                                        </div>
                                    </div>
                                    
                                    <div className="stock-details">
                                        <div className="detail-row">
                                            <span className="detail-label">보유 수량</span>
                                            <span className="detail-value">{data.shares}주</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">현재 가격</span>
                                            <span className="detail-value">₩{data.currentPrice?.toLocaleString()}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">보유 가치</span>
                                            <span className="detail-value">₩{totalValue.toLocaleString()}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">수익/손실</span>
                                            <span className={`detail-value ${data.profit >= 0 ? 'profit-text' : 'loss-text'}`}>
                                                {data.profit >= 0 ? '+' : ''}₩{data.profit?.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">수익률</span>
                                            <span className={`detail-value ${profitRate >= 0 ? 'profit-text' : 'loss-text'}`}>
                                                {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="performance-bar">
                                        <div className="bar-container">
                                            <div 
                                                className={`performance-fill ${profitRate >= 0 ? 'profit-bar' : 'loss-bar'}`}
                                                style={{ 
                                                    width: `${Math.min(Math.abs(profitRate) * 2, 100)}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* 전체 포트폴리오 요약 */}
                    <div className="portfolio-summary">
                        <h3>📋 포트폴리오 요약</h3>
                        <div className="summary-grid">
                            <div className="summary-card">
                                <span className="summary-icon">💰</span>
                                <div className="summary-info">
                                    <span className="summary-title">총 투자가치</span>
                                    <span className="summary-amount">
                                        ₩{Object.entries(investmentData?.stockPerformance || {})
                                            .reduce((total, [, data]) => total + ((data.currentPrice || 0) * (data.shares || 0)), 0)
                                            .toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="summary-card">
                                <span className="summary-icon">📊</span>
                                <div className="summary-info">
                                    <span className="summary-title">총 수익/손실</span>
                                    <span className={`summary-amount ${Object.entries(investmentData?.stockPerformance || {})
                                        .reduce((total, [, data]) => total + (data.profit || 0), 0) >= 0 ? 'profit-text' : 'loss-text'}`}>
                                        {Object.entries(investmentData?.stockPerformance || {})
                                            .reduce((total, [, data]) => total + (data.profit || 0), 0) >= 0 ? '+' : ''}
                                        ₩{Object.entries(investmentData?.stockPerformance || {})
                                            .reduce((total, [, data]) => total + (data.profit || 0), 0)
                                            .toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="summary-card">
                                <span className="summary-icon">🎯</span>
                                <div className="summary-info">
                                    <span className="summary-title">총 수익률</span>
                                    <span className={`summary-amount ${Object.entries(investmentData?.stockPerformance || {})
                                        .reduce((total, [, data]) => total + (data.profit || 0), 0) >= 0 ? 'profit-text' : 'loss-text'}`}>
                                        {((Object.entries(investmentData?.stockPerformance || {})
                                            .reduce((total, [, data]) => total + (data.profit || 0), 0) / 
                                            Math.max(investmentData?.totalInvestmentValue || 1, 1)) * 100).toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
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
