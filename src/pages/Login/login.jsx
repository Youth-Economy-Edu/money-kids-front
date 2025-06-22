// src/pages/Login.jsx
import React, { useState } from "react";
import {Link} from "react-router-dom";
import { ROUTES } from "../../App.jsx";
import "./Login.css";
import axios from "axios";

const KAKAO_AUTH_URL =
    "https://kauth.kakao.com/oauth/authorize?client_id=424665278188dbb0a014e5d7e830e5af&redirect_uri=http://localhost:8080/api/users/login/kakao/callback&response_type=code";

const GOOGLE_AUTH_URL =
    "https://accounts.google.com/o/oauth2/v2/auth?client_id=171600218391-r73m2hd5uhdu5s6c2qm67kspru29ckfi.apps.googleusercontent.com&redirect_uri=http://localhost:8080/api/users/login/google/callback&response_type=code&scope=email%20profile";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            alert("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        // 로그인 처리 함수
        try {
            const response = await axios.post("/api/auth/login", {
                id: username,
                password,
            });

            alert("로그인 성공!");
            onLogin(response.data.id); // 사용자 ID 전달
        } catch (error) {
            const errorMsg =
                error.response?.data?.message || "서버 오류로 로그인에 실패했습니다.";
            alert(errorMsg);
        }
    };

    return (
        <div className="login-container">
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
