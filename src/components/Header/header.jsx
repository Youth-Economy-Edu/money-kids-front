import React, { useState, useEffect, useCallback, useRef } from 'react';
import './header.css';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { userAPI } from '../../utils/apiClient';

const Header = ({ currentPage }) => {
    const { getCurrentUserName } = useAuth();
    const [balanceData, setBalanceData] = useState(null);
    const [userPoints, setUserPoints] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBalance = async () => {
        try {
            const response = await axios.get(`/api/stocks/trade/balance?userId=${userId}`);
            setBalanceData(response.data);
        } catch (error) {
            console.error('잔고 정보 조회 실패:', error);
        }
    };

    const fetchUserPoints = async () => {
        try {
            const response = await axios.get(`/api/users/${userId}/points`);
            if (response.data && response.data.code === 200) {
                setUserPoints(response.data.data.points);
            }
        } catch (error) {
            console.error('포인트 정보 조회 실패:', error);
            // 사용자 정보에서 포인트 가져오기 (fallback)
            if (user && user.points !== undefined) {
                setUserPoints(user.points);
            }
        }
    };

    const refreshData = useCallback(async () => {
        if (userId) {
            await fetchBalance();
            await fetchUserPoints();
        }
        if (user?.id) {
            const result = await userAPI.getPoints(user.id);
            if (result.success) {
                setPoints(result.data.points);
            }
        }
    }, [userId, user]);

    useEffect(() => {
        if (!authLoading) {
            refreshData();
        }
    }, [authLoading, refreshData]);

    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 30000); // 30초마다 포인트 새로고침
        return () => clearInterval(interval);
    }, [refreshData]);

    // 거래 완료 시 데이터 새로고침을 위한 이벤트 리스너
    useEffect(() => {
        const handleTradeComplete = () => {
            console.log('거래 완료 이벤트 감지 - 헤더 데이터 새로고침');
            setTimeout(refreshData, 1000); // 1초 후 새로고침
        };

        const handleBalanceUpdate = () => {
            console.log('잔고 업데이트 이벤트 감지 - 헤더 데이터 새로고침');
            refreshData();
        };

        // 커스텀 이벤트 리스너 추가
        window.addEventListener('tradeComplete', handleTradeComplete);
        window.addEventListener('balanceUpdate', handleBalanceUpdate);

        return () => {
            window.removeEventListener('tradeComplete', handleTradeComplete);
            window.removeEventListener('balanceUpdate', handleBalanceUpdate);
        };
    }, [userId]);

    const handleLogout = async () => {
        try {
            logout();
            window.location.href = "/";
        } catch (error) {
            console.error('로그아웃 실패:', error);
            // 로그아웃 실패해도 로컬 스토리지 정리하고 랜딩페이지로
            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            window.location.href = "/";
        }
    };

    if (authLoading) {
        return <header className="header-container"></header>;
    }

    if (!title) return null;

    return (
        <header className={`header ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="header-top">
                <div className="user-info">
                    <div className="balance-info">
                        <div className="balance-item">
                            <span className="balance-label">총 자산</span>
                            <span className="balance-value">₩{(balanceData?.totalAsset ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="balance-item">
                            <span className="balance-label">평가손익</span>
                            <span className={`balance-value ${balanceData?.profit >= 0 ? 'positive' : 'negative'}`}>
                                ₩{(balanceData?.profit ?? 0).toLocaleString()} (
                                <span className="profit-rate">
                                    {balanceData?.profitRate ?? 0}%
                                </span>
                                )
                            </span>
                        </div>
                    </div>
                    <div className="user-points">
                        <span className="points-label">포인트</span>
                        <span className="points-value">
                            {userPoints !== null ? `₩${(userPoints ?? 0).toLocaleString()}` : '로딩 중...'}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">로그아웃</button>
                </div>
            </div>

            <div className={`stats-container ${isExpanded ? 'open' : 'closed'}`}>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">현재 자산</div>
                        {balanceData &&
                        typeof balanceData.totalAsset === 'number' &&
                        typeof balanceData.profit === 'number' &&
                        typeof balanceData.rate === 'number' ? (
                            <>
                                <div className="stat-value">
                                    ₩{(balanceData.totalAsset || 0).toLocaleString()}
                                </div>
                                <div
                                    className={`stat-change ${
                                        balanceData.profit >= 0 ? 'positive' : 'negative'
                                    }`}
                                >
                                    {balanceData.profit >= 0 ? '+' : ''}
                                    ₩{(balanceData.profit || 0).toLocaleString()} (
                                    {(balanceData.rate || 0).toFixed(2)}%)
                                </div>
                            </>
                        ) : (
                            <div className="stat-value">로딩 중...</div>
                        )}
                    </div>

                    <div className="stat-card">
                        <div className="stat-title">사용 가능 금액</div>
                        <div className="stat-value">
                            {userPoints !== null ? `₩${(userPoints || 0).toLocaleString()}` : '로딩 중...'}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-title">현재 성향</div>
                        <div className="stat-value">
                            {user?.tendency || '분석 중...'}
                        </div>
                        <div className="stat-change neutral">
                            <a href="/tendency" style={{ textDecoration: 'none', color: 'inherit' }}>
                                자세히 보기
                            </a>
                        </div>
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
