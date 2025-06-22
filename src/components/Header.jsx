import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ currentPage, onToggleSidebar }) => {
  const { getCurrentUserName, getCurrentUserId, user } = useAuth();
  
  const getPageTitle = () => {
    const userName = getCurrentUserName();
    const pageTitles = {
      '홈': `안녕하세요, ${userName}님! <i class="fas fa-hand-sparkles" style="color: #F59E0B;"></i>`,
      '경제배우기': '경제배우기 <i class="fas fa-angle-right" style="font-size:0.8em; margin-left: 8px;"></i>',
      '모의투자': '모의투자 <i class="fas fa-angle-right" style="font-size:0.8em; margin-left: 8px;"></i>',
      '학부모페이지': '학부모페이지 <i class="fas fa-angle-right" style="font-size:0.8em; margin-left: 8px;"></i>',
      '성향분석': '성향분석 <i class="fas fa-angle-right" style="font-size:0.8em; margin-left: 8px;"></i>',
      '경제소식': '경제소식 <i class="fas fa-angle-right" style="font-size:0.8em; margin-left: 8px;"></i>'
    };
    return pageTitles[currentPage] || `안녕하세요, ${userName}님! <i class="fas fa-hand-sparkles" style="color: #F59E0B;"></i>`;
  };

  const statsData = [
    {
      title: '모의 투자 자산',
      value: '₩1,250,000',
      change: '+₩50,000 (4.2%)',
      type: 'positive'
    },
    {
      title: '완료한 퀴즈',
      value: '45개',
      change: '이번 주 +12개',
      type: 'neutral'
    },
    {
      title: '학습 연속일',
      value: '7일🔥',
      change: '목표: 30일',
      type: 'neutral'
    }
  ];

  return (
    <>
      <button className="mobile-menu-toggle" onClick={onToggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>
      
      <div className="header">
        <div className="header-top">
          <div className="user-info">
            <h2 
              id="page-title-main" 
              dangerouslySetInnerHTML={{ __html: getPageTitle() }}
            />
            <p>오늘도 경제 공부로 스마트한 하루를 시작해볼까요?</p>
          </div>
          <div className="user-actions">
            <button className="btn btn-white">
              <i className="fas fa-layer-group"></i> 
              <span className="btn-text">레벨 3 (65%)</span>
            </button>
            <button className="btn btn-secondary">
              <i className="fas fa-sign-out-alt"></i> 
              <span className="btn-text">로그아웃</span>
            </button>
          </div>
        </div>
        
        <div className="stats-section">
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-title">{stat.title}</div>
                <div className="stat-value">{stat.value}</div>
                <div className={`stat-change ${stat.type}`}>{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header; 