// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../App.jsx";
import "./login.css";
import axios from "axios";
import Toast from "../../components/Toast";

const getRedirectUri = (provider) => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = hostname === 'localhost' || hostname === '127.0.0.1' ? ':8080' : ':8080';
  return `${protocol}//${hostname}${port}/api/users/login/${provider}/callback`;
};

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=424665278188dbb0a014e5d7e830e5af&redirect_uri=${getRedirectUri('kakao')}&response_type=code`;

const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=171600218391-r73m2hd5uhdu5s6c2qm67kspru29ckfi.apps.googleusercontent.com&redirect_uri=${getRedirectUri('google')}&response_type=code&scope=email%20profile`;

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [toast, setToast] = useState({ show: false, type: 'info', message: '' });
    const navigate = useNavigate();

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const hideToast = () => {
        setToast({ show: false, type: 'info', message: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            showToast('warning', '아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        // 로그인 처리 함수
        try {
            const formData = new URLSearchParams();
            formData.append('id', username);
            formData.append('password', password);

            const response = await fetch(`/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    showToast('success', '로그인 성공! 메인 페이지로 이동합니다.');
                    
                    // 성공 토스트 표시 후 페이지 이동
                    setTimeout(() => {
                        onLogin(data.user); // 전체 사용자 정보 전달
                        navigate(ROUTES.HOME); // 홈으로 이동
                    }, 1500);
                } else {
                    showToast('error', '로그인 응답 형식이 올바르지 않습니다.');
                }
            } else {
                const errorMsg = await response.text();
                showToast('error', errorMsg || '서버 오류로 로그인에 실패했습니다.');
            }
        } catch (error) {
            const errorMsg = error.message || "서버 오류로 로그인에 실패했습니다.";
            showToast('error', errorMsg);
        }
    };

    return (
        <div className="login-container">
            <Toast
                type={toast.type}
                message={toast.message}
                show={toast.show}
                onClose={hideToast}
                position="top-center"
                duration={4000}
            />
            
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>로그인</h2>
                <input
                    type="text"
                    placeholder="아이디"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">로그인</button>

                <button
                    type="button"
                    className="social-login kakao"
                    onClick={() => (window.location.href = KAKAO_AUTH_URL)}
                >
                    카카오로 로그인
                </button>

                <button
                    type="button"
                    className="social-login google"
                    onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
                >
                    구글로 로그인
                </button>
                <p style={{ marginTop: "12px" }}>
                    아직 회원이 아니신가요? <Link to={ROUTES.REGISTER}>회원가입</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
