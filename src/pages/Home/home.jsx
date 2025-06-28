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
import { safeToLocaleString, safeCurrencyFormat } from '../../utils/formatUtils';

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
            if (portfolioResult.success && portfolioResult.data) {
                // 기본값 설정
                setPortfolioData({
                    totalAsset: portfolioResult.data.totalAsset || 0,
                    profitLoss: portfolioResult.data.profitLoss || 0,
                    profitRate: portfolioResult.data.profitRate || '0.00%'
                });
            } else {
                // API 실패 시 기본값
                setPortfolioData({
                    totalAsset: 0,
                    profitLoss: 0,
                    profitRate: '0.00%'
                });
            }
        } catch (error) {
            console.error('사용자 데이터 로드 오류:', error);
            // 에러 시 기본값 설정
            setPortfolioData({
                totalAsset: 0,
                profitLoss: 0,
                profitRate: '0.00%'
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
        
        const rate = portfolioData.rate ?? parseFloat(portfolioData.profitRate);
        const profitLoss = portfolioData.profitLoss ?? 0;
        
        if (rate >= 0) {
            return `현재 수익률 +${safeToLocaleString((rate || 0).toFixed(2))}%로 좋은 성과를 보이고 있습니다! 총 평가손익: +${safeCurrencyFormat(profitLoss)}`;
        } else {
            return `현재 수익률 ${safeToLocaleString((rate || 0).toFixed(2))}%입니다. 투자 전략을 재검토해보는 것이 좋겠습니다. 총 평가손익: ${safeCurrencyFormat(profitLoss)}`;
        }
    };

    // 포트폴리오 상태에 따른 메시지 생성
    const getPortfolioMessage = (profitLoss, rate) => {
        if (profitLoss === null || rate === null || rate === undefined) return '포트폴리오 데이터를 불러오는 중입니다...';
        
        const numericRate = parseFloat(rate);
        if (isNaN(numericRate)) return '포트폴리오 분석 중입니다...';
        
        if (numericRate > 0) {
            return `현재 수익률 +${safeToLocaleString(numericRate.toFixed(2))}%로 좋은 성과를 보이고 있습니다! 총 평가손익: +${safeCurrencyFormat(profitLoss)}`;
        } else if (numericRate < 0) {
            return `현재 수익률 ${safeToLocaleString(numericRate.toFixed(2))}%입니다. 투자 전략을 재검토해보는 것이 좋겠습니다. 총 평가손익: ${safeCurrencyFormat(profitLoss)}`;
        } else {
            return '현재 수익률 0%입니다. 투자를 시작해보세요!';
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
                        {getPortfolioMessage(portfolioData.profitLoss, portfolioData.profitRate)}
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
