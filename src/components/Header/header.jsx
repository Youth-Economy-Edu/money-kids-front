import React from 'react';
import './header.css';

function Header({ currentUser, onLogout }) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '좋은 아침이에요';
        if (hour < 18) return '좋은 오후에요';
        return '좋은 저녁이에요';
    };

    const stats = [
        { icon: 'fas fa-coins', title: '총 자산', value: '₩1,250,000', change: '+12.5%', type: 'positive' },
        { icon: 'fas fa-chart-line', title: '수익률', value: '15.8%', change: '+3.2%', type: 'positive' },
        { icon: 'fas fa-trophy', title: '레벨', value: 'Lv.12', change: '경제박사', type: 'neutral' },
        { icon: 'fas fa-fire', title: '연속 학습', value: '7일', change: '최고기록!', type: 'positive' }
    ];

    return (
        <header className="header">
            <div className="header-top">
                <div className="user-info">
                    <h2>
                        {getGreeting()}, <span className="user-name">{currentUser?.name || '친구'}</span>님! 
                        <span className="greeting-emoji">👋</span>
                    </h2>
                    <p>오늘도 경제 공부로 한 걸음 더 성장해요!</p>
                </div>
                
                <div className="user-actions">
                    <button className="notification-btn">
                        <i className="fas fa-bell"></i>
                        <span className="notification-badge">3</span>
                    </button>
                    
                    <div className="user-profile">
                        <div className="user-avatar">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="user-details">
                            <span className="user-name">{currentUser?.name || '사용자'}</span>
                            <span className="user-type">학생</span>
                        </div>
                    </div>
                    
                    <button className="logout-btn" onClick={onLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>로그아웃</span>
                    </button>
                </div>
            </div>
            
            <div className="stats-section">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon">
                                <i className={stat.icon}></i>
                            </div>
                            <div className="stat-title">{stat.title}</div>
                            <div className="stat-value">{stat.value}</div>
                            <div className={`stat-change ${stat.type}`}>
                                {stat.type === 'positive' && <i className="fas fa-arrow-up"></i>}
                                {stat.type === 'negative' && <i className="fas fa-arrow-down"></i>}
                                {stat.change}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}

export default Header; 