import React from 'react';
import './LearnCard.css';

function LearnCard({ id, title, onClick, difficulty = 1, progress = 0, isCompleted = false }) {
    const difficultyConfig = {
        1: { name: '기초', color: '#4ade80', icon: 'fas fa-seedling' },
        2: { name: '초급', color: '#60a5fa', icon: 'fas fa-walking' },
        3: { name: '중급', color: '#f59e0b', icon: 'fas fa-running' },
        4: { name: '고급', color: '#ef4444', icon: 'fas fa-mountain' },
        5: { name: '전문가', color: '#8b5cf6', icon: 'fas fa-crown' }
    };

    const config = difficultyConfig[difficulty] || difficultyConfig[1];

    return (
        <div className="learn-card" onClick={onClick}>
            <div className="card-header">
                <div className="difficulty-badge" style={{ backgroundColor: config.color }}>
                    <i className={config.icon}></i>
                    <span>{config.name}</span>
                </div>
                {isCompleted && (
                    <div className="completion-badge">
                        <i className="fas fa-check-circle"></i>
                    </div>
                )}
            </div>

            <div className="card-content">
                <div className="card-icon" style={{ borderColor: config.color }}>
                    <i className="fas fa-book-open" style={{ color: config.color }}></i>
                </div>
                <h3 className="card-title">{title}</h3>
                <p className="card-description">
                    {difficulty <= 2 ? '기본 개념을 쉽게 익혀보세요' : 
                     difficulty <= 3 ? '실무 지식을 탄탄하게 다져보세요' :
                     '전문가 수준의 심화 학습을 경험하세요'}
                </p>
            </div>

            <div className="card-footer">
                <div className="progress-section">
                    <div className="progress-info">
                        <span className="progress-label">학습 진도</span>
                        <span className="progress-percent">{progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ 
                                width: `${progress}%`,
                                backgroundColor: config.color 
                            }}
                        ></div>
                    </div>
                </div>
                
                <button className="study-btn" style={{ backgroundColor: config.color }}>
                    <i className="fas fa-play"></i>
                    <span>{isCompleted ? '복습하기' : '학습시작'}</span>
                </button>
            </div>

            <div className="card-decoration">
                <div className="decoration-circle" style={{ backgroundColor: `${config.color}20` }}></div>
                <div className="decoration-triangle" style={{ borderBottomColor: `${config.color}30` }}></div>
            </div>
        </div>
    );
}

export default LearnCard;
