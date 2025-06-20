import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './sidebar.css';

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { path: '/', icon: 'fas fa-home', text: '홈', badge: null },
        { path: '/learn', icon: 'fas fa-book', text: '경제 배우기', badge: null },
        { path: '/quiz', icon: 'fas fa-question-circle', text: '퀴즈', badge: '3' },
        { path: '/invest', icon: 'fas fa-chart-line', text: '모의 투자', badge: null },
        { path: '/analysis', icon: 'fas fa-brain', text: '성향 분석', badge: null },
        { path: '/news', icon: 'fas fa-newspaper', text: 'AI 경제 뉴스', badge: 'NEW' }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <>
            <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                <i className={isOpen ? "fas fa-times" : "fas fa-bars"}></i>
            </button>
            
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="logo">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <i className="fas fa-piggy-bank"></i>
                        </div>
                        <div className="logo-text">
                            <h1>Money Kids</h1>
                            <p>청소년 경제교육 플랫폼</p>
                        </div>
                    </div>
                </div>
                
                <nav className="nav-menu">
                    {menuItems.map((item, index) => (
                        <div
                            key={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                            style={{ '--item-index': index }}
                        >
                            <i className={`nav-icon ${item.icon}`}></i>
                            <span className="nav-text">{item.text}</span>
                            {item.badge && (
                                <span className={`nav-badge ${item.badge === 'NEW' ? 'new' : 'count'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
                
                <div className="sidebar-footer">
                    <div className="profile-section">
                        <div className="profile-avatar">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="profile-info">
                            <div className="profile-name">김머니</div>
                            <div className="profile-level">Lv.12 경제박사</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
