import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const userId = searchParams.get('userId');
        const userName = searchParams.get('userName');

        if (userId && userName) {
            // 로그인 처리
            login({
                id: userId,
                name: decodeURIComponent(userName)
            });
            
            // 홈 페이지로 리다이렉트
            setTimeout(() => {
                navigate('/home');
            }, 1000);
        } else {
            // 에러가 있으면 로그인 페이지로
            navigate('/login');
        }
    }, [searchParams, login, navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <h2 style={{ color: '#4CAF50', marginBottom: '20px' }}>
                    로그인 성공! 🎉
                </h2>
                <p style={{ color: '#666' }}>
                    잠시 후 메인 페이지로 이동합니다...
                </p>
                <div style={{
                    marginTop: '20px',
                    width: '50px',
                    height: '50px',
                    border: '3px solid #4CAF50',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                }} />
            </div>
            
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoginSuccessPage; 