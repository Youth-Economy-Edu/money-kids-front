import React, { useState, useEffect } from 'react';
import './header.css';
import { FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

const Header = ({ title, levelText }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [balanceData, setBalanceData] = useState(null);
    const [point, setPoint] = useState(null);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await axios.get('/api/stocks/trade/balance');
                setBalanceData(response.data);
            } catch (error) {
                console.error('잔고 정보 조회 실패:', error);
            }
        };

        const fetchPoint = async () => {
            try {
                const response = await axios.get(`/api/users/${userId}/points`);
                setPoint(response.data.point);
            } catch (error) {
                console.error('포인트 정보 조회 실패:', error);
            }
        };

        if (userId) {
            fetchBalance();
            fetchPoint();
        }
    }, [userId]);

    const handleLogout = async () => {
        try {
            await axios.post('/api/users/logout');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        } finally {
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            window.location.href = "/login";
        }
    };

    if (!title) return null;

    return (
        <header className={`header ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="header-top">
                <div className="user-info">
                    <h2 id="page-title-main">{title}</h2>
                    <p>오늘도 경제 공부로 스마트한 하루를 시작해볼까요?</p>
                </div>
                <div className="user-actions">
                    <button className="btn btn-secondary" onClick={handleLogout}>
                        <FaSignOutAlt /> 로그아웃
                    </button>
                </div>
            </div>

            <div className={`stats-container ${isExpanded ? 'open' : 'closed'}`}>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">모의 투자 자산</div>
                        {balanceData &&
                        typeof balanceData.totalAsset === 'number' &&
                        typeof balanceData.profit === 'number' &&
                        typeof balanceData.rate === 'number' ? (
                            <>
                                <div className="stat-value">
                                    ₩{balanceData.totalAsset.toLocaleString()}
                                </div>
                                <div
                                    className={`stat-change ${
                                        balanceData.profit >= 0 ? 'positive' : 'negative'
                                    }`}
                                >
                                    {balanceData.profit >= 0 ? '+' : ''}
                                    ₩{balanceData.profit.toLocaleString()} (
                                    {balanceData.rate.toFixed(2)}%)
                                </div>
                            </>
                        ) : (
                            <div className="stat-value">로딩 중...</div>
                        )}
                    </div>

                    <div className="stat-card">
                        <div className="stat-title">현재 포인트</div>
                        <div className="stat-value">
                            {point !== null ? `${point} 포인트` : '로딩 중...'}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-title">학습 연속일</div>
                        <div className="stat-value">
                            7일{' '}
                            <i
                                className="fas fa-fire"
                                style={{ color: 'var(--danger-color)' }}
                            ></i>
                        </div>
                        <div className="stat-change neutral">목표: 30일</div>
                    </div>
                </div>
            </div>

            <div className="stats-toggle-bar">
                <button className="btn btn-white" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? '∧' : '∨'}
                </button>
            </div>
        </header>
    );
};

export default Header;
