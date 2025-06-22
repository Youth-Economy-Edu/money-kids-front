import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import './TendencyAnalysis.css';

const TendencyAnalysis = () => {
    const navigate = useNavigate();

    // 메뉴 아이템들
    const menuItems = [
        {
            id: 'tendency-detail',
            title: '📊 성향 분석',
            description: '경제 성향 그래프 및 추이 분석',
            path: '/tendency/detail',
            color: '#3b82f6'
        },
        {
            id: 'learning-progress',
            title: '📈 학습 성과 추적',
            description: '퀴즈 정답률 및 트렌드 분석',
            path: '/tendency/learning',
            color: '#10b981'
        },
        {
            id: 'investment-portfolio',
            title: '💰 투자 포트폴리오',
            description: '보유 주식 및 분산도 분석',
            path: '/tendency/investment',
            color: '#f59e0b'
        },
        {
            id: 'activity-monitoring',
            title: '🏃‍♂️ 활동 모니터링',
            description: '일별/주별 활동 현황',
            path: '/tendency/activity',
            color: '#ef4444'
        },
        {
            id: 'recommendations',
            title: '💡 교육 추천',
            description: '성향 기반 맞춤형 가이드',
            path: '/tendency/recommendations',
            color: '#8b5cf6'
        }
    ];

    const handleMenuClick = (path) => {
        navigate(path);
    };

    return (
        <MainLayout title="성향 분석" levelText="초급자">
            <div className="tendency-menu-container">
                <div className="menu-header">
                    <h1>📊 경제 교육 현황</h1>
                    <p>자녀의 경제 학습 상황을 자세히 확인해보세요</p>
                </div>

                <div className="menu-grid">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            className="menu-card"
                            onClick={() => handleMenuClick(item.path)}
                            style={{ '--accent-color': item.color }}
                        >
                            <div className="menu-card-header">
                                <h3>{item.title}</h3>
                            </div>
                            <div className="menu-card-body">
                                <p>{item.description}</p>
                            </div>
                            <div className="menu-card-footer">
                                <span className="menu-arrow">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );


};

export default TendencyAnalysis;
