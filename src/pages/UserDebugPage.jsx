import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserInfo from '../components/UserInfo';
import './UserDebugPage.css';

const UserDebugPage = () => {
    const { 
        user, 
        getCurrentUserId, 
        getCurrentUserName, 
        isAuthenticated, 
        login, 
        logout, 
        updateUser 
    } = useAuth();
    
    const [testUserId, setTestUserId] = useState('');
    const [testUserName, setTestUserName] = useState('');

    const handleTestLogin = () => {
        if (!testUserId.trim()) {
            alert('사용자 ID를 입력해주세요.');
            return;
        }

        const userData = {
            id: testUserId.trim(),
            name: testUserName.trim() || testUserId.trim(),
            email: `${testUserId.trim()}@example.com`,
            level: 'Level 3',
            points: 1500
        };

        const success = login(userData);
        if (success) {
            alert('테스트 로그인 성공!');
            setTestUserId('');
            setTestUserName('');
        } else {
            alert('로그인 실패!');
        }
    };

    const handleLogout = () => {
        const success = logout();
        if (success) {
            alert('로그아웃 완료!');
        } else {
            alert('로그아웃 실패!');
        }
    };

    const handleUpdateUser = () => {
        const updates = {
            points: (user?.points || 0) + 100,
            level: 'Level 4 (Updated)'
        };
        
        const success = updateUser(updates);
        if (success) {
            alert('사용자 정보 업데이트 완료!');
        } else {
            alert('사용자 정보 업데이트 실패!');
        }
    };

    const presetUsers = [
        { id: 'master', name: 'Master User' },
        { id: 'test_user', name: 'Test User' },
        { id: 'admin', name: 'Admin User' },
        { id: 'student1', name: 'Student 1' }
    ];

    return (
        <div className="user-debug-page">
            <div className="debug-container">
                <h1>🔧 사용자 정보 디버그 페이지</h1>
                <p>현재 로그인한 사용자 정보를 확인하고 테스트할 수 있습니다.</p>

                <div className="debug-sections">
                    {/* 현재 사용자 정보 */}
                    <section className="debug-section">
                        <h2>📋 현재 사용자 정보</h2>
                        <div className="user-info-container">
                            <UserInfo showDetails={true} />
                        </div>
                        
                        <div className="raw-data">
                            <h3>Raw Data:</h3>
                            <pre>{JSON.stringify(user, null, 2)}</pre>
                        </div>

                        <div className="quick-info">
                            <div className="info-grid">
                                <div className="info-item">
                                    <strong>User ID:</strong> {getCurrentUserId()}
                                </div>
                                <div className="info-item">
                                    <strong>User Name:</strong> {getCurrentUserName()}
                                </div>
                                <div className="info-item">
                                    <strong>Is Authenticated:</strong> {isAuthenticated() ? '✅ Yes' : '❌ No'}
                                </div>
                                <div className="info-item">
                                    <strong>LocalStorage userId:</strong> {localStorage.getItem('userId') || 'None'}
                                </div>
                                <div className="info-item">
                                    <strong>LocalStorage userName:</strong> {localStorage.getItem('userName') || 'None'}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 테스트 로그인 */}
                    <section className="debug-section">
                        <h2>🧪 테스트 로그인</h2>
                        
                        <div className="preset-users">
                            <h3>빠른 로그인:</h3>
                            <div className="preset-buttons">
                                {presetUsers.map(presetUser => (
                                    <button
                                        key={presetUser.id}
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setTestUserId(presetUser.id);
                                            setTestUserName(presetUser.name);
                                        }}
                                    >
                                        {presetUser.name} ({presetUser.id})
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="test-login-form">
                            <h3>커스텀 로그인:</h3>
                            <div className="form-group">
                                <label>사용자 ID:</label>
                                <input
                                    type="text"
                                    value={testUserId}
                                    onChange={(e) => setTestUserId(e.target.value)}
                                    placeholder="예: master, test_user"
                                />
                            </div>
                            <div className="form-group">
                                <label>사용자 이름:</label>
                                <input
                                    type="text"
                                    value={testUserName}
                                    onChange={(e) => setTestUserName(e.target.value)}
                                    placeholder="예: Master User"
                                />
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-primary" onClick={handleTestLogin}>
                                    테스트 로그인
                                </button>
                                <button className="btn btn-secondary" onClick={handleLogout}>
                                    로그아웃
                                </button>
                                <button className="btn btn-info" onClick={handleUpdateUser}>
                                    사용자 정보 업데이트
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* API 테스트 */}
                    <section className="debug-section">
                        <h2>🔗 API 연동 테스트</h2>
                        <div className="api-test-info">
                            <p>현재 사용자 ID로 API 요청을 테스트할 수 있습니다.</p>
                            <div className="api-urls">
                                <div className="api-url">
                                    <strong>포인트 조회:</strong>
                                    <code>GET /api/users/{getCurrentUserId()}/points</code>
                                </div>
                                <div className="api-url">
                                    <strong>포트폴리오 조회:</strong>
                                    <code>GET /api/users/{getCurrentUserId()}/portfolio</code>
                                </div>
                                <div className="api-url">
                                    <strong>성향 분석:</strong>
                                    <code>GET /api/parent/child/{getCurrentUserId()}/tendency-graph</code>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserDebugPage; 