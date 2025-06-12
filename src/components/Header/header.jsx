import React, { useState } from 'react';
import './header.css';
import { FaHandSparkles, FaLayerGroup, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <header className={`header ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="header-top">
                <div className="user-info">
                    <h2 id="page-title-main">
                        안녕하세요, 김학생님! <FaHandSparkles style={{ color: '#F59E0B' }} size={30} />
                    </h2>
                    <p>오늘도 경제 공부로 스마트한 하루를 시작해볼까요?</p>
                </div>
                <div className="user-actions">
                    <button className="btn btn-white">
                        <FaLayerGroup /> 레벨 3 (65%)
                    </button>
                    <button className="btn btn-secondary">
                        <FaSignOutAlt /> 로그아웃
                    </button>
                </div>
            </div>

            {/* 접기/펼치기 토글 영역 */}
            <div className={`stats-container ${isExpanded ? 'open' : 'closed'}`}>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">모의 투자 자산</div>
                        <div className="stat-value">₩1,250,000</div>
                        <div className="stat-change positive">+₩50,000 (4.2%)</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">완료한 퀴즈</div>
                        <div className="stat-value">45개</div>
                        <div className="stat-change neutral">이번 주 +12개</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">학습 연속일</div>
                        <div className="stat-value">
                            7일 <i className="fas fa-fire" style={{ color: 'var(--danger-color)' }}></i>
                        </div>
                        <div className="stat-change neutral">목표: 30일</div>
                    </div>
                </div>
            </div>

            {/* 토글 버튼: 항상 아래 고정 */}
            <div className="stats-toggle-bar">
                <button className="btn btn-white" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? '∧' : '∨'}
                </button>
            </div>
        </header>
    );
};

export default Header;
