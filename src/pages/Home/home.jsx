import React, { useEffect, useState } from 'react';
import './home.css';
import {
    FaBullseye,
    FaWallet,
    FaBookReader,
    FaArrowRight,
    FaSearchDollar,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, stockAPI } from '../../utils/apiClient';

const Home = ({ onNavigate }) => {
    const [portfolioData, setPortfolioData] = useState({
        rate: null,
        totalAsset: 0,
        profitLoss: 0,
        loading: true
    });
    const { getCurrentUserId } = useAuth();
    const userId = getCurrentUserId();

    const loadUserData = async () => {
        if (!userId) return;
        
        try {
            // userAPI와 stockAPI 사용으로 변경
            const portfolioResult = await userAPI.getPortfolio(userId);
            if (portfolioResult.success) {
                setPortfolioData(portfolioResult.data);
            }

            const stocksResult = await stockAPI.getAll();
            if (stocksResult.success) {
                // 실제 수익률 계산
                let totalProfitLoss = 0;
                let totalInvestment = 0;
                let currentStockValue = 0;
                
                if (portfolioData.stocks && portfolioData.stocks.length > 0) {
                    const activeStocks = portfolioData.stocks.filter(stock => stock.quantity > 0);
                    
                    for (const portfolioStock of activeStocks) {
                        const currentStock = stocksResult.data.find(s => s.name === portfolioStock.stockName);
                        if (currentStock) {
                            const currentValue = currentStock.price * portfolioStock.quantity;
                            currentStockValue += currentValue;
                            
                            const investmentAmount = portfolioStock.totalValue;
                            totalInvestment += investmentAmount;
                            
                            const stockProfitLoss = currentValue - investmentAmount;
                            totalProfitLoss += stockProfitLoss;
                        }
                    }
                }
                
                const profitRate = totalInvestment > 0 
                    ? ((totalProfitLoss / totalInvestment) * 100) 
                    : 0;
                
                setPortfolioData({
                    rate: profitRate,
                    totalAsset: currentStockValue,
                    profitLoss: totalProfitLoss,
                    loading: false
                });
                
                console.log('홈화면 포트폴리오 데이터 업데이트:', {
                    totalInvestment,
                    currentStockValue,
                    totalProfitLoss,
                    profitRate: profitRate.toFixed(2) + '%'
                });
            }
        } catch (error) {
            console.error('사용자 데이터 로드 오류:', error);
            // 에러 시 기본값 설정
            setPortfolioData({
                rate: 0,
                totalAsset: 0,
                profitLoss: 0,
                loading: false
            });
        }
    };

    useEffect(() => {
        loadUserData();
        
        // 30초마다 데이터 새로고침
        const interval = setInterval(loadUserData, 30000);
        
        return () => clearInterval(interval);
    }, [userId]);

    const renderInvestmentMessage = () => {
        if (portfolioData.loading) {
            return '포트폴리오 정보를 불러오는 중입니다...';
        }
        
        if (!userId) {
            return '로그인이 필요합니다.';
        }
        
        if (portfolioData.totalAsset === 0) {
            return '아직 투자를 시작하지 않았습니다. 모의 투자로 경험을 쌓아보세요!';
        }
        
        const rate = portfolioData.rate;
        const profitLoss = portfolioData.profitLoss;
        
        if (rate >= 0) {
            return `현재 수익률 +${rate.toFixed(2)}%로 좋은 성과를 보이고 있습니다! 총 평가손익: +₩${profitLoss.toLocaleString()}`;
        } else {
            return `현재 수익률 ${rate.toFixed(2)}%입니다. 투자 전략을 재검토해보는 것이 좋겠습니다. 총 평가손익: ₩${profitLoss.toLocaleString()}`;
        }
    };

    return (
        <div className="page-active" id="home">
            <h1 className="page-title">대시보드</h1>
            <p className="page-subtitle">오늘의 활동을 확인하고 학습을 시작해보세요.</p>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-icon">
                        <FaBullseye />
                    </div>
                    <div className="card-title">오늘의 퀴즈</div>
                    <div className="card-description">
                        새로운 경제 퀴즈 3개가 준비되어 있습니다. 지금 도전해보세요! 높은 점수를 얻으면 보너스 포인트를 드려요.
                    </div>
                    <button className="card-action" onClick={() => onNavigate('learn')}>
                        <FaArrowRight /> 퀴즈 풀기
                    </button>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon">
                        <FaWallet />
                    </div>
                    <div className="card-title">포트폴리오 현황</div>
                    <div className="card-description">
                        {renderInvestmentMessage()}
                    </div>
                    <button className="card-action" onClick={() => onNavigate('invest')}>
                        <FaSearchDollar /> 자세히 보기
                    </button>
                </div>

                <div className="dashboard-card">
                    <div className="card-icon">
                        <FaBookReader />
                    </div>
                    <div className="card-title">경제 소식</div>
                    <div className="card-description">
                        수익률에 영향을 미칠지도 모르는 새로운 경제 소식이 들려왔습니다. 어서 가서 확인해보세요 !
                    </div>
                    <button className="card-action" onClick={() => onNavigate('news')}>
                        소식 확인하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
