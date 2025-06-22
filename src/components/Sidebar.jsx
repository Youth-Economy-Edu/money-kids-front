import React from 'react';

const Sidebar = ({ currentPage, onPageChange, isOpen, onToggle }) => {
  const navigationItems = [
    { id: '홈', icon: 'fas fa-home', text: '홈' },
    { id: '경제배우기', icon: 'fas fa-graduation-cap', text: '경제배우기', badge: 3 },
    { id: '모의투자', icon: 'fas fa-chart-line', text: '모의투자' },
    { id: '학부모페이지', icon: 'fas fa-users', text: '학부모페이지' },
    { id: '성향분석', icon: 'fas fa-chart-pie', text: '성향분석', badge: 5 },
    { id: '경제소식', icon: 'fas fa-newspaper', text: '경제소식' },
    { id: '사용자디버그', icon: 'fas fa-bug', text: '사용자디버그' }
  ];

  const handleNavClick = (pageId, event) => {
    onPageChange(pageId, event);
  };

  const handleBadgeClick = (e) => {
    e.stopPropagation();
    e.currentTarget.style.animation = 'badgeClickAnim 0.5s ease-out';
    setTimeout(() => {
      e.currentTarget.style.display = 'none';
      e.currentTarget.style.animation = '';
    }, 500);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="logo">
        <i className="fas fa-landmark"></i>
        <div>
          <h1>경제 배우기</h1>
          <p>스마트 금융 교육</p>
        </div>
      </div>
      
      <div className="nav-menu">
        {navigationItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={(e) => handleNavClick(item.id, e)}
          >
            <i className={`nav-icon ${item.icon}`}></i>
            <div className="nav-text">{item.text}</div>
            {item.badge && (
              <div className="notification-badge" onClick={handleBadgeClick}>
                {item.badge}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 