import React from 'react';

const StatsSection = () => {
  const statsData = [
    {
      title: '모의 투자 자산',
      value: '₩1,250,000',
      change: '+₩50,000 (4.2%)',
      changeType: 'positive',
      icon: 'fas fa-arrow-up'
    },
    {
      title: '완료한 퀴즈',
      value: '45개',
      change: '이번 주 +12개',
      changeType: 'neutral',
      icon: null
    },
    {
      title: '학습 연속일',
      value: '7일',
      change: '목표: 30일',
      changeType: 'neutral',
      icon: 'fas fa-fire',
      iconStyle: { color: 'var(--danger-color)' }
    }
  ];

  return (
      <div className="stats-section">
        <div className="stats-grid">
          {statsData.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-title">{stat.title}</div>
                <div className="stat-value">
                  {stat.value}
                  {stat.icon && stat.iconStyle && (
                      <i className={stat.icon} style={stat.iconStyle}></i>
                  )}
                </div>
                <div className={`stat-change ${stat.changeType}`}>
                  {stat.change}
                  {stat.icon && !stat.iconStyle && (
                      <i className={stat.icon}></i>
                  )}
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default StatsSection; 