import React, { useEffect } from 'react';
import './CardDetailPopup.css';

function CardDetailPopup({ title, content, onClose, category = '경제 기초', difficulty = 1, estimatedTime = 10 }) {
    const difficultyConfig = {
        1: { name: '기초', color: '#4ade80', icon: 'fas fa-seedling' },
        2: { name: '초급', color: '#60a5fa', icon: 'fas fa-walking' },
        3: { name: '중급', color: '#f59e0b', icon: 'fas fa-running' },
        4: { name: '고급', color: '#ef4444', icon: 'fas fa-mountain' },
        5: { name: '전문가', color: '#8b5cf6', icon: 'fas fa-crown' }
    };

    const config = difficultyConfig[difficulty] || difficultyConfig[1];

    useEffect(() => {
        // 스크롤 방지
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleStartLearning = () => {
        // 학습 시작 로직
        console.log('학습 시작:', title);
        onClose();
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className="popup-content">
                {/* 팝업 헤더 */}
                <div className="popup-header">
                    <div className="popup-decoration">
                        <div className="decoration-circle" style={{ backgroundColor: `${config.color}20` }}></div>
                        <div className="decoration-dots">
                            <span style={{ backgroundColor: config.color }}></span>
                            <span style={{ backgroundColor: `${config.color}80` }}></span>
                            <span style={{ backgroundColor: `${config.color}40` }}></span>
                        </div>
                    </div>
                    
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>

                    <div className="popup-badge-container">
                        <div className="category-badge">
                            <i className="fas fa-tag"></i>
                            <span>{category}</span>
                        </div>
                        <div className="difficulty-badge" style={{ backgroundColor: config.color }}>
                            <i className={config.icon}></i>
                            <span>{config.name}</span>
                        </div>
                    </div>

                    <div className="popup-icon" style={{ borderColor: config.color }}>
                        <i className="fas fa-book-open" style={{ color: config.color }}></i>
                    </div>

                    <h2 className="popup-title">{title}</h2>
                    
                    <div className="popup-meta">
                        <div className="meta-item">
                            <i className="fas fa-clock"></i>
                            <span>약 {estimatedTime}분 소요</span>
                        </div>
                        <div className="meta-item">
                            <i className="fas fa-users"></i>
                            <span>1,247명이 학습중</span>
                        </div>
                        <div className="meta-item">
                            <i className="fas fa-star"></i>
                            <span>4.8점 (324개 리뷰)</span>
                        </div>
                    </div>
                </div>

                {/* 팝업 바디 */}
                <div className="popup-body">
                    <div className="content-section">
                        <h3>
                            <i className="fas fa-info-circle"></i>
                            학습 내용
                        </h3>
                        <div className="popup-description">
                            {content || '이 개념을 통해 경제의 기초적인 원리를 이해하고, 실생활에서 활용할 수 있는 지식을 습득할 수 있습니다. 체계적인 학습을 통해 경제적 사고력을 기를 수 있어요.'}
                        </div>
                    </div>

                    <div className="learning-objectives">
                        <h3>
                            <i className="fas fa-bullseye"></i>
                            학습 목표
                        </h3>
                        <ul>
                            <li>핵심 경제 개념의 정의와 특징 이해</li>
                            <li>실생활 사례를 통한 개념 적용</li>
                            <li>관련 용어와 개념들의 연관관계 파악</li>
                            <li>문제 해결 능력과 비판적 사고력 향상</li>
                        </ul>
                    </div>

                    <div className="study-features">
                        <h3>
                            <i className="fas fa-lightbulb"></i>
                            이런 걸 배워요
                        </h3>
                        <div className="features-grid">
                            <div className="feature-item">
                                <i className="fas fa-chart-line"></i>
                                <span>시각적 자료</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-play-circle"></i>
                                <span>동영상 강의</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-file-alt"></i>
                                <span>실습 문제</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-comments"></i>
                                <span>토론 활동</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 팝업 푸터 */}
                <div className="popup-footer">
                    <div className="progress-preview">
                        <span className="progress-label">현재 진도</span>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ 
                                    width: '35%',
                                    backgroundColor: config.color 
                                }}
                            ></div>
                        </div>
                        <span className="progress-text">35% 완료</span>
                    </div>

                    <div className="action-buttons">
                        <button className="preview-btn" onClick={onClose}>
                            <i className="fas fa-eye"></i>
                            미리보기
                        </button>
                        <button 
                            className="start-btn" 
                            style={{ backgroundColor: config.color }}
                            onClick={handleStartLearning}
                        >
                            <i className="fas fa-play"></i>
                            학습 시작하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardDetailPopup;
