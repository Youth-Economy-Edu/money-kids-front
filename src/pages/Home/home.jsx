import React, { useEffect, useState } from 'react';
import './home.css';
import {
    FaBullseye,
    FaWallet,
    FaBookReader,
    FaArrowRight,
    FaSearchDollar,
} from 'react-icons/fa';
import axios from 'axios';

const Home = ({ onNavigate }) => {
    const [rate, setRate] = useState(null); // 수익률

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await axios.get('/api/stocks/trade/balance');
                setRate(response.data?.rate);
            } catch (error) {
                console.error('잔고/수익률 조회 실패:', error);
            }
        };

        fetchBalance();
    }, []);

    const renderInvestmentMessage = () => {
        if (typeof rate !== 'number') return '수익률 정보를 불러오는 중입니다...';

        return rate >= 0
            ? `현재 수익률 ${rate.toFixed(2)}%로 좋은 성과를 보이고 있습니다. 투자 종목을 분석하고 리밸런싱 전략을 세워보세요.`
            : `현재 수익률 ${rate.toFixed(2)}%로 좋지 않은 상황입니다. 투자 종목을 분석하고 리밸런싱 전략을 세워보세요.`;
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
