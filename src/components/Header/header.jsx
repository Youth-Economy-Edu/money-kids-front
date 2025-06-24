import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Header = ({ title, levelText }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [balanceData, setBalanceData] = useState(null);
    const [userPoints, setUserPoints] = useState(null);
    const { user, logout, getCurrentUserId, getCurrentUserName } = useAuth();
    const intervalRef = useRef(null);

    const userId = getCurrentUserId();
    const userName = getCurrentUserName();

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

    const refreshData = async () => {
        if (userId) {
            await fetchBalance();
            await fetchUserPoints();
        }
    };

    useEffect(() => {
        // 초기 데이터 로드
        refreshData();

        // 5초마다 데이터 새로고침 (모의투자 페이지에서만)
        if (title === '모의투자') {
            intervalRef.current = setInterval(refreshData, 5000);
        }

        // 컴포넌트 언마운트 시 인터벌 정리
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [userId, user, title]);

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
            await logout();
            window.location.href = "/login";
        } catch (error) {
            console.error('로그아웃 실패:', error);
            // 로그아웃 실패해도 로컬 스토리지 정리하고 로그인 페이지로
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
                    <h2 id="page-title-main">안녕하세요! 👋</h2>
                    <p>{userName ? `${userName}님, ` : ''}오늘도 경제 공부로 스마트한 하루를 시작해볼까요?</p>
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
                        <div className="stat-title">현재 자산</div>
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
                        <div className="stat-title">사용 가능 금액</div>
                        <div className="stat-value">
                            {userPoints !== null ? `₩${userPoints.toLocaleString()}` : '로딩 중...'}
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
