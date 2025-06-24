// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";
import "./register.css"; // 회원가입 전용 CSS
import Toast from "../../components/Toast";

const Register = () => {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [toast, setToast] = useState({ show: false, type: 'info', message: '' });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const hideToast = () => {
        setToast({ show: false, type: 'info', message: '' });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!id || !name || !password) {
            showToast('warning', '모든 항목을 입력해주세요.');
            return;
        }

        try {
            const response = await axios.post(
                "/api/auth/register",
                new URLSearchParams({ id, name, password }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            showToast('success', '회원가입 성공! 로그인 페이지로 이동합니다.');
            
            // 성공 토스트 표시 후 페이지 이동
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "회원가입 실패";
            showToast('error', msg);
        }
    };

    return (
        <div className="register-container">
            <Toast
                type={toast.type}
                message={toast.message}
                show={toast.show}
                onClose={hideToast}
                position="top-center"
                duration={4000}
            />
            
            <form className="register-form" onSubmit={handleRegister}>
                <h2>회원가입</h2>
                <input
                    type="text"
                    placeholder="아이디"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">회원가입</button>
                <p style={{ marginTop: "12px" }}>
                    이미 회원이신가요? <a href="/login">로그인</a>
                </p>
            </form>
        </div>
    );
};

export default Register;
