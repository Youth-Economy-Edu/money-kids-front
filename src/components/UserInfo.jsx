import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserInfo.css';

const UserInfo = ({ showDetails = false }) => {
    const { user, getCurrentUserId, getCurrentUserName, isAuthenticated } = useAuth();

    if (!isAuthenticated()) {
        return (
            <div className="user-info-card">
                <div className="user-info-content">
                    <div className="user-avatar">
                        <span>?</span>
                    </div>
                    <div className="user-details">
                        <h3>로그인이 필요합니다</h3>
                        <p>사용자 정보를 확인하려면 로그인해주세요.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="user-info-card">
            <div className="user-info-content">
                <div className="user-avatar">
                    <span>{getCurrentUserName().charAt(0).toUpperCase()}</span>
                </div>
                <div className="user-details">
                    <h3>{getCurrentUserName()}</h3>
                    <p className="user-id">ID: {getCurrentUserId()}</p>
                    {showDetails && user && (
                        <div className="user-extended-info">
                            <div className="info-item">
                                <span className="info-label">인증 상태:</span>
                                <span className="info-value authenticated">인증됨</span>
                            </div>
                            {user.email && (
                                <div className="info-item">
                                    <span className="info-label">이메일:</span>
                                    <span className="info-value">{user.email}</span>
                                </div>
                            )}
                            {user.level && (
                                <div className="info-item">
                                    <span className="info-label">레벨:</span>
                                    <span className="info-value">{user.level}</span>
                                </div>
                            )}
                            {user.points && (
                                <div className="info-item">
                                    <span className="info-label">포인트:</span>
                                    <span className="info-value">{user.points.toLocaleString()}P</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showDetails && (
                <div className="user-info-actions">
                    <button className="btn btn-sm btn-outline">
                        프로필 수정
                    </button>
                    <button className="btn btn-sm btn-primary">
                        계정 설정
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserInfo; 